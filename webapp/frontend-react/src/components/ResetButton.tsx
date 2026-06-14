import { Button, Box } from "@mui/material";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

type Props = {
  onClick: () => void;
  page?: "v1" | "v2";
};

const ResetButton = ({ onClick, page = "v1" }: Props) => {
  const { t } = useTranslation();

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
      <Button variant="outlined" component={Link} to="/lore" color="info">
        {t("lore.title")}
      </Button>
      {page !== "v2" ? (
        <Button variant="outlined" component={Link} to="/v2" color="info">
          V2
        </Button>
      ) : null}
      {/* color は main.tsx の theme から。 */}
      <Button variant="outlined" onClick={onClick} color="info">
        Reset
      </Button>
    </Box>
  );
};

export default ResetButton;
