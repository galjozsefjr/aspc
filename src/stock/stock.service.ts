import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';
import { StockSymbolImpl } from './stock.types';
import { FinnhubService } from 'src/finnhub/finnhub.service';

@Injectable()
export class StockService {
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
}
