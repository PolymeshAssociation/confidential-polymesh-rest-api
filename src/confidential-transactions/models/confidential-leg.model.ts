/* istanbul ignore file */

import { ApiProperty } from '@nestjs/swagger';
import { BigNumber } from '@polymeshassociation/polymesh-private-sdk';
import { Type } from 'class-transformer';

import { ConfidentialAccountModel } from '~/confidential-accounts/models/confidential-account.model';
import { ConfidentialAssetAuditorModel } from '~/confidential-transactions/models/confidential-asset-auditor.model';
import { IdentityModel } from '~/extended-identities/models/identity.model';
import { FromBigNumber } from '~/polymesh-rest-api/src/common/decorators/transformation';

export class ConfidentialLegModel {
  @ApiProperty({
    description: 'The index of this leg in the Confidential Transaction',
    type: 'string',
    example: '1',
  })
  @FromBigNumber()
  readonly id: BigNumber;

  @ApiProperty({
    description: 'Confidential Account from which the transfer is to be made',
    type: ConfidentialAccountModel,
  })
  @Type(() => ConfidentialAccountModel)
  readonly sender: ConfidentialAccountModel;

  @ApiProperty({
    description: 'Confidential Account to which the transfer is to be made',
    type: ConfidentialAccountModel,
  })
  @Type(() => ConfidentialAccountModel)
  readonly receiver: ConfidentialAccountModel;

  @ApiProperty({
    description: 'List of mediator identities configured for this leg',
    type: IdentityModel,
    isArray: true,
  })
  @Type(() => IdentityModel)
  readonly mediators: IdentityModel[];

  @ApiProperty({
    description:
      'Auditor Confidential Accounts for the leg, grouped by asset they are auditors for',
    type: ConfidentialAssetAuditorModel,
    isArray: true,
  })
  @Type(() => ConfidentialAssetAuditorModel)
  readonly assetAuditors: ConfidentialAssetAuditorModel[];

  constructor(model: ConfidentialLegModel) {
    Object.assign(this, model);
  }
}
