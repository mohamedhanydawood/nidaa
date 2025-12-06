import { AppSettings, ALLOWED_PRAYERS } from "./types.js";

export function validateSettings(cfg: Partial<AppSettings>): boolean {
  if (cfg.method !== undefined && (cfg.method < 0 || cfg.method > 23)) return false;
  if (cfg.madhab !== undefined && cfg.madhab !== 0 && cfg.madhab !== 1) return false;
  if (cfg.notifyBefore !== undefined && (cfg.notifyBefore < 0 || cfg.notifyBefore > 60)) return false;
  if (cfg.timeFormat !== undefined && cfg.timeFormat !== "12" && cfg.timeFormat !== "24") return false;
  return true;
}

export function validatePrayerName(name: string): boolean {
  return ALLOWED_PRAYERS.includes(name);
}

export function normalizeCountryName(country: string): string {
  const mappings: Record<string, string> = {
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
  
  return mappings[country] || country;
}
