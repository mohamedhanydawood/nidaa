import type { Metadata } from "next";
import { IBM_Plex_Sans_Arabic } from "next/font/google";
import "./globals.css";

const ibmPlexArabic = IBM_Plex_Sans_Arabic({
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["arabic"],
  variable: "--font-ibm-plex-arabic",
});

export const metadata: Metadata = {
  title: "نداء",
  description: "تطبيق بسيط لتذكير أوقات الصلاة الإسلامية",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl">
      <body className={`${ibmPlexArabic.variable} antialiased relative min-h-screen`}>

        {/* Content wrapper */}
        <div className="relative z-10">
          <img
            src="/background.jpg"
            alt="Header Background"
            width={1920}
            height={200}
            className="absolute top-0 left-0 w-full h-full object-cover z-[-1] opacity-0 pointer-events-none "
          />
          {children}
        </div>
      </body>
    </html>
  );
}
