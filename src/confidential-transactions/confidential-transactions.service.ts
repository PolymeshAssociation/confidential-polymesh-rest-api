import { Injectable } from '@nestjs/common';
import { BigNumber } from '@polymeshassociation/polymesh-sdk';
import {
  ConfidentialAffirmParty,
  ConfidentialTransaction,
  ConfidentialVenue,
  EventIdentifier,
  Identity,
} from '@polymeshassociation/polymesh-sdk/types';

import { TransactionBaseDto } from '~/common/dto/transaction-base-dto';
import { AppInternalError, AppNotFoundError, AppValidationError } from '~/common/errors';
import { extractTxOptions, ServiceReturn } from '~/common/utils';
import { ConfidentialAccountsService } from '~/confidential-accounts/confidential-accounts.service';
import { ConfidentialProofsService } from '~/confidential-proofs/confidential-proofs.service';
import { AuditorVerifySenderProofDto } from '~/confidential-proofs/dto/auditor-verify-sender-proof.dto';
import { AuditorVerifyTransactionDto } from '~/confidential-proofs/dto/auditor-verify-transaction.dto';
import { AuditorVerifyProofModel } from '~/confidential-proofs/models/auditor-verify-proof.model';
import { createConfidentialTransactionModel } from '~/confidential-transactions/confidential-transactions.util';
import { CreateConfidentialTransactionDto } from '~/confidential-transactions/dto/create-confidential-transaction.dto';
import { ObserverAffirmConfidentialTransactionDto } from '~/confidential-transactions/dto/observer-affirm-confidential-transaction.dto';
import { SenderAffirmConfidentialTransactionDto } from '~/confidential-transactions/dto/sender-affirm-confidential-transaction.dto copy';
import { IdentitiesService } from '~/identities/identities.service';
import { PolymeshService } from '~/polymesh/polymesh.service';
import { TransactionsService } from '~/transactions/transactions.service';
import { handleSdkError } from '~/transactions/transactions.util';

@Injectable()
export class ConfidentialTransactionsService {
  constructor(
    private readonly polymeshService: PolymeshService,
    private readonly transactionsService: TransactionsService,
    private readonly confidentialAccountsService: ConfidentialAccountsService,
    private readonly confidentialProofsService: ConfidentialProofsService,
    private readonly identitiesService: IdentitiesService
  ) {}

  public async findOne(id: BigNumber): Promise<ConfidentialTransaction> {
    return await this.polymeshService.polymeshApi.confidentialSettlements
      .getTransaction({ id })
      .catch(error => {
        throw handleSdkError(error);
      });
  }

  public async findVenue(id: BigNumber): Promise<ConfidentialVenue> {
    return await this.polymeshService.polymeshApi.confidentialSettlements
      .getVenue({ id })
      .catch(error => {
        throw handleSdkError(error);
      });
  }

  public async getVenueCreator(id: BigNumber): Promise<Identity> {
    const venue = await this.findVenue(id);
    return venue.creator();
  }

  public async createConfidentialVenue(
    baseParams: TransactionBaseDto
  ): ServiceReturn<ConfidentialVenue> {
    const { options } = extractTxOptions(baseParams);
    const createVenue = this.polymeshService.polymeshApi.confidentialSettlements.createVenue;
    return this.transactionsService.submit(createVenue, {}, options);
  }

  public async createConfidentialTransaction(
    venueId: BigNumber,
    createConfidentialTransactionDto: CreateConfidentialTransactionDto
  ): ServiceReturn<ConfidentialTransaction> {
    const venue = await this.findVenue(venueId);

    const { options, args } = extractTxOptions(createConfidentialTransactionDto);

    return this.transactionsService.submit(venue.addTransaction, args, options);
  }

  public async observerAffirmLeg(
    transactionId: BigNumber,
    body: ObserverAffirmConfidentialTransactionDto
  ): ServiceReturn<ConfidentialTransaction> {
    const transaction = await this.findOne(transactionId);

    const { options, args } = extractTxOptions(body);

    return this.transactionsService.submit(transaction.affirmLeg, args, options);
  }

  public async senderAffirmLeg(
    transactionId: BigNumber,
    body: SenderAffirmConfidentialTransactionDto
  ): ServiceReturn<ConfidentialTransaction> {
    const tx = await this.findOne(transactionId);

    const transaction = await createConfidentialTransactionModel(tx);

    const { options, args } = extractTxOptions(body);

    const { legId, legAmounts } = args;

    if (legId.gte(transaction.legs.length)) {
      throw new AppValidationError('Invalid leg ID received');
    }

    const { receiver, sender, assetAuditors } = transaction.legs[legId.toNumber()];

    const senderConfidentialAccount = await this.confidentialAccountsService.findOne(
      sender.publicKey
    );

    const proofs = [];

    for (const legAmount of legAmounts) {
      const { amount, confidentialAsset } = legAmount;
      const assetAuditor = assetAuditors.find(({ asset }) => asset.id === confidentialAsset);

      if (!assetAuditor) {
        throw new AppValidationError('Asset not found in the leg');
      }

      const encryptedBalance = await senderConfidentialAccount.getBalance({
        asset: confidentialAsset,
      });

      const proof = await this.confidentialProofsService.generateSenderProof(sender.publicKey, {
        amount,
        auditors: assetAuditor.auditors.map(({ publicKey }) => publicKey),
        receiver: receiver.publicKey,
        encryptedBalance,
      });

      proofs.push({ asset: confidentialAsset, proof });
    }

    return this.transactionsService.submit(
      tx.affirmLeg,
      {
        legId,
        party: ConfidentialAffirmParty.Sender,
        proofs,
      },
      options
    );
  }

  public async rejectTransaction(
    transactionId: BigNumber,
    base: TransactionBaseDto
  ): ServiceReturn<ConfidentialTransaction> {
    const { options } = extractTxOptions(base);
    const transaction = await this.findOne(transactionId);

    return this.transactionsService.submit(transaction.reject, {}, options);
  }

  public async executeTransaction(
    transactionId: BigNumber,
    base: TransactionBaseDto
  ): ServiceReturn<ConfidentialTransaction> {
    const { options } = extractTxOptions(base);
    const transaction = await this.findOne(transactionId);

    return this.transactionsService.submit(transaction.execute, {}, options);
  }

  public async getInvolvedParties(transactionId: BigNumber): Promise<Identity[]> {
    const transaction = await this.findOne(transactionId);

    return transaction.getInvolvedParties();
  }

  public async findVenuesByOwner(did: string): Promise<ConfidentialVenue[]> {
    const identity = await this.identitiesService.findOne(did);

    return identity.getConfidentialVenues();
  }

  public async getPendingAffirmsCount(transactionId: BigNumber): Promise<BigNumber> {
    const transaction = await this.findOne(transactionId);

    return transaction.getPendingAffirmsCount();
  }

  /**
   *  For a given confidential transaction and auditor this method performs the following steps:
   *     - Fetch all legs and sender proofs for the transaction
   *     - Find the legs and assets for which the auditor is involved
   *     - Verify the relevant proofs for the auditor
   *     - For non involved proofs, return a response indicating as such
   */
  public async verifyTransactionAsAuditor(
    transactionId: BigNumber,
    params: AuditorVerifyTransactionDto
  ): Promise<AuditorVerifyProofModel[]> {
    const transaction = await this.findOne(transactionId);
    const [legs, legStates, senderProofs] = await Promise.all([
      transaction.getLegs(),
      transaction.getLegStates(),
      transaction.getSenderProofs(),
    ]);

    if (legs.length === 0) {
      throw new AppNotFoundError(
        transactionId.toString(),
        'transaction legs (transaction likely executed)'
      );
    }

    const auditorPublicKey = params.auditorKey;

    type AuditorLookupEntry =
      | { isAuditor: false; assetId: string }
      | { isAuditor: true; assetId: string; auditorId: BigNumber };
    const legIdToAssetAuditor: Record<string, AuditorLookupEntry[]> = {};

    const insertEntry = (legId: BigNumber, value: AuditorLookupEntry): void => {
      const key = legId.toString();
      if (legIdToAssetAuditor[key]) {
        legIdToAssetAuditor[key].push(value);
      } else {
        legIdToAssetAuditor[key] = [value];
      }
    };

    legs.forEach(({ id: legId, assetAuditors }) => {
      assetAuditors.forEach(({ auditors, asset: { id: assetId } }) => {
        const auditorIndex = auditors.findIndex(({ publicKey }) => publicKey === auditorPublicKey);
        if (auditorIndex < 0) {
          insertEntry(legId, { isAuditor: false, assetId });
        } else {
          insertEntry(legId, {
            isAuditor: true,
            auditorId: new BigNumber(auditorIndex),
            assetId,
          });
        }
      });
    });

    const response: AuditorVerifyProofModel[] = [];
    const proofRequests: {
      confidentialAccount: string;
      params: AuditorVerifySenderProofDto;
      trackers: { legId: BigNumber; assetId: string };
    }[] = [];

    const legsWithoutStates = legs.filter(leg => !legStates.find(state => state.legId.eq(leg.id)));
    legsWithoutStates.forEach(leg => {
      leg.assetAuditors.forEach(assetAuditor => {
        const isAuditor = !!assetAuditor.auditors.find(
          legAuditor => legAuditor.publicKey === auditorPublicKey
        );

        response.push(
          new AuditorVerifyProofModel({
            isProved: false,
            isAuditor,
            assetId: assetAuditor.asset.id,
            legId: leg.id,
            amount: null,
            isValid: null,
            errMsg: null,
          })
        );
      });
    });

    legStates.forEach(({ legId, proved }) => {
      const key = legId.toString();

      const legProofs = senderProofs.find(senderProof => senderProof.legId.eq(legId));

      // leg proofs may not be present for a proved tx if middleware hasn't synced yet
      if (!proved || !legProofs) {
        const legAssets = legIdToAssetAuditor[key];
        legAssets.forEach(({ assetId, isAuditor }) => {
          response.push(
            new AuditorVerifyProofModel({
              isProved: false,
              isAuditor,
              assetId,
              legId,
              amount: null,
              isValid: null,
              errMsg: null,
            })
          );
        });

        return;
      }

      const assetAuditorValues = legIdToAssetAuditor[legId.toString()];
      legProofs.proofs.forEach(({ assetId, proof }) => {
        const auditorRecord = assetAuditorValues?.find(value => value.assetId === assetId);

        if (!auditorRecord) {
          throw new AppInternalError('asset auditor from SQ was not found in chain storage');
        }

        if (auditorRecord.isAuditor) {
          // Note: we could let users specify amount
          proofRequests.push({
            confidentialAccount: auditorPublicKey,
            params: { senderProof: proof, auditorId: auditorRecord.auditorId, amount: null },
            trackers: { assetId, legId },
          });
        } else {
          response.push(
            new AuditorVerifyProofModel({
              isAuditor: false,
              isProved: true,
              assetId,
              legId,
              amount: null,
              isValid: null,
              errMsg: null,
            })
          );
        }
      });
    });

    const proofResponses = await Promise.all(
      proofRequests.map(async ({ confidentialAccount, params: proofParams, trackers }) => {
        const proofResponse = await this.confidentialProofsService.verifySenderProofAsAuditor(
          confidentialAccount,
          proofParams
        );

        return {
          proofResponse,
          trackers,
        };
      })
    );

    proofResponses.forEach(({ proofResponse, trackers: { assetId, legId } }) => {
      response.push({
        isProved: true,
        isAuditor: true,
        amount: proofResponse.amount,
        assetId,
        legId,
        errMsg: proofResponse.errMsg,
        isValid: proofResponse.isValid,
      });
    });

    return response.sort((a, b) => a.legId.minus(b.legId).toNumber());
  }

  public async createdAt(id: BigNumber): Promise<EventIdentifier | null> {
    const transaction = await this.findOne(id);

    return transaction.createdAt();
  }
}
