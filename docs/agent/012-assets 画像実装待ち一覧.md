assets 画像実装待ち一覧
===

## 目的
- `docs/agent/010-画像実装待ちリストと image パス反映.md` と同じ粒度で、`assets` 運用向けの実装待ち一覧を整理します。
- 論理パスは既存どおり `/scene-image/...` `/item-image/...` `/ui-image/...` を使います。
- 実ファイルの配置先は `webapp/frontend-react/src/assets/` 配下とします。

## メイン画像 (実装待ち一覧)
- `/scene-image/scene-00-title-start.webp` - "はじめる？" - 16:9 (配置先: `webapp/frontend-react/src/assets/scene-image/scene-00-title-start.webp`)
- `/scene-image/scene-01-morning-breakfast.webp` - "ふああぁ、良く寝たのだ。" - 16:9 (配置先: `webapp/frontend-react/src/assets/scene-image/scene-01-morning-breakfast.webp`)
- `/scene-image/scene-02-morning-news.webp` - "今日のニュースを BBC でチェック" - 16:9 (配置先: `webapp/frontend-react/src/assets/scene-image/scene-02-morning-news.webp`)
- `/scene-image/scene-03-invitation-letter.webp` - "ピンポーン！郵便でーす" - 16:9 (配置先: `webapp/frontend-react/src/assets/scene-image/scene-03-invitation-letter.webp`)
- `/scene-image/scene-04-route-decision.webp` - "結構遠くの場所だな" - 16:9 (配置先: `webapp/frontend-react/src/assets/scene-image/scene-04-route-decision.webp`)
- `/scene-image/scene-05-meet-u-chan.webp` - "道中で うーちゃん と出会った" - 16:9 (配置先: `webapp/frontend-react/src/assets/scene-image/scene-05-meet-u-chan.webp`)
- `/scene-image/scene-06-bus-motion-sickness.webp` - "なんとかバスに間に合ったのだ" - 16:9 (配置先: `webapp/frontend-react/src/assets/scene-image/scene-06-bus-motion-sickness.webp`)
- `/scene-image/scene-07-ferry-transfer.webp` - "次は船に乗り換えなのだ" - 16:9 (配置先: `webapp/frontend-react/src/assets/scene-image/scene-07-ferry-transfer.webp`)
- `/scene-image/scene-08-shipwreck-escape.webp` - "案の定、沈没したのだ！" - 16:9 (配置先: `webapp/frontend-react/src/assets/scene-image/scene-08-shipwreck-escape.webp`)
- `/scene-image/scene-09-mysterious-island.webp` - "謎の島にたどり着いた" - 16:9 (配置先: `webapp/frontend-react/src/assets/scene-image/scene-09-mysterious-island.webp`)
- `/scene-image/scene-10-banana-cliff.webp` - "バナナの木がある！" - 16:9 (配置先: `webapp/frontend-react/src/assets/scene-image/scene-10-banana-cliff.webp`)
- `/scene-image/scene-11-spoiled-soy-banana.webp` - "豆乳バナナが腐って豆乳ヨーグルトに！" - 16:9 (配置先: `webapp/frontend-react/src/assets/scene-image/scene-11-spoiled-soy-banana.webp`)
- `/scene-image/scene-12-fall-into-jungle.webp` - "いてててて・・・やっぱり落ちたのだ" (落下直後でジャングル内) - 16:9 (配置先: `webapp/frontend-react/src/assets/scene-image/scene-12-fall-into-jungle.webp`)
- `/scene-image/scene-13-fall-mansion-gate.webp` - "やっぱり落ちちゃったのだ" (落下後に洋館前へ移動) - 16:9 (配置先: `webapp/frontend-react/src/assets/scene-image/scene-13-fall-mansion-gate.webp`)
- `/scene-image/scene-14-mansion-arrival.webp` - "安藤さん家なのだ！" - 16:9 (配置先: `webapp/frontend-react/src/assets/scene-image/scene-14-mansion-arrival.webp`)
- `/scene-image/scene-15-exhausted-ending.webp` - "もう疲れたのだ・・・" - 16:9 (配置先: `webapp/frontend-react/src/assets/scene-image/scene-15-exhausted-ending.webp`)

## インベントリ画像 (実装待ち一覧)
- `/item-image/item-soy-banana-drink.webp` - "豆乳バナナ" - 64x64 (配置先: `webapp/frontend-react/src/assets/item-image/item-soy-banana-drink.webp`)
- `/item-image/item-strong-zero.webp` - "ストロングゼロ" - 64x64 (配置先: `webapp/frontend-react/src/assets/item-image/item-strong-zero.webp`)
- `/item-image/item-survival-kit.webp` - "六角レンチ・エンブレム・ハーブ" - 64x64 (配置先: `webapp/frontend-react/src/assets/item-image/item-survival-kit.webp`)
- `item-survival-kit.webp` は「レンチ + 紋章 + ハーブ束」の 3 点が同時に視認できる構図にしてください。

## バナナメーター画像 (実装待ち一覧)
- `/ui-image/banana-meter-icon.webp` - "バナナメーター通常表示アイコン" - 64x64 (配置先: `webapp/frontend-react/src/assets/ui-image/banana-meter-icon.webp`)

## 補足
- `json` に書く値は論理パスのままです。例: `/scene-image/scene-00-title-start.webp`
- 実 URL はコード側の解決レイヤーで `assets` から生成されます。
