import { createContext, useContext, useEffect, useState } from "react";

const Ctx = createContext(null);
const KEY = "ns-theme";

function initial() {
  try {
    const saved = localStorage.getItem(KEY);
    if (saved === "light" || saved === "dark") return saved;
  } catch (e) {
    /* ignore */
  }
  return "dark";
}

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(initial);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    try {
      localStorage.setItem(KEY, theme);
    } catch (e) {
      /* ignore */
    }
  }, [theme]);

  const toggle = () => setTheme((t) => (t === "dark" ? "light" : "dark"));
  return <Ctx.Provider value={{ theme, toggle }}>{children}</Ctx.Provider>;
}

export const useTheme = () => useContext(Ctx);