import { Test, TestingModule } from '@nestjs/testing';
import { BigNumber } from '@polymeshassociation/polymesh-private-sdk';
import { ConfidentialLegParty } from '@polymeshassociation/polymesh-private-sdk/types';

import { ExtendedIdentitiesService } from '~/extended-identities/identities.service';
import { IdentitiesService } from '~/polymesh-rest-api/src/identities/identities.service';
import { MockIdentitiesService } from '~/polymesh-rest-api/src/test-utils/service-mocks';
import { createMockConfidentialTransaction, MockIdentity } from '~/test-utils/mocks';

describe('IdentitiesService', () => {
  let service: ExtendedIdentitiesService;
  let mockIdentitiesService: MockIdentitiesService;

  beforeEach(async () => {
    mockIdentitiesService = new MockIdentitiesService();

    const module: TestingModule = await Test.createTestingModule({
      providers: [ExtendedIdentitiesService, IdentitiesService],
    })
      .overrideProvider(IdentitiesService)
      .useValue(mockIdentitiesService)
      .compile();

    service = module.get<ExtendedIdentitiesService>(ExtendedIdentitiesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getInvolvedConfidentialTransactions', () => {
    const mockAffirmations = {
      data: [
        {
          transaction: createMockConfidentialTransaction(),
          legId: new BigNumber(1),
          role: ConfidentialLegParty.Auditor,
          affirmed: true,
        },
      ],
      next: '0xddddd',
      count: new BigNumber(1),
    };

    beforeEach(() => {
      const mockIdentity = new MockIdentity();
      mockIdentity.getInvolvedConfidentialTransactions.mockResolvedValue(mockAffirmations);

      mockIdentitiesService.findOne.mockResolvedValue(mockIdentity);
    });

    it('should return the list of involved confidential affirmations', async () => {
      const result = await service.getInvolvedConfidentialTransactions('0x01', new BigNumber(10));
      expect(result).toEqual(mockAffirmations);
    });

    it('should return the list of involved confidential affirmations from a start value', async () => {
      const result = await service.getInvolvedConfidentialTransactions(
        '0x01',
        new BigNumber(10),
        'NEXT_KEY'
      );
      expect(result).toEqual(mockAffirmations);
    });
  });
});
