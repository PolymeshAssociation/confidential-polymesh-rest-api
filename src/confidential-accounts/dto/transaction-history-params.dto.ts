/* istanbul ignore file */

import { ApiPropertyOptional } from '@nestjs/swagger';
import { EventIdEnum } from '@polymeshassociation/polymesh-private-sdk/types';
import { IsOptional } from 'class-validator';

import { IsConfidentialAssetId } from '~/common/decorators/validation';
import { PaginatedParamsDto } from '~/common/dto/paginated-params.dto';

export class TransactionHistoryParamsDto extends PaginatedParamsDto {
  @ApiPropertyOptional({
    description:
      'Filter transaction history by Confidential Asset ID. <br /> If none specified, returns all transaction history entries for Confidential Account',
    type: 'string',
    example: '76702175-d8cb-e3a5-5a19-734433351e25',
  })
  @IsOptional()
  @IsConfidentialAssetId()
  readonly assetId?: string;

  @ApiPropertyOptional({
    description:
      'Filter transaction history by type. <br /> If none specified, returns all transaction history entries for Confidential Account',
    enum: [
      EventIdEnum.AccountDeposit,
      EventIdEnum.AccountWithdraw,
      EventIdEnum.AccountDepositIncoming,
    ],
    example: EventIdEnum.AccountDeposit,
  })
  @IsOptional()
  readonly eventId?:
    | EventIdEnum.AccountDeposit
    | EventIdEnum.AccountWithdraw
    | EventIdEnum.AccountDepositIncoming;
}
