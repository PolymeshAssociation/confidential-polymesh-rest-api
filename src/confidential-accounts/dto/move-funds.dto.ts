/* istanbul ignore file */

import { ApiProperty } from '@nestjs/swagger';
import { IsArray } from 'class-validator';

import { FundMovesDto } from '~/confidential-accounts/dto/fund-moves.dto';
import { TransactionBaseDto } from '~/polymesh-rest-api/src/common/dto/transaction-base-dto';

export class MoveFundsDto extends TransactionBaseDto {
  @ApiProperty({
    description: 'Asset moves',
    type: FundMovesDto,
    isArray: true,
  })
  @IsArray()
  moves: FundMovesDto[];
}
