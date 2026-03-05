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
  4. 見つかったら `updatedPlayer.items` を `.map()` でイミュータブルに更新し、該当 1 件のみ `used: true` に変更する
  5. 同時に `updatedPlayer.itemsChanged = true` を設定する
  6. `nextSceneId` の Scene を取得して `updatedScene` を更新する
  7. `for` ループを `break` し、次の `while` イテレーションへ進む
  8. どの `triggerItem` も発動しなければ `while` を終了し、`{ scene: updatedScene, player: updatedPlayer }` を返す
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
- 何らかのルートで再度 `scene 10` に来た場合でも、すでに `used: true` の同一アイテムでは再発動しない
- 同一 `item id` のアイテムを複数保持している場合、`triggerItems` 発動 1 回につき未使用アイテム 1 件だけが消費される
- `selectSceneChoice` 起点でも `useItem` 起点でも、`triggerItems` 発動時の消費ルールが一致する
- 既存の `bananaMeter <= 0 -> scene 15` は挙動が変わらない

### 非対象（今回やらないこと）
- `triggerItems` 発動時の演出追加（メッセージ、アニメーション、SE）
- `triggerItems` によるばななメーター増減ルール追加
- JSON データ構造の変更（`triggerItems` / `items` スキーマ変更）

## レビュー（レビュワー記入欄）

### レビュー指摘事項

#### 1. ❌ `itemsChanged = true` の記述が不完全
**問題点**: 設計書 34 行目 (ステップ 4) に「`itemsChanged = true` を立てる」とあるけど、これは `updatedPlayer.itemsChanged = true` と書くべきだよ。`itemsChanged` という独立したローカル変数を作る指示に読めてしまう。実装時に混乱する可能性がある。

**修正案**: 「その 1 件のみ `used: true` に更新し、`updatedPlayer.itemsChanged = true` を立てる」

#### 2. ❌ Player のイミュータブル更新が明示されていない
**問題点**: 設計書では「`updatedPlayer` をローカル変数で保持」とあるけど、実際には items 配列の更新が必要。TypeScript / React の世界では Player や items をイミュータブルに更新する必要があるのに、そのやり方が書かれてないよ。

現状の `useItem` (113-115 行目) を見ると `.map()` でイミュータブルに更新しているよね。同じ処理を `resolveTriggeredScene` 内でも行う必要があるけど、設計書にその記述がないんだ。

**修正案**: 処理手順ステップ 4 に「`updatedPlayer.items` を `.map()` でイミュータブルに更新して、該当 item の `used` を `true` に変更する」と明記すべき。

#### 3. ⚠️ 処理手順ステップ 4「その後 nextSceneId の Scene を取得」の曖昧さ
**問題点**: 「その後 `nextSceneId` の Scene を取得して `updatedScene` を更新し、`for` を抜けて次の `while` へ進む」という記述があるけど、「`for` を抜けて」という表現がちょっと曖昧かも。

実装的には `break` で `for` を抜けるのは正しいんだけど、その後 `while` の次のイテレーションに進むまでの流れが一文にまとまってて読みにくい。

**修正案**: 「`nextSceneId` の Scene を取得して `updatedScene` を更新し、`for` ループを抜けて次の `while` イテレーションへ進む」と明確に書くか、ステップを分けるといいかも。

#### 4. ⚠️ 受け入れ条件に「再発動しない」ケースのシナリオが不明瞭
**問題点**: 受け入れ条件 63 行目「`scene 11` から戻って再度 `scene 10` に来ても、同じ豆乳バナナでは再発動しない」とあるけど、「`scene 11` から戻る」ってどういうルート？ `scene 11` から `scene 10` への遷移が実際のデータ上にあるのか、テストケースとして想定しているのかが不明。

この条件が本当に満たされるかは JSON データ次第なので、この記述だけだとテストシナリオとして具体性に欠ける。

**修正案**: 「同一 item id のアイテムが複数個ある場合でも、各トリガー発動時に 1 件ずつ消費される」など、実装仕様から直接導ける条件に書き換えるか、「何らかのルートで再度 `scene 10` に来た場合」と前提を明確にするといいよ。

#### 5. ✅ 全体的な設計方針はクリア
**良い点**: 特定シーンのハードコードを避けて、`triggerItems` 発動時の共通仕様として整理している点は素晴らしい♡ トリガー再帰解決の while ループ構造もそのまま活かせて、変更範囲が最小限に抑えられているね。

#### 6. ✅ 戻り値型の変更も妥当
**良い点**: `Promise<Scene>` から `Promise<{ scene: Scene; player: Player }>` への変更は、呼び出し元の既存実装 (useItem: 128-131 行目、selectSceneChoice: 182-185 行目) との整合性を保ちながら拡張できる方向性で良いね。

### 総評

設計の方向性は LGTM だけど、**実装時の具体的な手順 (イミュータブル更新、itemsChanged の扱い) が不明瞭な箇所がある**ので、上記 1, 2 の指摘は **必ず修正してから実装に進むべき**。

3, 4 はマイナーだけど、実装者がスムーズに作業できるように補足しておくと親切だよ。

### 再レビュー依頼
上記 1, 2 の修正を反映したら、再度レビュー依頼してね。それで LGTM 出すよ♡
