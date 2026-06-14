import { describe, expect, it } from "vitest";

import { buildLeadMessageSegments } from "@/components/HomePageV2/leadMessage";
import { Item } from "@/models";

function makeItem(id: number, text: string): Item {
  return {
    id,
    text,
    used: false,
    bananaMeterDelta: 0,
  } as Item;
}

describe("buildLeadMessageSegments", () => {
  it("returns empty lead when nothing happened", () => {
    const result = buildLeadMessageSegments({
      leadResponseText: null,
      leadBananaMeterDelta: 0,
      leadAddedItems: [],
    });

    expect(result.leadText).toBe("");
    expect(result.meterPauseIndex).toBeNull();
    expect(result.itemPauseIndex).toBeNull();
  });

  it("builds response only", () => {
    const result = buildLeadMessageSegments({
      leadResponseText: "やあ",
      leadBananaMeterDelta: 0,
      leadAddedItems: [],
    });

    expect(result.leadText).toBe("やあ");
    expect(result.meterPauseIndex).toBeNull();
    expect(result.itemPauseIndex).toBeNull();
  });

  it("appends meter line and points pause at its end", () => {
    const result = buildLeadMessageSegments({
      leadResponseText: "やあ",
      leadBananaMeterDelta: 10,
      leadAddedItems: [],
    });

    const meterLine = "（バナナメーター +10）";
    expect(result.leadText).toBe(`やあ\n${meterLine}`);
    // pause 位置は meter 行の末尾（=結合テキスト全体の長さ）。
    expect(result.meterPauseIndex).toBe(result.leadText.length);
    expect(result.itemPauseIndex).toBeNull();
  });

  it("formats a negative meter delta without an extra sign", () => {
    const result = buildLeadMessageSegments({
      leadResponseText: null,
      leadBananaMeterDelta: -5,
      leadAddedItems: [],
    });

    expect(result.leadText).toBe("（バナナメーター -5）");
    expect(result.meterPauseIndex).toBe(result.leadText.length);
  });

  it("appends both meter and item lines with pause indices at each line end", () => {
    const items = [makeItem(0, "豆乳バナナ"), makeItem(1, "ストロングゼロ")];
    const result = buildLeadMessageSegments({
      leadResponseText: "やあ",
      leadBananaMeterDelta: 10,
      leadAddedItems: items,
    });

    const meterLine = "（バナナメーター +10）";
    const itemLine = "（豆乳バナナ、ストロングゼロ を手に入れた）";
    expect(result.leadText).toBe(`やあ\n${meterLine}\n${itemLine}`);

    // meter 行の末尾 = "やあ" + "\n" + meterLine の長さ。
    expect(result.meterPauseIndex).toBe("やあ".length + 1 + meterLine.length);
    // item 行の末尾 = 結合テキスト全体の長さ。
    expect(result.itemPauseIndex).toBe(result.leadText.length);
  });

  it("places the item line right after the response when there is no meter line", () => {
    const items = [makeItem(2, "バナナの皮")];
    const result = buildLeadMessageSegments({
      leadResponseText: "やあ",
      leadBananaMeterDelta: 0,
      leadAddedItems: items,
    });

    const itemLine = "（バナナの皮 を手に入れた）";
    expect(result.leadText).toBe(`やあ\n${itemLine}`);
    expect(result.meterPauseIndex).toBeNull();
    expect(result.itemPauseIndex).toBe(result.leadText.length);
  });
});
