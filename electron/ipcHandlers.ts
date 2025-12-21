import { ipcMain, BrowserWindow, Notification, nativeImage, app } from "electron";
import { join } from "path";
import * as sound from "sound-play";
import { AppSettings, ARABIC_PRAYER_NAMES, ARABIC_DAY_NAMES } from "./types.js";
import { getSettings, saveSettings, getRecords, saveRecords } from "./store.js";
import { validateSettings, validatePrayerName, normalizeCountryName } from "./validators.js";
import { fetchTodayScheduleByCity } from "./prayerService.js";
import { PrayerScheduler } from "./scheduler.js";
import { checkForUpdates, downloadUpdate, quitAndInstall } from "./autoUpdater.js";

let scheduler: PrayerScheduler | null = null;

async function playSound(soundFile: string) {
  const isDev = process.env.NODE_ENV === "development";
  const soundPath = isDev
    ? join(process.cwd(), "assets", "audio", soundFile)
    : join(process.resourcesPath, "assets", "audio", soundFile);
  
  try {
    // sound-play works on all platforms without external dependencies
    await sound.play(soundPath);
  } catch (error) {
    console.error("Error playing sound:", error);
  }
}

export async function startScheduler(settings: AppSettings) {
  if (scheduler) {
    scheduler = null;
  }
  
  scheduler = new PrayerScheduler({
    city: settings.city,
    country: settings.country,
    method: settings.method,
    madhab: settings.madhab,
    preAlertMinutes: settings.notifyBefore,
    autoPauseAtAdhan: false,
    autoResumeAfterMs: undefined,
    timeFormat: settings.timeFormat,
    notificationsEnabled: settings.notificationsEnabled,
  });
  
  try {
    await scheduler.init();
    console.log("[Electron] Prayer scheduler initialized for", settings.city, settings.country);
  } catch (error) {
    console.error("[Electron] Failed to initialize scheduler:", error);
  }
}

export function registerIpcHandlers(mainWindow: BrowserWindow | null) {
  // App info handlers
  ipcMain.handle("app:version", async () => app.getVersion());
  
  // Settings handlers
  ipcMain.handle("settings:get", async () => getSettings());
  
  ipcMain.handle("settings:set", async (_e, cfg: Partial<AppSettings>) => {
    if (!validateSettings(cfg)) {
      console.error("[Electron] Invalid settings data:", cfg);
      throw new Error("Invalid settings data");
    }
    
    console.log("[Electron] Saving settings:", cfg);
    const current = getSettings();
    const country = normalizeCountryName(cfg.country ?? current.country);
    
    const updated: AppSettings = { 
      ...current, 
      ...cfg,
      country 
    };
    
    // Handle auto-start setting
    if (cfg.autoStart !== undefined) {
      console.log("[Electron] Setting auto-start to:", cfg.autoStart);
      app.setLoginItemSettings({
        openAtLogin: cfg.autoStart,
        path: process.execPath,
      });
      
      // Verify the setting was applied
      const loginSettings = app.getLoginItemSettings();
      console.log("[Electron] Login item settings after update:", loginSettings);
    }
    
    saveSettings(updated);
    await startScheduler(updated);
    
    if (mainWindow) {
      mainWindow.webContents.send("settings:updated", updated);
    }
    
    return updated;
  });

  // Prayer handlers
  ipcMain.handle("prayer:get", async () => {
    const settings = getSettings();
    if (!settings || !settings.city || !settings.country) {
      console.log("[Electron] No settings found, using defaults");
      return null;
    }

    try {
      const schedule = await fetchTodayScheduleByCity({
        city: settings.city,
        country: settings.country,
        method: settings.method || 5,
        madhab: settings.madhab || 1,
      });

      const times: Record<string, string> = {};
      for (const [key, date] of Object.entries(schedule.timings)) {
        const hours = date.getHours().toString().padStart(2, "0");
        const minutes = date.getMinutes().toString().padStart(2, "0");
        times[key] = `${hours}:${minutes}`;
      }

      const now = new Date();
      const todayKey = now.toISOString().slice(0, 10);

      const entries = Object.entries(schedule.timings) as Array<[string, Date]>;
      const upcoming = entries
        .filter(([, at]) => at.getTime() > now.getTime())
        .sort((a, b) => a[1].getTime() - b[1].getTime());

      let nextPrayer;
      if (upcoming.length > 0) {
        const [key, time] = upcoming[0];
        nextPrayer = {
          name: ARABIC_PRAYER_NAMES[key] || key,
          englishName: key,
          time: `${time.getHours().toString().padStart(2, '0')}:${time.getMinutes().toString().padStart(2, '0')}`,
        };
      } else {
        nextPrayer = {
          name: "الفجر",
          englishName: "Fajr",
          time: times.Fajr || "05:00",
        };
      }

      const records = getRecords();
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
    } catch (error) {
      console.error("Error fetching prayer data:", error);
      if (scheduler) {
        const schedule = scheduler.getTodaySchedule();
        if (schedule) {
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
            nextPrayer = {
              name: ARABIC_PRAYER_NAMES[key] || key,
              englishName: key,
              time: times[key],
            };
          }

          const todayKey = new Date().toISOString().slice(0, 10);
          const records = getRecords();
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
    if (!validatePrayerName(prayerName)) {
      throw new Error("Invalid prayer name");
    }
    
    const todayKey = new Date().toISOString().slice(0, 10);
    const records = getRecords();
    
    if (!records[todayKey]) {
      records[todayKey] = {
        Fajr: false,
        Dhuhr: false,
        Asr: false,
        Maghrib: false,
        Isha: false,
      };
    }
    
    records[todayKey][prayerName] = !records[todayKey][prayerName];
    saveRecords(records);
    console.log("Prayer marked:", prayerName, records[todayKey][prayerName]);
    
    if (mainWindow) {
      mainWindow.webContents.send("prayer:marked", {
        prayerName,
        done: records[todayKey][prayerName],
      });
    }
    
    return true;
  });

  // Statistics handler
  ipcMain.handle("statistics:get", async () => {
    const records = getRecords();
    
    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;
    
    const sortedDates = Object.keys(records).sort();
    
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

  // Week records handler
  ipcMain.handle("records:getWeek", async () => {
    const records = getRecords();
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
      
      const dayName = ARABIC_DAY_NAMES[date.getDay()];
      
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

  // Test notifications
  ipcMain.handle("notification:testPreAlert", async () => {
    const settings = getSettings();
    const now = new Date();
    const h = now.getHours();
    const m = now.getMinutes().toString().padStart(2, "0");
    
    let timeStr: string;
    if (settings.timeFormat === "12") {
      const period = h >= 12 ? "م" : "ص";
      const h12 = h % 12 || 12;
      timeStr = `${h12}:${m} ${period}`;
    } else {
      timeStr = `${h.toString().padStart(2, "0")}:${m}`;
    }
    
    const title = `اقترب وقت صلاة الظهر (${timeStr})`;
    
    // Play custom sound
    playSound("pray-time-almost-there.mp3");
    
    // On Windows, don't pass icon - it causes two icons to show
    // Windows automatically uses the app icon from AppUserModelId
    if (process.platform === "win32") {
      new Notification({ title, silent: true }).show();
    } else {
      const iconPath = join(app.getAppPath(), "assets", process.platform === "darwin" ? "icon.icns" : "icon.png");
      const icon = nativeImage.createFromPath(iconPath);
      new Notification({ title, silent: true, icon }).show();
    }
  });

  ipcMain.handle("notification:testAdhan", async () => {
    const title = "حان الآن موعد صلاة الظهر";
    
    // Play adhan sound
    playSound("pray-time.mp3");
    
    // On Windows, don't pass icon - it causes two icons to show
    if (process.platform === "win32") {
      new Notification({ title, silent: true }).show();
    } else {
      const iconPath = join(app.getAppPath(), "assets", process.platform === "darwin" ? "icon.icns" : "icon.png");
      const icon = nativeImage.createFromPath(iconPath);
      new Notification({ title, silent: true, icon }).show();
    }
  });

  // Auto-update handlers
  ipcMain.handle("update:check", async () => {
    if (mainWindow) {
      checkForUpdates(mainWindow, true);
    }
  });

  ipcMain.handle("update:download", async () => {
    downloadUpdate();
  });

  ipcMain.handle("update:install", async () => {
    quitAndInstall();
  });
}

export { scheduler };
