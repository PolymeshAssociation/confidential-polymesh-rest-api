/* istanbul ignore file */

import { forwardRef, Module } from '@nestjs/common';

import { ConfidentialTransactionsModule } from '~/confidential-transactions/confidential-transactions.module';
import { ExtendedIdentitiesController } from '~/extended-identities/identities.controller';
import { ExtendedIdentitiesService } from '~/extended-identities/identities.service';
import { PolymeshModule } from '~/polymesh/polymesh.module';

@Module({
  imports: [PolymeshModule, forwardRef(() => ConfidentialTransactionsModule)],
  controllers: [ExtendedIdentitiesController],
  providers: [ExtendedIdentitiesService],
  exports: [ExtendedIdentitiesService],
})
export class ExtendedIdentitiesModule {}
