// NOTE: 実のところ、バックエンド側に定義したいと思っているものだ。
//       バックエンド側の実装をコツコツやるより、いまはとりあえずフロントエンド側で迅速に作り上げちゃいたいので、
//       フロントエンド側に定義している。
//       そのうち、バックエンド側に移動させるつもり。
// WARN: Django のように new して使用することは不可!
//       これは TypeScript の type/interface ベースの定義なので、ただの構造情報です。

export interface Item {
  id: number;
  text: string;
  description: string;
  responseText: string;
  bananaMeterDelta: number;
  bananaMeterDeltaPercent: number;
  image: string;
  used: boolean;
}

export interface SceneChoice {
  id: number;
  order: number;
  image: string;
  text: string;
  responseText: string;
  bananaMeterDelta: number;
  nextSceneId: number;
  itemsOnSelect: Item[];
}

export interface TriggerItem {
  item: Item;
  nextSceneId: number;
}

export interface Scene {
  id: number;
  triggerItems: TriggerItem[];
  image: string;
  text: string;
  sceneChoices: SceneChoice[];
}

export interface Player {
  id: number;
  name: string;
  bananaMeter: number;
  bananaMeterChanged: boolean;
  items: Item[];
  itemsChanged: boolean;
}
