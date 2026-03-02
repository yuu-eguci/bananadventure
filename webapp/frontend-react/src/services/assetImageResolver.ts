import { Scene } from "@/models";

const assetModules = import.meta.glob("../assets/**/*.{png,jpg,jpeg,webp,gif,svg,avif}", {
  eager: true,
  import: "default",
}) as Record<string, string>;

function toLogicalPath(assetModulePath: string): string | null {
  const match = assetModulePath.match(/(?:^|\/)assets\/(.+)$/);
  if (!match) {
    return null;
  }
  return `/${match[1]}`;
}

const assetPathMap = Object.entries(assetModules).reduce<Record<string, string>>(
  (accumulator, [assetModulePath, resolvedUrl]) => {
    const logicalPath = toLogicalPath(assetModulePath);
    if (!logicalPath) {
      return accumulator;
    }
    accumulator[logicalPath] = resolvedUrl;
    return accumulator;
  },
  {},
);

export function resolveImageUrl(imagePath: string): string {
  if (!imagePath) {
    return imagePath;
  }

  const logicalPath = imagePath.startsWith("/") ? imagePath : `/${imagePath}`;
  return assetPathMap[logicalPath] ?? imagePath;
}

export function resolveSceneImages(scene: Scene): Scene {
  return {
    ...scene,
    image: resolveImageUrl(scene.image),
    triggerItems: scene.triggerItems.map((triggerItem) => ({
      ...triggerItem,
      item: {
        ...triggerItem.item,
        image: resolveImageUrl(triggerItem.item.image),
      },
    })),
    sceneChoices: scene.sceneChoices.map((sceneChoice) => ({
      ...sceneChoice,
      image: resolveImageUrl(sceneChoice.image),
      itemsOnSelect: sceneChoice.itemsOnSelect.map((item) => ({
        ...item,
        image: resolveImageUrl(item.image),
      })),
    })),
  };
}

