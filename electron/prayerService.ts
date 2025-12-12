import { setTimeout as setNodeTimeout } from "node:timers";

type PrayerTimings = {
  Fajr: string;
  Dhuhr: string;
  Asr: string;
  Maghrib: string;
  Isha: string;
  Sunrise?: string;
};

export type PrayerKey = 'Fajr' | 'Dhuhr' | 'Asr' | 'Maghrib' | 'Isha';

export type DaySchedule = {
  dateISO: string;
  timings: Record<PrayerKey, Date>;
  sunrise?: Date;
  hijri?: {
    day: string;
    month: {
      en: string;
      ar: string;
      number: number;
    };
    year: string;
    weekday: {
      en: string;
      ar: string;
    };
  };
  meta?: {
    timezone?: string;
    [key: string]: unknown;
  }; // API meta object
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

  // Retry logic with increased timeout
  let lastError: Error | null = null;
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 seconds timeout
      
      const res = await fetch(api, { 
        cache: "no-store",
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (!res.ok) {
        throw new Error(`Aladhan API error ${res.status}`);
      }
      
      // Success! Break retry loop
      lastError = null;
      
      const json = (await res.json()) as any;
      return parsePrayerResponse(json);
    } catch (error) {
      lastError = error as Error;
      console.error(`[Prayer API] Attempt ${attempt}/3 failed:`, error);
      
      if (attempt < 3) {
        // Wait before retry (exponential backoff)
        const delay = attempt * 2000; // 2s, 4s
        console.log(`[Prayer API] Retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  // All retries failed
  throw lastError || new Error("Failed to fetch prayer times after 3 attempts");
}

function parsePrayerResponse(json: any): DaySchedule {
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
  
  // Extract Sunrise
  const sunrise = timings.Sunrise
    ? parseTimeToDate(timings.Sunrise, metaTzOffset)
    : undefined;
  
  // Extract Hijri date
  const hijri = json?.data?.date?.hijri
    ? {
        day: json.data.date.hijri.day,
        month: {
          en: json.data.date.hijri.month.en,
          ar: json.data.date.hijri.month.ar,
          number: json.data.date.hijri.month.number,
        },
        year: json.data.date.hijri.year,
        weekday: {
          en: json.data.date.hijri.weekday.en,
          ar: json.data.date.hijri.weekday.ar,
        },
      }
    : undefined;
  
  return { dateISO: todayISO, timings: mapped, sunrise, hijri, meta: json.data.meta };
}

export async function fetchNextPrayer(lat: number, lng: number, date: string, method: number, school: number) {
  const url = `https://api.aladhan.com/v1/nextPrayer/${date}?latitude=${lat}&longitude=${lng}&method=${method}&school=${school}`;
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`Aladhan API error ${res.status}`);
  }
  const json = await res.json();
  const timings = json.data.timings;
  const prayerName = Object.keys(timings)[0];
  const time = timings[prayerName];
  return { name: prayerName, time: parseTimeToDate(time) };
}

function msUntil(d: Date): number {
  return Math.max(0, d.getTime() - Date.now());
}

function setSafeTimeout(fn: () => void, ms: number) {
  // Node's setTimeout with cap for very long durations if needed later
  return setNodeTimeout(fn, ms);
}

export { msUntil, setSafeTimeout };