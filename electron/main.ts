import { app, BrowserWindow, ipcMain } from "electron";
import { PrayerScheduler } from "./scheduler.js";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

type AppSettings = {
  city: string;
  country: string;
  method: number;
  madhab: number;
  preAlertMinutes: number;
  autoPauseAtAdhan: boolean;
  autoResumeAfterMs: number | null;
  timeFormat?: "12" | "24";
};

const defaultSettings: AppSettings = {
  city: "Cairo",
  country: "Egypt",
  method: 5,
  madhab: 1,
  preAlertMinutes: 5,
  autoPauseAtAdhan: true,
  autoResumeAfterMs: 7 * 60 * 1000,
  timeFormat: "24",
};

let currentSettings: AppSettings = { ...defaultSettings };
let scheduler: PrayerScheduler | null = null;

function startScheduler() {
  scheduler = new PrayerScheduler({
    city: currentSettings.city,
    country: currentSettings.country,
    method: currentSettings.method,
    madhab: currentSettings.madhab,
    preAlertMinutes: currentSettings.preAlertMinutes,
    autoPauseAtAdhan: currentSettings.autoPauseAtAdhan,
    autoResumeAfterMs: currentSettings.autoResumeAfterMs ?? undefined,
  });
  scheduler.init().catch(() => {});
}

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
    },
  });

  const startUrl =
    process.env.NODE_ENV === "development"
      ? "http://localhost:3000"
      : `file://${path.join(__dirname, "../out/index.html")}`;

  win.loadURL(startUrl);
}

app.whenReady().then(() => {
  createWindow();
  startScheduler();

  ipcMain.handle("settings:get", async () => currentSettings);
  ipcMain.handle("settings:set", async (_e, cfg: Partial<AppSettings>) => {
    // Normalize some fields coming from UI dropdowns (Arabic names to API-friendly)
    const normalizeCountry = (v: string | undefined) => {
      switch (v) {
        case "مصر":
          return "Egypt";
        case "السعودية":
          return "Saudi Arabia";
        case "الإمارات":
          return "United Arab Emirates";
        case "تركيا":
          return "Turkey";
        default:
          return v;
      }
    };
    currentSettings = {
      ...currentSettings,
      ...cfg,
      country: normalizeCountry(cfg.country ?? currentSettings.country)!,
    };
    console.log("[settings:set]", currentSettings);
    startScheduler();
    return currentSettings;
  });

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
