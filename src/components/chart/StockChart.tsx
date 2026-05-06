"use client";

import { useEffect, useRef, useState } from "react";
import { createChart, CandlestickSeries, LineSeries, IChartApi, ISeriesApi } from "lightweight-charts";
import type { PriceData } from "@/types/stock";

interface Props {
  prices: PriceData[];
}

type Period = "1M" | "3M" | "6M" | "1Y" | "ALL";

function calcMA(prices: PriceData[], period: number): { time: string; value: number }[] {
  return prices
    .map((_, i) => {
      if (i < period - 1) return null;
      const slice = prices.slice(i - period + 1, i + 1);
      const avg = slice.reduce((sum, p) => sum + p.close, 0) / period;
      return { time: prices[i].date, value: Math.round(avg * 10) / 10 };
    })
    .filter((v): v is { time: string; value: number } => v !== null);
}

function filterByPeriod(prices: PriceData[], period: Period): PriceData[] {
  if (period === "ALL") return prices;
  const months = { "1M": 1, "3M": 3, "6M": 6, "1Y": 12 }[period];
  const cutoff = new Date();
  cutoff.setMonth(cutoff.getMonth() - months);
  const cutoffStr = cutoff.toISOString().slice(0, 10);
  return prices.filter((p) => p.date >= cutoffStr);
}

export default function StockChart({ prices }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const [period, setPeriod] = useState<Period>("6M");

  useEffect(() => {
    if (!containerRef.current || prices.length === 0) return;

    const chart = createChart(containerRef.current, {
      layout: { background: { color: "#111827" }, textColor: "#9ca3af" },
      grid: { vertLines: { color: "#1f2937" }, horzLines: { color: "#1f2937" } },
      crosshair: { mode: 1 },
      rightPriceScale: { borderColor: "#374151" },
      timeScale: { borderColor: "#374151", timeVisible: true },
      width: containerRef.current.clientWidth,
      height: 400,
    });
    chartRef.current = chart;

    const candleSeries = chart.addSeries(CandlestickSeries, {
      upColor: "#ef4444",
      downColor: "#3b82f6",
      borderUpColor: "#ef4444",
      borderDownColor: "#3b82f6",
      wickUpColor: "#ef4444",
      wickDownColor: "#3b82f6",
    });

    const ma5Series = chart.addSeries(LineSeries, { color: "#f59e0b", lineWidth: 1 });
    const ma25Series = chart.addSeries(LineSeries, { color: "#10b981", lineWidth: 1 });
    const ma75Series = chart.addSeries(LineSeries, { color: "#8b5cf6", lineWidth: 1 });

    const filtered = filterByPeriod(prices, period);

    candleSeries.setData(
      filtered.map((p) => ({ time: p.date, open: p.open, high: p.high, low: p.low, close: p.close }))
    );
    ma5Series.setData(calcMA(filtered, 5));
    ma25Series.setData(calcMA(filtered, 25));
    ma75Series.setData(calcMA(filtered, 75));

    chart.timeScale().fitContent();

    const handleResize = () => {
      if (containerRef.current) chart.applyOptions({ width: containerRef.current.clientWidth });
    };
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      chart.remove();
      chartRef.current = null;
    };
  }, [prices, period]);

  const periods: Period[] = ["1M", "3M", "6M", "1Y", "ALL"];
  const labels: Record<Period, string> = { "1M": "1ヶ月", "3M": "3ヶ月", "6M": "6ヶ月", "1Y": "1年", ALL: "全期間" };

  return (
    <div>
      <div className="flex gap-2 mb-3">
        {periods.map((p) => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            className={`text-xs px-3 py-1 rounded-full transition-colors ${
              period === p ? "bg-blue-600 text-white" : "bg-gray-800 text-gray-400 hover:bg-gray-700"
            }`}
          >
            {labels[p]}
          </button>
        ))}
      </div>
      <div className="flex gap-3 text-xs text-gray-500 mb-2">
        <span><span className="text-amber-400">─</span> MA5</span>
        <span><span className="text-emerald-400">─</span> MA25</span>
        <span><span className="text-violet-400">─</span> MA75</span>
        <span><span className="text-red-400">■</span> 陽線</span>
        <span><span className="text-blue-400">■</span> 陰線</span>
      </div>
      <div ref={containerRef} className="rounded-lg overflow-hidden" />
    </div>
  );
}
