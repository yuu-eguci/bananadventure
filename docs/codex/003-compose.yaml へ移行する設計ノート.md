compose.yaml へ移行する設計ノート
===

## 背景
Compose の標準ファイル名は `compose.yaml` が推奨されていて、 `docker-compose.yaml` / `docker-compose.yml` はレガシー扱いになっている。  
このリポジトリでは今 `docker-compose.yml` を使っているので、標準名へ寄せたい。

## 今回の要望
Compose 定義ファイルを `compose.yaml` ベースに移行して、日常の `docker compose` 運用がそのまま通る状態にしたい。

## ゴール
- ルートの Compose 定義が `compose.yaml` で管理される。
- 既存の起動・停止・ログ確認コマンドは、基本的にコマンド変更なしで実行できる。
- README と設計ノートの記述が新ファイル名に揃っている。

## 非ゴール
- サービス構成 ( `mysql-service` / `django-service` / `react-service` ) の再設計はしない。
- 既存のコンテナ起動ロジックやポート構成は変えない。

## 変更対象の候補
- `docker-compose.yml` ( リネーム元 )
- `compose.yaml` ( リネーム先 )
- `README.md` ( 参照ファイル名の更新 )
- `docs/codex/002-compose で Django と React を一括起動.md` ( 過去ノートの呼称整理 )

## 進め方
このノートで先に詳細設計を固めて、 LGTM 後に実装へ進む。

## 詳細設計
( ここに【プランナー、実装者】が追記する )
