import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "./index.css";
import App from "./App.jsx";
import { LangProvider } from "./LangContext.jsx";
import { ThemeProvider } from "./ThemeContext.jsx";
import { AuthProvider } from "./AuthContext.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <LangProvider>
          <AuthProvider>
            <App />
          </AuthProvider>
        </LangProvider>
      </ThemeProvider>
    </BrowserRouter>
  </StrictMode>
);