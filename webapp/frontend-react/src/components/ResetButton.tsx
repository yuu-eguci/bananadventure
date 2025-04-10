import { Button, Box } from "@mui/material";

type Props = {
  onClick: () => void;
};

const ResetButton = ({ onClick }: Props) => {
  return (
    <Box
      sx={{
        position: "fixed",
        bottom: 16,
        right: 16,
        display: "flex",
        gap: 2,
        // 他の UI より前面に。
        zIndex: (theme) => theme.zIndex.tooltip + 1,
      }}
    >
      {/* color は main.tsx の theme から。 */}
      <Button variant="outlined" onClick={onClick} color="info">
        Reset
      </Button>
    </Box>
  );
};

export default ResetButton;
