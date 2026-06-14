import { useLayoutEffect, useRef, useState } from "react";

import { MAIN_SECTION_HEIGHT } from "@/components/HomePageV2/MainSection";

const SCENE_OVERLAY_HEIGHT_RATIO = 0.45;

function useHomePageV2SceneOverlayLayout() {
  const mainImageRef = useRef<HTMLDivElement | null>(null);
  const sceneOverlayRef = useRef<HTMLDivElement | null>(null);
  const [mainImageHeight, setMainImageHeight] = useState<number>(MAIN_SECTION_HEIGHT.xs);
  const [overlayExtensionHeight, setOverlayExtensionHeight] = useState(0);
  const sceneOverlayTop = Math.round(mainImageHeight * (1 - SCENE_OVERLAY_HEIGHT_RATIO));

  useLayoutEffect(() => {
    const mainImageElement = mainImageRef.current;
    if (!mainImageElement) {
      return;
    }

    const updateMainImageHeight = () => {
      setMainImageHeight(mainImageElement.getBoundingClientRect().height);
    };

    updateMainImageHeight();

    const resizeObserver = new ResizeObserver(() => {
      updateMainImageHeight();
    });

    resizeObserver.observe(mainImageElement);

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  useLayoutEffect(() => {
    const sceneOverlayElement = sceneOverlayRef.current;
    if (!sceneOverlayElement) {
      return;
    }

    const updateOverlayExtensionHeight = () => {
      const requiredHeight = sceneOverlayTop + sceneOverlayElement.scrollHeight;
      setOverlayExtensionHeight(Math.max(0, Math.ceil(requiredHeight - mainImageHeight)));
    };

    updateOverlayExtensionHeight();

    const resizeObserver = new ResizeObserver(() => {
      updateOverlayExtensionHeight();
    });

    resizeObserver.observe(sceneOverlayElement);

    return () => {
      resizeObserver.disconnect();
    };
  }, [mainImageHeight, sceneOverlayTop]);

  return {
    mainImageRef,
    sceneOverlayRef,
    sceneOverlayTop,
    overlayExtensionHeight,
  };
}

export default useHomePageV2SceneOverlayLayout;
