"use client";

import { useState } from "react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useTranslation } from "../lib/useTranslation";
import { useLanguage } from "../lib/LanguageProvider";

const morningAthkar = [
  { id: 1, text: "أَصْبَحْنَا وَأَصْبَحَ الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ، لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ", count: 1 },
  { id: 2, text: "اللَّهُمَّ بِكَ أَصْبَحْنَا، وَبِكَ أَمْسَيْنَا، وَبِكَ نَحْيَا، وَبِكَ نَمُوتُ، وَإِلَيْكَ النُّشُورُ", count: 1 },
  { id: 3, text: "أَصْبَحْنَا عَلَى فِطْرَةِ الْإِسْلَامِ، وَعَلَى كَلِمَةِ الْإِخْلَاصِ، وَعَلَى دِينِ نَبِيِّنَا مُحَمَّدٍ صَلَّى اللَّهُ عَلَيْهِ وَسَلَّمَ، وَعَلَى مِلَّةِ أَبِينَا إِبْرَاهِيمَ حَنِيفًا مُسْلِمًا وَمَا كَانَ مِنَ الْمُشْرِكِينَ", count: 1 },
  { id: 4, text: "سُبْحَانَ اللَّهِ وَبِحَمْدِهِ عَدَدَ خَلْقِهِ، وَرِضَا نَفْسِهِ، وَزِنَةَ عَرْشِهِ، وَمِدَادَ كَلِمَاتِهِ", count: 3 },
  { id: 5, text: "اللَّهُمَّ إِنِّي أَسْأَلُكَ عِلْمًا نَافِعًا، وَرِزْقًا طَيِّبًا، وَعَمَلًا مُتَقَبَّلًا", count: 1 },
  { id: 6, text: "أَسْتَغْفِرُ اللَّهَ وَأَتُوبُ إِلَيْهِ", count: 100 },
  { id: 7, text: "يَا حَيُّ يَا قَيُّومُ بِرَحْمَتِكَ أَسْتَغِيثُ، أَصْلِحْ لِي شَأْنِي كُلَّهُ، وَلَا تَكِلْنِي إِلَى نَفْسِي طَرْفَةَ عَيْنٍ", count: 1 },
  { id: 8, text: "لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ", count: 10 },
];

const eveningAthkar = [
  { id: 1, text: "أَمْسَيْنَا وَأَمْسَى الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ، لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ", count: 1 },
  { id: 2, text: "اللَّهُمَّ بِكَ أَمْسَيْنَا، وَبِكَ أَصْبَحْنَا، وَبِكَ نَحْيَا، وَبِكَ نَمُوتُ، وَإِلَيْكَ الْمَصِيرُ", count: 1 },
  { id: 3, text: "أَمْسَيْنَا عَلَى فِطْرَةِ الْإِسْلَامِ، وَعَلَى كَلِمَةِ الْإِخْلَاصِ، وَعَلَى دِينِ نَبِيِّنَا مُحَمَّدٍ صَلَّى اللَّهُ عَلَيْهِ وَسَلَّمَ، وَعَلَى مِلَّةِ أَبِينَا إِبْرَاهِيمَ حَنِيفًا مُسْلِمًا وَمَا كَانَ مِنَ الْمُشْرِكِينَ", count: 1 },
  { id: 4, text: "سُبْحَانَ اللَّهِ وَبِحَمْدِهِ عَدَدَ خَلْقِهِ، وَرِضَا نَفْسِهِ، وَزِنَةَ عَرْشِهِ، وَمِدَادَ كَلِمَاتِهِ", count: 3 },
  { id: 5, text: "اللَّهُمَّ إِنِّي أَسْأَلُكَ عِلْمًا نَافِعًا، وَرِزْقًا طَيِّبًا، وَعَمَلًا مُتَقَبَّلًا", count: 1 },
  { id: 6, text: "أَسْتَغْفِرُ اللَّهَ وَأَتُوبُ إِلَيْهِ", count: 100 },
  { id: 7, text: "يَا حَيُّ يَا قَيُّومُ بِرَحْمَتِكَ أَسْتَغِيثُ، أَصْلِحْ لِي شَأْنِي كُلَّهُ، وَلَا تَكِلْنِي إِلَى نَفْسِي طَرْفَةَ عَيْنٍ", count: 1 },
  { id: 8, text: "لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ", count: 10 },
];

export default function AthkarSection() {
  const [morningOpen, setMorningOpen] = useState(false);
  const [eveningOpen, setEveningOpen] = useState(false);
  const { t } = useTranslation("athkar");
  const { language } = useLanguage();
  const isRTL = language === "ar";

  return (
    <div className="col-span-1 md:col-span-4 space-y-3" dir={isRTL ? "rtl" : "ltr"}>
      {/* أذكار الصباح */}
      <Collapsible open={morningOpen} onOpenChange={setMorningOpen}>
        <CollapsibleTrigger className="w-full bg-linear-to-r from-amber-500/30 to-orange-500/15 hover:from-amber-500/20 hover:to-orange-500/20 rounded-lg p-4 transition-all">
          <div className={`flex items-center justify-between ${isRTL ? "flex-row" : ""}`}>
            <div className={`flex items-center gap-3 ${isRTL ? "flex-row" : ""}`}>
              <div className={isRTL ? "text-right" : "text-left"}>
                <h3 className="text-base md:text-lg font-semibold text-foreground">{t("morningAthkar")}</h3>
                <p className="text-xs md:text-sm text-muted">{t("morningTime")}</p>
              </div>
            </div>
            <svg
              className={`w-5 h-5 transition-transform ${morningOpen ? "rotate-180" : ""}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </CollapsibleTrigger>
        <CollapsibleContent className="mt-2">
          <div className="bg-card rounded-lg p-4 space-y-3 max-h-96 overflow-y-auto">
            {morningAthkar.map((thikr) => (
              <div
                key={thikr.id}
                className="bg-card-hover p-3 rounded-lg border border-border/50"
              >
                <p className={`text-sm md:text-base leading-relaxed text-foreground mb-2 ${isRTL ? "text-right" : "text-left"}`}>
                  {thikr.text}
                </p>
                <div className={`flex ${isRTL ? "justify-start" : "justify-end"}`}>
                  <span className="text-xs text-muted bg-muted/30 px-2 py-1 rounded-full">
                    {thikr.count === 1 ? t("once") : t("times", { count: thikr.count })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* أذكار المساء */}
      <Collapsible open={eveningOpen} onOpenChange={setEveningOpen}>
        <CollapsibleTrigger className="w-full bg-linear-to-r from-indigo-500/30 to-purple-500/15 hover:from-indigo-500/20 hover:to-purple-500/20 rounded-lg p-4 transition-all">
          <div className={`flex items-center justify-between ${isRTL ? "flex-row" : ""}`}>
            <div className={`flex items-center gap-3 ${isRTL ? "flex-row" : ""}`}>
              <div className={isRTL ? "text-right" : "text-left"}>
                <h3 className="text-base md:text-lg font-semibold text-foreground">{t("eveningAthkar")}</h3>
                <p className="text-xs md:text-sm text-muted">{t("eveningTime")}</p>
              </div>
            </div>
            <svg
              className={`w-5 h-5 transition-transform ${eveningOpen ? "rotate-180" : ""}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </CollapsibleTrigger>
        <CollapsibleContent className="mt-2">
          <div className="bg-card rounded-lg p-4 space-y-3 max-h-96 overflow-y-auto">
            {eveningAthkar.map((thikr) => (
              <div
                key={thikr.id}
                className="bg-card-hover p-3 rounded-lg border border-border/50"
              >
                <p className={`text-sm md:text-base leading-relaxed text-foreground mb-2 ${isRTL ? "text-right" : "text-left"}`}>
                  {thikr.text}
                </p>
                <div className={`flex ${isRTL ? "justify-start" : "justify-end"}`}>
                  <span className="text-xs text-muted bg-muted/30 px-2 py-1 rounded-full">
                    {thikr.count === 1 ? t("once") : t("times", { count: thikr.count })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}
