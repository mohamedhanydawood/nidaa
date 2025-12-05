import { Notification } from "electron";
import {
  type DaySchedule,
  type PrayerKey,
  fetchTodayScheduleByCity,
  msUntil,
  setSafeTimeout,
} from "./prayerService.js";

type SchedulerConfig = {
  city: string;
  country: string;
  method?: number;
  madhab?: number;
  preAlertMinutes?: number; // minutes before prayer for heads-up
  autoPauseAtAdhan?: boolean;
  autoResumeAfterMs?: number | null; // e.g., resume after 7 minutes (adhan duration)
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

  private notifyPreAlert(key: PrayerKey, at: Date) {
    const title = "نداء";
    const body = `اقترب وقت صلاة ${this.arKey(key)} (${this.hhmm(at)})`;
    new Notification({ title, body, silent: true }).show();
  }

  private async onPrayerTime(key: PrayerKey) {
    const title = "نداء";
    const body = `حان الآن موعد صلاة ${this.arKey(key)}`;
    new Notification({ title, body, silent: false }).show();
    
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
    const h = d.getHours().toString().padStart(2, "0");
    const m = d.getMinutes().toString().padStart(2, "0");
    return `${h}:${m}`;
  }
}
