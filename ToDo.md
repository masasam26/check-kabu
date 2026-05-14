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

### 5. 株価日次更新
- [x] ~~J-Quants（無料プランはデータ範囲制限のためYahoo Financeに一本化）~~
- [x] Yahoo Finance で差分取得 (`fetchPricesSince`)
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
- [x] アイコン画像作成（icon-192.png / icon-512.png）
- [x] Firestore オフライン永続化（IndexedDB キャッシュ）
- [x] オフラインフォールバックページ (`/offline`) 作成・PWA設定

### 9. 日次更新の自動化
- [x] 自動実行方法の選定（GitHub Actions を採用）
- [x] `.github/workflows/update-prices.yml` 作成（平日 18:30 JST）
- [ ] GitHub Secrets に `APP_URL` を登録（デプロイ後）

### 10. 銘柄名の自動補完
- [x] `/api/stock-name` ルート作成（Yahoo Finance から銘柄名を取得）
- [x] 証券コード4桁入力時に自動取得・補完 (`AddStockForm.tsx`)

### 11. Firebase App Hosting デプロイ
- [x] `apphosting.yaml` 作成・設定
- [x] `.firebaserc` 作成（プロジェクト: check-kabu）
- [x] Firebase コンソールで Blaze プランに変更
- [x] Firebase コンソールから App Hosting バックエンド作成
- [x] GitHub リポジトリと連携・自動デプロイ設定
- [x] 本番環境の環境変数（`NEXT_PUBLIC_FIREBASE_*`）を Firebase コンソールで設定
- [x] 本番公開確認（https://check-kabu--check-kabu.asia-east1.hosted.app）

### 9. 日次更新の自動化
- [x] 自動実行方法の選定（GitHub Actions を採用）
- [x] `.github/workflows/update-prices.yml` 作成（平日 18:30 JST）
- [x] GitHub Secrets に `APP_URL` を登録

---

## 残タスク・セットアップ手順

### Firebase プロジェクトのセットアップ
- [x] Firebase Console でプロジェクト作成
- [x] Firestore Database を有効化
- [x] `.env.local` に認証情報を記入

### PWAアイコン作成
- [x] `public/icons/icon-192.png`（192×192px）を作成
- [x] `public/icons/icon-512.png`（512×512px）を作成

---

## 完了日記録
| タスク | 完了日 |
|---|---|
| Step1〜8（基本実装） | 2026-05-06 |
| Step8 PWAオフライン対応・Step10 銘柄名自動補完 | 2026-05-14 |
| Step9 GitHub Actions設定・Step11 本番デプロイ完了 | 2026-05-14 |
