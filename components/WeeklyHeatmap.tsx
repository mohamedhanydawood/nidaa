"use client";
import { useEffect, useState } from "react";
import type { WeekRecord } from "../app/types/electron";
import { useTranslation } from "../lib/useTranslation";
import { useLanguage } from "../lib/LanguageProvider";

export default function WeeklyHeatmap() {
  const [weekData, setWeekData] = useState<WeekRecord[]>([]);
  const { t } = useTranslation("prayers");
  const { language } = useLanguage();
  const isRTL = language === "ar";

  useEffect(() => {
    const fetchWeekData = async () => {
      try {
        if (window.electron?.getWeekRecords) {
          const data = await window.electron.getWeekRecords();
          setWeekData(data);
        }
      } catch (error) {
        console.error("Error fetching week data:", error);
      }
    };

    fetchWeekData();

    // Refresh when window gains focus
    const handleFocus = () => {
      fetchWeekData();
    };
    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, []);

  // Move prayerNames and dayNameMap outside component to memoize
  const getPrayerNames = () => ({
    Fajr: t("abbreviations.fajr"),
    Dhuhr: t("abbreviations.dhuhr"),
    Asr: t("abbreviations.asr"),
    Maghrib: t("abbreviations.maghrib"),
    Isha: t("abbreviations.isha"),
  });

  const getDayNameMap = (): Record<string, string> => ({
    Sunday: t("days.sunday"),
    Monday: t("days.monday"),
    Tuesday: t("days.tuesday"),
    Wednesday: t("days.wednesday"),
    Thursday: t("days.thursday"),
    Friday: t("days.friday"),
    Saturday: t("days.saturday"),
  });

  const prayerNames: Record<string, string> = getPrayerNames();
  const dayNameMap: Record<string, string> = getDayNameMap();

  const getTranslatedDayName = (dayName: string): string => {
    return dayNameMap[dayName] || dayName;
  };

  return (
    <div className="bg-card rounded-lg p-4" dir={isRTL ? "rtl" : "ltr"}>
      <h2 className="text-sm font-semibold text-muted mb-3">{t("weekRecord")}</h2>
      <div className="space-y-2">
        {weekData.map((day) => (
          <div
            key={day.date}
            className={`flex items-center justify-between ${isRTL ? "flex-row" : ""} p-2 bg-card-hover rounded-lg`}
          >
            <div className="flex-1">
              <div className={`text-sm font-medium ${isRTL ? "text-right" : "text-left"}`}>{getTranslatedDayName(day.dayName)}</div>
              <div className={`text-xs text-muted ${isRTL ? "text-right" : "text-left"}`}>{day.date.slice(5)}</div>
            </div>
            <div className={`flex gap-1 ${isRTL ? "flex-row" : ""}`}>
              {Object.entries(day.prayers).map(([key, done]) => (
                <div
                  key={key}
                  className={`w-7 h-7 rounded flex items-center justify-center text-xs font-bold transition-all ${
                    done
                      ? "bg-green-600 text-white"
                      : "bg-muted/20 text-muted"
                  }`}
                  title={key}
                >
                  {prayerNames[key]}
                </div>
              ))}
            </div>
            <div className={`${isRTL ? "ml-3" : "mr-3"} text-sm font-semibold text-muted`}>
              {day.total}/5
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
