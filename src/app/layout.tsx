import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "株価管理アプリ",
  description: "日本株の保有銘柄を管理・分析するアプリ",
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  themeColor: "#1e40af",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body className="bg-gray-950 text-gray-100 min-h-screen">
        <header className="bg-gray-900 border-b border-gray-800 px-4 py-3">
          <h1 className="text-lg font-bold text-blue-400">株価管理</h1>
        </header>
        <main className="max-w-4xl mx-auto px-4 py-6">{children}</main>
      </body>
    </html>
  );
}
