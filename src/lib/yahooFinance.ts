import type { PriceData } from "@/types/stock";

export async function fetchHistoricalPrices(code: string): Promise<PriceData[]> {
  const symbol = `${code}.T`;
  const to = Math.floor(Date.now() / 1000);
  const from = to - 2 * 365 * 24 * 60 * 60; // 2年前

  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?period1=${from}&period2=${to}&interval=1d`;

  const res = await fetch(url, {
    headers: { "User-Agent": "Mozilla/5.0" },
  });

  if (!res.ok) throw new Error(`Yahoo Finance fetch failed: ${res.status}`);

  const json = await res.json();
  const result = json.chart?.result?.[0];
  if (!result) throw new Error("No data from Yahoo Finance");

  const timestamps: number[] = result.timestamp;
  const { open, high, low, close, volume } = result.indicators.quote[0];

  return timestamps.map((ts, i) => {
    const d = new Date(ts * 1000);
    const date = d.toISOString().slice(0, 10);
    return {
      date,
      open: Math.round(open[i] * 10) / 10,
      high: Math.round(high[i] * 10) / 10,
      low: Math.round(low[i] * 10) / 10,
      close: Math.round(close[i] * 10) / 10,
      volume: volume[i] ?? 0,
    };
  }).filter((p) => p.open && p.close);
}
