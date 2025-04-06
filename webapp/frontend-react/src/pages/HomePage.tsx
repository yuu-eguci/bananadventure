import {
  Box,
  Card,
  CardActionArea,
  CardContent,
  Grid,
  Paper,
  Typography,
  Backdrop,
} from "@mui/material";
import { useEffect, useState } from "react";

// ダミー
const currentSceneViewModel = {
  scene: {
    id: 1,
    triggerItems: [],
    image: "/main-image/banana-00183a.webp",
    text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillu",
    sceneChoices: [
      {
        id: 1,
        order: 0,
        text: "Duis 1 aute irure dolor in reprehenderit in voluptate velit esse cillu",
        responseText:
          "Duis 1 aute irure dolor in reprehenderit in voluptate velit esse cillu",
        bananaMeterDelta: 1,
        nextScene: 2,
        itemsOnSelect: null,
      },
      {
        id: 2,
        order: 1,
        text: "Duis 2 aute irure dolor in reprehenderit in voluptate velit esse cillu",
        responseText:
          "Duis 2 aute irure dolor in reprehenderit in voluptate velit esse cillu",
        bananaMeterDelta: 2,
        nextScene: 2,
        itemsOnSelect: null,
      },
      {
        id: 3,
        order: 2,
        text: "Duis 3 aute irure dolor in reprehenderit in voluptate velit esse cillu",
        responseText:
          "Duis 3 aute irure dolor in reprehenderit in voluptate velit esse cillu",
        bananaMeterDelta: 3,
        nextScene: 2,
        itemsOnSelect: null,
      },
      {
        id: 4,
        order: 3,
        text: "Duis 4 aute irure dolor in reprehenderit in voluptate velit esse cillu",
        responseText:
          "Duis 4 aute irure dolor in reprehenderit in voluptate velit esse cillu",
        bananaMeterDelta: 4,
        nextScene: 2,
        itemsOnSelect: null,
      },
    ],
  },
  player: {
    bananaMeter: 100,
    items: [
      {
        id: 1,
        text: "豆乳バナナ",
        description:
          "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt",
        responseText:
          "ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris",
        bananaMeterDelta: 10,
        image: "/icon-image/drink.webp",
        used: false,
      },
      {
        id: 2,
        text: "釘バット",
        description:
          "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt",
        responseText:
          "ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris",
        bananaMeterDelta: -10,
        image: "/icon-image/spiked-bat.webp",
        used: true,
      },
    ],
  },
};

function HomePage() {
  const [isJingleOpen, setJingleOpen] = useState(false);

  useEffect(() => {}, []);

  const onPressSceneChoice = (choice: object) => {
    console.log(choice);
    setJingleOpen(true);
    setTimeout(() => {
      setJingleOpen(false);
    }, 2000);
  };

  const onPressItem = (item: object) => {
    console.log(item);
  };

  return (
    <Grid container spacing={2}>
      <Grid size={{ xs: 12, md: 7 }}>
        <Paper sx={{ p: 0, position: "relative", overflow: "hidden", mb: 2 }}>
          <img
            src={currentSceneViewModel.scene.image}
            alt="Scene"
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = "/sample-image/sample.png";
            }}
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
              {currentSceneViewModel.scene.text}
            </Typography>
          </Box>
        </Paper>
      </Grid>

      <Grid size={{ xs: 12, md: 5 }}>
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
              src="/icon-image/banana.webp"
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = "/sample-image/sample.png";
              }}
              style={{ width: 64, height: 64, marginBottom: 8 }}
            />
            <Typography variant="body2" align="center">
              バナナメーター: {currentSceneViewModel.player.bananaMeter}
            </Typography>
          </CardContent>
        </Card>

        <Typography variant="subtitle1" align="center" sx={{ my: 2 }}>
          選択肢 - ストーリーが進みます
        </Typography>

        {currentSceneViewModel.scene.sceneChoices.map((choice) => (
          <Card key={choice.id} sx={{ mb: 2, bgcolor: "primary.main" }}>
            <CardActionArea onClick={() => onPressSceneChoice(choice)}>
              <CardContent>
                <Typography variant="body2">{choice.text}</Typography>
              </CardContent>
            </CardActionArea>
          </Card>
        ))}

        <Typography variant="subtitle1" align="center" sx={{ my: 2 }}>
          インベントリ - アイテムを使用できます
        </Typography>

        {currentSceneViewModel.player.items.map((item) => (
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
    </Grid>
  );
}

export default HomePage;
