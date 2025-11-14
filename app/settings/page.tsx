"use client";

import { useEffect, useState } from "react";

type Settings = {
  city: string;
  country: string;
  method: number;
  madhab: number;
  preAlertMinutes: number;
  autoPauseAtAdhan: boolean;
  autoResumeAfterMs: number | null;
  timeFormat?: "12" | "24";
};

const methods: Array<{ id: number; name: string }> = [
  { id: 5, name: "Egyptian General Authority of Survey" },
  { id: 2, name: "Islamic Society of North America" },
  { id: 3, name: "Muslim World League" },
  { id: 4, name: "Umm Al-Qura University, Makkah" },
  { id: 1, name: "University of Islamic Sciences, Karachi" },
];

const countries: Array<{ code: string; name: string; cities: string[] }> = [
  {
    code: "EG",
    name: "مصر",
    cities: ["Cairo", "Alexandria", "Giza", "Mansoura"],
  },
  {
    code: "SA",
    name: "السعودية",
    cities: ["Makkah", "Madinah", "Riyadh", "Jeddah"],
  },
  { code: "AE", name: "الإمارات", cities: ["Dubai", "Abu Dhabi", "Sharjah"] },
  { code: "TR", name: "تركيا", cities: ["Istanbul", "Ankara", "Konya"] },
];

export default function SettingsPage() {
  const [cfg, setCfg] = useState<Settings | null>({
    city: "Cairo",
    country: "Egypt",
    method: 5,
    madhab: 1,
    preAlertMinutes: 5,
    autoPauseAtAdhan: true,
    autoResumeAfterMs: 7 * 60 * 1000,
    timeFormat: "24",
  });
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<number | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const current = await (window as any).electron?.settings?.get?.();
        if (current) setCfg(current);
      } catch {
        // stay with defaults if Electron bridge not present
      }
    })();
  }, []);

  if (!cfg) {
    return (
      <div className="p-6 text-zinc-700 dark:text-zinc-200">
        تحميل الإعدادات…
      </div>
    );
  }

  async function save() {
    setSaving(true);
    try {
      const bridge = (window as any).electron?.settings;
      try {
        const next = await bridge?.set?.(cfg);
        if (!next) throw new Error("no-bridge");
        setCfg(next ?? cfg);
        setSavedAt(Date.now());
      } catch {
        alert("ميزة الحفظ تعمل داخل تطبيق سطح المكتب فقط.");
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      dir="rtl"
      className="min-h-screen bg-linear-to-b from-zinc-50 to-zinc-100 p-6 text-right dark:from-zinc-900 dark:to-black"
    >
      <div className="mx-auto max-w-3xl rounded-2xl bg-white p-6 shadow-sm dark:bg-zinc-800">
        <div className="mb-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-black dark:text-white">
            الإعدادات
          </h1>
          <button
            onClick={() => history.back()}
            className="rounded-md border border-zinc-300 px-3 py-1.5 text-sm dark:border-zinc-600 dark:text-zinc-200"
          >
            رجوع
          </button>
        </div>

        <div className="grid gap-4">
          <div className="grid gap-2">
            <label className="text-sm text-zinc-600 dark:text-zinc-300">
              الدولة
            </label>
            <select
              className="rounded-md border border-zinc-300 p-2 dark:border-zinc-600 dark:bg-zinc-900"
              value={cfg.country}
              onChange={(e) => {
                const country = e.target.value;
                const defCity =
                  countries.find(
                    (c) => c.name === country || c.code === country
                  )?.cities?.[0] ?? cfg.city;
                setCfg({ ...cfg, country, city: defCity });
              }}
            >
              {countries.map((c) => (
                <option key={c.code} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div className="grid gap-2">
            <label className="text-sm text-zinc-600 dark:text-zinc-300">
              المدينة
            </label>
            <select
              className="rounded-md border border-zinc-300 p-2 dark:border-zinc-600 dark:bg-zinc-900"
              value={cfg.city}
              onChange={(e) => setCfg({ ...cfg, city: e.target.value })}
            >
              {(
                countries.find(
                  (c) => c.name === cfg.country || c.code === cfg.country
                )?.cities || [cfg.city]
              ).map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
          </div>
          <div className="grid gap-2">
            <label className="text-sm text-zinc-600 dark:text-zinc-300">
              طريقة الحساب
            </label>
            <select
              className="rounded-md border border-zinc-300 p-2 dark:border-zinc-600 dark:bg-zinc-900"
              value={cfg.method}
              onChange={(e) =>
                setCfg({ ...cfg, method: Number(e.target.value) })
              }
            >
              {methods.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </select>
          </div>
          <div className="grid gap-2">
            <label className="text-sm text-zinc-600 dark:text-zinc-300">
              عرض الوقت
            </label>
            <select
              className="rounded-md border border-zinc-300 p-2 dark:border-zinc-600 dark:bg-zinc-900"
              value={cfg.timeFormat ?? "24"}
              onChange={(e) =>
                setCfg({ ...cfg, timeFormat: e.target.value as any })
              }
            >
              <option value="24">24 ساعة</option>
              <option value="12">12 ساعة</option>
            </select>
          </div>
          <div className="grid gap-2">
            <label className="text-sm text-zinc-600 dark:text-zinc-300">
              تنبيه قبلي (دقائق)
            </label>
            <input
              type="number"
              className="rounded-md border border-zinc-300 p-2 dark:border-zinc-600 dark:bg-zinc-900"
              value={cfg.preAlertMinutes}
              onChange={(e) =>
                setCfg({ ...cfg, preAlertMinutes: Number(e.target.value) })
              }
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              id="autoPause"
              type="checkbox"
              checked={cfg.autoPauseAtAdhan}
              onChange={(e) =>
                setCfg({ ...cfg, autoPauseAtAdhan: e.target.checked })
              }
            />
            <label
              htmlFor="autoPause"
              className="text-sm text-zinc-600 dark:text-zinc-300"
            >
              إيقاف أي صوت تلقائيًا عند الأذان
            </label>
          </div>
          <div className="grid gap-2">
            <label className="text-sm text-zinc-600 dark:text-zinc-300">
              استئناف بعد (ثواني) اختياري
            </label>
            <input
              type="number"
              className="rounded-md border border-zinc-300 p-2 dark:border-zinc-600 dark:bg-zinc-900"
              value={
                cfg.autoResumeAfterMs
                  ? Math.round(cfg.autoResumeAfterMs / 1000)
                  : 0
              }
              onChange={(e) => {
                const sec = Number(e.target.value);
                setCfg({
                  ...cfg,
                  autoResumeAfterMs: sec > 0 ? sec * 1000 : null,
                });
              }}
            />
          </div>
        </div>

        <div className="mt-6 flex items-center gap-3">
          <button
            className="rounded-md bg-black px-4 py-2 text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
            onClick={save}
            disabled={saving}
          >
            {saving ? "يحفظ…" : "حفظ"}
          </button>
          {savedAt && (
            <span className="text-sm text-green-600 dark:text-green-400">
              تم الحفظ
            </span>
          )}
          {!savedAt && (
            <span className="text-sm text-zinc-500 dark:text-zinc-400">
              ستُطبَّق الإعدادات فورًا على الجدولة
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
