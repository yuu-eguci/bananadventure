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

