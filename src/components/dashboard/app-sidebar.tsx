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
  AlertCircle,
  Gamepad2,
  CreditCard,
  Crown,
  Zap,
  Building2,
  Clock,
  ChevronDown,
  ChevronRight,
  Sparkles,
  ArrowRight,
  Flame,
} from "lucide-react";
import { logoutAction } from "@/app/actions/auth";
import { AvatarDisplay } from "@/components/shared/avatar-display";

interface NavItem {
  label: string;
  href?: string;
  icon: React.ComponentType<{ className?: string; size?: number; color?: string; style?: React.CSSProperties }>;
  color: string;
  children?: { label: string; href: string }[];
}

const adminNav: NavItem[] = [
  { label: "Review Queue", href: "/admin/review", icon: AlertCircle, color: "#f59e0b" },
  { label: "Users", href: "/admin/users", icon: Users, color: "#3b82f6" },
  { label: "Subscriptions", href: "/admin/subscriptions", icon: CreditCard, color: "#f59e0b" },
  { label: "Questions", href: "/admin/questions", icon: ScrollText, color: "#8b5cf6" },
  {
    label: "Content", icon: BookOpen, color: "#22c55e",
    children: [
      { label: "Overview", href: "/admin/content" },
      { label: "Traffic Signs", href: "/admin/content/road-sign" },
      { label: "Road Traffic Law", href: "/admin/content/road-traffic" },
      { label: "Right of Way", href: "/admin/content/priority" },
      { label: "Driving Skills", href: "/admin/content/driving" },
      { label: "Vehicle Technology", href: "/admin/content/technical" },
      { label: "Loading People & Goods", href: "/admin/content/loading-people-goods" },
      { label: "General Knowledge", href: "/admin/content/general-knowledge" },
      { label: "Emergency", href: "/admin/content/emergency" },
    ],
  },
  { label: "Game Sessions", href: "/admin/game-sessions", icon: Gamepad2, color: "#a855f7" },
  { label: "Media", href: "/admin/media", icon: Images, color: "#a855f7" },
  { label: "Logs", href: "/admin/logs", icon: ScrollText, color: "#f97316" },
];

const teacherNav: NavItem[] = [
  { label: "Classes", href: "/teacher/classes", icon: School, color: "#3b82f6" },
  { label: "Sessions", href: "/teacher/sessions", icon: Tv2, color: "#22c55e" },
  { label: "Host Game", href: "/teacher/sessions/host", icon: Gamepad2, color: "#ffd700" },
];

const staffNav: NavItem[] = [
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
  plan?: string;
  isTrial?: boolean;
  trialEndsAt?: string | null;
}

export function AppSidebar({ role, name, email, avatar, plan = "free", isTrial = false, trialEndsAt = null }: AppSidebarProps) {
  const pathname = usePathname();
  const navItems = role === "admin" ? adminNav : role === "staff" ? staffNav : teacherNav;
  const profileHref = role === "admin" ? "/admin/profile" : role === "staff" ? "/staff/profile" : "/teacher/profile";
  const roleColor = role === "admin" ? "#ef4444" : role === "staff" ? "#f59e0b" : "#22c55e";
  const [expandedItems, setExpandedItems] = useState<string[]>(["Content"]);

  const trialDaysLeft = trialEndsAt
    ? Math.max(0, Math.ceil((new Date(trialEndsAt).getTime() - Date.now()) / 86400000))
    : null;

  const isProPlan = plan === "teacher_pro";
  const isTrialActive = isTrial && trialDaysLeft !== null && trialDaysLeft > 0;
  const isUrgent = isTrialActive && trialDaysLeft !== null && trialDaysLeft <= 3;

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
    <div className="w-64 flex flex-col h-screen sticky top-0 overflow-hidden bg-white border-r-4 border-black">

      {/* ── Brand Header ───────────────────────────────────────────────────── */}
      <div className="p-4 flex-shrink-0" style={{ borderBottom: "2px solid #000000" }}>
        <div className="flex items-center gap-3 mb-4">
          {/* Logo mark */}
          <div className="w-9 h-9 flex items-center justify-center flex-shrink-0 relative overflow-hidden border-2 border-black"
            style={{ background: "#FFD700", boxShadow: "2px 2px 0px #000" }}>
            <Image src="/brand/kwd-black.png" alt="KWD" width={22} height={22} className="object-contain relative z-10" unoptimized />
          </div>
          <div>
            <h1 className="text-sm font-black uppercase tracking-widest text-black leading-none">KWD</h1>
            <p className="text-[9px] font-black uppercase tracking-widest leading-tight mt-0.5 text-zinc-500">
              Kesararam · Digital
            </p>
          </div>
        </div>

        {/* ── User Profile Card ─────────────────────────────────────────── */}
        <div className="rounded-xl overflow-hidden bg-white border-2 border-black" style={{ boxShadow: "3px 3px 0 #000" }}>
          {/* Colored top accent */}
          <div className="h-1 bg-black" />
          <div className="p-3 flex items-center gap-2.5 bg-white">
            <div className="rounded-lg overflow-hidden flex-shrink-0 border border-black">
              <AvatarDisplay avatar={avatar} name={name} size={32} radius={0} />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-black text-xs text-black truncate uppercase tracking-wide">{name}</h3>
              <span
                className="inline-block px-1.5 py-0.5 text-[9px] font-black uppercase tracking-widest rounded-sm mt-0.5 border border-black"
                style={{ background: "#e5e7eb", color: "#000" }}
              >
                {role}
              </span>
            </div>
          </div>

          {/* ── Teacher Pro / Trial Badge ──────────────────────────────── */}
          {role === "teacher" && (
            <>
              {/* Active Pro Plan */}
              {isProPlan && !isTrialActive && (
                <div className="mx-3 mb-3 bg-[#e8f5e9] border-2 border-black p-3 rounded-xl" style={{
                  boxShadow: "2.5px 2.5px 0px #000000"
                }}>
                  <div className="flex items-center gap-2 text-black">
                    <div className="w-6.5 h-6.5 rounded-lg flex items-center justify-center bg-[#FFD700] border border-black shrink-0" style={{ boxShadow: "1px 1px 0 #000" }}>
                      <Crown size={12} className="text-black animate-sparkle-float" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[10px] font-black uppercase tracking-wider text-black">Teacher Pro</div>
                      <div className="text-[8px] text-green-700 font-black uppercase tracking-widest">Active License</div>
                    </div>
                    <Sparkles size={11} className="text-amber-500 animate-pulse shrink-0" />
                  </div>
                </div>
              )}

              {/* Trial Active */}
              {isTrialActive && (
                <div className="mx-3 mb-3 bg-white border-2 border-black p-3.5 rounded-xl animate-bounce-in" style={{
                  boxShadow: isUrgent ? "3px 3px 0px #ef4444" : "3px 3px 0px #000000"
                }}>
                  {/* Header: Badge & Status */}
                  <div className="flex items-center gap-1.5 mb-3">
                    <div className="flex items-center gap-1">
                      {isUrgent ? (
                        <Flame size={12} className="text-red-500 animate-pulse" />
                      ) : (
                        <Crown size={12} className="text-amber-500 animate-sparkle-float" />
                      )}
                      <span className="text-[10px] font-black uppercase tracking-wider" style={{ color: isUrgent ? "#ef4444" : "#000" }}>
                        Teacher Pro
                      </span>
                    </div>
                    
                    <span className="ml-auto text-[9px] font-black uppercase px-2 py-0.5 border border-black rounded-sm" style={{
                      background: isUrgent ? "#ef4444" : "#FFD700",
                      color: isUrgent ? "#fff" : "#000",
                      boxShadow: "1px 1px 0 #000"
                    }}>
                      {trialDaysLeft}d left
                    </span>
                  </div>

                  {/* 7-LED Indicator Panel */}
                  <div className="mb-3.5">
                    <div className="flex justify-between items-center mb-1.5">
                      <span className="text-[8px] font-black text-black/40 uppercase tracking-widest">Trial Lifeline</span>
                      <span className="text-[8px] font-black text-black/60">{trialDaysLeft}/7 DAYS</span>
                    </div>
                    <div className="grid grid-cols-7 gap-1 bg-[#f3f4f6] p-1.5 rounded-lg border border-black">
                      {Array.from({ length: 7 }).map((_, i) => {
                        const dotIndex = i + 1;
                        const isDotActive = dotIndex <= (trialDaysLeft ?? 0);
                        const isUrgentDot = isDotActive && isUrgent;

                        return (
                          <div
                            key={i}
                            className={`h-4 border border-black rounded-sm transition-all duration-300 ${
                              isUrgentDot ? "animate-pulse-red-alert" : ""
                            }`}
                            style={{
                              backgroundColor: isDotActive
                                ? isUrgent ? "#ef4444" : "#FFD700"
                                : "#e5e7eb",
                            }}
                            title={isDotActive ? `Day ${dotIndex} active` : `Day ${dotIndex} consumed`}
                          />
                        );
                      })}
                    </div>
                  </div>

                  {/* CTA Action */}
                  <Link href="/pricing"
                    className="group flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all duration-150 border-2 border-black nb-interactive"
                    style={{
                      background: isUrgent ? "#ef4444" : "#FFD700",
                      color: isUrgent ? "#fff" : "#000",
                      boxShadow: "2.5px 2.5px 0px #000000",
                    }}>
                    Upgrade Now <ArrowRight size={10} className="transition-transform group-hover:translate-x-0.5" />
                  </Link>
                </div>
              )}

              {/* Free Plan — upgrade nudge */}
              {plan === "free" && !isTrialActive && (
                <div className="mx-3 mb-3 bg-white border-2 border-black p-3 rounded-xl" style={{
                  boxShadow: "3px 3px 0px #000000"
                }}>
                  <Link href="/pricing" className="group flex items-center justify-between border-2 border-black p-2 bg-[#FFD700] rounded-lg nb-interactive text-black" style={{ boxShadow: "2px 2px 0 #000" }}>
                    <div className="flex items-center gap-2">
                      <div className="w-6.5 h-6.5 rounded-md flex items-center justify-center bg-black shrink-0">
                        <Crown size={12} className="text-[#FFD700]" />
                      </div>
                      <div className="flex-1 min-w-0 text-left">
                        <div className="text-[10px] font-black uppercase tracking-wider">Upgrade to Pro</div>
                        <div className="text-[8px] text-black/60 font-bold uppercase tracking-widest">Get Live Quiz Power</div>
                      </div>
                    </div>
                    <ArrowRight size={12} className="transition-transform group-hover:translate-x-0.5 shrink-0" />
                  </Link>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* ── Navigation ─────────────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto p-3 space-y-5 bg-white">

        {/* Account */}
        <div>
          <h2 className="text-[9px] font-black uppercase tracking-widest px-2 mb-2 text-zinc-400">
            Account
          </h2>
          <Link
            href={profileHref}
            className={`flex items-center gap-2.5 px-2.5 py-2 transition-all duration-100 ${
              pathname.includes("/profile")
                ? "bg-yellow-400 border-2 border-black shadow-[2px_2px_0_#000] -translate-x-0.5 -translate-y-0.5 text-black font-black"
                : "hover:bg-yellow-50 hover:border-2 hover:border-black hover:shadow-[2px_2px_0_#000] hover:-translate-x-0.5 hover:-translate-y-0.5 text-zinc-700"
            }`}
            style={{ borderRadius: "0px" }}
          >
            <div className="w-6 h-6 border-2 border-black flex items-center justify-center flex-shrink-0" style={{ background: "#3b82f6" }}>
              <User size={12} className="text-black" />
            </div>
            <span className="font-bold text-xs uppercase tracking-wide">
              My Profile
            </span>
          </Link>
        </div>

        {/* Platform */}
        <div>
          <h2 className="text-[9px] font-black uppercase tracking-widest px-2 mb-2 text-zinc-400">
            Platform
          </h2>
          <div className="space-y-1.5">
            {navItems.map((item) => {
              if (item.children) {
                const isExpanded = expandedItems.includes(item.label);
                const hasActiveChild = item.children.some((child) => isNavItemActive(child.href));

                return (
                  <div key={item.label} className="space-y-1">
                    <button
                      onClick={() => toggleExpand(item.label)}
                      className={`w-full flex items-center justify-between gap-2.5 px-2.5 py-2 transition-all duration-100 ${
                        hasActiveChild
                          ? "bg-yellow-400 border-2 border-black shadow-[2px_2px_0_#000] -translate-x-0.5 -translate-y-0.5 text-black font-black"
                          : "hover:bg-yellow-50 hover:border-2 hover:border-black hover:shadow-[2px_2px_0_#000] hover:-translate-x-0.5 hover:-translate-y-0.5 text-zinc-700"
                      }`}
                      style={{ borderRadius: "0px" }}
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-6 h-6 border-2 border-black flex items-center justify-center flex-shrink-0" style={{ background: item.color }}>
                          <item.icon size={12} className="text-black" />
                        </div>
                        <span className="font-bold text-xs uppercase tracking-wide">
                          {item.label}
                        </span>
                      </div>
                      <div className="text-black">
                        {isExpanded ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
                      </div>
                    </button>

                    {isExpanded && (
                      <div className="mt-0.5 ml-3 pl-3 space-y-1 border-l-2 border-black">
                        {item.children.map((child) => {
                          const isActive = isNavItemActive(child.href);
                          return (
                            <Link
                              key={child.href}
                              href={child.href}
                              className={`block px-2.5 py-1.5 text-xs font-bold transition-all duration-100 ${
                                isActive
                                  ? "bg-yellow-400 border border-black shadow-[1px_1px_0_#000] text-black"
                                  : "hover:bg-yellow-50 hover:border hover:border-black hover:shadow-[1px_1px_0_#000] text-zinc-600"
                              }`}
                              style={{ borderRadius: "0px" }}
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
                  className={`flex items-center gap-2.5 px-2.5 py-2 transition-all duration-100 ${
                    isActive
                      ? "bg-yellow-400 border-2 border-black shadow-[2px_2px_0_#000] -translate-x-0.5 -translate-y-0.5 text-black font-black"
                      : "hover:bg-yellow-50 hover:border-2 hover:border-black hover:shadow-[2px_2px_0_#000] hover:-translate-x-0.5 hover:-translate-y-0.5 text-zinc-700"
                  }`}
                  style={{ borderRadius: "0px" }}
                >
                  <div className="w-6 h-6 border-2 border-black flex items-center justify-center flex-shrink-0" style={{ background: item.color }}>
                    <item.icon size={12} className="text-black" />
                  </div>
                  <span className="font-bold text-xs uppercase tracking-wide">
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Footer / Logout ─────────────────────────────────────────────────── */}
      <div className="p-3 flex-shrink-0 bg-white" style={{ borderTop: "2px solid #000000" }}>
        <form action={logoutAction} className="w-full">
          <button
            type="submit"
            className="w-full flex items-center gap-2.5 px-2.5 py-2 transition-all duration-100 border-2 border-black bg-white hover:bg-red-400 hover:text-white shadow-[2px_2px_0_#000] hover:-translate-x-0.5 hover:-translate-y-0.5"
            style={{ borderRadius: "0px" }}
          >
            <div className="w-6 h-6 border-2 border-black bg-red-400 flex items-center justify-center flex-shrink-0">
              <LogOut size={12} className="text-black" />
            </div>
            <span className="font-bold text-xs uppercase tracking-wide">
              Log Out
            </span>
          </button>
        </form>
      </div>
    </div>
  );
}
