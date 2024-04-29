/* istanbul ignore file */

import { forwardRef, Module } from '@nestjs/common';

import { ConfidentialTransactionsModule } from '~/confidential-transactions/confidential-transactions.module';
import { ExtendedIdentitiesController } from '~/extended-identities/identities.controller';
import { ExtendedIdentitiesService } from '~/extended-identities/identities.service';
import { IdentitiesModule } from '~/polymesh-rest-api/src/identities/identities.module';

@Module({
  imports: [IdentitiesModule, forwardRef(() => ConfidentialTransactionsModule)],
  controllers: [ExtendedIdentitiesController],
  providers: [ExtendedIdentitiesService],
  exports: [ExtendedIdentitiesService],
})
export class ExtendedIdentitiesModule {}
