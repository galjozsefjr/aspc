import { Controller, Get, NotFoundException, Param, Put } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import {
  StockSymbolImpl,
  StockSymbolRequest,
  SymbolWithMovingAverage,
} from './stock.types';
import { StockService } from './stock.service';

@ApiTags('Stock')
@Controller('/stock')
export class StockController {
  constructor(private stockService: StockService) {}

  @ApiOperation({
    operationId: 'getSymbol',
    summary: 'Symbol data',
    description:
      'Returns the stock price, last updated time and moving average for a given symbol',
  })
  @ApiOkResponse({ type: SymbolWithMovingAverage })
  @ApiBadRequestResponse({ description: 'Invalid symbol' })
  @ApiNotFoundResponse({
    description: 'The selected symbol does not exists',
  })
  @Get('/:symbol')
  async getSymbol(@Param() { symbol: symbolId }: StockSymbolRequest) {
    const symbol = await this.stockService.getSymbol(symbolId);
    if (!symbol) {
      throw new NotFoundException(`Cannot find symbol: "${symbolId}"`);
    }
    const movingAverage = await this.stockService.getMovingAverage(symbol);
    if (!movingAverage) {
      throw new NotFoundException(
        `The selected symbol does not have any stored value`,
      );
    }
    return movingAverage;
  }

  /**
   * @todo: Authorization is highly recommended for this endpoint
   */
  @ApiOperation({
    operationId: 'addSymbol',
    summary: 'Add new symbol',
    description: 'Add new symbol to the subscription list',
  })
  @ApiOkResponse({
    type: StockSymbolImpl,
  })
  @ApiBadRequestResponse({ description: 'Invalid symbol' })
  @ApiNotFoundResponse({ description: 'Symbol not found' })
  @ApiConflictResponse({
    description: 'The selected symbol is already in the list',
  })
  @Put('/:symbol')
  addSymbol(@Param() { symbol }: StockSymbolRequest) {
    return this.stockService.addSymbol(symbol);
  }
}
