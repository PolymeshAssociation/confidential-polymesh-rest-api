import { Controller, Get, NotFoundException, Param } from '@nestjs/common';
import {
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';

import { IdParamsDto } from '~/common/dto/id-params.dto';
import { EventIdentifierModel } from '~/common/models/event-identifier.model';
import { ConfidentialTransactionsService } from '~/confidential-transactions/confidential-transactions.service';

@ApiTags('confidential-transactions')
@Controller()
export class ConfidentialTransactionsMiddlewareController {
  constructor(private readonly confidentialTransactionsService: ConfidentialTransactionsService) {}

  @ApiOperation({
    summary: 'Get creation event data for a Confidential Transaction',
    description:
      'The endpoint retrieves the identifier data (block number, date and event index) of the event that was emitted when the given Confidential Transaction was created',
  })
  @ApiParam({
    name: 'id',
    description: 'The ID of the Confidential Transaction',
    type: 'string',
    example: '10',
  })
  @ApiOkResponse({
    description: 'Details of event where the Confidential Transaction was created',
    type: EventIdentifierModel,
  })
  @ApiNotFoundResponse({
    description: 'Data is not yet processed by the middleware',
  })
  @Get('confidential-transactions/:id/created-at')
  public async createdAt(@Param() { id }: IdParamsDto): Promise<EventIdentifierModel> {
    const result = await this.confidentialTransactionsService.createdAt(id);

    if (!result) {
      throw new NotFoundException(
        "Confidential Transaction's data hasn't yet been processed by the middleware"
      );
    }

    return new EventIdentifierModel(result);
  }
}
