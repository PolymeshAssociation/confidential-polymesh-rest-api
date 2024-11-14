/* istanbul ignore file */

import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import Joi from 'joi';

import { ConfidentialAccountsModule } from '~/confidential-accounts/confidential-accounts.module';
import { ConfidentialAssetsModule } from '~/confidential-assets/confidential-assets.module';
import { ConfidentialMiddlewareModule } from '~/confidential-middleware/confidential-middleware.module';
import { ConfidentialProofsModule } from '~/confidential-proofs/confidential-proofs.module';
import { ConfidentialTransactionsModule } from '~/confidential-transactions/confidential-transactions.module';
import { ExtendedIdentitiesModule } from '~/extended-identities/identities.module';
import { PolymeshModule } from '~/polymesh/polymesh.module';
import { AccountsModule } from '~/polymesh-rest-api/src/accounts/accounts.module';
import { AssetsModule } from '~/polymesh-rest-api/src/assets/assets.module';
import { AuthModule } from '~/polymesh-rest-api/src/auth/auth.module';
import { AuthStrategy } from '~/polymesh-rest-api/src/auth/strategies/strategies.consts';
import { AuthorizationsModule } from '~/polymesh-rest-api/src/authorizations/authorizations.module';
import { CheckpointsModule } from '~/polymesh-rest-api/src/checkpoints/checkpoints.module';
import { ClaimsModule } from '~/polymesh-rest-api/src/claims/claims.module';
import { AppConfigError } from '~/polymesh-rest-api/src/common/errors';
import { ComplianceModule } from '~/polymesh-rest-api/src/compliance/compliance.module';
import { CorporateActionsModule } from '~/polymesh-rest-api/src/corporate-actions/corporate-actions.module';
import { DeveloperTestingModule } from '~/polymesh-rest-api/src/developer-testing/developer-testing.module';
import { EventsModule } from '~/polymesh-rest-api/src/events/events.module';
import { IdentitiesModule } from '~/polymesh-rest-api/src/identities/identities.module';
import { ArtemisModule } from '~/polymesh-rest-api/src/message/artemis/artemis.module';
import { MetadataModule } from '~/polymesh-rest-api/src/metadata/metadata.module';
import { NetworkModule } from '~/polymesh-rest-api/src/network/network.module';
import { NftsModule } from '~/polymesh-rest-api/src/nfts/nfts.module';
import { NotificationsModule } from '~/polymesh-rest-api/src/notifications/notifications.module';
import { OfferingsModule } from '~/polymesh-rest-api/src/offerings/offerings.module';
import { OfflineRecorderModule } from '~/polymesh-rest-api/src/offline-recorder/offline-recorder.module';
import { OfflineSignerModule } from '~/polymesh-rest-api/src/offline-signer/offline-signer.module';
import { OfflineStarterModule } from '~/polymesh-rest-api/src/offline-starter/offline-starter.module';
import { OfflineSubmitterModule } from '~/polymesh-rest-api/src/offline-submitter/offline-submitter.module';
import { PortfoliosModule } from '~/polymesh-rest-api/src/portfolios/portfolios.module';
import { SettlementsModule } from '~/polymesh-rest-api/src/settlements/settlements.module';
import { SigningModule } from '~/polymesh-rest-api/src/signing/signing.module';
import { SubscriptionsModule } from '~/polymesh-rest-api/src/subscriptions/subscriptions.module';
import { SubsidyModule } from '~/polymesh-rest-api/src/subsidy/subsidy.module';
import { TickerReservationsModule } from '~/polymesh-rest-api/src/ticker-reservations/ticker-reservations.module';
import { UsersModule } from '~/polymesh-rest-api/src/users/users.module';
import { TransactionsModule } from '~/transactions/transactions.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      validationSchema: Joi.object({
        PORT: Joi.number().default(3000),
        POLYMESH_NODE_URL: Joi.string().required(),
        SUBSCRIPTIONS_TTL: Joi.number().default(60000),
        SUBSCRIPTIONS_MAX_HANDSHAKE_TRIES: Joi.number().default(5),
        SUBSCRIPTIONS_HANDSHAKE_RETRY_INTERVAL: Joi.number().default(5000),
        NOTIFICATIONS_MAX_TRIES: Joi.number().default(5),
        NOTIFICATIONS_RETRY_INTERVAL: Joi.number().default(5000),
        NOTIFICATIONS_LEGITIMACY_SECRET: Joi.string().default('defaultSecret'),
        LOCAL_SIGNERS: Joi.string().allow(''),
        LOCAL_MNEMONICS: Joi.string().allow(''),
        VAULT_TOKEN: Joi.string().allow(''),
        VAULT_URL: Joi.string().allow(''),
        DEVELOPER_SUDO_MNEMONIC: Joi.string().default('//Alice'),
        DEVELOPER_UTILS: Joi.bool().default(false),
        API_KEYS: Joi.string().default(''),
        AUTH_STRATEGY: Joi.string().default(() => {
          if (process.env.NODE_ENV === 'production') {
            throw new AppConfigError('AUTH_STRATEGY', 'must be set in a production environment');
          }
          console.warn('Defaulting to "open" for "AUTH_STRATEGY"');
          return AuthStrategy.Open;
        }),
        ARTEMIS_PORT: Joi.number().default(5672),
        ARTEMIS_HOST: Joi.string(),
        ARTEMIS_USERNAME: Joi.string(),
        ARTEMIS_PASSWORD: Joi.string(),
        PROOF_SERVER_API: Joi.string().default(''),
        PROOF_SERVER_URL: Joi.string().default(''),
      })
        .and('LOCAL_SIGNERS', 'LOCAL_MNEMONICS')
        .and('VAULT_TOKEN', 'VAULT_URL')
        .and('ARTEMIS_HOST', 'ARTEMIS_PASSWORD', 'ARTEMIS_USERNAME'),
    }),
    AssetsModule,
    TickerReservationsModule,
    PolymeshModule,
    IdentitiesModule,
    ExtendedIdentitiesModule,
    SettlementsModule,
    SigningModule,
    AuthorizationsModule,
    PortfoliosModule,
    ClaimsModule,
    OfferingsModule,
    CheckpointsModule,
    CorporateActionsModule,
    ComplianceModule,
    AccountsModule,
    SubscriptionsModule,
    TransactionsModule,
    EventsModule,
    NotificationsModule,
    ScheduleModule,
    NetworkModule,
    AuthModule,
    UsersModule,
    DeveloperTestingModule.register(),
    MetadataModule,
    SubsidyModule,
    NftsModule,
    ...(process.env.ARTEMIS_HOST
      ? [
          ArtemisModule,
          OfflineSignerModule,
          OfflineSubmitterModule,
          OfflineStarterModule,
          OfflineRecorderModule,
        ]
      : []),
    ConfidentialProofsModule.register(),
    ConfidentialAssetsModule,
    ConfidentialAccountsModule,
    ConfidentialTransactionsModule,
    ConfidentialMiddlewareModule.register(),
  ],
})
export class AppModule {}
