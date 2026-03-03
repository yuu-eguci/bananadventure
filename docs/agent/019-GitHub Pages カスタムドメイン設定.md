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
- 変更対象は `.github/workflows/pages-deploy.yml` の build コマンド行で、`--base "/${{ github.event.repository.name }}/"` を `--base "/"` へ変更する。

### リポジトリ設定 (GitHub 側)
- `Settings > Pages` の `Custom domain` に `www.banana.mrrhp.com` を設定する。
- `Enforce HTTPS` を有効にする (証明書発行後)。

### DNS 設定方針
- 取得済みドメイン側 DNS で、`www` サブドメインを GitHub Pages へ向ける。
- 推奨レコード:
  - `CNAME` : `www` -> `yuu-eguci.github.io`
- `www` に既存の `A` / `AAAA` / 重複 `CNAME` がある場合は削除し、`CNAME` 1 本だけを残す。
- ルートドメイン (`banana.mrrhp.com`) も使う場合は、DNS 事業者の ALIAS/ANAME か URL 転送で `www.banana.mrrhp.com` へ寄せる。

### 反映確認
- DNS 反映後に `dig www.banana.mrrhp.com CNAME +short` で `yuu-eguci.github.io` を返すことを確認する。
- GitHub Pages 側で `https://www.banana.mrrhp.com` が HTTPS で開けることを確認する。

### 期待効果
- `main` マージ時に自動デプロイされ、`www.banana.mrrhp.com` で最新画面を配信できる。

## レビュー

### レビュワー指摘 (1 回目)
1. workflow の具体的な変更点 (どの行をどう変えるか) が曖昧なので、`--base` の変更内容を明記してください。
2. DNS 側で `www` に既存 `A` / `AAAA` が残っていると競合するため、`CNAME` のみ残す方針を追記してください。
3. 反映確認手順として `dig` または `nslookup` での確認観点を追記してください。

判定: `Needs Fix`

### プランナー対応 (1 回目)
1. workflow で変更する build コマンドを具体的に追記しました。
2. `www` の競合レコード削除方針を追記しました。
3. `dig` を使った反映確認手順を追記しました。

### レビュワー再レビュー (2 回目)
- 指摘 1 から 3 の反映を確認しました。
- 実装と運用手順が十分に具体化されています。

判定: `LGTM`

## 実装結果
- `.github/workflows/pages-deploy.yml` の build コマンドを `yarn run build --base "/"` に変更しました。
- これにより `www.banana.mrrhp.com` のルート配信と整合する出力パスになります。

## DNS レコード設定 (お願い)
- `www.banana.mrrhp.com` 用に以下を設定してください。
  - 種別: `CNAME`
  - ホスト: `www`
  - 値: `yuu-eguci.github.io`
  - TTL: `300` (または DNS 事業者の既定値)
- `www` に既存の `A` / `AAAA` / 重複 `CNAME` がある場合は削除してください。

## GitHub 側設定 (お願い)
- `Settings > Pages > Custom domain` に `www.banana.mrrhp.com` を設定してください。
- HTTPS 証明書発行後に `Enforce HTTPS` を有効化してください。

## 確認コマンド
- `dig www.banana.mrrhp.com CNAME +short`
  - 期待値: `yuu-eguci.github.io`

## オーナー向け要約
- コード側はカスタムドメイン前提の build パスへ変更済みです。
- DNS 側は `www` の `CNAME -> yuu-eguci.github.io` を設定すれば OK です。
- GitHub Pages 設定で Custom domain を入れると、`main` マージごとの自動デプロイがそのまま `www.banana.mrrhp.com` に反映されます。
