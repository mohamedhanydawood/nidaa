"use client";

import { useEffect, useState, useContext, useRef, useCallback } from "react";
import { toast } from "sonner";
import { useTranslation } from "@/lib/useTranslation";
import { LanguageContext } from "@/lib/LanguageProvider";

type Settings = {
  city: string;
  country: string;
  method: number;
  madhab: number;
  notifyBefore: number;
  timeFormat: "12" | "24";
  notificationsEnabled: boolean;
  autoStart: boolean;
  language: "ar" | "en";
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
  const { t } = useTranslation("settings");
  const { t: tCommon } = useTranslation("common");
  const languageContext = useContext(LanguageContext);
  const language = languageContext?.language || "ar";
  const isRTL = language === "ar";

  const [cfg, setCfg] = useState<Settings>({
    city: "",
    country: "",
    method: 5,
    madhab: 1,
    notifyBefore: 5,
    timeFormat: "12",
    notificationsEnabled: true,
    autoStart: true,
    language: "ar",
  });
  const [saving, setSaving] = useState(false);
  const [appVersion, setAppVersion] = useState<string>("");
  const [checkingUpdate, setCheckingUpdate] = useState(false);
  const isMounted = useRef(false);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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
            country: displayCountry,
            language: settings.language || "ar"
          });
        }
        
        // Get app version from Electron
        if (window.electron?.getAppVersion) {
          const version = await window.electron.getAppVersion();
          setAppVersion(version);
        }
      } catch {
        console.log("Using defaults");
      } finally {
        // Mark as mounted after initial load
        setTimeout(() => {
          isMounted.current = true;
        }, 100);
      }
    };
    fetchSettings();
  }, []);

  // Save function with useCallback to memoize it
  const save = useCallback(async () => {
    // Validate required fields
    if (!cfg.country || !cfg.city) {
      toast.error(t("messages.saveError"), {
        description: tCommon("selectLocation"),
      });
      return;
    }
    
    setSaving(true);
    console.log("Saving settings...", cfg);
    try {
      if (window.electron?.updateSettings) {
        const result = await window.electron.updateSettings(cfg);
        console.log("Settings saved successfully:", result);
        
        // Success message with notification status
        const notificationStatus = cfg.notificationsEnabled 
          ? `✓ ${t("appSettings.notifications")}` 
          : `${t("appSettings.notifications")} ${tCommon("disabled")}`;
        
        toast.success(t("messages.saveSuccess"), {
          description: `${notificationStatus}`,
          duration: 3000,
        });
      } else {
        console.error("window.electron.updateSettings is not available");
        toast.error(t("messages.saveError"), {
          description: tCommon("webMode"),
        });
      }
    } catch (error) {
      console.error("Error saving settings:", error);
      toast.error(t("messages.saveError"));
    } finally {
      setSaving(false);
    }
  }, [cfg, t, tCommon]);

  // Auto-save effect with debouncing
  useEffect(() => {
    // Skip saving on initial mount and if required fields are missing
    if (!isMounted.current || !cfg.country || !cfg.city) {
      return;
    }

    // Clear any existing timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // Set new timeout for auto-save (500ms debounce)
    saveTimeoutRef.current = setTimeout(() => {
      save();
    }, 500);

    // Cleanup on unmount
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cfg]); // Only re-run when cfg changes (save is intentionally not a dependency to avoid infinite loop)

  const handleCheckForUpdates = async () => {
    if (!window.electron?.checkForUpdates) {
      toast.error(tCommon("webMode"));
      return;
    }

    setCheckingUpdate(true);
    toast.info(t("updateCheck.checking"));

    try {
      // Set up one-time listeners for update check result
      const updateAvailablePromise = new Promise<boolean>((resolve) => {
        const availableHandler = () => {
          resolve(true);
        };
        const notAvailableHandler = () => {
          resolve(false);
        };
        
        window.electron?.onUpdateAvailable(availableHandler);
        window.electron?.onUpdateNotAvailable(notAvailableHandler);
        
        // Timeout after 30 seconds
        setTimeout(() => resolve(false), 30000);
      });

      // Trigger update check
      await window.electron.checkForUpdates();

      // Wait for result
      const updateAvailable = await updateAvailablePromise;

      if (updateAvailable) {
        toast.success(t("updateCheck.available"));
      } else {
        toast.success(t("updateCheck.upToDate"), {
          description: `${tCommon("version")} ${appVersion}`,
        });
      }
    } catch (error) {
      console.error("Error checking for updates:", error);
      toast.error(t("updateCheck.error"));
    } finally {
      setCheckingUpdate(false);
    }
  };

  return (
    <div dir={isRTL ? "rtl" : "ltr"} className="h-screen text-foreground flex flex-col">
      {/* Header moved to global layout */}

      {/* Content */}
      <main className="flex-1 overflow-y-auto p-4 md:p-6">
        <div className="max-w-2xl mx-auto space-y-4">
          {/* Country */}
          <div className="bg-card p-4 rounded-lg">
            <label className="block text-sm font-semibold text-muted mb-2">{t("location.country")}</label>
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
                {t("location.selectCountry")}
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
            <label className="block text-sm font-semibold text-muted mb-2">{t("location.city")}</label>
            <select
              className="w-full p-2 bg-card-hover/20 border border-border rounded-md text-foreground focus:ring-2 focus:ring-accent focus:outline-none mb-2 [&>option]:bg-card [&>option]:text-foreground"
              value={cfg.city}
              onChange={(e) => {
                const value = e.target.value;
                setCfg({ ...cfg, city: value });
              }}
            >
              <option value="" disabled className="bg-card text-muted">
                {t("location.selectCity")}
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
            <label className="block text-sm font-semibold text-muted mb-2">{t("prayerSettings.calculationMethod")}</label>
            <select
              className="w-full p-2 bg-card-hover/20 border border-border rounded-md text-foreground focus:ring-2 focus:ring-accent focus:outline-none [&>option]:bg-card [&>option]:text-foreground"
              value={cfg.method}
              onChange={(e) => setCfg({ ...cfg, method: Number(e.target.value) })}
            >
              <option value="" disabled className="bg-card text-muted">
                {t("prayerSettings.calculationMethod")}
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
              {t("prayerSettings.notifyBefore")}
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
            <label className="block text-sm font-semibold text-muted mb-2">{t("prayerSettings.timeFormat")}</label>
            <div className={`flex gap-4 ${isRTL ? "flex-row" : ""}`}>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="timeFormat"
                  value="24"
                  checked={cfg.timeFormat === "24"}
                  onChange={(e) => setCfg({ ...cfg, timeFormat: e.target.value as "24" })}
                  className="w-4 h-4"
                />
                <span>{t("prayerSettings.hour24")}</span>
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
                <span>{t("prayerSettings.hour12")}</span>
              </label>
            </div>
          </div>

          {/* Notifications Toggle */}
          <div className="bg-card p-4 rounded-lg">
            <div className={`flex items-center justify-between mb-2 ${isRTL ? "flex-row" : ""}`}>
              <div>
                <label className="block text-sm font-semibold text-muted mb-1">{t("appSettings.notifications")}</label>
                <p className="text-xs text-muted">{tCommon("prayerNotifications")}</p>
              </div>
              <button
                onClick={() => {
                  const newValue = !cfg.notificationsEnabled;
                  setCfg({ ...cfg, notificationsEnabled: newValue });
                  if (newValue) {
                    toast.success(`✓ ${t("appSettings.notifications")}`, {
                      description: tCommon("notificationsEnabled"),
                      duration: 2500,
                    });
                  } else {
                    toast.info(t("appSettings.notifications"), {
                      description: tCommon("notificationsDisabled"),
                      duration: 2500,
                    });
                  }
                }}
                className={`relative w-14 h-7 rounded-full transition-colors ${
                  cfg.notificationsEnabled ? "bg-green-600" : "bg-red-600"
                }`}
              >
                <div
                  className={`absolute top-0.5 w-6 h-6 bg-white rounded-full shadow-md transition-transform ${
                    cfg.notificationsEnabled ? (isRTL ? "left-0.5" : "right-0.5") : (isRTL ? "left-7" : "right-7")
                  }`}
                />
              </button>
            </div>
            {cfg.notificationsEnabled && (
              <div className={`flex items-center gap-2 text-xs text-green-600 dark:text-green-400 bg-green-900/20 px-3 py-2 rounded-md ${isRTL ? "flex-row" : ""}`}>
                <span>✓</span>
                <span>{t("appSettings.notifications")}</span>
              </div>
            )}
          </div>

          {/* Auto-start Toggle */}
          <div className="bg-card p-4 rounded-lg">
            <div className={`flex items-center justify-between mb-2 ${isRTL ? "flex-row" : ""}`}>
              <div>
                <label className="block text-sm font-semibold text-muted mb-1">{t("appSettings.autoStart")}</label>
                <p className="text-xs text-muted">{tCommon("autoStartDescription")}</p>
              </div>
              <button
                onClick={() => {
                  const newValue = !cfg.autoStart;
                  setCfg({ ...cfg, autoStart: newValue });
                  if (newValue) {
                    toast.success(`✓ ${t("appSettings.autoStart")}`, {
                      description: tCommon("autoStartEnabled"),
                      duration: 2500,
                    });
                  } else {
                    toast.info(t("appSettings.autoStart"), {
                      description: tCommon("autoStartDisabled"),
                      duration: 2500,
                    });
                  }
                }}
                className={`relative w-14 h-7 rounded-full transition-colors ${
                  cfg.autoStart ? "bg-green-600" : "bg-gray-400"
                }`}
              >
                <div
                  className={`absolute top-0.5 w-6 h-6 bg-white rounded-full shadow-md transition-transform ${
                    cfg.autoStart ? (isRTL ? "left-0.5" : "right-0.5") : (isRTL ? "left-7" : "right-7")
                  }`}
                />
              </button>
            </div>
            {cfg.autoStart && (
              <div className={`flex items-center gap-2 text-xs text-green-600 dark:text-green-400 bg-green-900/20 px-3 py-2 rounded-md ${isRTL ? "flex-row" : ""}`}>
                <span>✓</span>
                <span>{tCommon("autoStartEnabled")}</span>
              </div>
            )}
          </div>

          {/* Language Selector */}
          <div className="bg-card p-4 rounded-lg">
            <label className="block text-sm font-semibold text-muted mb-3">{t("appSettings.language")}</label>
            <div className={`grid grid-cols-2 gap-3 ${isRTL ? "flex flex-row" : ""}`}>
              <button
                onClick={() => {
                  setCfg({ ...cfg, language: "ar" });
                  toast.success(`✓ ${t("appSettings.arabic")}`);
                }}
                className={`px-4 py-2 rounded-lg transition-all ${
                  cfg.language === "ar"
                    ? "bg-amber-500 text-white"
                    : "bg-card-hover hover:bg-white/5"
                }`}
              >
                {t("appSettings.arabic")}
              </button>
              <button
                onClick={() => {
                  setCfg({ ...cfg, language: "en" });
                  toast.success(`✓ ${t("appSettings.english")}`);
                }}
                className={`px-4 py-2 rounded-lg transition-all ${
                  cfg.language === "en"
                    ? "bg-amber-500 text-white"
                    : "bg-card-hover hover:bg-white/5"
                }`}
              >
                {t("appSettings.english")}
              </button>
            </div>
          </div>

          {/* Test Notifications */}
          <div className="bg-card p-4 rounded-lg">
            <label className="block text-sm font-semibold text-muted mb-3">{t("testNotifications.title")}</label>
            {!cfg.notificationsEnabled && (
              <div className="mb-3 text-xs text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20 px-3 py-2 rounded-md">
                ⚠️ {tCommon("notificationsDisabled")}
              </div>
            )}
            <div className={`flex flex-col sm:flex-row gap-3 ${isRTL ? "sm:flex-row" : ""}`}>
              <button
                onClick={async () => {
                  if (!cfg.notificationsEnabled) {
                    toast.warning(tCommon("enableNotificationsFirst"));
                    return;
                  }
                  if (window.electron?.testPreAlertNotification) {
                    await window.electron.testPreAlertNotification();
                    toast.info(t("testNotifications.preAlert"));
                  } else {
                    toast.error(tCommon("webMode"));
                  }
                }}
                disabled={!cfg.notificationsEnabled}
                className={`px-4 py-2 rounded-md transition-colors text-sm ${
                  cfg.notificationsEnabled 
                    ? "bg-card-hover hover:bg-input cursor-pointer" 
                    : "bg-muted/50 cursor-not-allowed opacity-60"
                }`}
              >
                🔔 {t("testNotifications.preAlert")}
              </button>
              <button
                onClick={async () => {
                  if (!cfg.notificationsEnabled) {
                    toast.warning(tCommon("enableNotificationsFirst"));
                    return;
                  }
                  if (window.electron?.testAdhanNotification) {
                    await window.electron.testAdhanNotification();
                    toast.info(t("testNotifications.adhan"));
                  } else {
                    toast.error(tCommon("webMode"));
                  }
                }}
                disabled={!cfg.notificationsEnabled}
                className={`px-4 py-2 rounded-md transition-colors text-sm ${
                  cfg.notificationsEnabled 
                    ? "bg-card-hover hover:bg-input cursor-pointer" 
                    : "bg-muted/50 cursor-not-allowed opacity-60"
                }`}
              >
                📢 {t("testNotifications.adhan")}
              </button>
            </div>
          </div>

          {/* Auto-save indicator - subtle */}
          {saving && (
            <div className="bg-card p-3 rounded-lg text-center">
              <p className="text-xs text-muted">{tCommon("saving")}</p>
            </div>
          )}

          {/* Version Info & Updates */}
          <div className="bg-card p-4 rounded-lg">
            <label className="block text-sm font-semibold text-muted mb-3">{t("updateCheck.title")}</label>
            <div className="text-center mb-3">
              <p className="text-xs text-muted mb-1">{tCommon("appDescription")}</p>
              <p className="text-sm font-semibold text-foreground">
                {tCommon("version")} {appVersion || "1.0.0"}
              </p>
            </div>
            <button
              onClick={handleCheckForUpdates}
              disabled={checkingUpdate}
              className={`w-full px-4 py-2 rounded-md transition-all text-sm font-medium ${
                checkingUpdate
                  ? "bg-muted/50 cursor-not-allowed opacity-60"
                  : "bg-accent hover:bg-accent/90 cursor-pointer"
              }`}
            >
              {checkingUpdate ? (
                <span className={`flex items-center justify-center gap-2 ${isRTL ? "flex-row-reverse" : ""}`}>
                  <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {t("updateCheck.checking")}
                </span>
              ) : (
                <span className={`flex items-center justify-center gap-2 ${isRTL ? "flex-row-reverse" : ""}`}>
                  🔄 {t("updateCheck.button")}
                </span>
              )}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
