/* istanbul ignore file */

import { ApiProperty } from '@nestjs/swagger';
import { BigNumber } from '@polymeshassociation/polymesh-private-sdk';
import { ConfidentialAffirmParty } from '@polymeshassociation/polymesh-private-sdk/types';
import { IsEnum } from 'class-validator';

import { ToBigNumber } from '~/polymesh-rest-api/src/common/decorators/transformation';
import { IsBigNumber } from '~/polymesh-rest-api/src/common/decorators/validation';
import { TransactionBaseDto } from '~/polymesh-rest-api/src/common/dto/transaction-base-dto';

export class ObserverAffirmConfidentialTransactionDto extends TransactionBaseDto {
  @ApiProperty({
    description: 'Index of the leg to be affirmed in the Confidential Transaction',
    type: 'string',
    example: '1',
  })
  @ToBigNumber()
  @IsBigNumber()
  readonly legId: BigNumber;

  @ApiProperty({
    description: 'Affirming party',
    example: ConfidentialAffirmParty.Receiver,
  })
  @IsEnum(ConfidentialAffirmParty)
  readonly party: ConfidentialAffirmParty.Receiver | ConfidentialAffirmParty.Mediator;
}
