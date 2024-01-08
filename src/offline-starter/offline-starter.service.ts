import { Injectable } from '@nestjs/common';
import { BigNumber } from '@polymeshassociation/polymesh-sdk';
import { GenericPolymeshTransaction } from '@polymeshassociation/polymesh-sdk/types';
import { randomUUID } from 'crypto';

import { ArtemisService } from '~/artemis/artemis.service';
import { AddressName } from '~/common/utils/amqp';
import { PolymeshLogger } from '~/logger/polymesh-logger.service';
import { OfflineReceiptModel } from '~/offline-starter/models/offline-receipt.model';

@Injectable()
export class OfflineStarterService {
  constructor(
    private readonly artemisService: ArtemisService,
    private readonly logger: PolymeshLogger
  ) {}

  /**
   * Begins offline transaction processing by placing signablePayload onto the queue
   */
  public async beginTransaction<ReturnType, TransformedReturnType>(
    transaction: GenericPolymeshTransaction<ReturnType, TransformedReturnType>,
    metadata?: Record<string, string>
  ): Promise<OfflineReceiptModel> {
    const internalTxId = this.generateTxId();

    const payload = await transaction.toSignablePayload({ ...metadata, internalTxId });
    const topicName = AddressName.Requests;

    this.logger.debug(`sending topic: ${topicName}`, topicName);
    const delivery = await this.artemisService.sendMessage(topicName, {
      id: internalTxId,
      payload,
    });

    const model = new OfflineReceiptModel({
      deliveryId: new BigNumber(delivery.id),
      payload: payload.payload,
      metadata: payload.metadata,
      topicName,
    });

    return model;
  }

  /**
   * generates internal book keeping fields
   */
  private generateTxId(): string {
    return randomUUID();
  }
}
