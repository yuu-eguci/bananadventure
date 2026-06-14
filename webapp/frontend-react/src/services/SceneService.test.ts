import { describe, expect, it } from "vitest";

import { SceneChoice } from "@/models";
import { SceneService, SPECIAL_SCENE_IDS } from "@/services/SceneService";
import { SceneViewModel } from "@/viewModels";

async function advanceScene(
  service: SceneService,
  viewModel: SceneViewModel,
  selectedSceneChoiceId: number,
): Promise<SceneViewModel> {
  return service.selectSceneChoice({
    viewModel,
    selectedSceneChoiceId,
  });
}

function expectCurrentSceneChoice(viewModel: SceneViewModel, choiceId: number): SceneChoice {
  const choice = viewModel.scene.sceneChoices.find((candidate) => candidate.id === choiceId);
  expect(choice).toBeDefined();
  return choice!;
}

describe("SceneService", () => {
  it("updates banana meter from scene choices", async () => {
    const service = new SceneService();
    let viewModel = await service.fetchInitialViewModel();

    viewModel = await advanceScene(service, viewModel, 0);

    expect(viewModel.scene.id).toBe(1);
    expect(viewModel.player.bananaMeter).toBe(100);
  });

  it("does not mutate the input viewModel when a choice grants items", async () => {
    const service = new SceneService();
    let viewModel = await service.fetchInitialViewModel();

    // scene 0 -> 1（バナナバー）。 scene 1 で choice 2 を選ぶと soy banana を入手する。
    viewModel = await advanceScene(service, viewModel, 0);

    const choiceWithItem = expectCurrentSceneChoice(viewModel, 2);
    expect(choiceWithItem.itemsOnSelect.length).toBeGreaterThan(0);

    const itemsBefore = viewModel.player.items;
    const itemsLengthBefore = itemsBefore.length;

    const nextViewModel = await advanceScene(service, viewModel, 2);

    // 入力 viewModel の items 配列・件数は変わらない（参照も別物）。
    expect(viewModel.player.items).toBe(itemsBefore);
    expect(viewModel.player.items.length).toBe(itemsLengthBefore);
    expect(nextViewModel.player.items).not.toBe(itemsBefore);
    expect(nextViewModel.player.items.length).toBe(itemsLengthBefore + choiceWithItem.itemsOnSelect.length);
  });

  it("moves to gameover scene when banana meter reaches zero after a scene choice", async () => {
    const service = new SceneService();
    let viewModel = await service.fetchInitialViewModel();

    viewModel = await advanceScene(service, viewModel, 0);
    viewModel = await advanceScene(service, viewModel, 1);

    expect(viewModel.scene.id).toBe(SPECIAL_SCENE_IDS.GAMEOVER);
    expect(viewModel.player.bananaMeter).toBe(0);
  });

  it("consumes trigger item and moves to scene 11 when entering scene 10 with soy banana", async () => {
    const service = new SceneService();
    let viewModel = await service.fetchInitialViewModel();

    viewModel = await advanceScene(service, viewModel, 0);
    viewModel = await advanceScene(service, viewModel, 2);
    viewModel = await advanceScene(service, viewModel, 0);
    viewModel = await advanceScene(service, viewModel, 0);
    viewModel = await advanceScene(service, viewModel, 0);
    viewModel = await advanceScene(service, viewModel, 0);
    viewModel = await advanceScene(service, viewModel, 1);
    viewModel = await advanceScene(service, viewModel, 0);
    viewModel = await advanceScene(service, viewModel, 1);
    viewModel = await advanceScene(service, viewModel, 1);

    expect(viewModel.scene.id).toBe(11);
    expect(viewModel.player.items.find((item) => item.id === 0)?.used).toBe(true);
  });

  it("moves to gameover scene when item usage drops banana meter to zero", async () => {
    const service = new SceneService();
    let viewModel = await service.fetchInitialViewModel();

    viewModel = await advanceScene(service, viewModel, 0);
    viewModel = await advanceScene(service, viewModel, 3);
    viewModel = await advanceScene(service, viewModel, 0);
    viewModel = await advanceScene(service, viewModel, 1);
    viewModel = await advanceScene(service, viewModel, 2);
    viewModel = await advanceScene(service, viewModel, 2);

    const strongZeroChoice = expectCurrentSceneChoice(viewModel, 2);
    expect(strongZeroChoice.itemsOnSelect[0]?.id).toBe(1);

    viewModel = await advanceScene(service, viewModel, 2);
    viewModel = {
      ...viewModel,
      player: {
        ...viewModel.player,
        bananaMeter: 9,
      },
    };

    viewModel = await service.useItem({
      viewModel,
      itemId: 1,
    });

    expect(viewModel.scene.id).toBe(SPECIAL_SCENE_IDS.GAMEOVER);
    expect(viewModel.player.bananaMeter).toBe(0);
    expect(viewModel.player.items.find((item) => item.id === 1)?.used).toBe(true);
  });
});
