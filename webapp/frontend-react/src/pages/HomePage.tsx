import {
  Alert,
  Backdrop,
  Box,
  Button,
  Card,
  CardActionArea,
  CardContent,
  Dialog,
  DialogContent,
  Grid,
  Paper,
  Snackbar,
  Typography,
} from "@mui/material";
import {
  TouchAppOutlined,
  VolumeOffRounded,
  VolumeUpRounded,
} from "@mui/icons-material";
import { keyframes } from "@mui/system";
import { useEffect, useState, useRef } from "react";

import { SceneService } from "@/services/SceneService";
import { SceneViewModel } from "@/viewModels";
import dummyImage from "/sample-image/sample.png";
import { Item, Scene, SceneChoice } from "@/models";
import ResetButton from "@/components/ResetButton";
import { resolveImageUrl } from "@/services/assetImageResolver";
import sceneData from "@/data/bananadventure-scenes.json";
import { useBgmPlayer } from "@/hooks/useBgmPlayer";
// import bananaIcon from "/icon-image/banana.webp";

const service = new SceneService();

const dummyText =
  "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillu";
const bananaMeterImagePath = "/ui-image/banana-meter-icon.webp";
const ENDING_SCENE_IDS = {
  TRUE: 14,
  BAD: 15,
} as const;
const allCollectibleItemIds = Array.from(
  new Set(
    (sceneData as Scene[]).flatMap((scene) =>
      scene.sceneChoices.flatMap((sceneChoice) =>
        sceneChoice.itemsOnSelect.map((item) => item.id),
      ),
    ),
  ),
);
const tapHintBlink = keyframes`
  0%, 100% {
    opacity: 0.45;
  }
  50% {
    opacity: 1;
  }
`;

function HomePage() {
  const [isJingleOpen, setJingleOpen] = useState(true);
  const [viewModel, setViewModel] = useState<SceneViewModel | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogMessage, setDialogMessage] = useState<React.ReactNode>(<></>);
  const [dialogType, setDialogType] = useState<"scene" | "item" | null>(null);
  const selectedSceneChoice = useRef<SceneChoice | null>(null);
  const isClosingRef = useRef<boolean>(false);
  const {
    isPlaying: isBgmPlaying,
    toggle: toggleBgm,
    errorMessage: bgmErrorMessage,
    clearError: clearBgmError,
  } = useBgmPlayer();

  useEffect(() => {
    setTimeout(() => {
      initializeScene();
      setTimeout(() => {
        setJingleOpen(false);
      }, 1000);
    }, 1000);
  }, []);

  const initializeScene = async () => {
    // 初期値の SceneViewModel を取得します。
    const _ = await service.fetchInitialViewModel();
    setViewModel(_);
  };

  const onPressSceneChoice = async (choice: SceneChoice) => {
    if (!viewModel) {
      console.error("viewModel is null");
      return;
    }
    selectedSceneChoice.current = choice;

    const { responseText } = choice;
    if (responseText.trim().length === 0) {
      await onCloseDialog("scene");
      return;
    }
    setDialogType("scene");
    setDialogMessage(responseText);
    setOpenDialog(true);
  };

  const onCloseDialog = async (explicitType?: "scene" | "item") => {
    const type = explicitType ?? dialogType;
    if (isClosingRef.current) return;
    isClosingRef.current = true;

    try {
      if (type === "item") {
        setOpenDialog(false);
        setDialogType(null);
        isClosingRef.current = false;
        return;
      }

      if (type !== "scene") {
        setOpenDialog(false);
        setDialogType(null);
        selectedSceneChoice.current = null;
        isClosingRef.current = false;
        return;
      }

      if (!viewModel || !selectedSceneChoice.current) {
        console.error("viewModel is null");
        setOpenDialog(false);
        setDialogType(null);
        isClosingRef.current = false;
        return;
      }

      setJingleOpen(true);

      const _ = await service.selectSceneChoice({
        viewModel,
        selectedSceneChoiceId: selectedSceneChoice.current.id,
      });
      setViewModel(_);

      setTimeout(() => {
        setJingleOpen(false);
        selectedSceneChoice.current = null;
        setOpenDialog(false);
        setDialogType(null);
        isClosingRef.current = false;
      }, 1000);
    } catch (error) {
      isClosingRef.current = false;
      throw error;
    }
  };

  const onPressItem = async (item: Item) => {
    if (!viewModel) {
      return;
    }

    const updatedViewModel = await service.useItem({ viewModel, itemId: item.id });
    setViewModel(updatedViewModel);

    const signedDelta =
      item.bananaMeterDelta > 0 ? `+${item.bananaMeterDelta}` : `${item.bananaMeterDelta}`;
    setDialogMessage(
      <Box>
        <Typography component="p">{item.text} を使用した！</Typography>
        <Typography component="p">ばななメーター {signedDelta}</Typography>
      </Box>,
    );
    setDialogType("item");
    setOpenDialog(true);
  };

  const hasSceneChoices = (viewModel?.scene.sceneChoices.length ?? 0) > 0;
  const currentSceneId = viewModel?.scene.id ?? -1;
  const isEndingScene =
    currentSceneId === ENDING_SCENE_IDS.TRUE || currentSceneId === ENDING_SCENE_IDS.BAD;
  const playerItemIdSet = new Set((viewModel?.player.items ?? []).map((item) => item.id));
  const collectedItemCount = allCollectibleItemIds.filter((itemId) =>
    playerItemIdSet.has(itemId),
  ).length;
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
    <Box sx={{ width: "100%", maxWidth: 960, mx: "auto", px: { xs: 0, sm: 1 } }}>
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 8 }}>
          <Paper
            sx={{
              p: 0,
              position: "relative",
              overflow: "hidden",
              borderRadius: "18px",
              mb: 2,
              height: { xs: 520, md: 560 },
            }}
          >
            <Button
              onClick={() => {
                void toggleBgm();
              }}
              variant="contained"
              size="small"
              color={isBgmPlaying ? "success" : "inherit"}
              startIcon={isBgmPlaying ? <VolumeUpRounded /> : <VolumeOffRounded />}
              aria-label={isBgmPlaying ? "BGM を停止" : "BGM を再生"}
              sx={{
                position: "absolute",
                top: "12px",
                right: "12px",
                zIndex: 3,
                color: "common.white",
                ...(isBgmPlaying
                  ? {}
                  : {
                      bgcolor: "grey.700",
                      "&:hover": { bgcolor: "grey.800" },
                    }),
              }}
            >
              {isBgmPlaying ? "BGM ON" : "BGM OFF"}
            </Button>
            <img
              src={viewModel?.scene.image || dummyImage}
              alt="Scene"
              onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = dummyImage;
              }}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                display: "block",
                userSelect: "none",
                pointerEvents: "none",
              }}
              draggable={false}
            />
            <Box
              sx={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                zIndex: 1,
              }}
            />
            <Box
              sx={{
                position: "absolute",
                left: 0,
                right: 0,
                bottom: 0,
                bgcolor: "rgba(0, 0, 0, 0.62)",
                color: "white",
                px: 2,
                py: 2,
                boxSizing: "border-box",
                zIndex: 2,
              }}
            >
              <Typography variant="subtitle1" sx={{ mb: 1.5 }}>
                {viewModel?.scene.text || dummyText}
              </Typography>

              {hasSceneChoices ? (
                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                  選択肢
                </Typography>
              ) : null}

              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: { xs: "1fr", sm: "repeat(2, minmax(0, 1fr))" },
                  gap: 1,
                  width: "100%",
                }}
              >
                {viewModel == null
                  ? null
                  : viewModel.scene.sceneChoices.map((choice) => (
                      <Card
                        key={choice.id}
                        sx={{
                          height: "100%",
                          bgcolor: "primary.main",
                          borderRadius: "14px",
                        }}
                      >
                        <CardActionArea
                          sx={{ height: "100%" }}
                          onClick={() => onPressSceneChoice(choice)}
                        >
                          <CardContent>
                            <Typography variant="body2">{choice.text}</Typography>
                          </CardContent>
                        </CardActionArea>
                      </Card>
                    ))}
              </Box>
            </Box>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
        {isEndingScene ? (
          <Card
            sx={{
              mb: 2,
              color: "white",
              background:
                "linear-gradient(135deg, rgba(26,35,126,0.95) 0%, rgba(46,125,50,0.88) 100%)",
              border: "1px solid rgba(255,255,255,0.25)",
              borderRadius: "14px",
            }}
          >
            <CardContent>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 0.75 }}>
                エンディングアチーブメント
              </Typography>
              <Typography variant="caption" sx={{ display: "block", opacity: 0.88, mb: 1.25 }}>
                取得済み / 未取得をまとめて表示
              </Typography>

              <Box sx={{ display: "grid", gap: 1 }}>
                {achievements.map((achievement) => (
                  <Box
                    key={achievement.id}
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      gap: 1,
                      p: 1,
                      borderRadius: "12px",
                      border: "1px solid",
                      borderColor: achievement.achieved
                        ? "rgba(165,214,167,0.95)"
                        : "rgba(255,255,255,0.3)",
                      bgcolor: achievement.achieved
                        ? "rgba(67,160,71,0.22)"
                        : "rgba(0,0,0,0.22)",
                    }}
                  >
                    <Box sx={{ minWidth: 0 }}>
                      <Typography variant="body2" sx={{ fontWeight: 700 }}>
                        {achievement.label}
                      </Typography>
                      <Typography variant="caption" sx={{ opacity: 0.9 }}>
                        {achievement.note}
                      </Typography>
                    </Box>

                    <Box
                      sx={{
                        px: 1.25,
                        py: 0.35,
                        borderRadius: 999,
                        fontSize: 12,
                        fontWeight: 700,
                        whiteSpace: "nowrap",
                        bgcolor: achievement.achieved ? "#2e7d32" : "#616161",
                      }}
                    >
                      {achievement.achieved ? "取得済み" : "未取得"}
                    </Box>
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        ) : null}

        <Card sx={{ mb: 2, bgcolor: "primary.main", borderRadius: "14px" }}>
          <CardContent
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <img
              src={resolveImageUrl(bananaMeterImagePath)}
              onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = dummyImage;
              }}
              style={{ width: 64, height: 64, marginBottom: 8 }}
            />
            <Typography variant="body2" align="center">
              バナナメーター: {viewModel?.player.bananaMeter || 0}
            </Typography>
          </CardContent>
        </Card>

        <Typography variant="subtitle1" align="center" sx={{ my: 2 }}>
          インベントリ - アイテムを使用できます
        </Typography>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
            gap: 1,
          }}
        >
          {viewModel == null
            ? null
            : viewModel.player.items.map((item) => (
                <Card
                  key={item.id}
                  sx={{
                    opacity: item.used ? 0.5 : 1,
                    pointerEvents: item.used ? "none" : "auto",
                    bgcolor: "primary.main",
                    borderRadius: "14px",
                  }}
                >
                  <CardActionArea
                    onClick={() => onPressItem(item)}
                    disabled={item.used}
                  >
                    <CardContent
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Box
                        component="img"
                        src={item.image}
                        alt={item.text}
                        onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = "/sample-image/sample.png";
                        }}
                        sx={{ width: { xs: 48, sm: 64 }, height: { xs: 48, sm: 64 }, mb: 1 }}
                      />
                      <Typography
                        variant="body2"
                        align="center"
                        sx={{ wordBreak: "break-word" }}
                      >
                        {item.text}（{item.used ? "使用済み" : "未使用"}）
                      </Typography>
                    </CardContent>
                  </CardActionArea>
                </Card>
              ))}
        </Box>
        </Grid>

        <Backdrop
          open={isJingleOpen}
          sx={{ zIndex: (theme) => theme.zIndex.modal + 1 }}
        >
          <Box>
            <img
              src="/jingle-gif/loading-00001.gif"
              alt="jingle"
              style={{ width: 200 }}
            />
          </Box>
        </Backdrop>

        <ResetButton
          onClick={() => {
            setJingleOpen(true);
            initializeScene();
            setTimeout(() => {
              setJingleOpen(false);
            }, 1000);
          }}
        />

        <Dialog
          open={openDialog}
          onClose={(_, reason) => {
            if (reason === "backdropClick" || reason === "escapeKeyDown") {
              void onCloseDialog();
            }
          }}
          slotProps={{
            paper: {
              onClick: () => {
                void onCloseDialog();
              },
              sx: { borderRadius: "14px", cursor: "pointer" },
            },
          }}
        >
          <DialogContent>
            {dialogType === "item" ? (
              dialogMessage
            ) : (
              <Typography component="p">{dialogMessage}</Typography>
            )}
            <Box
              sx={{
                mt: 1.5,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 0.5,
                color: "text.secondary",
                animation: `${tapHintBlink} 1.2s ease-in-out infinite`,
              }}
            >
              <TouchAppOutlined sx={{ fontSize: 18 }} />
              <Typography variant="caption">タップして次へ</Typography>
            </Box>
          </DialogContent>
        </Dialog>
      </Grid>

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
    </Box>
  );
}

export default HomePage;
