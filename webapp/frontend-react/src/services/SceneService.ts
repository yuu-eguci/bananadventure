import { SceneViewModel } from "../viewModels";
import { Scene, Player, SceneChoice } from "../models";
import sceneData from "@/data/bananadventure-scenes.json";

// 特殊な Scene
const SPECIAL_SCENE_IDS = {
  GAMEOVER: 15,
}

export class SceneService {
  // NOTE: いやあ、 private method 使いたいので constructor 作った。
  constructor() {}

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
    return scene;
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
    const updatedPlayer = { ...viewModel.player };

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

    // SceneModelView.scene.triggerItems 処理
    while (true) {
      const triggers = updatedScene.triggerItems;
      let triggered = false;

      for (const triggerItem of triggers) {
        const { item, nextSceneId } = triggerItem;
        const hasItem = updatedPlayer.items.some((i) => i.id === item.id);
        if (hasItem) {
          updatedScene = await this.getScene({ sceneId: nextSceneId });
          triggered = true;
          break;
        }
      }

      if (!triggered) {
        break
      };
    }

    // SceneModelView を返す
    return {
      scene: updatedScene,
      player: updatedPlayer,
    };
  }
}
