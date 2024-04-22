/* istanbul ignore file */

import { DynamicModule, forwardRef, Module } from '@nestjs/common';

import { ConfidentialAccountsModule } from '~/confidential-accounts/confidential-accounts.module';
import { ConfidentialAssetsModule } from '~/confidential-assets/confidential-assets.module';
import { ConfidentialAccountsMiddlewareController } from '~/confidential-middleware/confidential-accounts-middleware/confidential-accounts-middleware.controller';
import { ConfidentialAssetsMiddlewareController } from '~/confidential-middleware/confidential-assets-middleware/confidential-assets-middleware.controller';
import { ConfidentialTransactionsMiddlewareController } from '~/confidential-middleware/confidential-transactions-middleware/confidential-transactions-middleware.controller';
import { ConfidentialTransactionsModule } from '~/confidential-transactions/confidential-transactions.module';

@Module({})
export class ConfidentialMiddlewareModule {
  static register(): DynamicModule {
    const controllers = [];

    const middlewareUrl = process.env.POLYMESH_MIDDLEWARE_V2_URL || '';

    if (middlewareUrl.length) {
      controllers.push(ConfidentialAssetsMiddlewareController);
      controllers.push(ConfidentialAccountsMiddlewareController);
      controllers.push(ConfidentialTransactionsMiddlewareController);
    }

    return {
      module: ConfidentialMiddlewareModule,
      imports: [
        forwardRef(() => ConfidentialAssetsModule),
        forwardRef(() => ConfidentialAccountsModule),
        forwardRef(() => ConfidentialTransactionsModule),
      ],
      controllers,
      providers: [],
      exports: [],
    };
  }
}
