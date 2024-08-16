import { Injectable } from '@nestjs/common';
import { BigNumber } from '@polymeshassociation/polymesh-private-sdk';
import {
  AddConfidentialTransactionParams,
  AffirmConfidentialTransactionParams,
  ConfidentialAffirmParty,
  ConfidentialTransaction,
  ConfidentialVenue,
  EventIdentifier,
  Identity,
  SenderProofs,
} from '@polymeshassociation/polymesh-private-sdk/types';

import { ConfidentialAccountsService } from '~/confidential-accounts/confidential-accounts.service';
import { ConfidentialProofsService } from '~/confidential-proofs/confidential-proofs.service';
import { VerifyTransactionAmountsDto } from '~/confidential-proofs/dto/verify-transaction-amounts.dto';
import { AuditorVerifyProofModel } from '~/confidential-proofs/models/auditor-verify-proof.model';
import { SenderProofVerificationResponseModel } from '~/confidential-proofs/models/sender-proof-verification-response.model';
import { createConfidentialTransactionModel } from '~/confidential-transactions/confidential-transactions.util';
import { ConfidentialLegAmountDto } from '~/confidential-transactions/dto/confidential-leg-amount.dto';
import { CreateConfidentialTransactionDto } from '~/confidential-transactions/dto/create-confidential-transaction.dto';
import { ObserverAffirmConfidentialTransactionDto } from '~/confidential-transactions/dto/observer-affirm-confidential-transaction.dto';
import { SenderAffirmConfidentialTransactionDto } from '~/confidential-transactions/dto/sender-affirm-confidential-transaction.dto';
import { VerifyAndAffirmDto } from '~/confidential-transactions/dto/verify-and-affirm.dto';
import { ConfidentialProofModel } from '~/confidential-transactions/models/confidential-proof.model';
import { ProofDecryptRequest } from '~/confidential-transactions/types';
import { ExtendedIdentitiesService } from '~/extended-identities/identities.service';
import { PolymeshService } from '~/polymesh/polymesh.service';
import { TransactionBaseDto } from '~/polymesh-rest-api/src/common/dto/transaction-base-dto';
import { AppNotFoundError, AppValidationError } from '~/polymesh-rest-api/src/common/errors';
import { extractTxOptions, ServiceReturn } from '~/polymesh-rest-api/src/common/utils/functions';
import { TransactionsService } from '~/transactions/transactions.service';
import { handleSdkError } from '~/transactions/transactions.util';

@Injectable()
export class ConfidentialTransactionsService {
  constructor(
    private readonly polymeshService: PolymeshService,
    private readonly transactionsService: TransactionsService,
    private readonly confidentialAccountsService: ConfidentialAccountsService,
    private readonly confidentialProofsService: ConfidentialProofsService,
    private readonly extendedIdentitiesService: ExtendedIdentitiesService
  ) {}

  public async findOne(id: BigNumber): Promise<ConfidentialTransaction> {
    return await this.polymeshService.polymeshApi.confidentialSettlements
      .getTransaction({ id })
      .catch(error => {
        throw handleSdkError(error, { id: id.toString(), resource: 'Confidential Transaction' });
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

    return this.transactionsService.submit(
      venue.addTransaction,
      args as AddConfidentialTransactionParams,
      options
    );
  }

  public async observerAffirmLeg(
    transactionId: BigNumber,
    body: ObserverAffirmConfidentialTransactionDto
  ): ServiceReturn<ConfidentialTransaction> {
    const transaction = await this.findOne(transactionId);

    const { options, args } = extractTxOptions(body);

    return this.transactionsService.submit(
      transaction.affirmLeg,
      args as AffirmConfidentialTransactionParams,
      options
    );
  }

  public async senderAffirmLeg(
    transactionId: BigNumber,
    body: SenderAffirmConfidentialTransactionDto
  ): Promise<{
    result: Awaited<ServiceReturn<ConfidentialTransaction>>;
    proofs: ConfidentialProofModel[];
  }> {
    const tx = await this.findOne(transactionId);

    const txModel = await createConfidentialTransactionModel(tx);

    const { options, args } = extractTxOptions(body);

    const { legId, legAmounts } = args as SenderAffirmConfidentialTransactionDto;

    if (legId.gte(txModel.legs.length)) {
      throw new AppValidationError('Invalid leg ID received');
    }

    const { receiver, sender, assetAuditors } = txModel.legs[legId.toNumber()];

    const senderConfidentialAccount = await this.confidentialAccountsService.findOne(
      sender.publicKey
    );

    const proofs: ConfidentialProofModel[] = [];

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

      proofs.push(new ConfidentialProofModel({ asset: confidentialAsset, proof }));
    }

    const result = await this.transactionsService.submit(
      tx.affirmLeg,
      {
        legId,
        party: ConfidentialAffirmParty.Sender,
        proofs,
      },
      options
    );

    return { result, proofs };
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
    const identity = await this.extendedIdentitiesService.findOne(did);

    return identity.getConfidentialVenues();
  }

  public async getPendingAffirmsCount(transactionId: BigNumber): Promise<BigNumber> {
    const transaction = await this.findOne(transactionId);

    return transaction.getPendingAffirmsCount();
  }

  /**
   * Given an ElGamal public key this method decrypts all asset amounts with the corresponding private key
   */
  public async verifyTransactionAmounts(
    transactionId: BigNumber,
    params: VerifyTransactionAmountsDto
  ): Promise<AuditorVerifyProofModel[]> {
    const transaction = await this.findOne(transactionId);
    const legDetails = await transaction.getProofDetails();

    const { publicKey, legAmounts } = params;

    const unProvenResponses: AuditorVerifyProofModel[] = [];

    legDetails.pending.forEach(value => {
      let isReceiver = false;
      if (value.receiver.publicKey === publicKey) {
        isReceiver = true;
      }

      value.proofs.forEach(assetProof => {
        const isAuditor = assetProof.auditors.map(auditor => auditor.publicKey).includes(publicKey);

        unProvenResponses.push({
          isProved: false,
          isAuditor,
          isReceiver,
          amountDecrypted: false,
          legId: value.legId,
          assetId: assetProof.assetId,
          amount: null,
          isValid: null,
          errMsg: null,
        });
      });
    });

    const decryptedResponses = await Promise.all(
      legDetails.proved.map(leg => {
        const expectedAmounts = legAmounts?.find(({ legId: id }) => id.eq(leg.legId));

        return this.decryptLeg(leg, publicKey, expectedAmounts?.expectedAmounts);
      })
    );

    return [...unProvenResponses, ...decryptedResponses.flat()].sort((a, b) =>
      a.legId.minus(b.legId).toNumber()
    );
  }

  public async decryptLeg(
    provenLeg: SenderProofs,
    publicKey: string,
    expectedAmounts: ConfidentialLegAmountDto[] | undefined
  ): Promise<AuditorVerifyProofModel[]> {
    const response: AuditorVerifyProofModel[] = [];

    const { legId } = provenLeg;

    const findExpectedAmount = (assetId: string): BigNumber | null => {
      const expectedAmount = expectedAmounts?.find(({ confidentialAsset: id }) => id === assetId);

      if (!expectedAmount) {
        return null;
      }

      return expectedAmount.amount;
    };

    const decryptRequests: ProofDecryptRequest[] = [];

    let isReceiver = false;
    if (provenLeg.receiver.publicKey === publicKey) {
      isReceiver = true;
    }

    provenLeg.proofs.forEach(assetProof => {
      const auditorIndex = assetProof.auditors.findIndex(
        auditorKey => auditorKey.publicKey === publicKey
      );

      const isAuditor = auditorIndex >= 0;

      const expectedAmount = findExpectedAmount(assetProof.assetId);

      if (isReceiver) {
        decryptRequests.push({
          confidentialAccount: publicKey,
          params: {
            senderProof: assetProof.proof,
            amount: expectedAmount,
          },
          trackers: {
            assetId: assetProof.assetId,
            legId,
            amountGiven: expectedAmount,
            isAuditor,
          },
          type: 'receiver',
        });
      } else if (isAuditor) {
        decryptRequests.push({
          confidentialAccount: publicKey,
          params: {
            senderProof: assetProof.proof,
            auditorId: new BigNumber(auditorIndex),
            amount: expectedAmount,
          },
          trackers: {
            assetId: assetProof.assetId,
            legId,
            amountGiven: expectedAmount,
            isAuditor,
          },
          type: 'auditor',
        });
      } else {
        response.push({
          isProved: true,
          isAuditor: false,
          isReceiver: false,
          amountDecrypted: false,
          legId,
          assetId: assetProof.assetId,
          amount: null,
          isValid: null,
          errMsg: null,
        });
      }
    });

    await Promise.all(
      decryptRequests.map(
        async ({
          confidentialAccount,
          params: proofParams,
          type,
          trackers: { assetId, isAuditor },
        }) => {
          let proofResponse: SenderProofVerificationResponseModel;
          let isReceiverRequest = false;

          if (type === 'auditor') {
            proofResponse = await this.confidentialProofsService.verifySenderProofAsAuditor(
              confidentialAccount,
              proofParams
            );
          } else {
            isReceiverRequest = true;
            proofResponse = await this.confidentialProofsService.verifySenderProofAsReceiver(
              confidentialAccount,
              proofParams
            );
          }

          response.push({
            isProved: true,
            isAuditor,
            isReceiver: isReceiverRequest,
            amountDecrypted: true,
            amount: proofResponse.amount,
            assetId,
            legId,
            errMsg: proofResponse.errMsg,
            isValid: proofResponse.isValid,
          });
        }
      )
    );

    return response;
  }

  public async verifyAndAffirmLeg(
    transactionId: BigNumber,
    params: VerifyAndAffirmDto
  ): ServiceReturn<ConfidentialTransaction> {
    const transaction = await this.findOne(transactionId);

    const {
      args: { publicKey, expectedAmounts, legId },
    } = extractTxOptions(params);

    const { proved } = await transaction.getProofDetails();

    const provedLeg = proved.find(({ legId: id }) => id.eq(legId));

    if (!provedLeg) {
      throw new AppNotFoundError('leg was not proven', 'transaction');
    }

    const results = await this.decryptLeg(provedLeg, publicKey, expectedAmounts);

    const failedLegs = results.filter(({ isValid }) => !isValid);

    if (failedLegs.length) {
      const message = `Invalid legs: [${failedLegs.map(leg =>
        leg.legId.toString()
      )}], errors: [${failedLegs.map(leg => leg.errMsg)}]`;

      throw new AppValidationError(message);
    }

    const decryptedResults = results.filter(({ amountDecrypted }) => amountDecrypted);

    if (decryptedResults.length !== expectedAmounts.length) {
      throw new AppValidationError(
        `Expected amounts and decrypted amounts were different. Expected ${expectedAmounts.length} assets but decrypted ${decryptedResults.length}`
      );
    }

    const decryptedNotExpected = decryptedResults.filter(
      result => !expectedAmounts.some(expected => expected.confidentialAsset === result.assetId)
    );

    if (decryptedNotExpected.length) {
      const expectedNotDecrypted = expectedAmounts.filter(
        expected => !decryptedResults.some(result => expected.confidentialAsset === result.assetId)
      );

      throw new AppValidationError(
        `Expected and decrypted had different assets. Expected assets: ${expectedNotDecrypted.map(
          ({ confidentialAsset }) => confidentialAsset
        )}, decrypted: ${decryptedNotExpected.map(({ assetId }) => assetId)}`
      );
    }

    return this.observerAffirmLeg(transactionId, params);
  }

  public async createdAt(id: BigNumber): Promise<EventIdentifier | null> {
    const transaction = await this.findOne(id);

    return transaction.createdAt();
  }
}
