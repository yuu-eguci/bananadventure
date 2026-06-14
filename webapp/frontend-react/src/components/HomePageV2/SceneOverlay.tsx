import { forwardRef } from "react";

import { Box, Card, CardActionArea, CardContent, Fade, Typography } from "@mui/material";

import useTypewriter from "@/hooks/useTypewriter";
import { WIDGET_FLASH_DURATION_MS } from "@/components/HomePageV2/widgetFlash";
import { Scene, SceneChoice } from "@/models";

type Props = {
  scene: Scene | null;
  leadResponseText: string | null;
  // 直前の選択肢のバナナメーター増減量。0 以外なら lead を打ち終えた所で止めて明滅させる。
  leadBananaMeterDelta: number;
  top: number;
  isLoading: boolean;
  isEndingScene: boolean;
  charDelayMs: number;
  onBananaMeterFlash: () => void;
  onOpenEnding: () => void;
  onSelectChoice: (choice: SceneChoice) => void;
};

const ENDING_SCENE_LABEL = "FIN";
const ENDING_SCENE_HINT = "アチーブメントを確認";

const SceneOverlay = forwardRef<HTMLDivElement, Props>(function SceneOverlay(
  {
    scene,
    leadResponseText,
    leadBananaMeterDelta,
    top,
    isLoading,
    isEndingScene,
    charDelayMs,
    onBananaMeterFlash,
    onOpenEnding,
    onSelectChoice,
  }: Props,
  ref,
) {
  const sceneChoices = scene?.sceneChoices ?? [];
  const hasSceneChoices = sceneChoices.length > 0;
  const shouldShowActionArea = isEndingScene || hasSceneChoices;

  // lead レスポンスと本文を 1 本のテキストとして 1 文字ずつ描画する。
  // ローディング中（JingleBackdrop で隠れている間）は打たず、表示されてから打ち始める。
  const leadText = leadResponseText ?? "";
  const sceneText = scene?.text ?? "";
  // バナナメーター増減があるときは、lead（レスポンス + 増減行）を打ち終えた位置で
  // いったん止めてバナナメーターを明滅させ、明滅時間が終わってから本文の描画を再開する。
  const { displayedText, isComplete, skip } = useTypewriter(leadText + sceneText, charDelayMs, !isLoading, {
    pauseAtIndex: leadBananaMeterDelta !== 0 && leadText.length > 0 ? leadText.length : null,
    pauseDurationMs: WIDGET_FLASH_DURATION_MS,
    onReachPause: onBananaMeterFlash,
  });

  // 結合テキストの表示位置を、lead 部分と本文部分に切り分ける。
  const visibleLeadText = displayedText.slice(0, leadText.length);
  const visibleSceneText = displayedText.slice(leadText.length);
  // lead を打ち終わってから区切りの *** を出す。
  const shouldShowSeparator = leadText.length > 0 && displayedText.length >= leadText.length;
  // 描画が終わってから選択肢／FIN を出す。
  const shouldRenderActionArea = isComplete && shouldShowActionArea;

  return (
    // 外側 Box: 帯の暗い背景を担当。top → 画像下端（bottom:0）まで引き伸ばす。
    // ★ここには ref を付けない（引き伸ばされた高さを測ると延長計算がループするため）。
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
      {/* ★延長量の計算はこの要素の高さで行うので、ref はここだけに付ける。 */}
      {/* 打鍵途中はタップで残りを一気に表示する（VN 定番のスキップ）。 */}
      <Box
        ref={ref}
        onClick={() => {
          if (!isComplete) {
            skip();
          }
        }}
        sx={{
          px: 2,
          py: 2,
          display: "flex",
          flexDirection: "column",
          cursor: isComplete ? "default" : "pointer",
        }}
      >
        {leadText.length > 0 ? (
          <>
            <Typography variant="subtitle1" sx={{ mb: 1, whiteSpace: "pre-line" }}>
              {visibleLeadText}
            </Typography>
            {shouldShowSeparator ? (
              <Typography variant="subtitle1" sx={{ mb: 1, textAlign: "center", opacity: 0.7 }}>
                ***
              </Typography>
            ) : null}
          </>
        ) : null}

        <Typography variant="subtitle1" sx={{ mb: shouldRenderActionArea ? 1.5 : 0 }}>
          {visibleSceneText}
        </Typography>

        {shouldRenderActionArea ? (
          <Fade in timeout={400}>
            <Box>
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
