// NOTE: Service から画面へ渡すデータの型を定義する。

import { Scene, Player } from "./models";

export interface SceneViewModel {
  scene: Scene;
  player: Player;
}
