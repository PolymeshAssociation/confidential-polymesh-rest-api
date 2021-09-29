/* istanbul ignore file */

import { BigNumber } from '@polymathnetwork/polymesh-sdk';
import { TxTag } from '@polymathnetwork/polymesh-sdk/types';

export type Mocked<T> = T &
  {
    [K in keyof T]: T[K] extends (...args: infer Args) => unknown
      ? T[K] & jest.Mock<ReturnType<T[K]>, Args>
      : T[K];
  };

/* Polymesh SDK */

export class MockPolymesh {
  public static create = jest.fn().mockResolvedValue(new MockPolymesh());

  public getSecurityTokens = jest.fn();
  public getSecurityToken = jest.fn();
  public getIdentity = jest.fn();
  public getLatestBlock = jest.fn();
  public isIdentityValid = jest.fn();
  public disconnect = jest.fn();
  public addSigner = jest.fn();
  public reserveTicker = jest.fn();
  public getTickerReservation = jest.fn();
  public settlements = {
    getInstruction: jest.fn(),
    getVenue: jest.fn(),
  };

  public claims = {
    getIssuedClaims: jest.fn(),
    getIdentitiesWithClaims: jest.fn(),
  };
}

export class MockSecurityToken {
  public details = jest.fn();
  public getIdentifiers = jest.fn();
  public tokenHolders = {
    get: jest.fn(),
  };

  public documents = {
    get: jest.fn(),
  };

  public settlements = {
    canTransfer: jest.fn(),
  };

  public compliance = {
    requirements: {
      get: jest.fn(),
    },
    trustedClaimIssuers: {
      get: jest.fn(),
    },
  };

  public offerings = {
    get: jest.fn(),
  };

  public checkpoints = {
    get: jest.fn(),

    schedules: {
      get: jest.fn(),
    },
  };

  public corporateActions = {
    distributions: {
      get: jest.fn(),
    },
    getDefaults: jest.fn(),
  };
}

export class MockInstruction {
  public getStatus = jest.fn();
  public affirm = jest.fn();
  public details = jest.fn();
  public getLegs = jest.fn();
  public getAffirmations = jest.fn();
}

export class MockVenue {
  public addInstruction = jest.fn();
  public details = jest.fn();
  public modify = jest.fn();
}

export class MockIdentityAuthorization {
  public getSent = jest.fn();
  public getReceived = jest.fn();
}

export class MockPortfolios {
  public getPortfolios = jest.fn();
  public getPortfolio = jest.fn();
}

export class MockIdentity {
  did = '0x06'.padEnd(66, '0');
  portfolios = new MockPortfolios();
  authorizations = new MockIdentityAuthorization();
  public getPrimaryKey = jest.fn();
  public areSecondaryKeysFrozen = jest.fn();
  public getPendingInstructions = jest.fn();
  public getVenues = jest.fn();
  public createVenue = jest.fn();
  public getSecondaryKeys = jest.fn();
  public getTrustingTokens = jest.fn();
}

export class MockPortfolio {
  id = new BigNumber(1);
  owner = new MockIdentity();
  public getName = jest.fn();
  public getTokenBalances = jest.fn();
  public isCustodiedBy = jest.fn();
  public getCustodian = jest.fn();
  public moveFunds = jest.fn();
  public toJson = jest.fn();
}

export class MockTickerReservation {
  public createToken = jest.fn();
}

export class MockTransactionQueue {
  constructor(public readonly transactions: { blockHash: string; txHash: string; tag: TxTag }[]) {}

  public run = jest.fn();
}

/* Services */

export class MockRelayerAccountsService {
  public findAddressByDid = jest.fn();

  public findAll = jest.fn().mockReturnValue([]);
}