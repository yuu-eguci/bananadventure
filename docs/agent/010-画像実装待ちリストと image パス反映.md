画像実装待ちリストと image パス反映
===

## タスク概要
- 既存の `docs/agent/009-画像実装ガイド.md` を前提に、別メンバー向けの「実装待ち画像リスト」を作る。
- 対象は `メイン画像` `インベントリ画像` `バナナメーター画像` の 3 種。
- さらに `webapp/frontend-react/src/data/bananadventure-scenes.json` の `image` を埋める。

## 今回の要望 (統合者まとめ)
- メイン画像の実装待ちリストを箇条書きで作る。
- インベントリ画像の実装待ちリストを箇条書きで作る。
- バナナメーター画像の実装待ちリストを箇条書きで作る。
- JSON の `image` を先に埋める。

## 変更対象
- `docs/agent/010-画像実装待ちリストと image パス反映.md`
- `webapp/frontend-react/src/data/bananadventure-scenes.json`

## 詳細設計
`docs/agent/009-画像実装ガイド.md` に合わせて、画像の配置先と比率を固定します。

### メイン画像 (実装待ち一覧)
- `/scene-image/scene-00-title-start.webp` - "はじめる？" - 16:9
- `/scene-image/scene-01-morning-breakfast.webp` - "ふああぁ、良く寝たのだ。" - 16:9
- `/scene-image/scene-02-morning-news.webp` - "今日のニュースを BBC でチェック" - 16:9
- `/scene-image/scene-03-invitation-letter.webp` - "ピンポーン！郵便でーす" - 16:9
- `/scene-image/scene-04-route-decision.webp` - "結構遠くの場所だな" - 16:9
- `/scene-image/scene-05-meet-u-chan.webp` - "道中で うーちゃん と出会った" - 16:9
- `/scene-image/scene-06-bus-motion-sickness.webp` - "なんとかバスに間に合ったのだ" - 16:9
- `/scene-image/scene-07-ferry-transfer.webp` - "次は船に乗り換えなのだ" - 16:9
- `/scene-image/scene-08-shipwreck-escape.webp` - "案の定、沈没したのだ！" - 16:9
- `/scene-image/scene-09-mysterious-island.webp` - "謎の島にたどり着いた" - 16:9
- `/scene-image/scene-10-banana-cliff.webp` - "バナナの木がある！" - 16:9
- `/scene-image/scene-11-spoiled-soy-banana.webp` - "豆乳バナナが腐って豆乳ヨーグルトに！" - 16:9
- `/scene-image/scene-12-fall-into-jungle.webp` - "やっぱり落ちたのだ" - 16:9
- `/scene-image/scene-13-fall-mansion-gate.webp` - "なんか洋館があるけど" - 16:9
- `/scene-image/scene-14-mansion-arrival.webp` - "安藤さん家なのだ！" - 16:9
- `/scene-image/scene-15-exhausted-ending.webp` - "もう疲れたのだ・・・" - 16:9

### インベントリ画像 (実装待ち一覧)
- `/item-image/item-soy-banana-drink.webp` - "豆乳バナナ" - 64x64
- `/item-image/item-strong-zero.webp` - "ストロングゼロ" - 64x64
- `/item-image/item-survival-kit.webp` - "六角レンチ・エンブレム・ハーブ" - 64x64

### バナナメーター画像 (実装待ち一覧)
- `/ui-image/banana-meter-icon.webp` - "バナナメーター通常表示アイコン" - 64x64

### `json` 反映方針
- `webapp/frontend-react/src/data/bananadventure-scenes.json` の各シーンの `image` に、上記メイン画像パスを対応付けて反映します。
- 同 `json` 内の `sceneChoices[].itemsOnSelect[].image` に、上記インベントリ画像パスを反映します。
- `sceneChoices[].image` は今回のガイド対象外なので、空文字のまま据え置きにします。

### 反映マッピング (scene id -> image)
- `0 -> /scene-image/scene-00-title-start.webp`
- `1 -> /scene-image/scene-01-morning-breakfast.webp`
- `2 -> /scene-image/scene-02-morning-news.webp`
- `3 -> /scene-image/scene-03-invitation-letter.webp`
- `4 -> /scene-image/scene-04-route-decision.webp`
- `5 -> /scene-image/scene-05-meet-u-chan.webp`
- `6 -> /scene-image/scene-06-bus-motion-sickness.webp`
- `7 -> /scene-image/scene-07-ferry-transfer.webp`
- `8 -> /scene-image/scene-08-shipwreck-escape.webp`
- `9 -> /scene-image/scene-09-mysterious-island.webp`
- `10 -> /scene-image/scene-10-banana-cliff.webp`
- `11 -> /scene-image/scene-11-spoiled-soy-banana.webp`
- `12 -> /scene-image/scene-12-fall-into-jungle.webp`
- `13 -> /scene-image/scene-13-fall-mansion-gate.webp`
- `14 -> /scene-image/scene-14-mansion-arrival.webp`
- `15 -> /scene-image/scene-15-exhausted-ending.webp`

## レビュー

### レビュワー指摘 (1 回目)
1. `scene-12-fall-into-jungle.webp` と `scene-13-fall-mansion-gate.webp` は文脈が近く、制作側が混同しやすいです。差分が一目でわかる補足を追加してください。
2. `item-survival-kit.webp` は中身が 3 つの複合アイテムなので、どれを主役に描くか指示が必要です。ビジュアル方針を 1 行追加してください。
3. バナナメーター画像は現状 `json` 管理ではないため、実装先ファイルを明記した方が作業者が迷いません。追記してください。

判定: `Needs Fix`
