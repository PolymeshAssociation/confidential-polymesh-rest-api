/* istanbul ignore file */

import { ApiProperty } from '@nestjs/swagger';

import { ConfidentialAssetBalanceModel } from '~/confidential-accounts/models/confidential-asset-balance.model';

export class AppliedConfidentialAssetBalanceModel extends ConfidentialAssetBalanceModel {
  @ApiProperty({
    description: 'Encrypted amount of confidential Asset which was deposited',
    type: 'string',
    example:
      '0x289ebc384a263acd5820e03988dd17a3cd49ee57d572f4131e116b6bf4c70a1594447bb5d1e2d9cc62f083d8552dd90ec09b23a519b361e458d7fe1e48882261',
  })
  readonly amount: string;

  constructor(model: AppliedConfidentialAssetBalanceModel) {
    const { amount, ...rest } = model;
    super(rest);
    Object.assign(this, { amount });
  }
}
