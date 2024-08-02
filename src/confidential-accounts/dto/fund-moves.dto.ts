/* istanbul ignore file */

import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsString } from 'class-validator';

import { ProofDto } from '~/confidential-accounts/dto/proof.dto';

export class FundMovesDto {
  @ApiProperty({
    description: 'The Confidential Account from which to move the funds from',
    example: '0xdeadbeef00000000000000000000000000000000000000000000000000000000',
    type: 'string',
  })
  @IsString()
  readonly from: string;

  @ApiProperty({
    description: 'The Confidential Account to which to move the funds to',
    example: '0xdeadbeef00000000000000000000000000000000000000000000000000000000',
    type: 'string',
  })
  @IsString()
  readonly to: string;

  @ApiProperty({
    description: 'Proofs of the transaction',
    type: ProofDto,
    isArray: true,
  })
  @IsArray()
  proofs: ProofDto[];
}
