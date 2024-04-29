import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { PolymeshModule } from '~/polymesh/polymesh.module';
import { EventsModule } from '~/polymesh-rest-api/src/events/events.module';
import { LoggerModule } from '~/polymesh-rest-api/src/logger/logger.module';
import { NetworkModule } from '~/polymesh-rest-api/src/network/network.module';
import { OfflineStarterModule } from '~/polymesh-rest-api/src/offline-starter/offline-starter.module';
import { SigningModule } from '~/polymesh-rest-api/src/signing/signing.module';
import { SubscriptionsModule } from '~/polymesh-rest-api/src/subscriptions/subscriptions.module';
import transactionsConfig from '~/transactions/config/transactions.config';
import { TransactionsController } from '~/transactions/transactions.controller';
import { TransactionsService } from '~/transactions/transactions.service';

@Module({
  imports: [
    ConfigModule.forFeature(transactionsConfig),
    EventsModule,
    SigningModule,
    SubscriptionsModule,
    LoggerModule,
    NetworkModule,
    OfflineStarterModule,
    PolymeshModule,
  ],
  providers: [TransactionsService],
  exports: [TransactionsService],
  controllers: [TransactionsController],
})
export class TransactionsModule {}
