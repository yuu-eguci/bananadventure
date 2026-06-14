import { useCallback, useEffect, useState } from "react";

/**
 * `useTypewriter` は、与えられたテキストを 1 文字ずつ表示するための custom hook です。
 * - `fullText` が変わると最初から打ち直す。
 * - `charDelayMs === 0`（光速）は一括表示する。
 * - `enabled === false`（例: ローディング中で画面に見えていない間）は進めず、
 *   表示できるタイミングになってから打ち始める。
 * - 打鍵途中で `skip()` を呼ぶと残りを即座に全部表示する。
 */
export function useTypewriter(fullText: string, charDelayMs: number, enabled: boolean) {
  const [revealedCount, setRevealedCount] = useState(0);

  // テキストが変わったら最初から打ち直す。
  useEffect(() => {
    setRevealedCount(0);
  }, [fullText]);

  useEffect(() => {
    // 光速は一括表示。
    if (charDelayMs === 0) {
      setRevealedCount(fullText.length);
      return;
    }
    // 見えていない間（ローディング中など）は進めない。
    if (!enabled) {
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
  }, [fullText, charDelayMs, enabled, revealedCount]);

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
