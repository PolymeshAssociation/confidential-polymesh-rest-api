import { DeepMocked } from '@golevelup/ts-jest';
import { Test } from '@nestjs/testing';
import { BigNumber } from '@polymeshassociation/polymesh-private-sdk';
import { ConfidentialLegParty } from '@polymeshassociation/polymesh-private-sdk/types';

import { ConfidentialTransactionsService } from '~/confidential-transactions/confidential-transactions.service';
import { ExtendedIdentitiesController } from '~/extended-identities/identities.controller';
import { ExtendedIdentitiesService } from '~/extended-identities/identities.service';
import { PaginatedResultsModel } from '~/polymesh-rest-api/src/common/models/paginated-results.model';
import { testValues } from '~/test-utils/consts';
import { createMockConfidentialTransaction, createMockConfidentialVenue } from '~/test-utils/mocks';
import {
  mockConfidentialTransactionsServiceProvider,
  MockIdentitiesService,
} from '~/test-utils/service-mocks';

const { did } = testValues;

describe('IdentitiesController', () => {
  let controller: ExtendedIdentitiesController;
  const mockIdentitiesService = new MockIdentitiesService();
  let mockConfidentialTransactionService: DeepMocked<ConfidentialTransactionsService>;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      controllers: [ExtendedIdentitiesController],
      providers: [ExtendedIdentitiesService, mockConfidentialTransactionsServiceProvider],
    })
      .overrideProvider(ExtendedIdentitiesService)
      .useValue(mockIdentitiesService)
      .compile();

    mockConfidentialTransactionService = module.get<typeof mockConfidentialTransactionService>(
      ConfidentialTransactionsService
    );
    controller = module.get<ExtendedIdentitiesController>(ExtendedIdentitiesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getConfidentialVenues', () => {
    it("should return the Identity's Confidential Venues", async () => {
      const mockResults = [createMockConfidentialVenue()];
      mockConfidentialTransactionService.findVenuesByOwner.mockResolvedValue(mockResults);

      const result = await controller.getConfidentialVenues({ did });
      expect(result).toEqual({
        results: mockResults,
      });
    });
  });

  describe('getInvolvedConfidentialTransactions', () => {
    const mockAffirmations = {
      data: [
        {
          transaction: createMockConfidentialTransaction(),
          legId: new BigNumber(0),
          role: ConfidentialLegParty.Mediator,
          affirmed: true,
        },
      ],
      next: '0xddddd',
      count: new BigNumber(1),
    };

    it('should return the list of involved confidential affirmations', async () => {
      mockIdentitiesService.getInvolvedConfidentialTransactions.mockResolvedValue(mockAffirmations);

      const result = await controller.getInvolvedConfidentialTransactions(
        { did },
        { size: new BigNumber(1) }
      );

      expect(result).toEqual(
        new PaginatedResultsModel({
          results: expect.arrayContaining(mockAffirmations.data),
          total: new BigNumber(mockAffirmations.count),
          next: mockAffirmations.next,
        })
      );
    });

    it('should return the list of involved confidential affirmations from a start value', async () => {
      mockIdentitiesService.getInvolvedConfidentialTransactions.mockResolvedValue(mockAffirmations);

      const result = await controller.getInvolvedConfidentialTransactions(
        { did },
        { size: new BigNumber(1), start: 'SOME_START_KEY' }
      );

      expect(result).toEqual(
        new PaginatedResultsModel({
          results: expect.arrayContaining(mockAffirmations.data),
          total: new BigNumber(mockAffirmations.count),
          next: mockAffirmations.next,
        })
      );
    });
  });
});
