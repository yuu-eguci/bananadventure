Docker Compose で Django と React を一括起動
===

## 背景
今は Django と React が別々のコンテナで、それぞれ起動コマンドを打つ必要がある。  
ここを `docker compose up -d` だけで立ち上がる形にしたい。

## ゴール
`docker compose up -d` のみで Django と React が立ち上がる状態にする。  
対象は Django の開発サーバと React の Vite 開発サーバ。  
確認先は `http://localhost:8001/` と `http://localhost:5001/` 。

## 進め方
このタスクは設計を先に固めて、そのあと実装に入る。

## 変更対象の候補
`docker-compose.yml`  
`webapp-container/Dockerfile`  
`webapp/` 配下の起動関連スクリプト ( 必要なら追加 ) 。

## 設計で決めること
起動の責務をどこに寄せるかを決める。

選択肢 A: `docker-compose.yml` の `command` で Django と React を同居起動する  
選択肢 B: `entrypoint` / 起動スクリプトで 2 プロセスを起動する  
選択肢 C: Django と React を別サービスに分ける

選択肢 A は早いけど、プロセス管理が雑になりやすい。  
選択肢 B は管理しやすいけど、スクリプト整備が必要。  
選択肢 C は構成がわかりやすいけど、 Docker の修正量が増える。

## 設計の結論
採用は選択肢 C。  
理由は 1 コンテナ 1 プロセスにできること、 PID 1 とシグナル伝播の問題を避けられること、ログと再起動をサービス単位で扱えること。

前提として `webapp-container/Dockerfile` に Node.js と Yarn が入っているので、同じイメージを Django と React の両方で使える。  
将来的に Node.js を外すときは、 React 用サービスを別イメージに分離する。

障害時の扱いはこうする。  
片方が落ちても、もう片方は継続。  
再起動は dev なので自動化せず、失敗が見える状態を優先する。

## 実装の方針
Django 用と React 用のサービスを分ける。  
どちらも `webapp-container/Dockerfile` のイメージを使う。  
Django は DB の `healthcheck` 通過後に起動。  
依存パッケージの install は「初回だけ」にガードして、 named volume でキャッシュする。  
React は `working_dir` を `webapp/frontend-react` に固定し、 `node_modules` を named volume で保持する。

## 詳細設計
### 1. サービス構成
`webapp-service` は廃止して、 `django-service` と `react-service` を追加する。  
`mysql-service` は継続利用しつつ、 `healthcheck` を追加する。

`docker-compose.yml` の想定差分は次の通り。

```yaml
services:
  mysql-service:
    healthcheck:
      test: ["CMD-SHELL", "mysqladmin ping -h 127.0.0.1 -u$$MYSQL_USER -p$$MYSQL_PASSWORD --silent"]
      interval: 5s
      timeout: 3s
      retries: 20
      start_period: 20s

  django-service:
    build:
      context: ./webapp-container
      dockerfile: Dockerfile
    container_name: gemini-django-container
    working_dir: /webapp
    command: ["bash", "-lc", "./scripts/start-django.sh"]
    ports:
      - "8001:8000"
    tty: true
    stdin_open: true
    volumes:
      - ./webapp:/webapp
      - pipenv-venv:/webapp/.venv
    environment:
      - PIPENV_VENV_IN_PROJECT=1
      - DJANGO_SECRET_KEY=${DJANGO_SECRET_KEY}
      - MYSQL_DATABASE=${MYSQL_DATABASE}
      - MYSQL_USER=${MYSQL_USER}
      - MYSQL_PASSWORD=${MYSQL_PASSWORD}
      - MYSQL_ROOT_PASSWORD=${MYSQL_ROOT_PASSWORD}
      - MYSQL_HOSTNAME=${MYSQL_HOSTNAME}
      - MYSQL_PORT=${MYSQL_PORT}
      - APP_HOST=${APP_HOST}
    depends_on:
      mysql-service:
        condition: service_healthy

  react-service:
    build:
      context: ./webapp-container
      dockerfile: Dockerfile
    container_name: gemini-react-container
    working_dir: /webapp/frontend-react
    command: ["bash", "-lc", "../scripts/start-react.sh"]
    ports:
      - "5001:5173"
      - "4001:4173"
    tty: true
    stdin_open: true
    volumes:
      - ./webapp:/webapp
      - react-node-modules:/webapp/frontend-react/node_modules
    depends_on:
      django-service:
        condition: service_started

volumes:
  pipenv-venv:
  react-node-modules:
```

### 2. 起動スクリプト設計
起動ロジックは `webapp/scripts/` に置く。

- `webapp/scripts/start-django.sh`
  - `.venv` が無いときだけ `pipenv sync --dev` を実行する。
  - `Pipfile.lock` のハッシュを marker ファイルで保持し、差分があれば `pipenv sync --dev` を再実行する。
  - `manage.py migrate` は最大 10 回リトライ ( 3 秒間隔 ) 。
  - 最後に `exec pipenv run python manage.py runserver 0.0.0.0:8000` を実行する。
- `webapp/scripts/start-react.sh`
  - `node_modules` が無いときだけ `yarn install --frozen-lockfile` を実行する。
  - `yarn.lock` のハッシュを marker ファイルで保持し、差分があれば `yarn install --frozen-lockfile` を再実行する。
  - 最後に `exec yarn dev --host 0.0.0.0 --port 5173` を実行する。

### 3. volume 方針
- Python 側は `pipenv-venv:/webapp/.venv` を使って、毎回 `pipenv sync` しない。
- React 側は `react-node-modules:/webapp/frontend-react/node_modules` を使って、毎回 `yarn install` しない。
- ソースコードは従来どおり `./webapp:/webapp` の bind mount で反映する。

### 4. README 更新項目
`webapp-service` 前提の手順は、次の内容に置き換える。

- 起動: `docker compose up -d`
- Django のログ確認: `docker compose logs -f django-service`
- React のログ確認: `docker compose logs -f react-service`
- MySQL のログ確認: `docker compose logs -f mysql-service`
- Django コンテナへ入る: `docker compose exec django-service bash`
- React コンテナへ入る: `docker compose exec react-service bash`
- 個別再起動: `docker compose restart django-service` / `docker compose restart react-service`
- 停止: `docker compose down`

## 実装タスク
1. 既存の `docker-compose.yml` を読み、現在の起動経路を整理する。  
2. `docker-compose.yml` を `django-service` / `react-service` 分割構成へ更新する。  
3. `webapp/scripts/start-django.sh` と `webapp/scripts/start-react.sh` を追加する。  
4. `docker compose up -d` で起動し、 `docker compose ps` と URL で確認する。  
5. `README.md` の運用コマンドを更新する。

## 受け入れ条件
`docker compose up -d` のみで Django と React が起動する。  
追加でコンテナへ入ってコマンドを打つ必要がない。  
`docker compose ps` で `mysql-service` が `healthy` 、 `django-service` / `react-service` が `Up` になる。  
`http://localhost:8001/` と `http://localhost:5001/` にアクセスできる。  
起動失敗時は `docker compose logs mysql-service django-service react-service` で原因を追跡できる。  
`README.md` に最新の手順が反映されている。

## レビュー
### 指摘 1 ( 重要 ): DB 起動待ちの設計が不足しています
`depends_on` だけでは MySQL の接続受け付け開始を保証できません。  
この状態で Django 側の `migrate` を直後に実行すると、起動直後に失敗する可能性があります。

対応要求:
- `mysql-service` に `healthcheck` を追加し、 Django 側は `service_healthy` を待つ構成にしてください。
- もしくは Django 起動スクリプトで DB 接続リトライを入れてください。

対応内容 ( プランナー記入 ) :
- 妥当な指摘。 `mysql-service` に `healthcheck` を追加し、 `django-service` は `depends_on.condition: service_healthy` にする。  
- さらに `start-django.sh` で `migrate` リトライを実施し、起動直後の接続揺れを吸収する。

### 指摘 2 ( 重要 ): 依存パッケージの毎回再インストールは起動時間と安定性を悪化させます
提案では Django で毎回 `pipenv sync --dev` 、 React で毎回 `yarn install` を実行します。  
これは `docker compose up -d` のたびに時間がかかり、ネットワーク状況で失敗しやすくなります。

対応要求:
- 初回のみ実行するガード ( 例: 仮想環境や `node_modules` の存在確認 ) を起動スクリプトに入れてください。
- あわせて依存キャッシュ用 volume の方針を設計に明記してください。

対応内容 ( プランナー記入 ) :
- 妥当な指摘。 `start-django.sh` は `.venv` 存在確認、 `start-react.sh` は `node_modules` 存在確認で初回のみ install する。  
- `pipenv-venv` と `react-node-modules` の named volume を詳細設計に追加した。  
- 追加で lockfile 変更時に再 install できるよう、 `Pipfile.lock` / `yarn.lock` のハッシュ差分判定を設計に追加した。

### 指摘 3 ( 重要 ): React サービスの作業ディレクトリとマウント方針が未定義です
現在のプロジェクト構成では React は `webapp/frontend-react` 配下です。  
`yarn install` と `yarn dev --host` をどの `working_dir` で動かすかが決まっていないため、実装時に破綻するリスクがあります。

対応要求:
- React サービスの `working_dir` を明示してください。
- `./webapp:/webapp` を共通マウントする場合の `node_modules` 取り扱い ( ホスト共有 or named volume ) を明記してください。

対応内容 ( プランナー記入 ) :
- 妥当な指摘。 `react-service` の `working_dir` を `/webapp/frontend-react` に固定する。  
- `node_modules` はホスト共有ではなく named volume ( `react-node-modules` ) を使う方針で設計へ反映した。

### 指摘 4 ( 中 ): サービス分割後の運用コマンド移行が設計に入っていません
現行の README は `webapp-service` 前提で手順が書かれています。  
分割後は `docker compose exec` やログ確認対象が変わるため、移行内容を先に整理しないと混乱します。

対応要求:
- `webapp-service` から `django-service` / `react-service` への移行差分を設計に追加してください。
- README 更新の具体項目 ( 起動、ログ確認、停止、個別再起動 ) を列挙してください。

対応内容 ( プランナー記入 ) :
- 妥当な指摘。 `README` 更新項目として、起動、サービス別ログ確認、停止、個別再起動、 `exec` 先の変更を明記した。  
- 旧 `webapp-service` ベースの運用コマンドは新サービス名へ置換する前提を設計へ追加した。

### 指摘 5 ( 中 ): 受け入れ条件が観測可能性まで定義されていません
受け入れ条件が URL アクセス可否のみだと、片系停止や起動失敗の検知が曖昧です。

対応要求:
- `docker compose ps` で両サービスが `Up` になることを条件に追加してください。
- 起動失敗時の確認手順として `docker compose logs` の確認対象を明記してください。

対応内容 ( プランナー記入 ) :
- 妥当な指摘。受け入れ条件へ `docker compose ps` の状態確認を追加した。  
- あわせて失敗時の一次切り分けとして `docker compose logs mysql-service django-service react-service` を明記した。

### 再レビュー結果
5 件の指摘について、設計への反映を確認した。  
とくに起動待ち、依存キャッシュ、 `working_dir` 、運用コマンド移行、受け入れ条件の観測可能性が具体化されていて、実装に進める粒度になってる。

結論:
- LGTM。レビュー完了。

## 実装後追記 ( 詳細設計から追加で必要になった対応 )
- 想定外として、 `django-service` の `pipenv sync --dev` で DNS 解決失敗 ( `Temporary failure in name resolution` ) が発生した。  
- 追加対応として、 `start-django.sh` に `pipenv sync --dev` の 5 回リトライと、失敗時の明示ログを追加した。  
- 同系の失敗を避けるため、 `start-react.sh` にも `yarn install` の 5 回リトライと、失敗時の明示ログを追加した。  
- さらに `docker-compose.yml` の `django-service` / `react-service` に `dns` ( `1.1.1.1` / `8.8.8.8` ) を明示して、 Docker 側 DNS 影響を受けにくくした。  
- README には、 DNS エラー時の再作成手順 ( `docker compose up -d --force-recreate django-service react-service` ) を追記した。  
- この追加対応により、設計時よりも「ネットワーク不安定時の起動耐性」と「障害切り分けのしやすさ」を強化した。

## オーナー向け要約
- あなたの要望「 `docker compose up -d` だけで Django と React を起動したい」は、 `webapp-service` を `django-service` と `react-service` に分離する設計と実装で反映した。  
- 起動安定性の要望は、 MySQL の `healthcheck` + Django 側の起動待ち + `migrate` リトライで反映した。  
- 起動時間と運用性の要望は、 `.venv` / `node_modules` の named volume キャッシュと、 `Pipfile.lock` / `yarn.lock` 変更時の再 install 条件で反映した。  
- 実装後に発生した DNS 由来の依存取得失敗には、 install リトライ追加と compose の DNS 明示で追加対応した。  
- README も、起動・ログ確認・停止・個別再起動・`exec` 先の変更に加えて、 DNS エラー時の復旧手順まで含めて更新した。
