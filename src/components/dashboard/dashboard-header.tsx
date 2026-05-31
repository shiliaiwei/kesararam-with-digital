"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";

const LABEL_MAP: Record<string, string> = {
  admin: "Admin",
  teacher: "Teacher",
  overview: "Overview",
  users: "Users",
  content: "Content",
  media: "Media",
  logs: "Logs",
  classes: "Classes",
  sessions: "Sessions",
  profile: "Profile",
  folders: "Folders",
  categories: "Categories",
};

export function DashboardHeader() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);

  return (
    <header className="bg-white border-b-4 border-black p-6 shadow-[0_4px_0_#000]">
      <div className="flex items-center justify-between">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-yellow-400 border-2 border-black shadow-[2px_2px_0_#000]">
            <Home size={16} className="text-black" />
            <span className="text-xs font-black uppercase tracking-widest text-black">
              Dashboard
            </span>
          </div>
          
          {segments.map((seg, i) => {
            const isLast = i === segments.length - 1;
            const href = "/" + segments.slice(0, i + 1).join("/");
            const label = LABEL_MAP[seg] || seg.charAt(0).toUpperCase() + seg.slice(1);

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

        {/* Status Indicator */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-green-400 border-2 border-black shadow-[2px_2px_0_#000]">
            <div className="w-2 h-2 bg-black animate-pulse" style={{ borderRadius: "0px" }} />
            <span className="text-xs font-black uppercase tracking-widest text-black">
              Online
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
