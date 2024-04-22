import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { ConfidentialVenue } from '@polymeshassociation/polymesh-private-sdk/types';

import { ConfidentialTransactionsService } from '~/confidential-transactions/confidential-transactions.service';
import { ConfidentialAffirmationModel } from '~/confidential-transactions/models/confidential-affirmation.model';
import { ExtendedIdentitiesService } from '~/extended-identities/identities.service';
import { ApiArrayResponse } from '~/polymesh-rest-api/src/common/decorators/swagger';
import { PaginatedParamsDto } from '~/polymesh-rest-api/src/common/dto/paginated-params.dto';
import { DidDto } from '~/polymesh-rest-api/src/common/dto/params.dto';
import { PaginatedResultsModel } from '~/polymesh-rest-api/src/common/models/paginated-results.model';
import { ResultsModel } from '~/polymesh-rest-api/src/common/models/results.model';

@ApiTags('identities')
@Controller('')
export class ExtendedIdentitiesController {
  constructor(
    private readonly identitiesService: ExtendedIdentitiesService,
    private readonly confidentialTransactionService: ConfidentialTransactionsService
  ) {}

  @ApiTags('confidential-venues')
  @ApiOperation({
    summary: 'Get all Confidential Venues owned by an Identity',
    description: 'This endpoint will provide list of confidential venues for an identity',
  })
  @ApiParam({
    name: 'did',
    description: 'The DID of the Identity whose Confidential Venues are to be fetched',
    type: 'string',
    example: '0x0600000000000000000000000000000000000000000000000000000000000000',
  })
  @ApiArrayResponse('string', {
    description: 'List of IDs of all owned Confidential Venues',
    paginated: false,
    example: ['1', '2', '3'],
  })
  @Get('identities/:did/confidential-venues')
  async getConfidentialVenues(@Param() { did }: DidDto): Promise<ResultsModel<ConfidentialVenue>> {
    const results = await this.confidentialTransactionService.findVenuesByOwner(did);
    return new ResultsModel({ results });
  }

  @ApiTags('confidential-transactions')
  @ApiOperation({
    summary: 'Get all Confidential Transaction affirmations involving an Identity',
  })
  @ApiParam({
    name: 'did',
    description: 'The DID of the Identity',
    type: 'string',
    example: '0x0600000000000000000000000000000000000000000000000000000000000000',
  })
  @ApiArrayResponse('string', {
    description: 'List of IDs of all owned Confidential Venues',
    paginated: false,
    example: ['1', '2', '3'],
  })
  @Get('identities/:did/involved-confidential-transactions')
  async getInvolvedConfidentialTransactions(
    @Param() { did }: DidDto,
    @Query() { size, start }: PaginatedParamsDto
  ): Promise<PaginatedResultsModel<ConfidentialAffirmationModel>> {
    const {
      data,
      count: total,
      next,
    } = await this.identitiesService.getInvolvedConfidentialTransactions(
      did,
      size,
      start?.toString()
    );

    return new PaginatedResultsModel({
      results: data.map(affirmation => new ConfidentialAffirmationModel(affirmation)),
      total,
      next,
    });
  }
}
