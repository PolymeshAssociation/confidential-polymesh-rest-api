import { Test } from '@nestjs/testing';
import { BigNumber } from '@polymathnetwork/polymesh-sdk';
import { AuthorizationType } from '@polymathnetwork/polymesh-sdk/types';

import { AuthorizationsModule } from '~/authorizations/authorizations.module';
import { AuthorizationsService } from '~/authorizations/authorizations.service';
import { ResultsModel } from '~/common/models/results.model';
import { IdentitiesService } from '~/identities/identities.service';
import { IdentityModel } from '~/identities/models/identity.model';
import { POLYMESH_API } from '~/polymesh/polymesh.consts';
import { PolymeshModule } from '~/polymesh/polymesh.module';
import { PolymeshService } from '~/polymesh/polymesh.service';
import { PortfolioModel } from '~/portfolios/models/portfolio.model';
import { PortfoliosModule } from '~/portfolios/portfolios.module';
import { PortfoliosService } from '~/portfolios/portfolios.service';
import { SettlementsService } from '~/settlements/settlements.service';
import { MockIdentityClass, MockPolymeshClass, MockPortfolio } from '~/test-utils/mocks';
import { TokensService } from '~/tokens/tokens.service';

import { IdentitiesController } from './identities.controller';

describe('IdentitiesController', () => {
  let controller: IdentitiesController;
  let mockPolymeshApi: MockPolymeshClass;
  const mockTokensService = {
    findAllByOwner: jest.fn(),
  };

  const mockSettlementsService = {
    findPendingInstructionsByDid: jest.fn(),
  };

  const mockIdentitiesService = {
    findOne: jest.fn(),
  };

  const mockAuthorizationsService = {
    getPendingByDid: jest.fn(),
    getIssuedByDid: jest.fn(),
  };

  const mockPortfoliosService = {
    findAllByOwner: jest.fn(),
  };

  let polymeshService: PolymeshService;

  beforeEach(async () => {
    mockPolymeshApi = new MockPolymeshClass();
    const module = await Test.createTestingModule({
      controllers: [IdentitiesController],
      imports: [PolymeshModule, PortfoliosModule, AuthorizationsModule],
      providers: [TokensService, SettlementsService, IdentitiesService],
    })
      .overrideProvider(POLYMESH_API)
      .useValue(mockPolymeshApi)
      .overrideProvider(TokensService)
      .useValue(mockTokensService)
      .overrideProvider(SettlementsService)
      .useValue(mockSettlementsService)
      .overrideProvider(IdentitiesService)
      .useValue(mockIdentitiesService)
      .overrideProvider(PortfoliosService)
      .useValue(mockPortfoliosService)
      .overrideProvider(AuthorizationsService)
      .useValue(mockAuthorizationsService)
      .compile();

    controller = module.get<IdentitiesController>(IdentitiesController);
    polymeshService = module.get<PolymeshService>(PolymeshService);
  });

  afterEach(async () => {
    await polymeshService.close();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getTokens', () => {
    it("should return the Identity's Tokens", async () => {
      const tokens = ['FOO', 'BAR', 'BAZ'];
      mockTokensService.findAllByOwner.mockResolvedValue(tokens);

      const result = await controller.getTokens({ did: '0x1' });

      expect(result).toEqual({ results: tokens });
    });
  });

  describe('getPendingInstructions', () => {
    it("should return the Identity's pending Instructions", async () => {
      const expectedInstructions = ['1', '2', '3'];
      mockSettlementsService.findPendingInstructionsByDid.mockResolvedValue(expectedInstructions);

      const result = await controller.getPendingInstructions({ did: '0x1' });

      expect(result).toEqual({ results: expectedInstructions });
    });
  });

  describe('getIdentityDetails', () => {
    it("should return the Identity's details", async () => {
      const did = '0x6'.padEnd(66, '0');

      const mockIdentityDetails = new IdentityModel({
        did,
        primaryKey: '5GNWrbft4pJcYSak9tkvUy89e2AKimEwHb6CKaJq81KHEj8e',
        secondaryKeysFrozen: false,
        secondaryKeys: [],
      });

      const mockIdentity = new MockIdentityClass();
      mockIdentity.did = did;
      mockIdentity.getPrimaryKey.mockResolvedValue(
        '5GNWrbft4pJcYSak9tkvUy89e2AKimEwHb6CKaJq81KHEj8e'
      );
      mockIdentity.areSecondaryKeysFrozen.mockResolvedValue(false);
      mockIdentity.getSecondaryKeys.mockResolvedValue([]);
      mockIdentitiesService.findOne.mockResolvedValue(mockIdentity);

      const result = await controller.getIdentityDetails({ did });

      expect(result).toEqual(mockIdentityDetails);
    });
  });

  describe('getPendingAuthorizations', () => {
    it('should return list of pending authorizations received by identity', async () => {
      const did = '0x6'.padEnd(66, '0');
      const pendingAuthorization = {
        authId: new BigNumber(2236),
        issuer: {
          primaryKey: '5GNWrbft4pJcYSak9tkvUy89e2AKimEwHb6CKaJq81KHEj8e',
          did,
        },
        data: {
          type: AuthorizationType.TransferTicker,
          value: 'FOO',
        },
        expiry: null,
      };

      mockAuthorizationsService.getPendingByDid.mockResolvedValue([pendingAuthorization]);
      const result = await controller.getPendingAuthorizations({ did }, {}, {});
      expect(result).toEqual(new ResultsModel({ results: [pendingAuthorization] }));
    });

    it('should support filtering pending authorizations by authorization type', async () => {
      const did = '0x6'.padEnd(66, '0');
      mockAuthorizationsService.getPendingByDid.mockResolvedValue([]);
      const result = await controller.getPendingAuthorizations(
        { did },
        { type: AuthorizationType.JoinIdentity },
        {}
      );
      expect(result).toEqual(new ResultsModel({ results: [] }));
    });

    it('should support filtering pending authorizations by whether they have expired or not', async () => {
      const did = '0x6'.padEnd(66, '0');
      mockAuthorizationsService.getPendingByDid.mockResolvedValue([]);
      const result = await controller.getPendingAuthorizations(
        { did },
        {},
        { includeExpired: false }
      );
      expect(result).toEqual(new ResultsModel({ results: [] }));
    });
  });

  describe('getIssuedAuthorizations', () => {
    it('should return list of authorizations issued by an identity', async () => {
      const did = '0x6'.padEnd(66, '0');
      const mockRequestedAuthorizations = { next: undefined, results: [], total: 0 };
      mockAuthorizationsService.getIssuedByDid.mockResolvedValue({
        data: [],
        count: 0,
      });
      const result = await controller.getIssuedAuthorizations({ did }, { size: 1 });
      expect(result).toEqual(mockRequestedAuthorizations);
    });
  });

  describe('getPortfolios', () => {
    it('should return list of all portfolios of an identity', async () => {
      const did = '0x6'.padEnd(66, '0');
      const mockPortfolio = new MockPortfolio();
      mockPortfolio.getTokenBalances.mockResolvedValue([]);
      mockPortfolio.getCustodian.mockResolvedValue({ did });
      mockPortfolio.getName.mockResolvedValue('P-1');
      mockPortfoliosService.findAllByOwner.mockResolvedValue([mockPortfolio]);

      const mockDetails = new PortfolioModel({
        id: new BigNumber(1),
        name: 'P-1',
        tokenBalances: [],
      });
      const result = await controller.getPortfolios({ did });

      expect(result).toEqual(new ResultsModel({ results: [mockDetails] }));
    });
  });
});
