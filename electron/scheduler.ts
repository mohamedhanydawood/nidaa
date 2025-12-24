import { Notification, nativeImage, app } from "electron";
import { join } from "path";
import { exec } from "child_process";
import {
  type DaySchedule,
  type PrayerKey,
  fetchTodayScheduleByCity,
  msUntil,
  setSafeTimeout,
} from "./prayerService.js";
import { flashTaskbar } from "./window.js";

type SchedulerConfig = {
  city: string;
  country: string;
  method?: number;
  madhab?: number;
  preAlertMinutes?: number; // minutes before prayer for heads-up
  autoPauseAtAdhan?: boolean;
  autoResumeAfterMs?: number | null; // e.g., resume after 7 minutes (adhan duration)
  timeFormat?: "12" | "24";
  notificationsEnabled?: boolean;
};

export class PrayerScheduler {
  private config: SchedulerConfig;
  private schedule: DaySchedule | null = null;
  private timers: Array<NodeJS.Timeout> = [];

  constructor(config: SchedulerConfig) {
    this.config = config;
  }

  async init() {
    await this.refreshSchedule();
    this.planTimers();
    // Re-fetch at midnight
    this.planMidnightRefresh();
  }

  getTodaySchedule(): DaySchedule | null {
    return this.schedule;
  }

  private clearTimers() {
    this.timers.forEach((t) => clearTimeout(t));
    this.timers = [];
  }

  private async refreshSchedule() {
    this.schedule = await fetchTodayScheduleByCity({
      city: this.config.city,
      country: this.config.country,
      method: this.config.method,
      madhab: this.config.madhab,
    });
  }

  private planTimers() {
    if (!this.schedule) return;
    this.clearTimers();

    const now = new Date();
    const entries = Object.entries(this.schedule.timings) as Array<[
      PrayerKey,
      Date
    ]>;

    for (const [key, at] of entries) {
      if (at.getTime() <= now.getTime()) continue;

      // Pre-alert
      if (this.config.preAlertMinutes && this.config.preAlertMinutes > 0) {
        const preAt = new Date(at.getTime() - this.config.preAlertMinutes * 60000);
        if (preAt.getTime() > now.getTime()) {
          const ms = msUntil(preAt);
          const t = setSafeTimeout(() => this.notifyPreAlert(key, at), ms);
          this.timers.push(t);
        }
      }

      // On-time alert + optional auto-pause
      const ms = msUntil(at);
      const t = setSafeTimeout(() => this.onPrayerTime(key), ms);
      this.timers.push(t);
    }
  }

  private planMidnightRefresh() {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(now.getDate() + 1);
    tomorrow.setHours(0, 1, 0, 0); // 00:01
    const t = setSafeTimeout(async () => {
      await this.refreshSchedule();
      this.planTimers();
      this.planMidnightRefresh();
    }, msUntil(tomorrow));
    this.timers.push(t);
  }

  private playSound(soundFile: string) {
    const isDev = process.env.NODE_ENV === "development";
    const soundPath = isDev
      ? join(process.cwd(), "assets", "audio", soundFile)
      : join(process.resourcesPath, "assets", "audio", soundFile);
    
    let command: string;
    
    if (process.platform === "win32") {
      // Windows: Use MediaPlayer directly (much faster than wmplayer.exe)
      const escapedPath = soundPath.replace(/\\/g, '\\\\').replace(/'/g, "''");
      command = `powershell -ExecutionPolicy Bypass -NoProfile -Command "Add-Type -AssemblyName PresentationCore; $player = New-Object System.Windows.Media.MediaPlayer; $player.Open([uri]'${escapedPath}'); $player.Play(); Start-Sleep -Milliseconds 100; while($player.NaturalDuration.HasTimeSpan -eq $false) { Start-Sleep -Milliseconds 50 }; $duration = $player.NaturalDuration.TimeSpan.TotalSeconds; Start-Sleep -Seconds $duration; $player.Stop(); $player.Close()"`;
    } else if (process.platform === "darwin") {
      // macOS: afplay is built-in and reliable
      command = `afplay "${soundPath}"`;
    } else {
      // Linux: Try multiple players in order of preference
      command = `(command -v ffplay >/dev/null 2>&1 && ffplay -nodisp -autoexit -loglevel quiet "${soundPath}") || (command -v mpg123 >/dev/null 2>&1 && mpg123 -q "${soundPath}") || (command -v mplayer >/dev/null 2>&1 && mplayer -really-quiet "${soundPath}") || (command -v cvlc >/dev/null 2>&1 && cvlc --play-and-exit "${soundPath}" 2>/dev/null)`;
    }
    
    exec(command, (error) => {
      if (error) {
        console.error("Error playing sound:", error.message);
      }
    });
  }

  private notifyPreAlert(key: PrayerKey, at: Date) {
    // Check if notifications are enabled
    if (this.config.notificationsEnabled === false) {
      return;
    }
    
    const title = `اقترب وقت صلاة ${this.arKey(key)} (${this.hhmm(at)})`;
    
    // Play custom sound
    this.playSound("pray-time-almost-there.mp3");
    
    // Show notification without default sound
    // On Windows, don't pass icon - it causes two icons to show
    // Windows automatically uses the app icon from AppUserModelId
    if (process.platform === "win32") {
      new Notification({ title, silent: true }).show();
    } else {
      const iconPath = join(app.getAppPath(), "assets", process.platform === "darwin" ? "icon.icns" : "icon.png");
      const icon = nativeImage.createFromPath(iconPath);
      new Notification({ title, silent: true, icon }).show();
    }
  }

  private async onPrayerTime(key: PrayerKey) {
    // Check if notifications are enabled
    if (this.config.notificationsEnabled === false) {
      // Still plan next timers even if notifications are disabled
      this.planTimers();
      return;
    }
    
    const title = `حان الآن موعد صلاة ${this.arKey(key)}`;
    
    // Play adhan sound
    this.playSound("pray-time.mp3");
    
    // Show notification without default sound (we're using custom sound)
    // On Windows, don't pass icon - it causes two icons to show
    if (process.platform === "win32") {
      new Notification({ title, silent: true }).show();
    } else {
      const iconPath = join(app.getAppPath(), "assets", process.platform === "darwin" ? "icon.icns" : "icon.png");
      const icon = nativeImage.createFromPath(iconPath);
      new Notification({ title, silent: true, icon }).show();
    }
    
    // Flash taskbar to draw attention on Windows
    flashTaskbar();
    
    // Auto-pause feature removed per user request

    // After triggering, plan from now again to cover overlaps/late starts
    this.planTimers();
  }

  private arKey(key: PrayerKey): string {
    switch (key) {
      case "Fajr":
        return "الفجر";
      case "Dhuhr":
        return "الظهر";
      case "Asr":
        return "العصر";
      case "Maghrib":
        return "المغرب";
      case "Isha":
        return "العشاء";
      default:
        return String(key);
    }
  }

  private hhmm(d: Date): string {
    const h = d.getHours();
    const m = d.getMinutes().toString().padStart(2, "0");
    
    if (this.config.timeFormat === "12") {
      const period = h >= 12 ? "م" : "ص";
      const h12 = h % 12 || 12;
      return `${h12}:${m} ${period}`;
    }
    
    return `${h.toString().padStart(2, "0")}:${m}`;
  }
}
