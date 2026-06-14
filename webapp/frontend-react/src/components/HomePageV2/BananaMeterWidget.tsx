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

const bananaMeterImagePath = "/ui-image/banana-meter-icon.webp";

type Props = {
  value: number;
};

function BananaMeterWidget({ value }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Paper
        onClick={() => setOpen(true)}
        elevation={2}
        sx={{
          position: "absolute",
          top: "58px",
          right: "12px",
          zIndex: 3,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          cursor: "pointer",
          bgcolor: "primary.main",
          borderRadius: "12px",
          px: 1.2,
          py: 0.8,
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

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle
          sx={{
            pr: 6,
            bgcolor: "primary.main",
            color: "common.black",
            fontWeight: "bold",
          }}
        >
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
        <DialogContent sx={{ bgcolor: "primary.main", pt: "16px !important" }}>
          <Typography variant="body2" sx={{ color: "common.black" }}>
            バナナメーターだよ。ばななちゃんの体力を意味する。ゼロになると居酒屋TaTeTeへ飲みに行ってしまう（ゲームオーバー）。
          </Typography>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default BananaMeterWidget;
