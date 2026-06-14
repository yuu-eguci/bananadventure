// 「光速」モードのギャグ表示。
// 打鍵済みの文字を全角スペースに変えていき、最新の 1 文字だけを残す。
// → 速すぎて読めない（＝消えてる）状態を作る、「速すぎて消えてるじゃねーかｗ」ツッコミ待ち演出。
// 改行は行構造が崩れないように残す。

// 全角スペース。
export const GHOST_CHAR = "　";

/**
 * 表示中テキストを「最新 1 文字だけ残し、それ以外は全角スペース」に変換する。
 * - 長さは変えない（呼び出し側の slice / pause index 計算と整合させるため）。
 * - 改行はそのまま残す。
 * - `ghostLast === true`（打ち終わった後）は最新 1 文字も残さず全部消す。
 *   → 最後の文字だけ残ってしまうのを防ぎ、完了時はメッセージが完全に消える。
 */
export function applyGhostTrail(text: string, ghostLast: boolean = false): string {
  if (text.length === 0) {
    return text;
  }

  const lastIndex = text.length - 1;
  let result = "";
  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    if (char === "\n") {
      result += char;
    } else if (i === lastIndex && !ghostLast) {
      result += char;
    } else {
      result += GHOST_CHAR;
    }
  }
  return result;
}
