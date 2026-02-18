ALLOWED_HOSTS で localhost を許可する
===

## 背景
Docker 開発環境起動後に `http://localhost:8001/` へアクセスすると、次のエラーが発生する。  
`Invalid HTTP_HOST header: 'localhost:8001'. You may need to add 'localhost' to ALLOWED_HOSTS.`

## 今回の要望
Django 側の `ALLOWED_HOSTS` 設定を見直して、 `localhost:8001` アクセス時にエラーにならないようにしたい。

## ゴール
- Docker 開発環境で `http://localhost:8001/` にアクセスしても `Invalid HTTP_HOST header` が出ない。
- 既存のコンテナ間ホスト名利用 ( `APP_HOST` ) を壊さない。
- 変更内容がドキュメントに反映される。

## 非ゴール
- CORS や CSRF の別問題対応。
- 本番用 settings の全面見直し。

## 変更対象の候補
- `webapp/config/settings.py`
- `local.env` ( 必要なら )
- `README.md` ( 必要なら )

## 進め方
このノートで先に詳細設計を固めて、 LGTM 後に実装へ進む。

## 詳細設計
( ここに【プランナー、実装者】が追記する )
