import { Item } from "@/models";

/**
 * SceneOverlay の lead メッセージ（選択肢レスポンス本文＋バナナメーター増減行＋アイテム入手行）を
 * 組み立てる pure function。表示と演出（typewriter の pause）で共有する。
 *
 * - 各セグメントは改行で連結する。
 * - `meterPauseIndex` / `itemPauseIndex` は、それぞれの行を打ち終わる文字位置。
 *   typewriter はこの位置で止めて、バナナメーター明滅 / アイテムウィジェット追加を行う。
 *   該当行がない場合は `null`。
 */
export type LeadMessageSegments = {
  leadText: string;
  meterPauseIndex: number | null;
  itemPauseIndex: number | null;
};

export const buildMeterLine = (delta: number): string =>
  `（バナナメーター ${delta > 0 ? `+${delta}` : `${delta}`}）`;

export const buildItemLine = (items: Item[]): string =>
  `（${items.map((item) => item.text).join("、")} を手に入れた）`;

export function buildLeadMessageSegments({
  leadResponseText,
  leadBananaMeterDelta,
  leadAddedItems,
}: {
  leadResponseText: string | null;
  leadBananaMeterDelta: number;
  leadAddedItems: Item[];
}): LeadMessageSegments {
  const segments: string[] = [];
  const response = leadResponseText ?? "";
  if (response.length > 0) {
    segments.push(response);
  }

  let meterEnd: number | null = null;
  let itemEnd: number | null = null;

  const appendSegment = (text: string): number => {
    // セグメント間は改行で区切る。区切りの分だけ開始位置をずらす。
    const start = segments.length === 0 ? 0 : segments.join("\n").length + 1;
    segments.push(text);
    return start + text.length;
  };

  if (leadBananaMeterDelta !== 0) {
    meterEnd = appendSegment(buildMeterLine(leadBananaMeterDelta));
  }
  if (leadAddedItems.length > 0) {
    itemEnd = appendSegment(buildItemLine(leadAddedItems));
  }

  return {
    leadText: segments.join("\n"),
    meterPauseIndex: meterEnd,
    itemPauseIndex: itemEnd,
  };
}
