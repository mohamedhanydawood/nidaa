"use client";
import React, { useEffect, useState, useRef } from "react";
import { BookOpen, RefreshCw } from "lucide-react";
import { useLanguage } from "../lib/LanguageProvider";
import { useTranslation } from "../lib/useTranslation";

type Ayah = { reference: string; arabic?: string; translation?: string };

async function fetchAyahByNumber(num: number): Promise<Ayah> {
  const ref = String(num);
  const url = `https://api.alquran.cloud/v1/ayah/${encodeURIComponent(ref)}/editions/quran-uthmani,en.sahih`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch ayah");
  const json = await res.json();
  const dataArr = Array.isArray(json.data) ? json.data : [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const arabic = dataArr.find((d: any) => d.edition?.identifier?.startsWith("quran"))?.text || "";
//   const translation = dataArr.find((d: any) => d.edition?.identifier?.startsWith("en"))?.text || "";
  const surahNum = dataArr[0]?.surah?.number;
  const numberInSurah = dataArr[0]?.numberInSurah;
  const reference = surahNum && numberInSurah ? `${surahNum}:${numberInSurah}` : ref;
  return { reference, arabic };
}

function getRandomAyahNumber() {
  return Math.floor(Math.random() * 6236) + 1;
}

export default function RandomAyah(): React.JSX.Element {
  const [ayah, setAyah] = useState<Ayah | null>(null);
  const [loading, setLoading] = useState(false);
  const intervalRef = useRef<number | null>(null);
  const { language } = useLanguage();
  const isRTL = language === "ar";
  const { t } = useTranslation("athkar");
  const { t: tCommon } = useTranslation("common");

  const loadRandom = async () => {
    setLoading(true);
    try {
      const num = getRandomAyahNumber();
      const data = await fetchAyahByNumber(num);
      setAyah(data);
    } catch (err) {
      console.debug("RandomAyah fetch error", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let mounted = true;
    loadRandom();
    intervalRef.current = window.setInterval(() => {
      if (mounted) loadRandom();
    }, 60 * 1000);

    return () => {
      mounted = false;
      if (intervalRef.current) clearInterval(intervalRef.current as number);
    };
  }, []);

  return (
    <div className="bg-card rounded-xl p-3" dir={isRTL ? "rtl" : "ltr"}>
      <div className={`flex items-center justify-between ${isRTL ? "flex-row" : ""} mb-2`}>
        <div className={`flex items-center gap-2 ${isRTL ? "flex-row" : ""}`}>
          <h3 className="text-sm font-semibold">{t("randomAyah")}</h3>
          <BookOpen className="text-muted-foreground" />
        </div>
        <button onClick={() => loadRandom()} className={`p-1 rounded-md bg-neutral-800 hover:bg-zinc-600 text-sm flex items-center gap-1 ${isRTL ? "flex-row" : ""}`}>
          <span>{tCommon("refresh")}</span>
          <RefreshCw size={16} />
        </button>
      </div>

      {loading && !ayah ? (
        <p className={`text-xs text-muted ${isRTL ? "text-right" : "text-left"}`}>{tCommon("loading")}</p>
      ) : ayah ? (
        <div className="space-y-2">
          <p className={`text-base leading-relaxed font-semibold text-foreground ${isRTL ? "text-right" : "text-left"}`}>{ayah.arabic}</p>
        </div>
      ) : (
        <p className={`text-xs text-muted ${isRTL ? "text-right" : "text-left"}`}>{t("noAyah")}</p>
      )}
    </div>
  );
}
