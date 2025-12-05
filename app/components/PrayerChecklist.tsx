"use client";

interface Props {
  prayers: {
    Fajr: string;
    Dhuhr: string;
    Asr: string;
    Maghrib: string;
    Isha: string;
  };
  checked: {
    Fajr: boolean;
    Dhuhr: boolean;
    Asr: boolean;
    Maghrib: boolean;
    Isha: boolean;
  };
  onToggle: (prayer: string) => void;
}

const prayerNames: { [key: string]: string } = {
  Fajr: "الفجر",
  Dhuhr: "الظهر",
  Asr: "العصر",
  Maghrib: "المغرب",
  Isha: "العشاء",
};

const prayerIcons: { [key: string]: string } = {
  Fajr: "🌅",
  Dhuhr: "☀️",
  Asr: "🌤️",
  Maghrib: "🌆",
  Isha: "🌙",
};

export default function PrayerChecklist({ prayers, checked, onToggle }: Props) {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
        صلوات اليوم
      </h2>
      <div className="space-y-3">
        {Object.keys(prayers).map((key) => (
          <div
            key={key}
            className={`flex items-center justify-between p-4 rounded-xl transition-all ${
              checked[key as keyof typeof checked]
                ? "bg-green-50 border-2 border-green-400"
                : "bg-gray-50 border-2 border-gray-200"
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="text-3xl">{prayerIcons[key]}</span>
              <div>
                <p className="text-lg font-semibold text-gray-800">
                  {prayerNames[key]}
                </p>
                <p className="text-sm text-gray-500">{prayers[key as keyof typeof prayers]}</p>
              </div>
            </div>
            <button
              onClick={() => onToggle(key)}
              className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                checked[key as keyof typeof checked]
                  ? "bg-green-500 text-white"
                  : "bg-gray-200 text-gray-400 hover:bg-gray-300"
              }`}
            >
              {checked[key as keyof typeof checked] ? "✓" : ""}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
