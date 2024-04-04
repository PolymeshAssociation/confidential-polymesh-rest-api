import { DeepMocked } from '@golevelup/ts-jest';
import { Test, TestingModule } from '@nestjs/testing';
import { BigNumber } from '@polymeshassociation/polymesh-sdk';

import { PaginatedResultsModel } from '~/common/models/paginated-results.model';
import { ConfidentialTransactionDirectionEnum } from '~/common/types';
import { ConfidentialAccountsService } from '~/confidential-accounts/confidential-accounts.service';
import { ConfidentialAccountsMiddlewareController } from '~/middleware/confidential-accounts-middleware/confidential-accounts-middleware.controller';
import { createMockConfidentialAsset, createMockConfidentialTransaction } from '~/test-utils/mocks';
import { mockConfidentialAccountsServiceProvider } from '~/test-utils/service-mocks';

describe('ConfidentialAccountsMiddlewareController', () => {
  let controller: ConfidentialAccountsMiddlewareController;
  let mockConfidentialAccountsService: DeepMocked<ConfidentialAccountsService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ConfidentialAccountsMiddlewareController],
      providers: [mockConfidentialAccountsServiceProvider],
    }).compile();

    mockConfidentialAccountsService = module.get<typeof mockConfidentialAccountsService>(
      ConfidentialAccountsService
    );

    controller = module.get<ConfidentialAccountsMiddlewareController>(
      ConfidentialAccountsMiddlewareController
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getHeldAssets', () => {
    it('should return a paginated list of held Confidential Assets', async () => {
      const mockAssets = {
        data: [
          createMockConfidentialAsset({ id: 'SOME_ASSET_ID_1' }),
          createMockConfidentialAsset({ id: 'SOME_ASSET_ID_2' }),
        ],
        next: new BigNumber(2),
        count: new BigNumber(2),
      };

      mockConfidentialAccountsService.findHeldAssets.mockResolvedValue(mockAssets);

      const result = await controller.getHeldAssets(
        { confidentialAccount: 'SOME_PUBLIC_KEY' },
        { start: new BigNumber(0), size: new BigNumber(2) }
      );

      expect(result).toEqual(
        new PaginatedResultsModel({
          results: expect.arrayContaining([{ id: 'SOME_ASSET_ID_2' }, { id: 'SOME_ASSET_ID_2' }]),
          total: new BigNumber(mockAssets.count),
          next: mockAssets.next,
        })
      );
    });
  });

  describe('getAssociatedTransactions', () => {
    it('should return the transactions associated with a given Confidential Account', async () => {
      const mockResult = {
        data: [createMockConfidentialTransaction()],
        next: new BigNumber(1),
        count: new BigNumber(1),
      };

      mockConfidentialAccountsService.getAssociatedTransactions.mockResolvedValue(mockResult);

      const result = await controller.getAssociatedTransactions(
        { confidentialAccount: 'SOME_PUBLIC_KEY' },
        {
          size: new BigNumber(1),
          start: new BigNumber(0),
          direction: ConfidentialTransactionDirectionEnum.All,
        }
      );

      expect(result).toEqual(
        expect.objectContaining({
          results: mockResult.data,
          next: mockResult.next,
          total: mockResult.count,
        })
      );
    });
  });
});
