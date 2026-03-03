main マージ時に GitHub Pages へデプロイ
===

## タスク概要
- `main` へマージされたとき、フロントエンドを GitHub Pages へ自動デプロイする。

## 今回の要望 (統合者まとめ)
- `main` へ反映されたタイミングで GitHub Pages デプロイを実行したい。
- 手動操作を減らし、デプロイを CI 化したい。

## 変更対象
- `docs/agent/018-main マージ時に GitHub Pages へデプロイ.md`
- `.github/workflows/*`
- `webapp/frontend-react/vite.config.ts` (必要に応じて)

## 詳細設計
(このセクションはプランナーが更新する)

