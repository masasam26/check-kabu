"use client";

import { useState } from "react";
import { addPurchase, updatePurchase, deletePurchase } from "@/lib/firestore";
import type { Purchase } from "@/types/stock";

interface Props {
  code: string;
  purchases: Purchase[];
  onChanged: () => void;
}

export default function PurchaseManager({ code, purchases, onChanged }: Props) {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [date, setDate] = useState("");
  const [price, setPrice] = useState("");
  const [shares, setShares] = useState("");
  const [saving, setSaving] = useState(false);

  function openAdd() {
    setEditingId(null);
    setDate("");
    setPrice("");
    setShares("");
    setShowForm(true);
  }

  function openEdit(p: Purchase) {
    setEditingId(p.id);
    setDate(p.date);
    setPrice(String(p.price));
    setShares(String(p.shares));
    setShowForm(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingId) {
        await updatePurchase(code, editingId, { date, price: Number(price), shares: Number(shares) });
      } else {
        await addPurchase(code, { date, price: Number(price), shares: Number(shares) });
      }
      setShowForm(false);
      onChanged();
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("この購入履歴を削除しますか？")) return;
    await deletePurchase(code, id);
    onChanged();
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-semibold text-white">購入履歴</h3>
        <button
          onClick={openAdd}
          className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
        >
          + 追加
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-gray-800 rounded-lg p-3 mb-3 space-y-3">
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="text-xs text-gray-400 block mb-1">購入日</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1.5 text-white text-sm focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="text-xs text-gray-400 block mb-1">購入単価（円）</label>
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="2800"
                min="1"
                required
                className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1.5 text-white text-sm focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="text-xs text-gray-400 block mb-1">株数</label>
              <input
                type="number"
                value={shares}
                onChange={(e) => setShares(e.target.value)}
                placeholder="100"
                min="1"
                required
                className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1.5 text-white text-sm focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white py-1.5 rounded text-sm transition-colors"
            >
              {saving ? "保存中..." : editingId ? "更新" : "追加"}
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-4 bg-gray-700 hover:bg-gray-600 text-white py-1.5 rounded text-sm transition-colors"
            >
              キャンセル
            </button>
          </div>
        </form>
      )}

      {purchases.length === 0 ? (
        <p className="text-gray-500 text-sm">購入履歴がありません</p>
      ) : (
        <div className="space-y-2">
          {purchases.map((p) => (
            <div key={p.id} className="flex justify-between items-center bg-gray-800 rounded-lg px-3 py-2 text-sm">
              <span className="text-gray-400">{p.date}</span>
              <span className="text-white">¥{p.price.toLocaleString()}</span>
              <span className="text-gray-300">{p.shares.toLocaleString()}株</span>
              <span className="text-gray-400">¥{(p.price * p.shares).toLocaleString()}</span>
              <div className="flex gap-2">
                <button onClick={() => openEdit(p)} className="text-blue-400 hover:text-blue-300 transition-colors">編集</button>
                <button onClick={() => handleDelete(p.id)} className="text-red-400 hover:text-red-300 transition-colors">削除</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
