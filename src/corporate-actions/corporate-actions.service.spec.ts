/* eslint-disable import/first */
const mockIsPolymeshError = jest.fn();

import { Test, TestingModule } from '@nestjs/testing';
import { BigNumber } from '@polymathnetwork/polymesh-sdk';
import { TargetTreatment, TxTags } from '@polymathnetwork/polymesh-sdk/types';

import { AssetsService } from '~/assets/assets.service';
import { CorporateActionsService } from '~/corporate-actions/corporate-actions.service';
import { MockCorporateActionDefaults } from '~/corporate-actions/mocks/corporate-action-defaults.mock';
import { MockDistributionWithDetails } from '~/corporate-actions/mocks/distribution-with-details.mock';
import { MockDistribution } from '~/corporate-actions/mocks/dividend-distribution.mock';
import { RelayerAccountsService } from '~/relayer-accounts/relayer-accounts.service';
import {
  MockRelayerAccountsService,
  MockSecurityToken,
  MockTransactionQueue,
} from '~/test-utils/mocks';

jest.mock('@polymathnetwork/polymesh-sdk/types', () => ({
  ...jest.requireActual('@polymathnetwork/polymesh-sdk/types'),
  isPolymeshError: mockIsPolymeshError,
}));

describe('CorporateActionsService', () => {
  let service: CorporateActionsService;

  const mockAssetsService = {
    findOne: jest.fn(),
  };

  const mockRelayerAccountsService = new MockRelayerAccountsService();

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CorporateActionsService, AssetsService, RelayerAccountsService],
    })
      .overrideProvider(AssetsService)
      .useValue(mockAssetsService)
      .overrideProvider(RelayerAccountsService)
      .useValue(mockRelayerAccountsService)
      .compile();

    service = module.get<CorporateActionsService>(CorporateActionsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findDefaultsByTicker', () => {
    it('should return the Corporate Action defaults for an Asset', async () => {
      const mockCorporateActionDefaults = new MockCorporateActionDefaults();

      const mockSecurityToken = new MockSecurityToken();
      mockSecurityToken.corporateActions.getDefaults.mockResolvedValue(mockCorporateActionDefaults);

      mockAssetsService.findOne.mockResolvedValue(mockSecurityToken);

      const result = await service.findDefaultsByTicker('TICKER');

      expect(result).toEqual(mockCorporateActionDefaults);
    });
  });

  describe('updateDefaultsByTicker', () => {
    let mockSecurityToken: MockSecurityToken;
    const ticker = 'TICKER';

    beforeEach(() => {
      mockSecurityToken = new MockSecurityToken();
      mockAssetsService.findOne.mockResolvedValue(mockSecurityToken);
    });

    describe('if there is an error while modifying the defaults for Corporate Actions', () => {
      it('should pass the error along the chain', async () => {
        const expectedError = new Error('New targets are the same as the current ones');
        const body = {
          signer: '0x6'.padEnd(66, '0'),
          targets: {
            treatment: TargetTreatment.Exclude,
            identities: [],
          },
        };
        mockSecurityToken.corporateActions.setDefaults.mockImplementation(() => {
          throw expectedError;
        });

        mockIsPolymeshError.mockReturnValue(true);

        let error = null;
        try {
          await service.updateDefaultsByTicker(ticker, body);
        } catch (err) {
          error = err;
        }
        expect(error).toEqual(expectedError);
      });
    });
    describe('otherwise', () => {
      it('should run a setDefaults procedure and return the queue data', async () => {
        const transactions = [
          {
            blockHash: '0x1',
            txHash: '0x2',
            tag: TxTags.corporateAction.SetDefaultWithholdingTax,
          },
        ];
        const mockQueue = new MockTransactionQueue(transactions);

        mockSecurityToken.corporateActions.setDefaults.mockResolvedValue(mockQueue);

        const address = 'address';
        mockRelayerAccountsService.findAddressByDid.mockReturnValue(address);

        const body = {
          signer: '0x6'.padEnd(66, '0'),
          defaultTaxWithholding: new BigNumber('25'),
        };
        const result = await service.updateDefaultsByTicker(ticker, body);

        expect(result).toEqual({
          result: undefined,
          transactions: [
            {
              blockHash: '0x1',
              transactionHash: '0x2',
              transactionTag: TxTags.corporateAction.SetDefaultWithholdingTax,
            },
          ],
        });
        expect(mockSecurityToken.corporateActions.setDefaults).toHaveBeenCalledWith(
          { defaultTaxWithholding: new BigNumber('25') },
          { signer: address }
        );
      });
    });

    afterEach(() => {
      expect(mockAssetsService.findOne).toHaveBeenCalledWith(ticker);
    });
  });

  describe('findDistributionsByTicker', () => {
    it('should return the Dividend Distributions associated with an Asset', async () => {
      const mockDistributions = [new MockDistributionWithDetails()];

      const mockSecurityToken = new MockSecurityToken();
      mockSecurityToken.corporateActions.distributions.get.mockResolvedValue(mockDistributions);

      mockAssetsService.findOne.mockResolvedValue(mockSecurityToken);

      const result = await service.findDistributionsByTicker('TICKER');

      expect(result).toEqual(mockDistributions);
    });
  });

  describe('createDividendDistributionByTicker', () => {
    let mockSecurityToken: MockSecurityToken;
    const ticker = 'TICKER';

    beforeEach(() => {
      mockSecurityToken = new MockSecurityToken();
      mockAssetsService.findOne.mockResolvedValue(mockSecurityToken);
    });

    describe('if there is an error while configuring a Dividend Distribution', () => {
      it('should pass the error along the chain', async () => {
        const expectedError = new Error(
          'Origin Portfolio free balance is not enough to cover the distribution amount'
        );
        const mockDate = new Date();
        const body = {
          signer: '0x6'.padEnd(66, '0'),
          description: 'Corporate Action description',
          checkpoint: mockDate,
          originPortfolio: new BigNumber(0),
          currency: 'TICKER',
          perShare: new BigNumber(2),
          maxAmount: new BigNumber(1000),
          paymentDate: mockDate,
        };
        mockSecurityToken.corporateActions.distributions.configureDividendDistribution.mockImplementation(
          () => {
            throw expectedError;
          }
        );

        mockIsPolymeshError.mockReturnValue(true);

        let error = null;
        try {
          await service.createDividendDistributionByTicker(ticker, body);
        } catch (err) {
          error = err;
        }
        expect(error).toEqual(expectedError);
      });
    });
    describe('otherwise', () => {
      it('should run a configureDividendDistribution procedure and return the created Dividend Distribution', async () => {
        const transactions = [
          {
            blockHash: '0x1',
            txHash: '0x2',
            tag: TxTags.corporateAction.InitiateCorporateAction,
          },
          {
            blockHash: '0x3',
            txHash: '0x4',
            tag: TxTags.capitalDistribution.Distribute,
          },
        ];
        const mockQueue = new MockTransactionQueue(transactions);
        mockQueue.run.mockResolvedValue(new MockDistribution());
        mockSecurityToken.corporateActions.distributions.configureDividendDistribution.mockResolvedValue(
          mockQueue
        );

        const address = 'address';
        mockRelayerAccountsService.findAddressByDid.mockReturnValue(address);

        const mockDate = new Date();
        const body = {
          signer: '0x6'.padEnd(66, '0'),
          description: 'Corporate Action description',
          checkpoint: mockDate,
          originPortfolio: new BigNumber(0),
          currency: 'TICKER',
          perShare: new BigNumber(2),
          maxAmount: new BigNumber(1000),
          paymentDate: mockDate,
        };
        const result = await service.createDividendDistributionByTicker(ticker, body);

        expect(result).toEqual({
          result: new MockDistribution(),
          transactions: [
            {
              blockHash: '0x1',
              transactionHash: '0x2',
              transactionTag: TxTags.corporateAction.InitiateCorporateAction,
            },
            {
              blockHash: '0x3',
              transactionHash: '0x4',
              transactionTag: TxTags.capitalDistribution.Distribute,
            },
          ],
        });
      });
    });

    afterEach(() => {
      expect(mockAssetsService.findOne).toHaveBeenCalledWith(ticker);
    });
  });
});
