import { Spinner } from "@/components/ui/spinner";
import { useLanguage } from "../lib/LanguageProvider";

type UpdateInfo = {
  available: boolean;
  version: string;
  downloaded: boolean;
  downloading: boolean;
  downloadProgress: number;
};

type UpdateBannerProps = {
  updateInfo: UpdateInfo | null;
};

export default function UpdateBanner({ updateInfo }: UpdateBannerProps) {
  const { language } = useLanguage();
  const isRTL = language === "ar";
  
  if (!updateInfo?.available) return null;

  if (updateInfo.downloaded) {
    return (
      <div className="col-span-1 md:col-span-12">
        <div className="bg-green-600 text-white rounded-lg p-4 flex items-center justify-between shadow-lg animate-pulse" dir={isRTL ? "rtl" : "ltr"}>
          <div className={`flex items-center gap-3 ${isRTL ? "flex-row" : ""}`}>
            <span className="text-2xl">✅</span>
            <div>
              <p className="font-semibold">تم تحميل التحديث {updateInfo.version}</p>
              <p className="text-sm opacity-90">جاري إعادة التشغيل...</p>
            </div>
          </div>
          <div className="animate-spin text-2xl">⚙️</div>
        </div>
      </div>
    );
  }

  if (updateInfo.downloading) {
    return (
      <div className="col-span-1 md:col-span-12">
        <div className="bg-blue-600 text-white rounded-lg p-4 shadow-lg" dir={isRTL ? "rtl" : "ltr"}>
          <div className="flex items-center justify-between mb-3">
            <div className={`flex items-center gap-3 ${isRTL ? "flex-row" : ""}`}>
              <Spinner />
              <div>
                <p className="font-semibold">جاري تحميل التحديث {updateInfo.version}</p>
                <p className="text-sm opacity-90">{updateInfo.downloadProgress}% مكتمل</p>
              </div>
            </div>
          </div>
          <div className="w-full bg-blue-800 rounded-full h-3 overflow-hidden">
            <div
              className="bg-white h-full transition-all duration-300 ease-out"
              style={{ width: `${updateInfo.downloadProgress}%` }}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="col-span-1 md:col-span-12">
      <div className="bg-yellow-600 text-white rounded-lg p-4 flex items-center justify-between shadow-lg" dir={isRTL ? "rtl" : "ltr"}>
        <div className={`flex items-center gap-3 ${isRTL ? "flex-row" : ""}`}>
          <span className="text-2xl">⚠️</span>
          <div>
            <p className="font-semibold">تحديث جديد متاح</p>
            <p className="text-sm opacity-90">الإصدار {updateInfo.version} جاهز للتحميل</p>
          </div>
        </div>
        <button
          onClick={() => window.electron?.downloadUpdate()}
          className="px-4 py-2 bg-white text-yellow-600 rounded-md font-semibold hover:bg-gray-100 transition-colors"
        >
          تحميل الآن
        </button>
      </div>
    </div>
  );
}
