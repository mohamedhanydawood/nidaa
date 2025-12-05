"use client";
import { useState, useEffect } from "react";

interface Props {
  nextPrayer: {
    name: string;
    time: string;
  };
}

export default function CountdownTimer({ nextPrayer }: Props) {
  const [countdown, setCountdown] = useState("");

  useEffect(() => {
    const updateCountdown = () => {
      const [hours, minutes] = nextPrayer.time.split(":").map(Number);
      const prayerTime = new Date();
      prayerTime.setHours(hours, minutes, 0, 0);

      const now = new Date();
      const diff = prayerTime.getTime() - now.getTime();

      if (diff > 0) {
        const h = Math.floor(diff / (1000 * 60 * 60));
        const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        setCountdown(`${h} ساعة و ${m} دقيقة`);
      } else {
        setCountdown("حان الآن");
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 60000); // كل دقيقة

    return () => clearInterval(interval);
  }, [nextPrayer.time]);

  return (
    <div className="bg-linear-to-br from-indigo-500 to-purple-600 rounded-3xl shadow-xl p-8 text-center text-white">
      <h2 className="text-lg opacity-90 mb-2">الصلاة القادمة</h2>
      <h1 className="text-5xl font-bold mb-4">{nextPrayer.name}</h1>
      <p className="text-4xl font-light mb-2">{nextPrayer.time}</p>
      <p className="text-lg opacity-80">باقي {countdown}</p>
    </div>
  );
}
