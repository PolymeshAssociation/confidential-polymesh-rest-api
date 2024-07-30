/* istanbul ignore file */

import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

import { AppliedConfidentialAssetBalanceModel } from '~/confidential-accounts/models/applied-confidential-asset-balance.model';
import { TransactionQueueModel } from '~/polymesh-rest-api/src/common/models/transaction-queue.model';

export class AppliedConfidentialAssetBalancesModel extends TransactionQueueModel {
  @ApiProperty({
    type: AppliedConfidentialAssetBalanceModel,
    isArray: true,
    description: 'List of all applied asset balances',
  })
  @Type(() => AppliedConfidentialAssetBalanceModel)
  readonly appliedAssetBalances: AppliedConfidentialAssetBalanceModel[];

  constructor(model: AppliedConfidentialAssetBalancesModel) {
    const { transactions, details, ...rest } = model;
    super({ transactions, details });

    Object.assign(this, rest);
  }
}
