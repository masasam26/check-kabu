import { NextRequest, NextResponse } from "next/server";
import { fetchHistoricalPrices } from "@/lib/yahooFinance";
import { savePrices } from "@/lib/firestore";

export async function POST(req: NextRequest) {
  const { code } = await req.json();
  if (!code) return NextResponse.json({ error: "code is required" }, { status: 400 });

  try {
    const prices = await fetchHistoricalPrices(code);
    await savePrices(code, prices);
    return NextResponse.json({ saved: prices.length });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
