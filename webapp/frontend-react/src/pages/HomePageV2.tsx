import { Box } from "@mui/material";

import MainSection from "@/components/HomePageV2/MainSection";

function HomePageV2() {
  return (
    <Box sx={{ width: "100%", maxWidth: 960, mx: "auto", px: { xs: 0, sm: 1 } }}>
      <MainSection imageSrc="/sample-image/sample.png" />
    </Box>
  );
}

export default HomePageV2;
