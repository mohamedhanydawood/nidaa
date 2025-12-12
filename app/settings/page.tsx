"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { toast } from "sonner";

type Settings = {
  city: string;
  country: string;
  method: number;
  madhab: number;
  notifyBefore: number;
  timeFormat: "12" | "24";
};

const methods: Array<{ id: number; name: string }> = [
  { id: 0, name: "Shia Ithna-Ashari" },
  { id: 1, name: "University of Islamic Sciences, Karachi" },
  { id: 2, name: "Islamic Society of North America (ISNA)" },
  { id: 3, name: "Muslim World League (MWL)" },
  { id: 4, name: "Umm Al-Qura University, Makkah" },
  { id: 5, name: "Egyptian General Authority of Survey" },
  { id: 7, name: "Institute of Geophysics, University of Tehran" },
  { id: 8, name: "Gulf Region" },
  { id: 9, name: "Kuwait" },
  { id: 10, name: "Qatar" },
  { id: 11, name: "Majlis Ugama Islam Singapura, Singapore" },
  { id: 12, name: "Union Organization Islamic de France" },
  { id: 13, name: "Diyanet İşleri Başkanlığı, Turkey" },
  { id: 14, name: "Spiritual Administration of Muslims of Russia" },
  { id: 15, name: "Moonsighting Committee Worldwide" },
  { id: 16, name: "Dubai (unofficial)" },
  { id: 17, name: "Jabatan Kemajuan Islam Malaysia (JAKIM)" },
  { id: 18, name: "Tunisia" },
  { id: 19, name: "Algeria" },
  { id: 20, name: "KEMENAG - Kementerian Agama Republik Indonesia" },
  { id: 21, name: "Morocco" },
  { id: 22, name: "Comunidade Islamica de Lisboa" },
  { id: 23, name: "Ministry of Awqaf, Islamic Affairs and Holy Places, Jordan" },
];

const countries: Array<{ code: string; name: string; cities: string[] }> = [
  { 
    code: "EG", 
    name: "مصر", 
    cities: [
      "Cairo", "Alexandria", "Giza", "Shubra El-Kheima", "Port Said",
      "Suez", "Luxor", "Mansoura", "El-Mahalla El-Kubra", "Tanta",
      "Asyut", "Ismailia", "Faiyum", "Zagazig", "Aswan", "Damietta"
    ] 
  },
  { 
    code: "SA", 
    name: "السعودية", 
    cities: [
      "Riyadh", "Jeddah", "Mecca", "Medina", "Dammam", "Khobar",
      "Tabuk", "Buraydah", "Khamis Mushait", "Hail", "Al-Ahsa",
      "Hofuf", "Jubail", "Dhahran", "Yanbu", "Abha"
    ] 
  },
  { 
    code: "AE", 
    name: "الإمارات", 
    cities: [
      "Dubai", "Abu Dhabi", "Sharjah", "Al Ain", "Ajman",
      "Ras Al Khaimah", "Fujairah", "Umm Al Quwain"
    ] 
  },
  {
    code: "KW",
    name: "الكويت",
    cities: ["Kuwait City", "Al Ahmadi", "Hawally", "Salmiya", "Farwaniya"]
  },
  {
    code: "QA",
    name: "قطر",
    cities: ["Doha", "Al Wakrah", "Al Rayyan", "Umm Salal", "Al Khor"]
  },
  {
    code: "BH",
    name: "البحرين",
    cities: ["Manama", "Muharraq", "Riffa", "Hamad Town", "Isa Town"]
  },
  {
    code: "OM",
    name: "عمان",
    cities: ["Muscat", "Salalah", "Sohar", "Nizwa", "Sur"]
  },
  {
    code: "JO",
    name: "الأردن",
    cities: ["Amman", "Zarqa", "Irbid", "Aqaba", "Madaba", "Salt"]
  },
  {
    code: "LB",
    name: "لبنان",
    cities: ["Beirut", "Tripoli", "Sidon", "Tyre", "Nabatieh", "Zahle"]
  },
  {
    code: "SY",
    name: "سوريا",
    cities: ["Damascus", "Aleppo", "Homs", "Latakia", "Hama", "Deir ez-Zor"]
  },
  {
    code: "IQ",
    name: "العراق",
    cities: ["Baghdad", "Basra", "Mosul", "Erbil", "Najaf", "Karbala", "Sulaymaniyah"]
  },
  {
    code: "PS",
    name: "فلسطين",
    cities: ["Jerusalem", "Gaza", "Ramallah", "Hebron", "Nablus", "Bethlehem"]
  },
  {
    code: "YE",
    name: "اليمن",
    cities: ["Sanaa", "Aden", "Taiz", "Hodeidah", "Ibb", "Mukalla"]
  },
  {
    code: "MA",
    name: "المغرب",
    cities: ["Casablanca", "Rabat", "Fes", "Marrakesh", "Tangier", "Agadir"]
  },
  {
    code: "DZ",
    name: "الجزائر",
    cities: ["Algiers", "Oran", "Constantine", "Batna", "Setif", "Annaba"]
  },
  {
    code: "TN",
    name: "تونس",
    cities: ["Tunis", "Sfax", "Sousse", "Kairouan", "Bizerte", "Gabes"]
  },
  {
    code: "LY",
    name: "ليبيا",
    cities: ["Tripoli", "Benghazi", "Misrata", "Bayda", "Zawiya"]
  },
  {
    code: "SD",
    name: "السودان",
    cities: ["Khartoum", "Omdurman", "Port Sudan", "Kassala", "Nyala"]
  },
];

export default function SettingsPage() {
  const [cfg, setCfg] = useState<Settings>({
    city: "",
    country: "",
    method: 5,
    madhab: 1,
    notifyBefore: 0,
    timeFormat: "12",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        if (window.electron?.getSettings) {
          const settings = await window.electron.getSettings();
          
          // Convert English country names back to Arabic for display
          const countryMappings: Record<string, string> = {
            "Egypt": "مصر",
            "Saudi Arabia": "السعودية",
            "United Arab Emirates": "الإمارات",
            "Kuwait": "الكويت",
            "Qatar": "قطر",
            "Bahrain": "البحرين",
            "Oman": "عمان",
            "Jordan": "الأردن",
            "Lebanon": "لبنان",
            "Syria": "سوريا",
            "Iraq": "العراق",
            "Palestine": "فلسطين",
            "Yemen": "اليمن",
            "Morocco": "المغرب",
            "Algeria": "الجزائر",
            "Tunisia": "تونس",
            "Libya": "ليبيا",
            "Sudan": "السودان",
          };
          
          const displayCountry = countryMappings[settings.country] || settings.country;
          
          setCfg({
            ...settings,
            country: displayCountry
          });
        }
      } catch {
        console.log("Using defaults");
      }
    };
    fetchSettings();
  }, []);

  async function save() {
    // Validate required fields
    if (!cfg.country || !cfg.city) {
      toast.error("الرجاء اختيار الدولة والمدينة");
      return;
    }
    
    setSaving(true);
    console.log("Saving settings...", cfg);
    try {
      if (window.electron?.updateSettings) {
        const result = await window.electron.updateSettings(cfg);
        console.log("Settings saved successfully:", result);
        toast.success("تم حفظ الإعدادات بنجاح", {
          description: "سيتم تطبيق التغييرات فوراً",
          duration: 3000,
        });
      } else {
        console.error("window.electron.updateSettings is not available");
        toast.error("خطأ: التطبيق يعمل في وضع الويب");
      }
    } catch (error) {
      console.error("Error saving settings:", error);
      toast.error("حدث خطأ أثناء الحفظ");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div dir="rtl" className="h-screen text-foreground flex flex-col">
      {/* Header */}
      <header className="bg-card px-4 md:px-6 py-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2 md:gap-3">
          <Image src="/icon.png" alt="Nidaa Logo" width={40} height={40} className="md:w-[50px] md:h-[50px]" />
          <h1 className="text-lg md:text-xl font-bold">نداء - الإعدادات</h1>
        </div>
        <a
          href={process.env.NODE_ENV === "development" ? "/" : "index.html"}
          className="px-3 py-1.5 text-sm rounded-md hover:bg-card-hover transition-colors"
        >
          ← رجوع
        </a>
      </header>

      {/* Content */}
      <main className="flex-1 overflow-y-auto p-4 md:p-6">
        <div className="max-w-2xl mx-auto space-y-4">
          {/* Country */}
          <div className="bg-card p-4 rounded-lg">
            <label className="block text-sm font-semibold text-muted mb-2">الدولة</label>
            <select
              className="w-full p-2 bg-card-hover/20 border border-border rounded-md text-foreground focus:ring-2 focus:ring-accent focus:outline-none [&>option]:bg-card [&>option]:text-foreground"
              value={cfg.country}
              onChange={(e) => {
                const country = e.target.value;
                const defCity = countries.find((c) => c.name === country)?.cities[0] || cfg.city;
                setCfg({ ...cfg, country, city: defCity });
              }}
            >
              <option value="" disabled className="bg-card text-muted">
                اختر دولة
              </option>
              {countries.map((c) => (
                <option key={c.code} value={c.name} className="bg-card text-foreground">
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* City */}
          <div className="bg-card p-4 rounded-lg">
            <label className="block text-sm font-semibold text-muted mb-2">المدينة</label>
            <select
              className="w-full p-2 bg-card-hover/20 border border-border rounded-md text-foreground focus:ring-2 focus:ring-accent focus:outline-none mb-2 [&>option]:bg-card [&>option]:text-foreground"
              value={cfg.city}
              onChange={(e) => {
                const value = e.target.value;
                setCfg({ ...cfg, city: value });
              }}
            >
              <option value="" disabled className="bg-card text-muted">
                اختر مدينة
              </option>
              {(countries.find((c) => c.name === cfg.country)?.cities || []).map((city) => (
                <option key={city} value={city} className="bg-card text-foreground">
                  {city}
                </option>
              ))}
            </select>
          </div>

          {/* Method */}
          <div className="bg-card p-4 rounded-lg">
            <label className="block text-sm font-semibold text-muted mb-2">طريقة الحساب</label>
            <select
              className="w-full p-2 bg-card-hover/20 border border-border rounded-md text-foreground focus:ring-2 focus:ring-accent focus:outline-none [&>option]:bg-card [&>option]:text-foreground"
              value={cfg.method}
              onChange={(e) => setCfg({ ...cfg, method: Number(e.target.value) })}
            >
              <option value="" disabled className="bg-card text-muted">
                اختر طريقة حساب
              </option>
              {methods.map((m) => (
                <option key={m.id} value={m.id} className="bg-card text-foreground">
                  {m.name}
                </option>
              ))}
            </select>
          </div>

          {/* Notify Before */}
          <div className="bg-card p-4 rounded-lg">
            <label className="block text-sm font-semibold text-muted mb-2">
              التنبيه قبل الأذان (بالدقائق)
            </label>
            <input
              type="number"
              min="0"
              max="30"
              className="w-full p-2 bg-card-hover/20 border border-border rounded-md text-foreground focus:ring-2 focus:ring-accent focus:outline-none"
              value={cfg.notifyBefore}
              onChange={(e) => setCfg({ ...cfg, notifyBefore: Number(e.target.value) })}
            />
          </div>

          {/* Time Format */}
          <div className="bg-card p-4 rounded-lg">
            <label className="block text-sm font-semibold text-muted mb-2">صيغة الوقت</label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="timeFormat"
                  value="24"
                  checked={cfg.timeFormat === "24"}
                  onChange={(e) => setCfg({ ...cfg, timeFormat: e.target.value as "24" })}
                  className="w-4 h-4"
                />
                <span>24 ساعة</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="timeFormat"
                  value="12"
                  checked={cfg.timeFormat === "12"}
                  onChange={(e) => setCfg({ ...cfg, timeFormat: e.target.value as "12" })}
                  className="w-4 h-4"
                />
                <span>12 ساعة</span>
              </label>
            </div>
          </div>

          {/* Test Notifications */}
          <div className="bg-card p-4 rounded-lg">
            <label className="block text-sm font-semibold text-muted mb-3">تجربة الإشعارات</label>
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={async () => {
                  if (window.electron?.testPreAlertNotification) {
                    await window.electron.testPreAlertNotification();
                    toast.info("تم إرسال تجربة تنبيه قبل الأذان");
                  } else {
                    toast.error("التطبيق يعمل في وضع الويب");
                  }
                }}
                className="px-4 py-2 bg-card-hover hover:bg-input rounded-md transition-colors text-sm"
              >
                🔔 تجربة تنبيه قبل الأذان
              </button>
              <button
                onClick={async () => {
                  if (window.electron?.testAdhanNotification) {
                    await window.electron.testAdhanNotification();
                    toast.info("تم إرسال تجربة إشعار الأذان");
                  } else {
                    toast.error("التطبيق يعمل في وضع الويب");
                  }
                }}
                className="px-4 py-2 bg-card-hover hover:bg-input rounded-md transition-colors text-sm"
              >
                📢 تجربة إشعار الأذان
              </button>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={save}
              disabled={saving}
              className="px-6 py-2 bg-accent hover:bg-accent rounded-md font-semibold disabled:bg-input transition-colors"
            >
              {saving ? "جاري الحفظ..." : "حفظ"}
            </button>
            <a
              href="index.html"
              className="px-6 py-2 bg-card-hover hover:bg-input rounded-md transition-colors text-center"
            >
              إلغاء
            </a>
          </div>
        </div>
      </main>
    </div>
  );
}
