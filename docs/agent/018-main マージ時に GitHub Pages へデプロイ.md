main マージ時に GitHub Pages へデプロイ
===

## タスク概要
- `main` へマージされたとき、フロントエンドを GitHub Pages へ自動デプロイする。

## 今回の要望 (統合者まとめ)
- `main` へ反映されたタイミングで GitHub Pages デプロイを実行したい。
- 手動操作を減らし、デプロイを CI 化したい。

## 変更対象
- `docs/agent/018-main マージ時に GitHub Pages へデプロイ.md`
- `.github/workflows/*`
- `webapp/frontend-react/vite.config.ts` (必要に応じて)

## 詳細設計
### デプロイ方式
- GitHub Actions の専用 workflow (`pages-deploy.yml`) を追加する。
- トリガーは `push` の `main` ブランチに限定する。
- `workflow_dispatch` も有効化して、必要時に手動実行できるようにする。

### build / deploy フロー
1. `actions/checkout` でリポジトリ取得
2. `actions/setup-node` で Node.js 22 をセットアップ
3. `yarn install --frozen-lockfile` を `webapp/frontend-react` で実行
4. `yarn run build --base \"/${{ github.event.repository.name }}/\"` を実行して Pages 用 build
5. `actions/configure-pages` で Pages 設定
6. `actions/upload-pages-artifact` で `webapp/frontend-react/dist` をアップロード
7. `actions/deploy-pages` で公開

### 権限 / 安全性
- workflow の `permissions` は `contents: read`, `pages: write`, `id-token: write` に限定する。
- `concurrency` を設定して、同時デプロイを 1 本に制御する。

### 補足
- この構成は「GitHub Pages をプロジェクトページとして運用 ( /<repo>/ )」前提。
- カスタムドメイン運用時は `--base` 値を調整する。
