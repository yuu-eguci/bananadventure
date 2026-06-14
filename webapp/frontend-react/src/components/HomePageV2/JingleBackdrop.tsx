import { Backdrop, Box } from "@mui/material";

type Props = {
  open: boolean;
};

function JingleBackdrop({ open }: Props) {
  return (
    <Backdrop
      open={open}
      sx={{
        zIndex: (theme) => theme.zIndex.modal + 1,
        backgroundColor: "rgba(0, 0, 0, 0.15)",
      }}
    >
      <Box>
        <Box component="img" src="/jingle-gif/loading-00001.gif" alt="jingle" sx={{ width: 200 }} />
      </Box>
    </Backdrop>
  );
}

export default JingleBackdrop;
