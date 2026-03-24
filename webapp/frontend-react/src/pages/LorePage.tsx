import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  Typography,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

const loreItems = [
  {
    questionKey: "lore.bgm.question",
    answerKey: "lore.bgm.answer",
  },
];

const LorePage = () => {
  const { t } = useTranslation();

  return (
    <Box sx={{ maxWidth: 960, mx: "auto", py: 4, px: { xs: 2, sm: 3 } }}>
      <Typography variant="h4">{t("lore.title")}</Typography>
      <Typography variant="body2" color="text.secondary">
        {t("lore.subtitle")}
      </Typography>

      <Box sx={{ mt: 3 }}>
        {loreItems.map((item, index) => (
          <Accordion
            key={index}
            disableGutters
            elevation={0}
            sx={{
              borderRadius: "14px !important",
              overflow: "hidden",
              mb: 1.5,
              "&:before": { display: "none" },
            }}
          >
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              sx={{ bgcolor: "primary.main" }}
            >
              <Typography>{t(item.questionKey)}</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography>{t(item.answerKey)}</Typography>
            </AccordionDetails>
          </Accordion>
        ))}
      </Box>

      <Box sx={{ mt: 4, textAlign: "center" }}>
        <Button variant="outlined" color="info" component={Link} to="/">
          {t("lore.backToGame")}
        </Button>
      </Box>
    </Box>
  );
};

export default LorePage;
