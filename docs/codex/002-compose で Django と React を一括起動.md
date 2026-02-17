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
