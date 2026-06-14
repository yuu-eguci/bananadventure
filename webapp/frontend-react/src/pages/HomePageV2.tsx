import { useEffect, useState } from "react";

import { Alert, Box, Snackbar, Typography } from "@mui/material";

import ResetButton from "@/components/ResetButton";
import EndingAchievementsDialog from "@/components/HomePageV2/EndingAchievementsDialog";
import HomePageV2RightPanel from "@/components/HomePageV2/HomePageV2RightPanel";
import JingleBackdrop from "@/components/HomePageV2/JingleBackdrop";
import MainSection from "@/components/HomePageV2/MainSection";
import ItemWidget from "@/components/HomePageV2/ItemWidget";
import SceneOverlay from "@/components/HomePageV2/SceneOverlay";
import sceneData from "@/data/bananadventure-scenes.json";
import useHomePageV2SceneOverlayLayout from "@/hooks/useHomePageV2SceneOverlayLayout";
import useHomePageV2Game from "@/hooks/useHomePageV2Game";
import { BgmTrackKey, useBgmPlayer } from "@/hooks/useBgmPlayer";
import { Scene } from "@/models";

const ENDING_SCENE_IDS = {
  TRUE: 14,
  BAD: 15,
} as const;

const allCollectibleItemIds = Array.from(
  new Set(
    (sceneData as Scene[]).flatMap((scene) =>
      scene.sceneChoices.flatMap((sceneChoice) => sceneChoice.itemsOnSelect.map((item) => item.id)),
    ),
  ),
);

function HomePageV2() {
  const { rightPanelRef, sceneOverlayRef, sceneOverlayTop, overlayExtensionHeight } =
    useHomePageV2SceneOverlayLayout();
  const { scene, player, isLoading, leadResponseText, selectChoice, useItem, reset } =
    useHomePageV2Game();
  const [isEndingDialogOpen, setIsEndingDialogOpen] = useState(false);
  const currentSceneId = scene?.id ?? -1;
  const isEndingScene =
    currentSceneId === ENDING_SCENE_IDS.TRUE || currentSceneId === ENDING_SCENE_IDS.BAD;
  const trackKey: BgmTrackKey = isEndingScene ? "ending" : "main";
  const {
    isPlaying: isBgmPlaying,
    toggle: toggleBgm,
    errorMessage: bgmErrorMessage,
    clearError: clearBgmError,
    currentTrackLabel,
  } = useBgmPlayer(trackKey);

  useEffect(() => {
    if (isEndingScene) {
      setIsEndingDialogOpen(true);
      return;
    }

    setIsEndingDialogOpen(false);
  }, [isEndingScene]);

  const playerItemIdSet = new Set((player?.items ?? []).map((item) => item.id));
  const collectedItemCount = allCollectibleItemIds.filter((itemId) => playerItemIdSet.has(itemId)).length;
  const isAllItemsCompleted =
    allCollectibleItemIds.length > 0 &&
    allCollectibleItemIds.every((itemId) => playerItemIdSet.has(itemId));
  const achievements = [
    {
      id: "true-end",
      label: "トゥルーエンド",
      note: "scene 14 に到達",
      achieved: currentSceneId === ENDING_SCENE_IDS.TRUE,
    },
    {
      id: "bad-end",
      label: "バッドエンド",
      note: "scene 15 に到達",
      achieved: currentSceneId === ENDING_SCENE_IDS.BAD,
    },
    {
      id: "all-items",
      label: "全アイテムコンプ",
      note: `${collectedItemCount}/${allCollectibleItemIds.length} アイテム取得`,
      achieved: isAllItemsCompleted,
    },
  ];

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
        <MainSection
          imageSrc={scene?.image ?? "/sample-image/sample.png"}
          overlayExtensionHeight={overlayExtensionHeight}
        >
          <HomePageV2RightPanel
            ref={rightPanelRef}
            isBgmPlaying={isBgmPlaying}
            onToggleBgm={toggleBgm}
            bananaMeterValue={player?.bananaMeter ?? 0}
          >
            {(player?.items ?? []).map((item) => (
              <ItemWidget
                key={item.id}
                item={item}
                onUse={async (targetItem) => {
                  await useItem(targetItem);
                }}
              />
            ))}
          </HomePageV2RightPanel>
          <SceneOverlay
            ref={sceneOverlayRef}
            scene={scene}
            leadResponseText={leadResponseText}
            top={sceneOverlayTop}
            isLoading={isLoading}
            onSelectChoice={(choice) => {
              void selectChoice(choice);
            }}
          />
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

      <JingleBackdrop open={isLoading} />
      <EndingAchievementsDialog
        open={isEndingDialogOpen}
        onClose={() => setIsEndingDialogOpen(false)}
        achievements={achievements}
      />
      <ResetButton
        page="v2"
        onClick={() => {
          setIsEndingDialogOpen(false);
          void reset();
        }}
      />
    </>
  );
}

export default HomePageV2;
