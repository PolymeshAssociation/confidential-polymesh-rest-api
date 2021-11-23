import { Test, TestingModule } from '@nestjs/testing';
import { BigNumber } from '@polymathnetwork/polymesh-sdk';
import { TxTags } from '@polymathnetwork/polymesh-sdk/polkadot';

import { ResultsModel } from '~/common/models/results.model';
import { CorporateActionsController } from '~/corporate-actions/corporate-actions.controller';
import { CorporateActionsService } from '~/corporate-actions/corporate-actions.service';
import {
  createDividendDistributionDetailsModel,
  createDividendDistributionModel,
} from '~/corporate-actions/corporate-actions.util';
import { MockCorporateActionDefaults } from '~/corporate-actions/mocks/corporate-action-defaults.mock';
import { MockDistributionWithDetails } from '~/corporate-actions/mocks/distribution-with-details.mock';
import { MockDistribution } from '~/corporate-actions/mocks/dividend-distribution.mock';
import { CreatedDividendDistributionModel } from '~/corporate-actions/model/created-dividend-distribution.model';

describe('CorporateActionsController', () => {
  let controller: CorporateActionsController;

  const mockCorporateActionsService = {
    findDefaultsByTicker: jest.fn(),
    updateDefaultsByTicker: jest.fn(),
    findDistributionsByTicker: jest.fn(),
    createDividendDistributionByTicker: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CorporateActionsController],
      providers: [CorporateActionsService],
    })
      .overrideProvider(CorporateActionsService)
      .useValue(mockCorporateActionsService)
      .compile();

    controller = module.get<CorporateActionsController>(CorporateActionsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getDefaults', () => {
    it('should return the Corporate Action defaults for an Asset', async () => {
      const mockCorporateActionDefaults = new MockCorporateActionDefaults();

      mockCorporateActionsService.findDefaultsByTicker.mockResolvedValue(
        mockCorporateActionDefaults
      );

      const result = await controller.getDefaults({ ticker: 'TICKER' });

      expect(result).toEqual(mockCorporateActionDefaults);
    });
  });

  describe('updateDefaults', () => {
    it('should update the Corporate Action defaults and return the details of transaction', async () => {
      const response = {
        transactions: ['transaction'],
      };
      mockCorporateActionsService.updateDefaultsByTicker.mockResolvedValue(response);
      const body = {
        signer: '0x6'.padEnd(66, '0'),
        defaultTaxWithholding: new BigNumber('25'),
      };

      const result = await controller.updateDefaults({ ticker: 'TICKER' }, body);

      expect(result).toEqual({
        transactions: ['transaction'],
      });
      expect(mockCorporateActionsService.updateDefaultsByTicker).toHaveBeenCalledWith(
        'TICKER',
        body
      );
    });
  });

  describe('getDividendDistributions', () => {
    it('should return the Dividend Distributions associated with an Asset', async () => {
      const mockDistributions = [new MockDistributionWithDetails()];

      mockCorporateActionsService.findDistributionsByTicker.mockResolvedValue(mockDistributions);

      const result = await controller.getDividendDistributions({ ticker: 'TICKER' });

      expect(result).toEqual(
        new ResultsModel({
          results: mockDistributions.map(distributionWithDetails =>
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            createDividendDistributionDetailsModel(distributionWithDetails as any)
          ),
        })
      );
    });
  });

  describe('createDividendDistributionByTicker', () => {
    it('should call the service and return the results', async () => {
      const mockDistribution = new MockDistribution();
      const response = {
        result: mockDistribution,
        transactions: [
          {
            blockHash: '0x1',
            transactionHash: '0x2',
            transactionTag: TxTags.corporateAction.SetDefaultWithholdingTax,
          },
          {
            blockHash: '0x3',
            transactionHash: '0x4',
            transactionTag: TxTags.capitalDistribution.Distribute,
          },
        ],
      };
      mockCorporateActionsService.createDividendDistributionByTicker.mockResolvedValue(response);
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

      const result = await controller.createDividendDistribution({ ticker: 'TICKER' }, body);

      expect(result).toEqual(
        new CreatedDividendDistributionModel({
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          dividendDistribution: createDividendDistributionModel(mockDistribution as any),
          transactions: [
            {
              blockHash: '0x1',
              transactionHash: '0x2',
              transactionTag: TxTags.corporateAction.SetDefaultWithholdingTax,
            },
            {
              blockHash: '0x3',
              transactionHash: '0x4',
              transactionTag: TxTags.capitalDistribution.Distribute,
            },
          ],
        })
      );
      expect(mockCorporateActionsService.createDividendDistributionByTicker).toHaveBeenCalledWith(
        'TICKER',
        body
      );
    });
  });
});
