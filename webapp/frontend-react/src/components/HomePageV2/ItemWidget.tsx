import { useEffect, useRef, useState } from "react";

import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Paper,
} from "@mui/material";

import { Item } from "@/models";
import { WIDGET_FLASH_DURATION, widgetFlashKeyframes } from "@/components/HomePageV2/widgetFlash";

type Props = {
  item: Item;
  // ローディング中（JingleBackdrop で隠れている間）は明滅を再生しないために渡す。
  isLoading: boolean;
  onUse: (item: Item) => Promise<void>;
};

function ItemWidget({ item, isLoading, onUse }: Props) {
  const [open, setOpen] = useState(false);
  const [isUsing, setIsUsing] = useState(false);
  const [isResultVisible, setIsResultVisible] = useState(false);

  // アイテムが追加されて初めて画面に見えたとき、一度だけ明滅させる。
  const [flashCount, setFlashCount] = useState(0);
  const hasFlashedRef = useRef(false);

  useEffect(() => {
    // ローディング中はまだ見えていないので、見えるようになってから明滅する。
    if (isLoading) {
      return;
    }
    if (hasFlashedRef.current) {
      return;
    }
    hasFlashedRef.current = true;
    setFlashCount(1);
  }, [isLoading]);

  useEffect(() => {
    if (!open) {
      setIsUsing(false);
      setIsResultVisible(false);
    }
  }, [open]);

  const signedDeltaText =
    item.bananaMeterDelta > 0 ? `+${item.bananaMeterDelta}` : `${item.bananaMeterDelta}`;

  return (
    <>
      <Paper
        key={flashCount}
        onClick={() => {
          if (!item.used) setOpen(true);
        }}
        elevation={item.used ? 0 : 2}
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          cursor: item.used ? "default" : "pointer",
          bgcolor: "primary.main",
          borderRadius: "12px",
          px: 1.2,
          py: 0.8,
          opacity: item.used ? 0.4 : 1,
          // flashCount === 0（初回マウント直後）では明滅させない。
          animation: flashCount > 0 ? `${widgetFlashKeyframes} ${WIDGET_FLASH_DURATION} ease` : "none",
          "&:hover": item.used ? {} : { filter: "brightness(0.9)" },
        }}
      >
        <Box
          component="img"
          src={item.image}
          alt={item.text}
          onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = "/sample-image/sample.png";
          }}
          sx={{ width: 36, height: 36 }}
        />
      </Paper>

      <Dialog
        open={open}
        onClose={() => {
          if (!isUsing) {
            setOpen(false);
          }
        }}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: "18px" } }}
      >
        <DialogTitle sx={{ bgcolor: "primary.main", color: "common.black", fontWeight: "bold" }}>
          {isResultVisible ? "アイテム使用結果" : item.text}
        </DialogTitle>
        <DialogContent
          sx={{
            bgcolor: "primary.main",
            pt: "16px !important",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 2,
          }}
        >
          <Box
            component="img"
            src={item.image}
            alt={item.text}
            onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = "/sample-image/sample.png";
            }}
            sx={{ width: 80, height: 80, objectFit: "contain" }}
          />
          {isResultVisible ? (
            <Box sx={{ textAlign: "center", color: "common.black" }}>
              <Box>{item.text} を使用した！</Box>
              <Box sx={{ mt: 1 }}>ばななメーター {signedDeltaText}</Box>
            </Box>
          ) : (
            <Box sx={{ color: "common.black", textAlign: "center" }}>
              {item.description || "このアイテムを使う？"}
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ bgcolor: "primary.main" }}>
          {isResultVisible ? (
            <Button
              onClick={() => setOpen(false)}
              variant="contained"
              color="inherit"
              sx={{ bgcolor: "grey.800", color: "common.white", "&:hover": { bgcolor: "grey.900" } }}
            >
              閉じる
            </Button>
          ) : (
            <>
              <Button
                onClick={async () => {
                  setIsUsing(true);
                  try {
                    await onUse(item);
                    setIsResultVisible(true);
                  } finally {
                    setIsUsing(false);
                  }
                }}
                disabled={isUsing}
                variant="contained"
                color="inherit"
                sx={{ bgcolor: "grey.800", color: "common.white", "&:hover": { bgcolor: "grey.900" } }}
              >
                使う
              </Button>
              <Button
                onClick={() => setOpen(false)}
                disabled={isUsing}
                variant="text"
                sx={{ color: "common.black" }}
              >
                キャンセル
              </Button>
            </>
          )}
        </DialogActions>
      </Dialog>
    </>
  );
}

export default ItemWidget;
