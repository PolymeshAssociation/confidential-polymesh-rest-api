import { Injectable } from '@nestjs/common';

import { ArtemisService } from '~/artemis/artemis.service';
import { AddressName, QueueName } from '~/common/utils/amqp';
import { PolymeshLogger } from '~/logger/polymesh-logger.service';
import { OfflineSignatureModel } from '~/offline-signer/models/offline-signature.model';
import { OfflineTxModel } from '~/offline-submitter/models/offline-tx.model';
import { SigningService } from '~/signing/services';

/**
 * Takes a transaction from the queue, and requests a signature from a signing manager
 */
@Injectable()
export class OfflineSignerService {
  constructor(
    private readonly artemisService: ArtemisService,
    private readonly signingService: SigningService,
    private readonly logger: PolymeshLogger
  ) {
    this.logger.setContext(OfflineSignerService.name);

    this.artemisService.registerListener(
      QueueName.Requests,
      /* istanbul ignore next */
      msg => this.autoSign(msg),
      OfflineTxModel
    );
  }

  public async autoSign(body: OfflineTxModel): Promise<void> {
    const { id: transactionId } = body;
    this.logger.debug(`received request for signature: ${transactionId}`);

    const payload = body.payload;

    const signature = await this.signingService.signPayload(payload.payload);

    const model = new OfflineSignatureModel({ signature, id: body.id, payload });

    this.logger.log(`signed transaction: ${transactionId}`);
    await this.artemisService.sendMessage(AddressName.Signatures, model);
  }
}