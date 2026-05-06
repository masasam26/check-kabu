import type { PriceData } from "@/types/stock";

let cachedIdToken: string | null = null;
let tokenExpiry: number = 0;

async function getIdToken(): Promise<string> {
  if (cachedIdToken && Date.now() < tokenExpiry) return cachedIdToken;

  const refreshToken = process.env.JQUANTS_REFRESH_TOKEN;
  if (!refreshToken) throw new Error("JQUANTS_REFRESH_TOKEN is not set");

  const res = await fetch("https://api.jquants.com/v1/token/auth_refresh?refreshtoken=" + refreshToken, {
    method: "POST",
  });
  if (!res.ok) throw new Error(`J-Quants auth failed: ${res.status}`);

  const data = await res.json();
  cachedIdToken = data.idToken;
  tokenExpiry = Date.now() + 23 * 60 * 60 * 1000; // 23時間
  return cachedIdToken!;
}

export async function fetchLatestPrice(code: string): Promise<PriceData | null> {
  const idToken = await getIdToken();
  const today = new Date();
  const from = new Date(today);
  from.setDate(today.getDate() - 7); // 直近7日（休場日考慮）

  const fromStr = from.toISOString().slice(0, 10).replace(/-/g, "-");
  const url = `https://api.jquants.com/v1/prices/daily_quotes?code=${code}&from=${fromStr}`;

  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${idToken}` },
  });
  if (!res.ok) return null;

  const data = await res.json();
  const quotes: Array<{
    Date: string;
    Open: number;
    High: number;
    Low: number;
    Close: number;
    Volume: number;
  }> = data.daily_quotes ?? [];

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
  const idToken = await getIdToken();
  const url = `https://api.jquants.com/v1/prices/daily_quotes?code=${code}&from=${fromDate}`;

  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${idToken}` },
  });
  if (!res.ok) return [];

  const data = await res.json();
  const quotes: Array<{
    Date: string;
    Open: number;
    High: number;
    Low: number;
    Close: number;
    Volume: number;
  }> = data.daily_quotes ?? [];

  return quotes.map((q) => ({
    date: q.Date,
    open: q.Open,
    high: q.High,
    low: q.Low,
    close: q.Close,
    volume: q.Volume,
  }));
}
