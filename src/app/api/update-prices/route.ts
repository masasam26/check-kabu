import { NextRequest, NextResponse } from "next/server";
import { fetchPricesSince } from "@/lib/jquants";
import { savePrices, getLatestPriceDate, getStocks } from "@/lib/firestore";
import { initializeApp, getApps } from "firebase/app";

function initFirebase() {
  if (getApps().length === 0) {
    initializeApp({
      apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
      authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
      appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    });
  }
}

// 全銘柄を日次更新するエンドポイント
export async function POST(_req: NextRequest) {
  initFirebase();
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
