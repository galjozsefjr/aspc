export type SymbolLookupResult = {
  description: string;
  displaySymbol: string;
  symbol: string;
  type: string;
};

export type SymbolLookupResultList = {
  count: number;
  result: SymbolLookupResult[];
};

export type RawQuote = {
  c: number;
  d?: number;
  dp?: number;
  h: number;
  l: number;
  o: number;
  pc: number;
};

export class Quoute {
  readonly currentPrice: RawQuote['c'];
  readonly highPriceOfDay: RawQuote['h'];
  readonly lowPriceOfDay: RawQuote['l'];
  readonly openPriceOfDay: RawQuote['o'];
  readonly previouseClosePrice: RawQuote['pc'];
  readonly change?: RawQuote['d'];
  readonly changePercent?: RawQuote['dp'];

  constructor({ c, h, l, o, pc, d, dp }: RawQuote) {
    this.currentPrice = c;
    this.highPriceOfDay = h;
    this.lowPriceOfDay = l;
    this.openPriceOfDay = o;
    this.previouseClosePrice = pc;
    this.change = d ?? undefined;
    this.changePercent = dp ?? undefined;
  }
}

export type Trade = {
  s: string;
  p: number;
  t: number;
  v: number;
};

export type Trades = {
  type: string;
  data: Trade[];
};
