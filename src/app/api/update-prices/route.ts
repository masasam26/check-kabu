import { NextRequest, NextResponse } from "next/server";
import { fetchPricesSince } from "@/lib/yahooFinance";
import { savePrices, getLatestPriceDate, getStocks } from "@/lib/firestore";

async function updateOne(code: string): Promise<number> {
  const latestDate = await getLatestPriceDate(code);
  const fromDate = latestDate
    ? new Date(new Date(latestDate).getTime() + 86400000).toISOString().slice(0, 10)
    : new Date(Date.now() - 90 * 86400000).toISOString().slice(0, 10);

  const prices = await fetchPricesSince(code, fromDate);
  if (prices.length > 0) await savePrices(code, prices);
  return prices.length;
}

// code を指定すると1銘柄のみ、省略すると全銘柄を差分更新する
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const results: Record<string, number> = {};

  if (body.code) {
    results[body.code] = await updateOne(body.code);
  } else {
    const stocks = await getStocks();
    for (const stock of stocks) {
      results[stock.code] = await updateOne(stock.code);
    }
  }

  return NextResponse.json({ updated: results });
}
