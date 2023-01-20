/* istanbul ignore file */

import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class GetTransactionsDto {
  @ApiPropertyOptional({
    description: 'Account address involved in transactions',
    example: '0x0600000000000000000000000000000000000000000000000000000000000000',
  })
  @IsOptional()
  @IsString()
  readonly account?: string;

  @ApiPropertyOptional({
    description: 'Asset ticker for which the transactions were made',
    example: '123',
  })
  @IsOptional()
  @IsString()
  readonly ticker?: string;
}
