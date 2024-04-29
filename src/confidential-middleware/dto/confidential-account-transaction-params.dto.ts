/* istanbul ignore file */

import { IsEnum } from 'class-validator';

import { ConfidentialTransactionDirectionEnum } from '~/confidential-transactions/types';
import { PaginatedParamsDto } from '~/polymesh-rest-api/src/common/dto/paginated-params.dto';

export class ConfidentialAccountTransactionsDto extends PaginatedParamsDto {
  @IsEnum(ConfidentialTransactionDirectionEnum)
  readonly direction: ConfidentialTransactionDirectionEnum;
}
