"use client";
import Image from "next/image";
import { useEffect, useState } from "react";
import WeeklyHeatmap from "./components/WeeklyHeatmap";

type Settings = {
  city: string;
  country: string;
  method: number;
  madhab: number;
  notifyBefore: number;
  timeFormat: "12" | "24";
};

export default function Home() {
  const [settings, setSettings] = useState<Settings>({
    city: "Cairo",
    country: "Egypt",
    method: 5,
    madhab: 1,
    notifyBefore: 5,
    timeFormat: "24",
  });

  const [prayerData, setPrayerData] = useState({
    times: {
      Fajr: "04:45",
      Dhuhr: "12:00",
      Asr: "15:30",
      Maghrib: "18:00",
      Isha: "19:30",
    },
    nextPrayer: {
      name: "الظهر",
      englishName: "Dhuhr",
      time: "12:00",
    },
    checked: {
      Fajr: false,
      Dhuhr: false,
      Asr: false,
      Maghrib: false,
      Isha: false,
    },
    sunrise: undefined as string | undefined,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    hijri: undefined as any,
  });

  const [statistics, setStatistics] = useState({
    currentStreak: 0,
    longestStreak: 0,
    commitmentPercentage: 0,
  });

  // تحويل من 24 ساعة إلى 12 ساعة
  const formatTime = (time24: string): string => {
    if (settings.timeFormat === "24") return time24;
    
    const [hours, minutes] = time24.split(":").map(Number);
    const period = hours >= 12 ? "PM" : "AM";
    const hours12 = hours % 12 || 12;
    return `${hours12}:${minutes.toString().padStart(2, "0")} ${period}`;
  };

  // جلب الإعدادات
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        if (window.electron?.getSettings) {
          const settings = await window.electron.getSettings();
          setSettings(settings);
          console.log("Settings loaded:", settings);
        }
      } catch {
        console.log("Using default settings");
      }
    };
    
    fetchSettings();
    
    // إعادة تحميل الإعدادات عند العودة للصفحة
    const handleFocus = () => {
      fetchSettings();
    };
    
    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, []);

  // جلب البيانات من Electron
  useEffect(() => {
    const fetchData = async () => {
      try {
        if (window.electron?.getPrayerTimes) {
          const data = await window.electron.getPrayerTimes();
          if (data) {
            setPrayerData({
              times: data.times,
              nextPrayer: {
                name: data.nextPrayer.name,
                englishName: data.nextPrayer.englishName,
                time: data.nextPrayer.time,
              },
              checked: data.todayRecord,
              sunrise: data.sunrise,
              hijri: data.hijri,
            });
          }
        }

        // Fetch statistics
        if (window.electron?.getStatistics) {
          const stats = await window.electron.getStatistics();
          setStatistics(stats);
        }
      } catch (err) {
        console.log("Running in web mode, using defaults", err);
      }
    };

    fetchData();
    
    // إعادة جلب البيانات عند العودة للصفحة
    const handleFocus = () => {
      fetchData();
    };
    window.addEventListener("focus", handleFocus);

    // الاستماع للتحديثات
    if (window.electron?.onPrayerTimesUpdated) {
      window.electron.onPrayerTimesUpdated((data) => {
        setPrayerData({
          times: data.times,
          nextPrayer: {
            name: data.nextPrayer.name,
            englishName: data.nextPrayer.englishName,
            time: data.nextPrayer.time,
          },
          checked: data.todayRecord,
          sunrise: data.sunrise,
          hijri: data.hijri,
        });
      });
    }

    if (window.electron?.onPrayerMarked) {
      window.electron.onPrayerMarked(({ prayerName, done }) => {
        setPrayerData((prev) => ({
          ...prev,
          checked: {
            ...prev.checked,
            [prayerName]: done,
          },
        }));
        
        // Refresh statistics after marking prayer
        if (window.electron?.getStatistics) {
          window.electron.getStatistics().then(setStatistics);
        }
      });
    }
    
    return () => {
      window.removeEventListener("focus", handleFocus);
    };
  }, []);

  const handleTogglePrayer = async (prayer: string) => {
    try {
      if (window.electron?.markPrayerDone) {
        const success = await window.electron.markPrayerDone(prayer);
        if (success) {
          setPrayerData((prev) => ({
            ...prev,
            checked: {
              ...prev.checked,
              [prayer]: !prev.checked[prayer as keyof typeof prev.checked],
            },
          }));
        }
      }
    } catch (error) {
      console.error("Error marking prayer:", error);
    }
  };

  const prayerNames: { [key: string]: string } = {
    Fajr: "الفجر",
    Dhuhr: "الظهر",
    Asr: "العصر",
    Maghrib: "المغرب",
    Isha: "العشاء",
  };

  const prayerIcons: { [key: string]: string } = {
    Fajr: "🌅",
    Dhuhr: "☀️",
    Asr: "🌤️",
    Maghrib: "🌆",
    Isha: "🌙",
  };

  return (
    <div dir="rtl" className="h-screen text-foreground flex flex-col">
      {/* Header */}
      <header className="bg-card px-4 md:px-6 py-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2 md:gap-3">
          {/* <span className="text-2xl">🕌</span> */}
          <Image src="/icon.png" alt="Nidaa Logo" width={40} height={40} className="md:w-[50px] md:h-[50px]" />
          <div>
            <h1 className="text-lg md:text-xl font-bold">نداء</h1>
            <p className="text-xs text-muted">
              {settings.city}, {settings.country}
            </p>
            {prayerData.hijri && (
              <p className="text-xs text-muted">
                {prayerData.hijri.day} {prayerData.hijri.month.ar} {prayerData.hijri.year} هـ
              </p>
            )}
          </div>
        </div>
        <a
          href={process.env.NODE_ENV === "development" ? "/settings" : "settings.html"}
          className="px-3 py-1.5 text-sm rounded-md hover:bg-card-hover transition-colors"
        >
          ⚙️ الإعدادات
        </a>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-4 md:p-6 grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-4">
        {/* أوقات الصلوات */}
        <div className="col-span-1 md:col-span-12 bg-card rounded-lg p-4">
          <h2 className="text-sm font-semibold text-muted mb-3">مواقيت اليوم</h2>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2 md:gap-3">
            {Object.keys(prayerData.times).map((key) => {
              const time24 = prayerData.times[key as keyof typeof prayerData.times];
              
              // Highlight the next prayer based on server data
              const isNext = key === prayerData.nextPrayer.englishName;
              
              return (
                <div
                  key={key}
                  className={`p-2 md:p-3 rounded-lg text-center transition-all ${
                    isNext
                      ? "bg-accent shadow-lg"
                      : "bg-card-hover"
                  }`}
                >
                  <div className="text-xl md:text-2xl mb-1">{prayerIcons[key]}</div>
                  <div className="text-xs md:text-sm font-semibold mb-1">{prayerNames[key]}</div>
                  <div className={`text-sm md:text-lg font-bold ${isNext ? "text-foreground" : "text-muted"}`}>
                    {formatTime(time24)}
                  </div>
                </div>
              );
            })}
            
            {/* Sunrise Card */}
            {prayerData.sunrise && (
              <div className="p-2 md:p-3 rounded-lg text-center bg-card-hover">
                <div className="text-xl md:text-2xl mb-1">🌅</div>
                <div className="text-xs md:text-sm font-semibold mb-1">الشروق</div>
                <div className="text-sm md:text-lg font-bold text-muted">
                  {formatTime(prayerData.sunrise)}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* قائمة الصلوات */}
        <div className="col-span-1 md:col-span-5 bg-card rounded-lg p-4">
          <h2 className="text-sm font-semibold text-muted mb-3">قائمة التحقق</h2>
          <div className="space-y-2">
            {Object.keys(prayerData.times).map((key) => (
              <div
                key={key}
                className="flex items-center justify-between p-3 bg-card-hover rounded-lg hover:bg-input transition-colors"
              >
                <div className="flex items-center gap-2 md:gap-3">
                  <span className="text-lg md:text-xl">{prayerIcons[key]}</span>
                  <span className="font-medium text-sm md:text-base">{prayerNames[key]}</span>
                </div>
                <button
                  onClick={() => handleTogglePrayer(key)}
                  className={`w-6 h-6 md:w-8 md:h-8 rounded-full flex items-center justify-center transition-all ${
                    prayerData.checked[key as keyof typeof prayerData.checked]
                      ? "bg-emerald-500 text-foreground"
                      : "bg-muted hover:bg-zinc-500"
                  }`}
                >
                  {prayerData.checked[key as keyof typeof prayerData.checked] ? "✓" : ""}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* الإحصائيات */}
        <div className="col-span-1 md:col-span-4 bg-card rounded-lg p-4">
          <h2 className="text-sm font-semibold text-muted mb-3">الإحصائيات</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-card-hover p-3 md:p-4 rounded-lg text-center">
              <div className="text-2xl md:text-3xl font-bold text-emerald-400">
                {Object.values(prayerData.checked).filter(Boolean).length}/5
              </div>
              <div className="text-xs md:text-sm text-muted mt-1">صلوات اليوم</div>
            </div>
            <div className="bg-card-hover p-3 md:p-4 rounded-lg text-center">
              <div className="text-2xl md:text-3xl font-bold text-blue-400">
                {statistics.currentStreak}
              </div>
              <div className="text-xs md:text-sm text-muted mt-1">أيام متواصلة</div>
            </div>
            <div className="bg-card-hover p-3 md:p-4 rounded-lg text-center">
              <div className="text-2xl md:text-3xl font-bold text-purple-400">
                {statistics.commitmentPercentage}%
              </div>
              <div className="text-xs md:text-sm text-muted mt-1">نسبة الالتزام</div>
            </div>
          </div>
        </div>

        {/* مخطط الأسبوع */}
        <div className="col-span-1 md:col-span-3">
          <WeeklyHeatmap />
        </div>
      </main>
    </div>
  );
}
