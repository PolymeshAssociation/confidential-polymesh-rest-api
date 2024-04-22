/* istanbul ignore file */

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { BigNumber } from '@polymeshassociation/polymesh-private-sdk';
import { ConfidentialTransactionStatus } from '@polymeshassociation/polymesh-private-sdk/types';
import { Type } from 'class-transformer';

import { ConfidentialLegModel } from '~/confidential-transactions/models/confidential-leg.model';
import { FromBigNumber } from '~/polymesh-rest-api/src/common/decorators/transformation';

export class ConfidentialTransactionModel {
  @ApiProperty({
    description: 'The ID of the Confidential Transaction',
    type: 'string',
    example: '1',
  })
  @FromBigNumber()
  readonly id: BigNumber;

  @ApiProperty({
    description: 'ID of the Confidential Venue through which the settlement is handled',
    type: 'string',
    example: '123',
  })
  @FromBigNumber()
  readonly venueId: BigNumber;

  @ApiProperty({
    description: 'Block number at which the Confidential Transaction was created',
    type: 'string',
    example: '100000',
  })
  @FromBigNumber()
  readonly createdAt: BigNumber;

  @ApiProperty({
    description: 'The current status of the Confidential Transaction',
    type: 'string',
    enum: ConfidentialTransactionStatus,
    example: ConfidentialTransactionStatus.Pending,
  })
  readonly status: ConfidentialTransactionStatus;

  @ApiPropertyOptional({
    description: 'Identifier string provided while creating the Confidential Transaction',
    example: 'Transfer of GROWTH Asset',
  })
  readonly memo?: string;

  @ApiProperty({
    description: 'List of legs in the Confidential Transaction',
    type: ConfidentialLegModel,
    isArray: true,
  })
  @Type(() => ConfidentialLegModel)
  readonly legs: ConfidentialLegModel[];

  constructor(model: ConfidentialTransactionModel) {
    Object.assign(this, model);
  }
}
