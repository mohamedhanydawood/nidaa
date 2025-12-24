"use client";

import Image from "next/image";
import { Home, Heart, Settings } from "lucide-react"; // استخدم الأيقونات اللازمة فقط
import { usePathname } from "next/navigation";

export default function Header() {
        return (
            <nav className="md:flex w-18 h-screen bg-card border-l border-border/10 flex flex-col items-center py-8 fixed right-0 top-0 z-50">
            {/* الجزء العلوي: اللوجو والاسم */}
            <div className="flex flex-col items-center gap-4 flex-1">
                <div className="relative group">
                    {/* <div className="absolute -inset-1 bg-linear-to-r from-amber-500 to-orange-600 rounded-full blur opacity-25 group-hover:opacity-50 transition duration-1000"></div> */}
                    <Image
                        src="/icon.png"
                        alt="Nidaa Logo"
                        width={40}
                        height={40}
                        className="relative"
                    />
                </div>
                <div className="text-center">
                    {/* <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-linear-to-b from-white to-gray-400">
                        نداء
                    </h1>
                    <p className="text-[10px] text-muted-foreground tracking-widest uppercase mt-1">
                        NIDAA APP
                    </p> */}
                </div>

                {/* خط فاصل أنيق */}
                <div className="w-full h-px bg-linear-to-r from-transparent via-white/10 to-transparent my-4" />

                {/* قائمة التنقل (Navigation) */}
                    <nav className="flex-1 flex flex-col gap-3 w-full px-2">
                        {/** compute active based on pathname */}
                        <NavItemsWrapper />
                    </nav>
            </div>

            {/* الجزء السفلي: الإعدادات */}
            <div className="flex flex-col gap-4 items-center">
                <a
                    href={process.env.NODE_ENV === "development" ? "/settings" : "settings.html"}
                    title="الإعدادات"
                    aria-label="الإعدادات"
                    className="flex items-center justify-center w-12 h-12 rounded-xl bg-card-hover hover:bg-white/5 transition-all duration-300"
                >
                    <Settings size={18} className="transition-transform group-hover:rotate-90" />
                </a>
            </div>
        </nav>
    );
}

    // مكون فرعي للأزرار لسهولة التعديل
function NavItem({ icon, label, href, active = false }: { icon: React.ReactNode; label: string; href?: string; active?: boolean }) {
    const handleClick = () => {
        if (!href) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            try { (window as any).toast?.("ستتوفر قريبا"); } catch {}
            return;
        }
        window.location.href = href;
    };

    return (
        <button
            onClick={handleClick}
            title={label}
            aria-label={label}
            className={`relative flex flex-col items-center justify-center w-full py-2 rounded-xl transition-all duration-200 group ${active ? "text-amber-500" : "text-muted-foreground hover:text-foreground"}`}>
            {active && <span className="absolute -right-2 top-1/2 -translate-y-1/2 h-9 w-1 rounded-r-full bg-amber-500" />}
            <div className="relative z-10">
                {icon}
            </div>
            <span className={`mt-1 text-[11px] ${active ? "text-amber-500" : "text-muted-foreground"}`}>{label}</span>
        </button>
    );
}

// wrapper to use the pathname hook inside the header's nav
function NavItemsWrapper() {
    const pathname = usePathname();

    return (
        <>
            <NavItem icon={<Home size={20} />} label="الرئيسية" href="/" active={pathname === "/"} />
            {/* <NavItem icon={<BookOpen size={20} />} label="المصحف" href="/quran" active={pathname === "/quran"} /> */}
            {/* <NavItem icon={<Heart size={20} />} label="الأذكار" href="/athkar" active={pathname === "/athkar"} /> */}
            {/* <NavItem icon={<Compass size={20} />} label="القبلة" href="/qibla" active={pathname === "/qibla"} /> */}
        </>
    );
}
