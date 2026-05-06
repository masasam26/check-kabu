# 株価管理アプリ 実装進捗

## ステータス凡例
- [ ] 未着手
- [~] 作業中
- [x] 完了

---

## 実装タスク

### 1. プロジェクト初期化
- [x] Next.js + TypeScript プロジェクト作成
- [x] Tailwind CSS セットアップ
- [x] Firebase SDK インストール・設定
- [x] 環境変数ファイル (.env.local) 作成
- [x] ディレクトリ構成整備

### 2. Firestore 接続・データモデル
- [x] Firebase 初期化コード (`src/lib/firebase.ts`)
- [x] Firestoreデータモデル実装（stocks / purchases / prices）
- [x] Firestore操作ユーティリティ関数 (`src/lib/firestore.ts`)

### 3. 銘柄登録フォーム
- [x] 銘柄一覧ページ (`src/app/page.tsx` + `StockList.tsx`)
- [x] 銘柄登録フォームUI (`AddStockForm.tsx`)
- [x] 購入情報登録フォームUI (`PurchaseManager.tsx`)
- [x] 銘柄の編集・削除機能

### 4. 初期株価データ取得
- [x] Yahoo Finance 非公式API連携 (`src/lib/yahooFinance.ts`)
- [x] Firestoreへの一括保存処理
- [x] 初期データ投入UI（銘柄詳細ページのボタン）

### 5. J-Quants 日次更新
- [x] J-Quants API 認証（リフレッシュトークン → IDトークン）(`src/lib/jquants.ts`)
- [x] 前日株価データ取得
- [x] Firestoreへの日次追記処理
- [x] Next.js API Route で更新エンドポイント作成 (`/api/update-prices`)

### 6. チャート実装
- [x] TradingView Lightweight Charts インストール
- [x] ローソク足チャートコンポーネント (`StockChart.tsx`)
- [x] 移動平均線（5日・25日・75日）
- [x] 期間切り替えUI（1ヶ月・3ヶ月・6ヶ月・1年・全期間）

### 7. 損益サマリー
- [x] 現在値・取得単価・損益（円・%）計算ロジック
- [x] 銘柄詳細ページでの損益表示
- [x] ポートフォリオ全体の損益合計表示（トップページ）

### 8. PWA対応
- [x] next-pwa インストール・設定
- [x] manifest.json 作成
- [ ] アイコン画像作成（icon-192.png / icon-512.png）
- [ ] オフライン対応確認

---

## 残タスク・セットアップ手順

### Firebase プロジェクトのセットアップが必要
1. Firebase Console でプロジェクト作成
2. Firestore Database を有効化
3. `.env.local` に認証情報を記入

### J-Quants API のセットアップが必要
1. J-Quants サイトで無料登録
2. リフレッシュトークンを取得
3. `.env.local` の `JQUANTS_REFRESH_TOKEN` に記入

### PWAアイコン作成が必要
- `public/icons/icon-192.png`（192×192px）
- `public/icons/icon-512.png`（512×512px）

---

## 完了日記録
| タスク | 完了日 |
|---|---|
| Step1〜8（基本実装） | 2026-05-06 |
