"use client";
import { useState, useEffect } from "react";
import { useTranslation } from "../lib/useTranslation";
import { useLanguage } from "../lib/LanguageProvider";

interface Props {
  nextPrayer: {
    name: string;
    time: string;
  };
}

export default function CountdownTimer({ nextPrayer }: Props) {
  const [countdown, setCountdown] = useState("");
  const [progress, setProgress] = useState(0);
  const { t } = useTranslation("prayers");
  const { language } = useLanguage();
  const isRTL = language === "ar";

  useEffect(() => {
    const updateCountdown = () => {
      const [hours, minutes] = nextPrayer.time.split(":").map(Number);
      const prayerTime = new Date();
      prayerTime.setHours(hours, minutes, 0, 0);

      const now = new Date();
      const diff = prayerTime.getTime() - now.getTime();

      if (diff > 0) {
        const h = Math.floor(diff / (1000 * 60 * 60));
        const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const hourText = h > 0 ? `${h} ${t("hour")}` : "";
        const minText = `${m} ${t("minute")}`;
        setCountdown(h > 0 ? `${hourText} و ${minText}` : minText);

        // Calculate progress (assuming max 24 hours between prayers)
        const totalMs = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
        const elapsed = totalMs - diff;
        const progressPercent = Math.min(100, Math.max(0, (elapsed / totalMs) * 100));
        setProgress(progressPercent);
      } else {
        setCountdown(t("now"));
        setProgress(100);
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 60000); // كل دقيقة

    return () => clearInterval(interval);
  }, [nextPrayer.time, t]);

  return (
    <div className="bg-card rounded-lg p-6 text-center" dir={isRTL ? "rtl" : "ltr"}>
      <h2 className="text-sm text-muted mb-2">{t("nextPrayer")}</h2>
      <h1 className="text-4xl font-bold mb-3">{nextPrayer.name}</h1>
      <p className="text-3xl font-light mb-2">{nextPrayer.time}</p>
      <p className="text-base text-muted mb-4">{t("remaining")} {countdown}</p>
      
      {/* Progress Bar */}
      <div className="w-full bg-card-hover rounded-full h-2 overflow-hidden">
        <div
          className="bg-accent h-full rounded-full transition-all duration-1000"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
