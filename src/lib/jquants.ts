import type { PriceData } from "@/types/stock";

const BASE_URL = "https://api.jquants.com/v2";

function getApiKey(): string {
  const key = process.env.JQUANTS_API_KEY;
  if (!key) throw new Error("JQUANTS_API_KEY is not set");
  return key;
}

function authHeaders() {
  return { "x-api-key": getApiKey() };
}

export async function fetchLatestPrice(code: string): Promise<PriceData | null> {
  const today = new Date();
  const from = new Date(today);
  from.setDate(today.getDate() - 7);
  const fromStr = from.toISOString().slice(0, 10);

  const url = `${BASE_URL}/equities/bars/daily?code=${code}&date=${fromStr}`;
  const res = await fetch(url, { headers: authHeaders() });
  if (!res.ok) return null;

  const data = await res.json();
  const quotes: Array<{
    Date: string;
    Open: number;
    High: number;
    Low: number;
    Close: number;
    Volume: number;
  }> = data.daily_quotes ?? data.bars ?? [];

  if (quotes.length === 0) return null;
  const latest = quotes[quotes.length - 1];
  return {
    date: latest.Date,
    open: latest.Open,
    high: latest.High,
    low: latest.Low,
    close: latest.Close,
    volume: latest.Volume,
  };
}

export async function fetchPricesSince(code: string, fromDate: string): Promise<PriceData[]> {
  const url = `${BASE_URL}/equities/bars/daily?code=${code}&from=${fromDate}`;
  const res = await fetch(url, { headers: authHeaders() });
  if (!res.ok) return [];

  const data = await res.json();
  const quotes: Array<{
    Date: string;
    Open: number;
    High: number;
    Low: number;
    Close: number;
    Volume: number;
  }> = data.daily_quotes ?? data.bars ?? [];

  return quotes.map((q) => ({
    date: q.Date,
    open: q.Open,
    high: q.High,
    low: q.Low,
    close: q.Close,
    volume: q.Volume,
  }));
}
