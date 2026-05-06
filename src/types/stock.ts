export interface Stock {
  code: string;
  name: string;
  createdAt: Date;
}

export interface Purchase {
  id: string;
  date: string;
  price: number;
  shares: number;
}

export interface PriceData {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface StockWithPurchases extends Stock {
  purchases: Purchase[];
  currentPrice?: number;
  averagePrice?: number;
  totalShares?: number;
  profitLoss?: number;
  profitLossPercent?: number;
}
