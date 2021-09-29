import { Injectable } from '@nestjs/common';
import { ClaimData, ClaimType, ResultSet, Scope } from '@polymathnetwork/polymesh-sdk/types';

import { PolymeshService } from '~/polymesh/polymesh.service';

@Injectable()
export class ClaimsService {
  constructor(private readonly polymeshService: PolymeshService) {}

  public async findIssuedByDid(
    target: string,
    includeExpired?: boolean,
    size?: number,
    start?: number
  ): Promise<ResultSet<ClaimData>> {
    return await this.polymeshService.polymeshApi.claims.getIssuedClaims({
      target,
      includeExpired,
      size,
      start,
    });
  }

  public async findAssociatedByDid(
    target: string,
    scope?: Scope,
    claimTypes?: Exclude<ClaimType, ClaimType.InvestorUniquenessV2>[],
    includeExpired?: boolean,
    size?: number,
    start?: number
  ): Promise<ResultSet<ClaimData>> {
    const identitiesWithClaims = await this.polymeshService.polymeshApi.claims.getIdentitiesWithClaims(
      {
        targets: [target],
        scope,
        claimTypes,
        includeExpired,
        size,
        start,
      }
    );
    return {
      data: identitiesWithClaims.data?.[0].claims || [],
      next: identitiesWithClaims.next,
      count: identitiesWithClaims.count,
    };
  }
}