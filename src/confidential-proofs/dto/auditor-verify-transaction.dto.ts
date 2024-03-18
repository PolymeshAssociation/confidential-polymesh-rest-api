import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class AuditorVerifyTransactionDto {
  @ApiProperty({
    description:
      'The public key of the auditor to verify with. Any leg with a provided sender proof involving this auditor will be verified. The corresponding private must be present in the proof server',
  })
  @IsString()
  readonly auditorKey: string;
}
