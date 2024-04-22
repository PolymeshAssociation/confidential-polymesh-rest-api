/* istanbul ignore file */

import { ApiProperty } from '@nestjs/swagger';

export class IdentityModel {
  @ApiProperty({
    type: 'string',
    example: '0x0600000000000000000000000000000000000000000000000000000000000000',
    description: 'Unique Identity identifier (DID: Decentralized IDentity)',
  })
  readonly did: string;

  constructor(model: IdentityModel) {
    Object.assign(this, model);
  }
}
