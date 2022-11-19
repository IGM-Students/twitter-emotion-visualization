import { createTheme, ThemeProvider } from "@mui/material/styles";
import "assets/main.css";
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

export const darkTheme = createTheme({
    palette: {
        mode: "dark",
    },
});

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
    <React.StrictMode>
        <ThemeProvider theme={darkTheme}>
            <App />
        </ThemeProvider>
    </React.StrictMode>
);
