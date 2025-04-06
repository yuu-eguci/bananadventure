設計図
===

## Models

### Scene

- id: シーン番号
- triggerItems: (外部キー) TriggerItem のリスト
- image: シーンの画像
- text: シーンのテキスト
- sceneChoices: (外部キー) SceneChoice のリスト

### TriggerItem

- item: (外部キー) Item これを持っていたら、↓のシーンへ遷移する
- nextScene: (外部キー) Scene 遷移先のシーン

### Item

- id: アイテムの ID
- text: アイテムの名前
- description: アイテムの説明
- responseText: アイテムを選んだときのテキスト
- bananaMeterDelta ばななメーターの変化量
- image: アイテムの画像
- used: 使用済みフラグ

### SceneChoice

- id: 選択肢の ID
- order: 選択肢の順番
- image: 選択肢の画像
- text: 選択肢のテキスト
- responseText: 選択肢を選んだときのテキスト
- bananaMeterDelta ばななメーターの変化量
- nextScene: (外部キー) Scene 選択肢を選んだときに遷移するシーン
- itemsOnSelect: (外部キー) 選択肢を選んだときに手に入る Item のリスト

### Player

- id: プレイヤーの ID
- name: プレイヤーの名前
- bananaMeter: ばななメーターの値
- items: (外部キー) Item のリスト

## ViewModels

### SceneViewModel これを Repository -> Service -> View に渡して表示する

- scene: Scene 現在のシーン
- player: Player プレイヤー

## View で最初にやること

- 引数 null で SceneService を呼ぶ
- SceneService は SceneViewModel を返す
- SceneViewModel を "currentSceneViewModel" として保持する

## View で ViewModel を受け取ったときやること

- ジングルみたいなアニメーションを表示する
- currentSceneViewModel.player.bananaMeter と SceneViewModel.player.bananaMeter が違うなら、アニメーションつきで更新
- currentSceneViewModel.player.items と SceneViewModel.player.items が違うなら、アニメーションつきで更新
- SceneViewModel.scene.image, .text, .sceneChoices を表示する
- SceneViewModel.player.items, .bananaMeter を表示する

## View で選択肢が押されたときやること

- SceneModelView.sceneChoices[n].responseText を表示して、 OK みたいなボタンを表示
- OK ボタンが押されたら↓
- SceneModelView.sceneChoices[n].id, SceneModelView を SceneService に渡す
- SceneService:
    - SceneModelView.scene を SceneModelView.sceneChoices[n].nextScene に更新する
    - SceneModelView.player.items に SceneModelView.sceneChoices[n].itemOnSelect を追加する
    - SceneModelView.player.bananaMeter に SceneModelView.sceneChoices[n].bananaMeterDelta を加算する
    - SceneModelView.scene.triggerItems があれば -> SceneModelView.scene.triggerItems[n].nextScene を使って、もう一度この処理をする
    - SceneViewModel を返す
- "View で ViewModel を受け取ったときやること" へ

## View でアイテムが押されたときやること

- SceneModelView.player.items[n].description を表示して、 OK, Cancel みたいなボタンを表示
- OK ボタンが押されたら↓
- SceneModelView.player.items[n].responseText を表示して、 OK みたいなボタンを表示
- OK ボタンが押されたら↓
- SceneModelView.player.items[n].id, SceneModelView を SceneService に渡す
- SceneService:
    - SceneModelView.player.items[n].used を true にする
    - SceneModelView.player.bananaMeter に SceneModelView.player.items[n].bananaMeterDelta を加算する
    - SceneViewModel を返す
- "View で ViewModel を受け取ったときやること" へ
