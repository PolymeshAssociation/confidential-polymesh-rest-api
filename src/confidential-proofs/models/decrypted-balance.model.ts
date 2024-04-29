/* istanbul ignore file */

import { ApiProperty } from '@nestjs/swagger';
import { BigNumber } from '@polymeshassociation/polymesh-private-sdk';

import { FromBigNumber } from '~/polymesh-rest-api/src/common/decorators/transformation';

export class DecryptedBalanceModel {
  @ApiProperty({
    description: 'Decrypted balance value',
    type: 'string',
    example: '100',
  })
  @FromBigNumber()
  readonly value: BigNumber;

  constructor(model: DecryptedBalanceModel) {
    Object.assign(this, model);
  }
}
