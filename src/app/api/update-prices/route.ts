import { NextResponse } from "next/server";
import { fetchPricesSince } from "@/lib/yahooFinance";
import { savePrices, getLatestPriceDate, getStocks } from "@/lib/firestore";

// 全銘柄の株価を最新日から今日まで差分更新する
export async function POST() {
  const stocks = await getStocks();
  const results: Record<string, number> = {};

  for (const stock of stocks) {
    const latestDate = await getLatestPriceDate(stock.code);
    const fromDate = latestDate
      ? new Date(new Date(latestDate).getTime() + 86400000).toISOString().slice(0, 10)
      : new Date(Date.now() - 90 * 86400000).toISOString().slice(0, 10);

    const prices = await fetchPricesSince(stock.code, fromDate);
    if (prices.length > 0) {
      await savePrices(stock.code, prices);
    }
    results[stock.code] = prices.length;
  }

  return NextResponse.json({ updated: results });
}
