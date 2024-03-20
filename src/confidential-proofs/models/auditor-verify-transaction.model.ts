/* istanbul ignore file */

import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

import { AuditorVerifyProofModel } from '~/confidential-proofs/models/auditor-verify-proof.model';

export class AuditorVerifyTransactionModel {
  @ApiProperty({
    description: 'The verification status of each leg and asset',
    isArray: true,
    type: AuditorVerifyProofModel,
  })
  @Type(() => AuditorVerifyProofModel)
  readonly verifications: AuditorVerifyProofModel[];

  constructor(model: AuditorVerifyTransactionModel) {
    Object.assign(this, model);
  }
}
