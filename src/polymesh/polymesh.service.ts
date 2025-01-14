import { Inject, Injectable } from '@nestjs/common';
import { AddressOrPair, AugmentedSubmittable, SubmittableExtrinsic } from '@polkadot/api/types';
import { ISubmittableResult } from '@polkadot/types/types';
import { ConfidentialPolymesh as Polymesh } from '@polymeshassociation/polymesh-private-sdk';

import { POLYMESH_API } from '~/polymesh/polymesh.consts';
import {
  AppError,
  AppInternalError,
  AppValidationError,
} from '~/polymesh-rest-api/src/common/errors';
import { ScheduleService } from '~/polymesh-rest-api/src/schedule/schedule.service';

@Injectable()
export class PolymeshService {
  private heartbeatIntervalId = 'polymeshHeartbeat';

  constructor(
    @Inject(POLYMESH_API) public readonly polymeshApi: Polymesh,
    private readonly scheduleService: ScheduleService
  ) {
    scheduleService.addInterval(
      this.heartbeatIntervalId,
      () => {
        polymeshApi.network.getLatestBlock();
      },
      10000
    );

    /* istanbul ignore next: remove when this is replaced by a real service */
  }

  /**
   * @hidden
   * Allows for the execution of a transaction defined in the polkadot.js instance, bypassing the SDK.
   * SDK methods should be used instead of this where possible
   */
  public async execTransaction<Args extends unknown[]>(
    signer: AddressOrPair,
    tx: AugmentedSubmittable<(...args: Args) => SubmittableExtrinsic<'promise'>>,
    ...params: Args
  ): Promise<void> {
    const txName = tx.method;
    let unsub: Promise<() => void>;
    return new Promise((resolve, reject) => {
      unsub = tx(...params).signAndSend(signer, { nonce: -1 }, (receipt: ISubmittableResult) => {
        const { status } = receipt;
        if (status.isInBlock) {
          this.handlePolkadotErrors(receipt, txName, reject);
          resolve('ok');
        }
      }) as Promise<() => void>;
    }).then(async () => {
      (await unsub)();
    });
  }

  private handlePolkadotErrors(
    receipt: ISubmittableResult,
    method: string,
    reject: (reason: AppError) => void
  ): void {
    const hasError = !!receipt.findRecord('system', 'ExtrinsicFailed') || receipt.isError;
    if (hasError) {
      let exception: AppError;
      if (method === 'mockCddRegisterDid') {
        exception = new AppValidationError(
          'Unable to create mock Identity. Perhaps the address is already linked to an Identity or mock CDD claims are unable to be made on the chain'
        );
      } else if (method === 'sudo') {
        exception = new AppInternalError(
          'Unable to execute a sudo transaction. Perhaps the signer lacks permission'
        );
      } else {
        exception = new AppInternalError('Unable to process the request');
      }
      reject(exception);
    }
  }

  /* istanbul ignore next: not worth the trouble */
  public close(): Promise<void> {
    const { polymeshApi, scheduleService, heartbeatIntervalId } = this;
    scheduleService.deleteInterval(heartbeatIntervalId);
    return polymeshApi.disconnect();
  }
}
