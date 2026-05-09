import {
  collection,
  doc,
  getDocs,
  addDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  query,
  orderBy,
  limit,
} from "firebase/firestore/lite";
import { db } from "./firebase";
import type { Stock, Purchase, PriceData } from "@/types/stock";

// --- Stocks ---

export async function getStocks(): Promise<Stock[]> {
  const snap = await getDocs(collection(db, "stocks"));
  return snap.docs.map((d) => ({
    ...(d.data() as Omit<Stock, "createdAt">),
    code: d.id,
    createdAt: d.data().createdAt?.toDate?.() ?? new Date(),
  }));
}

export async function addStock(code: string, name: string): Promise<void> {
  await setDoc(doc(db, "stocks", code), { code, name, createdAt: serverTimestamp() });
}

export async function updateStock(code: string, name: string): Promise<void> {
  await updateDoc(doc(db, "stocks", code), { name });
}

export async function deleteStock(code: string): Promise<void> {
  await deleteDoc(doc(db, "stocks", code));
}

// --- Purchases ---

export async function getPurchases(code: string): Promise<Purchase[]> {
  const q = query(collection(db, "stocks", code, "purchases"), orderBy("date", "asc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Purchase, "id">) }));
}

export async function addPurchase(code: string, purchase: Omit<Purchase, "id">): Promise<void> {
  await addDoc(collection(db, "stocks", code, "purchases"), purchase);
}

export async function updatePurchase(code: string, purchaseId: string, purchase: Omit<Purchase, "id">): Promise<void> {
  await updateDoc(doc(db, "stocks", code, "purchases", purchaseId), { ...purchase });
}

export async function deletePurchase(code: string, purchaseId: string): Promise<void> {
  await deleteDoc(doc(db, "stocks", code, "purchases", purchaseId));
}

// --- Prices ---

export async function getPrices(code: string): Promise<PriceData[]> {
  const q = query(collection(db, "stocks", code, "prices"), orderBy("date", "asc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => d.data() as PriceData);
}

export async function savePrices(code: string, prices: PriceData[]): Promise<void> {
  for (const price of prices) {
    await setDoc(doc(db, "stocks", code, "prices", price.date), price);
  }
}

export async function getLatestPriceDate(code: string): Promise<string | null> {
  const q = query(collection(db, "stocks", code, "prices"), orderBy("date", "desc"), limit(1));
  const snap = await getDocs(q);
  if (snap.empty) return null;
  return (snap.docs[0].data() as PriceData).date;
}

export async function getLatestPrice(code: string): Promise<PriceData | null> {
  const q = query(collection(db, "stocks", code, "prices"), orderBy("date", "desc"), limit(1));
  const snap = await getDocs(q);
  if (snap.empty) return null;
  return snap.docs[0].data() as PriceData;
}
