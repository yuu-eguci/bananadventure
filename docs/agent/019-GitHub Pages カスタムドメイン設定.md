GitHub Pages カスタムドメイン設定
===

## タスク概要
- GitHub Pages の公開先を `www.banana.mrrhp.com` にする。
- コード側の設定を反映し、DNS 側で必要なレコード設定を明文化する。

## 今回の要望 (統合者まとめ)
- カスタムドメイン `www.banana.mrrhp.com` で公開したい。
- ドメインは取得済みなので、実装側と DNS 側の必要設定を整理したい。

## 変更対象
- `docs/agent/019-GitHub Pages カスタムドメイン設定.md`
- `.github/workflows/pages-deploy.yml`

## 詳細設計
### コード側設定方針
- 現在の Pages workflow は `yarn run build --base "/<repo>/"` になっているため、カスタムドメイン運用では不整合が出る。
- `www.banana.mrrhp.com` 配信時はルート配下公開となるため、build は `--base "/"` (または default) に変更する。
- GitHub Actions で `deploy-pages` を使う公開では、`CNAME` ファイルをリポジトリに置いても参照されない運用なので、リポジトリ設定側の custom domain を正とする。

### リポジトリ設定 (GitHub 側)
- `Settings > Pages` の `Custom domain` に `www.banana.mrrhp.com` を設定する。
- `Enforce HTTPS` を有効にする (証明書発行後)。

### DNS 設定方針
- 取得済みドメイン側 DNS で、`www` サブドメインを GitHub Pages へ向ける。
- 推奨レコード:
  - `CNAME` : `www` -> `yuu-eguci.github.io`
- ルートドメイン (`banana.mrrhp.com`) も使う場合は、DNS 事業者の ALIAS/ANAME か URL 転送で `www.banana.mrrhp.com` へ寄せる。

### 期待効果
- `main` マージ時に自動デプロイされ、`www.banana.mrrhp.com` で最新画面を配信できる。

## レビュー

### レビュワー指摘 (1 回目)
1. workflow の具体的な変更点 (どの行をどう変えるか) が曖昧なので、`--base` の変更内容を明記してください。
2. DNS 側で `www` に既存 `A` / `AAAA` が残っていると競合するため、`CNAME` のみ残す方針を追記してください。
3. 反映確認手順として `dig` または `nslookup` での確認観点を追記してください。

判定: `Needs Fix`
