import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { Alert, Box, Button, Snackbar, Typography } from "@mui/material";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

import BananaMeterWidget from "@/components/HomePageV2/BananaMeterWidget";
import EndingAchievementsDialog from "@/components/HomePageV2/EndingAchievementsDialog";
import HomePageV2RightPanel from "@/components/HomePageV2/HomePageV2RightPanel";
import JingleBackdrop from "@/components/HomePageV2/JingleBackdrop";
import MainSection from "@/components/HomePageV2/MainSection";
import { MAIN_SECTION_MAX_WIDTH } from "@/components/HomePageV2/mainSectionLayout";
import ItemWidget from "@/components/HomePageV2/ItemWidget";
import SceneOverlay from "@/components/HomePageV2/SceneOverlay";
import SystemDialog from "@/components/HomePageV2/SystemDialog";
import sceneData from "@/data/bananadventure-scenes.json";
import useHomePageV2SceneOverlayLayout from "@/hooks/useHomePageV2SceneOverlayLayout";
import useHomePageV2Game from "@/hooks/useHomePageV2Game";
import { BgmTrackKey, useBgmPlayer } from "@/hooks/useBgmPlayer";
import { MESSAGE_SPEEDS, useMessageSpeed } from "@/hooks/useMessageSpeed";
import { Scene } from "@/models";
import { SPECIAL_SCENE_IDS } from "@/services/SceneService";
import { buildAchievements, collectAllCollectibleItemIds } from "@/services/achievement";
import { FALLBACK_IMAGE_SRC } from "@/components/HomePageV2/imageFallback";

const allCollectibleItemIds = collectAllCollectibleItemIds(sceneData as Scene[]);

function HomePageV2() {
  const { t } = useTranslation();
  const { mainImageRef, sceneOverlayContentRef, sceneOverlayTop, overlayExtensionHeight } =
    useHomePageV2SceneOverlayLayout();
  const {
    scene,
    player,
    isLoading,
    leadResponseText,
    leadBananaMeterDelta,
    leadAddedItems,
    errorMessage: gameErrorMessage,
    clearError: clearGameError,
    selectChoice,
    applyItem,
    reset,
  } = useHomePageV2Game();
  const { messageSpeed, changeMessageSpeed } = useMessageSpeed();
  const [isEndingDialogOpen, setIsEndingDialogOpen] = useState(false);
  const [isSystemDialogOpen, setIsSystemDialogOpen] = useState(false);
  // バナナメーターの明滅シグナル。明滅のタイミングはメッセージ描画側（SceneOverlay）が制御する。
  const [bananaMeterFlashSignal, setBananaMeterFlashSignal] = useState(0);

  // バナナメーターの「実値」と「表示値」を分離する。
  // 実値はシーン切替（setViewModel）の時点で変わるが、表示値は明滅トリガーのタイミングで実値へ合わせる。
  const actualBananaMeter = player?.bananaMeter ?? 0;
  const actualBananaMeterRef = useRef(actualBananaMeter);
  const [displayedBananaMeter, setDisplayedBananaMeter] = useState(actualBananaMeter);

  useEffect(() => {
    actualBananaMeterRef.current = actualBananaMeter;
    // 増減のない遷移（初期化・リセット・delta=0 の選択肢）では明滅しないので、表示値をすぐ合わせる。
    // 増減のある選択肢（leadBananaMeterDelta !== 0）は、明滅トリガー時にコミットするため、ここでは合わせない。
    if (leadBananaMeterDelta === 0) {
      setDisplayedBananaMeter(actualBananaMeter);
    }
  }, [actualBananaMeter, leadBananaMeterDelta]);

  const triggerBananaMeterFlash = useCallback((nextBananaMeter?: number) => {
    // 明滅と同時に、表示値を実値へコミットする。
    setDisplayedBananaMeter(nextBananaMeter ?? actualBananaMeterRef.current);
    setBananaMeterFlashSignal((signal) => signal + 1);
  }, []);

  // 入手したアイテムは、メッセージが入手行に達する pause まで隠しておく。
  // pause で reveal すると ItemWidget がマウントされ、登場の明滅（タスク 30）が走る。
  const [hiddenItemIds, setHiddenItemIds] = useState<Set<number>>(new Set());
  useEffect(() => {
    setHiddenItemIds(new Set(leadAddedItems.map((item) => item.id)));
  }, [leadAddedItems]);
  const revealAddedItems = useCallback(() => {
    setHiddenItemIds(new Set());
  }, []);
  const visibleItems = useMemo(
    () => (player?.items ?? []).filter((item) => !hiddenItemIds.has(item.id)),
    [player?.items, hiddenItemIds],
  );

  const currentSceneId = scene?.id ?? -1;
  const isEndingScene =
    currentSceneId === SPECIAL_SCENE_IDS.TRUE_END ||
    currentSceneId === SPECIAL_SCENE_IDS.GAMEOVER;
  const trackKey: BgmTrackKey = isEndingScene ? "ending" : "main";
  const {
    isPlaying: isBgmPlaying,
    toggle: toggleBgm,
    errorMessage: bgmErrorMessage,
    clearError: clearBgmError,
    currentTrackLabel,
  } = useBgmPlayer(trackKey);

  const achievements = buildAchievements({
    allCollectibleItemIds,
    player,
    currentSceneId,
  });

  return (
    <>
      <Box
        sx={{
          width: "100%",
          maxWidth: MAIN_SECTION_MAX_WIDTH,
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
          imageSrc={scene?.image ?? FALLBACK_IMAGE_SRC}
          overlayExtensionHeight={overlayExtensionHeight}
          imageAreaRef={mainImageRef}
        >
          {/* メッセージオーバーレイ上端のすぐ外側（左）にバナナメーターを置く。
              top をオーバーレイ上端に合わせ、translateY(-100%) で上へ逃がして貼り付ける。 */}
          <Box
            sx={{
              position: "absolute",
              left: "12px",
              top: sceneOverlayTop,
              transform: "translateY(calc(-100% - 8px))",
              zIndex: 3,
            }}
          >
            <BananaMeterWidget value={displayedBananaMeter} flashSignal={bananaMeterFlashSignal} />
          </Box>
          <HomePageV2RightPanel isBgmPlaying={isBgmPlaying} onToggleBgm={toggleBgm}>
            {visibleItems.map((item) => (
              <ItemWidget
                key={item.id}
                item={item}
                isLoading={isLoading}
                onUse={async (targetItem) => {
                  const updatedViewModel = await applyItem(targetItem);
                  // アイテム使用でメーターが動いたら、その場で明滅させる（メッセージ描画とは競合しない）。
                  if (updatedViewModel && targetItem.bananaMeterDelta !== 0) {
                    triggerBananaMeterFlash(updatedViewModel.player.bananaMeter);
                  }
                  // 成功（viewModel が返った）かどうかを ItemWidget に伝える。
                  return updatedViewModel !== null;
                }}
              />
            ))}
          </HomePageV2RightPanel>
          <SceneOverlay
            ref={sceneOverlayContentRef}
            scene={scene}
            leadResponseText={leadResponseText}
            leadBananaMeterDelta={leadBananaMeterDelta}
            leadAddedItems={leadAddedItems}
            top={sceneOverlayTop}
            isLoading={isLoading}
            isEndingScene={isEndingScene}
            charDelayMs={MESSAGE_SPEEDS[messageSpeed].charDelayMs}
            ghostTrail={MESSAGE_SPEEDS[messageSpeed].ghostTrail}
            onBananaMeterFlash={triggerBananaMeterFlash}
            onRevealItems={revealAddedItems}
            onOpenEnding={() => setIsEndingDialogOpen(true)}
            onSelectChoice={(choice) => {
              void selectChoice(choice);
            }}
          />
        </MainSection>

        <Box sx={{ mt: 2, display: "flex", justifyContent: "center", gap: 2 }}>
          <Button variant="outlined" component={Link} to="/lore" color="info">
            {t("lore.title")}
          </Button>
          <Button variant="outlined" color="info" onClick={() => setIsSystemDialogOpen(true)}>
            システム
          </Button>
        </Box>
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

      <Snackbar
        open={gameErrorMessage !== null}
        autoHideDuration={4000}
        onClose={(_, reason) => {
          if (reason === "clickaway") {
            return;
          }
          clearGameError();
        }}
      >
        <Alert onClose={clearGameError} severity="error" sx={{ width: "100%" }}>
          {gameErrorMessage ?? ""}
        </Alert>
      </Snackbar>

      <JingleBackdrop open={isLoading} />
      <EndingAchievementsDialog
        open={isEndingDialogOpen}
        onClose={() => setIsEndingDialogOpen(false)}
        achievements={achievements}
      />
      <SystemDialog
        open={isSystemDialogOpen}
        onClose={() => setIsSystemDialogOpen(false)}
        messageSpeed={messageSpeed}
        onChangeMessageSpeed={changeMessageSpeed}
        onReset={() => {
          setIsEndingDialogOpen(false);
          void reset();
        }}
      />
    </>
  );
}

export default HomePageV2;
