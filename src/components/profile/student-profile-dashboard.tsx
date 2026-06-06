"use client";

import React, { useState, useEffect } from "react";
import {
  BookOpen, GraduationCap, Award, Zap, Trophy, Target,
  X, Camera, CheckCircle2, School, Sprout, PartyPopper,
  Star, Trophy as TierTrophy, Gem, Crown, Mail, AtSign,
  Info, Globe, Lock, Eye, EyeOff, User, Shield, Pencil,
  ExternalLink, RefreshCw, ChevronRight, Send, KeyRound,
} from "lucide-react";
import {
  getRank, getNextRank, tierProgress, pointsToNextRank, RANK_TIERS,
} from "@/lib/rank-utils";
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

type DrawerTab = "profile" | "privacy";
type EmailStep = "idle" | "request" | "confirm";

export function StudentProfileDashboard({
  user,
  highestScore,
  totalGamesPlayed,
  lifetimePoints,
  studentClassInfo,
}: StudentProfileDashboardProps) {
  const { lang } = useLang();
  const kh = lang === "kh";
  const kf = kh ? { fontFamily: "Siemreap, sans-serif" } : {};
  const name = user.displayName ?? user.username ?? "Student";

  // ── Drawer state ──────────────────────────────────────────────────────────
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerTab, setDrawerTab] = useState<DrawerTab>("profile");

  // ── Edit fields ───────────────────────────────────────────────────────────
  const [editDisplayName, setEditDisplayName] = useState(name);
  const [editUsername, setEditUsername] = useState(user.username);
  const [displayNameCooldown, setDisplayNameCooldown] = useState<number | null>(null);
  const [usernameCooldown, setUsernameCooldown] = useState<number | null>(null);
  const [infoSaving, setInfoSaving] = useState(false);
  const [infoSaved, setInfoSaved] = useState(false);
  const [infoError, setInfoError] = useState("");

  // ── Email change ──────────────────────────────────────────────────────────
  const [emailStep, setEmailStep] = useState<EmailStep>("idle");
  const [newEmail, setNewEmail] = useState("");
  const [emailCode, setEmailCode] = useState("");
  const [emailBusy, setEmailBusy] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [emailSuccess, setEmailSuccess] = useState("");

  // ── Privacy ───────────────────────────────────────────────────────────────
  const [privacy, setPrivacy] = useState({
    isProfilePublic: true,
    isNamePublic: true,
    isUsernamePublic: true,
    isSchoolPublic: true,
    isProvincePublic: true,
    isGradePublic: true,
    isSectionPublic: true,
    isStatsPublic: true,
  });
  const [privacyLoading, setPrivacyLoading] = useState(false);
  const [privacySaving, setPrivacySaving] = useState(false);
  const [privacySaved, setPrivacySaved] = useState(false);
  const [privacyError, setPrivacyError] = useState("");

  // ── Live stats ────────────────────────────────────────────────────────────
  const [rankStats, setRankStats] = useState({
    highestScore,
    totalGamesPlayed,
    lifetimePoints,
    currentRank: null as number | null,
  });

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch("/api/user/stats");
        if (!res.ok) return;
        const data = await res.json();
        if (data.stats) {
          setRankStats({
            highestScore: data.stats.highestScore || highestScore,
            totalGamesPlayed: data.stats.totalGamesPlayed || totalGamesPlayed,
            lifetimePoints: data.stats.lifetimePoints || lifetimePoints,
            currentRank: data.stats.currentRank || null,
          });
        }
      } catch { /* silent */ }
    }
    fetchStats();
    const interval = setInterval(fetchStats, 45000);
    return () => clearInterval(interval);
  }, [highestScore, totalGamesPlayed, lifetimePoints]);

  // Load settings when drawer opens
  useEffect(() => {
    if (!drawerOpen) return;
    setPrivacyLoading(true);
    fetch("/api/user/settings")
      .then((r) => r.json())
      .then((data) => {
        if (!data.settings) return;
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

        const ONE_YEAR = 365 * 24 * 60 * 60 * 1000;
        const SIX_MONTHS = 183 * 24 * 60 * 60 * 1000;
        if (s.usernameChangedAt) {
          const elapsed = Date.now() - new Date(s.usernameChangedAt).getTime();
          setUsernameCooldown(elapsed < ONE_YEAR ? Math.ceil((ONE_YEAR - elapsed) / 86400000) : null);
        } else {
          setUsernameCooldown(null);
        }
        if (s.displayNameChangedAt) {
          const elapsed = Date.now() - new Date(s.displayNameChangedAt).getTime();
          setDisplayNameCooldown(elapsed < SIX_MONTHS ? Math.ceil((SIX_MONTHS - elapsed) / 86400000) : null);
        } else {
          setDisplayNameCooldown(null);
        }
      })
      .catch(console.error)
      .finally(() => setPrivacyLoading(false));
  }, [drawerOpen]);

  // ── Handlers ──────────────────────────────────────────────────────────────
  const saveInfo = async () => {
    setInfoSaving(true);
    setInfoError("");
    try {
      const payload: Record<string, string> = {};
      if (editDisplayName.trim() && editDisplayName.trim() !== user.displayName)
        payload.displayName = editDisplayName.trim();
      if (editUsername.trim() && editUsername.trim() !== user.username)
        payload.username = editUsername.trim().toLowerCase();
      if (!Object.keys(payload).length) { setInfoSaving(false); return; }
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

  const requestEmailChange = async () => {
    if (!newEmail.includes("@")) { setEmailError("Enter a valid email address."); return; }
    setEmailBusy(true);
    setEmailError("");
    try {
      const res = await fetch("/api/user/email-change/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newEmail: newEmail.trim().toLowerCase() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to send code.");
      setEmailStep("confirm");
      setEmailSuccess(`Verification code sent to ${data.maskedCurrent}.`);
    } catch (e: any) {
      setEmailError(e.message || "Failed to send code.");
    } finally {
      setEmailBusy(false);
    }
  };

  const confirmEmailChange = async () => {
    if (emailCode.length !== 6) { setEmailError("Enter the 6-digit code."); return; }
    setEmailBusy(true);
    setEmailError("");
    try {
      const res = await fetch("/api/user/email-change/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: emailCode }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Invalid code.");
      setEmailSuccess("Email updated successfully.");
      setEmailStep("idle");
      setNewEmail("");
      setEmailCode("");
    } catch (e: any) {
      setEmailError(e.message || "Invalid code.");
    } finally {
      setEmailBusy(false);
    }
  };

  const tier = getRank(rankStats.lifetimePoints);
  const nextTier = getNextRank(rankStats.lifetimePoints);
  const nextProgress = tierProgress(rankStats.lifetimePoints);
  const pointsRemaining = pointsToNextRank(rankStats.lifetimePoints);

  // ── Changes-remaining helpers ─────────────────────────────────────────────
  function ChangeBadge({ cooldown }: { cooldown: number | null }) {
    if (cooldown !== null) {
      return (
        <span className="text-[9px] font-black px-1.5 py-0.5 border border-amber-400 bg-amber-50 text-amber-700 flex items-center gap-1">
          <Lock size={8} /> 0 remaining · {cooldown}d
        </span>
      );
    }
    return (
      <span className="text-[9px] font-black px-1.5 py-0.5 border border-emerald-400 bg-emerald-50 text-emerald-700 flex items-center gap-1">
        <CheckCircle2 size={8} /> 1 remaining
      </span>
    );
  }

  // ── Toggle helper ─────────────────────────────────────────────────────────
  function Toggle({ on, onToggle }: { on: boolean; onToggle: () => void }) {
    return (
      <button
        onClick={onToggle}
        style={{
          width: "40px", height: "22px", position: "relative",
          background: on ? "#000" : "#d1d5db",
          border: "2px solid #000", cursor: "pointer", flexShrink: 0,
          transition: "background 0.15s",
        }}
        aria-checked={on}
        role="switch"
      >
        <span style={{
          position: "absolute", top: "2px", width: "14px", height: "14px",
          background: on ? "#eab308" : "#fff",
          border: "1px solid rgba(0,0,0,0.25)", transition: "left 0.15s ease",
          left: on ? "20px" : "2px",
        }} />
      </button>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 flex flex-col gap-6">

        {/* ── Page header ──────────────────────────────────────────────── */}
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-black tracking-tight text-gray-900" style={kf}>
            {kh ? "ប្រវត្តិរូបរបស់ខ្ញុំ" : "My Profile"}
          </h1>
          <div className="flex items-center gap-2">
            <a
              href={`/u/${user.username}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-black uppercase border-2 border-black bg-white hover:bg-gray-50 transition-colors"
              style={kf}
            >
              <ExternalLink size={12} />
              <span className="hidden sm:inline">{kh ? "មើលទំព័រសាធារណៈ" : "Public Profile"}</span>
            </a>
            <button
              onClick={() => { setDrawerTab("profile"); setDrawerOpen(true); }}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-black uppercase border-2 border-black bg-black text-white hover:bg-gray-800 transition-colors"
              style={kf}
            >
              <Pencil size={12} />
              <span className="hidden sm:inline">{kh ? "កែប្រែ" : "Edit Profile"}</span>
            </button>
          </div>
        </div>

        {/* ── Profile card ─────────────────────────────────────────────── */}
        <div className="bg-white border-2 border-black overflow-hidden shadow-[4px_4px_0_#000]">
          <div className="h-1.5" style={{ background: tier.borderGradient }} />
          <div className="p-6 flex flex-col sm:flex-row gap-5 items-center sm:items-start">

            {/* Avatar */}
            <div className="relative flex-shrink-0">
              <div style={{
                padding: tier.id === "rookie" ? 3 : 5,
                background: tier.borderGradient,
              }}>
                <div style={{ padding: "3px", background: "#fff" }}>
                  <div style={{ overflow: "hidden", border: "2.5px solid #000" }}>
                    <AvatarDisplay avatar={user.avatar} name={name} size={88} radius={0} />
                  </div>
                </div>
              </div>
              <button
                onClick={() => setDrawerOpen(true)}
                className="absolute bottom-0.5 right-0.5 w-6 h-6 bg-yellow-400 border-2 border-black flex items-center justify-center hover:bg-yellow-300 transition-colors"
                aria-label="Change avatar"
              >
                <Camera size={11} />
              </button>
            </div>

            {/* Info */}
            <div className="flex-1 w-full text-center sm:text-left">
              <h2 className="text-2xl font-black tracking-tight text-gray-900 mb-0.5" style={kf}>
                {name}
              </h2>
              <p className="text-sm text-gray-500 font-medium mb-3" style={kf}>{user.email}</p>

              <div className="flex flex-wrap gap-2 justify-center sm:justify-start mb-4">
                <span className="inline-flex items-center gap-1 text-[11px] font-black uppercase px-2 py-0.5 bg-yellow-400 border-2 border-black">
                  <GraduationCap size={11} />
                  {kh ? "សិស្ស" : "Student"}
                </span>
                <RankBadge lifetimePoints={rankStats.lifetimePoints} size="md" />
                {rankStats.currentRank && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-black px-2 py-0.5 bg-black text-yellow-400 border-2 border-black font-mono">
                    <Trophy size={11} />
                    #{rankStats.currentRank}
                  </span>
                )}
              </div>

              {/* Tier progress */}
              {nextTier ? (
                <div>
                  <div className="flex justify-between items-center text-[10px] font-black uppercase text-gray-400 mb-1.5">
                    <span style={kf}>{kh ? "បន្ទាប់:" : "Next:"} {nextTier.label}</span>
                    <span className="text-blue-500 font-mono">{pointsRemaining.toLocaleString()} pts</span>
                  </div>
                  <div className="w-full h-1.5 bg-gray-100 overflow-hidden">
                    <div
                      className="h-full transition-all duration-700"
                      style={{ width: `${nextProgress}%`, background: nextTier.labelGradient }}
                    />
                  </div>
                </div>
              ) : (
                <p className="text-[11px] font-black text-emerald-500 uppercase tracking-widest">
                  ✦ Max Level Reached
                </p>
              )}
            </div>
          </div>
        </div>

        {/* ── Stats grid ───────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {([
            { label: kh ? "ពិន្ទុសរុប" : "Total Score", value: rankStats.lifetimePoints.toLocaleString(), color: "#3b82f6", Icon: Zap },
            { label: kh ? "ចំណាត់ថ្នាក់" : "Current Rank", value: rankStats.currentRank ? `#${rankStats.currentRank}` : "—", color: "#f59e0b", Icon: Trophy },
            { label: kh ? "ការប្រកួត" : "Games Played", value: rankStats.totalGamesPlayed.toLocaleString(), color: "#10b981", Icon: BookOpen },
            { label: kh ? "ពិន្ទុខ្ពស់" : "Highest Score", value: rankStats.highestScore.toLocaleString(), color: "#8b5cf6", Icon: Target },
          ] as const).map(({ label, value, color, Icon }) => (
            <div key={label} className="bg-white border-2 border-black p-5 shadow-[3px_3px_0_#000]">
              <div className="flex items-start justify-between mb-2">
                <span className="text-3xl font-black tabular-nums tracking-tight" style={{ color }}>
                  {value}
                </span>
                <Icon size={16} style={{ color }} className="mt-1" />
              </div>
              <p className="text-[11px] font-black uppercase tracking-wide text-gray-400" style={kf}>
                {label}
              </p>
            </div>
          ))}
        </div>

        {/* ── Classroom + Rank Tiers ────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Classroom card */}
          <div className="bg-white border-2 border-black shadow-[4px_4px_0_#000] overflow-hidden">
            <div className="px-5 py-3.5 border-b-2 border-black flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-amber-50">
                  <School size={16} className="text-amber-500" />
                </div>
                <h3 className="text-sm font-black uppercase tracking-wide text-gray-800" style={kf}>
                  {kh ? "ថ្នាក់រៀនរបស់ខ្ញុំ" : "My Classroom"}
                </h3>
              </div>
              {studentClassInfo && (
                <span className="text-[9px] font-black uppercase px-2 py-0.5 bg-emerald-500 text-white border border-emerald-600">
                  {kh ? "ចុះឈ្មោះ" : "Enrolled"}
                </span>
              )}
            </div>
            <div className="p-5">
              {studentClassInfo ? (
                <div className="flex flex-col gap-4">
                  <div className="bg-gray-50 px-4 py-3">
                    <p className="text-base font-black text-blue-600">
                      {studentClassInfo.className}
                      {studentClassInfo.section ? ` (${studentClassInfo.section})` : ""}
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-3 text-xs">
                    {([
                      [kh ? "សាលារៀន" : "School", studentClassInfo.schoolName],
                      [kh ? "ខេត្ត" : "Province", studentClassInfo.province],
                      [kh ? "គ្រូបង្រៀន" : "Teacher", studentClassInfo.teacherName ?? "—"],
                      [kh ? "ថ្នាក់" : "Grade", studentClassInfo.gradeLevel],
                    ] as [string, string | null][]).map(([lbl, val]) => (
                      <div key={lbl}>
                        <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 mb-0.5" style={kf}>{lbl}</p>
                        <p className="font-bold text-gray-700" style={kf}>{val ?? "—"}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="py-4 text-center sm:text-left">
                  <p className="text-sm font-bold text-gray-500 mb-1" style={kf}>
                    {kh ? "អ្នកមិនទាន់ចុះឈ្មោះ" : "Not enrolled in a class yet."}
                  </p>
                  <p className="text-xs text-gray-400" style={kf}>
                    {kh ? "សូមស្នើសុំលេខកូដថ្នាក់ពីគ្រូ" : "Ask your teacher for a class code."}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Rank Tiers card */}
          <div className="bg-white border-2 border-black shadow-[4px_4px_0_#000] overflow-hidden">
            <div className="px-5 py-3.5 border-b-2 border-black flex items-center gap-2">
              <div className="p-1.5 bg-purple-50">
                <Award size={16} className="text-purple-500" />
              </div>
              <h3 className="text-sm font-black uppercase tracking-wide text-gray-800" style={kf}>
                {kh ? "កម្រិតគណនី" : "Rank Tiers"}
              </h3>
            </div>
            <div className="p-5">
              <p className="text-xs text-gray-400 mb-4" style={kf}>
                {kh ? "ទទួលពិន្ទុដោយដោះស្រាយតេស្ត ដើម្បីឡើងថ្នាក់" : "Earn points by solving quizzes to rank up."}
              </p>
              <div className="grid grid-cols-3 gap-2">
                {RANK_TIERS.map((tierItem) => {
                  const unlocked = rankStats.lifetimePoints >= tierItem.minPoints;
                  const isCurrent = tierItem.id === tier.id;
                  const Icon = TIER_ICONS[tierItem.id] || Star;
                  return (
                    <div
                      key={tierItem.id}
                      className="flex flex-col items-center gap-1 p-2.5 border-2 transition-all text-center relative overflow-hidden"
                      style={{
                        borderColor: isCurrent ? tierItem.accent : unlocked ? `${tierItem.accent}44` : "transparent",
                        background: isCurrent ? `${tierItem.glow}15` : "transparent",
                        opacity: unlocked ? 1 : 0.4,
                        borderStyle: unlocked ? "dashed" : "solid",
                      }}
                    >
                      <div style={{ color: unlocked ? tierItem.accent : "#94a3b8" }}>
                        <Icon size={18} />
                      </div>
                      <span className="text-[9px] font-black uppercase tracking-wider" style={{ color: unlocked ? tierItem.accent : "#64748b" }}>
                        {tierItem.label}
                      </span>
                      <span className="text-[8px] text-gray-400 tabular-nums">
                        {tierItem.minPoints === 0 ? "Start" : `${tierItem.minPoints} pts`}
                      </span>
                      {isCurrent && (
                        <span className="absolute top-0 right-0 text-[6px] font-black uppercase px-1 py-0.5"
                          style={{ background: tierItem.accent, color: tierItem.textColor }}>
                          Now
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

      {/* ════════════════════════════════════════════════════════════════ */}
      {/* Edit Profile Drawer                                              */}
      {/* ════════════════════════════════════════════════════════════════ */}
      <div
        className={`fixed inset-0 z-50 transition-opacity duration-300 ${drawerOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
        style={{ background: "rgba(0,0,0,0.65)" }}
      >
        <div className="absolute inset-0" onClick={() => setDrawerOpen(false)} />

        <div
          className={`absolute right-0 top-0 h-full w-full max-w-md flex flex-col bg-white transition-transform duration-300 ${drawerOpen ? "translate-x-0" : "translate-x-full"}`}
          style={{ borderLeft: "3px solid #000" }}
        >
          {/* Caution stripe */}
          <div style={{ height: "5px", background: "repeating-linear-gradient(90deg,#eab308 0,#eab308 18px,#000 18px,#000 36px)", flexShrink: 0 }} />

          {/* Header */}
          <div className="flex items-center justify-between px-5 py-3.5 border-b-2 border-black flex-shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-2.5 h-2.5 bg-yellow-400 border-2 border-black" />
              <div>
                <p className="text-xs font-black uppercase tracking-widest" style={kf}>
                  {kh ? "ការកំណត់ / Settings" : "Profile Settings"}
                </p>
                <p className="text-[10px] text-gray-400 font-mono">{user.username}</p>
              </div>
            </div>
            <button onClick={() => setDrawerOpen(false)} className="text-black hover:opacity-60">
              <X size={20} strokeWidth={3} />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex border-b-2 border-black flex-shrink-0">
            {([
              { id: "profile", labelEn: "Profile", labelKh: "ប្រវត្តិរូប", Icon: User },
              { id: "privacy", labelEn: "Privacy", labelKh: "ឯកជនភាព", Icon: Shield },
            ] as { id: DrawerTab; labelEn: string; labelKh: string; Icon: any }[]).map(({ id, labelEn, labelKh: lkh, Icon }) => (
              <button
                key={id}
                onClick={() => setDrawerTab(id)}
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-[11px] font-black uppercase tracking-wide transition-colors"
                style={{
                  ...kf,
                  borderBottom: drawerTab === id ? "3px solid #eab308" : "3px solid transparent",
                  background: drawerTab === id ? "#fffbeb" : "transparent",
                  color: drawerTab === id ? "#000" : "#9ca3af",
                  marginBottom: "-2px",
                }}
              >
                <Icon size={13} />
                {kh ? lkh : labelEn}
              </button>
            ))}
          </div>

          {/* Scrollable body */}
          <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-5">

            {/* ══ PROFILE TAB ══════════════════════════════════════════ */}
            {drawerTab === "profile" && (
              <>
                {/* Account info block */}
                <div className="border-2 border-black shadow-[3px_3px_0_#000]">
                  <div className="bg-yellow-400 border-b-2 border-black px-4 py-1.5">
                    <span className="text-[10px] font-black uppercase tracking-widest" style={kf}>
                      {kh ? "ព័ត៌មានគណនី" : "Account Info"}
                    </span>
                  </div>

                  {/* Display Name */}
                  <div className="px-4 py-3 border-b border-gray-100">
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-[9px] font-black uppercase tracking-widest text-gray-400 flex items-center gap-1" style={kf}>
                        <User size={9} />
                        {kh ? "ឈ្មោះបង្ហាញ" : "Display Name"}
                      </label>
                      <ChangeBadge cooldown={displayNameCooldown} />
                    </div>
                    <input
                      value={editDisplayName}
                      onChange={(e) => setEditDisplayName(e.target.value)}
                      disabled={displayNameCooldown !== null}
                      maxLength={40}
                      className="w-full px-3 py-2 text-sm font-bold border-2 border-black outline-none disabled:opacity-50 disabled:bg-gray-50"
                      style={kf}
                    />
                    {displayNameCooldown !== null && (
                      <p className="text-[10px] text-amber-600 font-bold mt-1" style={kf}>
                        {kh ? `ផ្លាស់ប្តូរបន្ទាប់ ${displayNameCooldown} ថ្ងៃ (ម្ដង /៦ ខែ)` : `Available in ${displayNameCooldown} days — once per 6 months`}
                      </p>
                    )}
                  </div>

                  {/* Username */}
                  <div className="px-4 py-3 border-b border-gray-100">
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-[9px] font-black uppercase tracking-widest text-gray-400 flex items-center gap-1" style={kf}>
                        <AtSign size={9} />
                        {kh ? "ឈ្មោះគណនី" : "Username"}
                      </label>
                      <ChangeBadge cooldown={usernameCooldown} />
                    </div>
                    <input
                      value={editUsername}
                      onChange={(e) => setEditUsername(e.target.value)}
                      disabled={usernameCooldown !== null}
                      maxLength={30}
                      className="w-full px-3 py-2 text-sm font-bold font-mono border-2 border-black outline-none disabled:opacity-50 disabled:bg-gray-50"
                    />
                    {usernameCooldown !== null && (
                      <p className="text-[10px] text-amber-600 font-bold mt-1" style={kf}>
                        {kh ? `ផ្លាស់ប្តូរបន្ទាប់ ${usernameCooldown} ថ្ងៃ (ម្ដង /១ ឆ្នាំ)` : `Available in ${usernameCooldown} days — once per year`}
                      </p>
                    )}
                  </div>

                  {/* Email section */}
                  <div className="px-4 py-3">
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-[9px] font-black uppercase tracking-widest text-gray-400 flex items-center gap-1" style={kf}>
                        <Mail size={9} />
                        {kh ? "អ៊ីមែល" : "Email"}
                      </label>
                      {emailStep === "idle" && (
                        <button
                          onClick={() => { setEmailStep("request"); setEmailError(""); setEmailSuccess(""); }}
                          className="text-[9px] font-black text-blue-600 underline underline-offset-2 hover:text-blue-800"
                          style={kf}
                        >
                          {kh ? "ផ្លាស់ប្តូរ" : "Change"}
                        </button>
                      )}
                    </div>

                    {/* Current email (always visible) */}
                    <div className="px-3 py-2 text-sm font-mono text-gray-500 bg-gray-50 border-2 border-gray-200 mb-2 truncate">
                      {user.email}
                    </div>

                    {/* Step 1 — enter new email */}
                    {emailStep === "request" && (
                      <div className="flex flex-col gap-2 mt-2">
                        <p className="text-[11px] text-gray-500 font-medium" style={kf}>
                          {kh ? "បញ្ចូលអ៊ីមែលថ្មី — លេខកូដផ្ទៀងផ្ទាត់នឹងត្រូវផ្ញើទៅអ៊ីមែលបច្ចុប្បន្នរបស់អ្នក" : "Enter a new email. A 6-digit code will be sent to your current email."}
                        </p>
                        <input
                          type="email"
                          value={newEmail}
                          onChange={(e) => setNewEmail(e.target.value)}
                          placeholder="new@email.com"
                          className="w-full px-3 py-2 text-sm font-mono border-2 border-black outline-none"
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={requestEmailChange}
                            disabled={emailBusy}
                            className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-black uppercase bg-black text-white border-2 border-black hover:bg-gray-800 disabled:opacity-50"
                            style={kf}
                          >
                            <Send size={12} />
                            {emailBusy ? (kh ? "កំពុងផ្ញើ…" : "Sending…") : (kh ? "ផ្ញើលេខកូដ" : "Send Code")}
                          </button>
                          <button
                            onClick={() => { setEmailStep("idle"); setEmailError(""); setNewEmail(""); }}
                            className="px-3 py-2 text-xs font-black uppercase border-2 border-black bg-white hover:bg-gray-50"
                            style={kf}
                          >
                            {kh ? "បោះបង់" : "Cancel"}
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Step 2 — enter OTP */}
                    {emailStep === "confirm" && (
                      <div className="flex flex-col gap-2 mt-2">
                        {emailSuccess && (
                          <p className="text-[11px] text-emerald-600 font-bold bg-emerald-50 border border-emerald-300 px-3 py-2" style={kf}>
                            ✓ {emailSuccess}
                          </p>
                        )}
                        <p className="text-[11px] text-gray-500 font-medium" style={kf}>
                          {kh ? "បញ្ចូលលេខកូដ ៦ ខ្ទង់" : "Enter the 6-digit code from your current email."}
                        </p>
                        <input
                          type="text"
                          value={emailCode}
                          onChange={(e) => setEmailCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                          placeholder="000000"
                          maxLength={6}
                          className="w-full px-3 py-2 text-xl font-mono font-black tracking-[0.3em] text-center border-2 border-black outline-none"
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={confirmEmailChange}
                            disabled={emailBusy || emailCode.length !== 6}
                            className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-black uppercase bg-yellow-400 text-black border-2 border-black hover:bg-yellow-300 disabled:opacity-50"
                            style={kf}
                          >
                            <KeyRound size={12} />
                            {emailBusy ? (kh ? "កំពុងផ្ទៀងផ្ទាត់…" : "Verifying…") : (kh ? "បញ្ជាក់" : "Confirm")}
                          </button>
                          <button
                            onClick={() => { setEmailStep("idle"); setEmailError(""); setEmailCode(""); setNewEmail(""); }}
                            className="px-3 py-2 text-xs font-black uppercase border-2 border-black bg-white hover:bg-gray-50"
                            style={kf}
                          >
                            {kh ? "បោះបង់" : "Cancel"}
                          </button>
                        </div>
                      </div>
                    )}

                    {emailError && (
                      <p className="text-[11px] text-red-600 font-bold mt-1.5" style={kf}>{emailError}</p>
                    )}
                    {emailStep === "idle" && emailSuccess && (
                      <p className="text-[11px] text-emerald-600 font-bold mt-1.5 flex items-center gap-1" style={kf}>
                        <CheckCircle2 size={11} /> {emailSuccess}
                      </p>
                    )}
                  </div>
                </div>

                {/* Save info button */}
                <div>
                  <button
                    onClick={saveInfo}
                    disabled={infoSaving}
                    className="w-full py-3 text-sm font-black uppercase bg-yellow-400 text-black border-2 border-black shadow-[4px_4px_0_#000] hover:shadow-[2px_2px_0_#000] hover:translate-x-0.5 hover:translate-y-0.5 transition-all disabled:opacity-60"
                    style={kf}
                  >
                    {infoSaving ? (kh ? "កំពុងរក្សាទុក…" : "Saving…") : (kh ? "រក្សាទុក" : "Save Changes")}
                  </button>
                  {infoSaved && (
                    <p className="flex items-center gap-1.5 text-emerald-600 text-xs font-black mt-2" style={kf}>
                      <CheckCircle2 size={13} /> {kh ? "បានរក្សាទុក!" : "Saved!"}
                    </p>
                  )}
                  {infoError && (
                    <p className="text-red-600 text-xs font-bold mt-2" style={kf}>{infoError}</p>
                  )}
                </div>

                {/* Avatar editor */}
                <div className="border-2 border-black shadow-[3px_3px_0_#000]">
                  <div className="bg-yellow-400 border-b-2 border-black px-4 py-1.5 flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-widest" style={kf}>
                      {kh ? "រូបតំណាង" : "Avatar"}
                    </span>
                    <span className="text-[9px] font-bold text-black/60" style={kf}>
                      {kh ? "ផ្លាស់ប្តូរបានរៀងរាល់ ៦០ ថ្ងៃ" : "Changes every 60 days"}
                    </span>
                  </div>
                  <div className="p-4">
                    <ProfileEditor
                      initialName={user.displayName ?? user.username}
                      initialAvatar={user.avatar}
                      initialAvatarChangedAt={user.avatarChangedAt ? new Date(user.avatarChangedAt as any).toISOString() : null}
                      role="student"
                      dark={false}
                    />
                  </div>
                </div>
              </>
            )}

            {/* ══ PRIVACY TAB ══════════════════════════════════════════ */}
            {drawerTab === "privacy" && (
              <>
                {/* Info banner */}
                <div className="flex gap-2.5 items-start p-3 border-2 border-yellow-400 bg-yellow-50">
                  <Info size={14} className="text-yellow-600 flex-shrink-0 mt-0.5" />
                  <p className="text-[11px] font-semibold text-yellow-800 leading-relaxed" style={kf}>
                    {kh ? "គ្រប់គ្រងអ្វីដែលអ្នកដទៃអាចមើលឃើញ។ ការផ្លាស់ប្តូរមានប្រសិទ្ធភាពភ្លាម។"
                      : "Control what others see on your public profile. Changes apply instantly."}
                  </p>
                </div>

                {privacyLoading ? (
                  <div className="flex items-center justify-center py-10 gap-3 text-gray-400">
                    <RefreshCw size={18} className="animate-spin" />
                    <span className="text-xs font-bold uppercase" style={kf}>Loading…</span>
                  </div>
                ) : (
                  <>
                    <div className="border-2 border-black shadow-[3px_3px_0_#000]">
                      {/* Master toggle */}
                      <div className={`flex items-center justify-between px-4 py-3 border-b border-black ${privacy.isProfilePublic ? "bg-yellow-400" : "bg-gray-50"}`}>
                        <div className="flex items-center gap-2">
                          {privacy.isProfilePublic
                            ? <Globe size={15} className="text-black" />
                            : <Lock size={15} className="text-gray-500" />
                          }
                          <div>
                            <p className="text-[11px] font-black uppercase tracking-wide" style={kf}>
                              {kh ? "ប្រវត្តិរូបសាធារណៈ" : "Public Profile"}
                            </p>
                            <p className="text-[10px] font-medium opacity-60" style={kf}>
                              {privacy.isProfilePublic
                                ? (kh ? "អ្នកដទៃអាចមើលឃើញ" : "Visible to everyone")
                                : (kh ? "លាក់ពីសាធារណៈ" : "Hidden from public")}
                            </p>
                          </div>
                        </div>
                        <Toggle on={privacy.isProfilePublic} onToggle={() => setPrivacy({ ...privacy, isProfilePublic: !privacy.isProfilePublic })} />
                      </div>

                      {/* Sub-toggles */}
                      {privacy.isProfilePublic && ([
                        { field: "isNamePublic", labelEn: "Show Full Name", labelKh: "បង្ហាញឈ្មោះ" },
                        { field: "isUsernamePublic", labelEn: "Show Username", labelKh: "បង្ហាញ Username" },
                        { field: "isSchoolPublic", labelEn: "Show School", labelKh: "បង្ហាញសាលារៀន" },
                        { field: "isProvincePublic", labelEn: "Show Province", labelKh: "បង្ហាញខេត្ត" },
                        { field: "isGradePublic", labelEn: "Show Grade", labelKh: "បង្ហាញថ្នាក់" },
                        { field: "isSectionPublic", labelEn: "Show Section", labelKh: "បង្ហាញបន្ទប់" },
                        { field: "isStatsPublic", labelEn: "Show Stats & Rewards", labelKh: "បង្ហាញស្ថិតិ" },
                      ] as { field: keyof typeof privacy; labelEn: string; labelKh: string }[]).map(({ field, labelEn, labelKh: lkh }, idx, arr) => {
                        const val = privacy[field] as boolean;
                        return (
                          <div key={field} className={`flex items-center justify-between px-5 py-2.5 pl-8 ${idx < arr.length - 1 ? "border-b border-gray-100" : ""}`}>
                            <div className="flex items-center gap-2">
                              {val
                                ? <Eye size={13} className="text-yellow-500" />
                                : <EyeOff size={13} className="text-gray-300" />
                              }
                              <span className={`text-[11px] font-bold uppercase tracking-wide ${val ? "text-gray-800" : "text-gray-400"}`} style={kf}>
                                {kh ? lkh : labelEn}
                              </span>
                            </div>
                            <Toggle on={val} onToggle={() => setPrivacy({ ...privacy, [field]: !val })} />
                          </div>
                        );
                      })}
                    </div>

                    <button
                      onClick={savePrivacy}
                      disabled={privacySaving}
                      className="w-full py-3 text-sm font-black uppercase bg-yellow-400 text-black border-2 border-black shadow-[4px_4px_0_#000] hover:shadow-[2px_2px_0_#000] hover:translate-x-0.5 hover:translate-y-0.5 transition-all disabled:opacity-60"
                      style={kf}
                    >
                      {privacySaving ? (kh ? "កំពុងរក្សាទុក…" : "Saving…") : (kh ? "រក្សាទុកការកំណត់ Privacy" : "Save Privacy Settings")}
                    </button>
                    {privacySaved && (
                      <p className="flex items-center gap-1.5 text-emerald-600 text-xs font-black" style={kf}>
                        <CheckCircle2 size={13} /> {kh ? "បានរក្សាទុក!" : "Privacy settings saved!"}
                      </p>
                    )}
                    {privacyError && (
                      <p className="text-red-600 text-xs font-bold" style={kf}>{privacyError}</p>
                    )}
                  </>
                )}
              </>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
