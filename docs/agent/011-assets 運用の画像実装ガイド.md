assets 運用の画像実装ガイド
===

## タスク概要
- `docs/agent/010-画像実装待ちリストと image パス反映.md` を前提に、画像配置を `public` から `assets` ベースへ見直す。
- 画像変更時に URL を更新しやすくし、キャッシュ再取得を安定させる。
- 必要なら実装変更も行う。

## 今回の要望 (統合者まとめ)
- 現行ドキュメントは `public` 配置前提なので、`assets` 配置前提へ改訂したい。
- 目的は「画像差し替え時にビルドで URL が変わり、再読み込みが走る」こと。
- 目的が見当違いかどうかも評価したい。

## 変更対象
- `docs/agent/011-assets 運用の画像実装ガイド.md`
- `webapp/frontend-react/src/services/*` (必要に応じて)
- `webapp/frontend-react/src/pages/*` (必要に応じて)

## 詳細設計
### 結論 (見当違いかどうか)
- 「画像を変更したら URL も変わって再取得させたい」という狙いは見当違いではない。
- Vite の `src/assets` 経由で参照すると、ビルド時にファイル名へハッシュが付き、差し替え時のキャッシュ更新が効きやすい。
- ただし `json` に URL 文字列を直接置くだけでは、`assets` のハッシュ URL へ自動変換されないため、解決レイヤーが必要。

### 画像配置ポリシー
- メイン画像: `webapp/frontend-react/src/assets/scene-image/`
- インベントリ画像: `webapp/frontend-react/src/assets/item-image/`
- バナナメーター画像: `webapp/frontend-react/src/assets/ui-image/`
- `json` には論理パスとして `/scene-image/...` `/item-image/...` `/ui-image/...` を保持し、コード側で `assets` 実 URL に解決する。

### 実装方針
- `import.meta.glob` で `src/assets` 以下の画像を収集し、`/scene-image/foo.webp` 形式の論理パスからハッシュ URL へ引く辞書を作る。
- `SceneService` で `scene.image` と `itemsOnSelect[].image` と `triggerItems[].item.image` を解決済み URL に変換して返す。
- `HomePage` のバナナメーター画像も同じ解決関数で扱い、論理パス `/ui-image/banana-meter-icon.webp` を指定する。
- 解決できなかった場合は元のパスを返し、既存 fallback を維持する。

### 期待効果
- 画像変更時、ビルド成果物の URL が変わるため、古い画像が残りづらくなる。
- `json` 側は論理パスのままなので、データ編集体験を維持できる。
- 将来 CDN 化する場合も、解決関数の差し替えで対応しやすい。

