import { Alert, Box, Snackbar, Typography } from "@mui/material";

import BgmToggleButton from "@/components/HomePageV2/BgmToggleButton";
import MainSection from "@/components/HomePageV2/MainSection";
import { useBgmPlayer } from "@/hooks/useBgmPlayer";

function HomePageV2() {
  const {
    isPlaying: isBgmPlaying,
    toggle: toggleBgm,
    errorMessage: bgmErrorMessage,
    clearError: clearBgmError,
    currentTrackLabel,
  } = useBgmPlayer("main");

  return (
    <>
      <Box
        sx={{
          width: "100%",
          maxWidth: 960,
          mx: "auto",
          px: { xs: 0, sm: 1 },
        }}
      >
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
        <MainSection imageSrc="/sample-image/sample.png">
          <BgmToggleButton isPlaying={isBgmPlaying} onToggle={toggleBgm} />
        </MainSection>
      </Box>

      <Snackbar
        open={bgmErrorMessage !== null}
        autoHideDuration={4000}
        onClose={(_, reason) => {
          if (reason === "clickaway") {
            return;
          }
          clearBgmError();
        }}
      >
        <Alert onClose={clearBgmError} severity="warning" sx={{ width: "100%" }}>
          {bgmErrorMessage ?? ""}
        </Alert>
      </Snackbar>
    </>
  );
}

export default HomePageV2;
