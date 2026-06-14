import { type ReactNode } from "react";

import { Box } from "@mui/material";

import BananaMeterWidget from "@/components/HomePageV2/BananaMeterWidget";
import BgmToggleButton from "@/components/HomePageV2/BgmToggleButton";

type Props = {
  isBgmPlaying: boolean;
  onToggleBgm: () => void;
  bananaMeterValue: number;
  // ローディング中（JingleBackdrop で隠れている間）は明滅を再生しないために渡す。
  isLoading: boolean;
  children?: ReactNode;
};

function HomePageV2RightPanel({ isBgmPlaying, onToggleBgm, bananaMeterValue, isLoading, children }: Props) {
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
      <BananaMeterWidget value={bananaMeterValue} isLoading={isLoading} />
      {children}
    </Box>
  );
}

export default HomePageV2RightPanel;
