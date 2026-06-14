import { SceneViewModel } from "../viewModels";
import { Scene, Player, SceneChoice } from "../models";
import sceneData from "@/data/bananadventure-scenes.json";
import { resolveSceneImages } from "@/services/assetImageResolver";

// 特殊な Scene ID です。
export const SPECIAL_SCENE_IDS = {
  TRUE_END: 14,
  GAMEOVER: 15,
} as const;

export class SceneService {
  // NOTE: いやあ、 private method 使いたいので constructor 作った。
  constructor() {}

  private async resolveTriggeredScene({
    scene,
    player,
  }: {
    scene: Scene;
    player: Player;
  }): Promise<{ scene: Scene; player: Player }> {
    let updatedScene = scene;
    let updatedPlayer = player;

    while (true) {
      const triggers = updatedScene.triggerItems;
      let triggered = false;

      for (const triggerItem of triggers) {
        const { item, nextSceneId } = triggerItem;
        const hasUnusedItem = updatedPlayer.items.some((i) => i.id === item.id && !i.used);

        if (hasUnusedItem) {
          let consumed = false;
          updatedPlayer = {
            ...updatedPlayer,
            items: updatedPlayer.items.map((targetItem) => {
              if (!consumed && targetItem.id === item.id && !targetItem.used) {
                consumed = true;
                return { ...targetItem, used: true };
              }

              return targetItem;
            }),
            itemsChanged: true,
          };
          updatedScene = await this.getScene({ sceneId: nextSceneId });
          triggered = true;
          break;
        }
      }

      if (!triggered) {
        break;
      }
    }

    return {
      scene: updatedScene,
      player: updatedPlayer,
    };
  }

  /**
   * Player 更新後の遷移先を解決する共通フロー。
   * - バナナメーターが 0 以下なら gameover シーンへ（トリガーは解決しない）。
   * - そうでなければ、与えられた scene からトリガーアイテムを解決する。
   * useItem / selectSceneChoice で同じ扱いになるよう、ここに集約している。
   */
  private async resolveSceneAfterPlayerUpdate({
    scene,
    player,
  }: {
    scene: Scene;
    player: Player;
  }): Promise<{ scene: Scene; player: Player }> {
    if (player.bananaMeter <= 0) {
      return {
        scene: await this.getScene({ sceneId: SPECIAL_SCENE_IDS.GAMEOVER }),
        player,
      };
    }

    return this.resolveTriggeredScene({ scene, player });
  }

  private async getInitialPlayer(): Promise<Player> {
    // NOTE: Django のノリで new しちゃいそうになるが、 Player は type/interface ベースの定義である。 class ではない。
    //       new するんじゃなくて、オブジェクトの構造を表すだけ。
    return {
      id: 0,
      name: "Player",
      bananaMeter: 0,
      bananaMeterChanged: false,
      items: [],
      itemsChanged: false,
    };
  }

  private async getScene({ sceneId }: { sceneId: number }): Promise<Scene> {
    // JSON 配列から指定 ID の Scene を探します。
    const scenes: Scene[] = sceneData as Scene[];
    const scene = scenes.find((s) => s.id === sceneId);
    if (!scene) {
      throw new Error(`Scene with ID ${sceneId} not found`);
    }
    return resolveSceneImages(scene);
  }

  async getSceneChoice({
    sceneId,
    choiceId,
  }: {
    sceneId: number;
    choiceId: number;
  }): Promise<SceneChoice> {
    const scene = await this.getScene({ sceneId });
    const choice = scene.sceneChoices.find((c) => c.id === choiceId);
    if (!choice) {
      throw new Error(`SceneChoice with ID ${choiceId} not found in Scene ${sceneId}`);
    }
    return choice;
  }

  async fetchInitialViewModel(): Promise<SceneViewModel> {
    const scene = await this.getScene({ sceneId: 0 });
    if (!scene) {
      throw new Error("Initial scene not found");
    }

    const player = await this.getInitialPlayer();

    return {
      scene,
      player,
    };
  }

  async useItem({
    viewModel,
    itemId,
  }: {
    viewModel: SceneViewModel;
    itemId: number;
  }): Promise<SceneViewModel> {
    const targetItem = viewModel.player.items.find((item) => item.id === itemId);
    if (!targetItem || targetItem.used) {
      return viewModel;
    }

    const updatedPlayer: Player = {
      ...viewModel.player,
      items: viewModel.player.items.map((item) =>
        item.id === itemId ? { ...item, used: true } : item,
      ),
    };

    if (targetItem.bananaMeterDelta !== 0) {
      updatedPlayer.bananaMeter += targetItem.bananaMeterDelta;
      updatedPlayer.bananaMeterChanged = true;
    }
    updatedPlayer.itemsChanged = true;

    const resolved = await this.resolveSceneAfterPlayerUpdate({
      scene: viewModel.scene,
      player: updatedPlayer,
    });

    return {
      scene: resolved.scene,
      player: resolved.player,
    };
  }

  async selectSceneChoice({
    viewModel,
    selectedSceneChoiceId,
  }: {
    viewModel: SceneViewModel;
    selectedSceneChoiceId: number;
  }): Promise<SceneViewModel> {
    // 選択された SceneChoice を取得
    const selectedSceneChoice = await this.getSceneChoice({
      sceneId: viewModel.scene.id,
      choiceId: selectedSceneChoiceId,
    });
    if (!selectedSceneChoice) {
      throw new Error(`SceneChoice with ID ${selectedSceneChoiceId} not found`);
    }

    // 返却のため、 Player を複製。
    // items 配列とその要素も複製し、入力 viewModel.player.items を直接 mutate しないようにする。
    const updatedPlayer: Player = {
      ...viewModel.player,
      items: viewModel.player.items.map((item) => ({ ...item })),
    };

    // SceneModelView.player.items 更新
    if (selectedSceneChoice.itemsOnSelect.length) {
      updatedPlayer.items = [
        ...updatedPlayer.items,
        ...selectedSceneChoice.itemsOnSelect.map((item) => ({ ...item })),
      ];
      updatedPlayer.itemsChanged = true;
    }

    // SceneModelView.player.bananaMeter 更新
    if (selectedSceneChoice.bananaMeterDelta !== 0) {
      updatedPlayer.bananaMeter += selectedSceneChoice.bananaMeterDelta;
      updatedPlayer.bananaMeterChanged = true;
    }

    // SceneModelView.scene 更新。
    // メーター 0 以下なら gameover、そうでなければ選択肢の遷移先からトリガー解決する。
    // gameover 時にトリガーを解決しない扱いは useItem と共通（resolveSceneAfterPlayerUpdate）。
    const nextScene = await this.getScene({ sceneId: selectedSceneChoice.nextSceneId });
    const resolved = await this.resolveSceneAfterPlayerUpdate({
      scene: nextScene,
      player: updatedPlayer,
    });

    // SceneModelView を返す
    return {
      scene: resolved.scene,
      player: resolved.player,
    };
  }
}
