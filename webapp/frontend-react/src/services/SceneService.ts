import { SceneViewModel } from "../viewModels";
import { Scene, Player, SceneChoice } from "../models";
import sceneData from "@/data/bananadventure-scenes.json";
import { resolveSceneImages } from "@/services/assetImageResolver";

// 特殊な Scene
const SPECIAL_SCENE_IDS = {
  GAMEOVER: 15,
}

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
      throw new Error(`Scene with ID ${sceneId} not found`)
    };
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
      throw new Error(`SceneChoice with ID ${choiceId} not found in Scene ${sceneId}`)
    };
    return choice;
  }

  async fetchInitialViewModel(): Promise<SceneViewModel> {
    const scene = await this.getScene({ sceneId: 0 });
    if (!scene) {
      throw new Error("Initial scene not found")
    };

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

    let updatedPlayer: Player = {
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

    let updatedScene = null;
    if (updatedPlayer.bananaMeter <= 0) {
      updatedScene = await this.getScene({ sceneId: SPECIAL_SCENE_IDS.GAMEOVER });
    } else {
      const resolved = await this.resolveTriggeredScene({
        scene: viewModel.scene,
        player: updatedPlayer,
      });
      updatedScene = resolved.scene;
      updatedPlayer = resolved.player;
    }

    return {
      scene: updatedScene,
      player: updatedPlayer,
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
      throw new Error(`SceneChoice with ID ${selectedSceneChoiceId} not found`)
    }

    // 返却のため、 Player を複製
    let updatedPlayer = { ...viewModel.player };

    // SceneModelView.player.items 更新

    if (selectedSceneChoice.itemsOnSelect.length) {
      for (const itemOnSelect of selectedSceneChoice.itemsOnSelect) {
        updatedPlayer.items.push(itemOnSelect);
      }
      updatedPlayer.itemsChanged = true;
    }

    // SceneModelView.player.bananaMeter 更新
    if (selectedSceneChoice.bananaMeterDelta !== 0) {
      updatedPlayer.bananaMeter += selectedSceneChoice.bananaMeterDelta;
      updatedPlayer.bananaMeterChanged = true;
    }

    // SceneModelView.scene 更新
    let updatedScene = null;
    if (updatedPlayer.bananaMeter <= 0) {
      updatedScene = await this.getScene({ sceneId: SPECIAL_SCENE_IDS.GAMEOVER });
    } else {
      updatedScene = await this.getScene({ sceneId: selectedSceneChoice.nextSceneId });
    }

    const resolved = await this.resolveTriggeredScene({
      scene: updatedScene,
      player: updatedPlayer,
    });
    updatedScene = resolved.scene;
    updatedPlayer = resolved.player;

    // SceneModelView を返す
    return {
      scene: updatedScene,
      player: updatedPlayer,
    };
  }
}
