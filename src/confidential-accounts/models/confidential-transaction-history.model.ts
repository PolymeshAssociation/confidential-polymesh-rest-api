/* istanbul ignore file */

import { ApiProperty } from '@nestjs/swagger';
import { EventIdEnum } from '@polymeshassociation/polymesh-private-sdk/types';

export class ConfidentialTransactionHistoryModel {
  @ApiProperty({
    description: 'The ID of the confidential Asset',
    type: 'string',
    example: '76702175-d8cb-e3a5-5a19-734433351e25',
  })
  readonly assetId: string;

  @ApiProperty({
    description: 'The encrypted amount ',
    type: 'string',
    example:
      '0x46247c432a2632d23644aab44da0457506cbf7e712cea7158eeb4324f932161b54b44b6e87ca5028099745482c1ef3fc9901ae760a08f925c8e68c1511f6f77e',
  })
  readonly amount: string;

  @ApiProperty({
    description:
      'The type of transaction. Possible values "AccountWithdraw", "AccountDeposit", "AccountDepositIncoming"',
    type: 'string',
    example: 'AccountWithdraw',
  })
  readonly eventId: EventIdEnum;

  @ApiProperty({
    description: 'Date at which the transaction was added to chain',
    type: 'string',
    example: new Date('05/23/2021').toISOString(),
    nullable: true,
  })
  readonly createdAt?: Date;

  constructor(model: ConfidentialTransactionHistoryModel) {
    Object.assign(this, model);
  }
}
