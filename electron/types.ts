export type AppSettings = {
  city: string;
  country: string;
  method: number;
  madhab: number;
  notifyBefore: number;
  timeFormat: "12" | "24";
};

export const defaultSettings: AppSettings = {
  city: "Cairo",
  country: "Egypt",
  method: 5,
  madhab: 1,
  notifyBefore: 5,
  timeFormat: "24",
};

export const ALLOWED_PRAYERS = ["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"];

export const ARABIC_PRAYER_NAMES: Record<string, string> = {
  Fajr: "الفجر",
  Dhuhr: "الظهر",
  Asr: "العصر",
  Maghrib: "المغرب",
  Isha: "العشاء",
};

export const ARABIC_DAY_NAMES = ["الأحد", "الإثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"];

export const COUNTRY_MAPPINGS: Record<string, string> = {
  "مصر": "Egypt",
  "السعودية": "Saudi Arabia",
  "الإمارات": "United Arab Emirates",
  "الكويت": "Kuwait",
  "قطر": "Qatar",
  "البحرين": "Bahrain",
  "عمان": "Oman",
  "الأردن": "Jordan",
  "لبنان": "Lebanon",
  "سوريا": "Syria",
  "العراق": "Iraq",
  "فلسطين": "Palestine",
  "اليمن": "Yemen",
  "المغرب": "Morocco",
  "الجزائر": "Algeria",
  "تونس": "Tunisia",
  "ليبيا": "Libya",
  "السودان": "Sudan",
};
