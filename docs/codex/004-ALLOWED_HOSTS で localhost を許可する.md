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
- `APP_HOST` は必須のままにして、未設定時は起動時に失敗させる ( fail fast ) 。
- 開発アクセスで確実に使う `localhost` / `127.0.0.1` / `[::1]` を `ALLOWED_HOSTS` へ追加する。
- `ALLOWED_HOSTS` 生成時に空文字除去と重複除去を行う。

### 3. 実装仕様
- 対象: `webapp/config/settings.py`
- 追加ロジック:
  - `APP_HOST` を 1 件目として採用 ( `os.environ['APP_HOST']` ) 。
  - 既定ホスト `localhost`, `127.0.0.1`, `[::1]` を追加。
  - 順序維持で重複除去して `ALLOWED_HOSTS` を作る。

### 4. ドキュメント更新方針
- このタスクでは新しい env は増やさない。
- `README.md` / `local.env` は変更しない。

### 5. 確認観点
- Django shell / `manage.py check` で `ALLOWED_HOSTS` に `localhost` が含まれること。
- 既存の `APP_HOST` ( `gemini-django-container` ) も引き続き含まれること。
- `curl -H \"Host: localhost:8001\" http://localhost:8001/` で `Invalid HTTP_HOST header` が出ないこと。

### 6. 実装タスク ( 予定 )
1. `settings.py` の `ALLOWED_HOSTS` 生成ロジックを更新する。  
2. `docker compose exec django-service ...` で `ALLOWED_HOSTS` の値を確認する。  
3. `curl -H \"Host: localhost:8001\" http://localhost:8001/` で実リクエスト確認する。  

### 7. 受け入れ条件
- `http://localhost:8001/` アクセスで `Invalid HTTP_HOST header` が再発しない。  
- `ALLOWED_HOSTS` に `localhost` と `APP_HOST` の両方が含まれる。  
- 既存の Docker 起動手順はそのまま維持される。  

## レビュー
### 指摘 1 ( 重要 ): `APP_HOST` を必須扱いから外す方針のリスク整理が不足
提案では `os.environ.get` へ変更する案があるけど、設定漏れをサイレントに見逃すリスクがある。  
`APP_HOST` が空でも起動できる設計は、意図しないホスト制限の緩みにつながる。

対応要求:
- `APP_HOST` は従来どおり必須扱いを維持するか、空の場合の挙動を明確に定義すること。
- 少なくとも設計上で「設定漏れを検知する」か「意図的に許容する」かを明言すること。

対応内容 ( プランナー記入 ) :
- 妥当な指摘。 `APP_HOST` は必須扱いを維持し、 `os.environ['APP_HOST']` を使う方針に固定した。  
- 設定漏れは fail fast で検知する設計へ更新した。  

### 指摘 2 ( 中 ): `APP_EXTRA_ALLOWED_HOSTS` 追加時のドキュメント不足
新規 env を追加するなら、利用方法がどこにも書かれないと運用で迷う。  
`README` か `local.env` のどちらかには具体例が必要。

対応要求:
- `APP_EXTRA_ALLOWED_HOSTS` を導入するなら、設定例 ( カンマ区切り ) を 1 箇所に明記すること。
- 導入しないなら、設計から削除して範囲を絞ること。

対応内容 ( プランナー記入 ) :
- 妥当な指摘。今回タスクは最小修正を優先し、 `APP_EXTRA_ALLOWED_HOSTS` 案は削除した。  
- 新規 env を増やさない構成へ整理した。  

### 指摘 3 ( 中 ): 検証が Python 内省のみで HTTP リクエスト確認が不足
`ALLOWED_HOSTS` の配列確認だけでは、実アクセス時の Host ヘッダ判定まで保証できない。  
最低 1 回は `localhost:8001` への HTTP 到達確認がほしい。

対応要求:
- 受け入れ条件に `curl -H \"Host: localhost:8001\" ...` かブラウザアクセス確認を明記すること。
- 実装タスクにも実リクエスト確認手順を追加すること。

対応内容 ( プランナー記入 ) :
- 妥当な指摘。確認観点、実装タスク、受け入れ条件に実リクエスト確認を追加した。  
- `curl -H \"Host: localhost:8001\" http://localhost:8001/` で再現しないことを判定に含める。  

### 再レビュー結果
3 件の指摘が設計本文へ反映されたことを確認した。  
修正範囲が最小で、受け入れ確認手順も具体化されている。

結論:
- LGTM。レビュー完了。

## オーナー向け要約
- 原因は `ALLOWED_HOSTS` が `APP_HOST` の 1 件固定だったこと。  
- `APP_HOST` は必須のまま維持しつつ、 `localhost` / `127.0.0.1` / `[::1]` を追加する設計に確定した。  
- 新しい env は追加せず、最小差分で `localhost:8001` のエラーを解消する。  
- 検証は設定値確認だけでなく、 `curl` で実リクエスト確認まで実施する。  
