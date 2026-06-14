import { useCallback, useEffect, useRef, useState } from "react";

type PauseOptions = {
  // 打鍵を一時停止する文字数の位置（昇順）。各位置で一度ずつ止める。
  pausePoints: number[];
  // 1 回あたり止める時間（ミリ秒）。
  pauseDurationMs: number;
  // 各 pause 位置に到達した瞬間に、その位置の値を引数にして一度だけ呼ぶ。
  onReachPause: (index: number) => void;
};

/**
 * `useTypewriter` は、与えられたテキストを 1 文字ずつ表示するための custom hook です。
 * - `fullText` が変わると最初から打ち直す。
 * - `charDelayMs === 0`（光速）は一括表示する。
 * - `enabled === false`（例: ローディング中で画面に見えていない間）は進めず、
 *   表示できるタイミングになってから打ち始める。
 * - 打鍵途中で `skip()` を呼ぶと残りを即座に全部表示する（未消費の pause は副作用だけ発火）。
 * - `pause.pausePoints` の各位置まで打ったところで、`pauseDurationMs` の間だけ止め、
 *   止めた瞬間に `onReachPause(index)` を呼ぶ。
 *   （メッセージ → 増減/入手の通知 → 止めて明滅やウィジェット追加 → 再開、を実現するため）
 */
export function useTypewriter(
  fullText: string,
  charDelayMs: number,
  enabled: boolean,
  pause?: PauseOptions,
) {
  const [revealedCount, setRevealedCount] = useState(0);
  // 何個の pause を消費済みか（pausePoints は昇順なので、先頭から順に消費する）。
  const consumedPauseCountRef = useRef(0);

  const pausePoints = pause?.pausePoints;
  const pauseDurationMs = pause?.pauseDurationMs ?? 0;
  const onReachPause = pause?.onReachPause;
  // 依存配列で安定して比較できるよう、位置を文字列キー化する。
  const pausePointsKey = pausePoints ? pausePoints.join(",") : "";

  // テキストが変わったら最初から打ち直す（pause も未消費に戻す）。
  // useEffect（描画後）で戻すと、新 fullText を前回の revealedCount で slice した
  // フレームが一瞬ペイントされ「冒頭がちらっと出る」ので、レンダー中に同期で 0 へ戻す。
  const prevFullTextRef = useRef(fullText);
  if (prevFullTextRef.current !== fullText) {
    prevFullTextRef.current = fullText;
    setRevealedCount(0);
    consumedPauseCountRef.current = 0;
  }

  useEffect(() => {
    const points = pausePointsKey === "" ? [] : pausePointsKey.split(",").map(Number);

    // 光速は一括表示（テキストだけ先に全部出す）。
    if (charDelayMs === 0) {
      setRevealedCount(fullText.length);
    }
    // 見えていない間（ローディング中など）は進めず、pause の副作用も出さない。
    if (!enabled) {
      return;
    }

    // 既に打ち終わっている（スキップ・光速含む）なら、未消費の pause を全部発火だけする。
    if (revealedCount >= fullText.length) {
      while (consumedPauseCountRef.current < points.length) {
        const index = points[consumedPauseCountRef.current];
        consumedPauseCountRef.current += 1;
        onReachPause?.(index);
      }
      return;
    }

    // 次の pause 位置に到達したら、1 つ消費して副作用を出し、明滅時間ぶん止めてから再開する。
    const nextPause =
      consumedPauseCountRef.current < points.length ? points[consumedPauseCountRef.current] : null;
    if (nextPause !== null && revealedCount >= nextPause) {
      consumedPauseCountRef.current += 1;
      onReachPause?.(nextPause);

      const pauseTimer = setTimeout(() => {
        setRevealedCount((count) => Math.min(count + 1, fullText.length));
      }, pauseDurationMs);
      return () => {
        clearTimeout(pauseTimer);
      };
    }

    const timer = setTimeout(() => {
      setRevealedCount((count) => Math.min(count + 1, fullText.length));
    }, charDelayMs);

    return () => {
      clearTimeout(timer);
    };
  }, [fullText, charDelayMs, enabled, revealedCount, pausePointsKey, pauseDurationMs, onReachPause]);

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
