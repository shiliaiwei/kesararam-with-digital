"use client";

import Link from "next/link";
import { ProfileEditor } from "@/components/profile/profile-editor";
import { AvatarDisplay } from "@/components/shared/avatar-display";
import { Pencil, Info, Settings } from "lucide-react";

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
}: StaffProfileTabsProps) {
  const roleStyle = ROLE_STYLE[role];
  const basePath = role === "admin" ? "/admin/profile" : "/teacher/profile";

  return (
    <div className="flex flex-col gap-6 py-4 max-w-2xl">
      {/* ── Page header ── */}
      <div className="border-b-[3px] border-[#a8a8a8] pb-4">
        <h1 className="text-3xl font-black uppercase tracking-tighter text-black">
          My Profile
        </h1>
        <p className="text-xs font-bold text-[#a8a8a8] uppercase tracking-widest mt-1">
          {role === "admin" ? "Administration" : "Teaching"} panel
        </p>
      </div>

      {/* ── Identity card ── */}
      <div className="border-2 border-[#a8a8a8] bg-[#ffffff] shadow-[4px_4px_0_#000] overflow-hidden">
        {/* color bar */}
        <div className="h-1.5" style={{ background: roleStyle.bg }} />
        <div className="flex items-center gap-5 p-5">
          <div className="border-2 border-[#a8a8a8] shadow-[4px_4px_0_#000]">
            <AvatarDisplay avatar={avatar} name={name} size={88} radius={0} />
          </div>
          <div className="flex flex-col gap-2">
            <h2 className="text-2xl font-black text-black leading-none">
              {name}
            </h2>
            <p className="text-sm text-[#a8a8a8] font-medium">{email}</p>
            <div className="flex gap-2 items-center">
              <span
                className="inline-block px-2.5 py-0.5 text-xs font-black uppercase tracking-widest border-2 border-[#a8a8a8] shadow-[2px_2px_0_#000]"
                style={{ background: roleStyle.bg, color: roleStyle.text }}
              >
                {roleStyle.label}
              </span>
              <span className="text-xs text-[#a8a8a8] font-medium">
                @{username}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Tab bar ── */}
      <div className="flex border-2 border-[#a8a8a8] shadow-[4px_4px_0_#000] overflow-hidden">
        {TABS.map((tab, i) => {
          const active = activeTab === tab.id;
          const tabHref =
            tab.id === "edit" ? basePath : `${basePath}?tab=${tab.id}`;
          return (
            <Link
              key={tab.id}
              href={tabHref}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-xs font-black uppercase tracking-widest transition-colors ${
                i > 0 ? "border-l-2 border-[#a8a8a8]" : ""
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
        <div className="border-2 border-[#a8a8a8] bg-[#ffffff] shadow-[4px_4px_0_#000] p-5">
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
        <div className="border-2 border-[#a8a8a8] bg-[#ffffff] shadow-[4px_4px_0_#000]">
          <div className="border-b-2 border-[#a8a8a8] bg-[#3b82f6] px-4 py-3">
            <h3 className="font-black uppercase tracking-widest text-white text-sm">
              Account Information
            </h3>
          </div>
          <div className="divide-y-2 divide-[#a8a8a8]">
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
                <span className="text-xs font-black uppercase tracking-widest text-[#a8a8a8] w-36 shrink-0 pt-0.5">
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
        <div className="border-2 border-[#a8a8a8] bg-[#ffffff] shadow-[4px_4px_0_#000]">
          <div className="border-b-2 border-[#a8a8a8] bg-[#f97316] px-4 py-3">
            <h3 className="font-black uppercase tracking-widest text-white text-sm">
              Settings
            </h3>
          </div>
          <div className="p-5 flex flex-col gap-4">
            {/* Password change goes here when implemented */}
            <div className="border-2 border-[#a8a8a8] p-4 flex items-start gap-3">
              <div className="w-1 self-stretch bg-[#f97316]" />
              <div>
                <p className="font-black text-sm uppercase tracking-widest text-black">
                  Change Password
                </p>
                <p className="text-xs text-[#a8a8a8] font-medium mt-1">
                  Password changes are managed by an admin. Contact your
                  administrator to update your password.
                </p>
              </div>
            </div>
            <div className="border-2 border-[#a8a8a8] p-4 flex items-start gap-3">
              <div className="w-1 self-stretch bg-[#3b82f6]" />
              <div>
                <p className="font-black text-sm uppercase tracking-widest text-black">
                  Avatar Cooldown
                </p>
                <p className="text-xs text-[#a8a8a8] font-medium mt-1">
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
