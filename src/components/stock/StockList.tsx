"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getStocks, getPurchases, getPrices, deleteStock } from "@/lib/firestore";
import type { Stock, Purchase } from "@/types/stock";
import AddStockForm from "./AddStockForm";

interface StockRow extends Stock {
  purchases: Purchase[];
  averagePrice: number;
  totalShares: number;
  totalCost: number;
  currentPrice: number | null;
  currentValue: number | null;
  profitLoss: number | null;
  profitLossPercent: number | null;
}

function PortfolioSummary({ stocks }: { stocks: StockRow[] }) {
  const withPrice = stocks.filter((s) => s.currentPrice !== null && s.totalShares > 0);
  if (withPrice.length === 0) return null;

  const totalCost = withPrice.reduce((sum, s) => sum + s.totalCost, 0);
  const totalValue = withPrice.reduce((sum, s) => sum + s.currentValue!, 0);
  const totalPL = totalValue - totalCost;
  const totalPLPercent = totalCost > 0 ? (totalPL / totalCost) * 100 : 0;
  const isPositive = totalPL >= 0;

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 mb-6">
      <h3 className="text-sm text-gray-400 mb-3">ポートフォリオ合計</h3>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <SummaryCard label="総投資額" value={`¥${Math.round(totalCost).toLocaleString()}`} />
        <SummaryCard label="現在評価額" value={`¥${Math.round(totalValue).toLocaleString()}`} />
        <SummaryCard
          label="損益合計"
          value={`${isPositive ? "+" : ""}¥${Math.round(totalPL).toLocaleString()}`}
          color={isPositive ? "text-red-400" : "text-blue-400"}
        />
        <SummaryCard
          label="損益率"
          value={`${isPositive ? "+" : ""}${totalPLPercent.toFixed(2)}%`}
          color={isPositive ? "text-red-400" : "text-blue-400"}
        />
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

export default function StockList() {
  const [stocks, setStocks] = useState<StockRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  async function load() {
    setLoading(true);
    const list = await getStocks();
    const rows = await Promise.all(
      list.map(async (s) => {
        const [purchases, prices] = await Promise.all([
          getPurchases(s.code),
          getPrices(s.code),
        ]);
        const totalShares = purchases.reduce((sum, p) => sum + p.shares, 0);
        const totalCost = purchases.reduce((sum, p) => sum + p.price * p.shares, 0);
        const averagePrice = totalShares > 0 ? totalCost / totalShares : 0;
        const currentPrice = prices.length > 0 ? prices[prices.length - 1].close : null;
        const currentValue = currentPrice !== null && totalShares > 0 ? currentPrice * totalShares : null;
        const profitLoss = currentValue !== null ? currentValue - totalCost : null;
        const profitLossPercent =
          profitLoss !== null && totalCost > 0 ? (profitLoss / totalCost) * 100 : null;
        return { ...s, purchases, totalShares, totalCost, averagePrice, currentPrice, currentValue, profitLoss, profitLossPercent };
      })
    );
    setStocks(rows);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function handleDelete(code: string, name: string) {
    if (!confirm(`「${name}」を削除しますか？`)) return;
    await deleteStock(code);
    load();
  }

  if (loading) return <p className="text-gray-400">読み込み中...</p>;

  return (
    <div>
      <PortfolioSummary stocks={stocks} />

      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">保有銘柄一覧</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 hover:bg-blue-500 text-white text-sm px-4 py-2 rounded-lg transition-colors"
        >
          {showForm ? "閉じる" : "+ 銘柄追加"}
        </button>
      </div>

      {showForm && (
        <div className="mb-6">
          <AddStockForm onAdded={() => { setShowForm(false); load(); }} />
        </div>
      )}

      {stocks.length === 0 ? (
        <p className="text-gray-500 text-center py-12">銘柄が登録されていません</p>
      ) : (
        <div className="space-y-3">
          {stocks.map((s) => {
            const isPositive = s.profitLoss !== null && s.profitLoss >= 0;
            return (
              <div key={s.code} className="bg-gray-900 border border-gray-800 rounded-xl p-4">
                <div className="flex justify-between items-start">
                  <Link href={`/stock/${s.code}`} className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-gray-400 text-sm">{s.code}</span>
                      <span className="font-semibold text-white hover:text-blue-400 transition-colors">{s.name}</span>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm">
                      <span className="text-gray-400">
                        現在値: <span className="text-white">
                          {s.currentPrice ? `¥${s.currentPrice.toLocaleString()}` : "—"}
                        </span>
                      </span>
                      <span className="text-gray-400">
                        平均取得: <span className="text-white">¥{Math.round(s.averagePrice).toLocaleString()}</span>
                      </span>
                      <span className="text-gray-400">
                        保有: <span className="text-white">{s.totalShares.toLocaleString()}株</span>
                      </span>
                      {s.profitLoss !== null && (
                        <span className={isPositive ? "text-red-400" : "text-blue-400"}>
                          {isPositive ? "+" : ""}¥{Math.round(s.profitLoss).toLocaleString()}
                          （{isPositive ? "+" : ""}{s.profitLossPercent!.toFixed(2)}%）
                        </span>
                      )}
                    </div>
                  </Link>
                  <button
                    onClick={() => handleDelete(s.code, s.name)}
                    className="text-gray-600 hover:text-red-400 text-sm ml-4 transition-colors"
                  >
                    削除
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
