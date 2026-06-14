import { useEffect, useRef, useState } from "react";

import {
  Box,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Paper,
  Typography,
} from "@mui/material";
import { keyframes } from "@mui/system";

import { resolveImageUrl } from "@/services/assetImageResolver";

const bananaMeterImagePath = "/ui-image/banana-meter-icon.webp";

// バナナメーターが増減したときに目立たせるための明滅（輝度 + グロー）。
const bananaMeterFlash = keyframes`
  0%, 50%, 100% {
    filter: brightness(1);
    box-shadow: 0 0 0 rgba(255, 255, 255, 0);
  }
  25%, 75% {
    filter: brightness(1.7);
    box-shadow: 0 0 12px 4px rgba(255, 255, 255, 0.9);
  }
`;

type Props = {
  value: number;
  isLoading: boolean;
};

function BananaMeterWidget({ value, isLoading }: Props) {
  const [open, setOpen] = useState(false);

  // 値が変わるたびにカウントを増やし、key を付け替えて明滅アニメーションを再生し直す。
  const [flashCount, setFlashCount] = useState(0);
  // null の間はベースライン未確定。最初に画面に見えた値を基準にする。
  const previousValueRef = useRef<number | null>(null);

  useEffect(() => {
    // ローディング中は値が JingleBackdrop の裏で変わるため、明滅は再生しない。
    if (isLoading) {
      return;
    }
    // 初回（ゲーム開始時）はベースラインを取るだけで明滅させない。
    if (previousValueRef.current === null) {
      previousValueRef.current = value;
      return;
    }
    // 画面に見えている状態で値が変わったときだけ明滅させる。
    if (previousValueRef.current !== value) {
      previousValueRef.current = value;
      setFlashCount((count) => count + 1);
    }
  }, [value, isLoading]);

  return (
    <>
      <Paper
        key={flashCount}
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
          // flashCount === 0（初回マウント）では明滅させない。
          animation: flashCount > 0 ? `${bananaMeterFlash} 0.9s ease` : "none",
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

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: "18px" } }}>
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
