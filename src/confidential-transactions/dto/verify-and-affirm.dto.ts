/* istanbul ignore file */

import { ApiProperty } from '@nestjs/swagger';
import { BigNumber } from '@polymeshassociation/polymesh-private-sdk';
import { ConfidentialAffirmParty } from '@polymeshassociation/polymesh-private-sdk/types';
import { Type } from 'class-transformer';
import { ArrayMinSize, IsArray, IsEnum, IsHexadecimal, ValidateNested } from 'class-validator';

import { ConfidentialLegAmountDto } from '~/confidential-transactions/dto/confidential-leg-amount.dto';
import { ToBigNumber } from '~/polymesh-rest-api/src/common/decorators/transformation';
import { IsBigNumber } from '~/polymesh-rest-api/src/common/decorators/validation';
import { TransactionBaseDto } from '~/polymesh-rest-api/src/common/dto/transaction-base-dto';

export class VerifyAndAffirmDto extends TransactionBaseDto {
  @ApiProperty({
    description: 'Index of the leg to be affirmed in the Confidential Transaction',
    type: 'string',
    example: '1',
  })
  @IsBigNumber()
  @ToBigNumber()
  readonly legId: BigNumber;

  @ApiProperty({
    description: 'The public key to decrypt the leg amounts with',
    type: 'string',
    example: '0xdeadbeef00000000000000000000000000000000000000000000000000000000',
  })
  @IsHexadecimal()
  readonly publicKey: string;

  @ApiProperty({
    description:
      'The expected asset amounts for the leg. The correct amount for each asset the provided key will decrypt must be provided.',
    isArray: true,
    type: ConfidentialLegAmountDto,
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ConfidentialLegAmountDto)
  @ArrayMinSize(1, { message: 'At least one amount must be provided' })
  readonly expectedAmounts: ConfidentialLegAmountDto[];

  @ApiProperty({
    description: 'The party to affirm as',
    example: ConfidentialAffirmParty.Receiver,
    enum: ConfidentialAffirmParty,
  })
  @IsEnum(ConfidentialAffirmParty)
  readonly party: ConfidentialAffirmParty.Receiver | ConfidentialAffirmParty.Mediator;
}
