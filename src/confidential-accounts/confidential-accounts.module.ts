/* istanbul ignore file */

import { forwardRef, Module } from '@nestjs/common';

import { ConfidentialAccountsController } from '~/confidential-accounts/confidential-accounts.controller';
import { ConfidentialAccountsService } from '~/confidential-accounts/confidential-accounts.service';
import { ConfidentialAssetsModule } from '~/confidential-assets/confidential-assets.module';
import { ConfidentialProofsModule } from '~/confidential-proofs/confidential-proofs.module';
import { PolymeshModule } from '~/polymesh/polymesh.module';
import { TransactionsModule } from '~/transactions/transactions.module';

@Module({
  imports: [
    PolymeshModule,
    TransactionsModule,
    forwardRef(() => ConfidentialProofsModule.register()),
    forwardRef(() => ConfidentialAssetsModule),
  ],
  controllers: [ConfidentialAccountsController],
  providers: [ConfidentialAccountsService],
  exports: [ConfidentialAccountsService],
})
export class ConfidentialAccountsModule {}
