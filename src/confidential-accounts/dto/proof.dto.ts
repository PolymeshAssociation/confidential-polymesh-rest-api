/* istanbul ignore file */

import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

import { IsConfidentialAssetId } from '~/confidential-assets/decorators/validation';

export class ProofDto {
  @ApiProperty({
    description: 'The confidential Asset IDs to be moved.',
    type: 'string',
    isArray: true,
    example: ['76702175-d8cb-e3a5-5a19-734433351e25'],
  })
  @IsConfidentialAssetId()
  readonly asset: string;

  @ApiProperty({
    description: 'The Proof of the transaction',
    example: '0xdeadbeef00000000000000000000000000000000000000000000000000000000',
    type: 'string',
  })
  @IsString()
  readonly proof: string;
}
