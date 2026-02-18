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
- `docs/agent/002-compose で Django と React を一括起動.md` ( 過去ノートの呼称整理 )

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
- `docs/agent/002-compose で Django と React を一括起動.md` に残っている `docker-compose.yml` 表記を `compose.yaml` に揃える。
- README に「Compose ファイル名移行メモ」を追加し、旧指定からの置換例を入れる。
- 置換例は最低 1 つ載せる ( 例: `docker compose -f docker-compose.yml up -d` → `docker compose up -d` ) 。

### 4. 確認観点
- `docker compose config` がエラーなく通る。
- `docker compose ps` / `docker compose up -d` が従来どおり動く。
- ルート直下に `docker-compose.yml` が残っていない。
- README と `docs/agent/002...` のファイル名表記が `compose.yaml` に統一されている。
- `.github/workflows/` / `scripts/` / `Makefile*` を含むリポジトリ全体で、旧ファイル名の明示指定が残っていない。

### 5. 実装タスク ( 予定 )
1. `docker-compose.yml` を `compose.yaml` へリネームする。  
2. リポジトリ内の `docker-compose.yml` / `docker-compose.yaml` 参照を検索して更新する。  
3. `.github/workflows/` / `scripts/` / `Makefile*` の旧ファイル名明示指定を確認し、必要なら更新する。  
4. `docker compose config` と `docker compose ps` で基本動作を確認する。  
5. README に移行メモ ( 旧→新コマンド例 ) を追記し、設計ノートへ反映する。  

### 6. 受け入れ条件
- `compose.yaml` が存在し、 `docker-compose.yml` が存在しない ( `test -f compose.yaml && test ! -f docker-compose.yml` ) 。  
- `docker compose config` が成功する。  
- 日常運用コマンド ( `docker compose up -d` / `docker compose down` / `docker compose logs` ) が変更不要で動く。  
- リポジトリ内に旧ファイル名を前提とした手順が残っていない ( `rg -n \"docker-compose\\.ya?ml\" .` で意図した記録以外が 0 件 ) 。  

## レビュー
### 指摘 1 ( 重要 ): 自動化ジョブへの影響確認が設計に不足
ローカル手順の更新は書かれているけど、 CI / 補助スクリプト / Makefile などの非対話系呼び出しに対する確認観点が弱い。  
ここを落とすと、実装後に CI だけ壊れるパターンが残る。

対応要求:
- リポジトリ全体で `-f docker-compose.yml` / `docker-compose.yml` を使う箇所の確認対象を、設計上のチェックリストとして明記すること。
- `.github/workflows/` やスクリプト類を確認対象に含めること。

対応内容 ( プランナー記入 ) :
- 妥当な指摘。詳細設計の「確認観点」と「実装タスク」に、 `.github/workflows/` / `scripts/` / `Makefile*` を含む全体確認を追加した。  
- 実装時は `rg -n \"docker-compose\\.ya?ml\"` を使って網羅確認する前提にした。  

### 指摘 2 ( 中 ): 旧ファイル名利用者への移行ガイドが不足
チーム内で慣習的に `docker compose -f docker-compose.yml ...` を叩いているメンバーがいると、今回の変更は手元で即失敗する。  
README 更新だけだと気づきにくい。

対応要求:
- README に「`compose.yaml` へ移行した」旨の明示セクションを追加する設計にすること。
- 旧コマンドから新コマンドへの置換例を 1 つ以上書くこと。

対応内容 ( プランナー記入 ) :
- 妥当な指摘。詳細設計の「ドキュメント更新方針」に README の移行メモ追加を明記した。  
- 置換例 ( `docker compose -f docker-compose.yml up -d` → `docker compose up -d` ) を最低 1 つ載せる要件を追記した。  

### 指摘 3 ( 中 ): 受け入れ条件に「旧ファイル不在チェック」の客観性が足りない
「残っていない」は意図としては正しいけど、実行手順として観測可能な形になっていない。  
受け入れ判定の再現性を上げたい。

対応要求:
- 受け入れ条件に `test ! -f docker-compose.yml` 相当の確認を追加すること。
- ついでに `docker compose config` の成功を必須判定として明記すること。

対応内容 ( プランナー記入 ) :
- 妥当な指摘。受け入れ条件を実行可能なコマンドベースへ更新した。  
- `test -f compose.yaml && test ! -f docker-compose.yml` と `docker compose config` 成功を必須判定に追加した。  

### 再レビュー結果
3 件の指摘が設計本文へ反映され、確認コマンドまで具体化されたことを確認した。  
この粒度なら実装フェーズで迷わず進められる。

結論:
- LGTM。レビュー完了。

## 実装結果
- `docker-compose.yml` を `compose.yaml` にリネームした。
- `docs/agent/002-compose で Django と React を一括起動.md` の旧ファイル名表記を `compose.yaml` に統一した。
- `README.md` に「Compose ファイル名移行メモ」を追加し、旧→新コマンド例 ( `docker compose -f docker-compose.yml up -d` → `docker compose up -d` ) を追記した。
- 検証結果:
  - `test -f compose.yaml && test ! -f docker-compose.yml` は成功。
  - `docker compose config` は成功。
  - `docker compose ps` は `mysql-service` / `django-service` / `react-service` が稼働中であることを確認。
  - `rg -n "docker-compose\\.ya?ml" -S .` の結果、残件は README の移行ガイドと本設計ノート内の履歴記述のみ。

## オーナー向け要約
- Compose 定義ファイルは `docker-compose.yml` から `compose.yaml` へ実際に移行した。  
- `docker compose up -d` / `down` / `logs` などの通常運用コマンドは変更なしで使える。  
- `docs/agent/002...` の記述も `compose.yaml` 前提へ更新して、設計との整合を取った。  
- README に移行メモと旧→新コマンド例を追加して、 `-f docker-compose.yml` 利用者が迷わないようにした。  
- `test` / `docker compose config` / `docker compose ps` / `rg` で移行状態を確認済み。  
