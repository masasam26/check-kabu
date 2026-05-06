"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { getStocks, getPurchases, getPrices } from "@/lib/firestore";
import type { Stock, Purchase, PriceData } from "@/types/stock";
import PurchaseManager from "@/components/stock/PurchaseManager";
import StockChart from "@/components/chart/StockChart";

export default function StockDetailPage() {
  const { code } = useParams<{ code: string }>();
  const [stock, setStock] = useState<Stock | null>(null);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [prices, setPrices] = useState<PriceData[]>([]);
  const [loading, setLoading] = useState(true);
  const [initializingPrices, setInitializingPrices] = useState(false);

  const currentPrice = prices.length > 0 ? prices[prices.length - 1].close : null;
  const totalShares = purchases.reduce((s, p) => s + p.shares, 0);
  const totalCost = purchases.reduce((s, p) => s + p.price * p.shares, 0);
  const averagePrice = totalShares > 0 ? totalCost / totalShares : 0;
  const profitLoss = currentPrice && totalShares > 0 ? (currentPrice - averagePrice) * totalShares : null;
  const profitLossPercent = currentPrice && averagePrice > 0 ? ((currentPrice - averagePrice) / averagePrice) * 100 : null;

  const loadData = useCallback(async () => {
    const stocks = await getStocks();
    const found = stocks.find((s) => s.code === code) ?? null;
    setStock(found);
    const [purchaseList, priceList] = await Promise.all([getPurchases(code), getPrices(code)]);
    setPurchases(purchaseList);
    setPrices(priceList);
    setLoading(false);
  }, [code]);

  useEffect(() => { loadData(); }, [loadData]);

  async function handleInitPrices() {
    setInitializingPrices(true);
    try {
      const res = await fetch("/api/init-prices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      if (!res.ok) throw new Error(await res.text());
      await loadData();
    } catch (e) {
      alert("株価データの取得に失敗しました: " + (e instanceof Error ? e.message : ""));
    } finally {
      setInitializingPrices(false);
    }
  }

  if (loading) return <p className="text-gray-400">読み込み中...</p>;
  if (!stock) return <p className="text-gray-400">銘柄が見つかりません</p>;

  const isPositive = profitLoss !== null && profitLoss >= 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/" className="text-gray-400 hover:text-white transition-colors text-sm">← 一覧に戻る</Link>
      </div>

      {/* 銘柄ヘッダー */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
        <div className="flex justify-between items-start">
          <div>
            <span className="text-gray-400 text-sm">{stock.code}</span>
            <h2 className="text-2xl font-bold text-white mt-0.5">{stock.name}</h2>
          </div>
          <div className="text-right">
            {currentPrice ? (
              <>
                <p className="text-2xl font-bold text-white">¥{currentPrice.toLocaleString()}</p>
                <p className="text-xs text-gray-400">前日終値</p>
              </>
            ) : (
              <p className="text-gray-500 text-sm">価格データなし</p>
            )}
          </div>
        </div>

        {/* 損益サマリー */}
        {purchases.length > 0 && currentPrice && (
          <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
            <SummaryCard label="平均取得単価" value={`¥${Math.round(averagePrice).toLocaleString()}`} />
            <SummaryCard label="保有株数" value={`${totalShares.toLocaleString()}株`} />
            <SummaryCard
              label="損益"
              value={`${isPositive ? "+" : ""}¥${Math.round(profitLoss!).toLocaleString()}`}
              color={isPositive ? "text-red-400" : "text-blue-400"}
            />
            <SummaryCard
              label="損益率"
              value={`${isPositive ? "+" : ""}${profitLossPercent!.toFixed(2)}%`}
              color={isPositive ? "text-red-400" : "text-blue-400"}
            />
          </div>
        )}
      </div>

      {/* チャート */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
        <h3 className="font-semibold text-white mb-4">チャート</h3>
        {prices.length > 0 ? (
          <StockChart prices={prices} />
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500 mb-4">株価データがありません</p>
            <button
              onClick={handleInitPrices}
              disabled={initializingPrices}
              className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white px-6 py-2 rounded-lg text-sm transition-colors"
            >
              {initializingPrices ? "取得中..." : "過去データを取得（Yahoo Finance）"}
            </button>
          </div>
        )}
      </div>

      {/* 購入履歴 */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
        <PurchaseManager code={code} purchases={purchases} onChanged={loadData} />
      </div>
    </div>
  );
}

function SummaryCard({ label, value, color = "text-white" }: { label: string; value: string; color?: string }) {
  return (
    <div className="bg-gray-800 rounded-lg p-3">
      <p className="text-xs text-gray-400">{label}</p>
      <p className={`text-lg font-semibold mt-1 ${color}`}>{value}</p>
    </div>
  );
}
