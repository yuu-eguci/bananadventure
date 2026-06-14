import { useState } from "react";

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

type Props = {
  item: Item;
  onUse: (item: Item) => void;
};

function ItemWidget({ item, onUse }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Paper
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

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: "18px" } }}>
        <DialogTitle sx={{ bgcolor: "primary.main", color: "common.black", fontWeight: "bold" }}>
          {item.text}
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
          {item.description}
        </DialogContent>
        <DialogActions sx={{ bgcolor: "primary.main" }}>
          <Button
            onClick={() => {
              onUse(item);
              setOpen(false);
            }}
            variant="contained"
            color="inherit"
            sx={{ bgcolor: "grey.800", color: "common.white", "&:hover": { bgcolor: "grey.900" } }}
          >
            使う
          </Button>
          <Button onClick={() => setOpen(false)} variant="text" sx={{ color: "common.black" }}>
            キャンセル
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default ItemWidget;
