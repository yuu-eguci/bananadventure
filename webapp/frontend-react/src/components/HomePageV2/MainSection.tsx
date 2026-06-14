import { type ReactNode } from "react";

import { Box, Paper } from "@mui/material";

type Props = {
  imageSrc: string;
  children?: ReactNode;
};

function MainSection({ imageSrc, children }: Props) {
  return (
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
