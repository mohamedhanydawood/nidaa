"use client";

import { useLanguage } from "@/lib/LanguageProvider";

export default function GuidePage() {
  const { language } = useLanguage();
  const isRTL = language === "ar";

  function handleStart() {
    // Mark guide as completed and go to home
    if (window.electron?.updateSettings) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      window.electron.updateSettings({ guideCompleted: true } as any);
    }
    window.location.href = process.env.NODE_ENV === "development" ? "/" : "index.html";
  }

  return (
    <div dir={isRTL ? "rtl" : "ltr"} className="h-screen text-foreground flex flex-col bg-linear-to-br from-background via-background to-accent/5">

      {/* Content */}
      <main className="flex-1 overflow-y-auto p-4 md:p-6">
        <div className=" mx-auto">
          <div className="bg-card rounded-xl p-6 md:p-10 shadow-xl">
            
            {/* Welcome Message */}
            <div className="text-center mb-8">
              <p className="text-xl text-muted mb-6">خطوتين بسيطة للبدء</p>
            </div>

            <div className="grid md:grid-cols-2 gap-6 mb-8">
              {/* Step 1: Settings */}
              <div className="bg-accent/10 border-2 border-accent/30 rounded-xl p-6">
                <div className="text-center mb-4">
                  <span className="text-5xl">⚙️</span>
                  <h3 className="text-xl font-bold mt-3 mb-2">1. اضبط موقعك</h3>
                </div>
                <ol className="space-y-3 text-right mr-4">
                  <li className="flex items-start gap-2">
                    <span className="text-accent font-bold">•</span>
                    <span>افتح <strong>الإعدادات</strong> من الزر أعلى الشاشة</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-accent font-bold">•</span>
                    <span>اختر <strong>دولتك ومدينتك</strong></span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-accent font-bold">•</span>
                    <span>اختر <strong>طريقة الحساب</strong> المناسبة</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-accent font-bold">•</span>
                    <span>احفظ الإعدادات ✅</span>
                  </li>
                </ol>
              </div>

              {/* Step 2: Auto-start */}
              <div className="bg-green-500/10 border-2 border-green-500/30 rounded-xl p-6">
                <div className="text-center mb-4">
                  <span className="text-5xl">🚀</span>
                  <h3 className="text-xl font-bold mt-3 mb-2">2. البدء التلقائي</h3>
                </div>
                <div className="space-y-4">
                  <div>
                    <p className="font-semibold mb-2 text-green-600">Windows:</p>
                    <ol className="space-y-2 text-right mr-4 text-sm">
                      <li>1. اضغط <kbd className="px-2 py-0.5 bg-card-hover rounded text-xs">Win + R</kbd></li>
                      <li>2. اكتب: <code className="px-2 py-0.5 bg-card-hover rounded text-xs">shell:startup</code></li>
                      <li>3. انسخ اختصار نداء للمجلد</li>
                    </ol>
                  </div>
                  <div>
                    <p className="font-semibold mb-2 text-blue-600">Linux:</p>
                    <p className="text-sm text-muted mr-4">افتح Startup Applications وأضف التطبيق</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Important Notes */}
            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-5 mb-8">
              <p className="font-semibold mb-3 flex items-center gap-2">
                <span>⚠️</span>
                <span>نصائح مهمة:</span>
              </p>
              <ul className="space-y-2 mr-6 text-sm">
                <li className="flex items-start gap-2">
                  <span>•</span>
                  <span>تأكد من تفعيل <strong>الإشعارات</strong> في إعدادات Windows</span>
                </li>
                <li className="flex items-start gap-2">
                  <span>•</span>
                  <span>إيقاف وضع <strong>&quot;عدم الإزعاج&quot;</strong> أوقات الصلاة</span>
                </li>
                <li className="flex items-start gap-2">
                  <span>•</span>
                  <span>التطبيق يعمل في الخلفية - ابحث عن أيقونة نداء في <strong>System Tray</strong></span>
                </li>
              </ul>
            </div>

            {/* CTA Button */}
            <div className="text-center">
              <button
                onClick={handleStart}
                className="px-12 py-4 bg-accent hover:bg-accent/90 text-white text-lg font-bold rounded-xl transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                ابدأ الآن 
              </button>
              <p className="text-sm text-muted mt-4">تقبل الله منا ومنكم صالح الأعمال 🤲</p>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}
