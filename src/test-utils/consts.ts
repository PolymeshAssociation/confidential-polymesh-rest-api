import { BigNumber } from '@polymeshassociation/polymesh-private-sdk';

import { BatchTransactionModel } from '~/polymesh-rest-api/src/common/models/batch-transaction.model';
import { TransactionModel } from '~/polymesh-rest-api/src/common/models/transaction.model';
import { TransactionType } from '~/polymesh-rest-api/src/common/types';

export * from '~/polymesh-rest-api/src/test-utils/consts';

export const getMockTransaction = (
  tag: string,
  type = TransactionType.Single
): TransactionModel | BatchTransactionModel => ({
  blockHash: '0x1',
  transactionHash: '0x2',
  blockNumber: new BigNumber(1),
  type,
  transactionTag: tag,
});
