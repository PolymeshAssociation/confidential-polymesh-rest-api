/* istanbul ignore file */

import { createMock } from '@golevelup/ts-jest';
import { ValueProvider } from '@nestjs/common';

import { ConfidentialAccountsService } from '~/confidential-accounts/confidential-accounts.service';
import { ConfidentialAssetsService } from '~/confidential-assets/confidential-assets.service';
import { ConfidentialProofsService } from '~/confidential-proofs/confidential-proofs.service';
import { ConfidentialTransactionsService } from '~/confidential-transactions/confidential-transactions.service';
import {
  MockHttpService as MockHttpServiceRestApi,
  MockIdentitiesService as MockIdentitiesServiceRestApi,
} from '~/polymesh-rest-api/src/test-utils/service-mocks';

export * from '~/polymesh-rest-api/src/test-utils/service-mocks';

export class MockHttpService extends MockHttpServiceRestApi {
  request = jest.fn();
}

export class MockIdentitiesService extends MockIdentitiesServiceRestApi {
  getInvolvedConfidentialTransactions = jest.fn();
}

export const mockConfidentialAssetsServiceProvider: ValueProvider<ConfidentialAssetsService> = {
  provide: ConfidentialAssetsService,
  useValue: createMock<ConfidentialAssetsService>(),
};

export const mockConfidentialAccountsServiceProvider: ValueProvider<ConfidentialAccountsService> = {
  provide: ConfidentialAccountsService,
  useValue: createMock<ConfidentialAccountsService>(),
};

export const mockConfidentialTransactionsServiceProvider: ValueProvider<ConfidentialTransactionsService> =
  {
    provide: ConfidentialTransactionsService,
    useValue: createMock<ConfidentialTransactionsService>(),
  };

export const mockConfidentialProofsServiceProvider: ValueProvider<ConfidentialProofsService> = {
  provide: ConfidentialProofsService,
  useValue: createMock<ConfidentialProofsService>(),
};
