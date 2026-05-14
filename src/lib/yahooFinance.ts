import type { PriceData } from "@/types/stock";

async function fetchPrices(code: string, fromTimestamp: number): Promise<PriceData[]> {
  const symbol = `${code}.T`;
  const to = Math.floor(Date.now() / 1000);
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?period1=${fromTimestamp}&period2=${to}&interval=1d`;

  const res = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0" } });
  if (!res.ok) throw new Error(`Yahoo Finance fetch failed: ${res.status}`);

  const json = await res.json();
  const result = json.chart?.result?.[0];
  if (!result) throw new Error("No data from Yahoo Finance");

  const timestamps: number[] = result.timestamp;
  const { open, high, low, close, volume } = result.indicators.quote[0];

  return timestamps
    .map((ts, i) => ({
      date: new Date(ts * 1000).toISOString().slice(0, 10),
      open: Math.round(open[i] * 10) / 10,
      high: Math.round(high[i] * 10) / 10,
      low: Math.round(low[i] * 10) / 10,
      close: Math.round(close[i] * 10) / 10,
      volume: volume[i] ?? 0,
    }))
    .filter((p) => p.open && p.close);
}

export async function fetchStockName(code: string): Promise<string | null> {
  const symbol = `${code}.T`;
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?period1=0&period2=1&interval=1d`;
  const res = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0" } });
  if (!res.ok) return null;
  const json = await res.json();
  const meta = json.chart?.result?.[0]?.meta;
  return meta?.longName ?? meta?.shortName ?? null;
}

// 初回：過去2年分を取得
export async function fetchHistoricalPrices(code: string): Promise<PriceData[]> {
  const from = Math.floor(Date.now() / 1000) - 2 * 365 * 24 * 60 * 60;
  return fetchPrices(code, from);
}

// 日次更新：指定日以降のデータを取得
export async function fetchPricesSince(code: string, fromDate: string): Promise<PriceData[]> {
  const from = Math.floor(new Date(fromDate).getTime() / 1000);
  return fetchPrices(code, from);
}
