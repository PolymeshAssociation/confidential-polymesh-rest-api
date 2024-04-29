import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiNotFoundResponse, ApiOperation, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';
import { BigNumber } from '@polymeshassociation/polymesh-private-sdk';
import { ConfidentialTransaction } from '@polymeshassociation/polymesh-private-sdk/internal';

import { ConfidentialAccountsService } from '~/confidential-accounts/confidential-accounts.service';
import { ConfidentialAccountParamsDto } from '~/confidential-accounts/dto/confidential-account-params.dto';
import { ConfidentialAssetModel } from '~/confidential-assets/models/confidential-asset.model';
import { ConfidentialAccountTransactionsDto } from '~/confidential-middleware/dto/confidential-account-transaction-params.dto';
import { ConfidentialTransactionDirectionEnum } from '~/confidential-transactions/types';
import { ApiArrayResponse } from '~/polymesh-rest-api/src/common/decorators/swagger';
import { PaginatedParamsDto } from '~/polymesh-rest-api/src/common/dto/paginated-params.dto';
import { PaginatedResultsModel } from '~/polymesh-rest-api/src/common/models/paginated-results.model';

@ApiTags('confidential-accounts')
@Controller()
export class ConfidentialAccountsMiddlewareController {
  constructor(private readonly confidentialAccountsService: ConfidentialAccountsService) {}

  @ApiTags('confidential-assets')
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

  @ApiTags('confidential-transactions')
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
