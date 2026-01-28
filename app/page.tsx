"use client";
import { useEffect, useState } from "react";
import Header from "../components/Header";
import { Calendar, MapPin } from "lucide-react";
import UpdateBanner from "../components/UpdateBanner";
import PrayerTimesGrid from "../components/PrayerTimesGrid";
import PrayerChecklist from "../components/PrayerChecklist";
import StatisticsCards from "../components/StatisticsCards";
import WeeklyHeatmap from "../components/WeeklyHeatmap";
import { useUpdateInfo } from "../components/UpdateNotifier";
import AthkarSection from "@/components/AthkarSection";
import RandomAyah from "../components/RandomAyah";
import InfoCards from "../components/InfoCards";
import { useLanguage } from "../lib/LanguageProvider";

type Settings = {
  city: string;
  country: string;
  method: number;
  madhab: number;
  notifyBefore: number;
  timeFormat: "12" | "24";
  notificationsEnabled?: boolean;
};

export default function Home() {
  const [settings, setSettings] = useState<Settings>({
    city: "Cairo",
    country: "Egypt",
    method: 5,
    madhab: 1,
    notifyBefore: 5,
    timeFormat: "24",
    notificationsEnabled: true,
  });  const { language } = useLanguage();
  const isRTL = language === "ar";
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
      // Optimistic update - update UI immediately
      setPrayerData((prev) => ({
        ...prev,
        checked: {
          ...prev.checked,
          [prayer]: !prev.checked[prayer as keyof typeof prev.checked],
        },
      }));

      // Then save to electron
      if (window.electron?.markPrayerDone) {
        await window.electron.markPrayerDone(prayer);
      }
    } catch (error) {
      console.error("Error marking prayer:", error);
      // Revert on error
      setPrayerData((prev) => ({
        ...prev,
        checked: {
          ...prev.checked,
          [prayer]: !prev.checked[prayer as keyof typeof prev.checked],
        },
      }));
    }
  };

  const updateInfo = useUpdateInfo();

  return (

    <div dir={isRTL ? "rtl" : "ltr"} className="min-h-screen text-foreground flex flex-col overflow-hidden bg-background">
      {/* Header */}
      <Header />

      {/* Main Content */}
      <main className={`flex-1 overflow-y-auto p-2 md:p-4 ${isRTL ? "md:mr-22" : "md:ml-22"}`}>
        {/* Grid Container */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-start">

          {/* 1. Location & Hijri - جعلناه أصغر وبدون هوامش ضخمة */}
          <div className="col-span-1 md:col-span-12 flex items-center justify-between px-1 mb-1">
            {prayerData.hijri && (
              <div className="flex items-center gap-2 opacity-80">
                <Calendar size={16} className="text-muted-foreground" />
                <p className="text-xs md:text-sm font-medium">
                  {prayerData.hijri.day} {prayerData.hijri.month.ar} {prayerData.hijri.year} هـ
                </p>
              </div>
            )}
            <div className="flex items-center gap-2 opacity-80">
              <p className="text-xs md:text-sm font-medium">{settings.city}, {settings.country}</p>
              <MapPin size={16} className="text-muted-foreground" />
            </div>
          </div>

          {/* 2. Update Banner - يظهر فقط عند الحاجة ولا يأخذ مساحة فارغة */}
          <div className="col-span-1 md:col-span-12">
            <UpdateBanner updateInfo={updateInfo} />
          </div>

          {/* 3. أوقات الصلوات - القسم العلوي العريض */}
          <div className="col-span-1 md:col-span-12">
            <PrayerTimesGrid
              times={prayerData.times}
              nextPrayer={prayerData.nextPrayer}
              sunrise={prayerData.sunrise}
              formatTime={formatTime}
            />
          </div>

          {/* 3.1 كروت منزلقة - تعرض بعد مواقيت الصلاة */}
          <div className="col-span-1 md:col-span-12">
            <InfoCards />
          </div>

          {/* الصف السفلي: تقسيم العناصر بجانب بعضها لتقليل الفراغ الرأسي */}

          {/* قائمة التحقق - أخذت 5 أعمدة */}
          <div className="col-span-1 md:col-span-5 space-y-3">
            <div className="bg-card rounded-xl p-3 ">
              <StatisticsCards statistics={statistics} checked={prayerData.checked} />
            </div>
            <div className="bg-card rounded-xl p-3 ">
              <PrayerChecklist
                prayers={prayerData.times}
                checked={prayerData.checked}
                onToggle={handleTogglePrayer}
              />
            </div>
          </div>

          {/* الأذكار والإحصائيات - أخذت 4 أعمدة */}
          <div className="col-span-1 md:col-span-4 flex flex-col gap-3">
            <WeeklyHeatmap />
          </div>

          {/* سجل الأسبوع - أخذت 3 أعمدة */}
          <div className="col-span-1 md:col-span-3 flex flex-col gap-3">
            <div className="bg-card rounded-xl p-3 ">
              <RandomAyah />
            </div>
            <div className="bg-card rounded-xl p-3 ">
              <AthkarSection />
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
