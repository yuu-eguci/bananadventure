import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Typography } from "@mui/material";

type Achievement = {
  id: string;
  label: string;
  note: string;
  achieved: boolean;
};

type Props = {
  open: boolean;
  onClose: () => void;
  achievements: Achievement[];
};

function EndingAchievementsDialog({ open, onClose, achievements }: Props) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: "18px" } }}>
      <DialogTitle sx={{ bgcolor: "primary.main", color: "common.black", fontWeight: "bold" }}>
        エンディングアチーブメント
      </DialogTitle>
      <DialogContent
        sx={{
          bgcolor: "primary.main",
          color: "common.black",
          pt: "16px !important",
        }}
      >
        <Typography variant="body2" sx={{ mb: 1.5 }}>
          取得済み / 未取得をまとめて表示
        </Typography>

        <Box sx={{ display: "grid", gap: 1 }}>
          {achievements.map((achievement) => (
            <Box
              key={achievement.id}
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: 1,
                p: 1,
                borderRadius: "12px",
                border: "1px solid",
                borderColor: achievement.achieved ? "rgba(56,142,60,0.95)" : "rgba(0,0,0,0.2)",
                bgcolor: achievement.achieved ? "rgba(76,175,80,0.22)" : "rgba(255,255,255,0.3)",
              }}
            >
              <Box sx={{ minWidth: 0 }}>
                <Typography variant="body2" sx={{ fontWeight: 700 }}>
                  {achievement.label}
                </Typography>
                <Typography variant="caption">{achievement.note}</Typography>
              </Box>

              <Box
                sx={{
                  px: 1.25,
                  py: 0.35,
                  borderRadius: 999,
                  fontSize: 12,
                  fontWeight: 700,
                  whiteSpace: "nowrap",
                  bgcolor: achievement.achieved ? "#2e7d32" : "#616161",
                  color: "common.white",
                }}
              >
                {achievement.achieved ? "取得済み" : "未取得"}
              </Box>
            </Box>
          ))}
        </Box>
      </DialogContent>
      <DialogActions sx={{ bgcolor: "primary.main" }}>
        <Button
          onClick={onClose}
          variant="contained"
          color="inherit"
          sx={{ bgcolor: "grey.800", color: "common.white", "&:hover": { bgcolor: "grey.900" } }}
        >
          閉じる
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default EndingAchievementsDialog;
