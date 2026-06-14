import { Alert, Box, Snackbar } from "@mui/material";

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
        <MainSection
          imageSrc="/sample-image/sample.png"
          currentTrackLabel={currentTrackLabel}
          isBgmPlaying={isBgmPlaying}
          onToggleBgm={toggleBgm}
        />
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
