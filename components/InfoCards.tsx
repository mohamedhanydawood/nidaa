"use client";
import { useEffect, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import { Quote, Star, Info, ChevronRight, ChevronLeft } from "lucide-react";
import { useLanguage } from "../lib/LanguageProvider";

// استيراد ستايلات Swiper
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

type Card = {
    title: string;
    content: string;
    type: string;
};

type HadithResponse = {
    metadata: {
        name: string;
        section: { [key: string]: string };
    };
    hadiths: Array<{
        hadithnumber: number;
        arabicnumber: number;
        text: string;
        grades: string[];
        reference: {
            book: number;
            hadith: number;
        };
    }>;
};

const defaultCards: Card[] = [
    {
        title: "فائدة دينية",
        content: "أجمل شعور التوكل على الله، من فوض أمره لله كفاه كل ما أهمّه.",
        type: "benefit",
    },
    {
        title: "حديث قصير",
        content:
            "قال رسول الله ﷺ: 'كلمتان خفيفتان على اللسان، ثقيلتان في الميزان: سبحان الله وبحمده، سبحان الله العظيم'.",
        type: "hadith",
    },
    {
        title: "سنة مهجورة",
        content:
            "صلاة الضحى: صلاة الأوابين، وهي تجزئ عن صدقة كل مفصل في جسم الإنسان.",
        type: "sunnah",
    },
];

const sunnahCards: Card[] = [
    {
        title: "سنة مهجورة: السواك",
        content: "استخدام السواك عند كل صلاة. قال رسول الله ﷺ: 'لولا أن أشق على أمتي لأمرتهم بالسواك عند كل صلاة'. السواك مطهرة للفم ومرضاة للرب.",
        type: "sunnah",
    },
    {
        title: "سنة مهجورة: صلاة الضحى",
        content: "صلاة الضحى من النوافل المؤكدة، وقتها من ارتفاع الشمس قيد رمح إلى قبيل الزوال. وهي تجزئ عن 360 صدقة في اليوم.",
        type: "sunnah",
    },
    {
        title: "سنة مهجورة: السلام على الصبيان",
        content: "كان النبي ﷺ يسلم على الصبيان إذا مر بهم. السلام على الصغار يزرع المحبة ويعلمهم التواضع والأدب.",
        type: "sunnah",
    },
    {
        title: "سنة مهجورة: قيلولة النهار",
        content: "القيلولة من السنن المهجورة، وهي النوم القصير وسط النهار. قال ﷺ: 'قيلوا فإن الشياطين لا تقيل'.",
        type: "sunnah",
    },
    {
        title: "سنة مهجورة: الأكل بثلاث أصابع",
        content: "كان النبي ﷺ يأكل بثلاث أصابع، ويلعقهن قبل أن يمسحهن. والأكل بثلاث أصابع يقلل من كمية الطعام ويساعد على الاعتدال.",
        type: "sunnah",
    },
];

const benefitCards: Card[] = [
    {
        title: "فائدة دينية: أفضل الذكر",
        content: "أفضل الذكر: لا إله إلا الله. وأفضل الدعاء: الحمد لله. وأحب الكلام إلى الله: سبحان الله، والحمد لله، ولا إله إلا الله، والله أكبر.",
        type: "benefit",
    },
    {
        title: "فائدة دينية: الإخلاص في العمل",
        content: "قليل العمل مع الإخلاص خير من كثير العمل بلا إخلاص. قال تعالى: 'وما أمروا إلا ليعبدوا الله مخلصين له الدين'.",
        type: "benefit",
    },
    {
        title: "فائدة دينية: حفظ اللسان",
        content: "من حفظ لسانه ستر الله عيوبه. ومن كف غضبه أقال الله عثرته. ومن اعتذر إلى الله قبل الله عذره.",
        type: "benefit",
    },
    {
        title: "فائدة دينية: الصدقة الجارية",
        content: "سبع يجري للعبد أجرهن بعد موته: من علم علماً، أو أجرى نهراً، أو حفر بئراً، أو غرس نخلاً، أو بنى مسجداً، أو ورث مصحفاً، أو ترك ولداً يستغفر له.",
        type: "benefit",
    },
    {
        title: "فائدة دينية: التوكل على الله",
        content: "من توكل على الله كفاه. ومن استغفر الله غفر له. ومن تاب إلى الله قبله. إن الله يحب التوابين ويحب المتطهرين.",
        type: "benefit",
    },
];

const InfoCards = () => {
    const [cards, setCards] = useState<Card[]>(defaultCards);
    const { language } = useLanguage();
    const isRTL = language === "ar";

    useEffect(() => {
        const fetchCards = async () => {
            try {
        // Try to fetch random hadiths from Hadith API
        // Bukhari has ~7000 hadiths total
        const randomHadithNumbers = Array.from({ length: 3 }, () =>
          Math.floor(Math.random() * 7000) + 1
        );

        const hadithPromises = randomHadithNumbers.map(async (num) => {
          try {
            const res = await fetch(
              `https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1/editions/ara-bukhari/${num}.json`
            );
            if (!res.ok) throw new Error("Hadith fetch failed");
            const data = (await res.json()) as HadithResponse;
            const hadith = data.hadiths[0];
            if (hadith?.text) {
              return {
                title: `حديث شريف رقم ${hadith.hadithnumber}`,
                content: hadith.text,
                type: "hadith",
              };
            }
            return null;
          } catch {
            return null;
          }
        });

        const fetchedHadiths = (await Promise.all(hadithPromises)).filter(
          (h): h is Card => h !== null
        );

        // Get random Sunnah and Benefit cards
        const randomSunnah = sunnahCards[Math.floor(Math.random() * sunnahCards.length)];
        const randomBenefit = benefitCards[Math.floor(Math.random() * benefitCards.length)];
        const randomBenefit2 = benefitCards[Math.floor(Math.random() * benefitCards.length)];

        // Mix fetched hadiths with Sunnah and benefit cards
        if (fetchedHadiths.length > 0) {
          const mixed = [...fetchedHadiths, randomSunnah, randomBenefit, randomBenefit2];
          setCards(mixed.slice(0, 6));
        } else {
          // Fallback: use default hadiths + random sunnah & benefits
          const mixed = [...defaultCards, randomSunnah, randomBenefit];
          setCards(mixed.slice(0, 6));
        }
      } catch (err) {
        // fallback to defaults
        console.debug("Using default cards data", err);
      }
    };

    fetchCards();
  }, []);

    const renderIcon = (type: string) => {
        switch (type) {
            case "hadith":
                return <Quote size={18} className="text-blue-400" />;
            case "sunnah":
                return <Star size={18} className="text-emerald-400" />;
            case "benefit":
            default:
                return <Info size={18} className="text-amber-500" />;
        }
    };

    return (
        <div className="relative group w-full px-1 py-2" dir={isRTL ? "rtl" : "ltr"}>
            <Swiper
                modules={[Navigation, Pagination, Autoplay]}
                spaceBetween={16}
                slidesPerView={1}
                breakpoints={{
                    640: { slidesPerView: 2 },
                    1024: { slidesPerView: 3 },
                }}
                autoplay={{ delay: 5000 }}
                navigation={{
                    nextEl: ".swiper-button-next-custom",
                    prevEl: ".swiper-button-prev-custom",
                }}
                pagination={{ clickable: true, el: ".swiper-pagination-custom" }}
                className="pb-4"
                dir={isRTL ? "rtl" : "ltr"}
            >
                {cards.map((card, index) => (
                    <SwiperSlide key={`${card.type}-${index}`}>
                        <div className="bg-linear-180 to-b from-yellow-500/10 to-yellow-500/5 border border-white/10 backdrop-blur-md rounded-2xl p-3 h-48 flex flex-col hover:bg-white/10 transition-all duration-300 overflow-hidden">
                            <div className={`flex items-center gap-2 mb-2 shrink-0 ${isRTL ? "flex-row" : ""}`}>
                                <div className="p-1 bg-white/5 rounded-lg">{renderIcon(card.type)}</div>
                                <span className="text-sm font-semibold text-gray-200">{card.title}</span>
                            </div>
                            <div className="overflow-y-auto flex-1 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                                <p className={`text-md text-gray-400 leading-relaxed ${isRTL ? "text-right" : "text-left"}`}>{card.content}</p>
                            </div>
                        </div>
                    </SwiperSlide>
                ))}
            </Swiper>

            {/* أزرار التنقل المخصصة */}
            <button className={`swiper-button-prev-custom absolute ${isRTL ? "right-0" : "left-0"} top-1/2 -translate-y-1/2 z-10 p-2 bg-black/20 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity`}>
                {isRTL ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
            </button>
            <button className={`swiper-button-next-custom absolute ${isRTL ? "left-0" : "right-0"} top-1/2 -translate-y-1/2 z-10 p-2 bg-black/20 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity`}>
                {isRTL ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
            </button>

            {/* النقاط السفلية */}
            <div className="swiper-pagination-custom flex justify-center gap-2 mt-2" />
        </div>
    );
};

export default InfoCards;
