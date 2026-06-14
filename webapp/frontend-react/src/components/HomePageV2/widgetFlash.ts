import { keyframes } from "@mui/system";

// ウィジェット（バナナメーター / アイテム）を目立たせるための明滅。
// 輝度アップ + 白いグローを複数回パルスさせる。
export const widgetFlashKeyframes = keyframes`
  0%, 100% {
    filter: brightness(1);
    box-shadow: 0 0 0 rgba(255, 255, 255, 0);
  }
  15%, 45%, 75% {
    filter: brightness(1.7);
    box-shadow: 0 0 12px 4px rgba(255, 255, 255, 0.9);
  }
  30%, 60%, 90% {
    filter: brightness(1);
    box-shadow: 0 0 0 rgba(255, 255, 255, 0);
  }
`;

// 明滅の長さ（ミリ秒）。目立たせたいので少し長めにする。
// メッセージ描画を止めて明滅を見せる pause 時間にもこの値を使うため、ms を単一ソースにする。
export const WIDGET_FLASH_DURATION_MS = 2500;
export const WIDGET_FLASH_DURATION = `${WIDGET_FLASH_DURATION_MS / 1000}s`;
