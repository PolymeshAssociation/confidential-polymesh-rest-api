import { Controller, Get, NotFoundException, Param, Query } from '@nestjs/common';
import {
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { BigNumber } from '@polymeshassociation/polymesh-private-sdk';

import { ConfidentialAssetsService } from '~/confidential-assets/confidential-assets.service';
import { ConfidentialAssetIdParamsDto } from '~/confidential-assets/dto/confidential-asset-id-params.dto';
import { ConfidentialAssetTransactionModel } from '~/confidential-assets/models/confidential-asset-transaction.model';
import { PaginatedParamsDto } from '~/polymesh-rest-api/src/common/dto/paginated-params.dto';
import { EventIdentifierModel } from '~/polymesh-rest-api/src/common/models/event-identifier.model';
import { PaginatedResultsModel } from '~/polymesh-rest-api/src/common/models/paginated-results.model';

@ApiTags('confidential-assets')
@Controller()
export class ConfidentialAssetsMiddlewareController {
  constructor(private readonly confidentialAssetsService: ConfidentialAssetsService) {}

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
}
