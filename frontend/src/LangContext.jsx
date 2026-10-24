import { createContext, useContext, useEffect, useState } from "react";

const Ctx = createContext(null);
const KEY = "ns-lang";

export function LangProvider({ children }) {
  const [lang, setLang] = useState(() => {
    try {
      return localStorage.getItem(KEY) || "en";
    } catch (e) {
      return "en";
    }
  });

  useEffect(() => {
    document.documentElement.lang = lang;
    try {
      localStorage.setItem(KEY, lang);
    } catch (e) {
      /* ignore */
    }
  }, [lang]);

  const tr = (en, hi, pa) => {
    if (lang === "hi") return hi || en;
    if (lang === "pa") return pa || en;
    return en;
  };
  const t = (k) => k; // fallback for any old page that still calls t()

  return <Ctx.Provider value={{ lang, setLang, tr, t }}>{children}</Ctx.Provider>;
}

export const useLang = () => useContext(Ctx);