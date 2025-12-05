"use client";
import Link from "next/link";
import { useEffect, useState } from "react";

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
            });
          }
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
    <div dir="rtl" className="h-screen bg-zinc-900 text-white overflow-hidden flex flex-col">
      {/* Header */}
      <header className="bg-zinc-800 border-b border-zinc-700 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🕌</span>
          <div>
            <h1 className="text-xl font-bold">نداء</h1>
            <p className="text-xs text-zinc-400">
              {settings.city}, {settings.country}
            </p>
          </div>
        </div>
        <Link
          href="/settings"
          className="px-3 py-1.5 text-sm rounded-md hover:bg-zinc-700 transition-colors"
        >
          ⚙️ الإعدادات
        </Link>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-6 grid grid-cols-12 gap-4">
        {/* أوقات الصلوات */}
        <div className="col-span-12 bg-zinc-800 rounded-lg p-4">
          <h2 className="text-sm font-semibold text-zinc-400 mb-3">مواقيت اليوم</h2>
          <div className="grid grid-cols-5 gap-3">
            {Object.keys(prayerData.times).map((key) => {
              const isNext = key === prayerData.nextPrayer.englishName;
              const time24 = prayerData.times[key as keyof typeof prayerData.times];
              return (
                <div
                  key={key}
                  className={`p-3 rounded-lg text-center transition-all ${
                    isNext
                      ? "bg-emerald-600 shadow-lg shadow-emerald-600/50"
                      : "bg-zinc-700"
                  }`}
                >
                  <div className="text-2xl mb-1">{prayerIcons[key]}</div>
                  <div className="text-sm font-semibold mb-1">{prayerNames[key]}</div>
                  <div className={`text-lg font-bold ${isNext ? "text-white" : "text-emerald-400"}`}>
                    {formatTime(time24)}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* قائمة الصلوات */}
        <div className="col-span-7 bg-zinc-800 rounded-lg p-4">
          <h2 className="text-sm font-semibold text-zinc-400 mb-3">قائمة التحقق</h2>
          <div className="space-y-2">
            {Object.keys(prayerData.times).map((key) => (
              <div
                key={key}
                className="flex items-center justify-between p-3 bg-zinc-700 rounded-lg hover:bg-zinc-600 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">{prayerIcons[key]}</span>
                  <span className="font-medium">{prayerNames[key]}</span>
                </div>
                <button
                  onClick={() => handleTogglePrayer(key)}
                  className={`w-6 h-6 rounded-full flex items-center justify-center transition-all ${
                    prayerData.checked[key as keyof typeof prayerData.checked]
                      ? "bg-emerald-500 text-white"
                      : "bg-zinc-600 hover:bg-zinc-500"
                  }`}
                >
                  {prayerData.checked[key as keyof typeof prayerData.checked] ? "✓" : ""}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* الإحصائيات */}
        <div className="col-span-5 bg-zinc-800 rounded-lg p-4">
          <h2 className="text-sm font-semibold text-zinc-400 mb-3">الإحصائيات</h2>
          <div className="space-y-3">
            <div className="bg-zinc-700 p-4 rounded-lg text-center">
              <div className="text-3xl font-bold text-emerald-400">
                {Object.values(prayerData.checked).filter(Boolean).length}/5
              </div>
              <div className="text-sm text-zinc-400 mt-1">صلوات اليوم</div>
            </div>
            <div className="bg-zinc-700 p-4 rounded-lg text-center">
              <div className="text-3xl font-bold text-blue-400">7</div>
              <div className="text-sm text-zinc-400 mt-1">Streak أيام</div>
            </div>
            <div className="bg-zinc-700 p-4 rounded-lg text-center">
              <div className="text-3xl font-bold text-purple-400">85%</div>
              <div className="text-sm text-zinc-400 mt-1">نسبة الالتزام</div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
