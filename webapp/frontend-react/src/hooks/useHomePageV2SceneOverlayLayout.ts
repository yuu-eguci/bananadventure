import { useLayoutEffect, useRef, useState } from "react";
import { useMediaQuery, useTheme } from "@mui/material";

import { MAIN_SECTION_HEIGHT } from "@/components/HomePageV2/MainSection";

const RIGHT_PANEL_TO_OVERLAY_GAP_PX = 24;

function useHomePageV2SceneOverlayLayout() {
  const rightPanelRef = useRef<HTMLDivElement | null>(null);
  const sceneOverlayRef = useRef<HTMLDivElement | null>(null);
  const theme = useTheme();
  const isMdUp = useMediaQuery(theme.breakpoints.up("md"));
  const [sceneOverlayTop, setSceneOverlayTop] = useState(0);
  const [overlayExtensionHeight, setOverlayExtensionHeight] = useState(0);

  useLayoutEffect(() => {
    const rightPanelElement = rightPanelRef.current;
    if (!rightPanelElement) {
      return;
    }

    const updateSceneOverlayTop = () => {
      setSceneOverlayTop(rightPanelElement.getBoundingClientRect().height + RIGHT_PANEL_TO_OVERLAY_GAP_PX);
    };

    updateSceneOverlayTop();

    const resizeObserver = new ResizeObserver(() => {
      updateSceneOverlayTop();
    });

    resizeObserver.observe(rightPanelElement);

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  useLayoutEffect(() => {
    const sceneOverlayElement = sceneOverlayRef.current;
    if (!sceneOverlayElement) {
      return;
    }

    const baseHeight = isMdUp ? MAIN_SECTION_HEIGHT.md : MAIN_SECTION_HEIGHT.xs;

    const updateOverlayExtensionHeight = () => {
      const requiredHeight = sceneOverlayTop + sceneOverlayElement.scrollHeight;
      setOverlayExtensionHeight(Math.max(0, requiredHeight - baseHeight));
    };

    updateOverlayExtensionHeight();

    const resizeObserver = new ResizeObserver(() => {
      updateOverlayExtensionHeight();
    });

    resizeObserver.observe(sceneOverlayElement);

    return () => {
      resizeObserver.disconnect();
    };
  }, [isMdUp, sceneOverlayTop]);

  return {
    rightPanelRef,
    sceneOverlayRef,
    sceneOverlayTop,
    overlayExtensionHeight,
  };
}

export default useHomePageV2SceneOverlayLayout;
