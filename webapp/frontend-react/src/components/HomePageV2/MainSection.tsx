import { Box, Paper, Typography } from "@mui/material";

import BgmToggleButton from "@/components/HomePageV2/BgmToggleButton";

type Props = {
  imageSrc: string;
  currentTrackLabel: string;
  isBgmPlaying: boolean;
  onToggleBgm: () => void;
};

function MainSection({ imageSrc, currentTrackLabel, isBgmPlaying, onToggleBgm }: Props) {
  return (
    <Box sx={{ width: "100%" }}>
      <Typography
        variant="caption"
        sx={{
          display: "block",
          textAlign: "right",
          mb: 0.5,
          color: "text.secondary",
        }}
      >
        ♪ {currentTrackLabel}
      </Typography>
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
        <BgmToggleButton isPlaying={isBgmPlaying} onToggle={onToggleBgm} />
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
    </Box>
  );
}

export default MainSection;
