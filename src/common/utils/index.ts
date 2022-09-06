import {
  BadRequestException,
  InternalServerErrorException,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import {
  ErrorCode,
  GenericPolymeshTransaction,
  ModuleName,
  NoArgsProcedureMethod,
  ProcedureMethod,
  ProcedureOpts,
  TxTags,
} from '@polymeshassociation/polymesh-sdk/types';
import {
  isPolymeshError,
  isPolymeshTransaction,
  isPolymeshTransactionBatch,
} from '@polymeshassociation/polymesh-sdk/utils';
import { flatten } from 'lodash';

import { BatchTransactionModel } from '~/common/models/batch-transaction.model';
import { TransactionModel } from '~/common/models/transaction.model';

export type TransactionResult<T> = {
  result: T;
  transactions: (TransactionModel | BatchTransactionModel)[];
};

type WithArgsProcedureMethod<T> = T extends NoArgsProcedureMethod<unknown, unknown> ? never : T;

export async function processTransaction<
  MethodArgs,
  ReturnType,
  TransformedReturnType = ReturnType
>(
  method: WithArgsProcedureMethod<ProcedureMethod<MethodArgs, ReturnType, TransformedReturnType>>,
  args: MethodArgs,
  opts: ProcedureOpts
): Promise<TransactionResult<TransformedReturnType>> {
  try {
    const tx = await method(args, opts);
    const result = await tx.run();

    const assembleTransactionResponse = <T, R = T>(
      transaction: GenericPolymeshTransaction<T, R>
    ): TransactionModel | BatchTransactionModel => {
      let tagDetails;
      if (isPolymeshTransaction(transaction)) {
        const { tag } = transaction;
        tagDetails = { transactionTag: tag };
      } else if (isPolymeshTransactionBatch(transaction)) {
        const { transactions } = transaction;
        tagDetails = {
          transactionTags: transactions.map(({ tag }) => tag),
        };
      } else {
        throw new Error(
          'Unsupported transaction details received. Please report this issue to the Polymesh team'
        );
      }
      const { blockHash, txHash, blockNumber } = transaction;
      const constructorParams = {
        /* eslint-disable @typescript-eslint/no-non-null-assertion */
        blockHash: blockHash!,
        transactionHash: txHash!,
        blockNumber: blockNumber!,
        ...tagDetails,
        /* eslint-enable @typescript-eslint/no-non-null-assertion */
      };

      if ('transactionTag' in constructorParams) {
        return new TransactionModel(constructorParams);
      }
      return new BatchTransactionModel(constructorParams);
    };

    return {
      result,
      transactions: [assembleTransactionResponse(tx)],
    };
  } catch (err) /* istanbul ignore next: not worth the trouble */ {
    if (isPolymeshError(err)) {
      const { message, code } = err;
      switch (code) {
        case ErrorCode.NoDataChange:
        case ErrorCode.ValidationError:
          throw new BadRequestException(message);
        case ErrorCode.InsufficientBalance:
        case ErrorCode.UnmetPrerequisite:
          throw new UnprocessableEntityException(message);
        case ErrorCode.DataUnavailable:
          throw new NotFoundException(message);
        default:
          throw new InternalServerErrorException(message);
      }
    }
    throw new InternalServerErrorException(err.message);
  }
}

/* istanbul ignore next */
export function getTxTags(): string[] {
  return flatten(Object.values(TxTags).map(txTag => Object.values(txTag)));
}

/* istanbul ignore next */
export function getTxTagsWithModuleNames(): string[] {
  const txTags = getTxTags();
  const moduleNames = Object.values(ModuleName);
  return [...moduleNames, ...txTags];
}
