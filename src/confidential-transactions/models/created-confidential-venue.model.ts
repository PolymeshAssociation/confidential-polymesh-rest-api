/* istanbul ignore file */

import { ApiProperty } from '@nestjs/swagger';
import { ConfidentialVenue } from '@polymeshassociation/polymesh-private-sdk/types';

import { FromEntity } from '~/polymesh-rest-api/src/common/decorators/transformation';
import { TransactionQueueModel } from '~/polymesh-rest-api/src/common/models/transaction-queue.model';

export class CreatedConfidentialVenueModel extends TransactionQueueModel {
  @ApiProperty({
    type: 'string',
    description: 'ID of the newly created Confidential Venue',
    example: '123',
  })
  @FromEntity()
  readonly confidentialVenue: ConfidentialVenue;

  constructor(model: CreatedConfidentialVenueModel) {
    const { transactions, details, ...rest } = model;
    super({ transactions, details });

    Object.assign(this, rest);
  }
}
