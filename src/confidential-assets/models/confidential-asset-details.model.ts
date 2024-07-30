/* istanbul ignore file */

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { BigNumber } from '@polymeshassociation/polymesh-private-sdk';
import { Identity } from '@polymeshassociation/polymesh-private-sdk/types';
import { Type } from 'class-transformer';

import { ConfidentialAccountModel } from '~/confidential-accounts/models/confidential-account.model';
import { IdentityModel } from '~/extended-identities/models/identity.model';
import {
  FromBigNumber,
  FromEntity,
} from '~/polymesh-rest-api/src/common/decorators/transformation';

export class ConfidentialAssetDetailsModel {
  @ApiProperty({
    description: 'The DID of the Confidential Asset owner',
    type: 'string',
    example: '0x0600000000000000000000000000000000000000000000000000000000000000',
  })
  @FromEntity()
  readonly owner: Identity;

  @ApiProperty({
    description: 'Custom data associated with the Confidential Asset',
    type: 'string',
    example: 'Random Data',
  })
  readonly data: string;

  @ApiProperty({
    description: 'Total supply count of the Asset',
    type: 'string',
    example: '1000',
  })
  @FromBigNumber()
  readonly totalSupply: BigNumber;

  @ApiProperty({
    description: 'Whether trading is frozen for the Confidential Asset',
    type: 'boolean',
    example: true,
  })
  readonly isFrozen: boolean;

  @ApiProperty({
    description: 'Auditor Confidential Accounts configured for the Confidential Asset',
    type: ConfidentialAccountModel,
    isArray: true,
  })
  @Type(() => ConfidentialAccountModel)
  readonly auditors: ConfidentialAccountModel[];

  @ApiPropertyOptional({
    description: 'Mediator Identities configured for the Confidential Asset',
    type: IdentityModel,
    isArray: true,
  })
  @Type(() => IdentityModel)
  readonly mediators?: IdentityModel[];

  constructor(model: ConfidentialAssetDetailsModel) {
    Object.assign(this, model);
  }
}
