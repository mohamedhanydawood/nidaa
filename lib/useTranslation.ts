"use client";
import { useLanguage } from "./LanguageProvider";
import { useState, useEffect } from "react";

type TranslationValue = string | Record<string, string | number> | undefined;
type Translations = Record<string, TranslationValue>;

const translationsCache: Record<string, Record<string, Translations>> = {
  ar: {},
  en: {},
};

export function useTranslation(namespace: string = "common") {
  const { language } = useLanguage();
  const [translations, setTranslations] = useState<Translations>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadTranslations = async () => {
      // Check cache first
      if (translationsCache[language][namespace]) {
        setTranslations(translationsCache[language][namespace]);
        setIsLoading(false);
        return;
      }

      try {
        let data: Translations;
        
        // Use Electron IPC if available (production), otherwise use fetch (development/web)
        if (typeof window !== "undefined" && window.electron?.getTranslations) {
          console.log(`[useTranslation] Loading via IPC: ${language}/${namespace}`);
          data = await window.electron.getTranslations(language, namespace) as Translations;
        } else {
          console.log(`[useTranslation] Loading via fetch: ${language}/${namespace}`);
          const response = await fetch(`/locales/${language}/${namespace}.json`);
          if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
          }
          data = (await response.json()) as Translations;
        }
        
        translationsCache[language][namespace] = data;
        setTranslations(data);
      } catch (error) {
        console.error(`[useTranslation] Failed to load ${language}/${namespace}:`, error);
        setTranslations({});
      } finally {
        setIsLoading(false);
      }
    };

    loadTranslations();
  }, [language, namespace]);

  const t = (key: string, params?: Record<string, string | number>): string => {
    const keys = key.split(".");
    let value: TranslationValue | Translations = translations;

    for (const k of keys) {
      if (value && typeof value === "object") {
        value = (value as Record<string, TranslationValue>)[k];
      } else {
        return key; // Return key if translation not found
      }
    }

    if (typeof value !== "string") {
      return key;
    }

    // Replace parameters like {{param}}
    if (params) {
      return value.replace(/\{\{(\w+)\}\}/g, (_: string, paramKey: string) => {
        return params[paramKey]?.toString() || "";
      });
    }

    return value;
  };

  return { t, isLoading, language };
}
