/* istanbul ignore file */

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { BigNumber } from '@polymeshassociation/polymesh-private-sdk';

import { FromBigNumber } from '~/polymesh-rest-api/src/common/decorators/transformation';

export class AuditorVerifyProofModel {
  @ApiProperty({
    description: 'The leg ID for which this response relates to',
    type: 'string',
    example: '1',
  })
  @FromBigNumber()
  readonly legId: BigNumber;

  @ApiProperty({
    description: 'The asset ID for which this response relates to',
    type: 'string',
    example: '76702175-d8cb-e3a5-5a19-734433351e25',
  })
  readonly assetId: string;

  @ApiProperty({
    type: 'boolean',
    example: true,
    description:
      'Whether the sender has provided proof for the leg. If a proof has yet to be provided, then the amount being transferred has yet to be determined',
  })
  readonly isProved: boolean;

  @ApiProperty({
    type: 'boolean',
    example: true,
    description:
      'Whether is specified public key is an auditor for the related portion of the transaction. If not, then the given auditor is unable to decrypt the amount',
  })
  readonly isAuditor: boolean;

  @ApiProperty({
    description: 'Whether the specified public key is is the receiver for the transaction',
    type: 'boolean',
    example: false,
  })
  readonly isReceiver: boolean;

  @ApiProperty({
    description:
      'Whether the amount has been decrypted or not. If true the `amount` field will be present. Will be true if the leg has been proved and the specified key is either an auditor or the receiver',
    type: 'boolean',
    example: true,
  })
  readonly amountDecrypted: boolean;

  @ApiPropertyOptional({
    description:
      'The amount of the asset being transferred in this leg. Will only be present if sender has already submitted the proof and the provided auditor was specified',
    type: 'string',
    nullable: true,
    example: '100',
  })
  @FromBigNumber()
  readonly amount: BigNumber | null;

  @ApiPropertyOptional({
    description:
      'Whether the proof server determined to sender proof to be valid or not. Will only be present if the sender has already submitted the proof and the provided auditor was specified',
    type: 'string',
    nullable: true,
  })
  readonly isValid: boolean | null;

  @ApiPropertyOptional({
    description: 'The error message provided by the proof server, if one was returned',
    type: 'string',
    nullable: true,
  })
  readonly errMsg: string | null;

  constructor(model: AuditorVerifyProofModel) {
    Object.assign(this, model);
  }
}
