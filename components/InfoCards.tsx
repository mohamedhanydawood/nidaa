"use client";
import { useEffect, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import { Quote, Star, Info, ChevronRight, ChevronLeft } from "lucide-react";

// استيراد ستايلات Swiper
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

type Card = {
    title: string;
    content: string;
    type: string;
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

const InfoCards = () => {
    const [cards, setCards] = useState<Card[]>(defaultCards);

    useEffect(() => {
        const fetchCards = async () => {
            try {
                const res = await fetch("/cards.json");
                if (!res.ok) throw new Error("cards.json not found");
                const data = (await res.json()) as Card[];
                if (Array.isArray(data) && data.length > 0) setCards(data);
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
        <div className="relative group w-full px-1 py-2">
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
            >
                {cards.map((card, index) => (
                    <SwiperSlide key={index}>
                        <div className="bg-linear-180 to-b from-yellow-500/10 to-yellow-500/5 border border-white/10 backdrop-blur-md rounded-2xl p-2 h-28 flex flex-col justify-between hover:bg-white/10 transition-all duration-300">
                            <div className="flex items-center gap-1 mb-0">
                                <div className="p-1 bg-white/5 rounded-lg">{renderIcon(card.type)}</div>
                                <span className="text-base font-semibold text-gray-200">{card.title}</span>
                            </div>
                            <p className="text-sm text-gray-400 leading-tight line-clamp-3">{card.content}</p>
                        </div>
                    </SwiperSlide>
                ))}
            </Swiper>

            {/* أزرار التنقل المخصصة */}
            <button className="swiper-button-prev-custom absolute left-0 top-1/2 -translate-y-1/2 z-10 p-2 bg-black/20 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity">
                <ChevronLeft size={18} />
            </button>
            <button className="swiper-button-next-custom absolute right-0 top-1/2 -translate-y-1/2 z-10 p-2 bg-black/20 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity">
                <ChevronRight size={18} />
            </button>

            {/* النقاط السفلية */}
            <div className="swiper-pagination-custom flex justify-center gap-2 mt-2" />
        </div>
    );
};

export default InfoCards;
