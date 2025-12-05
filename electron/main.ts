import { app, BrowserWindow, ipcMain } from "electron";
import { PrayerScheduler } from "./scheduler.js";
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
    if (!scheduler) return null;
    
    const schedule = scheduler.getTodaySchedule();
    if (!schedule) return null;

    // تحويل الأوقات إلى HH:MM
    const times: Record<string, string> = {};
    for (const [key, date] of Object.entries(schedule.timings)) {
      const hours = date.getHours().toString().padStart(2, "0");
      const minutes = date.getMinutes().toString().padStart(2, "0");
      times[key] = `${hours}:${minutes}`;
    }

    // البحث عن الصلاة القادمة
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

    return {
      times,
      nextPrayer,
      todayRecord,
    };
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

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
