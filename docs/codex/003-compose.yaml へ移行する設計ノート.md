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
### 1. リネーム方針
- ルートの `docker-compose.yml` を `compose.yaml` へ単純リネームする。
- 定義内容 ( service / volume / network ) はこのタスクでは変更しない。
- 旧ファイル名は残さない。二重管理を避ける。

### 2. 実行互換性の扱い
- `docker compose up -d` などの既存コマンドはそのまま維持する。
- `docker compose` はデフォルトで `compose.yaml` を読むため、通常運用の操作感は変わらない。
- もし手元スクリプトで `-f docker-compose.yml` を明示している場合だけ影響が出るので、リポジトリ内の該当箇所は事前に全件置換する。

### 3. ドキュメント更新方針
- `README.md` のファイル名言及を `compose.yaml` に揃える。
- `docs/codex/002-compose で Django と React を一括起動.md` に残っている `docker-compose.yml` 表記を `compose.yaml` に揃える。
- コマンド例は原則据え置き。必要があれば「デフォルト参照は `compose.yaml`」の一文だけ足す。

### 4. 確認観点
- `docker compose config` がエラーなく通る。
- `docker compose ps` / `docker compose up -d` が従来どおり動く。
- ルート直下に `docker-compose.yml` が残っていない。
- README と `docs/codex/002...` のファイル名表記が `compose.yaml` に統一されている。

### 5. 実装タスク ( 予定 )
1. `docker-compose.yml` を `compose.yaml` へリネームする。  
2. リポジトリ内の `docker-compose.yml` / `docker-compose.yaml` 参照を検索して更新する。  
3. `docker compose config` と `docker compose ps` で基本動作を確認する。  
4. 変更点を README と設計ノートへ反映する。  

### 6. 受け入れ条件
- Compose 定義ファイル名が `compose.yaml` に統一されている。  
- 日常運用コマンド ( `docker compose up -d` / `docker compose down` / `docker compose logs` ) が変更不要で動く。  
- リポジトリ内に旧ファイル名を前提とした手順が残っていない。  
