/* istanbul ignore file */

import { ApiProperty } from '@nestjs/swagger';
import { ConfidentialAsset } from '@polymeshassociation/polymesh-private-sdk/types';

import { FromEntity } from '~/polymesh-rest-api/src/common/decorators/transformation';
import { TransactionQueueModel } from '~/polymesh-rest-api/src/common/models/transaction-queue.model';

export class CreatedConfidentialAssetModel extends TransactionQueueModel {
  @ApiProperty({
    type: 'string',
    description: 'ID of the newly created confidential Asset',
    example: '123',
  })
  @FromEntity()
  readonly confidentialAsset: ConfidentialAsset;

  constructor(model: CreatedConfidentialAssetModel) {
    const { transactions, details, ...rest } = model;
    super({ transactions, details });

    Object.assign(this, rest);
  }
}
