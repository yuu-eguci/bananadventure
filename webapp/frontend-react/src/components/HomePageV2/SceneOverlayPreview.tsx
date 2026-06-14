import { forwardRef } from "react";

import { Box, Card, CardActionArea, CardContent, Typography } from "@mui/material";

const previewChoices = [
  "バナナをひろう",
  "ちょっと休む",
  "様子を見る",
  "先へ進む",
];

type Props = {
  top: number;
};

const SceneOverlayPreview = forwardRef<HTMLDivElement, Props>(function SceneOverlayPreview(
  { top }: Props,
  ref,
) {
  return (
    <Box
      ref={ref}
      sx={{
        position: "absolute",
        left: 0,
        right: 0,
        top,
        bottom: 0,
        zIndex: 2,
        bgcolor: "rgba(0, 0, 0, 0.62)",
        color: "white",
        px: 2,
        py: 2,
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Typography variant="subtitle1" sx={{ mb: 1.5 }}>
        ここにメッセージが入る想定
      </Typography>

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
        {previewChoices.map((choice) => (
          <Card
            key={choice}
            sx={{
              height: "100%",
              bgcolor: "primary.main",
              borderRadius: "14px",
            }}
          >
            <CardActionArea sx={{ height: "100%" }}>
              <CardContent sx={{ p: 2 }}>
                <Typography variant="body2">{choice}</Typography>
              </CardContent>
            </CardActionArea>
          </Card>
        ))}
      </Box>
    </Box>
  );
});

export default SceneOverlayPreview;
