import { Player, Scene } from "@/models";
import { SPECIAL_SCENE_IDS } from "@/services/SceneService";

/**
 * アチーブメント関連のゲームルールをまとめた domain module。
 * UI（HomePageV2）に直書きせず、ここに寄せることで演出変更時にルールを探しやすくする。
 */

export type Achievement = {
  id: string;
  label: string;
  note: string;
  achieved: boolean;
};

/**
 * 全シーンの選択肢から、入手可能なアイテム ID の一覧（重複なし）を集める。
 */
export function collectAllCollectibleItemIds(scenes: Scene[]): number[] {
  return Array.from(
    new Set(
      scenes.flatMap((scene) =>
        scene.sceneChoices.flatMap((sceneChoice) =>
          sceneChoice.itemsOnSelect.map((item) => item.id),
        ),
      ),
    ),
  );
}

/**
 * 現在の到達シーンと所持アイテムから、アチーブメント一覧を組み立てる。
 */
export function buildAchievements({
  allCollectibleItemIds,
  player,
  currentSceneId,
}: {
  allCollectibleItemIds: number[];
  player: Player | null;
  currentSceneId: number;
}): Achievement[] {
  const playerItemIdSet = new Set((player?.items ?? []).map((item) => item.id));
  const collectedItemCount = allCollectibleItemIds.filter((itemId) =>
    playerItemIdSet.has(itemId),
  ).length;
  const isAllItemsCompleted =
    allCollectibleItemIds.length > 0 &&
    allCollectibleItemIds.every((itemId) => playerItemIdSet.has(itemId));

  return [
    {
      id: "true-end",
      label: "トゥルーエンド",
      note: `scene ${SPECIAL_SCENE_IDS.TRUE_END} に到達`,
      achieved: currentSceneId === SPECIAL_SCENE_IDS.TRUE_END,
    },
    {
      id: "bad-end",
      label: "バッドエンド",
      note: `scene ${SPECIAL_SCENE_IDS.GAMEOVER} に到達`,
      achieved: currentSceneId === SPECIAL_SCENE_IDS.GAMEOVER,
    },
    {
      id: "all-items",
      label: "全アイテムコンプ",
      note: `${collectedItemCount}/${allCollectibleItemIds.length} アイテム取得`,
      achieved: isAllItemsCompleted,
    },
  ];
}
