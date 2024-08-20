/* istanbul ignore file */

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { BigNumber } from '@polymeshassociation/polymesh-private-sdk';

import { ConfidentialAssetBalanceModel } from '~/confidential-accounts/models/confidential-asset-balance.model';
import { FromBigNumber } from '~/polymesh-rest-api/src/common/decorators/transformation';

export class AppliedConfidentialAssetBalanceModel extends ConfidentialAssetBalanceModel {
  @ApiProperty({
    description: 'Encrypted amount of confidential Asset which was deposited',
    type: 'string',
    example:
      '0x289ebc384a263acd5820e03988dd17a3cd49ee57d572f4131e116b6bf4c70a1594447bb5d1e2d9cc62f083d8552dd90ec09b23a519b361e458d7fe1e48882261',
  })
  readonly amount: string;

  @ApiPropertyOptional({
    description: 'The decrypted amount of confidential asset which was deposited.',
    type: 'string',
    example: '100',
  })
  @FromBigNumber()
  readonly decryptedAmount?: BigNumber;

  @ApiPropertyOptional({
    description:
      'The decrypted balance for the confidential account after the deposit. Will be set if the proof server contains the key for the public account',
    type: 'string',
    example: '1000',
  })
  @FromBigNumber()
  readonly decryptedBalance?: BigNumber;

  constructor(model: AppliedConfidentialAssetBalanceModel) {
    const { amount, ...rest } = model;
    super(rest);
    Object.assign(this, { amount });
  }
}
