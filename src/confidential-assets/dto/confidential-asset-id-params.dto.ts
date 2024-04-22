/* istanbul ignore file */

import { IsConfidentialAssetId } from '~/confidential-assets/decorators/validation';

export class ConfidentialAssetIdParamsDto {
  @IsConfidentialAssetId()
  readonly confidentialAssetId: string;
}
