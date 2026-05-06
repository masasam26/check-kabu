# 株価管理アプリ (check_kabu)

## アプリ概要

日本株の保有銘柄を管理し、株価推移をグラフで分析するWebアプリ。個人利用。PWA対応。

## 技術スタック

| 項目 | 技術 |
|---|---|
| フレームワーク | Next.js (App Router) + TypeScript |
| スタイル | Tailwind CSS |
| チャート | TradingView Lightweight Charts |
| データベース | Firebase Firestore |
| ホスティング | Firebase Hosting |
| PWA | next-pwa |
| 株価API（日次更新） | J-Quants API (無料プラン) |
| 株価API（初期データ） | Yahoo Finance 非公式API（一度のみ使用） |

## 機能要件

### 保有銘柄管理
- 手動入力フォームで銘柄を登録（証券コード・銘柄名・購入日・購入単価・株数）
- 複数回購入（ナンピン・追加購入）に対応
- 銘柄の編集・削除

### 株価表示
- 現在値（前日終値）の表示
- 取得単価・現在値・損益（円・%）の表示
- 保有銘柄一覧での損益サマリー

### チャート
- ローソク足チャート（必須）
- 移動平均線（必須）：5日・25日・75日
- 期間切り替え：1ヶ月・3ヶ月・6ヶ月・1年・全期間

### データ戦略
- 初回起動時：Yahoo Finance 非公式APIで過去1〜2年分を取得 → Firestoreに保存
- 日次更新：J-Quants API で前日分を取得 → Firestoreに追記蓄積
- Firestoreに蓄積することで長期履歴を構築

## データモデル（Firestore）

```
/stocks/{stockCode}
  - code: string          // 証券コード (例: "7203")
  - name: string          // 銘柄名 (例: "トヨタ自動車")
  - createdAt: timestamp

/stocks/{stockCode}/purchases/{purchaseId}
  - date: string          // 購入日 (例: "2024-01-15")
  - price: number         // 購入単価
  - shares: number        // 株数

/stocks/{stockCode}/prices/{date}
  - date: string          // 日付 (例: "2024-01-15")
  - open: number          // 始値
  - high: number          // 高値
  - low: number           // 安値
  - close: number         // 終値
  - volume: number        // 出来高
```

## 環境変数

```
JQUANTS_REFRESH_TOKEN=    # J-Quants APIリフレッシュトークン
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
```

## 開発方針

- 認証なし（個人利用）
- 日本株のみ対応
- モバイルファースト（PWA）
- J-Quants 無料プラン内で運用（日次更新のみ）
- Firestore Spark プラン（無料）で運用

## コマンド

```bash
npm run dev       # 開発サーバー起動
npm run build     # ビルド
npm run lint      # Lintチェック
firebase deploy   # Firebase Hostingへデプロイ
```
