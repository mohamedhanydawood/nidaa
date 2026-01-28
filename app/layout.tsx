import type { Metadata } from "next";
import { IBM_Plex_Sans_Arabic } from "next/font/google";
import UpdateNotifier from "../components/UpdateNotifier";
import { Toaster } from "../components/ui/sonner";
import "./globals.css";
import Header from "../components/Header";
import { LanguageProvider } from "../lib/LanguageProvider";

const ibmPlexArabic = IBM_Plex_Sans_Arabic({
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["arabic"],
  variable: "--font-ibm-plex-arabic",
});

export const metadata: Metadata = {
  title: "نداء",
  description: "تطبيق بسيط لتذكير أوقات الصلاة الإسلامية",
  other: {
    'Content-Security-Policy': [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https:",
      "font-src 'self' data:",
      "connect-src 'self' https://api.aladhan.com",
      "frame-src 'none'",
      "object-src 'none'",
    ].join('; '),
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" suppressHydrationWarning>
      <body className={`${ibmPlexArabic.variable} antialiased relative min-h-screen rtl`}>
        <LanguageProvider>
          <Toaster position="top-center" richColors />
          
          <UpdateNotifier>
            {/* Global header/sidebar */}
            <Header />

            {/* Content wrapper */}
            <div className="relative z-10">
              {children}
            </div>
          </UpdateNotifier>
        </LanguageProvider>
      </body>
    </html>
  );
}
