import { app, BrowserWindow, ipcMain } from "electron";
import { PrayerScheduler } from "./scheduler.js";
import { fetchTodayScheduleByCity, fetchNextPrayer } from "./prayerService.js";
import path from "path";
import Store from "electron-store";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

type AppSettings = {
  city: string;
  country: string;
  method: number;
  madhab: number;
  notifyBefore: number;
  timeFormat: "12" | "24";
};

const store = new Store<{ settings: AppSettings; records: unknown }>();

const defaultSettings: AppSettings = {
  city: "Cairo",
  country: "Egypt",
  method: 5,
  madhab: 1,
  notifyBefore: 5,
  timeFormat: "24",
};

let mainWindow: BrowserWindow | null = null;
let scheduler: PrayerScheduler | null = null;

function getSettings(): AppSettings {
  return store.get("settings", defaultSettings) as AppSettings;
}

async function startScheduler(settings: AppSettings) {
  // إيقاف الـ scheduler القديم إن وجد
  if (scheduler) {
    scheduler = null;
  }
  
  scheduler = new PrayerScheduler({
    city: settings.city,
    country: settings.country,
    method: settings.method,
    madhab: settings.madhab,
    preAlertMinutes: settings.notifyBefore,
    autoPauseAtAdhan: false, // ملغي
    autoResumeAfterMs: undefined,
  });
  
  try {
    await scheduler.init();
    console.log("[Electron] Prayer scheduler initialized for", settings.city, settings.country);
  } catch (error) {
    console.error("[Electron] Failed to initialize scheduler:", error);
  }
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    autoHideMenuBar: true, // إخفاء شريط القوائم
    webPreferences: {
      preload: path.join(__dirname, "preload.cjs"),
    },
  });

  const startUrl =
    process.env.NODE_ENV === "development"
      ? "http://localhost:3000"
      : `file://${path.join(__dirname, "../out/index.html")}`;

  mainWindow.loadURL(startUrl);
  
  // فتح DevTools في وضع التطوير
  if (process.env.NODE_ENV === "development") {
    mainWindow.webContents.openDevTools();
  }
}

app.whenReady().then(async () => {
  createWindow();
  const settings = getSettings();
  await startScheduler(settings);

  // IPC Handlers
  ipcMain.handle("settings:get", async () => getSettings());
  
  ipcMain.handle("settings:set", async (_e, cfg: Partial<AppSettings>) => {
    console.log("[Electron] Received settings:", cfg);
    const current = getSettings();
    
    // Normalize country from Arabic to English
    let country = cfg.country ?? current.country;
    if (country === "مصر") country = "Egypt";
    else if (country === "السعودية") country = "Saudi Arabia";
    else if (country === "الإمارات") country = "United Arab Emirates";
    else if (country === "الكويت") country = "Kuwait";
    else if (country === "قطر") country = "Qatar";
    else if (country === "البحرين") country = "Bahrain";
    else if (country === "عمان") country = "Oman";
    else if (country === "الأردن") country = "Jordan";
    else if (country === "لبنان") country = "Lebanon";
    else if (country === "سوريا") country = "Syria";
    else if (country === "العراق") country = "Iraq";
    else if (country === "فلسطين") country = "Palestine";
    else if (country === "اليمن") country = "Yemen";
    else if (country === "المغرب") country = "Morocco";
    else if (country === "الجزائر") country = "Algeria";
    else if (country === "تونس") country = "Tunisia";
    else if (country === "ليبيا") country = "Libya";
    else if (country === "السودان") country = "Sudan";
    
    const updated: AppSettings = { 
      ...current, 
      ...cfg,
      country 
    };
    
    console.log("[Electron] Saving settings:", updated);
    store.set("settings", updated);
    
    // إعادة تشغيل الـ scheduler بالإعدادات الجديدة
    await startScheduler(updated);
    
    // إرسال تحديث للواجهة
    if (mainWindow) {
      mainWindow.webContents.send("settings:updated", updated);
    }
    
    return updated;
  });

  ipcMain.handle("prayer:get", async () => {
    const settings = store.get("settings") as AppSettings;
    if (!settings.city || !settings.country) return null;

    try {
      const schedule = await fetchTodayScheduleByCity({
        city: settings.city,
        country: settings.country,
        method: settings.method || 5,
        madhab: settings.madhab || 1,
      });

      const meta = schedule.meta;

      // تحويل الأوقات إلى HH:MM
      const times: Record<string, string> = {};
      for (const [key, date] of Object.entries(schedule.timings)) {
        const hours = date.getHours().toString().padStart(2, "0");
        const minutes = date.getMinutes().toString().padStart(2, "0");
        times[key] = `${hours}:${minutes}`;
      }

      // جلب الصلاة القادمة باستخدام API
      const today = new Date();
      const dateStr = `${today.getDate().toString().padStart(2,'0')}-${(today.getMonth()+1).toString().padStart(2,'0')}-${today.getFullYear()}`;
      const nextPrayerData = await fetchNextPrayer(meta.latitude, meta.longitude, dateStr, meta.method.id, settings.madhab || 1);

      const arabicNames: Record<string, string> = {
        Fajr: "الفجر",
        Dhuhr: "الظهر",
        Asr: "العصر",
        Maghrib: "المغرب",
        Isha: "العشاء",
      };

      const nextPrayer = {
        name: arabicNames[nextPrayerData.name] || nextPrayerData.name,
        englishName: nextPrayerData.name,
        time: nextPrayerData.time.toTimeString().slice(0,5),
      };

      // جلب سجلات الصلوات المؤداة
      const todayKey = new Date().toISOString().slice(0, 10);
      const records = (store.get("records") as Record<string, Record<string, boolean>>) || {};
      const todayRecord = records[todayKey] || {
        Fajr: false,
        Dhuhr: false,
        Asr: false,
        Maghrib: false,
        Isha: false,
      };

      // تحويل وقت الشروق إلى HH:MM
      let sunrise = undefined;
      if (schedule.sunrise) {
        const hours = schedule.sunrise.getHours().toString().padStart(2, "0");
        const minutes = schedule.sunrise.getMinutes().toString().padStart(2, "0");
        sunrise = `${hours}:${minutes}`;
      }

      return {
        times,
        nextPrayer,
        todayRecord,
        sunrise,
        hijri: schedule.hijri,
      };
    } catch (error) {
      console.error("Error fetching prayer data:", error);
      // Fallback to scheduler if available
      if (scheduler) {
        const schedule = scheduler.getTodaySchedule();
        if (schedule) {
          // Use the old logic as fallback
          const times: Record<string, string> = {};
          for (const [key, date] of Object.entries(schedule.timings)) {
            const hours = date.getHours().toString().padStart(2, "0");
            const minutes = date.getMinutes().toString().padStart(2, "0");
            times[key] = `${hours}:${minutes}`;
          }

          const now = new Date();
          const entries = Object.entries(schedule.timings) as Array<[string, Date]>;
          const upcoming = entries
            .filter(([, at]) => at.getTime() > now.getTime())
            .sort((a, b) => a[1].getTime() - b[1].getTime());

          let nextPrayer = {
            name: "الفجر",
            englishName: "Fajr",
            time: times.Fajr || "05:00",
          };

          if (upcoming.length > 0) {
            const [key] = upcoming[0];
            const arabicNames: Record<string, string> = {
              Fajr: "الفجر",
              Dhuhr: "الظهر",
              Asr: "العصر",
              Maghrib: "المغرب",
              Isha: "العشاء",
            };
            nextPrayer = {
              name: arabicNames[key] || key,
              englishName: key,
              time: times[key],
            };
          }

          const todayKey = new Date().toISOString().slice(0, 10);
          const records = (store.get("records") as Record<string, Record<string, boolean>>) || {};
          const todayRecord = records[todayKey] || {
            Fajr: false,
            Dhuhr: false,
            Asr: false,
            Maghrib: false,
            Isha: false,
          };

          let sunrise = undefined;
          if (schedule.sunrise) {
            const hours = schedule.sunrise.getHours().toString().padStart(2, "0");
            const minutes = schedule.sunrise.getMinutes().toString().padStart(2, "0");
            sunrise = `${hours}:${minutes}`;
          }

          return {
            times,
            nextPrayer,
            todayRecord,
            sunrise,
            hijri: schedule.hijri,
          };
        }
      }
      return null;
    }
  });

  ipcMain.handle("prayer:mark", async (_e, prayerName: string) => {
    const todayKey = new Date().toISOString().slice(0, 10);
    const records = (store.get("records") as Record<string, Record<string, boolean>>) || {};
    
    if (!records[todayKey]) {
      records[todayKey] = {
        Fajr: false,
        Dhuhr: false,
        Asr: false,
        Maghrib: false,
        Isha: false,
      };
    }
    
    // Toggle the prayer
    records[todayKey][prayerName] = !records[todayKey][prayerName];
    
    store.set("records", records);
    console.log("Prayer marked:", prayerName, records[todayKey][prayerName]);
    
    // إرسال تحديث للواجهة
    if (mainWindow) {
      mainWindow.webContents.send("prayer:marked", {
        prayerName,
        done: records[todayKey][prayerName],
      });
    }
    
    return true;
  });

  ipcMain.handle("statistics:get", async () => {
    const records = (store.get("records") as Record<string, Record<string, boolean>>) || {};
    
    // حساب السلسلة الحالية (consecutive days with all 5 prayers)
    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;
    
    // ترتيب التواريخ من الأقدم للأحدث
    const sortedDates = Object.keys(records).sort();
    const today = new Date().toISOString().slice(0, 10);
    
    // حساب السلسلة الحالية من اليوم ورجوعاً للخلف
    for (let i = 0; i < 365; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateKey = date.toISOString().slice(0, 10);
      
      const dayRecord = records[dateKey];
      if (!dayRecord) break;
      
      const allPrayersDone = Object.values(dayRecord).filter(Boolean).length === 5;
      if (allPrayersDone) {
        currentStreak++;
      } else {
        break;
      }
    }
    
    // حساب أطول سلسلة
    for (const dateKey of sortedDates) {
      const dayRecord = records[dateKey];
      const allPrayersDone = Object.values(dayRecord).filter(Boolean).length === 5;
      
      if (allPrayersDone) {
        tempStreak++;
        longestStreak = Math.max(longestStreak, tempStreak);
      } else {
        tempStreak = 0;
      }
    }
    
    // حساب نسبة الالتزام (آخر 30 يوم)
    let totalPrayers = 0;
    let completedPrayers = 0;
    
    for (let i = 0; i < 30; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateKey = date.toISOString().slice(0, 10);
      
      const dayRecord = records[dateKey];
      if (dayRecord) {
        totalPrayers += 5;
        completedPrayers += Object.values(dayRecord).filter(Boolean).length;
      }
    }
    
    const commitmentPercentage = totalPrayers > 0 
      ? Math.round((completedPrayers / totalPrayers) * 100)
      : 0;
    
    return {
      currentStreak,
      longestStreak,
      commitmentPercentage,
    };
  });

  ipcMain.handle("records:getWeek", async () => {
    const records = (store.get("records") as Record<string, Record<string, boolean>>) || {};
    const weekData: Array<{
      date: string;
      dayName: string;
      prayers: Record<string, boolean>;
      total: number;
    }> = [];
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateKey = date.toISOString().slice(0, 10);
      
      const dayNames = ["الأحد", "الإثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"];
      const dayName = dayNames[date.getDay()];
      
      const prayers = records[dateKey] || {
        Fajr: false,
        Dhuhr: false,
        Asr: false,
        Maghrib: false,
        Isha: false,
      };
      
      const total = Object.values(prayers).filter(Boolean).length;
      
      weekData.push({
        date: dateKey,
        dayName,
        prayers,
        total,
      });
    }
    
    return weekData;
  });

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
