import { describe, expect, it } from "vitest";

import { SceneChoice } from "@/models";
import { SceneService } from "@/services/SceneService";
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

  it("moves to gameover scene when banana meter reaches zero after a scene choice", async () => {
    const service = new SceneService();
    let viewModel = await service.fetchInitialViewModel();

    viewModel = await advanceScene(service, viewModel, 0);
    viewModel = await advanceScene(service, viewModel, 1);

    expect(viewModel.scene.id).toBe(15);
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

    expect(viewModel.scene.id).toBe(15);
    expect(viewModel.player.bananaMeter).toBe(0);
    expect(viewModel.player.items.find((item) => item.id === 1)?.used).toBe(true);
  });
});
