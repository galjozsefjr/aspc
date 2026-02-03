import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';
import {
  RawMovingAverageRow,
  QuoteImpl,
  StockSymbolImpl,
  SymbolWithMovingAverage,
} from './stock.types';
import { FinnhubService } from 'src/finnhub/finnhub.service';
import { Cron, CronExpression } from '@nestjs/schedule';
import { StockSymbol } from 'src/generated/prisma/client';

@Injectable()
export class StockService {
  static REFRESH_DELAY = 50;

  private log = new Logger(StockService.name);

  constructor(
    private db: PrismaService,
    private finnhub: FinnhubService,
  ) {}

  async getSymbol(symbolId: string): Promise<StockSymbolImpl | null> {
    const symbol = await this.db.stockSymbol.findFirst({
      where: { symbolId },
    });
    return symbol ? new StockSymbolImpl(symbol) : null;
  }

  async addSymbol(symbolId: string): Promise<StockSymbolImpl> {
    const dbSymbol = await this.db.stockSymbol.findFirst({
      where: { symbolId },
    });
    if (dbSymbol) {
      throw new ConflictException('The selected symbol is already registered');
    }

    const symbol = await this.finnhub.findSymbol(symbolId);
    if (!symbol) {
      throw new NotFoundException(`Cannot find symbol "${symbolId}"`);
    }

    try {
      const [stockSymbol] = await this.db.$transaction([
        this.db.stockSymbol.create({
          data: {
            symbolId: symbol.symbol,
            displaySymbol: symbol.displaySymbol,
            description: symbol.description ? symbol.description : null,
            type: symbol.type,
          },
        }),
      ]);
      return new StockSymbolImpl(stockSymbol);
    } catch (err) {
      this.log.error(err);
      throw new InternalServerErrorException(
        `Failed to add symbol "${symbolId}"`,
      );
    }
  }

  async getMovingAverage(
    symbol: StockSymbol,
    topValues = 10,
  ): Promise<SymbolWithMovingAverage | null> {
    const resultSet = await this.db.$queryRawUnsafe<RawMovingAverageRow[]>(
      `
        SELECT
          symbol_id,
          MAX(created_at) as created_at,
          AVG(current_price) as moving_average
        FROM (
          SELECT symbol_id, created_at, current_price
          FROM "Quote"
          WHERE symbol_id = $1
          ORDER BY created_at DESC
          LIMIT $2
        )
        GROUP BY symbol_id
      `,
      symbol.symbolId as string,
      topValues,
    );
    if (!resultSet?.length) {
      return null;
    }
    return new SymbolWithMovingAverage(symbol, resultSet[0]);
  }

  @Cron(CronExpression.EVERY_5_MINUTES)
  async updateQuoteList() {
    try {
      const symbols = await this.db.stockSymbol.findMany();
      this.log.log(`Start periodic refresh of ${symbols.length} symbols`);
      for (const symbol of symbols) {
        /*
         * The delay is added to avoid bombing the third party service
         * This can only work for a couple of symbols - better solution could be to be grouped by e.g. 10 elements at one time
         * The best way would be to subscribe to WebSocket and request only when trade happened instead of polling
         */
        await this.refreshQuote(symbol);
        await new Promise((resolve) =>
          setTimeout(resolve, StockService.REFRESH_DELAY),
        );
      }
      this.log.log(`Refreshed ${symbols.length} symbols`);
    } catch (err) {
      this.log.error(err);
    }
  }

  async refreshQuote(symbol: StockSymbol): Promise<QuoteImpl | null> {
    try {
      const quote = await this.finnhub.getQuote(symbol.symbolId as string);
      if (!quote) {
        this.log.error(`Cannot retrieve quote for symbol "${symbol.symbolId}"`);
        return null;
      }
      const [refreshedQuote] = await this.db.$transaction([
        this.db.quote.create({
          data: {
            symbolId: symbol.symbolId,
            currentPrice: quote.currentPrice,
          },
        }),
      ]);
      return new QuoteImpl(refreshedQuote);
    } catch (err) {
      this.log.error(err);
      throw new InternalServerErrorException(
        `Failed to refresh quote for symbol ${symbol.symbolId}`,
      );
    }
  }
}
