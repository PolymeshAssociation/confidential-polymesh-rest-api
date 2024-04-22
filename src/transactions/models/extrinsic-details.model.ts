/* istanbul ignore file */

import { ApiProperty } from '@nestjs/swagger';
import { ExtrinsicDataWithFees } from '@polymeshassociation/polymesh-private-sdk/types';
import { Type } from 'class-transformer';

import { ExtrinsicModel } from '~/polymesh-rest-api/src/common/models/extrinsic.model';
import { FeesModel } from '~/polymesh-rest-api/src/common/models/fees.model';

export class ExtrinsicDetailsModel extends ExtrinsicModel {
  @ApiProperty({
    description: 'Fee details for the transaction',
    type: FeesModel,
  })
  @Type(() => FeesModel)
  readonly fee: FeesModel;

  constructor(model: ExtrinsicDataWithFees) {
    const { fee, ...extrinsic } = model;
    super(extrinsic);

    this.fee = new FeesModel(fee);
  }
}
