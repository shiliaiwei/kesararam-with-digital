"use client";

import React, { useState, useEffect } from "react";
import {
  Palette, BookOpen, GraduationCap,
  Award, Zap, Trophy, Target, Sun, Moon, Sparkles, X, RefreshCw,
  ArrowRight, Pencil, Camera, CheckCircle2, School,
  Sprout, PartyPopper, Star, Trophy as TierTrophy, Gem, Crown,
  Mail, AtSign, Info, ExternalLink, Globe, Lock, Eye, EyeOff,
  User, Shield,
} from "lucide-react";
import { getRank, getNextRank, tierProgress, pointsToNextRank, RANK_TIERS } from "@/lib/rank-utils";
import { AvatarDisplay } from "@/components/shared/avatar-display";
import { RankBadge } from "@/components/shared/rank-label";
import { ProfileEditor } from "@/components/profile/profile-editor";
import { useLang } from "@/context/lang-context";

const TIER_ICONS: Record<string, React.ComponentType<any>> = {
  rookie: Sprout,
  debut: PartyPopper,
  gold: Star,
  platinum: TierTrophy,
  diamond: Gem,
  mythic: Crown,
};

// ── Props definition ────────────────────────────────────────────────────────
interface StudentProfileDashboardProps {
  user: {
    displayName: string;
    username: string;
    email: string;
    avatar: string | null;
    avatarChangedAt: Date | null;
    schoolName: string | null;
    province: string | null;
    gradeLevel: string | null;
    section: string | null;
  };
  highestScore: number;
  totalGamesPlayed: number;
  lifetimePoints: number;
  studentClassInfo: {
    className: string;
    section: string | null;
    gradeLevel: string | null;
    schoolName: string | null;
    province: string | null;
    teacherName: string | null;
  } | null;
}

// ── Theme Presets Definitions ────────────────────────────────────────────────
type ThemeMode = "light" | "dark";
type ColorPalette = "slate" | "emerald" | "sunset" | "ocean" | "cyber";
type CardStyle = "sleek" | "flat" | "brutalist";
type FontFamily = "sans" | "google" | "mono";
type BackgroundPattern = "dots" | "grid" | "clean";
type LayoutStyle = "grid" | "sidebar" | "stack";

interface ThemeSettings {
  mode: ThemeMode;
  palette: ColorPalette;
  cardStyle: CardStyle;
  font: FontFamily;
  background: BackgroundPattern;
  layout: LayoutStyle;
  glowEnabled: boolean;
  microAnimations: boolean;
}

const DEFAULT_THEME: ThemeSettings = {
  mode: "light",
  palette: "slate",
  cardStyle: "sleek",
  font: "google",
  background: "dots",
  layout: "grid",
  glowEnabled: true,
  microAnimations: true,
};

export function StudentProfileDashboard({
  user,
  highestScore,
  totalGamesPlayed,
  lifetimePoints,
  studentClassInfo,
}: StudentProfileDashboardProps) {
  // Theme state with default initialized
  const [theme, setTheme] = useState<ThemeSettings>(DEFAULT_THEME);
  const [mounted, setMounted] = useState(false);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [drawerTab, setDrawerTab] = useState<"profile" | "privacy">("profile");
  const [privacy, setPrivacy] = useState({
    isProfilePublic: true, isNamePublic: true, isUsernamePublic: true,
    isSchoolPublic: true, isProvincePublic: true, isGradePublic: true,
    isSectionPublic: true, isStatsPublic: true,
  });
  const [privacyLoading, setPrivacyLoading] = useState(false);
  const [privacySaving, setPrivacySaving] = useState(false);
  const [privacySaved, setPrivacySaved] = useState(false);
  const [privacyError, setPrivacyError] = useState("");
  const [editUsername, setEditUsername] = useState(user.username);
  const [editDisplayName, setEditDisplayName] = useState(user.displayName ?? user.username);
  const [usernameCooldown, setUsernameCooldown] = useState<number | null>(null); // days left
  const [displayNameCooldown, setDisplayNameCooldown] = useState<number | null>(null);
  const [infoSaving, setInfoSaving] = useState(false);
  const [infoSaved, setInfoSaved] = useState(false);
  const [infoError, setInfoError] = useState("");
  const [rankStats, setRankStats] = useState({
    highestScore,
    totalGamesPlayed,
    lifetimePoints,
    currentRank: null as number | null,
  });

  // Fetch rank in background periodically
  useEffect(() => {
    async function fetchRank() {
      try {
        const res = await fetch("/api/user/stats");
        if (res.ok) {
          const data = await res.json();
          setRankStats({
            highestScore: data.stats?.highestScore || highestScore,
            totalGamesPlayed: data.stats?.totalGamesPlayed || totalGamesPlayed,
            lifetimePoints: data.stats?.lifetimePoints || lifetimePoints,
            currentRank: data.stats?.currentRank || null,
          });
        }
      } catch (error) {
        console.log("Could not fetch rank stats:", error);
      }
    }
    fetchRank();
    const interval = setInterval(fetchRank, 45000);
    return () => clearInterval(interval);
  }, [highestScore, totalGamesPlayed, lifetimePoints]);

  // Load theme settings from localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedTheme = localStorage.getItem("kwd-profile-theme");
      if (savedTheme) {
        try {
          setTheme(JSON.parse(savedTheme));
        } catch (e) {
          console.error("Error reading theme from localStorage", e);
        }
      }
      setMounted(true);
    }
  }, []);

  // Save theme settings to localStorage
  const saveThemeSettings = (newTheme: ThemeSettings) => {
    setTheme(newTheme);
    if (typeof window !== "undefined") {
      localStorage.setItem("kwd-profile-theme", JSON.stringify(newTheme));
    }
  };

  const resetTheme = () => {
    saveThemeSettings(DEFAULT_THEME);
  };

  // Fetch settings when edit drawer opens
  useEffect(() => {
    if (!isEditProfileOpen) return;
    setPrivacyLoading(true);
    fetch("/api/user/settings")
      .then((r) => r.json())
      .then((data) => {
        if (data.settings) {
          const s = data.settings;
          setPrivacy({
            isProfilePublic: s.isProfilePublic ?? true,
            isNamePublic: s.isNamePublic ?? true,
            isUsernamePublic: s.isUsernamePublic ?? true,
            isSchoolPublic: s.isSchoolPublic ?? true,
            isProvincePublic: s.isProvincePublic ?? true,
            isGradePublic: s.isGradePublic ?? true,
            isSectionPublic: s.isSectionPublic ?? true,
            isStatsPublic: s.isStatsPublic ?? true,
          });
          setEditUsername(s.username ?? user.username);
          setEditDisplayName(s.displayName ?? user.username);
          // Calculate cooldowns
          const ONE_YEAR = 365 * 24 * 60 * 60 * 1000;
          const SIX_MONTHS = 183 * 24 * 60 * 60 * 1000;
          if (s.usernameChangedAt) {
            const elapsed = Date.now() - new Date(s.usernameChangedAt).getTime();
            if (elapsed < ONE_YEAR) setUsernameCooldown(Math.ceil((ONE_YEAR - elapsed) / 86400000));
            else setUsernameCooldown(null);
          } else setUsernameCooldown(null);
          if (s.displayNameChangedAt) {
            const elapsed = Date.now() - new Date(s.displayNameChangedAt).getTime();
            if (elapsed < SIX_MONTHS) setDisplayNameCooldown(Math.ceil((SIX_MONTHS - elapsed) / 86400000));
            else setDisplayNameCooldown(null);
          } else setDisplayNameCooldown(null);
        }
      })
      .catch(console.error)
      .finally(() => setPrivacyLoading(false));
  }, [isEditProfileOpen]);

  const saveInfo = async () => {
    setInfoSaving(true);
    setInfoError("");
    try {
      const payload: Record<string, string> = {};
      if (editDisplayName.trim() && editDisplayName.trim() !== user.displayName) {
        payload.displayName = editDisplayName.trim();
      }
      if (editUsername.trim() && editUsername.trim() !== user.username) {
        payload.username = editUsername.trim().toLowerCase();
      }
      if (Object.keys(payload).length === 0) { setInfoSaving(false); return; }
      const res = await fetch("/api/user/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      setInfoSaved(true);
      setTimeout(() => setInfoSaved(false), 3000);
    } catch (e: any) {
      setInfoError(e.message || "Failed to save.");
    } finally {
      setInfoSaving(false);
    }
  };

  const savePrivacy = async () => {
    setPrivacySaving(true);
    setPrivacyError("");
    try {
      const res = await fetch("/api/user/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(privacy),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Failed to save.");
      setPrivacySaved(true);
      setTimeout(() => setPrivacySaved(false), 3000);
    } catch (e: any) {
      setPrivacyError(e.message || "Failed to save. Please try again.");
    } finally {
      setPrivacySaving(false);
    }
  };

  const tier = getRank(rankStats.lifetimePoints);
  const nextTier = getNextRank(rankStats.lifetimePoints);
  const nextProgress = tierProgress(rankStats.lifetimePoints);
  const pointsRemaining = pointsToNextRank(rankStats.lifetimePoints);

  // Generate dynamic custom styles
  const getThemeStyles = () => {
    const isDark = theme.mode === "dark";
    
    // 1. Color Palettes (Harmonious premium tones)
    const palettes = {
      slate: {
        primary: isDark ? "#60a5fa" : "#3b82f6",
        primaryHover: isDark ? "#93c5fd" : "#2563eb",
        accent: isDark ? "#fbbf24" : "#eab308",
        bg: isDark ? "radial-gradient(circle at top, #0f172a 0%, #020617 100%)" : "radial-gradient(circle at top, #f8fafc 0%, #f1f5f9 100%)",
        cardBg: isDark ? "rgba(30, 41, 59, 0.75)" : "rgba(255, 255, 255, 0.9)",
        cardBorder: isDark ? "rgba(255, 255, 255, 0.08)" : "rgba(15, 23, 42, 0.06)",
        textMain: isDark ? "#f8fafc" : "#0f172a",
        textMuted: isDark ? "#94a3b8" : "#64748b",
        glow: isDark ? "rgba(59, 130, 246, 0.15)" : "rgba(59, 130, 246, 0.05)",
      },
      emerald: {
        primary: isDark ? "#34d399" : "#10b981",
        primaryHover: isDark ? "#6ee7b7" : "#059669",
        accent: isDark ? "#a78bfa" : "#8b5cf6",
        bg: isDark ? "radial-gradient(circle at top, #062f22 0%, #022c22 100%)" : "radial-gradient(circle at top, #f0fdf4 0%, #e8f5e9 100%)",
        cardBg: isDark ? "rgba(6, 78, 59, 0.4)" : "rgba(255, 255, 255, 0.92)",
        cardBorder: isDark ? "rgba(255, 255, 255, 0.08)" : "rgba(6, 78, 59, 0.06)",
        textMain: isDark ? "#f0fdf4" : "#064e3b",
        textMuted: isDark ? "#a7f3d0" : "#047857",
        glow: isDark ? "rgba(16, 185, 129, 0.15)" : "rgba(16, 185, 129, 0.05)",
      },
      sunset: {
        primary: isDark ? "#f472b6" : "#ec4899",
        primaryHover: isDark ? "#f472b6" : "#db2777",
        accent: isDark ? "#fb923c" : "#f97316",
        bg: isDark ? "radial-gradient(circle at top, #1e1b4b 0%, #090514 100%)" : "radial-gradient(circle at top, #fff5f5 0%, #ffe3e3 100%)",
        cardBg: isDark ? "rgba(30, 27, 75, 0.5)" : "rgba(255, 255, 255, 0.9)",
        cardBorder: isDark ? "rgba(255, 255, 255, 0.08)" : "rgba(157, 23, 77, 0.06)",
        textMain: isDark ? "#fdf2f8" : "#4c0519",
        textMuted: isDark ? "#f472b6" : "#9d174d",
        glow: isDark ? "rgba(236, 72, 153, 0.15)" : "rgba(236, 72, 153, 0.05)",
      },
      ocean: {
        primary: isDark ? "#38bdf8" : "#0284c7",
        primaryHover: isDark ? "#7dd3fc" : "#0369a1",
        accent: isDark ? "#34d399" : "#10b981",
        bg: isDark ? "radial-gradient(circle at top, #0b1e36 0%, #030712 100%)" : "radial-gradient(circle at top, #f0f9ff 0%, #e0f2fe 100%)",
        cardBg: isDark ? "rgba(15, 32, 67, 0.7)" : "rgba(255, 255, 255, 0.92)",
        cardBorder: isDark ? "rgba(255, 255, 255, 0.08)" : "rgba(3, 105, 161, 0.06)",
        textMain: isDark ? "#f0f9ff" : "#0369a1",
        textMuted: isDark ? "#7dd3fc" : "#0284c7",
        glow: isDark ? "rgba(2, 132, 199, 0.15)" : "rgba(2, 132, 199, 0.05)",
      },
      cyber: {
        primary: "#ff007f", // Neon Pink
        primaryHover: "#ff3399",
        accent: "#00ffff", // Neon Cyan
        bg: "radial-gradient(circle at top, #0c001a 0%, #010005 100%)",
        cardBg: "rgba(18, 0, 36, 0.75)",
        cardBorder: "1.5px solid #ff007f",
        textMain: "#00ffff",
        textMuted: "#d946ef",
        glow: "rgba(255, 0, 127, 0.3)",
      },
    };

    const activePalette = palettes[theme.palette];

    // 2. Border & Shadow Styles
    let cardStyleStyles = {};
    if (theme.cardStyle === "sleek") {
      cardStyleStyles = {
        borderRadius: "20px",
        border: theme.palette === "cyber" ? "1.5px solid #ff007f" : `1px solid ${activePalette.cardBorder}`,
        boxShadow: isDark 
          ? "0 10px 30px -10px rgba(0, 0, 0, 0.7), inset 0 1px 0 rgba(255,255,255,0.05)" 
          : "0 10px 30px -10px rgba(15, 23, 42, 0.08), inset 0 1px 0 rgba(255,255,255,0.8)",
        backdropFilter: "blur(12px)",
      };
    } else if (theme.cardStyle === "flat") {
      cardStyleStyles = {
        borderRadius: "6px",
        border: theme.palette === "cyber" ? "1px solid #ff007f" : `1px solid ${activePalette.cardBorder}`,
        boxShadow: "none",
      };
    } else if (theme.cardStyle === "brutalist") {
      cardStyleStyles = {
        borderRadius: "0px",
        border: "3.5px solid #000000",
        boxShadow: isDark ? "6px 6px 0px rgba(255,255,255,0.15)" : "6px 6px 0px #000000",
      };
    }

    // 3. Fonts
    let fontClass = "font-sans";
    if (theme.font === "google") fontClass = "font-google-sans";
    if (theme.font === "mono") fontClass = "font-english font-mono";

    return {
      colors: activePalette,
      card: cardStyleStyles,
      fontClass,
    };
  };

  const style = getThemeStyles();
  const { lang } = useLang();
  const kh = lang === "kh";
  const name = user?.displayName ?? user?.username ?? "Student";

  // Prevent flash by waiting until mounted for premium effects
  if (!mounted) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
          <span className="font-semibold text-slate-500">Loading Premium Dashboard...</span>
        </div>
      </div>
    );
  }

  const isBrutalist = theme.cardStyle === "brutalist";
  const isDark = theme.mode === "dark";

  return (
    <div 
      className={`min-h-screen py-10 transition-colors duration-500 relative overflow-hidden ${style.fontClass}`}
      style={{ background: style.colors.bg, color: style.colors.textMain }}
    >
      {/* Background patterns */}
      {theme.background === "dots" && (
        <div 
          className="absolute inset-0 pointer-events-none opacity-[0.25] transition-opacity duration-500" 
          style={{
            backgroundImage: `radial-gradient(circle, ${style.colors.primary} 1px, transparent 1px)`,
            backgroundSize: "24px 24px"
          }}
        />
      )}
      {theme.background === "grid" && (
        <div 
          className="absolute inset-0 pointer-events-none opacity-[0.08] transition-opacity duration-500" 
          style={{
            backgroundImage: `linear-gradient(${style.colors.primary} 1px, transparent 1px), linear-gradient(90deg, ${style.colors.primary} 1px, transparent 1px)`,
            backgroundSize: "36px 36px"
          }}
        />
      )}

      {/* ── Main Layout Container ── */}
      <div className="max-w-5xl mx-auto px-5 flex flex-col gap-6 relative z-10">
        
        {/* Top Control Bar */}
        <div className="flex justify-between items-center w-full">
          {/* Left: user greeting */}
          <div className="flex items-center gap-2 min-w-0">
            <Sparkles className="w-4 h-4 flex-shrink-0 animate-pulse" style={{ color: style.colors.accent }} />
            <span className="text-sm font-black truncate" style={{ color: style.colors.textMain }}>
              {name}
            </span>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Edit Profile */}
            <button
              onClick={() => { setDrawerTab("profile"); setIsEditProfileOpen(true); }}
              className="flex items-center gap-1.5 px-3 sm:px-4 py-2 border text-xs font-black uppercase"
              style={{
                borderRadius: isBrutalist ? "0px" : "12px",
                background: style.colors.primary,
                borderColor: isBrutalist ? "#000000" : "transparent",
                color: isDark ? "#0f172a" : "#ffffff",
                boxShadow: isBrutalist ? "3px 3px 0 #000" : undefined,
              }}
            >
              <Pencil className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Edit Profile</span>
            </button>

            {/* Customize Theme */}
            <button
              onClick={() => setIsPanelOpen(true)}
              className="flex items-center gap-1.5 px-3 sm:px-4 py-2 border text-xs font-black uppercase"
              style={{
                borderRadius: isBrutalist ? "0px" : "12px",
                background: style.colors.cardBg,
                borderColor: isBrutalist ? "#000000" : style.colors.cardBorder,
                color: style.colors.textMain,
                boxShadow: isBrutalist ? "3px 3px 0 #000" : undefined,
              }}
            >
              <Palette className="w-4 h-4" />
              <span className="hidden sm:inline">Theme</span>
            </button>
          </div>
        </div>

        {/* Dynamic Layout Wrapper */}
        <div className={`grid gap-6 ${
          theme.layout === "sidebar" ? "grid-cols-1 md:grid-cols-12" : "grid-cols-1"
        }`}>
          
          {/* Left Column in Sidebar Layout (Width: 4/12), else normal row */}
          <div className={`${theme.layout === "sidebar" ? "md:col-span-4 flex flex-col gap-6" : "w-full flex flex-col gap-6"}`}>
            
            {/* ── Profile Header Card ── */}
            <div
              style={{
                ...style.card,
                background: style.colors.cardBg,
                overflow: "hidden",
                position: "relative",
              }}
              className={`p-6 transition-all duration-300 ${
                theme.microAnimations ? "hover:translate-y-[-2px]" : ""
              }`}
            >
              {/* Tier-accent top stripe */}
              <div
                className="absolute top-0 left-0 w-full h-[5px]"
                style={{
                  background: tier.borderGradient,
                  backgroundSize: "300% 300%",
                  animation: tier.animated && theme.glowEnabled ? "rankShimmer 3s ease infinite" : undefined,
                }}
              />
              <style>{`
                @keyframes rankShimmer {
                  0%   { background-position: 0% 50%; }
                  50%  { background-position: 100% 50%; }
                  100% { background-position: 0% 50%; }
                }
              `}</style>

              <div className={`flex ${theme.layout === "sidebar" ? "flex-col items-center text-center" : "flex-col sm:flex-row"} gap-5 items-center`}>
                {/* Avatar — brand DNA: tier ring + black border + yellow camera btn */}
                <div className="relative flex-shrink-0">
                  <div style={{
                    padding: tier.id === "rookie" ? 3 : 5,
                    borderRadius: "50%",
                    background: tier.borderGradient,
                    backgroundSize: tier.animated ? "300% 300%" : "100%",
                    animation: tier.animated && theme.glowEnabled ? "rankShimmer 3s ease infinite" : undefined,
                  }}>
                    <div style={{ padding: "3px", borderRadius: "50%", background: isDark ? "#0d1117" : "#fff" }}>
                      <div style={{ borderRadius: "50%", overflow: "hidden", border: "2.5px solid #000" }}>
                        <AvatarDisplay avatar={user.avatar} name={name} size={88} radius={0} />
                      </div>
                    </div>
                  </div>
                  {/* Camera — square, yellow, brand DNA */}
                  <button
                    onClick={() => setIsEditProfileOpen(true)}
                    style={{
                      position: "absolute", bottom: "2px", right: "2px",
                      width: "22px", height: "22px",
                      background: "#eab308", border: "2px solid #000",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      cursor: "pointer", boxShadow: "2px 2px 0 #000",
                    }}
                  >
                    <Camera className="w-3 h-3" style={{ color: "#000" }} />
                  </button>
                </div>

                <div className="flex-1 w-full">
                  <div className="flex items-center gap-2 flex-wrap mb-1 justify-center sm:justify-start">
                    <h1 className="text-2xl font-black tracking-tight" style={{ color: style.colors.textMain }}>
                      {name}
                    </h1>
                  </div>
                  <p className="text-xs font-semibold opacity-70 mb-3 block text-center sm:text-left">
                    {user.email}
                  </p>

                  {/* Status Pills */}
                  <div className="flex flex-wrap gap-2 items-center justify-center sm:justify-start">
                    <span
                      style={{
                        padding: "3px 10px",
                        fontSize: "10px",
                        fontWeight: 900,
                        textTransform: "uppercase",
                        letterSpacing: "0.1em",
                        background: style.colors.primary,
                        color: isDark ? "#0f172a" : "#ffffff",
                        border: isBrutalist ? "2px solid #000" : undefined,
                        borderRadius: isBrutalist ? "0px" : "20px",
                        boxShadow: isBrutalist ? "2px 2px 0 #000" : undefined,
                      }}
                      className="inline-flex items-center shadow-sm"
                    >
                      <GraduationCap className="w-3 h-3 mr-1" />
                      Student
                    </span>
                    <RankBadge lifetimePoints={rankStats.lifetimePoints} size="md" />
                  </div>

                  {/* Next Rank progress indicator - Compact layout if Sidebar */}
                  {nextTier ? (
                    <div className="mt-4 pt-3 border-t" style={{ borderColor: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)" }}>
                      <div className="flex justify-between items-center text-[10px] font-black uppercase opacity-65 mb-1.5">
                        <span>Next: {nextTier.label}</span>
                        <span style={{ color: style.colors.primary }}>{pointsRemaining.toLocaleString()} PTS to go</span>
                      </div>
                      <div className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div 
                          className="h-full rounded-full transition-all duration-700"
                          style={{
                            width: `${nextProgress}%`,
                            background: nextTier.labelGradient,
                          }}
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="mt-4 pt-2 text-[10px] font-black text-emerald-500 dark:text-emerald-400 uppercase tracking-widest flex items-center gap-1 justify-center sm:justify-start">
                      <Sparkles className="w-3.5 h-3.5" />
                      Max Level Reached!
                    </div>
                  )}
                </div>
              </div>
            </div>

          </div>

          {/* Right Column in Sidebar Layout (Width: 8/12), else normal row */}
          <div className={`${theme.layout === "sidebar" ? "md:col-span-8 flex flex-col gap-6" : "w-full flex flex-col gap-6"}`}>
            
            {/* ── Scoreboard Statistics Grid ── */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                {
                  label: "Total Score", labelKh: "ពិន្ទុសរុប",
                  value: rankStats.lifetimePoints.toLocaleString(),
                  color: "#3b82f6", bgGlow: "rgba(59, 130, 246, 0.08)", icon: Zap,
                },
                {
                  label: "Challenges", labelKh: "ការប្រកួតប្រជែង",
                  value: rankStats.totalGamesPlayed.toString(),
                  color: "#10b981", bgGlow: "rgba(16, 185, 129, 0.08)", icon: BookOpen,
                },
                {
                  label: "Current Rank", labelKh: "ចំណាត់ថ្នាក់បច្ចុប្បន្ន",
                  value: rankStats.currentRank ? `#${rankStats.currentRank}` : "—",
                  color: "#f59e0b", bgGlow: "rgba(245, 158, 11, 0.08)", icon: Trophy,
                },
                {
                  label: "Highest Score", labelKh: "ពិន្ទុខ្ពស់បំផុត",
                  value: rankStats.highestScore.toLocaleString(),
                  color: "#8b5cf6", bgGlow: "rgba(139, 92, 246, 0.08)", icon: Target,
                },
              ].map(({ label, labelKh, value, color, bgGlow, icon: Icon }) => (
                <div
                  key={label}
                  style={{
                    ...style.card,
                    background: style.colors.cardBg,
                    position: "relative",
                  }}
                  className={`p-5 transition-all duration-300 relative group overflow-hidden ${
                    theme.microAnimations ? "hover:translate-y-[-3px] hover:scale-[1.02]" : ""
                  }`}
                >
                  {/* Hover Accent Glow */}
                  {theme.mode === "dark" && (
                    <div 
                      className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                      style={{ background: bgGlow }}
                    />
                  )}

                  <div className="flex justify-between items-start mb-2">
                    <span 
                      style={{ color }}
                      className="text-3xl font-black tracking-tight tabular-nums block"
                    >
                      {value}
                    </span>
                    <div 
                      className="p-1.5 rounded-lg border border-transparent dark:border-white/5 bg-slate-50 dark:bg-white/5 transition-transform duration-300 group-hover:scale-110"
                      style={{ color }}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                  </div>
                  
                  <div className="flex flex-col gap-0.5">
                    <span className={`text-xs font-black tracking-wide uppercase opacity-75 ${kh ? "font-google-sans" : ""}`}>
                      {kh ? labelKh : label}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Split Classroom & Rank Tiers cards if stacked, else in right column */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* ── Classroom Details ── */}
              <div
                style={{
                  ...style.card,
                  background: style.colors.cardBg,
                }}
                className={`p-6 transition-all duration-300 ${
                  theme.microAnimations ? "hover:translate-y-[-2px]" : ""
                }`}
              >
                <div className="flex items-center justify-between border-b pb-4 mb-4" style={{ borderColor: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)" }}>
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500">
                      <School className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className={`text-sm font-black uppercase tracking-wider text-slate-800 dark:text-slate-100 leading-tight ${kh ? "font-google-sans" : ""}`}>
                        {kh ? "ថ្នាក់រៀនរបស់ខ្ញុំ" : "My Classroom"}
                      </h3>
                    </div>
                  </div>
                  
                  {studentClassInfo && (
                    <span 
                      style={{
                        background: "#10b981",
                        color: "#fff",
                        padding: "3px 10px",
                        fontSize: "9px",
                        fontWeight: 900,
                        textTransform: "uppercase",
                        borderRadius: isBrutalist ? "0px" : "20px",
                        border: isBrutalist ? "2px solid #000" : undefined,
                        boxShadow: isBrutalist ? "1px 1px 0 #000" : undefined,
                      }}
                      className="shadow-sm"
                    >
                      {kh ? "បានចូលរួម" : "Enrolled"}
                    </span>
                  )}
                </div>

                {studentClassInfo ? (
                  <div className="flex flex-col gap-4">
                    <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-900/40 p-3" style={{ borderRadius: isBrutalist ? "0px" : "10px" }}>
                      <span className="font-black text-lg text-blue-600 dark:text-blue-400">
                        {studentClassInfo.className}
                        {studentClassInfo.section ? ` (${studentClassInfo.section})` : ""}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-xs">
                      <div>
                        <div className={`text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5 ${kh ? "font-google-sans" : ""}`}>{kh ? "សាលារៀន" : "School"}</div>
                        <div className="font-bold opacity-90">{studentClassInfo.schoolName}</div>
                      </div>
                      <div>
                        <div className={`text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5 ${kh ? "font-google-sans" : ""}`}>{kh ? "ខេត្ត" : "Province"}</div>
                        <div className="font-bold opacity-90">{studentClassInfo.province}</div>
                      </div>
                      <div>
                        <div className={`text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5 ${kh ? "font-google-sans" : ""}`}>{kh ? "គ្រូបង្រៀន" : "Teacher"}</div>
                        <div className="font-bold opacity-90">{studentClassInfo.teacherName ?? "—"}</div>
                      </div>
                      <div>
                        <div className={`text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5 ${kh ? "font-google-sans" : ""}`}>{kh ? "កម្រិតថ្នាក់" : "Grade Level"}</div>
                        <div className="font-bold opacity-90">{studentClassInfo.gradeLevel}</div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col gap-3 py-4 text-center sm:text-left">
                    <p className={`text-sm font-black opacity-80 ${kh ? "font-google-sans" : ""}`}>
                      {kh ? "អ្នកមិនទាន់បានចុះឈ្មោះក្នុងថ្នាក់ណាមួយទេ។" : "You are not currently enrolled in any class."}
                    </p>
                    <p className={`text-[11px] opacity-60 ${kh ? "font-google-sans" : ""}`}>
                      {kh ? "សូមស្នើសុំលេខកូដថ្នាក់ពីគ្រូរបស់អ្នក។" : "Ask your teacher for a class code. Below are your current registration details:"}
                    </p>

                    <div
                      className="p-3 border flex flex-col gap-2 text-xs bg-slate-50 dark:bg-slate-900/30"
                      style={{
                        borderRadius: isBrutalist ? "0px" : "10px",
                        borderColor: isBrutalist ? "#000" : "rgba(0,0,0,0.06)",
                        borderWidth: isBrutalist ? "2px" : "1px",
                      }}
                    >
                      <div className="grid grid-cols-2 gap-2 text-[11px]">
                        <div><strong>{kh ? "សាលារៀន:" : "School:"}</strong> {user.schoolName ?? "—"}</div>
                        <div><strong>{kh ? "ខេត្ត:" : "Province:"}</strong> {user.province ?? "—"}</div>
                        <div><strong>{kh ? "ថ្នាក់:" : "Grade:"}</strong> {user.gradeLevel ?? "—"}</div>
                        <div><strong>{kh ? "ក្រុម:" : "Section:"}</strong> {user.section ?? "—"}</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* ── Rank Tiers Showcase ── */}
              <div
                style={{
                  ...style.card,
                  background: style.colors.cardBg,
                }}
                className={`p-6 transition-all duration-300 ${
                  theme.microAnimations ? "hover:translate-y-[-2px]" : ""
                }`}
              >
                <div className="flex items-center justify-between border-b pb-4 mb-4" style={{ borderColor: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)" }}>
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-xl bg-purple-500/10 text-purple-500">
                      <Award className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className={`text-sm font-black uppercase tracking-wider text-slate-800 dark:text-slate-100 leading-tight ${kh ? "font-google-sans" : ""}`}>
                        {kh ? "កម្រិតគណនីសិស្ស" : "Rank Tiers"}
                      </h3>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-4">
                  <p className={`text-[11px] opacity-75 ${kh ? "font-google-sans" : ""}`}>
                    {kh ? "ទទួលពិន្ទុដោយដោះស្រាយតេស្ត ដើម្បីឡើងថ្នាក់ និងទទួលរង្វាន់ប្រណីត។" : "Earn points by solving quizzes to rank up and claim prestigious borders and titles."}
                  </p>

                  {/* Progressive Rank Showcase Grid */}
                  <div className="grid grid-cols-3 gap-2">
                    {RANK_TIERS.map((tierItem) => {
                      const unlocked = rankStats.lifetimePoints >= tierItem.minPoints;
                      const isCurrent = tierItem.id === tier.id;
                      const Icon = TIER_ICONS[tierItem.id] || Star;
                      
                      return (
                        <div
                          key={tierItem.id}
                          className="flex flex-col items-center gap-1.5 p-2.5 rounded-xl border-2 transition-all duration-300 text-center relative overflow-hidden group"
                          style={{
                            borderColor: isCurrent ? tierItem.accent : unlocked ? `${tierItem.accent}44` : "transparent",
                            background: isCurrent 
                              ? `${tierItem.glow}20` 
                              : unlocked 
                                ? "rgba(255, 255, 255, 0.03)" 
                                : isDark ? "rgba(255, 255, 255, 0.01)" : "rgba(0,0,0,0.01)",
                            opacity: unlocked ? 1 : 0.4,
                            boxShadow: isCurrent && theme.glowEnabled ? `0 0 14px ${tierItem.glow}44` : undefined,
                            borderRadius: isBrutalist ? "0px" : "12px",
                            borderWidth: isBrutalist ? "2px" : "1.5px",
                            borderStyle: isBrutalist ? "solid" : unlocked ? "dashed" : "solid",
                          }}
                        >
                          <div 
                            className="p-1 rounded-lg transition-transform duration-300 group-hover:scale-110"
                            style={{ color: unlocked ? tierItem.accent : "#94a3b8" }}
                          >
                            <Icon className="w-5 h-5" />
                          </div>

                          <span
                            className="text-[9px] font-black uppercase tracking-wider block"
                            style={{ color: unlocked ? tierItem.accent : "#64748b" }}
                          >
                            {tierItem.label}
                          </span>

                          <span className="text-[8px] opacity-50 tabular-nums">
                            {tierItem.minPoints === 0 ? "Start" : `${tierItem.minPoints} pts`}
                          </span>

                          {isCurrent && (
                            <span 
                              className="absolute top-0 right-0 text-[6px] font-black uppercase px-1 py-0.5 rounded-bl"
                              style={{ background: tierItem.accent, color: tierItem.textColor }}
                            >
                              Current
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>


          </div>

        </div>

      </div>

      {/* ── Edit Profile Drawer (Brutalist Brand Style) ── */}
      <div
        className={`fixed inset-0 z-50 transition-opacity duration-300 ${
          isEditProfileOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        style={{ background: "rgba(0,0,0,0.7)" }}
      >
        <div className="absolute inset-0" onClick={() => setIsEditProfileOpen(false)} />
        <div
          className={`absolute right-0 top-0 h-full w-full max-w-md flex flex-col transition-transform duration-300 ${
            isEditProfileOpen ? "translate-x-0" : "translate-x-full"
          }`}
          style={{
            background: isDark ? "#0d1117" : "#ffffff",
            borderLeft: isDark ? "3px solid #ffffff" : "3px solid #000000",
            color: isDark ? "#f0f2f5" : "#000000",
          }}
        >

          {/* ── Caution stripe at top ── */}
          <div style={{
            height: "5px",
            background: "repeating-linear-gradient(90deg,#eab308 0,#eab308 18px,#000 18px,#000 36px)",
            flexShrink: 0,
          }} />

          {/* ── Header ── */}
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "14px 20px", borderBottom: isDark ? "2px solid #ffffff" : "2px solid #000000",
            flexShrink: 0, background: isDark ? "#0d1117" : "#ffffff",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div style={{ width: "8px", height: "8px", background: "#eab308", border: "2px solid #000", flexShrink: 0 }} />
              <div>
                <div style={{ fontSize: "13px", fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                  {kh ? "កែប្រែប្រវត្តិរូប" : "EDIT PROFILE"}
                </div>
                <div style={{ fontSize: "10px", fontWeight: 700, opacity: 0.5, letterSpacing: "0.06em", textTransform: "uppercase" }}>
                  {user.displayName ?? user.username}
                </div>
              </div>
            </div>
            <button onClick={() => setIsEditProfileOpen(false)} style={{ background: "transparent", border: "none", cursor: "pointer", color: isDark ? "#fff" : "#000" }}>
              <X size={20} strokeWidth={3} />
            </button>
          </div>

          {/* ── Tab navigation ── */}
          <div style={{
            display: "flex", borderBottom: isDark ? "2px solid rgba(255,255,255,0.15)" : "2px solid #000",
            flexShrink: 0, background: isDark ? "#0d1117" : "#ffffff",
          }}>
            {[
              { id: "profile", labelEn: "PROFILE", labelKh: "ប្រវត្តិរូប", icon: User },
              { id: "privacy", labelEn: "PRIVACY", labelKh: "ឯកជនភាព", icon: Shield },
            ].map(({ id, labelEn, labelKh: lkh, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setDrawerTab(id as "profile" | "privacy")}
                style={{
                  flex: 1, padding: "10px 0", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px",
                  fontSize: "11px", fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.08em",
                  cursor: "pointer", border: "none",
                  borderBottom: drawerTab === id ? "3px solid #eab308" : "3px solid transparent",
                  background: drawerTab === id ? (isDark ? "#1a1f2e" : "#fffbeb") : "transparent",
                  color: drawerTab === id ? "#eab308" : (isDark ? "#9ca3af" : "#6b7280"),
                  marginBottom: "-2px",
                }}
              >
                <Icon size={13} />
                {kh ? lkh : labelEn}
              </button>
            ))}
          </div>

          {/* ── Scrollable content ── */}
          <div style={{ flex: 1, overflowY: "auto", padding: "20px" }}>

            {/* ══ PROFILE TAB ══ */}
            {drawerTab === "profile" && (
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>

                {/* Account fields */}
                <div style={{ border: isDark ? "2px solid rgba(255,255,255,0.15)" : "2px solid #000", boxShadow: isDark ? "3px 3px 0 rgba(255,255,255,0.1)" : "3px 3px 0 #000" }}>
                  {/* Section label */}
                  <div style={{ padding: "6px 14px", background: "#eab308", borderBottom: "2px solid #000" }}>
                    <span style={{ fontSize: "10px", fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.1em", color: "#000" }}>
                      {kh ? "ព័ត៌មានគណនី" : "ACCOUNT INFO"}
                    </span>
                  </div>

                  {/* Display Name */}
                  <div style={{ padding: "12px 14px", borderBottom: isDark ? "1px solid rgba(255,255,255,0.1)" : "1px solid #e5e7eb" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "6px" }}>
                      <label style={{ fontSize: "9px", fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.1em", opacity: 0.55 }}>
                        {kh ? "ឈ្មោះបង្ហាញ" : "DISPLAY NAME"}
                      </label>
                      {displayNameCooldown !== null ? (
                        <span style={{ fontSize: "9px", fontWeight: 700, color: "#f59e0b", background: "rgba(245,158,11,0.1)", padding: "2px 6px", border: "1px solid #f59e0b" }}>
                          🔒 {displayNameCooldown}d
                        </span>
                      ) : (
                        <span style={{ fontSize: "9px", fontWeight: 700, color: "#10b981", background: "rgba(16,185,129,0.1)", padding: "2px 6px", border: "1px solid #10b981" }}>
                          {kh ? "ផ្លាស់ប្តូរបាន" : "CAN CHANGE"}
                        </span>
                      )}
                    </div>
                    <input
                      value={editDisplayName}
                      onChange={(e) => setEditDisplayName(e.target.value)}
                      disabled={displayNameCooldown !== null}
                      maxLength={40}
                      style={{
                        width: "100%", padding: "8px 10px", fontSize: "14px", fontWeight: 700,
                        border: isDark ? "2px solid rgba(255,255,255,0.2)" : "2px solid #000",
                        background: displayNameCooldown !== null ? (isDark ? "#0d1117" : "#f5f5f0") : (isDark ? "#1a1f2e" : "#fff"),
                        color: isDark ? "#f0f2f5" : "#000", outline: "none",
                        opacity: displayNameCooldown !== null ? 0.6 : 1, boxSizing: "border-box",
                      }}
                    />
                    {displayNameCooldown !== null && (
                      <p style={{ fontSize: "10px", color: "#f59e0b", fontWeight: 700, marginTop: "4px" }}>
                        {kh ? `អាចផ្លាស់ប្តូរបន្ទាប់ ${displayNameCooldown} ថ្ងៃទៀត (រៀងរាល់ ៦ ខែ)` : `Available in ${displayNameCooldown} days — changes every 6 months`}
                      </p>
                    )}
                  </div>

                  {/* Username */}
                  <div style={{ padding: "12px 14px", borderBottom: isDark ? "1px solid rgba(255,255,255,0.1)" : "1px solid #e5e7eb" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "6px" }}>
                      <label style={{ fontSize: "9px", fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.1em", opacity: 0.55 }}>
                        {kh ? "ឈ្មោះគណនី" : "USERNAME"}
                      </label>
                      {usernameCooldown !== null ? (
                        <span style={{ fontSize: "9px", fontWeight: 700, color: "#f59e0b", background: "rgba(245,158,11,0.1)", padding: "2px 6px", border: "1px solid #f59e0b" }}>
                          🔒 {usernameCooldown}d
                        </span>
                      ) : (
                        <span style={{ fontSize: "9px", fontWeight: 700, color: "#10b981", background: "rgba(16,185,129,0.1)", padding: "2px 6px", border: "1px solid #10b981" }}>
                          {kh ? "ផ្លាស់ប្តូរបាន" : "CAN CHANGE"}
                        </span>
                      )}
                    </div>
                    <input
                      value={editUsername}
                      onChange={(e) => setEditUsername(e.target.value)}
                      disabled={usernameCooldown !== null}
                      maxLength={30}
                      style={{
                        width: "100%", padding: "8px 10px", fontSize: "14px", fontWeight: 700, fontFamily: "monospace",
                        border: isDark ? "2px solid rgba(255,255,255,0.2)" : "2px solid #000",
                        background: usernameCooldown !== null ? (isDark ? "#0d1117" : "#f5f5f0") : (isDark ? "#1a1f2e" : "#fff"),
                        color: isDark ? "#f0f2f5" : "#000", outline: "none",
                        opacity: usernameCooldown !== null ? 0.6 : 1, boxSizing: "border-box",
                      }}
                    />
                    {usernameCooldown !== null && (
                      <p style={{ fontSize: "10px", color: "#f59e0b", fontWeight: 700, marginTop: "4px" }}>
                        {kh ? `អាចផ្លាស់ប្តូរបន្ទាប់ ${usernameCooldown} ថ្ងៃទៀត (រៀងរាល់ ១ ឆ្នាំ)` : `Available in ${usernameCooldown} days — changes once per year`}
                      </p>
                    )}
                  </div>

                  {/* Email (read-only) */}
                  <div style={{ padding: "12px 14px" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "6px" }}>
                      <label style={{ fontSize: "9px", fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.1em", opacity: 0.55 }}>
                        {kh ? "អ៊ីមែល" : "EMAIL"}
                      </label>
                      <span style={{ fontSize: "9px", fontWeight: 700, opacity: 0.4, display: "flex", alignItems: "center", gap: "3px" }}>
                        <Lock size={10} /> {kh ? "ចាក់សោ" : "LOCKED"}
                      </span>
                    </div>
                    <div style={{
                      padding: "8px 10px", fontSize: "13px", fontWeight: 600, opacity: 0.6,
                      border: isDark ? "2px solid rgba(255,255,255,0.1)" : "2px solid rgba(0,0,0,0.15)",
                      background: isDark ? "#0d1117" : "#f9fafb", color: isDark ? "#9ca3af" : "#6b7280",
                      overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                    }}>
                      {user.email}
                    </div>
                  </div>
                </div>

                {/* Save info button */}
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  <button
                    onClick={saveInfo}
                    disabled={infoSaving}
                    style={{
                      padding: "12px 0", background: "#eab308", color: "#000",
                      border: "2px solid #000", boxShadow: "4px 4px 0 #000",
                      fontWeight: 900, fontSize: "12px", textTransform: "uppercase",
                      letterSpacing: "0.08em", cursor: infoSaving ? "not-allowed" : "pointer",
                      opacity: infoSaving ? 0.7 : 1, width: "100%",
                    }}
                  >
                    {infoSaving ? (kh ? "កំពុងរក្សាទុក…" : "SAVING…") : (kh ? "រក្សាទុកព័ត៌មាន" : "SAVE CHANGES")}
                  </button>
                  {infoSaved && (
                    <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "#10b981", fontSize: "12px", fontWeight: 700 }}>
                      <CheckCircle2 size={14} />
                      {kh ? "បានរក្សាទុក!" : "Saved successfully!"}
                    </div>
                  )}
                  {infoError && (
                    <p style={{ color: "#ef4444", fontSize: "12px", fontWeight: 700 }}>{infoError}</p>
                  )}
                </div>

                {/* Avatar & Display Name via ProfileEditor */}
                <div style={{ border: isDark ? "2px solid rgba(255,255,255,0.15)" : "2px solid #000", boxShadow: isDark ? "3px 3px 0 rgba(255,255,255,0.1)" : "3px 3px 0 #000" }}>
                  <div style={{ padding: "6px 14px", background: "#eab308", borderBottom: "2px solid #000" }}>
                    <span style={{ fontSize: "10px", fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.1em", color: "#000" }}>
                      {kh ? "រូបតំណាង" : "AVATAR"} · <span style={{ fontSize: "9px" }}>{kh ? "ផ្លាស់ប្តូរបានរៀងរាល់ ៦០ ថ្ងៃ" : "CHANGES EVERY 60 DAYS"}</span>
                    </span>
                  </div>
                  <div style={{ padding: "14px" }}>
                    <ProfileEditor
                      initialName={user.displayName ?? user.username}
                      initialAvatar={user.avatar}
                      initialAvatarChangedAt={
                        user.avatarChangedAt
                          ? new Date(user.avatarChangedAt as any).toISOString()
                          : null
                      }
                      role="student"
                      dark={theme.mode === "dark"}
                    />
                  </div>
                </div>

              </div>
            )}

            {/* ══ PRIVACY TAB ══ */}
            {drawerTab === "privacy" && (
              <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>

                {/* Info banner */}
                <div style={{
                  padding: "10px 14px", background: "rgba(234,179,8,0.06)",
                  border: "2px solid #eab308", boxShadow: "2px 2px 0 #eab308",
                  display: "flex", gap: "10px", alignItems: "flex-start",
                }}>
                  <Info size={14} style={{ color: "#eab308", flexShrink: 0, marginTop: "1px" }} />
                  <p style={{ fontSize: "11px", fontWeight: 700, lineHeight: 1.6, color: isDark ? "#fef3c7" : "#92400e" }}>
                    {kh
                      ? "គ្រប់គ្រងអ្វីដែលអ្នកដទៃអាចមើលឃើញ។ ការផ្លាស់ប្តូរមានប្រសិទ្ធភាពភ្លាម។"
                      : "Control what others can see on your public profile. Changes apply immediately."}
                  </p>
                </div>

                {privacyLoading ? (
                  <div style={{ textAlign: "center", padding: "30px 0", color: isDark ? "#9ca3af" : "#6b7280" }}>
                    <RefreshCw size={20} className="animate-spin" style={{ margin: "0 auto 8px" }} />
                    <span style={{ fontSize: "12px", fontWeight: 700, textTransform: "uppercase" }}>Loading…</span>
                  </div>
                ) : (
                  <>
                    {/* Privacy toggles card */}
                    <div style={{ border: isDark ? "2px solid rgba(255,255,255,0.15)" : "2px solid #000", boxShadow: isDark ? "3px 3px 0 rgba(255,255,255,0.1)" : "3px 3px 0 #000" }}>
                      {/* Master toggle */}
                      <div style={{
                        display: "flex", alignItems: "center", justifyContent: "space-between",
                        padding: "12px 14px", background: privacy.isProfilePublic ? "#eab308" : (isDark ? "#18181b" : "#f5f5f0"),
                        borderBottom: isDark ? "1px solid rgba(255,255,255,0.1)" : "1px solid #000",
                      }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          {privacy.isProfilePublic
                            ? <Globe size={15} style={{ color: "#000" }} />
                            : <Lock size={15} style={{ color: isDark ? "#9ca3af" : "#6b7280" }} />
                          }
                          <div>
                            <div style={{ fontSize: "11px", fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.06em", color: privacy.isProfilePublic ? "#000" : undefined }}>
                              {kh ? "ប្រវត្តិរូបសាធារណៈ" : "PUBLIC PROFILE"}
                            </div>
                            <div style={{ fontSize: "9px", fontWeight: 700, opacity: 0.65, color: privacy.isProfilePublic ? "#000" : undefined }}>
                              {privacy.isProfilePublic
                                ? (kh ? "អ្នកដទៃអាចមើលឃើញ" : "Visible to everyone")
                                : (kh ? "ត្រូវបានលាក់ជាឯកជន" : "Hidden from public")}
                            </div>
                          </div>
                        </div>
                        {/* Toggle switch */}
                        <button
                          onClick={() => setPrivacy({ ...privacy, isProfilePublic: !privacy.isProfilePublic })}
                          style={{
                            width: "44px", height: "24px", position: "relative",
                            background: privacy.isProfilePublic ? "#000" : (isDark ? "#374151" : "#d1d5db"),
                            border: "2px solid #000", cursor: "pointer", flexShrink: 0,
                          }}
                        >
                          <span style={{
                            position: "absolute", top: "2px", width: "16px", height: "16px",
                            background: privacy.isProfilePublic ? "#eab308" : "#fff",
                            border: "1px solid #000", transition: "left 0.15s ease",
                            left: privacy.isProfilePublic ? "22px" : "2px",
                          }} />
                        </button>
                      </div>

                      {/* Sub-toggles */}
                      {privacy.isProfilePublic && [
                        { field: "isNamePublic", labelEn: "SHOW FULL NAME", labelKh: "បង្ហាញឈ្មោះ" },
                        { field: "isUsernamePublic", labelEn: "SHOW USERNAME", labelKh: "បង្ហាញឈ្មោះគណនី" },
                        { field: "isSchoolPublic", labelEn: "SHOW SCHOOL", labelKh: "បង្ហាញសាលារៀន" },
                        { field: "isProvincePublic", labelEn: "SHOW PROVINCE", labelKh: "បង្ហាញខេត្ត" },
                        { field: "isGradePublic", labelEn: "SHOW GRADE", labelKh: "បង្ហាញថ្នាក់" },
                        { field: "isSectionPublic", labelEn: "SHOW SECTION", labelKh: "បង្ហាញបន្ទប់" },
                        { field: "isStatsPublic", labelEn: "SHOW STATS & REWARDS", labelKh: "បង្ហាញស្ថិតិ" },
                      ].map(({ field, labelEn, labelKh: lkh }, idx, arr) => {
                        const val = privacy[field as keyof typeof privacy] as boolean;
                        return (
                          <div key={field} style={{
                            display: "flex", alignItems: "center", justifyContent: "space-between",
                            padding: "10px 14px 10px 26px",
                            borderBottom: idx < arr.length - 1 ? (isDark ? "1px solid rgba(255,255,255,0.06)" : "1px solid #f3f4f6") : "none",
                          }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                              {val
                                ? <Eye size={13} style={{ color: "#eab308" }} />
                                : <EyeOff size={13} style={{ opacity: 0.35, color: isDark ? "#9ca3af" : "#6b7280" }} />
                              }
                              <span style={{
                                fontSize: "11px", fontWeight: 800, textTransform: "uppercase",
                                letterSpacing: "0.06em", opacity: val ? 1 : 0.45,
                              }} className={kh ? "font-google-sans" : ""}>
                                {kh ? lkh : labelEn}
                              </span>
                            </div>
                            <button
                              onClick={() => setPrivacy({ ...privacy, [field]: !val })}
                              style={{
                                width: "36px", height: "20px", position: "relative",
                                background: val ? "#000" : (isDark ? "#374151" : "#d1d5db"),
                                border: "1.5px solid #000", cursor: "pointer", flexShrink: 0,
                              }}
                            >
                              <span style={{
                                position: "absolute", top: "2px", width: "12px", height: "12px",
                                background: val ? "#eab308" : "#fff",
                                border: "1px solid rgba(0,0,0,0.3)", transition: "left 0.12s ease",
                                left: val ? "19px" : "2px",
                              }} />
                            </button>
                          </div>
                        );
                      })}
                    </div>

                    {/* Save button */}
                    <button
                      onClick={savePrivacy}
                      disabled={privacySaving}
                      style={{
                        padding: "12px 0", background: "#eab308", color: "#000",
                        border: "2px solid #000", boxShadow: "4px 4px 0 #000",
                        fontWeight: 900, fontSize: "12px", textTransform: "uppercase",
                        letterSpacing: "0.08em", cursor: privacySaving ? "not-allowed" : "pointer",
                        opacity: privacySaving ? 0.7 : 1, width: "100%",
                      }}
                    >
                      {privacySaving
                        ? (kh ? "កំពុងរក្សាទុក…" : "SAVING…")
                        : (kh ? "រក្សាទុក" : "SAVE PRIVACY SETTINGS")}
                    </button>
                    {privacySaved && (
                      <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "#10b981", fontSize: "12px", fontWeight: 700 }}>
                        <CheckCircle2 size={14} />
                        {kh ? "បានរក្សាទុករួចរាល់!" : "Privacy settings saved!"}
                      </div>
                    )}
                    {privacyError && (
                      <p style={{ color: "#ef4444", fontSize: "12px", fontWeight: 700 }}>{privacyError}</p>
                    )}
                  </>
                )}
              </div>
            )}
          </div>

          {/* ── Footer ── */}
          <div style={{
            padding: "12px 20px", borderTop: isDark ? "2px solid rgba(255,255,255,0.15)" : "2px solid #000",
            flexShrink: 0, background: isDark ? "#0d1117" : "#ffffff",
          }}>
            <a
              href="/settings"
              style={{
                display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", width: "100%",
                padding: "8px 0", fontSize: "10px", fontWeight: 900, textTransform: "uppercase",
                letterSpacing: "0.1em", color: isDark ? "#9ca3af" : "#6b7280", textDecoration: "none",
              }}
            >
              <ArrowRight size={12} />
              {kh ? "ការកំណត់គណនីពេញលេញ" : "FULL ACCOUNT SETTINGS"}
            </a>
          </div>

        </div>
      </div>

      {/* ── Drawer Customizer Panel ── */}
      <div
        className={`fixed inset-0 z-50 transition-opacity duration-300 ${
          isPanelOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        style={{ background: "rgba(0, 0, 0, 0.4)" }}
      >
        {/* Click background to close */}
        <div className="absolute inset-0" onClick={() => setIsPanelOpen(false)} />

        <div 
          className={`absolute right-0 top-0 h-full w-full max-w-md bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 p-6 flex flex-col justify-between shadow-2xl transition-transform duration-300 ${
            isPanelOpen ? "translate-x-0" : "translate-x-full"
          }`}
          style={{ color: "#0f172a" }}
        >
          {/* Header */}
          <div className="flex justify-between items-center border-b pb-4 mb-4 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <Palette className="w-5 h-5 text-blue-500" />
              <h2 className="text-base font-black uppercase dark:text-slate-100">
                Design Studio
              </h2>
            </div>
            <button 
              onClick={() => setIsPanelOpen(false)}
              className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 dark:text-slate-300"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Configuration Lists */}
          <div className="flex-1 overflow-y-auto pr-1 flex flex-col gap-6 text-slate-700 dark:text-slate-300">
            
            {/* 1. Base Theme Mode */}
            <div>
              <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-2">
                1. Mode
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: "light", label: "Light Mode", icon: Sun },
                  { id: "dark", label: "Dark Mode", icon: Moon },
                ].map((m) => {
                  const Icon = m.icon;
                  const active = theme.mode === m.id;
                  return (
                    <button
                      key={m.id}
                      onClick={() => saveThemeSettings({ ...theme, mode: m.id as ThemeMode })}
                      className={`flex items-center justify-center gap-2 py-2 px-3 text-xs font-black border transition-all ${
                        active 
                          ? "bg-slate-900 text-white border-slate-900 dark:bg-blue-600 dark:border-blue-600" 
                          : "bg-transparent border-slate-200 dark:border-slate-800 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                      }`}
                      style={{ borderRadius: "8px" }}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      {m.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. Color Palettes */}
            <div>
              <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-2">
                2. Palette Presets
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: "slate", label: "Slate Classic", color: "#3b82f6" },
                  { id: "emerald", label: "Emerald Breeze", color: "#10b981" },
                  { id: "sunset", label: "Sunset Rose", color: "#ec4899" },
                  { id: "ocean", label: "Ocean Deep", color: "#0284c7" },
                  { id: "cyber", label: "Cyber Neon", color: "#ff007f" },
                ].map((p) => {
                  const active = theme.palette === p.id;
                  return (
                    <button
                      key={p.id}
                      onClick={() => saveThemeSettings({ ...theme, palette: p.id as ColorPalette })}
                      className={`flex items-center gap-2 py-2 px-3 text-xs font-black border transition-all ${
                        active 
                          ? "bg-slate-900 text-white border-slate-900 dark:bg-blue-600 dark:border-blue-600" 
                          : "bg-transparent border-slate-200 dark:border-slate-800 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                      }`}
                      style={{ borderRadius: "8px" }}
                    >
                      <span 
                        className="w-3 h-3 rounded-full flex-shrink-0" 
                        style={{ backgroundColor: p.color }}
                      />
                      {p.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 3. Card & Border Styles */}
            <div>
              <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-2">
                3. Corners & Borders
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: "sleek", label: "Sleek Modern" },
                  { id: "flat", label: "Minimal Flat" },
                  { id: "brutalist", label: "Brutalist" },
                ].map((c) => {
                  const active = theme.cardStyle === c.id;
                  return (
                    <button
                      key={c.id}
                      onClick={() => saveThemeSettings({ ...theme, cardStyle: c.id as CardStyle })}
                      className={`py-2.5 px-1.5 text-[10px] font-black uppercase border transition-all text-center ${
                        active 
                          ? "bg-slate-900 text-white border-slate-900 dark:bg-blue-600 dark:border-blue-600" 
                          : "bg-transparent border-slate-200 dark:border-slate-800 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                      }`}
                      style={{ borderRadius: "8px" }}
                    >
                      {c.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 4. Fonts */}
            <div>
              <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-2">
                4. Typography
              </label>
              <div className="grid grid-cols-3 gap-2 font-black uppercase">
                {[
                  { id: "sans", label: "Inter", style: "font-sans" },
                  { id: "google", label: "Branded", style: "font-google-sans" },
                  { id: "mono", label: "Modern Mono", style: "font-mono" },
                ].map((f) => {
                  const active = theme.font === f.id;
                  return (
                    <button
                      key={f.id}
                      onClick={() => saveThemeSettings({ ...theme, font: f.id as FontFamily })}
                      className={`py-2 px-1 text-[9px] border transition-all ${f.style} ${
                        active 
                          ? "bg-slate-900 text-white border-slate-900 dark:bg-blue-600 dark:border-blue-600" 
                          : "bg-transparent border-slate-200 dark:border-slate-800 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                      }`}
                      style={{ borderRadius: "8px" }}
                    >
                      {f.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 5. Background details */}
            <div>
              <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-2">
                5. Background details
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: "dots", label: "Dot Grids" },
                  { id: "grid", label: "Matrix Mesh" },
                  { id: "clean", label: "Solid Clean" },
                ].map((b) => {
                  const active = theme.background === b.id;
                  return (
                    <button
                      key={b.id}
                      onClick={() => saveThemeSettings({ ...theme, background: b.id as BackgroundPattern })}
                      className={`py-2 px-1 text-[10px] font-black uppercase border transition-all ${
                        active 
                          ? "bg-slate-900 text-white border-slate-900 dark:bg-blue-600 dark:border-blue-600" 
                          : "bg-transparent border-slate-200 dark:border-slate-800 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                      }`}
                      style={{ borderRadius: "8px" }}
                    >
                      {b.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 6. Layout Style */}
            <div>
              <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-2">
                6. Layout structure
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: "grid", label: "Dashboard Grid" },
                  { id: "sidebar", label: "Split Sidebar" },
                  { id: "stack", label: "Linear Stack" },
                ].map((l) => {
                  const active = theme.layout === l.id;
                  return (
                    <button
                      key={l.id}
                      onClick={() => saveThemeSettings({ ...theme, layout: l.id as LayoutStyle })}
                      className={`py-2 px-1 text-[9px] font-black uppercase border transition-all ${
                        active 
                          ? "bg-slate-900 text-white border-slate-900 dark:bg-blue-600 dark:border-blue-600" 
                          : "bg-transparent border-slate-200 dark:border-slate-800 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                      }`}
                      style={{ borderRadius: "8px" }}
                    >
                      {l.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 7. Extra details */}
            <div className="border-t pt-4 dark:border-slate-800 flex flex-col gap-3">
              <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                7. Advanced Enhancements
              </label>

              <div className="flex items-center justify-between">
                <span className="text-xs font-bold dark:text-slate-200">Glow effect on High ranks</span>
                <input 
                  type="checkbox"
                  checked={theme.glowEnabled}
                  onChange={(e) => saveThemeSettings({ ...theme, glowEnabled: e.target.checked })}
                  className="w-4 h-4 rounded text-blue-600 dark:bg-slate-800 border-slate-200 dark:border-slate-800"
                />
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs font-bold dark:text-slate-200">Micro-animations & Hover zooms</span>
                <input 
                  type="checkbox"
                  checked={theme.microAnimations}
                  onChange={(e) => saveThemeSettings({ ...theme, microAnimations: e.target.checked })}
                  className="w-4 h-4 rounded text-blue-600 dark:bg-slate-800 border-slate-200 dark:border-slate-800"
                />
              </div>
            </div>

          </div>

          {/* Footer Save & Reset Buttons */}
          <div className="border-t pt-4 mt-4 dark:border-slate-800 flex gap-2">
            <button
              onClick={resetTheme}
              className="flex-1 py-2 px-3 border border-slate-200 dark:border-slate-800 text-xs font-black uppercase hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors"
              style={{ borderRadius: "8px" }}
            >
              Reset Default
            </button>
            <button
              onClick={() => setIsPanelOpen(false)}
              className="flex-1 py-2 px-3 bg-slate-900 hover:bg-slate-800 text-white text-xs font-black uppercase dark:bg-blue-600 dark:hover:bg-blue-500 transition-colors"
              style={{ borderRadius: "8px" }}
            >
              Apply Theme
            </button>
          </div>

        </div>
      </div>

    </div>
  );
}
