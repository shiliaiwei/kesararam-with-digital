"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { logoutAction } from "@/app/actions/auth";

interface NavItem {
  label: string;
  href: string;
}

const adminNav: NavItem[] = [
  { label: "Users", href: "/admin/users" },
  { label: "Content", href: "/admin/content" },
  { label: "Media", href: "/admin/media" },
  { label: "Logs", href: "/admin/logs" },
];

const teacherNav: NavItem[] = [
  { label: "Classes", href: "/teacher/classes" },
  { label: "Sessions", href: "/teacher/sessions" },
];

export function DashboardNav({ role }: { role: "admin" | "teacher" }) {
  const pathname = usePathname();
  const items = role === "admin" ? adminNav : teacherNav;
  const accentColor = role === "admin" ? "bg-[#fda4af]0" : "bg-blue-500";

  return (
    <header className="w-full border-b-2 border-black bg-white px-6 py-3 flex items-center gap-6">
      <div className="flex items-center gap-2 mr-4">
        <div
          className={`w-3 h-3 rounded-full ${accentColor} border-2 border-black`}
        />
        <span className="font-black text-sm uppercase tracking-widest">
          Kesararam With Digital {role}
        </span>
      </div>

      <nav className="flex items-center gap-1 flex-1">
        {items.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`px-3 py-1.5 text-sm font-bold border-2 border-black rounded-lg transition-all duration-75 ${
                active
                  ? "bg-yellow-400 shadow-[3px_3px_0_#000]"
                  : "bg-white hover:bg-yellow-50 hover:shadow-[2px_2px_0_#000]"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      <form action={logoutAction}>
        <button
          type="submit"
          className="px-3 py-1.5 text-sm font-bold border-2 border-black rounded-lg bg-white hover:bg-[#fda4af] hover:shadow-[4px_4px_0_#000] transition-all duration-75"
        >
          Sign Out
        </button>
      </form>
    </header>
  );
}
