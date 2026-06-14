import { Box, Card, CardContent, Typography } from "@mui/material";

const previewChoices = [
  "バナナをひろう",
  "ちょっと休む",
  "様子を見る",
  "先へ進む",
];

function SceneOverlayPreview() {
  return (
    <Box
      sx={{
        position: "absolute",
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 2,
        bgcolor: "rgba(0, 0, 0, 0.62)",
        color: "white",
        px: 2,
        py: 2,
        boxSizing: "border-box",
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
        }}
      >
        {previewChoices.map((choice) => (
          <Card
            key={choice}
            sx={{
              minHeight: { xs: 72, sm: 84 },
              bgcolor: "primary.main",
              borderRadius: "14px",
            }}
          >
            <CardContent
              sx={{
                height: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                py: 1.5,
              }}
            >
              <Typography variant="body2" sx={{ textAlign: "center" }}>
                {choice}
              </Typography>
            </CardContent>
          </Card>
        ))}
      </Box>
    </Box>
  );
}

export default SceneOverlayPreview;
