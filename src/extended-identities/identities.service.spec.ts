import { Test, TestingModule } from '@nestjs/testing';
import { BigNumber } from '@polymeshassociation/polymesh-private-sdk';
import { ConfidentialLegParty } from '@polymeshassociation/polymesh-private-sdk/types';

import { ExtendedIdentitiesService } from '~/extended-identities/identities.service';
import { POLYMESH_API } from '~/polymesh/polymesh.consts';
import { PolymeshModule } from '~/polymesh/polymesh.module';
import { PolymeshService } from '~/polymesh/polymesh.service';
import { createMockConfidentialTransaction, MockIdentity, MockPolymesh } from '~/test-utils/mocks';
import * as transactionsUtilModule from '~/transactions/transactions.util';

describe('ExtendedIdentitiesService', () => {
  let service: ExtendedIdentitiesService;
  let mockPolymeshApi: MockPolymesh;
  let polymeshService: PolymeshService;

  beforeEach(async () => {
    mockPolymeshApi = new MockPolymesh();
    const module: TestingModule = await Test.createTestingModule({
      imports: [PolymeshModule],
      providers: [ExtendedIdentitiesService],
    })
      .overrideProvider(POLYMESH_API)
      .useValue(mockPolymeshApi)
      .compile();

    mockPolymeshApi = module.get<MockPolymesh>(POLYMESH_API);
    polymeshService = module.get<PolymeshService>(PolymeshService);

    service = module.get<ExtendedIdentitiesService>(ExtendedIdentitiesService);
  });

  afterEach(async () => {
    await polymeshService.close();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findOne', () => {
    it('should return the Identity for a valid DID', async () => {
      const fakeResult = 'identity';

      mockPolymeshApi.identities.getIdentity.mockResolvedValue(fakeResult);

      const result = await service.findOne('realDid');

      expect(result).toBe(fakeResult);
    });

    describe('otherwise', () => {
      it('should call the handleSdkError method and throw an error', async () => {
        const mockError = new Error('Some Error');
        mockPolymeshApi.identities.getIdentity.mockRejectedValue(mockError);

        const handleSdkErrorSpy = jest.spyOn(transactionsUtilModule, 'handleSdkError');

        await expect(() => service.findOne('invalidDID')).rejects.toThrowError();

        expect(handleSdkErrorSpy).toHaveBeenCalledWith(mockError);
      });
    });
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

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      jest.spyOn(service, 'findOne').mockResolvedValue(mockIdentity as any);
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
