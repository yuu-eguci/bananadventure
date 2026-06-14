import { VolumeOffRounded } from "@mui/icons-material";
import { Box, Button, Paper } from "@mui/material";

type Props = {
  imageSrc: string;
};

function MainSection({ imageSrc }: Props) {
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
      <Button
        variant="contained"
        size="small"
        color="inherit"
        startIcon={<VolumeOffRounded />}
        aria-label="BGM を再生"
        sx={{
          position: "absolute",
          top: "12px",
          right: "12px",
          zIndex: 3,
          color: "common.white",
          bgcolor: "grey.700",
          "&:hover": { bgcolor: "grey.800" },
        }}
      >
        BGM OFF
      </Button>
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
    </Paper>
  );
}

export default MainSection;
