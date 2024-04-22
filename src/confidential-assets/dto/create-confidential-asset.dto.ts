/* istanbul ignore file */

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsOptional, IsString } from 'class-validator';

import { IsDid } from '~/polymesh-rest-api/src/common/decorators/validation';
import { TransactionBaseDto } from '~/polymesh-rest-api/src/common/dto/transaction-base-dto';

export class CreateConfidentialAssetDto extends TransactionBaseDto {
  @ApiProperty({
    description: 'Custom data to be associated with the Confidential Asset',
    example: 'Some Random Data',
    type: 'string',
  })
  @IsString()
  readonly data: string;

  @ApiProperty({
    description:
      'List of ElGamal public keys required to be included for all proofs related to the asset. The related private keys will be able to decrypt all transactions involving the Confidential Asset',
    isArray: true,
    type: 'string',
    example: ['0x504aa5aa9f1e446e8f933eefb03c52f4bd6d47770892d5e18a1085ee2010a247'],
  })
  @IsArray()
  @IsString({ each: true })
  readonly auditors: string[];

  @ApiPropertyOptional({
    description: 'List of mediator DIDs for the Confidential Asset',
    isArray: true,
    type: 'string',
    example: ['0x0600000000000000000000000000000000000000000000000000000000000000'],
  })
  @IsOptional()
  @IsArray()
  @IsDid({ each: true })
  readonly mediators?: string[];
}
