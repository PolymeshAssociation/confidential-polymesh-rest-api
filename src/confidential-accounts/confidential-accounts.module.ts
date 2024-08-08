/* istanbul ignore file */

import { Module } from '@nestjs/common';

import { ConfidentialAccountsController } from '~/confidential-accounts/confidential-accounts.controller';
import { ConfidentialAccountsService } from '~/confidential-accounts/confidential-accounts.service';
import { ConfidentialProofsService } from '~/confidential-proofs/confidential-proofs.service';
import { PolymeshModule } from '~/polymesh/polymesh.module';
import { TransactionsModule } from '~/transactions/transactions.module';

@Module({
  imports: [PolymeshModule, TransactionsModule],
  controllers: [ConfidentialAccountsController],
  providers: [ConfidentialAccountsService, ConfidentialProofsService],
  exports: [ConfidentialAccountsService],
})
export class ConfidentialAccountsModule {}
