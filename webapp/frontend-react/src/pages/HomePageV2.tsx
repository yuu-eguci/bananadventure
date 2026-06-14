import { Alert, Box, Snackbar, Typography } from "@mui/material";

import HomePageV2RightPanel from "@/components/HomePageV2/HomePageV2RightPanel";
import MainSection from "@/components/HomePageV2/MainSection";
import ItemWidget from "@/components/HomePageV2/ItemWidget";
import SceneOverlayPreview from "@/components/HomePageV2/SceneOverlayPreview";
import useHomePageV2SceneOverlayLayout from "@/hooks/useHomePageV2SceneOverlayLayout";
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
  const { rightPanelRef, sceneOverlayRef, sceneOverlayTop, overlayExtensionHeight } =
    useHomePageV2SceneOverlayLayout();
  const {
    isPlaying: isBgmPlaying,
    toggle: toggleBgm,
    errorMessage: bgmErrorMessage,
    clearError: clearBgmError,
    currentTrackLabel,
  } = useBgmPlayer("main");

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
        <MainSection imageSrc="/sample-image/sample.png" overlayExtensionHeight={overlayExtensionHeight}>
          <HomePageV2RightPanel
            ref={rightPanelRef}
            isBgmPlaying={isBgmPlaying}
            onToggleBgm={toggleBgm}
            bananaMeterValue={0}
          >
            <ItemWidget item={stubItem1} onUse={() => {}} />
            <ItemWidget item={stubItem2} onUse={() => {}} />
            <ItemWidget item={stubItem3} onUse={() => {}} />
          </HomePageV2RightPanel>
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
