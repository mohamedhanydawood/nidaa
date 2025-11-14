"use client";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";

type Settings = {
  city: string;
  country: string;
  method: number;
  madhab: number;
  timeFormat?: "12" | "24";
};

type Timings = Record<string, string>;

function parseHHMM(v: string | undefined): Date | null {
  if (!v) return null;
  const hhmm = v.split(" ")[0];
  const [h, m] = hhmm.split(":").map(Number);
  const d = new Date();
  d.setHours(h, m, 0, 0);
  return d;
}

function formatTime(d: Date, fmt: "12" | "24" | undefined) {
  const hh = d.getHours();
  const mm = String(d.getMinutes()).padStart(2, "0");
  if (fmt === "12") {
    const h12 = ((hh + 11) % 12) + 1;
    const ampm = hh < 12 ? "ص" : "م";
    return `${String(h12).padStart(2, "0")}:${mm} ${ampm}`;
  }
  return `${String(hh).padStart(2, "0")}:${mm}`;
}

export default function Home() {
  const [cfg, setCfg] = useState<Settings>({
    city: "Cairo",
    country: "Egypt",
    method: 5,
    madhab: 1,
    timeFormat: "24",
  });
  const [timings, setTimings] = useState<Timings | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const current = await (window as any).electron?.settings?.get?.();
        if (current)
          setCfg({
            city: current.city,
            country: current.country,
            method: current.method,
            madhab: current.madhab,
            timeFormat: current.timeFormat ?? "24",
          });
      } catch {}
    })();
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const url = new URL("https://api.aladhan.com/v1/timingsByCity");
        // Normalize country to English where needed
        const normalizeCountry = (v: string) => {
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
        url.searchParams.set("city", cfg.city);
        url.searchParams.set("country", normalizeCountry(cfg.country));
        url.searchParams.set("method", String(cfg.method));
        // madhab removed from UI; rely on method only for client fetch
        const res = await fetch(url.toString());
        const json = await res.json();
        setTimings(json?.data?.timings ?? null);
      } catch {
        setTimings(null);
      }
    })();
  }, [cfg.city, cfg.country, cfg.method, cfg.madhab]);

  const next = useMemo(() => {
    if (!timings) return null;
    const order = ["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"];
    const now = Date.now();
    for (const k of order) {
      const d = parseHHMM(timings[k]);
      if (d && d.getTime() > now) {
        return { key: k, at: d } as { key: string; at: Date };
      }
    }
    return null;
  }, [timings]);

  const remaining = useMemo(() => {
    if (!next) return null;
    const ms = next.at.getTime() - Date.now();
    if (ms <= 0) return "00:00";
    const mm = Math.floor(ms / 60000);
    const hh = Math.floor(mm / 60);
    const m = mm % 60;
    return `${String(hh).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
  }, [next]);

  return (
    <div
      dir="rtl"
      className="min-h-screen bg-linear-to-b from-zinc-50 to-zinc-100 font-sans text-right dark:from-zinc-900 dark:to-black"
    >
      {/* Top Nav */}
      <nav className="sticky top-0 z-10 border-b border-zinc-200 bg-white/80 backdrop-blur dark:border-zinc-800 dark:bg-zinc-900/70">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
          <div className="flex items-center gap-3">
            <Image
              className="dark:invert"
              src="/electron.svg"
              alt="Logo"
              width={24}
              height={24}
            />
            <span className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
              نداء
            </span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <Link
              href="/"
              className="rounded-md px-3 py-1.5 text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
            >
              الرئيسية
            </Link>
            <Link
              href="/settings"
              className="rounded-md px-3 py-1.5 text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
            >
              الإعدادات
            </Link>
            <Link
              href="#"
              className="rounded-md px-3 py-1.5 text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
            >
              قائمة الصلوات
            </Link>
          </div>
        </div>
      </nav>

      {/* Content */}
      <div className="mx-auto max-w-6xl px-6 py-10">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-black dark:text-white">
              لوحة التحكم
            </h1>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
              تابع وقت الصلاة التالية وتفاصيل اليوم بسرعة.
            </p>
          </div>
          <Link
            href="/settings"
            className="rounded-md bg-black px-4 py-2 text-sm text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
          >
            الإعدادات
          </Link>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {/* Next Prayer Card */}
          <section className="rounded-2xl bg-white p-6 shadow-sm dark:bg-zinc-800 md:col-span-2">
            <h2 className="mb-4 text-lg font-semibold text-black dark:text-white">
              الصلاة القادمة
            </h2>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <div className="text-3xl font-bold text-black dark:text-white">
                  {remaining ?? "—:—"}
                </div>
                <div className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                  الوقت المتبقي
                </div>
              </div>
              <div className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-700">
                <div className="text-sm text-zinc-500 dark:text-zinc-400">
                  تفاصيل
                </div>
                <div className="mt-2 text-sm text-zinc-700 dark:text-zinc-200">
                  الصلاة: {next?.key ?? "—"}
                </div>
                <div className="text-sm text-zinc-700 dark:text-zinc-200">
                  الوقت:{" "}
                  {next?.at ? formatTime(next.at, cfg.timeFormat) : "—:—"}
                </div>
              </div>
            </div>
            <div className="mt-4 flex items-center gap-3">
              <Link
                href="/settings"
                className="rounded-md border border-zinc-300 px-3 py-1.5 text-sm dark:border-zinc-600 dark:text-zinc-200"
              >
                تعديل الإعدادات
              </Link>
              <button
                onClick={() => setCfg({ ...cfg })}
                className="rounded-md border border-zinc-300 px-3 py-1.5 text-sm dark:border-zinc-600 dark:text-zinc-200"
              >
                تحديث الآن
              </button>
            </div>
          </section>

          {/* Quick Actions */}
          <section className="rounded-2xl bg-white p-6 shadow-sm dark:bg-zinc-800">
            <h2 className="mb-4 text-lg font-semibold text-black dark:text-white">
              إجراءات سريعة
            </h2>
            <div className="space-y-3 text-sm">
              <button className="flex w-full items-center justify-between rounded-md border border-zinc-300 px-3 py-2 hover:bg-zinc-50 dark:border-zinc-600 dark:hover:bg-zinc-900">
                <span className="text-zinc-800 dark:text-zinc-200">
                  إيقاف أي صوت الآن
                </span>
                <span className="text-zinc-400">⏸️</span>
              </button>
              <button className="flex w-full items-center justify-between rounded-md border border-zinc-300 px-3 py-2 hover:bg-zinc-50 dark:border-zinc-600 dark:hover:bg-zinc-900">
                <span className="text-zinc-800 dark:text-zinc-200">
                  تفعيل وضع التركيز 10 دقائق
                </span>
                <span className="text-zinc-400">🌙</span>
              </button>
            </div>
          </section>
        </div>

        {/* Today prayers list placeholder */}
        <section className="mt-6 rounded-2xl bg-white p-6 shadow-sm dark:bg-zinc-800">
          <h2 className="mb-4 text-lg font-semibold text-black dark:text-white">
            مواقيت اليوم
          </h2>
          <div className="grid gap-3 sm:grid-cols-5">
            {(() => {
              const mapping: Array<[string, string | undefined]> = [
                ["الفجر", timings?.Fajr as string | undefined],
                ["الظهر", timings?.Dhuhr as string | undefined],
                ["العصر", timings?.Asr as string | undefined],
                ["المغرب", timings?.Maghrib as string | undefined],
                ["العشاء", timings?.Isha as string | undefined],
              ];
              return mapping.map(([name, t], i) => (
                <div
                  key={i}
                  className="rounded-lg border border-zinc-200 p-4 text-center text-sm dark:border-zinc-700"
                >
                  <div className="mb-1 font-semibold text-zinc-900 dark:text-zinc-100">
                    {name}
                  </div>
                  <div className="text-zinc-600 dark:text-zinc-400">
                    {t
                      ? (() => {
                          const d = parseHHMM(t);
                          return d ? formatTime(d, cfg.timeFormat) : t;
                        })()
                      : "—:—"}
                  </div>
                </div>
              ));
            })()}
          </div>
        </section>
      </div>
    </div>
  );
}
