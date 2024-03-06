import { Controller, Get, NotFoundException, Param, Query } from '@nestjs/common';
import {
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { ConfidentialTransaction } from '@polymeshassociation/polymesh-private-sdk/internal';
import { BigNumber } from '@polymeshassociation/polymesh-sdk';

import { ApiArrayResponse } from '~/common/decorators/swagger';
import { PaginatedParamsDto } from '~/common/dto/paginated-params.dto';
import { EventIdentifierModel } from '~/common/models/event-identifier.model';
import { PaginatedResultsModel } from '~/common/models/paginated-results.model';
import { ConfidentialTransactionDirectionEnum } from '~/common/types';
import { ConfidentialAccountsService } from '~/confidential-accounts/confidential-accounts.service';
import { ConfidentialAccountParamsDto } from '~/confidential-accounts/dto/confidential-account-params.dto';
import { ConfidentialAssetsService } from '~/confidential-assets/confidential-assets.service';
import { ConfidentialAssetIdParamsDto } from '~/confidential-assets/dto/confidential-asset-id-params.dto';
import { ConfidentialAssetModel } from '~/confidential-assets/models/confidential-asset.model';
import { ConfidentialAssetTransactionModel } from '~/confidential-assets/models/confidential-asset-transaction.model';
import { ConfidentialAccountTransactionsDto } from '~/middleware/dto/confidential-account-transaction-params.dto';

@Controller()
export class ConfidentialAssetsMiddlewareController {
  constructor(
    private readonly confidentialAssetsService: ConfidentialAssetsService,
    private readonly confidentialAccountsService: ConfidentialAccountsService
  ) {}

  @ApiTags('confidential-assets')
  @ApiOperation({
    summary: 'Get creation event data for a Confidential Asset',
    description:
      'This endpoint will provide the basic details of an Confidential Asset along with the auditors information',
  })
  @ApiParam({
    name: 'confidentialAssetId',
    description: 'The ID of the Confidential Asset',
    type: 'string',
    example: '76702175-d8cb-e3a5-5a19-734433351e25',
  })
  @ApiOkResponse({
    description: 'Details of event where the Confidential Asset was created',
    type: EventIdentifierModel,
  })
  @ApiNotFoundResponse({
    description: 'Data is not yet processed by the middleware',
  })
  @Get('confidential-assets/:confidentialAssetId/created-at')
  public async createdAt(
    @Param() { confidentialAssetId }: ConfidentialAssetIdParamsDto
  ): Promise<EventIdentifierModel> {
    const result = await this.confidentialAssetsService.createdAt(confidentialAssetId);

    if (!result) {
      throw new NotFoundException(
        "Confidential Asset's data hasn't yet been processed by the middleware"
      );
    }

    return new EventIdentifierModel(result);
  }

  @ApiTags('confidential-accounts', 'confidential-assets')
  @ApiOperation({
    summary: 'Fetch all Confidential Assets held by a Confidential Account',
    description:
      'This endpoint returns a list of all Confidential Assets which were held at one point by the given Confidential Account',
  })
  @ApiParam({
    name: 'confidentialAccount',
    description: 'The public key of the Confidential Account',
    type: 'string',
    example: '0xdeadbeef00000000000000000000000000000000000000000000000000000000',
  })
  @ApiArrayResponse(ConfidentialAssetModel, {
    description: 'List of all the held Confidential Assets',
    paginated: true,
  })
  @Get('confidential-accounts/:confidentialAccount/held-confidential-assets')
  public async getHeldAssets(
    @Param() { confidentialAccount }: ConfidentialAccountParamsDto,
    @Query() { size, start }: PaginatedParamsDto
  ): Promise<PaginatedResultsModel<ConfidentialAssetModel>> {
    const { data, count, next } = await this.confidentialAccountsService.findHeldAssets(
      confidentialAccount,
      size,
      new BigNumber(start || 0)
    );

    return new PaginatedResultsModel({
      results: data.map(({ id }) => new ConfidentialAssetModel({ id })),
      total: count,
      next,
    });
  }

  @ApiTags('confidential-assets')
  @ApiOperation({
    summary: 'Get transaction history of a Confidential Asset',
    description: 'This endpoint provides a list of transactions involving a Confidential Asset',
  })
  @ApiParam({
    name: 'confidentialAssetId',
    description: 'The ID of the Confidential Asset',
    type: 'string',
    example: '76702175-d8cb-e3a5-5a19-734433351e25',
  })
  @ApiQuery({
    name: 'size',
    description: 'The number of transactions to be fetched',
    type: 'string',
    required: false,
    example: '10',
  })
  @ApiQuery({
    name: 'start',
    description: 'Start key from which transactions are to be fetched',
    type: 'string',
    required: false,
  })
  @ApiNotFoundResponse({
    description: 'The confidential asset was not found',
  })
  @Get('confidential-assets/:confidentialAssetId/transactions')
  async getTransactionHistory(
    @Param() { confidentialAssetId }: ConfidentialAssetIdParamsDto,
    @Query() { size, start }: PaginatedParamsDto
  ): Promise<PaginatedResultsModel<ConfidentialAssetTransactionModel>> {
    const { data, count, next } = await this.confidentialAssetsService.transactionHistory(
      confidentialAssetId,
      size,
      new BigNumber(start || 0)
    );

    return new PaginatedResultsModel({
      results: data.map(txHistory => new ConfidentialAssetTransactionModel(txHistory)),
      total: count,
      next,
    });
  }

  @ApiTags('confidential-accounts', 'confidential-transactions')
  @ApiOperation({
    summary: 'Get the transactions associated to a Confidential Account',
    description:
      'This endpoint provides a list of transactions associated to a Confidential Account',
  })
  @ApiParam({
    name: 'confidentialAccount',
    description: 'The public key of the Confidential Account',
    type: 'string',
    example: '0xdeadbeef00000000000000000000000000000000000000000000000000000000',
  })
  @ApiQuery({
    name: 'direction',
    description: 'The direction of the transactions with respect to the given Confidential Account',
    type: 'string',
    enum: ConfidentialTransactionDirectionEnum,
    example: ConfidentialTransactionDirectionEnum.All,
  })
  @ApiQuery({
    name: 'size',
    description: 'The number of transactions to be fetched',
    type: 'string',
    required: false,
    example: '10',
  })
  @ApiQuery({
    name: 'start',
    description: 'Start key from which transactions are to be fetched',
    type: 'string',
    required: false,
  })
  @ApiNotFoundResponse({
    description: 'The confidential account was not found',
  })
  @Get('confidential-accounts/:confidentialAccount/associated-transactions')
  async getAssociatedTransactions(
    @Param() { confidentialAccount }: ConfidentialAccountParamsDto,
    @Query() { size, start, direction }: ConfidentialAccountTransactionsDto
  ): Promise<PaginatedResultsModel<ConfidentialTransaction>> {
    const { data, count, next } = await this.confidentialAccountsService.getAssociatedTransactions(
      confidentialAccount,
      direction,
      size,
      new BigNumber(start || 0)
    );

    return new PaginatedResultsModel({
      results: data,
      total: count,
      next,
    });
  }
}
