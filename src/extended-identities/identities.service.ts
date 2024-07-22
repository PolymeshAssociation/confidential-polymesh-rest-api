import { Injectable } from '@nestjs/common';
import { BigNumber } from '@polymeshassociation/polymesh-private-sdk';
import {
  ConfidentialAffirmation,
  Identity,
  ResultSet,
} from '@polymeshassociation/polymesh-private-sdk/types';

import { PolymeshService } from '~/polymesh/polymesh.service';
import { handleSdkError } from '~/transactions/transactions.util';

@Injectable()
export class ExtendedIdentitiesService {
  constructor(private readonly polymeshService: PolymeshService) {}

  /**
   * Method to get identity for a specific did
   */
  public async findOne(did: string): Promise<Identity> {
    const {
      polymeshService: { polymeshApi },
    } = this;
    return await polymeshApi.identities.getIdentity({ did }).catch(error => {
      throw handleSdkError(error);
    });
  }

  public async getInvolvedConfidentialTransactions(
    did: string,
    size: BigNumber,
    start?: string
  ): Promise<ResultSet<ConfidentialAffirmation>> {
    const identity = await this.findOne(did);

    return identity.getInvolvedConfidentialTransactions({ size, start });
  }
}
