"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";

type Lang = "en" | "kh";

interface LangContextValue {
  lang: Lang;
  setLang: (l: Lang) => void;
  isKh: boolean;
}

const LangContext = createContext<LangContextValue>({
  lang: "en",
  setLang: () => {},
  isKh: false,
});

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");

  useEffect(() => {
    const saved = localStorage.getItem("kwd_lang") as Lang | null;
    if (saved === "en" || saved === "kh") setLangState(saved);
  }, []);

  useEffect(() => {
    if (lang === "kh") {
      document.documentElement.classList.add("lang-kh");
      document.documentElement.classList.remove("lang-en");
    } else {
      document.documentElement.classList.add("lang-en");
      document.documentElement.classList.remove("lang-kh");
    }
  }, [lang]);

  function setLang(l: Lang) {
    setLangState(l);
    localStorage.setItem("kwd_lang", l);
  }

  return (
    <LangContext.Provider value={{ lang, setLang, isKh: lang === "kh" }}>
      {children}
    </LangContext.Provider>
  );
}

export function useLang() {
  return useContext(LangContext);
}
