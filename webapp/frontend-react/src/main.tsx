import App from "@/App";
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

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <BrowserRouter basename="/">
        <App />
      </BrowserRouter>
    </ThemeProvider>
  </React.StrictMode>
);
