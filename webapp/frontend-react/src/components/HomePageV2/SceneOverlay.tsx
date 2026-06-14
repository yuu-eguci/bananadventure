import { forwardRef } from "react";

import { Box, Card, CardActionArea, CardContent, Typography } from "@mui/material";

import { Scene, SceneChoice } from "@/models";

type Props = {
  scene: Scene | null;
  leadResponseText: string | null;
  top: number;
  isLoading: boolean;
  onSelectChoice: (choice: SceneChoice) => void;
};

const SceneOverlay = forwardRef<HTMLDivElement, Props>(function SceneOverlay(
  { scene, leadResponseText, top, isLoading, onSelectChoice }: Props,
  ref,
) {
  const sceneChoices = scene?.sceneChoices ?? [];
  const hasSceneChoices = sceneChoices.length > 0;

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
      {leadResponseText ? (
        <Typography variant="body2" sx={{ mb: 1 }}>
          {leadResponseText}
        </Typography>
      ) : null}

      <Typography variant="subtitle1" sx={{ mb: hasSceneChoices ? 1.5 : 0 }}>
        {scene?.text ?? ""}
      </Typography>

      {hasSceneChoices ? (
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
      ) : null}
    </Box>
  );
});

export default SceneOverlay;
