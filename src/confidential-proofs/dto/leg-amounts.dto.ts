/* istanbul ignore file */

import { ApiProperty } from '@nestjs/swagger';
import { BigNumber } from '@polymeshassociation/polymesh-private-sdk';
import { Type } from 'class-transformer';
import { IsArray, ValidateNested } from 'class-validator';

import { ConfidentialLegAmountDto } from '~/confidential-transactions/dto/confidential-leg-amount.dto';
import { ToBigNumber } from '~/polymesh-rest-api/src/common/decorators/transformation';
import { IsBigNumber } from '~/polymesh-rest-api/src/common/decorators/validation';

export class LegAmountsDto {
  @ApiProperty({
    description: 'The leg ID the amounts are for',
    type: 'string',
    example: '1',
  })
  @IsBigNumber()
  @ToBigNumber()
  legId: BigNumber;

  @ApiProperty({
    description: 'Expected amounts for each of the assets in the leg',
    type: ConfidentialLegAmountDto,
    isArray: true,
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ConfidentialLegAmountDto)
  expectedAmounts: ConfidentialLegAmountDto[];
}
