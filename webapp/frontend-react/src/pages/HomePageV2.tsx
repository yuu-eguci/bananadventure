import { Alert, Box, Snackbar, Typography } from "@mui/material";

import BananaMeterWidget from "@/components/HomePageV2/BananaMeterWidget";
import BgmToggleButton from "@/components/HomePageV2/BgmToggleButton";
import ItemWidget from "@/components/HomePageV2/ItemWidget";
import MainSection from "@/components/HomePageV2/MainSection";
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
        <MainSection imageSrc="/sample-image/sample.png">
          {/* 右パネル: BGM・バナナメーター・アイテムを縦に並べる */}
          <Box
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
