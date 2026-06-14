"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { ChevronRight, Home, Menu } from "lucide-react";
import { useLang } from "@/context/lang-context";
import { LangSwitcher } from "@/components/shared/lang-switcher";
import { useMobileNav } from "@/components/dashboard/mobile-nav-context";

const LABEL_MAP: Record<string, { en: string; kh: string }> = {
  admin: { en: "Admin", kh: "អ្នកគ្រប់គ្រង" },
  teacher: { en: "Teacher", kh: "គ្រូ" },
  overview: { en: "Overview", kh: "ទិដ្ឋភាពទូទៅ" },
  users: { en: "Users", kh: "អ្នកប្រើប្រាស់" },
  content: { en: "Content", kh: "មាតិកា" },
  media: { en: "Media", kh: "មេឌៀ" },
  logs: { en: "Logs", kh: "កំណត់ហេតុ" },
  classes: { en: "Classes", kh: "ថ្នាក់រៀន" },
  sessions: { en: "Sessions", kh: "វគ្គផ្ទាល់" },
  profile: { en: "Profile", kh: "ព័ត៌មាន" },
  folders: { en: "Folders", kh: "ថត" },
  categories: { en: "Categories", kh: "ប្រភេទ" },
  host: { en: "Host", kh: "បង្កើត" },
  staff: { en: "Staff", kh: "បុគ្គលិក" },
  subscriptions: { en: "Subscriptions", kh: "សមាជិកភាព" },
  questions: { en: "Questions", kh: "សំណួរ" },
};

export function DashboardHeader() {
  const pathname = usePathname();
  const { lang } = useLang();
  const { toggle } = useMobileNav();
  const kh = lang === "kh";
  const segments = pathname.split("/").filter(Boolean);

  return (
    <header className="bg-white border-b-4 border-black p-4 sm:p-6 shadow-[0_4px_0_#000]">
      <div className="flex items-center justify-between gap-3">
        {/* Mobile menu toggle + Breadcrumb */}
        <div className="flex items-center gap-2 min-w-0 overflow-x-auto no-scrollbar">
          {/* Hamburger — opens the sidebar drawer on mobile only */}
          <button
            type="button"
            onClick={toggle}
            aria-label={kh ? "បើកម៉ឺនុយ" : "Open menu"}
            className="md:hidden flex-shrink-0 w-10 h-10 flex items-center justify-center border-2 border-black bg-yellow-400 text-black shadow-[2px_2px_0_#000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all"
            style={{ borderRadius: "0px" }}
          >
            <Menu size={18} />
          </button>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-yellow-400 border-2 border-black shadow-[2px_2px_0_#000]">
            <Home size={16} className="text-black" />
            <span className="text-xs font-black uppercase tracking-widest text-black">
              {kh ? "ផ្ទាំងគ្រប់គ្រង" : "Dashboard"}
            </span>
          </div>

          {segments.map((seg, i) => {
            const isLast = i === segments.length - 1;
            const href = "/" + segments.slice(0, i + 1).join("/");
            const mapped = LABEL_MAP[seg];
            const label = mapped ? (kh ? mapped.kh : mapped.en) : seg.charAt(0).toUpperCase() + seg.slice(1);

            return (
              <div key={href} className="flex items-center gap-2">
                <ChevronRight size={16} className="text-zinc-400" />
                {!isLast ? (
                  <Link
                    href={href}
                    className="px-2 py-1 text-sm font-bold text-zinc-600 hover:text-black hover:bg-yellow-50 border-2 border-transparent hover:border-black transition-all duration-100"
                    style={{ borderRadius: "0px" }}
                  >
                    {label}
                  </Link>
                ) : (
                  <span className="px-2 py-1 text-sm font-black text-black uppercase tracking-wide">
                    {label}
                  </span>
                )}
              </div>
            );
          })}
        </div>

        {/* Status Indicator & Language Switcher */}
        <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
          <LangSwitcher />
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-green-400 border-2 border-black shadow-[2px_2px_0_#000]">
            <div className="w-2 h-2 bg-black animate-pulse" style={{ borderRadius: "0px" }} />
            <span className="text-xs font-black uppercase tracking-widest text-black font-google-sans">
              {kh ? "អនឡាញ" : "Online"}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
