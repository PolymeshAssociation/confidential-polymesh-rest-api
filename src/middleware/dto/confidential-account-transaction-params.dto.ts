/* istanbul ignore file */

import { IsEnum } from 'class-validator';

import { PaginatedParamsDto } from '~/common/dto/paginated-params.dto';
import { ConfidentialTransactionDirectionEnum } from '~/common/types';

export class ConfidentialAccountTransactionsDto extends PaginatedParamsDto {
  @IsEnum(ConfidentialTransactionDirectionEnum)
  readonly direction: ConfidentialTransactionDirectionEnum;
}
