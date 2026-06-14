import { useEffect, useState } from "react";

import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

import {
  MESSAGE_SPEED_ORDER,
  MESSAGE_SPEEDS,
  MessageSpeedKey,
} from "@/hooks/useMessageSpeed";
import {
  DIALOG_PAPER_PROPS,
  darkActionButtonSx,
  dialogSurfaceSx,
  dialogTitleSx,
} from "@/components/HomePageV2/dialogStyles";

type Props = {
  open: boolean;
  onClose: () => void;
  messageSpeed: MessageSpeedKey;
  onChangeMessageSpeed: (next: MessageSpeedKey) => void;
  onReset: () => void;
};

function SystemDialog({ open, onClose, messageSpeed, onChangeMessageSpeed, onReset }: Props) {
  // メッセージスピードを保存したときの「保存したよ」表示制御。
  const [isSaved, setIsSaved] = useState(false);

  // モーダルを開き直すたびに保存メッセージはリセットする。
  useEffect(() => {
    if (!open) {
      setIsSaved(false);
    }
  }, [open]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth PaperProps={DIALOG_PAPER_PROPS}>
      <DialogTitle sx={dialogTitleSx}>システム</DialogTitle>
      <DialogContent
        sx={[
          dialogSurfaceSx,
          {
            color: "common.black",
            pt: "16px !important",
          },
        ]}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, mb: 1 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
            メッセージスピード
          </Typography>
          {isSaved ? (
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.25, fontWeight: 700 }}>
              <CheckCircleIcon sx={{ fontSize: 16 }} />
              <Typography variant="caption" sx={{ fontWeight: 700 }}>
                保存したよ
              </Typography>
            </Box>
          ) : null}
        </Box>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
            gap: 1,
          }}
        >
          {MESSAGE_SPEED_ORDER.map((speedKey) => {
            const isSelected = speedKey === messageSpeed;
            return (
              <Button
                key={speedKey}
                onClick={() => {
                  onChangeMessageSpeed(speedKey);
                  setIsSaved(true);
                }}
                variant={isSelected ? "contained" : "outlined"}
                sx={{
                  borderRadius: "12px",
                  fontWeight: 700,
                  color: "common.black",
                  borderColor: "rgba(0,0,0,0.4)",
                  bgcolor: isSelected ? "rgba(255,255,255,0.55)" : "transparent",
                  "&:hover": {
                    borderColor: "rgba(0,0,0,0.6)",
                    bgcolor: isSelected ? "rgba(255,255,255,0.65)" : "rgba(255,255,255,0.25)",
                  },
                }}
              >
                {MESSAGE_SPEEDS[speedKey].label}
              </Button>
            );
          })}
        </Box>

        <Typography variant="subtitle2" sx={{ fontWeight: 700, mt: 2.5, mb: 1 }}>
          ゲームリセット
        </Typography>
        <Button
          onClick={() => {
            onReset();
            onClose();
          }}
          variant="contained"
          color="inherit"
          fullWidth
          sx={darkActionButtonSx}
        >
          リセット
        </Button>
      </DialogContent>
      <DialogActions sx={dialogSurfaceSx}>
        <Button onClick={onClose} variant="contained" color="inherit" sx={darkActionButtonSx}>
          閉じる
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default SystemDialog;
