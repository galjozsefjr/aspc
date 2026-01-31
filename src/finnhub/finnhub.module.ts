import { Module } from '@nestjs/common';
import { FinnhubService } from './finnhub.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule],
  providers: [FinnhubService],
  exports: [FinnhubService],
})
export class FinnhubModule {}
