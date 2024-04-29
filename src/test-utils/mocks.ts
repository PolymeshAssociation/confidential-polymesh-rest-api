/* istanbul ignore file */

import { createMock, DeepMocked, PartialFuncReturn } from '@golevelup/ts-jest';
import { BigNumber } from '@polymeshassociation/polymesh-private-sdk';
import {
  ConfidentialAccount,
  ConfidentialAsset,
  ConfidentialTransaction,
  ConfidentialVenue,
  Identity,
  TxTag,
} from '@polymeshassociation/polymesh-private-sdk/types';

import {
  MockIdentity as MockIdentityRestApi,
  MockPolymesh as MockPublicPolymesh,
} from '~/polymesh-rest-api/src/test-utils/mocks';

export * from '~/polymesh-rest-api/src/test-utils/mocks';

export class MockPolymesh extends MockPublicPolymesh {
  public confidentialAccounts = {
    getConfidentialAccount: jest.fn(),
    createConfidentialAccount: jest.fn(),
  };

  public confidentialAssets = {
    getConfidentialAsset: jest.fn(),
    getConfidentialAssetFromTicker: jest.fn(),
    createConfidentialAsset: jest.fn(),
  };

  public confidentialSettlements = {
    getTransaction: jest.fn(),
    getVenue: jest.fn(),
    createVenue: jest.fn(),
  };
}

export class MockTransaction {
  constructor(
    readonly transaction: {
      blockHash: string;
      txHash: string;
      tag: TxTag;
      blockNumber: BigNumber;
    }
  ) {
    Object.assign(this, transaction);
  }

  public run = jest.fn();
}

export class MockIdentity extends MockIdentityRestApi {
  public getConfidentialVenues = jest.fn();
  public getInvolvedConfidentialTransactions = jest.fn();
}

export function createMockIdentity(
  partial: PartialFuncReturn<Identity> = {
    did: 'SOME_DID',
  }
): DeepMocked<Identity> {
  return createMock<Identity>(partial);
}

export function createMockConfidentialAsset(
  partial: PartialFuncReturn<ConfidentialAsset> = {
    id: 'SOME-CONFIDENTIAL-ASSET-ID',
  }
): DeepMocked<ConfidentialAsset> {
  return createMock<ConfidentialAsset>(partial);
}

export function createMockConfidentialAccount(
  partial: PartialFuncReturn<ConfidentialAccount> = {
    publicKey: 'SOME_KEY',
    getIdentity(): PartialFuncReturn<Promise<Identity | null>> {
      return { did: 'SOME_OWNER' } as PartialFuncReturn<Promise<Identity | null>>;
    },
    getBalance(): PartialFuncReturn<Promise<string>> {
      return '0x0ceabalance' as PartialFuncReturn<Promise<string>>;
    },
  }
): DeepMocked<ConfidentialAccount> {
  return createMock<ConfidentialAccount>(partial);
}

export function createMockConfidentialTransaction(
  partial: PartialFuncReturn<ConfidentialTransaction> = {
    id: new BigNumber(1),
  }
): DeepMocked<ConfidentialTransaction> {
  return createMock<ConfidentialTransaction>(partial);
}

export function createMockConfidentialVenue(
  partial: PartialFuncReturn<ConfidentialVenue> = {
    id: new BigNumber(1),
    creator(): PartialFuncReturn<Promise<Identity>> {
      return { did: 'SOME_OWNER' } as PartialFuncReturn<Promise<Identity>>;
    },
  }
): DeepMocked<ConfidentialVenue> {
  return createMock<ConfidentialVenue>(partial);
}
