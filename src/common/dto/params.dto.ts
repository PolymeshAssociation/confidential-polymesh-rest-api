/** istanbul ignore file */

import { AuthorizationType, ClaimType } from '@polymathnetwork/polymesh-sdk/types';
import { IsBoolean, IsEnum, IsOptional } from 'class-validator';

import { IsDid } from '~/common/decorators/validation';

export class DidDto {
  @IsDid()
  readonly did: string;
}

export class AuthorizationTypeDto {
  @IsEnum(AuthorizationType)
  @IsOptional()
  readonly type?: AuthorizationType;
}

export class ClaimTypeDto {
  @IsEnum(ClaimType, { each: true })
  @IsOptional()
  readonly claimTypes?: Exclude<ClaimType, ClaimType.InvestorUniquenessV2>[];
}

export class AuthorizationsFilterDto {
  @IsBoolean()
  @IsOptional()
  readonly includeExpired?: boolean;
}
