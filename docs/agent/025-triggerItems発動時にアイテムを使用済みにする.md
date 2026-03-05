# triggerItems 発動時にアイテムを使用済みにする

## タスク概要
scene 11 「豆乳バナナが腐って豆乳ヨーグルトに！」に triggerItems で到達したとき、
プレイヤーの豆乳バナナ (item id: 0) を自動的に `used: true` にしたい。

### 企画上の理由
- 豆乳バナナが腐って豆乳ヨーグルトになった、という設定
- 実際には「消費された」扱いにするべき

### 現状の問題
- `resolveTriggeredScene` は scene を返すだけで、player の items を変更しない
- よって scene 11 に飛んでも豆乳バナナは `used: false` のまま残り続ける

### 修正対象ファイル
- `webapp/frontend-react/src/services/SceneService.ts`
  - `resolveTriggeredScene` のシグネチャと実装を変更する
  - 呼び出し元 (`selectSceneChoice`, `useItem`) も変更が必要

## 詳細設計（プランナー記入欄）
### 変更のゴール
- `triggerItems` による遷移が発生した瞬間に、発動条件となったアイテムを `used: true` に更新する
- 今回の企画要件として、`scene 10 -> scene 11` の発動時に豆乳バナナ (`item id: 0`) が確実に消費されるようにする
- 既存の「トリガー再帰解決」「ゲームオーバー優先」の挙動は壊さない

### 実装方針
- 特定シーンのハードコードは避ける
  - `scene 11` 専用分岐を増やさず、`triggerItems` が発動したら「発動に使った未使用アイテムを 1 つ消費する」共通仕様にする
- `resolveTriggeredScene` は Scene だけでなく Player も更新対象にする
  - 現状: `Promise<Scene>`
  - 変更後: `Promise<{ scene: Scene; player: Player }>`
- `resolveTriggeredScene` 呼び出し元 (`selectSceneChoice`, `useItem`) は、返却された `scene` と `player` の両方を採用する

### `resolveTriggeredScene` の詳細仕様
- 入力
  - `scene: Scene`（トリガー判定の開始シーン）
  - `player: Player`（最新プレイヤー状態）
- 出力
  - `scene: Scene`（トリガー再帰解決後の最終シーン）
  - `player: Player`（トリガー消費を反映したプレイヤー）
- 処理手順
  1. `updatedScene` と `updatedPlayer` をローカル変数で保持して `while` ループ開始
  2. `updatedScene.triggerItems` を先頭から評価
  3. 各 `triggerItem` で `updatedPlayer.items` から「`id` 一致かつ `used === false`」のアイテムを 1 件探す
  4. 見つかったらその 1 件のみ `used: true` に更新し、`itemsChanged = true` を立てる
  5. その後 `nextSceneId` の Scene を取得して `updatedScene` を更新し、`for` を抜けて次の `while` へ進む
  6. どの `triggerItem` も発動しなければ `while` を終了し、`{ scene: updatedScene, player: updatedPlayer }` を返す
- 補足
  - 同一 ID アイテムを複数持っているケースでは、未使用の 1 件だけを消費する
  - `triggerItems` の優先順は現状どおり配列順を維持する（最初に発動した 1 件を採用）

### 呼び出し元メソッドの変更点
- `selectSceneChoice`
  - `updatedScene` 決定後に `resolveTriggeredScene` を呼び、戻り値の `scene` / `player` を両方反映する
  - これにより、選択遷移中に発動した `triggerItems` 消費がそのまま ViewModel に載る
- `useItem`
  - 既存のアイテム使用処理で作成した `updatedPlayer` を `resolveTriggeredScene` に渡す
  - 戻り値の `player` を最終採用し、`useItem` 起点のトリガー発動でも消費状態が整合する
  - `bananaMeter <= 0` のゲームオーバー分岐優先は現状維持（ゲームオーバー時はトリガー解決しない）

### 受け入れ条件
- 豆乳バナナ未使用で `scene 10` に入ると、`scene 11` へ遷移し、同時に豆乳バナナが `used: true` になる
- `scene 11` から戻って再度 `scene 10` に来ても、同じ豆乳バナナでは再発動しない
- `selectSceneChoice` 起点でも `useItem` 起点でも、`triggerItems` 発動時の消費ルールが一致する
- 既存の `bananaMeter <= 0 -> scene 15` は挙動が変わらない

### 非対象（今回やらないこと）
- `triggerItems` 発動時の演出追加（メッセージ、アニメーション、SE）
- `triggerItems` によるばななメーター増減ルール追加
- JSON データ構造の変更（`triggerItems` / `items` スキーマ変更）

## レビュー（レビュワー記入欄）
<!-- claude が記入してください -->
