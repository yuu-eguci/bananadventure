選択時の TEST 表示を削除する
===

## タスク概要
- ゲーム中に選択肢ボタンを押したとき、ダイアログへ出ている `<TEST>` 表示を削除する。

## 今回の要望 (統合者まとめ)
- プレイ中に表示されるデバッグ文言 `<TEST>` は不要なので削除したい。

## 変更対象
- `docs/agent/014-選択時の TEST 表示を削除する.md`
- `webapp/frontend-react/src/pages/HomePage.tsx`

## 詳細設計
### 実装方針
- `webapp/frontend-react/src/pages/HomePage.tsx` の `onPressSceneChoice` で組み立てている `dialogMessage` から `<TEST>` 行を削除する。
- `bananaMeterDelta` と `nextSceneId` の分割代入は未使用になるため、`responseText` のみを使う形へ整理する。
- ダイアログ表示自体は維持し、プレイヤーに見せる文章は `responseText` のみとする。

### 期待効果
- 本番プレイ時にデバッグ文字列が表示されなくなる。
- 不要な変数参照を削除して、型チェック/静的解析のノイズを減らせる。

## レビュー

### レビュワー指摘 (1 回目)
1. `<TEST>` 文字列だけを削除すると空の改行 (`<br />`) が残る可能性があるため、ダイアログ表示の見た目劣化が起きないように設計へ明記してください。
2. `responseText` が空文字のケースでも UI が崩れないことを確認観点へ追記してください。
3. 変更後の型チェック実施 (`npx tsc -b`) を検証観点へ追記してください。

判定: `Needs Fix`
