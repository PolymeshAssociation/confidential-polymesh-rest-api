/* istanbul ignore file */

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { BigNumber } from '@polymeshassociation/polymesh-private-sdk';

import { FromBigNumber } from '~/common/decorators/transformation';

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
    description:
      'Wether the sender has provided proof for the leg. If a proof has yet to be provided, then the amount being transferred has yet to be determined',
  })
  readonly isProved: boolean;

  @ApiProperty({
    description:
      'Wether is specified public key is an auditor for the related portion of the transaction. If not, then the given auditor is unable to decrypt the amount',
  })
  readonly isAuditor: boolean;

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
      'Wether the proof server determined to sender proof to be valid or not. Will only be present if the sender has already submitted the proof and the provided auditor was specified',
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
