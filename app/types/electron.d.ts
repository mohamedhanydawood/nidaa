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
      
      // Statistics
      getStatistics: () => Promise<Statistics>;
      getWeekRecords: () => Promise<WeekRecord[]>;
      
      // Test notifications
      testPreAlertNotification: () => Promise<void>;
      testAdhanNotification: () => Promise<void>;
      
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
  guideCompleted?: boolean;
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
  sunrise?: string;
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
}

export interface Statistics {
  currentStreak: number;
  longestStreak: number;
  commitmentPercentage: number;
}

export interface WeekRecord {
  date: string;
  dayName: string;
  prayers: {
    Fajr: boolean;
    Dhuhr: boolean;
    Asr: boolean;
    Maghrib: boolean;
    Isha: boolean;
  };
  total: number;
}



