import { type ReactNode } from "react";

import { Box, Paper } from "@mui/material";

export const MAIN_SECTION_HEIGHT = {
  xs: 520,
  md: 560,
} as const;

type Props = {
  imageSrc: string;
  children?: ReactNode;
  overlayExtensionHeight?: number;
};

function MainSection({ imageSrc, children, overlayExtensionHeight = 0 }: Props) {
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
        sx={{
          position: "relative",
          height: MAIN_SECTION_HEIGHT,
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
