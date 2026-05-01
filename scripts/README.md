# Scripts

ガジェパスのNotion CMS、楽天商品データ、記事作成補助で使う運用スクリプトです。

## 主なスクリプト

- `refresh_prices.mjs`
  - Notionの商品DBに登録された現行品・旧モデルの商品を楽天 Ichiba API で検索し、価格、画像URL、楽天URL、在庫確認状況を更新します。
  - 2回連続で新品が見つからない商品だけ `販売終了` に変更します。
  - 検索結果の一致確度が低い商品や、価格変動が極端な商品は誤更新防止のため更新せず、要確認ログに出します。
  - GitHub Actions の週次自動更新で使います。

- `update_products.mjs`
  - 楽天検索結果を使って、商品DBの不足している楽天URL、画像URL、価格を補完する既存スクリプトです。

- `find_discontinued.mjs`
  - 販売終了商品の確認に使う既存スクリプトです。

## 必要な環境変数

ローカルでは `.env.local` に設定します。
GitHub Actions では `Settings -> Secrets and variables -> Actions` に同じ名前で登録します。

```env
NOTION_TOKEN=secret_xxxxxxxxxxxxxxxxxxxx
NOTION_PRODUCTS_DB_ID=c0f456c33c5740bc8d90025630236014
RAKUTEN_APP_ID=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
RAKUTEN_ACCESS_KEY=pk_xxxxxxxxxxxxxxxxxxxx
VERCEL_DEPLOY_HOOK_URL=https://api.vercel.com/v1/integrations/deploy/...
```

## Notion 商品DBに必要なプロパティ

`refresh_prices.mjs` は、次の既存プロパティを使います。

- `商品名` (title)
- `カテゴリ` (select)
- `スラッグ` (text)
- `楽天URL` (url)
- `画像URL` (url)
- `価格` (rich_text)
- `ステータス` (status: `現行品` / `旧モデル` / `販売終了`)

販売終了の自動判定には、次のプロパティも使います。

- `最終確認日` (date)
- `連続未発見回数` (number)

これらが存在しない場合、`refresh_prices.mjs` の通常実行時に自動作成します。
Notion側で手動作成する場合は、上記の名前と型で追加してください。

## ローカルでの動作確認

Notionを更新せず、楽天API検索と判定ロジックだけ確認する場合:

```bash
node scripts/refresh_prices.mjs --dry
```

実際にNotionを更新する場合:

```bash
node scripts/refresh_prices.mjs
```

`--dry` でも楽天APIにはアクセスします。楽天APIの制限に合わせて、商品ごとに1100ms待機します。

## GitHub Actions の手動実行

1. GitHubリポジトリ `WW-QuadrupleU/gadgepath` を開く
2. `Actions` タブを開く
3. `Refresh Rakuten Product Data` を選ぶ
4. `Run workflow` を押す

通常は毎週日曜日のJST 2:00に自動実行されます。
成功時は `VERCEL_DEPLOY_HOOK_URL` にPOSTして、本番デプロイをトリガーします。
失敗時はGitHub Issueを自動作成します。
