/* istanbul ignore file */

/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { applyDecorators } from '@nestjs/common';
import { Length, Matches, ValidationOptions } from 'class-validator';

import { ASSET_ID_LENGTH } from '~/confidential-assets/confidential-assets.consts';

export function IsConfidentialAssetId(validationOptions?: ValidationOptions) {
  return applyDecorators(
    Length(ASSET_ID_LENGTH, undefined, {
      ...validationOptions,
      message: `ID must be ${ASSET_ID_LENGTH} characters long`,
    }),
    Matches(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i, {
      ...validationOptions,
      message: 'ID is not a valid confidential Asset ID',
    })
  );
}
