import {
  Backdrop,
  Box,
  Card,
  CardActionArea,
  CardContent,
  Grid,
  Paper,
  Typography,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
} from "@mui/material";
import { useEffect, useState, useRef } from "react";

import { SceneService } from "@/services/SceneService";
import { SceneViewModel } from "@/viewModels";
import dummyImage from "/sample-image/sample.png";
import { SceneChoice } from "@/models";
import ResetButton from "@/components/ResetButton";
// import bananaIcon from "/icon-image/banana.webp";

const service = new SceneService();

const dummyText =
  "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillu";

function HomePage() {
  const [isJingleOpen, setJingleOpen] = useState(true);
  const [viewModel, setViewModel] = useState<SceneViewModel | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogMessage, setDialogMessage] = useState<React.ReactNode>(<></>);
  const selectedSceneChoice = useRef<SceneChoice | null>(null);

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

    const { responseText, bananaMeterDelta, nextSceneId } = choice;
    setDialogMessage(
      <>
        {responseText} <br />{" "}
        {`<TEST> delta: ${bananaMeterDelta}; next: ${nextSceneId}`}
      </>
    );
    setOpenDialog(true);
  };

  const onCloseDialog = async () => {
    if (!viewModel || !selectedSceneChoice.current) {
      console.error("viewModel is null");
      setOpenDialog(false);
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
    }, 1000);
  };

  const onPressItem = (item: object) => {
    console.log(item);
  };

  const hasSceneChoices = (viewModel?.scene.sceneChoices.length ?? 0) > 0;

  return (
    <Box sx={{ width: "100%", maxWidth: 960, mx: "auto", px: { xs: 0.5, sm: 1 } }}>
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 8 }}>
          <Paper
            sx={{
              p: 0,
              position: "relative",
              overflow: "hidden",
              mb: 2,
              height: { xs: 520, md: 560 },
            }}
          >
            <img
              src={viewModel?.scene.image || dummyImage}
              alt="Scene"
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
              <Typography variant="h6" sx={{ mb: 1.5 }}>
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
        <Card sx={{ mb: 2, bgcolor: "primary.main" }}>
          <CardContent
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <img
              src={dummyImage}
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

        <Dialog open={openDialog} onClose={onCloseDialog}>
          <DialogContent>
            <DialogContentText>{dialogMessage}</DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={onCloseDialog} color="primary">
              OK
            </Button>
          </DialogActions>
        </Dialog>
      </Grid>
    </Box>
  );
}

export default HomePage;
