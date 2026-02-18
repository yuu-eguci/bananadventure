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
### 1. 原因整理
- 現在の `webapp/config/settings.py` は `ALLOWED_HOSTS = [os.environ['APP_HOST']]` 固定。
- `local.env` の `APP_HOST` は `gemini-django-container` なので、ブラウザアクセス時の `Host: localhost:8001` が拒否される。

### 2. 修正方針
- `APP_HOST` は既存互換のため維持する。
- 開発アクセスで確実に使う `localhost` / `127.0.0.1` / `[::1]` を `ALLOWED_HOSTS` へ追加する。
- 任意ホストの追加用に `APP_EXTRA_ALLOWED_HOSTS` ( カンマ区切り ) をサポートする。
- `ALLOWED_HOSTS` 生成時に空文字除去と重複除去を行う。

### 3. 実装仕様
- 対象: `webapp/config/settings.py`
- 追加ロジック:
  - `APP_HOST` を 1 件目として採用。
  - 既定ホスト `localhost`, `127.0.0.1`, `[::1]` を追加。
  - `APP_EXTRA_ALLOWED_HOSTS` を `split(',')` して trim 後に追加。
  - 順序維持で重複除去して `ALLOWED_HOSTS` を作る。
- `APP_HOST` が空でも落ちないように `os.environ.get` を使う。

### 4. ドキュメント更新方針
- `README.md` に `APP_EXTRA_ALLOWED_HOSTS` の説明は必須ではない。
- ただし運用で迷いを減らすため、 `local.env` の `APP_HOST` 意味を 1 行コメントで補足する。

### 5. 確認観点
- Django shell / `manage.py check` で `ALLOWED_HOSTS` に `localhost` が含まれること。
- 既存の `APP_HOST` ( `gemini-django-container` ) も引き続き含まれること。
- `APP_EXTRA_ALLOWED_HOSTS=foo.example,bar.local` を与えたときに両方入ること。

### 6. 実装タスク ( 予定 )
1. `settings.py` の `ALLOWED_HOSTS` 生成ロジックを更新する。  
2. 必要なら `local.env` に補足コメントを追加する。  
3. `docker compose exec django-service ...` で `ALLOWED_HOSTS` の値を確認する。  

### 7. 受け入れ条件
- `http://localhost:8001/` アクセスで `Invalid HTTP_HOST header` が再発しない。  
- `ALLOWED_HOSTS` に `localhost` と `APP_HOST` の両方が含まれる。  
- 既存の Docker 起動手順はそのまま維持される。  
