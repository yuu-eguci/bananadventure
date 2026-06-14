import { useLayoutEffect, useRef, useState } from "react";

import { MAIN_SECTION_HEIGHT } from "@/components/HomePageV2/mainSectionLayout";

const SCENE_OVERLAY_HEIGHT_RATIO = 0.3;

function useHomePageV2SceneOverlayLayout() {
  const mainImageRef = useRef<HTMLDivElement | null>(null);
  const sceneOverlayContentRef = useRef<HTMLDivElement | null>(null);
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
    const sceneOverlayContentElement = sceneOverlayContentRef.current;
    if (!sceneOverlayContentElement) {
      return;
    }

    const updateOverlayExtensionHeight = () => {
      const requiredHeight = sceneOverlayTop + sceneOverlayContentElement.getBoundingClientRect().height;
      setOverlayExtensionHeight(Math.max(0, Math.ceil(requiredHeight - mainImageHeight)));
    };

    updateOverlayExtensionHeight();

    const resizeObserver = new ResizeObserver(() => {
      updateOverlayExtensionHeight();
    });

    resizeObserver.observe(sceneOverlayContentElement);

    return () => {
      resizeObserver.disconnect();
    };
  }, [mainImageHeight, sceneOverlayTop]);

  return {
    mainImageRef,
    sceneOverlayContentRef,
    sceneOverlayTop,
    overlayExtensionHeight,
  };
}

export default useHomePageV2SceneOverlayLayout;
