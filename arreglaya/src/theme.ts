import { createTheme } from "@mui/material/styles";

const brand = "#bf7a37";
const theme = createTheme({
  palette: {
    primary: { main: brand },
    secondary: { main: "#333" },
    background: { default: "#fff" },
  },
  shape: { borderRadius: 12 },
  components: {
    MuiButton: {
      defaultProps: { variant: "contained" },
      styleOverrides: {
        root: { textTransform: "none", fontWeight: 700, borderRadius: 12 },
      },
    },
    MuiCard: { styleOverrides: { root: { borderRadius: 16 } } },
  },
  typography: {
    fontFamily: [
      "ui-sans-serif",
      "system-ui",
      "-apple-system",
      "Segoe UI",
      "Roboto",
      "Helvetica",
      "Arial",
      "Apple Color Emoji",
      "Segoe UI Emoji",
    ].join(","),
  },
});
export default theme;
