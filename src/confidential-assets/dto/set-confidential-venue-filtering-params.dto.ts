/* istanbul ignore file */

import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean } from 'class-validator';

import { TransactionBaseDto } from '~/polymesh-rest-api/src/common/dto/transaction-base-dto';

export class SetConfidentialVenueFilteringParamsDto extends TransactionBaseDto {
  @ApiProperty({
    description: 'Indicator to enable/disable when filtering',
    type: 'boolean',
    example: false,
  })
  @IsBoolean()
  readonly enabled: boolean;
}
