import { type ReactNode } from "react";

import { Box } from "@mui/material";

import BananaMeterWidget from "@/components/HomePageV2/BananaMeterWidget";
import BgmToggleButton from "@/components/HomePageV2/BgmToggleButton";

type Props = {
  isBgmPlaying: boolean;
  onToggleBgm: () => void;
  bananaMeterValue: number;
  children?: ReactNode;
};

function HomePageV2RightPanel({ isBgmPlaying, onToggleBgm, bananaMeterValue, children }: Props) {
  return (
    <Box
      sx={{
        position: "absolute",
        top: "12px",
        right: "12px",
        zIndex: 3,
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-end",
        gap: 1,
      }}
    >
      <BgmToggleButton isPlaying={isBgmPlaying} onToggle={onToggleBgm} />
      <BananaMeterWidget value={bananaMeterValue} />
      {children}
    </Box>
  );
}

export default HomePageV2RightPanel;
