import { Sunrise, SunDim, Sun, SunMedium, Sunset, Moon } from "lucide-react";
import { useTranslation } from "../lib/useTranslation";
import { useLanguage } from "../lib/LanguageProvider";
import React from "react";

type PrayerTimes = {
  Fajr: string;
  Dhuhr: string;
  Asr: string;
  Maghrib: string;
  Isha: string;
};

type NextPrayer = {
  englishName: string;
};

type PrayerTimesGridProps = {
  times: PrayerTimes;
  nextPrayer: NextPrayer;
  sunrise?: string;
  formatTime: (time: string) => string;
};

const prayerIcons: { [key: string]: React.ReactNode } = {
  Fajr: <Sunrise width={40} height={40} />,
  Dhuhr: <Sun width={40} height={40} />,
  Asr: <SunMedium width={40} height={40} />,
  Maghrib: <Sunset width={40} height={40} />,
  Isha: <Moon width={40} height={40} />,
};

// تم تعديل الكود ليكون أكثر تماسكاً
export default function PrayerTimesGrid({ times, nextPrayer, sunrise, formatTime }: PrayerTimesGridProps) {
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

  // Define the correct order of prayers
  const prayerOrder = ["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"];

  return (
    // أضفنا mb-2 لتقليل الهامش السفلي لأقل درجة ممكنة
    <div className="col-span-1 md:col-span-12 mb-2"> 
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
        {prayerOrder.map((key) => {
          const time24 = times[key as keyof typeof times];
          const isNext = key === nextPrayer.englishName;

          return (
            <React.Fragment key={key}>
              <div
                className={`flex items-center justify-between ${isRTL ? "flex-row-reverse" : ""} gap-2 p-3 rounded-md transition-all min-w-0 ${
                  isNext ? "bg-accent shadow-lg" : "bg-card-hover"
                }`}
              >
                <div className="text-2xl md:text-3xl text-muted-foreground">
                  {prayerIcons[key]}
                </div>

                <div className={`${isRTL ? "text-right" : "text-left"} min-w-0`}>
                  <div className="truncate text-sm md:text-base font-semibold mb-0 leading-tight">
                    {prayerNames[key]}
                  </div>
                  <div className={`truncate text-xs md:text-sm font-bold ${isNext ? "text-foreground" : "text-muted"}`}>
                    {formatTime(time24)}
                  </div>
                </div>
              </div>

              {/* Sunrise Card - placed after Fajr */}
              {key === "Fajr" && sunrise && (
                <div className={`flex items-center justify-between ${isRTL ? "flex-row-reverse" : ""} gap-2 p-3 rounded-md bg-card-hover min-w-0`}>
                  <div className="text-2xl md:text-3xl text-muted-foreground">
                    <SunDim width={32} height={32} />
                  </div>
                  <div className={`${isRTL ? "text-right" : "text-left"} min-w-0`}>
                    <div className="truncate text-sm md:text-base font-semibold leading-tight">{t("sunrise")}</div>
                    <div className="truncate text-xs md:text-sm font-bold text-muted">{formatTime(sunrise)}</div>
                  </div>
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}