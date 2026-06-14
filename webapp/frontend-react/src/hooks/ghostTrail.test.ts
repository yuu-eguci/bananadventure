import { describe, expect, it } from "vitest";

import { GHOST_CHAR, applyGhostTrail } from "@/hooks/ghostTrail";

describe("applyGhostTrail", () => {
  it("returns empty string unchanged", () => {
    expect(applyGhostTrail("")).toBe("");
  });

  it("keeps a single character as-is", () => {
    expect(applyGhostTrail("あ")).toBe("あ");
  });

  it("ghosts all but the latest character", () => {
    expect(applyGhostTrail("あい")).toBe(`${GHOST_CHAR}い`);
    expect(applyGhostTrail("あいう")).toBe(`${GHOST_CHAR}${GHOST_CHAR}う`);
  });

  it("preserves length so slice / pause index stay aligned", () => {
    const input = "バナナだいすき";
    expect(applyGhostTrail(input).length).toBe(input.length);
  });

  it("keeps newlines to avoid collapsing line structure", () => {
    // 改行は残し、それ以外（最新 1 文字以外）は全角スペースになる。
    expect(applyGhostTrail("あ\nい")).toBe(`${GHOST_CHAR}\nい`);
    expect(applyGhostTrail("あ\n")).toBe(`${GHOST_CHAR}\n`);
  });

  it("ghosts even the last character when ghostLast is true (completed state)", () => {
    // 打ち終わったら最後の 1 文字も消えて、メッセージが完全に消える。
    expect(applyGhostTrail("あ", true)).toBe(GHOST_CHAR);
    expect(applyGhostTrail("あいう", true)).toBe(`${GHOST_CHAR}${GHOST_CHAR}${GHOST_CHAR}`);
    // 改行は ghostLast でも残す。
    expect(applyGhostTrail("あ\nい", true)).toBe(`${GHOST_CHAR}\n${GHOST_CHAR}`);
  });
});
