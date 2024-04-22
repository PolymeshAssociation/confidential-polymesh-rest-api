/* istanbul ignore file */

import { ApiProperty } from '@nestjs/swagger';
import { BigNumber } from '@polymeshassociation/polymesh-private-sdk';

import { IsConfidentialAssetId } from '~/confidential-assets/decorators/validation';
import { ToBigNumber } from '~/polymesh-rest-api/src/common/decorators/transformation';
import { IsBigNumber } from '~/polymesh-rest-api/src/common/decorators/validation';

export class ConfidentialLegAmountDto {
  @ApiProperty({
    description: 'Then Confidential Asset ID whose amount is being specified',
    type: 'string',
    example: '76702175-d8cb-e3a5-5a19-734433351e25',
  })
  @IsConfidentialAssetId()
  readonly confidentialAsset: string;

  @ApiProperty({
    description: 'Amount to be transferred',
    type: 'string',
    example: '1000',
  })
  @ToBigNumber()
  @IsBigNumber({ min: 0 })
  readonly amount: BigNumber;
}
