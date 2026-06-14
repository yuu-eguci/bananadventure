import { type ReactNode, type Ref } from "react";

import { Box, Paper } from "@mui/material";

export const MAIN_SECTION_MAX_WIDTH = 600;

export const MAIN_SECTION_HEIGHT = {
  xs: 520,
} as const;

type Props = {
  imageSrc: string;
  children?: ReactNode;
  overlayExtensionHeight?: number;
  imageAreaRef?: Ref<HTMLDivElement>;
};

function MainSection({ imageSrc, children, overlayExtensionHeight = 0, imageAreaRef }: Props) {
  return (
    <Paper
      sx={{
        p: 0,
        position: "relative",
        overflow: "hidden",
        borderRadius: "18px",
        mb: 2,
      }}
    >
      <Box
        ref={imageAreaRef}
        sx={{
          position: "relative",
          width: "100%",
          height: { xs: MAIN_SECTION_HEIGHT.xs, sm: "auto" },
          aspectRatio: { xs: "auto", sm: "1 / 1" },
        }}
      >
        <Box
          component="img"
          src={imageSrc}
          alt="Main"
          sx={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            display: "block",
            userSelect: "none",
            pointerEvents: "none",
          }}
          draggable={false}
        />
      </Box>
      {overlayExtensionHeight > 0 ? (
        <Box
          sx={{
            height: overlayExtensionHeight,
            bgcolor: "rgba(0, 0, 0, 0.62)",
          }}
        />
      ) : null}
      {children ? (
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            zIndex: 2,
          }}
        >
          {children}
        </Box>
      ) : null}
    </Paper>
  );
}

export default MainSection;
