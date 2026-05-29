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
  const showUpgrade = plan === "free" || isTrialActive;

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
    <div className="w-64 flex flex-col h-screen sticky top-0 overflow-hidden" style={{ background: "#0a0a0f", borderRight: "1px solid rgba(255,255,255,0.08)" }}>

      {/* ── Brand Header ───────────────────────────────────────────────────── */}
      <div className="p-4 flex-shrink-0" style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
        <div className="flex items-center gap-3 mb-4">
          {/* Logo mark */}
          <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 relative overflow-hidden"
            style={{ background: "linear-gradient(135deg,#FFD700,#f59e0b)", boxShadow: "0 0 16px rgba(255,215,0,0.35)" }}>
            <Image src="/brand/kwd-black.png" alt="KWD" width={22} height={22} className="object-contain relative z-10" unoptimized />
          </div>
          <div>
            <h1 className="text-sm font-black uppercase tracking-widest text-white leading-none">KWD</h1>
            <p className="text-[9px] font-bold uppercase tracking-widest leading-tight mt-0.5" style={{ color: "rgba(255,255,255,0.35)" }}>
              Kesararam · Digital
            </p>
          </div>
        </div>

        {/* ── User Profile Card ─────────────────────────────────────────── */}
        <div className="rounded-xl overflow-hidden" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
          {/* Colored top accent */}
          <div className="h-0.5" style={{ background: `linear-gradient(90deg, ${roleColor}, transparent)` }} />
          <div className="p-3 flex items-center gap-2.5">
            <div className="rounded-lg overflow-hidden flex-shrink-0 border" style={{ borderColor: "rgba(255,255,255,0.1)" }}>
              <AvatarDisplay avatar={avatar} name={name} size={32} radius={0} />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-black text-xs text-white truncate uppercase tracking-wide">{name}</h3>
              <span
                className="inline-block px-1.5 py-0.5 text-[9px] font-black uppercase tracking-widest rounded-sm mt-0.5"
                style={{ background: `${roleColor}25`, color: roleColor, border: `1px solid ${roleColor}40` }}
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
                <div className="mx-3 mb-3 p-[1px] rounded-2xl overflow-hidden relative" style={{
                  background: "linear-gradient(135deg, rgba(255,215,0,0.4), rgba(245,158,11,0.15))"
                }}>
                  <div className="absolute inset-0 opacity-15 pointer-events-none blur-sm bg-gradient-to-r from-amber-400 to-transparent" />
                  <div className="relative z-10 px-3.5 py-2.5 rounded-2xl bg-[#0c0d12]/95 flex items-center gap-2 border border-white/5">
                    <Crown size={14} className="text-amber-400 animate-sparkle-float" />
                    <div className="flex-1 min-w-0">
                      <div className="text-[10px] font-black uppercase tracking-wider text-amber-400">Teacher Pro</div>
                      <div className="text-[8px] text-white/35 font-bold uppercase tracking-widest">Active License</div>
                    </div>
                    <Sparkles size={11} className="text-amber-400/50 animate-pulse" />
                  </div>
                </div>
              )}

              {/* Trial Active */}
              {isTrialActive && (
                <div className="mx-3 mb-3 p-[1px] rounded-2xl overflow-hidden relative animate-bounce-in" style={{
                  background: isUrgent
                    ? "linear-gradient(135deg, rgba(239, 68, 68, 0.4), rgba(239, 68, 68, 0.15))"
                    : "linear-gradient(135deg, rgba(255, 215, 0, 0.35), rgba(245, 158, 11, 0.15))",
                }}>
                  {/* Glowing backing for Cyber Arcade feel */}
                  <div className="absolute inset-0 opacity-20 pointer-events-none blur-md" style={{
                    background: isUrgent
                      ? "radial-gradient(circle, rgba(239,68,68,0.8), transparent 70%)"
                      : "radial-gradient(circle, rgba(255,215,0,0.8), transparent 70%)",
                  }} />

                  <div className="relative z-10 px-3.5 py-3 rounded-2xl bg-[#0c0d12]/95 backdrop-blur-md">
                    {/* Header: Badge & Status */}
                    <div className="flex items-center gap-1.5 mb-3">
                      <div className="flex items-center gap-1">
                        {isUrgent ? (
                          <Flame size={12} className="text-red-400 animate-pulse rounded-full p-0.5 bg-red-500/10" />
                        ) : (
                          <Crown size={12} className="text-amber-400 animate-sparkle-float" />
                        )}
                        <span className="text-[10px] font-black uppercase tracking-wider" style={{ color: isUrgent ? "#f87171" : "#FFD700" }}>
                          Teacher Pro
                        </span>
                      </div>
                      
                      <span className="ml-auto text-[9px] font-black uppercase px-2 py-0.5 rounded-full" style={{
                        background: isUrgent ? "rgba(239,68,68,0.2)" : "rgba(255,215,0,0.12)",
                        color: isUrgent ? "#f87171" : "#FFD700",
                        border: isUrgent ? "1px solid rgba(239,68,68,0.3)" : "1px solid rgba(255,215,0,0.25)"
                      }}>
                        {trialDaysLeft}d left
                      </span>
                    </div>

                    {/* 7-LED Indicator Panel */}
                    <div className="mb-3">
                      <div className="flex justify-between items-center px-0.5 mb-1.5">
                        <span className="text-[8px] font-black text-white/30 uppercase tracking-widest">Trial Lifeline</span>
                        <span className="text-[8px] font-black text-white/50">{trialDaysLeft}/7 DAYS</span>
                      </div>
                      <div className="flex gap-1 justify-between bg-black/40 p-1.5 rounded-lg border border-white/5">
                        {Array.from({ length: 7 }).map((_, i) => {
                          const dotIndex = i + 1;
                          const isDotActive = dotIndex <= (trialDaysLeft ?? 0);
                          const isUrgentDot = isDotActive && isUrgent;

                          return (
                            <div
                              key={i}
                              className={`h-2 flex-1 rounded-sm transition-all duration-500 ${
                                isUrgentDot ? "animate-pulse-red-alert" : isDotActive && dotIndex === (trialDaysLeft ?? 0) ? "animate-pulse-gold" : ""
                              }`}
                              style={{
                                background: isDotActive
                                  ? isUrgent
                                    ? "linear-gradient(to bottom, #ef4444, #b91c1c)"
                                    : "linear-gradient(to bottom, #FFD700, #d97706)"
                                  : "rgba(255,255,255,0.06)",
                                border: isDotActive
                                  ? isUrgent
                                    ? "1px solid rgba(239,68,68,0.5)"
                                    : "1px solid rgba(255,215,0,0.4)"
                                  : "1px solid rgba(255,255,255,0.03)",
                                boxShadow: isDotActive
                                  ? isUrgent
                                    ? "0 0 6px rgba(239,68,68,0.6)"
                                    : "0 0 6px rgba(255,215,0,0.4)"
                                  : "none",
                              }}
                              title={isDotActive ? `Day ${dotIndex} active` : `Day ${dotIndex} consumed`}
                            />
                          );
                        })}
                      </div>
                    </div>

                    {/* CTA Action */}
                    <Link href="/pricing"
                      className="group flex items-center justify-center gap-1.5 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-wider transition-all duration-300 shimmer-sweep-btn"
                      style={{
                        background: isUrgent 
                          ? "linear-gradient(135deg, #ef4444, #dc2626)" 
                          : "linear-gradient(135deg, #FFD700, #f59e0b)",
                        color: isUrgent ? "#fff" : "#000",
                        boxShadow: isUrgent
                          ? "0 4px 12px rgba(239,68,68,0.25)"
                          : "0 4px 12px rgba(255,215,0,0.25)",
                      }}>
                      Upgrade Now <ArrowRight size={10} className="transition-transform group-hover:translate-x-1" />
                    </Link>
                  </div>
                </div>
              )}

              {/* Free Plan — upgrade nudge */}
              {plan === "free" && !isTrialActive && (
                <div className="mx-3 mb-3 p-[1px] rounded-2xl overflow-hidden relative" style={{
                  background: "linear-gradient(135deg, rgba(255,215,0,0.3), rgba(255,255,255,0.05))"
                }}>
                  <Link href="/pricing" className="group block relative z-10 px-3.5 py-3 rounded-2xl bg-[#0c0d12]/95 hover:bg-[#111218]/95 transition-all border border-white/5">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-amber-400/10 border border-amber-400/25 shrink-0 animate-sparkle-float">
                        <Crown size={13} className="text-amber-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[10px] font-black uppercase tracking-wider text-amber-400">Upgrade to Pro</div>
                        <div className="text-[8px] text-white/35 font-bold uppercase tracking-widest">Get Live Quiz Power</div>
                      </div>
                      <ArrowRight size={12} className="text-amber-400/50 transition-transform group-hover:translate-x-1 shrink-0" />
                    </div>
                  </Link>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* ── Navigation ─────────────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto p-3 space-y-5">

        {/* Account */}
        <div>
          <h2 className="text-[9px] font-black uppercase tracking-widest px-2 mb-2" style={{ color: "rgba(255,255,255,0.25)" }}>
            Account
          </h2>
          <Link
            href={profileHref}
            className="flex items-center gap-2.5 px-2.5 py-2 rounded-xl transition-all duration-150"
            style={{
              background: pathname.includes("/profile") ? "rgba(255,255,255,0.09)" : "transparent",
              border: pathname.includes("/profile") ? "1px solid rgba(255,255,255,0.1)" : "1px solid transparent",
            }}
          >
            <div className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: "rgba(59,130,246,0.25)", border: "1px solid rgba(59,130,246,0.4)" }}>
              <User size={12} className="text-blue-400" />
            </div>
            <span className="font-bold text-xs uppercase tracking-wide" style={{ color: pathname.includes("/profile") ? "#fff" : "rgba(255,255,255,0.55)" }}>
              My Profile
            </span>
            {pathname.includes("/profile") && <div className="ml-auto w-1 h-4 rounded-full" style={{ background: "#FFD700" }} />}
          </Link>
        </div>

        {/* Platform */}
        <div>
          <h2 className="text-[9px] font-black uppercase tracking-widest px-2 mb-2" style={{ color: "rgba(255,255,255,0.25)" }}>
            Platform
          </h2>
          <div className="space-y-0.5">
            {navItems.map((item) => {
              if (item.children) {
                const isExpanded = expandedItems.includes(item.label);
                const hasActiveChild = item.children.some((child) => isNavItemActive(child.href));

                return (
                  <div key={item.label}>
                    <button
                      onClick={() => toggleExpand(item.label)}
                      className="w-full flex items-center justify-between gap-2.5 px-2.5 py-2 rounded-xl transition-all duration-150"
                      style={{
                        background: hasActiveChild ? "rgba(255,255,255,0.07)" : "transparent",
                        border: hasActiveChild ? "1px solid rgba(255,255,255,0.08)" : "1px solid transparent",
                      }}
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: `${item.color}25`, border: `1px solid ${item.color}40` }}>
                          <item.icon size={12} style={{ color: item.color }} />
                        </div>
                        <span className="font-bold text-xs uppercase tracking-wide" style={{ color: hasActiveChild ? "#fff" : "rgba(255,255,255,0.55)" }}>
                          {item.label}
                        </span>
                      </div>
                      <div style={{ color: "rgba(255,255,255,0.25)" }}>
                        {isExpanded ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
                      </div>
                    </button>

                    {isExpanded && (
                      <div className="mt-0.5 ml-3 pl-3 space-y-0.5" style={{ borderLeft: "1px solid rgba(255,255,255,0.07)" }}>
                        {item.children.map((child) => {
                          const isActive = isNavItemActive(child.href);
                          return (
                            <Link
                              key={child.href}
                              href={child.href}
                              className="block px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all"
                              style={{
                                background: isActive ? "rgba(255,215,0,0.12)" : "transparent",
                                color: isActive ? "#FFD700" : "rgba(255,255,255,0.4)",
                                border: isActive ? "1px solid rgba(255,215,0,0.2)" : "1px solid transparent",
                              }}
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
                  className="flex items-center gap-2.5 px-2.5 py-2 rounded-xl transition-all duration-150 group relative"
                  style={{
                    background: isActive ? "rgba(255,255,255,0.09)" : "transparent",
                    border: isActive ? "1px solid rgba(255,255,255,0.1)" : "1px solid transparent",
                  }}
                >
                  {/* Active glow */}
                  {isActive && (
                    <div className="absolute inset-0 rounded-xl opacity-40" style={{ background: `radial-gradient(circle at 20% 50%, ${item.color}20, transparent 60%)` }} />
                  )}
                  <div className="relative z-10 w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 transition-all"
                    style={{ background: `${item.color}${isActive ? "35" : "20"}`, border: `1px solid ${item.color}${isActive ? "60" : "35"}` }}>
                    <item.icon size={12} style={{ color: item.color }} />
                  </div>
                  <span className="relative z-10 font-bold text-xs uppercase tracking-wide transition-colors"
                    style={{ color: isActive ? "#fff" : "rgba(255,255,255,0.55)" }}>
                    {item.label}
                  </span>
                  {isActive && <div className="ml-auto relative z-10 w-1 h-4 rounded-full" style={{ background: item.color }} />}
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Footer / Logout ─────────────────────────────────────────────────── */}
      <div className="p-3 flex-shrink-0" style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }}>
        <form action={logoutAction} className="w-full">
          <button
            type="submit"
            className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl transition-all duration-150 group"
            style={{ background: "transparent", border: "1px solid transparent" }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(239,68,68,0.08)"; (e.currentTarget as HTMLElement).style.borderColor = "rgba(239,68,68,0.2)"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; (e.currentTarget as HTMLElement).style.borderColor = "transparent"; }}
          >
            <div className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: "rgba(239,68,68,0.2)", border: "1px solid rgba(239,68,68,0.35)" }}>
              <LogOut size={12} className="text-red-400" />
            </div>
            <span className="font-bold text-xs uppercase tracking-wide" style={{ color: "rgba(255,255,255,0.4)" }}>
              Log Out
            </span>
          </button>
        </form>
      </div>
    </div>
  );
}
