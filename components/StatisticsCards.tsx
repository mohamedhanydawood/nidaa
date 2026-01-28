import { useTranslation } from "../lib/useTranslation";
import { useLanguage } from "../lib/LanguageProvider";

type Statistics = {
  currentStreak: number;
  longestStreak: number;
  commitmentPercentage: number;
};

type PrayerChecked = {
  Fajr: boolean;
  Dhuhr: boolean;
  Asr: boolean;
  Maghrib: boolean;
  Isha: boolean;
};

type StatisticsCardsProps = {
  statistics: Statistics;
  checked: PrayerChecked;
};

export default function StatisticsCards({ statistics, checked }: StatisticsCardsProps) {
  const { t } = useTranslation("stats");
  const { language } = useLanguage();
  const isRTL = language === "ar";
  
  return (
    <div dir={isRTL ? "rtl" : "ltr"}>
      <h2 className="text-sm font-semibold text-muted mb-3">{t("statistics")}</h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-card-hover p-3 md:p-4 rounded-lg text-center">
          <div className="text-2xl md:text-3xl font-bold text-emerald-400">
            {Object.values(checked).filter(Boolean).length}/5
          </div>
          <div className="text-xs md:text-sm text-muted mt-1">{t("todayPrayers")}</div>
        </div>
        <div className="bg-card-hover p-3 md:p-4 rounded-lg text-center">
          <div className="text-2xl md:text-3xl font-bold text-blue-400">{statistics.currentStreak}</div>
          <div className="text-xs md:text-sm text-muted mt-1">{t("consecutiveDays")}</div>
        </div>
        <div className="bg-card-hover p-3 md:p-4 rounded-lg text-center">
          <div className="text-2xl md:text-3xl font-bold text-purple-400">
            {statistics.commitmentPercentage}%
          </div>
          <div className="text-xs md:text-sm text-muted mt-1">{t("commitment")}</div>
        </div>
      </div>
    </div>
  );
}
