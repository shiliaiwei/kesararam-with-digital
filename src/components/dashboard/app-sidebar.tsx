"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  Users,
  BookOpen,
  ScrollText,
  School,
  Tv2,
  LogOut,
  Images,
  User,
  Settings,
  Info,
  Pencil,
} from "lucide-react";
import { logoutAction } from "@/app/actions/auth";
import { AvatarDisplay } from "@/components/shared/avatar-display";

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}

const adminNav: NavItem[] = [
  { label: "Users", href: "/admin/users", icon: Users, color: "#3b82f6" },
  { label: "Content", href: "/admin/content", icon: BookOpen, color: "#22c55e" },
  { label: "Media", href: "/admin/media", icon: Images, color: "#a855f7" },
  { label: "Logs", href: "/admin/logs", icon: ScrollText, color: "#f97316" },
];

const teacherNav: NavItem[] = [
  { label: "Classes", href: "/teacher/classes", icon: School, color: "#3b82f6" },
  { label: "Sessions", href: "/teacher/sessions", icon: Tv2, color: "#22c55e" },
];

const profileNav = [
  { label: "View Info", href: "?tab=info", icon: Info, color: "#3b82f6" },
  { label: "Edit Profile", href: "", icon: Pencil, color: "#22c55e" },
  { label: "Settings", href: "?tab=settings", icon: Settings, color: "#f97316" },
];

interface AppSidebarProps {
  role: "admin" | "teacher";
  name: string;
  email: string;
  avatar?: string | null;
}

export function AppSidebar({ role, name, email, avatar }: AppSidebarProps) {
  const pathname = usePathname();
  const navItems = role === "admin" ? adminNav : teacherNav;
  const profileHref = role === "admin" ? "/admin/profile" : "/teacher/profile";
  const roleColor = role === "admin" ? "#ef4444" : "#22c55e";

  function isNavItemActive(href: string) {
    const targetPath = href.split("?")[0];
    return pathname === targetPath || pathname.startsWith(`${targetPath}/`);
  }

  return (
    <div className="w-80 bg-white border-r-4 border-black flex flex-col shadow-[4px_0_0_#000]">
      {/* Header */}
      <div className="border-b-2 border-black p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 border-2 border-black bg-black flex items-center justify-center shadow-[2px_2px_0_#000]">
            <Image
              src="https://raw.githubusercontent.com/kesararam/kesararam/refs/heads/main/brand/lgo.png"
              alt="KWD"
              width={24}
              height={24}
              className="object-contain invert"
              unoptimized
            />
          </div>
          <div>
            <h1 className="text-xl font-black uppercase tracking-tighter text-black">
              KWD
            </h1>
            <p className="text-xs font-bold uppercase tracking-widest text-zinc-500">
              {role} Panel
            </p>
          </div>
        </div>

        {/* User Profile Card */}
        <div className="border-2 border-black bg-white shadow-[3px_3px_0_#000] overflow-hidden">
          <div className="h-1" style={{ backgroundColor: roleColor }} />
          <div className="p-4 flex items-center gap-3">
            <div className="border-2 border-black shadow-[2px_2px_0_#000]">
              <AvatarDisplay avatar={avatar} name={name} size={48} radius={0} />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-black text-sm text-black truncate uppercase">
                {name}
              </h3>
              <p className="text-xs text-zinc-500 font-medium truncate">
                {email}
              </p>
              <span
                className="inline-block px-2 py-0.5 text-[10px] font-black uppercase tracking-widest border border-black mt-1"
                style={{ backgroundColor: roleColor, color: "#ffffff" }}
              >
                {role}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 p-6 space-y-6">
        {/* Profile Section */}
        <div>
          <h2 className="text-xs font-black uppercase tracking-widest text-zinc-500 mb-3">
            Account
          </h2>
          <div className="space-y-2">
            {profileNav.map((item) => {
              const href = item.href ? `${profileHref}${item.href}` : profileHref;
              const isActive = pathname === href || (item.href && pathname.includes(item.href));
              
              return (
                <Link
                  key={item.label}
                  href={href}
                  className={`flex items-center gap-3 p-3 border-2 border-black transition-all duration-100 ${
                    isActive
                      ? "bg-yellow-400 shadow-[3px_3px_0_#000] -translate-x-0.5 -translate-y-0.5"
                      : "bg-white hover:bg-yellow-50 hover:shadow-[2px_2px_0_#000] hover:-translate-x-0.5 hover:-translate-y-0.5"
                  }`}
                  style={{ borderRadius: "0px" }}
                >
                  <div
                    className="w-8 h-8 border-2 border-black flex items-center justify-center shadow-[1px_1px_0_#000]"
                    style={{ backgroundColor: item.color, borderRadius: "0px" }}
                  >
                    <item.icon size={16} className="text-black" />
                  </div>
                  <span className="font-bold text-sm text-black uppercase">
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Platform Section */}
        <div>
          <h2 className="text-xs font-black uppercase tracking-widest text-zinc-500 mb-3">
            Platform
          </h2>
          <div className="space-y-2">
            {navItems.map((item) => {
              const isActive = isNavItemActive(item.href);
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 p-3 border-2 border-black transition-all duration-100 ${
                    isActive
                      ? "bg-yellow-400 shadow-[3px_3px_0_#000] -translate-x-0.5 -translate-y-0.5"
                      : "bg-white hover:bg-yellow-50 hover:shadow-[2px_2px_0_#000] hover:-translate-x-0.5 hover:-translate-y-0.5"
                  }`}
                  style={{ borderRadius: "0px" }}
                >
                  <div
                    className="w-8 h-8 border-2 border-black flex items-center justify-center shadow-[1px_1px_0_#000]"
                    style={{ backgroundColor: item.color, borderRadius: "0px" }}
                  >
                    <item.icon size={16} className="text-black" />
                  </div>
                  <span className="font-bold text-sm text-black uppercase">
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t-2 border-black p-6">
        <form action={logoutAction} className="w-full">
          <button
            type="submit"
            className="w-full flex items-center gap-3 p-3 border-2 border-black bg-white hover:bg-red-50 hover:shadow-[2px_2px_0_#000] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all duration-100"
            style={{ borderRadius: "0px" }}
          >
            <div className="w-8 h-8 border-2 border-black bg-red-400 flex items-center justify-center shadow-[1px_1px_0_#000]">
              <LogOut size={16} className="text-black" />
            </div>
            <span className="font-bold text-sm text-black uppercase">
              Log Out
            </span>
          </button>
        </form>
      </div>
    </div>
  );
}
