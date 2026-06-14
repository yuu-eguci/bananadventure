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
import {
  DIALOG_PAPER_PROPS,
  darkActionButtonSx,
  dialogSurfaceSx,
  dialogTitleSx,
} from "@/components/HomePageV2/dialogStyles";
import { handleImageError } from "@/components/HomePageV2/imageFallback";

type Props = {
  item: Item;
  // ローディング中（JingleBackdrop で隠れている間）は明滅を再生しないために渡す。
  isLoading: boolean;
  // アイテム使用処理。成功したら true を返す。false（失敗や多重押下で弾かれた等）なら結果画面は出さない。
  onUse: (item: Item) => Promise<boolean>;
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
          onError={handleImageError}
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
        PaperProps={DIALOG_PAPER_PROPS}
      >
        <DialogTitle sx={dialogTitleSx}>
          {isResultVisible ? "アイテム使用結果" : item.text}
        </DialogTitle>
        <DialogContent
          sx={[
            dialogSurfaceSx,
            {
              pt: "16px !important",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 2,
            },
          ]}
        >
          <Box
            component="img"
            src={item.image}
            alt={item.text}
            onError={handleImageError}
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
        <DialogActions sx={dialogSurfaceSx}>
          {isResultVisible ? (
            <Button
              onClick={() => setOpen(false)}
              variant="contained"
              color="inherit"
              sx={darkActionButtonSx}
            >
              閉じる
            </Button>
          ) : (
            <>
              <Button
                onClick={async () => {
                  setIsUsing(true);
                  try {
                    // 成功したときだけ結果画面へ進む。失敗時は裏で error Snackbar が出る。
                    const succeeded = await onUse(item);
                    if (succeeded) {
                      setIsResultVisible(true);
                    }
                  } finally {
                    setIsUsing(false);
                  }
                }}
                disabled={isUsing}
                variant="contained"
                color="inherit"
                sx={darkActionButtonSx}
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
