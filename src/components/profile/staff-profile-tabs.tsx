"use client";

import Link from "next/link";
import { ProfileEditor } from "@/components/profile/profile-editor";
import { AvatarDisplay } from "@/components/shared/avatar-display";
import { Pencil, Info, Settings, Crown, Clock, Zap, Building2 } from "lucide-react";

type Tab = "edit" | "info" | "settings";

interface StaffProfileTabsProps {
  role: "admin" | "teacher";
  activeTab: Tab;
  name: string;
  email: string;
  username: string;
  avatar: string | null;
  avatarChangedAt: string | null;
  createdAt: string;
  // Plan info (teacher only)
  plan?: string;
  isTrial?: boolean;
  trialEndsAt?: string | null;
  planStatus?: string;
}

const TABS: { id: Tab; label: string; Icon: React.ElementType }[] = [
  { id: "edit", label: "Edit Profile", Icon: Pencil },
  { id: "info", label: "View Info", Icon: Info },
  { id: "settings", label: "Settings", Icon: Settings },
];

const ROLE_STYLE = {
  admin: { bg: "#ef4444", text: "#ffffff", label: "Admin" },
  teacher: { bg: "#006747", text: "#ffffff", label: "Teacher" },
};

export function StaffProfileTabs({
  role,
  activeTab,
  name,
  email,
  username,
  avatar,
  avatarChangedAt,
  createdAt,
  plan = "free",
  isTrial = false,
  trialEndsAt = null,
  planStatus = "active",
}: StaffProfileTabsProps) {
  const roleStyle = ROLE_STYLE[role];
  const basePath = role === "admin" ? "/admin/profile" : "/teacher/profile";

  // Plan badge config
  const planConfig = {
    free:        { label: "Free",        icon: Zap,       color: "#6b7280", bg: "bg-zinc-500/15" },
    teacher_pro: { label: "Teacher Pro", icon: Crown,     color: "#f59e0b", bg: "bg-amber-400/15" },
    school:      { label: "School",      icon: Building2, color: "#a855f7", bg: "bg-purple-500/15" },
  } as const;
  const pc = planConfig[plan as keyof typeof planConfig] ?? planConfig.free;
  const PlanIcon = pc.icon;

  const trialDaysLeft = trialEndsAt
    ? Math.max(0, Math.ceil((new Date(trialEndsAt).getTime() - Date.now()) / 86400000))
    : null;

  return (
    <div className="flex flex-col gap-6 py-4 max-w-2xl">
      {/* ── Page header ── */}
      <div className="border-b-[3px] border-black pb-4">
        <h1 className="text-3xl font-black uppercase tracking-tighter text-black">
          My Profile
        </h1>
        <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mt-1">
          {role === "admin" ? "Administration" : "Teaching"} panel
        </p>
      </div>

      {/* ── Identity card ── */}
      <div className="border-2 border-black bg-[#ffffff] shadow-[4px_4px_0_#000] overflow-hidden">
        {/* color bar */}
        <div className="h-1.5" style={{ background: roleStyle.bg }} />
        <div className="flex items-center gap-5 p-5">
          <div className="border-2 border-black shadow-[4px_4px_0_#000]">
            <AvatarDisplay avatar={avatar} name={name} size={88} radius={0} />
          </div>
          <div className="flex flex-col gap-2">
            <h2 className="text-2xl font-black text-black leading-none">
              {name}
            </h2>
            <p className="text-sm text-zinc-500 font-medium">{email}</p>
            <div className="flex gap-2 items-center flex-wrap">
              <span
                className="inline-block px-2.5 py-0.5 text-xs font-black uppercase tracking-widest border-2 border-black shadow-[2px_2px_0_#000]"
                style={{ background: roleStyle.bg, color: roleStyle.text }}
              >
                {roleStyle.label}
              </span>
              <span className="text-xs text-zinc-500 font-medium">
                @{username}
              </span>
              {/* Plan badge — teacher only */}
              {role === "teacher" && (
                <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-black border-2 border-black shadow-[2px_2px_0_#000] ${pc.bg}`}
                  style={{ color: pc.color }}>
                  <PlanIcon size={11} />
                  {pc.label}
                  {isTrial && trialDaysLeft !== null && (
                    <span className={`ml-1 font-bold ${trialDaysLeft <= 2 ? "text-red-500" : ""}`}>
                      · {trialDaysLeft}d trial
                    </span>
                  )}
                </span>
              )}
            </div>
            {/* Trial countdown bar */}
            {role === "teacher" && isTrial && trialDaysLeft !== null && (
              <div className="mt-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-1">
                    <Clock size={9} /> Trial expires in {trialDaysLeft} day{trialDaysLeft !== 1 ? "s" : ""}
                  </span>
                  <Link href="/pricing" className="text-[10px] font-black text-amber-600 hover:text-amber-500 uppercase tracking-widest">
                    Upgrade →
                  </Link>
                </div>
                <div className="h-1.5 bg-zinc-200 rounded-full overflow-hidden border border-black/10">
                  <div
                    className={`h-full rounded-full transition-all ${trialDaysLeft <= 2 ? "bg-red-500" : "bg-amber-400"}`}
                    style={{ width: `${Math.min(100, (trialDaysLeft / 7) * 100)}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Tab bar ── */}
      <div className="flex border-2 border-black shadow-[4px_4px_0_#000] overflow-hidden">
        {TABS.map((tab, i) => {
          const active = activeTab === tab.id;
          const tabHref =
            tab.id === "edit" ? basePath : `${basePath}?tab=${tab.id}`;
          return (
            <Link
              key={tab.id}
              href={tabHref}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-xs font-black uppercase tracking-widest transition-colors ${
                i > 0 ? "border-l-2 border-black" : ""
              } ${
                active
                  ? "bg-black text-white"
                  : "bg-white text-black hover:bg-[#eab308]"
              }`}
            >
              <tab.Icon className="size-3.5" />
              {tab.label}
            </Link>
          );
        })}
      </div>

      {/* ── Tab content ── */}
      {activeTab === "edit" && (
        <div className="border-2 border-black bg-[#ffffff] shadow-[4px_4px_0_#000] p-5">
          <ProfileEditor
            initialName={name}
            initialAvatar={avatar}
            initialAvatarChangedAt={avatarChangedAt}
            role={role}
            dark={false}
          />
        </div>
      )}

      {activeTab === "info" && (
        <div className="border-2 border-black bg-[#ffffff] shadow-[4px_4px_0_#000]">
          <div className="border-b-2 border-black bg-[#3b82f6] px-4 py-3">
            <h3 className="font-black uppercase tracking-widest text-white text-sm">
              Account Information
            </h3>
          </div>
          <div className="divide-y-2 divide-black">
            {[
              { label: "Display Name", value: name },
              { label: "Username", value: `@${username}` },
              { label: "Email", value: email },
              { label: "Role", value: roleStyle.label },
              {
                label: "Member Since",
                value: new Date(createdAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                }),
              },
            ].map((row) => (
              <div key={row.label} className="flex items-start gap-4 px-4 py-3">
                <span className="text-xs font-black uppercase tracking-widest text-zinc-500 w-36 shrink-0 pt-0.5">
                  {row.label}
                </span>
                <span className="text-sm font-bold text-black">
                  {row.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === "settings" && (
        <div className="border-2 border-black bg-[#ffffff] shadow-[4px_4px_0_#000]">
          <div className="border-b-2 border-black bg-[#f97316] px-4 py-3">
            <h3 className="font-black uppercase tracking-widest text-white text-sm">
              Settings
            </h3>
          </div>
          <div className="p-5 flex flex-col gap-4">
            {/* Password change goes here when implemented */}
            <div className="border-2 border-black p-4 flex items-start gap-3">
              <div className="w-1 self-stretch bg-[#f97316]" />
              <div>
                <p className="font-black text-sm uppercase tracking-widest text-black">
                  Change Password
                </p>
                <p className="text-xs text-zinc-500 font-medium mt-1">
                  Password changes are managed by an admin. Contact your
                  administrator to update your password.
                </p>
              </div>
            </div>
            <div className="border-2 border-black p-4 flex items-start gap-3">
              <div className="w-1 self-stretch bg-[#3b82f6]" />
              <div>
                <p className="font-black text-sm uppercase tracking-widest text-black">
                  Avatar Cooldown
                </p>
                <p className="text-xs text-zinc-500 font-medium mt-1">
                  Profile pictures can only be changed once every 60 days. Use
                  the Edit Profile tab to update your avatar.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
