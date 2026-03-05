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
<!-- codex が記入してください -->

## レビュー（レビュワー記入欄）
<!-- claude が記入してください -->
