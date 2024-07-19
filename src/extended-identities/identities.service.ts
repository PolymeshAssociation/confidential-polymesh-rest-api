import { Injectable } from '@nestjs/common';
import { BigNumber } from '@polymeshassociation/polymesh-private-sdk';
import {
  ConfidentialAffirmation,
  ResultSet,
} from '@polymeshassociation/polymesh-private-sdk/types';

import { IdentitiesService } from '~/polymesh-rest-api/src/identities/identities.service';

@Injectable()
export class ExtendedIdentitiesService {
  constructor(private readonly identitiesService: IdentitiesService) {}

  public async getInvolvedConfidentialTransactions(
    did: string,
    size: BigNumber,
    start?: string
  ): Promise<ResultSet<ConfidentialAffirmation>> {
    const identity = await this.identitiesService.findOne(did);

    return identity.getInvolvedConfidentialTransactions({ size, start });
  }
}
