/* istanbul ignore file */

import { DynamicModule, forwardRef, Module } from '@nestjs/common';

import { ConfidentialAccountsModule } from '~/confidential-accounts/confidential-accounts.module';
import { ConfidentialAssetsModule } from '~/confidential-assets/confidential-assets.module';
import { ConfidentialTransactionsModule } from '~/confidential-transactions/confidential-transactions.module';
import { ConfidentialAccountsMiddlewareController } from '~/middleware/confidential-accounts-middleware/confidential-accounts-middleware.controller';
import { ConfidentialAssetsMiddlewareController } from '~/middleware/confidential-assets-middleware/confidential-assets-middleware.controller';
import { ConfidentialTransactionsMiddlewareController } from '~/middleware/confidential-transactions-middleware/confidential-transactions-middleware.controller';

@Module({
  controllers: [
    ConfidentialAccountsMiddlewareController,
    ConfidentialTransactionsMiddlewareController,
  ],
})
export class MiddlewareModule {
  static register(): DynamicModule {
    const controllers = [];

    const middlewareUrl = process.env.POLYMESH_MIDDLEWARE_V2_URL || '';

    if (middlewareUrl.length) {
      controllers.push(ConfidentialAssetsMiddlewareController);
      controllers.push(ConfidentialAccountsMiddlewareController);
      controllers.push(ConfidentialTransactionsMiddlewareController);
    }

    return {
      module: MiddlewareModule,
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
