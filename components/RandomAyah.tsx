"use client";
import React, { useEffect, useState, useRef } from "react";
import { BookOpen, RefreshCw } from "lucide-react";

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
    <div className="bg-card rounded-xl p-3">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold">آية</h3>
          <BookOpen className="text-muted-foreground" />
        </div>
        <button onClick={() => loadRandom()} className="p-1 rounded-md bg-neutral-800 hover:bg-zinc-600 text-sm flex items-center gap-1">
          <span>تحديث</span>
          <RefreshCw size={16} />
        </button>
      </div>

      {loading && !ayah ? (
        <p className="text-xs text-muted">جارٍ التحميل…</p>
      ) : ayah ? (
        <div className="space-y-2">
          <p className="text-right text-base leading-relaxed font-semibold text-foreground">{ayah.arabic}</p>
        </div>
      ) : (
        <p className="text-xs text-muted">لا توجد آية للعرض حالياً.</p>
      )}
    </div>
  );
}
