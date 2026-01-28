"use client";
import { createContext, useContext, useState, useEffect, ReactNode } from "react";

type Language = "ar" | "en";

type ElectronSettings = {
  language?: Language;
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  dir: "rtl" | "ltr";
}

const LanguageContext = createContext<LanguageContextType>({
  language: "ar",
  setLanguage: () => {},
  dir: "rtl",
});

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>("ar");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Load language from settings via IPC
    const loadLanguage = async () => {
      try {
        if (window.electron?.getSettings) {
          const settings = (await window.electron.getSettings()) as ElectronSettings;
          if (settings?.language) {
            setLanguageState(settings.language);
            applyLanguageToDOM(settings.language);
          }
        }
      } catch (error) {
        console.error("Failed to load language settings", error);
      } finally {
        setMounted(true);
      }
    };
    
    loadLanguage();
  }, []);

  const applyLanguageToDOM = (lang: Language) => {
    if (typeof document !== "undefined") {
      document.documentElement.lang = lang;
      document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
      document.documentElement.setAttribute("dir", lang === "ar" ? "rtl" : "ltr");
      // Update body direction for Tailwind
      if (lang === "ar") {
        document.body.classList.add("rtl");
        document.body.classList.remove("ltr");
      } else {
        document.body.classList.add("ltr");
        document.body.classList.remove("rtl");
      }
    }
  };

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    applyLanguageToDOM(lang);
  };

  const dir = language === "ar" ? "rtl" : "ltr";

  if (!mounted) {
    return <>{children}</>;
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage, dir }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}

export { LanguageContext };