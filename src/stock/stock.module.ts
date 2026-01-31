import { Module } from '@nestjs/common';
import { StockController } from './stock.controller';
import { StockService } from './stock.service';
import { FinnhubModule } from 'src/finnhub/finnhub.module';
import { PrismaModule } from 'src/database/prisma.module';

@Module({
  controllers: [StockController],
  imports: [FinnhubModule, PrismaModule],
  providers: [StockService],
  exports: [StockService],
})
export class StockModule {
  constructor() {}
}
