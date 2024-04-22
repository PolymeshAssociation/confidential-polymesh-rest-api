import { DeepMocked } from '@golevelup/ts-jest';
import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { BigNumber } from '@polymeshassociation/polymesh-private-sdk';

import { ConfidentialTransactionsMiddlewareController } from '~/confidential-middleware/confidential-transactions-middleware/confidential-transactions-middleware.controller';
import { ConfidentialTransactionsService } from '~/confidential-transactions/confidential-transactions.service';
import { EventIdentifierModel } from '~/polymesh-rest-api/src/common/models/event-identifier.model';
import { mockConfidentialTransactionsServiceProvider } from '~/test-utils/service-mocks';

describe('ConfidentialTransactionsMiddlewareController', () => {
  let controller: ConfidentialTransactionsMiddlewareController;
  let mockConfidentialTransactionsService: DeepMocked<ConfidentialTransactionsService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ConfidentialTransactionsMiddlewareController],
      providers: [mockConfidentialTransactionsServiceProvider],
    }).compile();

    mockConfidentialTransactionsService = module.get<typeof mockConfidentialTransactionsService>(
      ConfidentialTransactionsService
    );

    controller = module.get<ConfidentialTransactionsMiddlewareController>(
      ConfidentialTransactionsMiddlewareController
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createdAt', () => {
    it('should throw AppNotFoundError if the event details are not yet ready', () => {
      mockConfidentialTransactionsService.createdAt.mockResolvedValue(null);

      return expect(() => controller.createdAt({ id: new BigNumber(99) })).rejects.toBeInstanceOf(
        NotFoundException
      );
    });

    describe('otherwise', () => {
      it('should return the Portfolio creation event details', async () => {
        const eventIdentifier = {
          blockDate: new Date('2021-06-26T01:47:45.000Z'),
          blockNumber: new BigNumber('2719172'),
          eventIndex: new BigNumber(1),
          blockHash: 'someHash',
        };
        mockConfidentialTransactionsService.createdAt.mockResolvedValue(eventIdentifier);

        const result = await controller.createdAt({ id: new BigNumber(10) });

        expect(result).toEqual(new EventIdentifierModel(eventIdentifier));
      });
    });
  });
});
