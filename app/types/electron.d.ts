export {};

declare global {
  interface Window {
    electron?: {
      // Settings
      getSettings: () => Promise<Settings>;
      updateSettings: (settings: Partial<Settings>) => Promise<Settings>;
      
      // Prayer times
      getPrayerTimes: () => Promise<PrayerTimesData | null>;
      markPrayerDone: (prayerName: string) => Promise<boolean>;
      
      // Events
      onPrayerTimesUpdated: (callback: (data: PrayerTimesData) => void) => void;
      onPrayerMarked: (callback: (data: { prayerName: string; done: boolean }) => void) => void;
    };
  }
}

export interface Settings {
  city: string;
  country: string;
  method: number;
  madhab: number;
  notifyBefore: number;
  timeFormat: "12" | "24";
}

export interface PrayerTimesData {
  times: {
    Fajr: string;
    Dhuhr: string;
    Asr: string;
    Maghrib: string;
    Isha: string;
  };
  nextPrayer: {
    name: string;
    englishName: string;
    time: string;
  };
  todayRecord: {
    Fajr: boolean;
    Dhuhr: boolean;
    Asr: boolean;
    Maghrib: boolean;
    Isha: boolean;
  };
}



