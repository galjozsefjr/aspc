import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString, MaxLength } from 'class-validator';
import { StockSymbol } from 'src/generated/prisma/browser';

export class StockSymbolRequest {
  @ApiProperty({ type: String, description: 'Symbol', example: 'AAPL' })
  @IsString()
  @MaxLength(20, {
    message: 'Length of symbol name cannot be more than 20 chars',
  })
  symbol: string;
}

export class StockSymbolDto {
  @ApiProperty({ type: String, example: 'AAPL', description: 'Symbol' })
  @IsString()
  symbol: string;

  @ApiProperty({
    type: Number,
    example: '259.48',
    description: 'Current price',
  })
  @IsNumber()
  currentPrice: number;

  @ApiProperty({
    type: Number,
    description: 'Last updated',
    format: 'timestamp',
    example: '1769806800',
  })
  updatedAt: string;

  @ApiProperty({
    type: Number,
    description: 'Moving average of last 10 stock prices',
    example: '257.16',
  })
  movingAverage: number | null;
}

export class StockSymbolImpl implements StockSymbol {
  @ApiProperty({
    type: Number,
    example: '1',
    description: 'Internal ID of the selected symbol',
  })
  id: bigint;

  @ApiProperty({
    type: String,
    example: 'AAPL',
    description: 'Name of the symbol',
  })
  symbolId: string;

  @ApiProperty({
    type: String,
    example: 'AAPL',
    description: 'Display name of symbol',
  })
  displaySymbol: string;

  @ApiProperty({
    type: String,
    nullable: true,
    example: 'APPLE INC',
    description: 'Additional information about the selected symbol',
  })
  description: string | null;

  @ApiProperty({
    type: String,
    example: 'Common Stock',
    description: 'Type of the symbol',
  })
  type: string;

  constructor({ id, symbolId, displaySymbol, description, type }: StockSymbol) {
    this.id = id;
    this.symbolId = symbolId;
    this.displaySymbol = displaySymbol;
    this.description = description;
    this.type = type;
  }
}
