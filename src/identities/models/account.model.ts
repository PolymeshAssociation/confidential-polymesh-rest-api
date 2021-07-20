/* istanbul ignore file */

import { ApiProperty } from '@nestjs/swagger';
import { SignerType } from '@polymathnetwork/polymesh-sdk/types';

import { SignerModel } from '~/identities/models/signer.model';

export class AccountModel extends SignerModel {
  @ApiProperty({
    type: 'string',
  })
  readonly address: string;

  constructor(model?: AccountModel) {
    super({ signerType: SignerType.Account });
    Object.assign(this, model);
  }
}
