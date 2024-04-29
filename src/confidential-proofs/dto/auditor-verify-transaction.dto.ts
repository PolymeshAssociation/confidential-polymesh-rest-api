/* istanbul ignore file */

import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class AuditorVerifyTransactionDto {
  @ApiProperty({
    description:
      'The public key of the auditor to verify with. Any leg with a provided sender proof involving this auditor will be verified. The corresponding private must be present in the proof server',
    type: 'string',
    example: '0x7e9cf42766e08324c015f183274a9e977706a59a28d64f707e410a03563be77d',
  })
  @IsString()
  readonly auditorKey: string;
}
