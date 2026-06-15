import { forwardRef, useCallback, useMemo, useRef, useState } from "react";

import { Box, Card, CardActionArea, CardContent, Fade, Typography } from "@mui/material";

import useTypewriter from "@/hooks/useTypewriter";
import { applyGhostTrail } from "@/hooks/ghostTrail";
import { WIDGET_FLASH_DURATION_MS } from "@/components/HomePageV2/widgetFlash";
import { buildLeadMessageSegments } from "@/components/HomePageV2/leadMessage";
import { Item, Scene, SceneChoice } from "@/models";

type Props = {
  scene: Scene | null;
  leadResponseText: string | null;
  // 直前の選択肢のバナナメーター増減量。0 以外なら増減行を出した所で止めて明滅させる。
  leadBananaMeterDelta: number;
  // 直前の選択肢で入手したアイテム。あれば入手行を出した所で止めてウィジェットを追加する。
  leadAddedItems: Item[];
  top: number;
  isLoading: boolean;
  isEndingScene: boolean;
  charDelayMs: number;
  // 光速ギャグ表示（打鍵済みを全角スペースに変えて最新 1 文字だけ残す）。
  ghostTrail: boolean;
  onBananaMeterFlash: () => void;
  onRevealItems: () => void;
  onOpenEnding: () => void;
  onSelectChoice: (choice: SceneChoice) => void;
};

const ENDING_SCENE_LABEL = "FIN";
const ENDING_SCENE_HINT = "アチーブメントを確認";
const TAP_HINT = "▼ タップして続ける";

type Phase = "lead" | "message";

const SceneOverlay = forwardRef<HTMLDivElement, Props>(function SceneOverlay(
  {
    scene,
    leadResponseText,
    leadBananaMeterDelta,
    leadAddedItems,
    top,
    isLoading,
    isEndingScene,
    charDelayMs,
    ghostTrail,
    onBananaMeterFlash,
    onRevealItems,
    onOpenEnding,
    onSelectChoice,
  }: Props,
  ref,
) {
  const sceneChoices = scene?.sceneChoices ?? [];
  const hasSceneChoices = sceneChoices.length > 0;
  const shouldShowActionArea = isEndingScene || hasSceneChoices;

  const sceneText = scene?.text ?? "";
  // 選択肢レスポンス（本文＋増減行＋入手行）。Phase A で打つテキスト。
  const { leadText, meterPauseIndex, itemPauseIndex } = useMemo(
    () =>
      buildLeadMessageSegments({
        leadResponseText,
        leadBananaMeterDelta,
        leadAddedItems,
      }),
    [leadResponseText, leadBananaMeterDelta, leadAddedItems],
  );
  const hasLead = leadText.length > 0;

  // フェーズ管理。lead があれば lead から、無ければ message から始める。
  // 新しい遷移（lead / scene の組が変わる）ごとに先頭フェーズへ戻す。
  const [phase, setPhase] = useState<Phase>(hasLead ? "lead" : "message");
  const transitionKey = `${leadText}\u0000${sceneText}`;
  const prevKeyRef = useRef(transitionKey);
  if (prevKeyRef.current !== transitionKey) {
    prevKeyRef.current = transitionKey;
    setPhase(hasLead ? "lead" : "message");
  }

  const isLeadPhase = phase === "lead";
  const phaseText = isLeadPhase ? leadText : sceneText;

  // pause（メーター明滅・アイテム reveal）は lead フェーズ内だけ。
  const pausePoints = useMemo(
    () =>
      isLeadPhase
        ? [meterPauseIndex, itemPauseIndex].filter((index): index is number => index !== null)
        : [],
    [isLeadPhase, meterPauseIndex, itemPauseIndex],
  );

  const handleReachPause = useCallback(
    (index: number) => {
      if (index === meterPauseIndex) {
        onBananaMeterFlash();
      }
      if (index === itemPauseIndex) {
        onRevealItems();
      }
    },
    [meterPauseIndex, itemPauseIndex, onBananaMeterFlash, onRevealItems],
  );

  // ローディング中（JingleBackdrop で隠れている間）は打たず、表示されてから打ち始める。
  const { displayedText, isComplete, skip } = useTypewriter(phaseText, charDelayMs, !isLoading, {
    pausePoints,
    pauseDurationMs: WIDGET_FLASH_DURATION_MS,
    onReachPause: handleReachPause,
  });

  const visibleText = ghostTrail ? applyGhostTrail(displayedText, isComplete) : displayedText;

  // lead 完了 → タップ促し。message 完了 → 選択肢 / FIN。
  const shouldShowTapHint = isLeadPhase && isComplete;
  const shouldRenderActionArea = !isLeadPhase && isComplete && shouldShowActionArea;

  const handleClick = () => {
    // 打鍵途中はタップで残りを一気に表示する。
    if (!isComplete) {
      skip();
      return;
    }

    // lead 完了後は、タップで message に進める。
    if (isLeadPhase) {
      setPhase("message");
    }
  };

  return (
    // 外側 Box: 帯の暗い背景を担当。top → 画像下端（bottom:0）まで引き伸ばす。
    // ここには ref を付けない。
    <Box
      sx={{
        position: "absolute",
        left: 0,
        right: 0,
        top,
        bottom: 0,
        zIndex: 2,
        bgcolor: "rgba(0, 0, 0, 0.62)",
        color: "white",
        boxSizing: "border-box",
      }}
    >
      {/* 内側 Box: 中身（メッセージ＋選択肢）。通常フローなので高さ＝中身の自然な高さ。 */}
      {/* 延長量の計算はこの要素の高さで行うので、ref はここだけに付ける。 */}
      <Box
        ref={ref}
        onClick={handleClick}
        sx={{
          px: 2,
          py: 2,
          display: "flex",
          flexDirection: "column",
          cursor: !isComplete || isLeadPhase ? "pointer" : "default",
        }}
      >
        <Typography variant="subtitle1" sx={{ whiteSpace: "pre-line", textAlign: "left" }}>
          {visibleText}
        </Typography>

        {shouldShowTapHint ? (
          <Fade in timeout={300}>
            <Box sx={{ mt: 1, textAlign: "center", opacity: 0.8 }}>
              <Typography variant="subtitle2">{TAP_HINT}</Typography>
            </Box>
          </Fade>
        ) : null}

        {shouldRenderActionArea ? (
          <Fade in timeout={400}>
            <Box sx={{ mt: 1.5 }}>
              {isEndingScene ? (
                <Box
                  sx={{
                    display: "grid",
                    width: "100%",
                    pb: 2,
                  }}
                >
                  <Card
                    sx={{
                      height: "100%",
                      bgcolor: "primary.main",
                      borderRadius: "14px",
                      opacity: isLoading ? 0.7 : 1,
                    }}
                  >
                    <CardActionArea sx={{ height: "100%" }} disabled={isLoading} onClick={onOpenEnding}>
                      <CardContent sx={{ p: 2, textAlign: "center" }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 800, letterSpacing: "0.12em" }}>
                          {ENDING_SCENE_LABEL}
                        </Typography>
                        <Typography variant="body2">{ENDING_SCENE_HINT}</Typography>
                      </CardContent>
                    </CardActionArea>
                  </Card>
                </Box>
              ) : (
                <>
                  <Typography variant="subtitle2" sx={{ mb: 1 }}>
                    選択肢
                  </Typography>

                  <Box
                    sx={{
                      display: "grid",
                      gridTemplateColumns: { xs: "1fr", sm: "repeat(2, minmax(0, 1fr))" },
                      gap: 1,
                      width: "100%",
                      pb: 2,
                    }}
                  >
                    {sceneChoices.map((choice) => (
                      <Card
                        key={choice.id}
                        sx={{
                          height: "100%",
                          bgcolor: "primary.main",
                          borderRadius: "14px",
                          opacity: isLoading ? 0.7 : 1,
                        }}
                      >
                        <CardActionArea
                          sx={{ height: "100%" }}
                          disabled={isLoading}
                          onClick={() => {
                            onSelectChoice(choice);
                          }}
                        >
                          <CardContent sx={{ p: 2 }}>
                            <Typography variant="body2">{choice.text}</Typography>
                          </CardContent>
                        </CardActionArea>
                      </Card>
                    ))}
                  </Box>
                </>
              )}
            </Box>
          </Fade>
        ) : null}
      </Box>
    </Box>
  );
});

export default SceneOverlay;
