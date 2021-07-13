/* istanbul ignore file */

import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import Joi from 'joi';

import { ClaimsModule } from '~/claims/claims.module';

import { IdentitiesModule } from './identities/identities.module';
import { PolymeshModule } from './polymesh/polymesh.module';
import { RelayerAccountsModule } from './relayer-accounts/relayer-accounts.module';
import { SettlementsModule } from './settlements/settlements.module';
import { TokensModule } from './tokens/tokens.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      validationSchema: Joi.object({
        PORT: Joi.number().default(3000),
        POLYMESH_NODE_URL: Joi.required(),
        POLYMESH_MIDDLEWARE_URL: Joi.string(),
        POLYMESH_MIDDLEWARE_API_KEY: Joi.string(),
      }).and('POLYMESH_MIDDLEWARE_URL', 'POLYMESH_MIDDLEWARE_API_KEY'),
    }),
    TokensModule,
    PolymeshModule,
    IdentitiesModule,
    SettlementsModule,
    RelayerAccountsModule,
    ClaimsModule,
  ],
})
export class AppModule {}
