import yokokoImage from "@/assets/character-image/001-yokoko.webp";
import {
  Alert,
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  Link as MuiLink,
  Paper,
  Snackbar,
  Stack,
  Typography,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import YouTubeIcon from "@mui/icons-material/YouTube";
import VolumeOffRounded from "@mui/icons-material/VolumeOffRounded";
import VolumeUpRounded from "@mui/icons-material/VolumeUpRounded";
import { Link as RouterLink } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useState } from "react";

import {
  useLoreVoicePlayer,
  type LoreItemId,
  type LoreVoiceSequence,
} from "@/hooks/useLoreVoicePlayer";

interface LoreItemLink {
  href: string;
  labelKey: string;
}

interface LoreItem {
  id: LoreItemId;
  questionKey: string;
  answerKey: string;
  voice: {
    questionSrc: string;
    answerSrc: string;
  };
  link?: LoreItemLink;
}

const loreItems: LoreItem[] = [
  {
    id: "q1",
    questionKey: "lore.q1.question",
    answerKey: "lore.q1.answer",
    voice: {
      questionSrc: "/voice/001_Q1.mp3",
      answerSrc: "/voice/002_A1.mp3",
    },
  },
  {
    id: "q2",
    questionKey: "lore.q2.question",
    answerKey: "lore.q2.answer",
    voice: {
      questionSrc: "/voice/003_Q2.mp3",
      answerSrc: "/voice/004_A2.mp3",
    },
  },
  {
    id: "q3",
    questionKey: "lore.q3.question",
    answerKey: "lore.q3.answer",
    voice: {
      questionSrc: "/voice/005_Q3.mp3",
      answerSrc: "/voice/006_A3.mp3",
    },
    link: {
      href: "https://www.youtube.com/@うみにょ·uminyo",
      labelKey: "lore.q3.youtubeLinkLabel",
    },
  },
  {
    id: "q4",
    questionKey: "lore.q4.question",
    answerKey: "lore.q4.answer",
    voice: {
      questionSrc: "/voice/007_Q4.mp3",
      answerSrc: "/voice/008_A4.mp3",
    },
  },
  {
    id: "q5",
    questionKey: "lore.q5.question",
    answerKey: "lore.q5.answer",
    voice: {
      questionSrc: "/voice/009_Q5.mp3",
      answerSrc: "/voice/010_A5.mp3",
    },
  },
];

const LorePage = () => {
  const { t } = useTranslation();
  const [expandedItemId, setExpandedItemId] = useState<LoreItemId | false>(false);
  const {
    isVoiceEnabled,
    setVoiceEnabled,
    playingItemId,
    playSequence,
    stop,
    errorMessage,
    clearError,
  } = useLoreVoicePlayer();

  const toggleVoice = () => {
    if (isVoiceEnabled) {
      setVoiceEnabled(false);
      stop();
      return;
    }

    setVoiceEnabled(true);
  };

  const onToggleAccordion = (item: LoreItem) => (_: React.SyntheticEvent, isExpanded: boolean) => {
    if (!isExpanded) {
      setExpandedItemId(false);
      stop();
      return;
    }

    stop();
    setExpandedItemId(item.id);

    if (!isVoiceEnabled) {
      return;
    }

    const sequence: LoreVoiceSequence = {
      itemId: item.id,
      questionSrc: item.voice.questionSrc,
      answerSrc: item.voice.answerSrc,
    };

    void playSequence(sequence);
  };

  return (
    <Box sx={{ maxWidth: 960, mx: "auto", py: 4, px: { xs: 2, sm: 3 } }}>
      <Stack
        direction={{ xs: "column", sm: "row" }}
        justifyContent="space-between"
        alignItems={{ xs: "stretch", sm: "flex-start" }}
        gap={2}
      >
        <Box>
          <Typography variant="h4">{t("lore.title")}</Typography>
          <Typography variant="body2" color="text.secondary">
            {t("lore.subtitle")}
          </Typography>
        </Box>

        <Button
          onClick={toggleVoice}
          variant="contained"
          size="small"
          color={isVoiceEnabled ? "success" : "inherit"}
          startIcon={isVoiceEnabled ? <VolumeUpRounded /> : <VolumeOffRounded />}
          aria-label={isVoiceEnabled ? t("lore.voiceToggle.ariaOn") : t("lore.voiceToggle.ariaOff")}
          sx={{
            alignSelf: { xs: "flex-start", sm: "center" },
            color: "common.white",
            ...(isVoiceEnabled
              ? {}
              : {
                  bgcolor: "grey.700",
                  "&:hover": { bgcolor: "grey.800" },
                }),
          }}
        >
          {isVoiceEnabled ? t("lore.voiceToggle.on") : t("lore.voiceToggle.off")}
        </Button>
      </Stack>

      <Box sx={{ mt: 3 }}>
        {loreItems.map((item) => {
          const isExpanded = expandedItemId === item.id;
          const isPlaying = playingItemId === item.id;

          return (
            <Accordion
              key={item.id}
              disableGutters
              elevation={0}
              expanded={isExpanded}
              onChange={onToggleAccordion(item)}
              sx={{
                borderRadius: "14px !important",
                overflow: "hidden",
                mb: 1.5,
                border: isPlaying ? "2px solid" : "1px solid",
                borderColor: isPlaying ? "success.main" : "rgba(0, 0, 0, 0.08)",
                transition: "border-color 0.2s ease",
                "&:before": { display: "none" },
              }}
            >
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                sx={{
                  bgcolor: "primary.main",
                  "& .MuiAccordionSummary-content": {
                    alignItems: "center",
                    gap: 1,
                  },
                }}
              >
                <Typography sx={{ fontWeight: 700 }}>{t(item.questionKey)}</Typography>
                {isPlaying ? (
                  <Typography variant="caption" color="text.secondary">
                    {t("lore.voicePlaying")}
                  </Typography>
                ) : null}
              </AccordionSummary>
              <AccordionDetails sx={{ bgcolor: "rgba(255, 255, 255, 0.88)" }}>
                <Box
                  sx={{
                    display: "flex",
                    gap: { xs: 1.25, sm: 2 },
                    alignItems: "flex-start",
                  }}
                >
                  <Box
                    component="img"
                    src={yokokoImage}
                    alt={t("lore.yokokoAlt")}
                    sx={{
                      width: { xs: 60, sm: 80 },
                      height: { xs: 60, sm: 80 },
                      objectFit: "contain",
                      flexShrink: 0,
                    }}
                  />

                  <Paper
                    elevation={0}
                    sx={{
                      flex: 1,
                      bgcolor: "#fffdf7",
                      borderRadius: "18px",
                      px: { xs: 1.5, sm: 2 },
                      py: { xs: 1.25, sm: 1.5 },
                      boxShadow: 1,
                      border: "1px solid",
                      borderColor: "rgba(0, 0, 0, 0.08)",
                    }}
                  >
                    <Typography sx={{ lineHeight: 1.8 }}>{t(item.answerKey)}</Typography>

                    {item.link ? (
                      <MuiLink
                        component="a"
                        href={item.link.href}
                        target="_blank"
                        rel="noreferrer"
                        underline="hover"
                        sx={{
                          mt: 1.5,
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 0.75,
                          fontWeight: 700,
                        }}
                      >
                        <YouTubeIcon fontSize="small" color="error" />
                        {t(item.link.labelKey)}
                      </MuiLink>
                    ) : null}
                  </Paper>
                </Box>
              </AccordionDetails>
            </Accordion>
          );
        })}
      </Box>

      <Box sx={{ mt: 4, textAlign: "center" }}>
        <Button variant="outlined" color="info" component={RouterLink} to="/">
          {t("lore.backToGame")}
        </Button>
      </Box>

      <Snackbar open={errorMessage !== null} autoHideDuration={5000} onClose={clearError}>
        <Alert severity="error" variant="filled" onClose={clearError} sx={{ width: "100%" }}>
          {errorMessage ?? ""}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default LorePage;
