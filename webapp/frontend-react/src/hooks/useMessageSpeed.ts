import { useCallback, useState } from "react";

// メッセージスピード設定。
// label はモーダルの選択肢に表示する文言。
// charDelayMs は 1 文字あたりの送り間隔（ミリ秒）で、実際のメッセージ表示への
// 組み込みは次のタスクで行う。ここでは定義だけ用意しておく。
export const MESSAGE_SPEEDS = {
  verySlow: { label: "激遅", charDelayMs: 1000 },
  slow: { label: "ゆっくり", charDelayMs: 70 },
  fast: { label: "はやめ", charDelayMs: 40 },
  lightSpeed: { label: "光速", charDelayMs: 3 },
} as const;

export type MessageSpeedKey = keyof typeof MESSAGE_SPEEDS;

// モーダルに並べる順序（激遅 → ゆっくり → はやめ → 光速）。
export const MESSAGE_SPEED_ORDER: MessageSpeedKey[] = ["verySlow", "slow", "fast", "lightSpeed"];

const STORAGE_KEY = "bananadventure.messageSpeed";
const DEFAULT_SPEED: MessageSpeedKey = "slow";

const isMessageSpeedKey = (value: string | null): value is MessageSpeedKey =>
  value !== null && value in MESSAGE_SPEEDS;

const readStoredSpeed = (): MessageSpeedKey => {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    return isMessageSpeedKey(stored) ? stored : DEFAULT_SPEED;
  } catch {
    // localStorage が使えない環境ではデフォルトにフォールバックする。
    return DEFAULT_SPEED;
  }
};

// メッセージスピードの選択値を localStorage に永続化して管理するフック。
export const useMessageSpeed = () => {
  const [messageSpeed, setMessageSpeed] = useState<MessageSpeedKey>(readStoredSpeed);

  const changeMessageSpeed = useCallback((next: MessageSpeedKey) => {
    setMessageSpeed(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // 保存に失敗しても画面上の選択状態は維持する。
    }
  }, []);

  return { messageSpeed, changeMessageSpeed };
};
