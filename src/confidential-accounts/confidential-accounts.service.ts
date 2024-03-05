import { Injectable, NotFoundException } from '@nestjs/common';
import { BigNumber } from '@polymeshassociation/polymesh-sdk';
import {
  ConfidentialAccount,
  ConfidentialAsset,
  ConfidentialAssetBalance,
  Identity,
  ResultSet,
} from '@polymeshassociation/polymesh-sdk/types';

import { TransactionBaseDto } from '~/common/dto/transaction-base-dto';
import { TransactionOptionsDto } from '~/common/dto/transaction-options.dto';
import { extractTxOptions, ServiceReturn } from '~/common/utils';
import { PolymeshService } from '~/polymesh/polymesh.service';
import { TransactionsService } from '~/transactions/transactions.service';
import { handleSdkError } from '~/transactions/transactions.util';

@Injectable()
export class ConfidentialAccountsService {
  constructor(
    private readonly polymeshService: PolymeshService,
    private readonly transactionsService: TransactionsService
  ) {}

  public async findOne(publicKey: string): Promise<ConfidentialAccount> {
    return await this.polymeshService.polymeshApi.confidentialAccounts
      .getConfidentialAccount({ publicKey })
      .catch(error => {
        throw handleSdkError(error);
      });
  }

  public async fetchOwner(publicKey: string): Promise<Identity> {
    const account = await this.findOne(publicKey);

    const identity = await account.getIdentity();

    if (!identity) {
      throw new NotFoundException('No owner exists for the Confidential Account');
    }

    return identity;
  }

  public async linkConfidentialAccount(
    publicKey: string,
    body: TransactionBaseDto
  ): ServiceReturn<ConfidentialAccount> {
    const { options } = extractTxOptions(body);

    const createConfidentialAccount =
      this.polymeshService.polymeshApi.confidentialAccounts.createConfidentialAccount;

    return this.transactionsService.submit(createConfidentialAccount, { publicKey }, options);
  }

  public async getAllBalances(confidentialAccount: string): Promise<ConfidentialAssetBalance[]> {
    const account = await this.findOne(confidentialAccount);

    return account.getBalances();
  }

  public async getAssetBalance(confidentialAccount: string, asset: string): Promise<string> {
    const account = await this.findOne(confidentialAccount);

    return await account.getBalance({ asset }).catch(error => {
      throw handleSdkError(error);
    });
  }

  public async getAllIncomingBalances(
    confidentialAccount: string
  ): Promise<ConfidentialAssetBalance[]> {
    const account = await this.findOne(confidentialAccount);

    return account.getIncomingBalances();
  }

  public async getIncomingAssetBalance(
    confidentialAccount: string,
    asset: string
  ): Promise<string> {
    const account = await this.findOne(confidentialAccount);

    return await account.getIncomingBalance({ asset }).catch(error => {
      throw handleSdkError(error);
    });
  }

  public async applyAllIncomingAssetBalances(
    confidentialAccount: string,
    body: TransactionOptionsDto
  ): ServiceReturn<ConfidentialAccount> {
    const { options } = extractTxOptions(body);
    const applyIncomingBalances =
      this.polymeshService.polymeshApi.confidentialAccounts.applyIncomingBalances;

    return this.transactionsService.submit(applyIncomingBalances, { confidentialAccount }, options);
  }

  public async findHeldAssets(
    confidentialAccount: string,
    size?: BigNumber,
    start?: BigNumber
  ): Promise<ResultSet<ConfidentialAsset>> {
    const account = await this.findOne(confidentialAccount);

    return account.getHeldAssets({ size, start });
  }
}
