import { useCallback, useEffect, useRef, useState } from "react";

type PauseOptions = {
  // この文字数まで打ったところで一度だけ止める。null なら止めない。
  pauseAtIndex: number | null;
  // 止めている時間（ミリ秒）。
  pauseDurationMs: number;
  // 止めた瞬間に一度だけ呼ぶ（バナナメーターの明滅トリガーなどに使う）。
  onReachPause?: () => void;
};

/**
 * `useTypewriter` は、与えられたテキストを 1 文字ずつ表示するための custom hook です。
 * - `fullText` が変わると最初から打ち直す。
 * - `charDelayMs === 0`（光速）は一括表示する。
 * - `enabled === false`（例: ローディング中で画面に見えていない間）は進めず、
 *   表示できるタイミングになってから打ち始める。
 * - 打鍵途中で `skip()` を呼ぶと残りを即座に全部表示する。
 * - `pause.pauseAtIndex` を指定すると、その位置まで打った時点で一度だけ
 *   `pauseDurationMs` の間だけ打鍵を止め、止めた瞬間に `onReachPause` を呼ぶ。
 *   （メッセージ → バナナメーター増減 → 止めて明滅 → 再開、を実現するため）
 */
export function useTypewriter(
  fullText: string,
  charDelayMs: number,
  enabled: boolean,
  pause?: PauseOptions,
) {
  const [revealedCount, setRevealedCount] = useState(0);
  // pause を 1 回だけ消費するためのフラグ。
  const hasPausedRef = useRef(false);

  const pauseAtIndex = pause?.pauseAtIndex ?? null;
  const pauseDurationMs = pause?.pauseDurationMs ?? 0;
  const onReachPause = pause?.onReachPause;

  // テキストが変わったら最初から打ち直す（pause も未消費に戻す）。
  useEffect(() => {
    setRevealedCount(0);
    hasPausedRef.current = false;
  }, [fullText]);

  useEffect(() => {
    // 光速は一括表示（テキストだけ先に全部出す）。
    if (charDelayMs === 0) {
      setRevealedCount(fullText.length);
    }
    // 見えていない間（ローディング中など）は進めず、明滅トリガーも出さない。
    if (!enabled) {
      return;
    }

    // pause 地点に到達したら、一度だけ明滅トリガーを出してから止める。
    const shouldPause =
      pauseAtIndex !== null && !hasPausedRef.current && revealedCount >= pauseAtIndex;
    if (shouldPause) {
      hasPausedRef.current = true;
      onReachPause?.();

      // まだ打ち終わっていなければ、明滅時間ぶん止めてから再開する。
      if (revealedCount < fullText.length) {
        const pauseTimer = setTimeout(() => {
          setRevealedCount((count) => Math.min(count + 1, fullText.length));
        }, pauseDurationMs);
        return () => {
          clearTimeout(pauseTimer);
        };
      }
      return;
    }

    // 打ち終わっていれば何もしない。
    if (revealedCount >= fullText.length) {
      return;
    }

    const timer = setTimeout(() => {
      setRevealedCount((count) => Math.min(count + 1, fullText.length));
    }, charDelayMs);

    return () => {
      clearTimeout(timer);
    };
  }, [fullText, charDelayMs, enabled, revealedCount, pauseAtIndex, pauseDurationMs, onReachPause]);

  const skip = useCallback(() => {
    setRevealedCount(fullText.length);
  }, [fullText.length]);

  return {
    displayedText: fullText.slice(0, revealedCount),
    isComplete: revealedCount >= fullText.length,
    skip,
  };
}

export default useTypewriter;
