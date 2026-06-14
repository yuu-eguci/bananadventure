import { type SyntheticEvent } from "react";

// 画像読み込みに失敗したときに表示するフォールバック画像。
// シーン画像のデフォルトやアイテム画像のエラー時に共通で使う。
export const FALLBACK_IMAGE_SRC = "/sample-image/sample.png";

// <img onError> 用ハンドラ。一度差し替えたら再発火しないよう onerror を外す。
export const handleImageError = (event: SyntheticEvent<HTMLImageElement>): void => {
  event.currentTarget.onerror = null;
  event.currentTarget.src = FALLBACK_IMAGE_SRC;
};
