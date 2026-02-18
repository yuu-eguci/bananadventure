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

  return (
    <Grid container spacing={2}>
      <Grid size={{ xs: 12, md: 8 }}>
        <Paper sx={{ p: 0, position: "relative", overflow: "hidden", mb: 2 }}>
          <img
            src={viewModel?.scene.image || dummyImage}
            alt="Scene"
            style={{
              width: "100%",
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
              bottom: 0,
              width: "100%",
              bgcolor: "rgba(0, 0, 0, 0.5)",
              color: "white",
              px: 0,
              py: 3,
              zIndex: 2,
            }}
          >
            <Typography variant="h6">
              {viewModel?.scene.text || dummyText}
            </Typography>
          </Box>
        </Paper>

        <Typography variant="subtitle1" align="center" sx={{ mt: 3, mb: 2 }}>
          選択肢 - ストーリーが進みます
        </Typography>

        <Grid container spacing={2}>
          {viewModel == null
            ? null
            : viewModel.scene.sceneChoices.map((choice) => (
                <Grid key={choice.id} size={{ xs: 12, sm: 6 }}>
                  <Card sx={{ height: "100%", bgcolor: "primary.main" }}>
                    <CardActionArea
                      sx={{ height: "100%" }}
                      onClick={() => onPressSceneChoice(choice)}
                    >
                      <CardContent>
                        <Typography variant="body2">{choice.text}</Typography>
                      </CardContent>
                    </CardActionArea>
                  </Card>
                </Grid>
              ))}
        </Grid>
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

        {viewModel == null
          ? null
          : viewModel.player.items.map((item) => (
              <Card
                key={item.id}
                sx={{
                  mb: 2,
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
                    <img
                      src={item.image}
                      alt={item.text}
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = "/sample-image/sample.png";
                      }}
                      style={{ width: 64, height: 64, marginBottom: 8 }}
                    />
                    <Typography variant="body2" align="center">
                      {item.text}（{item.used ? "使用済み" : "未使用"}）
                    </Typography>
                  </CardContent>
                </CardActionArea>
              </Card>
            ))}
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
  );
}

export default HomePage;
