import App from "@/App";
import bananaMeterIconPng from "@/assets/ui-image/banana-meter-icon.png";
import bananaMeterIconWebp from "@/assets/ui-image/banana-meter-icon.webp";
import "@/i18n";
import "@/index.css";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

const theme = createTheme({
  palette: {
    primary: {
      main: "#fdd835",
    },
    secondary: {
      main: "#8d6e63",
    },
    error: {
      main: "#e53935",
    },
    info: {
      main: "#1e88e5",
    },
    success: {
      main: "#43a047",
    },
  },
});

function appendFaviconLink({ type, href }: { type: string; href: string }) {
  const link = document.createElement("link");
  link.rel = "icon";
  link.type = type;
  link.href = href;
  document.head.appendChild(link);
}

function configureTabMetadata() {
  document.title = "Bananadventure";
  document.querySelectorAll("link[rel~='icon']").forEach((link) => link.remove());

  appendFaviconLink({ type: "image/webp", href: bananaMeterIconWebp });
  appendFaviconLink({ type: "image/png", href: bananaMeterIconPng });
}

configureTabMetadata();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <BrowserRouter basename="/">
        <App />
      </BrowserRouter>
    </ThemeProvider>
  </React.StrictMode>
);
