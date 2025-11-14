import { setTimeout as setNodeTimeout } from "node:timers";

type PrayerTimings = {
  Fajr: string;
  Dhuhr: string;
  Asr: string;
  Maghrib: string;
  Isha: string;
};

export type PrayerKey = keyof PrayerTimings;

export type DaySchedule = {
  dateISO: string;
  timings: Record<PrayerKey, Date>;
};

function parseTimeToDate(timeHHMM: string, tzOffsetMinutes?: number): Date {
  // time format like "05:12" or "05:12 (EET)"
  const hhmm = timeHHMM.split(" ")[0];
  const [h, m] = hhmm.split(":").map(Number);
  const now = new Date();
  const d = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    h,
    m,
    0,
    0
  );
  if (typeof tzOffsetMinutes === "number") {
    // normalize to local TZ by adjusting minutes
    const localOffset = d.getTimezoneOffset();
    const delta = localOffset - tzOffsetMinutes;
    d.setMinutes(d.getMinutes() + delta);
  }
  return d;
}

export async function fetchTodayScheduleByCity(params: {
  city: string;
  country: string;
  method?: number; // calculation method
  madhab?: number; // 0: Shafi, 1: Hanafi
}): Promise<DaySchedule> {
  const { city, country, method = 5, madhab = 1 } = params;
  const api = new URL("https://api.aladhan.com/v1/timingsByCity");
  api.searchParams.set("city", city);
  api.searchParams.set("country", country);
  api.searchParams.set("method", String(method));
  api.searchParams.set("madhab", String(madhab));

  const res = await fetch(api, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`Aladhan API error ${res.status}`);
  }
  const json = (await res.json()) as any;
  const timings: PrayerTimings = json?.data?.timings;
  const metaTzOffset: number | undefined = json?.data?.meta?.timezone
    ? undefined
    : undefined;
  // We rely on local timezone for simplicity in MVP
  const mapped: Record<PrayerKey, Date> = {
    Fajr: parseTimeToDate(timings.Fajr, metaTzOffset),
    Dhuhr: parseTimeToDate(timings.Dhuhr, metaTzOffset),
    Asr: parseTimeToDate(timings.Asr, metaTzOffset),
    Maghrib: parseTimeToDate(timings.Maghrib, metaTzOffset),
    Isha: parseTimeToDate(timings.Isha, metaTzOffset),
  };

  const todayISO = new Date().toISOString().slice(0, 10);
  return { dateISO: todayISO, timings: mapped };
}

export function getNextPrayer(
  now: Date,
  schedule: DaySchedule
): {
  key: PrayerKey | null;
  at: Date | null;
} {
  const entries = Object.entries(schedule.timings) as Array<[PrayerKey, Date]>;
  const upcoming = entries
    .filter(([, at]) => at.getTime() > now.getTime())
    .sort((a, b) => a[1].getTime() - b[1].getTime());
  if (upcoming.length > 0) {
    return { key: upcoming[0][0], at: upcoming[0][1] };
  }
  return { key: null, at: null };
}

export function msUntil(d: Date): number {
  return Math.max(0, d.getTime() - Date.now());
}

export function setSafeTimeout(fn: () => void, ms: number) {
  // Node's setTimeout with cap for very long durations if needed later
  return setNodeTimeout(fn, ms);
}

