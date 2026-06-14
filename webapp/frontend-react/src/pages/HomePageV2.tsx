import { Alert, Box, Snackbar, Typography, useMediaQuery, useTheme } from "@mui/material";
import { useLayoutEffect, useRef, useState } from "react";

import BananaMeterWidget from "@/components/HomePageV2/BananaMeterWidget";
import BgmToggleButton from "@/components/HomePageV2/BgmToggleButton";
import ItemWidget from "@/components/HomePageV2/ItemWidget";
import MainSection, { MAIN_SECTION_HEIGHT } from "@/components/HomePageV2/MainSection";
import SceneOverlayPreview from "@/components/HomePageV2/SceneOverlayPreview";
import { useBgmPlayer } from "@/hooks/useBgmPlayer";
import { Item } from "@/models";
import { resolveImageUrl } from "@/services/assetImageResolver";

const stubItem1: Item = {
  id: 0,
  text: "豆乳バナナ",
  description: "",
  responseText: "",
  bananaMeterDelta: 20,
  bananaMeterDeltaPercent: 0,
  image: resolveImageUrl("/item-image/item-soy-banana-drink.webp"),
  used: false,
};

const stubItem2: Item = {
  id: 1,
  text: "ストロングゼロ",
  description: "",
  responseText: "",
  bananaMeterDelta: -9,
  bananaMeterDeltaPercent: 0,
  image: resolveImageUrl("/item-image/item-strong-zero.webp"),
  used: true,
};

const stubItem3: Item = {
  id: 2,
  text: "六角レンチ・エンブレム・ハーブ",
  description: "",
  responseText: "",
  bananaMeterDelta: 10,
  bananaMeterDeltaPercent: 0,
  image: resolveImageUrl("/item-image/item-survival-kit.webp"),
  used: false,
};

function HomePageV2() {
  const rightPanelRef = useRef<HTMLDivElement | null>(null);
  const sceneOverlayRef = useRef<HTMLDivElement | null>(null);
  const theme = useTheme();
  const isMdUp = useMediaQuery(theme.breakpoints.up("md"));
  const [sceneOverlayTop, setSceneOverlayTop] = useState(0);
  const [mainSectionBottomSpace, setMainSectionBottomSpace] = useState(0);
  const {
    isPlaying: isBgmPlaying,
    toggle: toggleBgm,
    errorMessage: bgmErrorMessage,
    clearError: clearBgmError,
    currentTrackLabel,
  } = useBgmPlayer("main");

  useLayoutEffect(() => {
    const element = rightPanelRef.current;
    if (!element) {
      return;
    }

    const updateSceneOverlayTop = () => {
      setSceneOverlayTop(element.getBoundingClientRect().height + 24);
    };

    updateSceneOverlayTop();

    const resizeObserver = new ResizeObserver(() => {
      updateSceneOverlayTop();
    });

    resizeObserver.observe(element);

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  useLayoutEffect(() => {
    const overlayElement = sceneOverlayRef.current;
    if (!overlayElement) {
      return;
    }

    const baseHeight = isMdUp ? MAIN_SECTION_HEIGHT.md : MAIN_SECTION_HEIGHT.xs;

    const updateMainSectionBottomSpace = () => {
      const requiredHeight = sceneOverlayTop + overlayElement.scrollHeight;
      setMainSectionBottomSpace(Math.max(0, requiredHeight - baseHeight));
    };

    updateMainSectionBottomSpace();

    const resizeObserver = new ResizeObserver(() => {
      updateMainSectionBottomSpace();
    });

    resizeObserver.observe(overlayElement);

    return () => {
      resizeObserver.disconnect();
    };
  }, [isMdUp, sceneOverlayTop]);

  return (
    <>
      <Box
        sx={{
          width: "100%",
          maxWidth: 960,
          mx: "auto",
          px: { xs: 0, sm: 1 },
        }}
      >
        <Typography
          variant="caption"
          sx={{
            display: "block",
            textAlign: "right",
            mb: 0.5,
            color: "text.secondary",
          }}
        >
          ♪ {currentTrackLabel}
        </Typography>
        <MainSection imageSrc="/sample-image/sample.png" bottomSpace={mainSectionBottomSpace}>
          {/* 右パネル: BGM・バナナメーター・アイテムを縦に並べる */}
          <Box
            ref={rightPanelRef}
            sx={{
              position: "absolute",
              top: "12px",
              right: "12px",
              zIndex: 3,
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-end",
              gap: 1,
            }}
          >
            <BgmToggleButton isPlaying={isBgmPlaying} onToggle={toggleBgm} />
            <BananaMeterWidget value={0} />
            <ItemWidget item={stubItem1} onUse={() => {}} />
            <ItemWidget item={stubItem2} onUse={() => {}} />
            <ItemWidget item={stubItem3} onUse={() => {}} />
          </Box>
          <SceneOverlayPreview ref={sceneOverlayRef} top={sceneOverlayTop} />
        </MainSection>
      </Box>

      <Snackbar
        open={bgmErrorMessage !== null}
        autoHideDuration={4000}
        onClose={(_, reason) => {
          if (reason === "clickaway") {
            return;
          }
          clearBgmError();
        }}
      >
        <Alert onClose={clearBgmError} severity="warning" sx={{ width: "100%" }}>
          {bgmErrorMessage ?? ""}
        </Alert>
      </Snackbar>
    </>
  );
}

export default HomePageV2;
