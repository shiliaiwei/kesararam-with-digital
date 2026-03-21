"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  Users,
  BookOpen,
  ScrollText,
  School,
  Tv2,
  LogOut,
  Images,
  User,
  Plus,
  Calendar,
  ChevronDown,
  ChevronRight,
  AlertCircle,
} from "lucide-react";
import { logoutAction } from "@/app/actions/auth";
import { AvatarDisplay } from "@/components/shared/avatar-display";

interface NavItem {
  label: string;
  href?: string;
  icon: React.ComponentType<{ className?: string; size?: number }>;
  color: string;
  children?: { label: string; href: string }[];
}

const adminNav: NavItem[] = [
  { label: "Project Planner", href: "/admin/project-planner", icon: Calendar, color: "#3b82f6" },
  { label: "Review Queue", href: "/admin/review", icon: AlertCircle, color: "#f59e0b" },
  { label: "Users", href: "/admin/users", icon: Users, color: "#3b82f6" },
  { label: "Content", href: "/admin/content", icon: BookOpen, color: "#22c55e" },
  { label: "Media", href: "/admin/media", icon: Images, color: "#a855f7" },
  { label: "Logs", href: "/admin/logs", icon: ScrollText, color: "#f97316" },
];

const teacherNav: NavItem[] = [
  { label: "Project Planner", href: "/teacher/project-planner", icon: Calendar, color: "#3b82f6" },
  { label: "Classes", href: "/teacher/classes", icon: School, color: "#3b82f6" },
  { label: "Sessions", href: "/teacher/sessions", icon: Tv2, color: "#22c55e" },
];

const staffNav: NavItem[] = [
  { label: "Project Planner", href: "/staff/project-planner", icon: Calendar, color: "#f59e0b" },
  { label: "My Submissions", href: "/staff/submissions", icon: AlertCircle, color: "#3b82f6" },
  {
    label: "Content",
    icon: BookOpen,
    color: "#22c55e",
    children: [
      { label: "Traffic Signs", href: "/staff/content/road-sign" },
      { label: "Road Traffic Law", href: "/staff/content/road-traffic" },
      { label: "Right of Way", href: "/staff/content/priority" },
      { label: "Driving Skills", href: "/staff/content/driving" },
      { label: "Vehicle Technology", href: "/staff/content/technical" },
      { label: "Loading People & Goods", href: "/staff/content/loading-people-goods" },
      { label: "General Knowledge", href: "/staff/content/general-knowledge" },
      { label: "Emergency", href: "/staff/content/emergency" },
    ],
  },
  { label: "Media", href: "/staff/media", icon: Images, color: "#a855f7" },
  { label: "Classes", href: "/staff/classes", icon: School, color: "#3b82f6" },
];

interface AppSidebarProps {
  role: "admin" | "teacher" | "staff";
  name: string;
  email: string;
  avatar?: string | null;
}

export function AppSidebar({ role, name, email, avatar }: AppSidebarProps) {
  const pathname = usePathname();
  const navItems = role === "admin" ? adminNav : role === "staff" ? staffNav : teacherNav;
  const profileHref = role === "admin" ? "/admin/profile" : role === "staff" ? "/staff/profile" : "/teacher/profile";
  const roleColor = role === "admin" ? "#ef4444" : role === "staff" ? "#f59e0b" : "#22c55e";
  const [expandedItems, setExpandedItems] = useState<string[]>(["Content"]);

  function isNavItemActive(href: string) {
    const targetPath = href.split("?")[0];
    return pathname === targetPath || pathname.startsWith(`${targetPath}/`);
  }

  function toggleExpand(label: string) {
    setExpandedItems((prev) =>
      prev.includes(label) ? prev.filter((l) => l !== label) : [...prev, label]
    );
  }

  return (
    <div className="w-64 bg-white border-r-4 border-black flex flex-col shadow-[4px_0_0_#000] h-screen sticky top-0">
      {/* Header */}
      <div className="border-b-2 border-black p-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 border-2 border-black bg-black flex items-center justify-center shadow-[2px_2px_0_#000]">
            <Image
              src="https://raw.githubusercontent.com/kesararam/kesararam/refs/heads/main/brand/lgo.png"
              alt="KWD"
              width={20}
              height={20}
              className="object-contain invert"
              unoptimized
            />
          </div>
          <div>
            <h1 className="text-lg font-black uppercase tracking-tighter text-black">
              KWD
            </h1>
            <p className="text-xs font-bold uppercase tracking-widest text-zinc-500">
              {role} Panel
            </p>
          </div>
        </div>

        {/* User Profile Card - Compact */}
        <div className="border-2 border-black bg-white shadow-[2px_2px_0_#000] overflow-hidden">
          <div className="h-1" style={{ backgroundColor: roleColor }} />
          <div className="p-3 flex items-center gap-2">
            <div className="border-2 border-black shadow-[1px_1px_0_#000]">
              <AvatarDisplay avatar={avatar} name={name} size={32} radius={0} />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-black text-xs text-black truncate uppercase">
                {name}
              </h3>
              <span
                className="inline-block px-1.5 py-0.5 text-[9px] font-black uppercase tracking-widest border border-black"
                style={{ backgroundColor: roleColor, color: "#ffffff" }}
              >
                {role}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation - Scrollable */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Account Section - Top Priority */}
        <div>
          <h2 className="text-xs font-black uppercase tracking-widest text-zinc-500 mb-2 px-1">
            Account
          </h2>
          <Link
            href={profileHref}
            className={`w-full flex items-center gap-2 p-2.5 border-2 border-black transition-all duration-100 ${
              pathname.includes("/profile")
                ? "bg-yellow-400 shadow-[2px_2px_0_#000] -translate-x-0.5 -translate-y-0.5"
                : "bg-white hover:bg-yellow-50 hover:shadow-[1px_1px_0_#000]"
            }`}
          >
            <div className="w-6 h-6 border-2 border-black bg-blue-500 flex items-center justify-center shadow-[1px_1px_0_#000]">
              <User size={12} className="text-black" />
            </div>
            <span className="font-bold text-xs text-black uppercase">
              My Profile
            </span>
          </Link>
        </div>

        {/* Platform Section */}
        <div>
          <h2 className="text-xs font-black uppercase tracking-widest text-zinc-500 mb-2 px-1">
            Platform
          </h2>
          <div className="space-y-1">
            {navItems.map((item) => {
              if (item.children) {
                const isExpanded = expandedItems.includes(item.label);
                const hasActiveChild = item.children.some((child) =>
                  isNavItemActive(child.href)
                );

                return (
                  <div key={item.label}>
                    <button
                      onClick={() => toggleExpand(item.label)}
                      className={`w-full flex items-center justify-between gap-2 p-2.5 border-2 border-black transition-all duration-100 ${
                        hasActiveChild
                          ? "bg-yellow-100 shadow-[1px_1px_0_#000]"
                          : "bg-white hover:bg-yellow-50 hover:shadow-[1px_1px_0_#000]"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className="w-6 h-6 border-2 border-black flex items-center justify-center shadow-[1px_1px_0_#000]"
                          style={{ backgroundColor: item.color }}
                        >
                          <item.icon size={12} className="text-black" />
                        </div>
                        <span className="font-bold text-xs text-black uppercase">
                          {item.label}
                        </span>
                      </div>
                      {isExpanded ? (
                        <ChevronDown size={14} className="text-black" />
                      ) : (
                        <ChevronRight size={14} className="text-black" />
                      )}
                    </button>

                    {isExpanded && (
                      <div className="mt-1 ml-4 space-y-1">
                        {item.children.map((child) => {
                          const isActive = isNavItemActive(child.href);
                          return (
                            <Link
                              key={child.href}
                              href={child.href}
                              className={`block p-2 text-xs font-bold border-l-2 border-black transition-all ${
                                isActive
                                  ? "bg-yellow-400 pl-3"
                                  : "bg-gray-50 hover:bg-yellow-50 hover:pl-3"
                              }`}
                            >
                              {child.label}
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              }

              const isActive = isNavItemActive(item.href!);

              return (
                <Link
                  key={item.href}
                  href={item.href!}
                  className={`flex items-center gap-2 p-2.5 border-2 border-black transition-all duration-100 ${
                    isActive
                      ? "bg-yellow-400 shadow-[2px_2px_0_#000] -translate-x-0.5 -translate-y-0.5"
                      : "bg-white hover:bg-yellow-50 hover:shadow-[1px_1px_0_#000]"
                  }`}
                >
                  <div
                    className="w-6 h-6 border-2 border-black flex items-center justify-center shadow-[1px_1px_0_#000]"
                    style={{ backgroundColor: item.color }}
                  >
                    <item.icon size={12} className="text-black" />
                  </div>
                  <span className="font-bold text-xs text-black uppercase">
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Quick Actions */}
        <div>
          <h2 className="text-xs font-black uppercase tracking-widest text-zinc-500 mb-2 px-1">
            Quick Actions
          </h2>
          <Link
            href={role === "admin" ? "/admin/content" : role === "staff" ? "/staff/content/road-sign" : "/teacher/content"}
            className="flex items-center gap-2 p-2.5 border-2 border-black bg-green-400 hover:bg-green-300 hover:shadow-[1px_1px_0_#000] transition-all duration-100"
          >
            <div className="w-6 h-6 border-2 border-black bg-white flex items-center justify-center shadow-[1px_1px_0_#000]">
              <Plus size={12} className="text-black" />
            </div>
            <span className="font-bold text-xs text-black uppercase">
              Add Content
            </span>
          </Link>
        </div>
      </div>

      {/* Footer - Sticky at Bottom */}
      <div className="border-t-2 border-black p-4 bg-white">
        <form action={logoutAction} className="w-full">
          <button
            type="submit"
            className="w-full flex items-center gap-2 p-2.5 border-2 border-black bg-white hover:bg-red-50 hover:shadow-[1px_1px_0_#000] transition-all duration-100"
          >
            <div className="w-6 h-6 border-2 border-black bg-red-400 flex items-center justify-center shadow-[1px_1px_0_#000]">
              <LogOut size={12} className="text-black" />
            </div>
            <span className="font-bold text-xs text-black uppercase">
              Log Out
            </span>
          </button>
        </form>
      </div>
    </div>
  );
}
