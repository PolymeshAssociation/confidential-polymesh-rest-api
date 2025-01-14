import { Body, Controller, Get, HttpStatus, Param, Post } from '@nestjs/common';
import {
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiUnprocessableEntityResponse,
} from '@nestjs/swagger';
import { ConfidentialAsset } from '@polymeshassociation/polymesh-private-sdk/types';

import { ConfidentialAccountParamsDto } from '~/confidential-accounts/dto/confidential-account-params.dto';
import { ConfidentialAssetsService } from '~/confidential-assets/confidential-assets.service';
import { createConfidentialAssetDetailsModel } from '~/confidential-assets/confidential-assets.util';
import { AddAllowedConfidentialVenuesDto } from '~/confidential-assets/dto/add-allowed-confidential-venues.dto';
import { ConfidentialAssetIdParamsDto } from '~/confidential-assets/dto/confidential-asset-id-params.dto';
import { CreateConfidentialAssetDto } from '~/confidential-assets/dto/create-confidential-asset.dto';
import { IssueConfidentialAssetDto } from '~/confidential-assets/dto/issue-confidential-asset.dto';
import { RemoveAllowedConfidentialVenuesDto } from '~/confidential-assets/dto/remove-allowed-confidential-venues.dto';
import { SetConfidentialVenueFilteringParamsDto } from '~/confidential-assets/dto/set-confidential-venue-filtering-params.dto';
import { ToggleFreezeConfidentialAccountAssetDto } from '~/confidential-assets/dto/toggle-freeze-confidential-account-asset.dto';
import { ConfidentialAssetDetailsModel } from '~/confidential-assets/models/confidential-asset-details.model';
import { ConfidentialVenueFilteringDetailsModel } from '~/confidential-assets/models/confidential-venue-filtering-details.model';
import { CreatedConfidentialAssetModel } from '~/confidential-assets/models/created-confidential-asset.model';
import {
  ApiTransactionFailedResponse,
  ApiTransactionResponse,
} from '~/polymesh-rest-api/src/common/decorators/';
import { TransactionBaseDto } from '~/polymesh-rest-api/src/common/dto/transaction-base-dto';
import { TransactionQueueModel } from '~/polymesh-rest-api/src/common/models/transaction-queue.model';
import {
  handleServiceResult,
  TransactionResolver,
  TransactionResponseModel,
} from '~/polymesh-rest-api/src/common/utils/functions';

@ApiTags('confidential-assets')
@Controller('confidential-assets')
export class ConfidentialAssetsController {
  constructor(private readonly confidentialAssetsService: ConfidentialAssetsService) {}

  @ApiOperation({
    summary: 'Fetch Confidential Asset details',
    description:
      'This endpoint will provide the basic details of an Confidential Asset along with the auditors information',
  })
  @ApiParam({
    name: 'confidentialAssetId',
    description: 'The ID of the Confidential Asset whose details are to be fetched',
    type: 'string',
    example: '76702175-d8cb-e3a5-5a19-734433351e25',
  })
  @ApiOkResponse({
    description: 'Basic details of the Asset',
    type: ConfidentialAssetDetailsModel,
  })
  @Get(':confidentialAssetId')
  public async getDetails(
    @Param() { confidentialAssetId }: ConfidentialAssetIdParamsDto
  ): Promise<ConfidentialAssetDetailsModel> {
    const asset = await this.confidentialAssetsService.findOne(confidentialAssetId);

    return createConfidentialAssetDetailsModel(asset);
  }

  @ApiOperation({
    summary: 'Create a Confidential Asset',
    description: 'This endpoint allows for the creation of a new Confidential Asset',
  })
  @ApiTransactionResponse({
    description: 'Details about the newly created Confidential Asset',
    type: CreatedConfidentialAssetModel,
  })
  @ApiUnprocessableEntityResponse({
    description: 'One or more auditors do not exists',
  })
  @Post('create')
  public async createConfidentialAsset(
    @Body() params: CreateConfidentialAssetDto
  ): Promise<TransactionResponseModel> {
    const result = await this.confidentialAssetsService.createConfidentialAsset(params);

    const resolver: TransactionResolver<ConfidentialAsset> = ({
      result: confidentialAsset,
      transactions,
      details,
    }) =>
      new CreatedConfidentialAssetModel({
        confidentialAsset,
        details,
        transactions,
      });

    return handleServiceResult(result, resolver);
  }

  @ApiOperation({
    summary: 'Issue more of a Confidential Asset',
    description:
      'This endpoint issues more of a given Confidential Asset into a specified Confidential Account',
  })
  @ApiParam({
    name: 'confidentialAssetId',
    description: 'The ID of the Confidential Asset to be issued',
    type: 'string',
    example: '76702175-d8cb-e3a5-5a19-734433351e25',
  })
  @ApiTransactionFailedResponse({
    [HttpStatus.UNPROCESSABLE_ENTITY]: [
      'Amount is not greater than zero',
      'The signer cannot issue the Assets in the given account',
      'Issuance operation will total supply to exceed the supply limit',
    ],
    [HttpStatus.NOT_FOUND]: ['The Confidential Asset does not exists'],
  })
  @Post(':confidentialAssetId/issue')
  public async issueConfidentialAsset(
    @Param() { confidentialAssetId }: ConfidentialAssetIdParamsDto,
    @Body() params: IssueConfidentialAssetDto
  ): Promise<TransactionResponseModel> {
    const result = await this.confidentialAssetsService.issue(confidentialAssetId, params);
    return handleServiceResult(result);
  }

  @ApiOperation({
    summary: 'Get venue filtering details',
    description: 'This endpoint will return the venue filtering details for a Confidential Asset',
  })
  @ApiParam({
    name: 'confidentialAssetId',
    description: 'The ID of the Confidential Asset',
    type: 'string',
    example: '76702175-d8cb-e3a5-5a19-734433351e25',
  })
  @ApiOkResponse({
    description: 'Venue filtering details',
    type: ConfidentialVenueFilteringDetailsModel,
  })
  @Get(':confidentialAssetId/venue-filtering')
  public async getVenueFilteringDetails(
    @Param() { confidentialAssetId }: ConfidentialAssetIdParamsDto
  ): Promise<ConfidentialVenueFilteringDetailsModel> {
    const details = await this.confidentialAssetsService.getVenueFilteringDetails(
      confidentialAssetId
    );

    const { enabled, allowedConfidentialVenues } = {
      allowedConfidentialVenues: undefined,
      ...details,
    };

    return new ConfidentialVenueFilteringDetailsModel({ enabled, allowedConfidentialVenues });
  }

  @ApiOperation({
    summary: 'Enable/disable confidential Venue filtering',
    description:
      'This endpoint enables/disables confidential venue filtering for a given Confidential Asset',
  })
  @ApiParam({
    name: 'confidentialAssetId',
    description: 'The ID of the Confidential Asset',
    type: 'string',
    example: '76702175-d8cb-e3a5-5a19-734433351e25',
  })
  @ApiTransactionFailedResponse({
    [HttpStatus.NOT_FOUND]: ['The Confidential Asset does not exists'],
  })
  @Post(':confidentialAssetId/venue-filtering')
  public async toggleConfidentialVenueFiltering(
    @Param() { confidentialAssetId }: ConfidentialAssetIdParamsDto,
    @Body() params: SetConfidentialVenueFilteringParamsDto
  ): Promise<TransactionResponseModel> {
    const result = await this.confidentialAssetsService.setVenueFilteringDetails(
      confidentialAssetId,
      params
    );

    return handleServiceResult(result);
  }

  @ApiOperation({
    summary: 'Add a list of Confidential Venues for Confidential Asset transactions',
    description:
      'This endpoint adds additional Confidential Venues to existing list of Confidential Venues allowed to handle transfer of the given Confidential Asset',
  })
  @ApiParam({
    name: 'confidentialAssetId',
    description: 'The ID of the Confidential Asset',
    type: 'string',
    example: '76702175-d8cb-e3a5-5a19-734433351e25',
  })
  @ApiTransactionFailedResponse({
    [HttpStatus.NOT_FOUND]: ['The Confidential Asset does not exists'],
  })
  @Post(':confidentialAssetId/venue-filtering/add-allowed-venues')
  public async addAllowedVenues(
    @Param() { confidentialAssetId }: ConfidentialAssetIdParamsDto,
    @Body() params: AddAllowedConfidentialVenuesDto
  ): Promise<TransactionResponseModel> {
    const { confidentialVenues: allowedVenues, ...rest } = params;
    const result = await this.confidentialAssetsService.setVenueFilteringDetails(
      confidentialAssetId,
      {
        ...rest,
        allowedVenues,
      }
    );

    return handleServiceResult(result);
  }

  @ApiOperation({
    summary: 'Remove a list of Confidential Venues for Confidential Asset transactions',
    description:
      'This endpoint removes the given list of Confidential Venues (if present), from the existing list of allowed Confidential Venues for Confidential Asset Transaction',
  })
  @ApiParam({
    name: 'confidentialAssetId',
    description: 'The ID of the Confidential Asset',
    type: 'string',
    example: '76702175-d8cb-e3a5-5a19-734433351e25',
  })
  @ApiTransactionFailedResponse({
    [HttpStatus.NOT_FOUND]: ['The Confidential Asset does not exists'],
  })
  @Post(':confidentialAssetId/venue-filtering/remove-allowed-venues')
  public async removeAllowedVenues(
    @Param() { confidentialAssetId }: ConfidentialAssetIdParamsDto,
    @Body() params: RemoveAllowedConfidentialVenuesDto
  ): Promise<TransactionResponseModel> {
    const { confidentialVenues: disallowedVenues, ...rest } = params;

    const result = await this.confidentialAssetsService.setVenueFilteringDetails(
      confidentialAssetId,
      {
        ...rest,
        disallowedVenues,
      }
    );

    return handleServiceResult(result);
  }

  @ApiOperation({
    summary: 'Freeze all trading for a Confidential Asset',
    description:
      'This endpoint freezes all trading for a Confidential Asset. Note, only the owner of the Confidential asset can perform this operation',
  })
  @ApiTransactionResponse({
    description: 'Details about the transaction',
    type: TransactionQueueModel,
  })
  @ApiTransactionFailedResponse({
    [HttpStatus.BAD_REQUEST]: [
      'Asset is already frozen',
      'The signing identity is not the owner of the Confidential Asset',
    ],
  })
  @Post(':confidentialAssetId/freeze')
  async freezeConfidentialAsset(
    @Param() { confidentialAssetId }: ConfidentialAssetIdParamsDto,
    @Body() body: TransactionBaseDto
  ): Promise<TransactionResponseModel> {
    const result = await this.confidentialAssetsService.toggleFreezeConfidentialAsset(
      confidentialAssetId,
      body,
      true
    );

    return handleServiceResult(result);
  }

  @ApiOperation({
    summary: 'Resume (unfreeze) all trading for a Confidential Asset',
    description:
      'This endpoint resumes all trading for a freezed Confidential Asset. Note, only the owner of the Confidential asset can perform this operation',
  })
  @ApiTransactionResponse({
    description: 'Details about the transaction',
    type: TransactionQueueModel,
  })
  @ApiTransactionFailedResponse({
    [HttpStatus.BAD_REQUEST]: [
      'Asset is already unfrozen',
      'The signing identity is not the owner of the Confidential Asset',
    ],
  })
  @Post(':confidentialAssetId/unfreeze')
  async unfreezeConfidentialAsset(
    @Param() { confidentialAssetId }: ConfidentialAssetIdParamsDto,
    @Body() body: TransactionBaseDto
  ): Promise<TransactionResponseModel> {
    const result = await this.confidentialAssetsService.toggleFreezeConfidentialAsset(
      confidentialAssetId,
      body,
      false
    );

    return handleServiceResult(result);
  }

  @ApiOperation({
    summary: 'Freeze trading for a specific Confidential Account for a Confidential Asset',
    description:
      'This endpoint freezes trading for a specific Confidential Account for a freezed Confidential Asset. Note, only the owner of the Confidential asset can perform this operation',
  })
  @ApiTransactionResponse({
    description: 'Details about the transaction',
    type: TransactionQueueModel,
  })
  @ApiTransactionFailedResponse({
    [HttpStatus.BAD_REQUEST]: [
      'Account is already frozen',
      'The signing identity is not the owner of the Confidential Asset',
    ],
  })
  @Post(':confidentialAssetId/freeze-account')
  async freezeConfidentialAccount(
    @Param() { confidentialAssetId }: ConfidentialAssetIdParamsDto,
    @Body() body: ToggleFreezeConfidentialAccountAssetDto
  ): Promise<TransactionResponseModel> {
    const result = await this.confidentialAssetsService.toggleFreezeConfidentialAccountAsset(
      confidentialAssetId,
      body,
      true
    );

    return handleServiceResult(result);
  }

  @ApiOperation({
    summary:
      'Resume (unfreeze) trading for a specific Confidential Account for a Confidential Asset',
    description:
      'This endpoint resumes trading for a specific Confidential Account for a freezed Confidential Asset. Note, only the owner of the Confidential asset can perform this operation',
  })
  @ApiTransactionResponse({
    description: 'Details about the transaction',
    type: TransactionQueueModel,
  })
  @ApiTransactionFailedResponse({
    [HttpStatus.BAD_REQUEST]: [
      'Confidential Account is already unfrozen',
      'The signing identity is not the owner of the Confidential Asset',
    ],
  })
  @Post(':confidentialAssetId/unfreeze-account')
  async unfreezeConfidentialAccount(
    @Param() { confidentialAssetId }: ConfidentialAssetIdParamsDto,
    @Body() body: ToggleFreezeConfidentialAccountAssetDto
  ): Promise<TransactionResponseModel> {
    const result = await this.confidentialAssetsService.toggleFreezeConfidentialAccountAsset(
      confidentialAssetId,
      body,
      false
    );

    return handleServiceResult(result);
  }

  @ApiOperation({
    summary:
      'Check whether trading for a Confidential Asset is frozen for a specific Confidential Account',
  })
  @ApiParam({
    name: 'confidentialAssetId',
    description: 'The ID of the Confidential Asset',
    type: 'string',
    example: '76702175-d8cb-e3a5-5a19-734433351e25',
  })
  @ApiParam({
    name: 'confidentialAccount',
    description: 'The public key of the Confidential Account',
    type: 'string',
    example: '0xdeadbeef00000000000000000000000000000000000000000000000000000000',
  })
  @ApiOkResponse({
    description: 'Indicator to know if the Confidential Account is frozen or not',
    type: 'boolean',
  })
  @ApiNotFoundResponse({
    description: 'The Confidential Asset does not exists',
  })
  @Get(':confidentialAssetId/freeze-account/:confidentialAccount')
  async isConfidentialAccountFrozen(
    @Param()
    {
      confidentialAssetId,
      confidentialAccount,
    }: ConfidentialAssetIdParamsDto & ConfidentialAccountParamsDto
  ): Promise<boolean> {
    return this.confidentialAssetsService.isConfidentialAccountFrozen(
      confidentialAssetId,
      confidentialAccount
    );
  }
}
