"use client";
import { Sunrise, Sun, SunMedium, Sunset, Moon } from "lucide-react";
import { useTranslation } from "../lib/useTranslation";
import { useLanguage } from "../lib/LanguageProvider";

interface Props {
  prayers: {
    Fajr: string;
    Dhuhr: string;
    Asr: string;
    Maghrib: string;
    Isha: string;
  };
  checked: {
    Fajr: boolean;
    Dhuhr: boolean;
    Asr: boolean;
    Maghrib: boolean;
    Isha: boolean;
  };
  onToggle: (prayer: string) => void;
}

const prayerIcons: { [key: string]: React.ReactNode } = {
  Fajr: <Sunrise width={20} height={20} />,
  Dhuhr: <Sun width={20} height={20} />,
  Asr: <SunMedium width={20} height={20} />,
  Maghrib: <Sunset width={20} height={20} />,
  Isha: <Moon width={20} height={20} />,
};


export default function PrayerChecklist({ prayers, checked, onToggle }: Props) {
  const { t } = useTranslation("prayers");
  const { language } = useLanguage();
  const isRTL = language === "ar";
  
  const prayerNames: { [key: string]: string } = {
    Fajr: t("fajr"),
    Dhuhr: t("dhuhr"),
    Asr: t("asr"),
    Maghrib: t("maghrib"),
    Isha: t("isha"),
  };

  return (
    <div dir={isRTL ? "rtl" : "ltr"}>
      <h2 className="text-sm font-semibold text-muted mb-3">{t("checklist")}</h2>
      <div className="space-y-2">
        {Object.keys(prayers).map((key) => (
          <div
            key={key}
            className={`flex items-center justify-between ${isRTL ? "flex-row" : ""} p-3 bg-card-hover rounded-lg hover:bg-input transition-colors`}
          >
            <div className={`flex items-center gap-2 md:gap-3 ${isRTL ? "flex-row" : ""}`}>
              <span className="text-lg md:text-xl">{prayerIcons[key]}</span>
              <span className="font-medium text-sm md:text-base">{prayerNames[key]}</span>
            </div>
            <button
              onClick={() => onToggle(key)}
              className={`w-6 h-6 md:w-8 md:h-8 rounded-full flex items-center justify-center transition-all ${
                checked[key as keyof typeof checked]
                  ? "bg-emerald-500 text-foreground"
                  : "bg-muted hover:bg-zinc-500"
              }`}
            >
              {checked[key as keyof typeof checked] ? "✓" : ""}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
