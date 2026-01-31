import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DefaultApi } from 'finnhub';
import type { Configuration } from 'src/app.configuration';
import {
  SymbolLookupResult,
  SymbolLookupResultList,
  RawQuote,
  Quoute,
} from './finnhub.types';

@Injectable()
export class FinnhubService {
  private logger = new Logger(FinnhubService.name);
  private finnhubApi: typeof DefaultApi;

  constructor(config: ConfigService<Configuration>) {
    this.finnhubApi = new DefaultApi(config.get('FINNHUB_API_KEY'));
  }

  async symbolLookup(
    query: string,
    exchange?: string,
  ): Promise<SymbolLookupResultList | null> {
    return new Promise((success) => {
      this.finnhubApi.symbolSearch(
        query,
        { exchange },
        (error, data: SymbolLookupResultList | null) => {
          if (error || !data) {
            this.logger.error(error);
            return success(null);
          }
          return success(data);
        },
      );
    });
  }

  async findSymbol(query: string): Promise<SymbolLookupResult | null> {
    const lookupResults = await this.symbolLookup(query);
    const symbol = lookupResults?.result.find(({ symbol }) => symbol === query);
    return symbol ?? null;
  }

  async getQuote(symbol: string): Promise<Quoute | null> {
    return new Promise((success) => {
      this.finnhubApi.quote(symbol, (error, data: RawQuote) => {
        if (error || !data) {
          this.logger.error(error);
          return success(null);
        }
        return success(new Quoute(data));
      });
    });
  }
}
