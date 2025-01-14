import { DeepMocked } from '@golevelup/ts-jest';
import { Test, TestingModule } from '@nestjs/testing';
import { BigNumber } from '@polymeshassociation/polymesh-private-sdk';
import {
  ConfidentialVenueFilteringDetails,
  EventIdEnum,
  TxTags,
} from '@polymeshassociation/polymesh-private-sdk/types';
import { when } from 'jest-when';

import { ConfidentialAccountsService } from '~/confidential-accounts/confidential-accounts.service';
import { ConfidentialAssetsService } from '~/confidential-assets/confidential-assets.service';
import { ConfidentialProofsService } from '~/confidential-proofs/confidential-proofs.service';
import { POLYMESH_API } from '~/polymesh/polymesh.consts';
import { PolymeshModule } from '~/polymesh/polymesh.module';
import { PolymeshService } from '~/polymesh/polymesh.service';
import { ProcessMode } from '~/polymesh-rest-api/src/common/types';
import { testValues } from '~/test-utils/consts';
import { createMockConfidentialAsset, MockPolymesh, MockTransaction } from '~/test-utils/mocks';
import {
  mockConfidentialAccountsServiceProvider,
  mockConfidentialProofsServiceProvider,
  mockTransactionsProvider,
  MockTransactionsService,
} from '~/test-utils/service-mocks';
import { TransactionsService } from '~/transactions/transactions.service';
import * as transactionsUtilModule from '~/transactions/transactions.util';

const { signer } = testValues;

describe('ConfidentialAssetsService', () => {
  let service: ConfidentialAssetsService;
  let mockPolymeshApi: MockPolymesh;
  let polymeshService: PolymeshService;
  let mockTransactionsService: MockTransactionsService;
  let mockConfidentialAccountsService: DeepMocked<ConfidentialAccountsService>;
  let mockConfidentialProofsService: DeepMocked<ConfidentialProofsService>;
  const id = 'SOME-CONFIDENTIAL-ASSET-ID';

  beforeEach(async () => {
    mockPolymeshApi = new MockPolymesh();

    const module: TestingModule = await Test.createTestingModule({
      imports: [PolymeshModule],
      providers: [
        ConfidentialAssetsService,
        mockTransactionsProvider,
        mockConfidentialAccountsServiceProvider,
        mockConfidentialProofsServiceProvider,
      ],
    })
      .overrideProvider(POLYMESH_API)
      .useValue(mockPolymeshApi)
      .compile();

    mockPolymeshApi = module.get<MockPolymesh>(POLYMESH_API);
    polymeshService = module.get<PolymeshService>(PolymeshService);
    mockTransactionsService = module.get<MockTransactionsService>(TransactionsService);
    mockConfidentialProofsService =
      module.get<typeof mockConfidentialProofsService>(ConfidentialProofsService);
    mockConfidentialAccountsService = module.get<typeof mockConfidentialAccountsService>(
      ConfidentialAccountsService
    );

    service = module.get<ConfidentialAssetsService>(ConfidentialAssetsService);
  });

  afterEach(async () => {
    await polymeshService.close();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findOne', () => {
    it('should return a Confidential Asset for a valid ID', async () => {
      const asset = createMockConfidentialAsset();
      mockPolymeshApi.confidentialAssets.getConfidentialAsset.mockResolvedValue(asset);

      const result = await service.findOne(id);

      expect(result).toEqual(asset);
    });

    it('should call handleSdkError and throw an error', async () => {
      const mockError = new Error('Some Error');
      mockPolymeshApi.confidentialAssets.getConfidentialAsset.mockRejectedValue(mockError);

      const handleSdkErrorSpy = jest.spyOn(transactionsUtilModule, 'handleSdkError');

      await expect(() => service.findOne(id)).rejects.toThrowError();

      expect(handleSdkErrorSpy).toHaveBeenCalledWith(mockError);
    });
  });

  describe('createConfidentialAsset', () => {
    it('should create the Confidential Asset', async () => {
      const input = {
        signer,
        data: 'SOME_DATA',
        auditors: ['AUDITOR_KEY'],
        mediators: ['MEDIATOR_DID'],
      };
      const mockTransactions = {
        blockHash: '0x1',
        txHash: '0x2',
        blockNumber: new BigNumber(1),
        tag: TxTags.confidentialAsset.CreateConfidentialAsset,
      };
      const mockTransaction = new MockTransaction(mockTransactions);
      const mockAsset = createMockConfidentialAsset();

      mockTransactionsService.submit.mockResolvedValue({
        result: mockAsset,
        transactions: [mockTransaction],
      });

      const result = await service.createConfidentialAsset(input);

      expect(result).toEqual({
        result: mockAsset,
        transactions: [mockTransaction],
      });
    });
  });

  describe('issue', () => {
    it('should mint Confidential Assets', async () => {
      const input = {
        signer,
        amount: new BigNumber(100),
        confidentialAccount: 'SOME_ACCOUNT',
      };
      const mockTransactions = {
        blockHash: '0x1',
        txHash: '0x2',
        blockNumber: new BigNumber(1),
        tag: TxTags.confidentialAsset.MintConfidentialAsset,
      };
      const mockTransaction = new MockTransaction(mockTransactions);
      const mockAsset = createMockConfidentialAsset();

      jest.spyOn(service, 'findOne').mockResolvedValueOnce(mockAsset);

      mockTransactionsService.submit.mockResolvedValue({
        result: mockAsset,
        transactions: [mockTransaction],
      });

      const result = await service.issue(id, input);

      expect(result).toEqual({
        result: mockAsset,
        transactions: [mockTransaction],
      });
    });
  });

  describe('fetchOwner', () => {
    it('should return the owner of Confidential Account', async () => {
      const asset = createMockConfidentialAsset();
      const expectedResult: ConfidentialVenueFilteringDetails = {
        enabled: false,
      };
      asset.getVenueFilteringDetails.mockResolvedValue(expectedResult);

      jest.spyOn(service, 'findOne').mockResolvedValueOnce(asset);

      const result = await service.getVenueFilteringDetails(id);

      expect(result).toEqual(expectedResult);
    });
  });

  describe('setVenueFiltering', () => {
    it('should call the setVenueFiltering procedure and return the results', async () => {
      const mockTransactions = {
        blockHash: '0x1',
        txHash: '0x2',
        blockNumber: new BigNumber(1),
        tag: TxTags.confidentialAsset.SetVenueFiltering,
      };

      const mockTransaction = new MockTransaction(mockTransactions);
      const mockAsset = createMockConfidentialAsset();

      jest.spyOn(service, 'findOne').mockResolvedValue(mockAsset);

      mockTransactionsService.submit.mockResolvedValue({
        transactions: [mockTransaction],
      });

      let result = await service.setVenueFilteringDetails(id, { signer, enabled: true });

      expect(result).toEqual({
        transactions: [mockTransaction],
      });

      result = await service.setVenueFilteringDetails(id, {
        signer,
        allowedVenues: [new BigNumber(1)],
      });

      expect(result).toEqual({
        transactions: [mockTransaction],
      });

      result = await service.setVenueFilteringDetails(id, {
        signer,
        disallowedVenues: [new BigNumber(2)],
      });

      expect(result).toEqual({
        transactions: [mockTransaction],
      });
    });
  });

  describe('toggleFreezeConfidentialAsset', () => {
    it('should freeze/unfreeze a Confidential Asset', async () => {
      const input = {
        signer,
        processMode: ProcessMode.Submit,
      };
      const mockTransactions = {
        blockHash: '0x1',
        txHash: '0x2',
        blockNumber: new BigNumber(1),
        tag: TxTags.confidentialAsset.SetAssetFrozen,
      };
      const mockTransaction = new MockTransaction(mockTransactions);
      const mockAsset = createMockConfidentialAsset();

      jest.spyOn(service, 'findOne').mockResolvedValue(mockAsset);

      when(mockTransactionsService.submit)
        .calledWith(mockAsset.freeze, {}, input)
        .mockResolvedValue({
          transactions: [mockTransaction],
        });

      let result = await service.toggleFreezeConfidentialAsset(id, input, true);

      expect(result).toEqual({
        transactions: [mockTransaction],
      });

      when(mockTransactionsService.submit)
        .calledWith(mockAsset.unfreeze, {}, input)
        .mockResolvedValue({
          transactions: [mockTransaction],
        });

      result = await service.toggleFreezeConfidentialAsset(id, input, false);

      expect(result).toEqual({
        transactions: [mockTransaction],
      });
    });
  });

  describe('toggleFreezeConfidentialAccountAsset', () => {
    it('should freeze/unfreeze a Confidential Account from trading a Confidential Asset', async () => {
      const params = {
        confidentialAccount: 'SOME_PUBLIC_KEY',
      };
      const input = {
        signer,
        ...params,
      };
      const mockTransactions = {
        blockHash: '0x1',
        txHash: '0x2',
        blockNumber: new BigNumber(1),
        tag: TxTags.confidentialAsset.SetAccountAssetFrozen,
      };
      const mockTransaction = new MockTransaction(mockTransactions);
      const mockAsset = createMockConfidentialAsset();

      jest.spyOn(service, 'findOne').mockResolvedValue(mockAsset);

      when(mockTransactionsService.submit)
        .calledWith(mockAsset.freezeAccount, params, { signer, processMode: ProcessMode.Submit })
        .mockResolvedValue({
          transactions: [mockTransaction],
        });

      let result = await service.toggleFreezeConfidentialAccountAsset(id, input, true);

      expect(result).toEqual({
        transactions: [mockTransaction],
      });

      when(mockTransactionsService.submit)
        .calledWith(mockAsset.unfreezeAccount, params, { signer, processMode: ProcessMode.Submit })
        .mockResolvedValue({
          transactions: [mockTransaction],
        });

      result = await service.toggleFreezeConfidentialAccountAsset(id, input, false);

      expect(result).toEqual({
        transactions: [mockTransaction],
      });
    });
  });

  describe('isConfidentialAccountFrozen', () => {
    it('should return whether a given Confidential Account is frozen', async () => {
      const asset = createMockConfidentialAsset();
      asset.isAccountFrozen.mockResolvedValue(false);

      jest.spyOn(service, 'findOne').mockResolvedValue(asset);

      const result = await service.isConfidentialAccountFrozen(id, 'SOME_PUBLIC_KEY');

      expect(result).toEqual(false);
    });
  });

  describe('burnConfidentialAccount', () => {
    it('should burn the specified amount of Confidential Assets from given Confidential Account`', async () => {
      const params = {
        confidentialAccount: 'SOME_PUBLIC_KEY',
        amount: new BigNumber(100),
      };
      const input = {
        signer,
        ...params,
      };
      const mockTransactions = {
        blockHash: '0x1',
        txHash: '0x2',
        blockNumber: new BigNumber(1),
        tag: TxTags.confidentialAsset.Burn,
      };
      const mockTransaction = new MockTransaction(mockTransactions);
      const mockAsset = createMockConfidentialAsset();

      jest.spyOn(service, 'findOne').mockResolvedValue(mockAsset);

      const encryptedBalance = '0xencryptedbalance';
      when(mockConfidentialAccountsService.getAssetBalance)
        .calledWith(params.confidentialAccount, id)
        .mockResolvedValue({ balance: encryptedBalance, confidentialAsset: 'SOME_ASSET_ID' });

      const mockProof = 'some_proof';
      when(mockConfidentialProofsService.generateBurnProof)
        .calledWith(params.confidentialAccount, {
          amount: params.amount,
          encryptedBalance,
        })
        .mockResolvedValue(mockProof);

      when(mockTransactionsService.submit)
        .calledWith(
          mockAsset.burn,
          { ...params, proof: mockProof },
          { signer, processMode: ProcessMode.Submit }
        )
        .mockResolvedValue({
          result: mockAsset,
          transactions: [mockTransaction],
        });

      const result = await service.burnConfidentialAsset(id, input);

      expect(result).toEqual({
        result: mockAsset,
        transactions: [mockTransaction],
      });
    });
  });

  describe('createdAt', () => {
    it('should return creation event details for a Confidential Asset', async () => {
      const mockResult = {
        blockNumber: new BigNumber('2719172'),
        blockHash: 'someHash',
        blockDate: new Date('2023-06-26T01:47:45.000Z'),
        eventIndex: new BigNumber(1),
      };
      const asset = createMockConfidentialAsset();

      asset.createdAt.mockResolvedValue(mockResult);

      jest.spyOn(service, 'findOne').mockResolvedValue(asset);

      const result = await service.createdAt('SOME_ASSET_ID');

      expect(result).toEqual(mockResult);
    });
  });

  describe('transactionHistory', () => {
    it('should return transaction history of a Confidential Asset', async () => {
      const mockResult = {
        data: [
          {
            id: '',
            assetId: 'someId',
            amount: '10',
            eventId: EventIdEnum.TransactionExecuted,
            datetime: new Date(),
            createdBlockId: new BigNumber(3),
            blockNumber: new BigNumber('2719172'),
            blockHash: 'someHash',
            blockDate: new Date('2023-06-26T01:47:45.000Z'),
            eventIndex: new BigNumber(1),
          },
        ],
        next: '',
      };
      const asset = createMockConfidentialAsset();

      asset.getTransactionHistory.mockResolvedValue(mockResult);

      jest.spyOn(service, 'findOne').mockResolvedValue(asset);

      const result = await service.transactionHistory('SOME_ASSET_ID', new BigNumber(10));

      expect(result).toEqual(mockResult);
    });
  });
});
