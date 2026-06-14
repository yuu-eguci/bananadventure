import { VolumeOffRounded, VolumeUpRounded } from "@mui/icons-material";
import { Button } from "@mui/material";

type Props = {
  isPlaying: boolean;
  onToggle: () => void;
};

function BgmToggleButton({ isPlaying, onToggle }: Props) {
  return (
    <Button
      onClick={() => {
        void onToggle();
      }}
      variant="contained"
      size="small"
      color={isPlaying ? "success" : "inherit"}
      startIcon={isPlaying ? <VolumeUpRounded /> : <VolumeOffRounded />}
      aria-label={isPlaying ? "BGM を停止" : "BGM を再生"}
      sx={{
        position: "absolute",
        top: "12px",
        right: "12px",
        zIndex: 3,
        color: "common.white",
        ...(isPlaying
          ? {}
          : {
              bgcolor: "grey.700",
              "&:hover": { bgcolor: "grey.800" },
            }),
      }}
    >
      {isPlaying ? "BGM ON" : "BGM OFF"}
    </Button>
  );
}

export default BgmToggleButton;
