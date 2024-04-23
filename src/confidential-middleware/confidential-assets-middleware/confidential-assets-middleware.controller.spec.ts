import { DeepMocked } from '@golevelup/ts-jest';
import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { BigNumber } from '@polymeshassociation/polymesh-private-sdk';
import { EventIdEnum } from '@polymeshassociation/polymesh-private-sdk/types';

import { ConfidentialAssetsService } from '~/confidential-assets/confidential-assets.service';
import { ConfidentialAssetsMiddlewareController } from '~/confidential-middleware/confidential-assets-middleware/confidential-assets-middleware.controller';
import { EventIdentifierModel } from '~/polymesh-rest-api/src/common/models/event-identifier.model';
import { mockConfidentialAssetsServiceProvider } from '~/test-utils/service-mocks';

describe('ConfidentialAssetsMiddlewareController', () => {
  let controller: ConfidentialAssetsMiddlewareController;
  let mockConfidentialAssetsService: DeepMocked<ConfidentialAssetsService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ConfidentialAssetsMiddlewareController],
      providers: [mockConfidentialAssetsServiceProvider],
    }).compile();

    mockConfidentialAssetsService =
      module.get<typeof mockConfidentialAssetsService>(ConfidentialAssetsService);

    controller = module.get<ConfidentialAssetsMiddlewareController>(
      ConfidentialAssetsMiddlewareController
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createdAt', () => {
    it('should throw AppNotFoundError if the event details are not yet ready', () => {
      mockConfidentialAssetsService.createdAt.mockResolvedValue(null);

      return expect(() =>
        controller.createdAt({ confidentialAssetId: 'SOME_ASSET_ID' })
      ).rejects.toBeInstanceOf(NotFoundException);
    });

    describe('otherwise', () => {
      it('should return the Portfolio creation event details', async () => {
        const eventIdentifier = {
          blockNumber: new BigNumber('2719172'),
          blockHash: 'someHash',
          blockDate: new Date('2021-06-26T01:47:45.000Z'),
          eventIndex: new BigNumber(1),
        };
        mockConfidentialAssetsService.createdAt.mockResolvedValue(eventIdentifier);

        const result = await controller.createdAt({ confidentialAssetId: 'SOME_ASSET_ID' });

        expect(result).toEqual(new EventIdentifierModel(eventIdentifier));
      });
    });
  });

  describe('getTransactionHistory', () => {
    it('should return the transaction history', async () => {
      const mockResult = {
        data: [
          {
            id: 'someId',
            assetId: '0x0a732f0ea43bb082ff1cff9a9ff59291',
            fromId: 'mockFrom',
            toId: '0x786a5b0ffef119dd43565768a3557e7880be8958c7eda070e4162b27f308b23e',
            amount:
              '0x000000000000000000000000000000000000000000000000000000000000000064aff78e09b0fa5dccd82b594cd49d431d0fbf8ddd6830e65a0cdcd428d67428',
            datetime: new Date('2024-02-20T13:15:54'),
            createdBlockId: new BigNumber(277),
            eventId: EventIdEnum.AccountDeposit,
            memo: 'someMemo',
          },
        ],
        next: 'abc',
        count: new BigNumber(1),
      };

      mockConfidentialAssetsService.transactionHistory.mockResolvedValue(mockResult);

      const result = await controller.getTransactionHistory(
        { confidentialAssetId: 'SOME_ASSET_ID' },
        { size: new BigNumber(10) }
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
