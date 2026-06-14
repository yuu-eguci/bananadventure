import { describe, expect, it } from "vitest";

import { Player, Scene } from "@/models";
import { buildAchievements, collectAllCollectibleItemIds } from "@/services/achievement";
import { SPECIAL_SCENE_IDS } from "@/services/SceneService";

function makePlayer(itemIds: number[]): Player {
  return {
    id: 0,
    name: "Player",
    bananaMeter: 100,
    bananaMeterChanged: false,
    items: itemIds.map((id) => ({ id }) as Player["items"][number]),
    itemsChanged: false,
  };
}

const scenes = [
  {
    id: 0,
    triggerItems: [],
    image: "",
    text: "",
    sceneChoices: [
      { id: 0, order: 0, image: "", text: "", responseText: "", bananaMeterDelta: 0, nextSceneId: 1, itemsOnSelect: [{ id: 0 }, { id: 1 }] },
      { id: 1, order: 1, image: "", text: "", responseText: "", bananaMeterDelta: 0, nextSceneId: 2, itemsOnSelect: [{ id: 1 }] },
    ],
  },
] as unknown as Scene[];

describe("collectAllCollectibleItemIds", () => {
  it("collects unique item ids across all scene choices", () => {
    expect(collectAllCollectibleItemIds(scenes).sort()).toEqual([0, 1]);
  });

  it("returns an empty list when no choice grants items", () => {
    const empty = [{ id: 0, triggerItems: [], image: "", text: "", sceneChoices: [] }] as unknown as Scene[];
    expect(collectAllCollectibleItemIds(empty)).toEqual([]);
  });
});

describe("buildAchievements", () => {
  it("marks true-end achieved on the true-end scene", () => {
    const achievements = buildAchievements({
      allCollectibleItemIds: [0, 1],
      player: makePlayer([]),
      currentSceneId: SPECIAL_SCENE_IDS.TRUE_END,
    });

    expect(achievements.find((a) => a.id === "true-end")?.achieved).toBe(true);
    expect(achievements.find((a) => a.id === "bad-end")?.achieved).toBe(false);
  });

  it("marks all-items achieved only when every collectible is held", () => {
    const partial = buildAchievements({
      allCollectibleItemIds: [0, 1],
      player: makePlayer([0]),
      currentSceneId: 1,
    });
    const partialAllItems = partial.find((a) => a.id === "all-items");
    expect(partialAllItems?.achieved).toBe(false);
    expect(partialAllItems?.note).toBe("1/2 アイテム取得");

    const complete = buildAchievements({
      allCollectibleItemIds: [0, 1],
      player: makePlayer([0, 1]),
      currentSceneId: 1,
    });
    expect(complete.find((a) => a.id === "all-items")?.achieved).toBe(true);
  });

  it("never marks all-items achieved when there are no collectibles", () => {
    const achievements = buildAchievements({
      allCollectibleItemIds: [],
      player: makePlayer([]),
      currentSceneId: 1,
    });
    expect(achievements.find((a) => a.id === "all-items")?.achieved).toBe(false);
  });

  it("tolerates a null player", () => {
    const achievements = buildAchievements({
      allCollectibleItemIds: [0, 1],
      player: null,
      currentSceneId: 1,
    });
    expect(achievements.find((a) => a.id === "all-items")?.note).toBe("0/2 アイテム取得");
  });
});
