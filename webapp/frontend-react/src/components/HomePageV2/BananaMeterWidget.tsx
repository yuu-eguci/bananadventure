import { useState } from "react";

import {
  Box,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Paper,
  Typography,
} from "@mui/material";
import { resolveImageUrl } from "@/services/assetImageResolver";
import { WIDGET_FLASH_DURATION, widgetFlashKeyframes } from "@/components/HomePageV2/widgetFlash";
import {
  DIALOG_PAPER_PROPS,
  dialogSurfaceSx,
  dialogTitleSx,
} from "@/components/HomePageV2/dialogStyles";

const bananaMeterImagePath = "/ui-image/banana-meter-icon.webp";

type Props = {
  value: number;
  // 親が増やすたびに明滅を 1 回再生する。明滅のタイミングは親（メッセージ描画）が制御する。
  flashSignal: number;
};

function BananaMeterWidget({ value, flashSignal }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Paper
        // flashSignal が変わるたびに key が変わって再マウントし、明滅アニメーションを頭から再生する。
        key={flashSignal}
        onClick={() => setOpen(true)}
        elevation={2}
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          cursor: "pointer",
          bgcolor: "primary.main",
          borderRadius: "12px",
          px: 1.2,
          py: 0.8,
          // flashSignal === 0（初回）では明滅させない。
          animation: flashSignal > 0 ? `${widgetFlashKeyframes} ${WIDGET_FLASH_DURATION} ease` : "none",
          "&:hover": { filter: "brightness(0.9)" },
        }}
      >
        <Box
          component="img"
          src={resolveImageUrl(bananaMeterImagePath)}
          alt="バナナメーター"
          sx={{ width: 36, height: 36 }}
        />
        <Typography
          variant="caption"
          sx={{ color: "common.black", fontWeight: "bold", lineHeight: 1.4, mt: 0.3 }}
        >
          {value}
        </Typography>
      </Paper>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="xs" fullWidth PaperProps={DIALOG_PAPER_PROPS}>
        <DialogTitle sx={[dialogTitleSx, { pr: 6 }]}>
          バナナメーター
          <IconButton
            onClick={() => setOpen(false)}
            size="small"
            sx={{ position: "absolute", top: 8, right: 8, color: "common.black" }}
            aria-label="閉じる"
          >
            ✕
          </IconButton>
        </DialogTitle>
        <DialogContent sx={[dialogSurfaceSx, { pt: "16px !important" }]}>
          <Typography variant="body2" sx={{ color: "common.black" }}>
            バナナメーターだよ。ばななちゃんの体力を意味する。ゼロになると居酒屋TaTeTeへ飲みに行ってしまう（ゲームオーバー）。
          </Typography>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default BananaMeterWidget;
