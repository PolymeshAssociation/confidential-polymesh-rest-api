/* istanbul ignore file */

import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

import { TransactionQueueModel } from '~/common/models/transaction-queue.model';
import { ConfidentialProofModel } from '~/confidential-transactions/models/confidential-proof.model';

export class SenderAffirmationModel extends TransactionQueueModel {
  @ApiPropertyOptional({
    description: 'The proof generated',
    type: ConfidentialProofModel,
  })
  @Type(() => ConfidentialProofModel)
  readonly proofs: ConfidentialProofModel[];

  constructor(model: SenderAffirmationModel) {
    const { transactions, details, ...rest } = model;
    super({ transactions, details });

    Object.assign(this, rest);
  }
}
