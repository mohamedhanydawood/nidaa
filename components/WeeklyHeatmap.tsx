"use client";
import { useEffect, useState } from "react";
import type { WeekRecord } from "../app/types/electron";

export default function WeeklyHeatmap() {
  const [weekData, setWeekData] = useState<WeekRecord[]>([]);

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

  const prayerNames: { [key: string]: string } = {
    Fajr: "ف",
    Dhuhr: "ظ",
    Asr: "ع",
    Maghrib: "م",
    Isha: "ش",
  };

  return (
    <div className="bg-card rounded-lg p-4">
      <h2 className="text-sm font-semibold text-muted mb-3">سجل الأسبوع</h2>
      <div className="space-y-2">
        {weekData.map((day) => (
          <div
            key={day.date}
            className="flex items-center justify-between p-2 bg-card-hover rounded-lg"
          >
            <div className="flex-1">
              <div className="text-sm font-medium">{day.dayName}</div>
              <div className="text-xs text-muted">{day.date.slice(5)}</div>
            </div>
            <div className="flex gap-1">
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
            <div className="mr-3 text-sm font-semibold text-muted">
              {day.total}/5
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
