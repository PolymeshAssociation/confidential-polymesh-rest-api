/* istanbul ignore file */

import { ApiProperty } from '@nestjs/swagger';
import { ConfidentialVenue } from '@polymeshassociation/polymesh-private-sdk/types';

import { FromEntityObject } from '~/polymesh-rest-api/src/common/decorators/transformation';

export class ConfidentialVenueFilteringDetailsModel {
  @ApiProperty({
    description: 'Indicates whether venue filtering is enabled or not',
    type: 'boolean',
    example: 'true',
  })
  readonly enabled: boolean;

  @ApiProperty({
    description:
      'List of allowed confidential Venues. This value is present only if `enabled` is true',
    type: 'string',
    example: ['1', '2'],
    isArray: true,
  })
  @FromEntityObject()
  readonly allowedConfidentialVenues?: ConfidentialVenue[];

  constructor(model: ConfidentialVenueFilteringDetailsModel) {
    Object.assign(this, model);
  }
}
