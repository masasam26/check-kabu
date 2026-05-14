import { NextRequest, NextResponse } from "next/server";
import { fetchStockName } from "@/lib/yahooFinance";

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code") ?? "";
  if (!/^\d{4}$/.test(code)) return NextResponse.json({ name: null });

  const name = await fetchStockName(code);
  return NextResponse.json({ name });
}
