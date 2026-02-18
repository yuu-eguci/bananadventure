Docker Compose で Django と React を一括起動
===

## 背景
現状は Django と React が別々のコンテナに分かれていて、それぞれ起動コマンドを実行する必要があります。  
これを `docker compose up -d` だけで起動できる形にしたいです。

## ゴール
`docker compose up -d` のみで Django と React が立ち上がる状態にします。  
対象は Django の開発サーバと React の Vite 開発サーバです。  
確認は `http://localhost:8001/` と `http://localhost:5001/` で行います。

## 進め方
このタスクは設計を先にまとめ、その後に実装へ移ります。

## 変更対象の候補
`docker-compose.yml`  
`webapp-container/Dockerfile`  
`webapp/` 配下の起動関連スクリプト。必要なら追加します。

## 設計で決めること
起動の責務をどこに寄せるかを決めます。

選択肢 A: `docker-compose.yml` の `command` で Django と React を同居起動する  
選択肢 B: `entrypoint` / 起動スクリプトで 2 プロセスを起動する  
選択肢 C: Django と React を別サービスに分ける

選択肢 A は早いが、プロセス管理が雑になりやすいです。  
選択肢 B は管理しやすいが、スクリプト整備が必要です。  
選択肢 C は構成が分かりやすいが、 Docker の修正量が増えます。

## 設計の結論
採用は選択肢 C です。  
理由は 1 コンテナ 1 プロセスにできること、 PID 1 とシグナル伝播の問題を避けられること、ログと再起動をサービス単位で扱えることです。

前提条件として `webapp-container/Dockerfile` に Node.js と Yarn が含まれているため、同じイメージを Django と React の両方で使えます。  
もし今後 Node.js が外れる場合は、 React 用サービスを別イメージに分離します。

障害時の扱いは以下です。  
片方が落ちたときはもう片方は継続します。  
再起動は dev なので自動化せず、失敗を見える化します。

## 実装の方針
Django 用と React 用のサービスを分けます。  
どちらも `webapp-container/Dockerfile` のイメージを使います。  
Django は DB の `healthcheck` 通過後に起動します。  
依存パッケージのインストールは「初回だけ」にガードし、 named volume でキャッシュします。  
React は `working_dir` を `webapp/frontend-react` に固定し、 `node_modules` を named volume で保持します。

## 詳細設計
### 1. サービス構成
`webapp-service` を廃止し、 `django-service` と `react-service` を追加します。  
`mysql-service` は継続利用し、 `healthcheck` を追加します。

`docker-compose.yml` の想定差分は次の通りです。

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
起動ロジックは `webapp/scripts/` に置きます。

- `webapp/scripts/start-django.sh`
  - `.venv` が無いときだけ `pipenv sync --dev` を実行します。
  - `manage.py migrate` は最大 10 回リトライします (3 秒間隔) 。
  - 最後に `exec pipenv run python manage.py runserver 0.0.0.0:8000` を実行します。
- `webapp/scripts/start-react.sh`
  - `node_modules` が無いときだけ `yarn install --frozen-lockfile` を実行します。
  - 最後に `exec yarn dev --host 0.0.0.0 --port 5173` を実行します。

### 3. volume 方針
- Python 側は `pipenv-venv:/webapp/.venv` を使い、毎回 `pipenv sync` しない設計にします。
- React 側は `react-node-modules:/webapp/frontend-react/node_modules` を使い、毎回 `yarn install` しない設計にします。
- ソースコードは従来通り `./webapp:/webapp` の bind mount で反映します。

### 4. README 更新項目
`webapp-service` 前提の手順を次のように置き換えます。

- 起動: `docker compose up -d`
- Django のログ確認: `docker compose logs -f django-service`
- React のログ確認: `docker compose logs -f react-service`
- MySQL のログ確認: `docker compose logs -f mysql-service`
- Django コンテナへ入る: `docker compose exec django-service bash`
- React コンテナへ入る: `docker compose exec react-service bash`
- 個別再起動: `docker compose restart django-service` / `docker compose restart react-service`
- 停止: `docker compose down`

## 実装タスク
1. 既存の `docker-compose.yml` を読み、現在の起動経路を整理します。  
2. `docker-compose.yml` を `django-service` / `react-service` 分割構成へ更新します。  
3. `webapp/scripts/start-django.sh` と `webapp/scripts/start-react.sh` を追加します。  
4. `docker compose up -d` で起動し、 `docker compose ps` と URL で確認します。  
5. `README.md` の運用コマンドを更新します。

## 受け入れ条件
`docker compose up -d` のみで Django と React が起動します。  
追加でコンテナへ入ってコマンドを打つ必要がありません。  
`docker compose ps` で `mysql-service` が `healthy` 、 `django-service` / `react-service` が `Up` になります。  
`http://localhost:8001/` と `http://localhost:5001/` にアクセスできます。  
起動失敗時は `docker compose logs mysql-service django-service react-service` で原因を追跡できます。  
`README.md` に最新の手順が反映されています。

## レビュー
### 指摘 1 (重要): DB 起動待ちの設計が不足しています
`depends_on` だけでは MySQL の接続受け付け開始を保証できません。  
この状態で Django 側の `migrate` を直後に実行すると、起動直後に失敗する可能性があります。

対応要求:
- `mysql-service` に `healthcheck` を追加し、 Django 側は `service_healthy` を待つ構成にしてください。
- もしくは Django 起動スクリプトで DB 接続リトライを入れてください。

対応内容 (プランナー記入):
- 妥当な指摘です。 `mysql-service` に `healthcheck` を追加し、 `django-service` は `depends_on.condition: service_healthy` にします。  
- さらに `start-django.sh` で `migrate` リトライを実施し、起動直後の接続揺れを吸収します。

### 指摘 2 (重要): 依存パッケージの毎回再インストールは起動時間と安定性を悪化させます
提案では Django で毎回 `pipenv sync --dev` 、 React で毎回 `yarn install` を実行します。  
これは `docker compose up -d` のたびに時間がかかり、ネットワーク状況で失敗しやすくなります。

対応要求:
- 初回のみ実行するガード (例: 仮想環境や `node_modules` の存在確認) を起動スクリプトに入れてください。
- あわせて依存キャッシュ用 volume の方針を設計に明記してください。

対応内容 (プランナー記入):
- 妥当な指摘です。 `start-django.sh` は `.venv` 存在確認、 `start-react.sh` は `node_modules` 存在確認で初回のみ install します。  
- `pipenv-venv` と `react-node-modules` の named volume を詳細設計に追加しました。

### 指摘 3 (重要): React サービスの作業ディレクトリとマウント方針が未定義です
現在のプロジェクト構成では React は `webapp/frontend-react` 配下です。  
`yarn install` と `yarn dev --host` をどの `working_dir` で動かすかが決まっていないため、実装時に破綻するリスクがあります。

対応要求:
- React サービスの `working_dir` を明示してください。
- `./webapp:/webapp` を共通マウントする場合の `node_modules` 取り扱い (ホスト共有 or named volume) を明記してください。

対応内容 (プランナー記入):
- 妥当な指摘です。 `react-service` の `working_dir` を `/webapp/frontend-react` に固定します。  
- `node_modules` はホスト共有ではなく named volume (`react-node-modules`) を使う方針で設計へ反映しました。

### 指摘 4 (中): サービス分割後の運用コマンド移行が設計に入っていません
現行の README は `webapp-service` 前提で手順が書かれています。  
分割後は `docker compose exec` やログ確認対象が変わるため、移行内容を先に整理しないと混乱します。

対応要求:
- `webapp-service` から `django-service` / `react-service` への移行差分を設計に追加してください。
- README 更新の具体項目 (起動、ログ確認、停止、個別再起動) を列挙してください。

対応内容 (プランナー記入):
- 妥当な指摘です。 `README` 更新項目として、起動、サービス別ログ確認、停止、個別再起動、 `exec` 先の変更を明記しました。  
- 旧 `webapp-service` ベースの運用コマンドは新サービス名へ置換する前提を設計へ追加しました。

### 指摘 5 (中): 受け入れ条件が観測可能性まで定義されていません
受け入れ条件が URL アクセス可否のみだと、片系停止や起動失敗の検知が曖昧です。

対応要求:
- `docker compose ps` で両サービスが `Up` になることを条件に追加してください。
- 起動失敗時の確認手順として `docker compose logs` の確認対象を明記してください。

対応内容 (プランナー記入):
- 妥当な指摘です。受け入れ条件へ `docker compose ps` の状態確認を追加しました。  
- あわせて失敗時の一次切り分けとして `docker compose logs mysql-service django-service react-service` を明記しました。

### 再レビュー結果
5 件の指摘について、設計への反映を確認した。  
とくに起動待ち、依存キャッシュ、 `working_dir` 、運用コマンド移行、受け入れ条件の観測可能性が具体化されていて、実装に進める粒度になってる。

結論:
- LGTM。レビュー完了。
