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
Django は `pipenv sync --dev` と `migrate` の後に `runserver` を起動します。  
React は `yarn install` の後に `yarn dev --host` を起動します。

## 実装タスク
1. 既存の `docker-compose.yml` を読み、現在の起動経路を整理します。  
2. 設計の結論に沿って `Docker Compose` / `Dockerfile` / スクリプト を変更します。  
3. `docker compose up -d` だけで Django と React が起動することを確認します。  
4. `README.md` の起動手順を更新します。

## 受け入れ条件
`docker compose up -d` のみで Django と React が起動します。  
追加でコンテナへ入ってコマンドを打つ必要がありません。  
`README.md` に最新の手順が反映されています。

## レビュー
### 指摘 1 (重要): DB 起動待ちの設計が不足しています
`depends_on` だけでは MySQL の接続受け付け開始を保証できません。  
この状態で Django 側の `migrate` を直後に実行すると、起動直後に失敗する可能性があります。

対応要求:
- `mysql-service` に `healthcheck` を追加し、 Django 側は `service_healthy` を待つ構成にしてください。
- もしくは Django 起動スクリプトで DB 接続リトライを入れてください。

対応内容 (プランナー記入):
- 未対応

### 指摘 2 (重要): 依存パッケージの毎回再インストールは起動時間と安定性を悪化させます
提案では Django で毎回 `pipenv sync --dev` 、 React で毎回 `yarn install` を実行します。  
これは `docker compose up -d` のたびに時間がかかり、ネットワーク状況で失敗しやすくなります。

対応要求:
- 初回のみ実行するガード (例: 仮想環境や `node_modules` の存在確認) を起動スクリプトに入れてください。
- あわせて依存キャッシュ用 volume の方針を設計に明記してください。

対応内容 (プランナー記入):
- 未対応

### 指摘 3 (重要): React サービスの作業ディレクトリとマウント方針が未定義です
現在のプロジェクト構成では React は `webapp/frontend-react` 配下です。  
`yarn install` と `yarn dev --host` をどの `working_dir` で動かすかが決まっていないため、実装時に破綻するリスクがあります。

対応要求:
- React サービスの `working_dir` を明示してください。
- `./webapp:/webapp` を共通マウントする場合の `node_modules` 取り扱い (ホスト共有 or named volume) を明記してください。

対応内容 (プランナー記入):
- 未対応

### 指摘 4 (中): サービス分割後の運用コマンド移行が設計に入っていません
現行の README は `webapp-service` 前提で手順が書かれています。  
分割後は `docker compose exec` やログ確認対象が変わるため、移行内容を先に整理しないと混乱します。

対応要求:
- `webapp-service` から `django-service` / `react-service` への移行差分を設計に追加してください。
- README 更新の具体項目 (起動、ログ確認、停止、個別再起動) を列挙してください。

対応内容 (プランナー記入):
- 未対応

### 指摘 5 (中): 受け入れ条件が観測可能性まで定義されていません
受け入れ条件が URL アクセス可否のみだと、片系停止や起動失敗の検知が曖昧です。

対応要求:
- `docker compose ps` で両サービスが `Up` になることを条件に追加してください。
- 起動失敗時の確認手順として `docker compose logs` の確認対象を明記してください。

対応内容 (プランナー記入):
- 未対応
