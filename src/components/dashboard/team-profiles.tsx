"use client";

import { useState, useEffect, useCallback } from "react";
import { Shield, RefreshCw, ExternalLink, Copy, Check, Globe, X } from "lucide-react";
import { TEAM_MEMBERS, type TeamMember } from "@/lib/team-data";

// QR code via free API — no extra package needed
function QRImage({ value, size = 120 }: { value: string; size?: number }) {
  const src = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(value)}`;
  return <img src={src} alt="QR Code" width={size} height={size} className="rounded" />;
}

// Protected image — fetched through our signed-token proxy
function ProtectedImage({
  memberId,
  imageUrl,
  alt,
  className,
}: {
  memberId: string;
  imageUrl: string;
  alt: string;
  className?: string;
}) {
  const [src, setSrc] = useState<string | null>(null);
  const [expired, setExpired] = useState(false);

  const refresh = useCallback(async () => {
    setExpired(false);
    const res = await fetch(
      `/api/profile-token?memberId=${encodeURIComponent(memberId)}&imageUrl=${encodeURIComponent(imageUrl)}`
    );
    if (!res.ok) return;
    const { token } = await res.json();
    setSrc(`/api/profile-image?token=${token}`);
    // Mark expired after 60 s so UI shows refresh indicator
    setTimeout(() => setExpired(true), 60000);
  }, [memberId, imageUrl]);

  useEffect(() => { refresh(); }, [refresh]);

  if (!src) return <div className={`${className} bg-gray-200 animate-pulse`} />;

  return (
    <div className="relative group">
      <img
        src={src}
        alt={alt}
        className={className}
        // Prevent right-click save
        onContextMenu={(e) => e.preventDefault()}
        draggable={false}
        style={{ userSelect: "none", WebkitUserSelect: "none" }}
      />
      {expired && (
        <button
          onClick={refresh}
          className="absolute inset-0 flex items-center justify-center bg-black/60 text-white text-xs rounded"
        >
          <RefreshCw className="w-4 h-4 mr-1" /> Refresh
        </button>
      )}
    </div>
  );
}

// ── VSID Card (front) — Neo-Brutalist ────────────────────────────────────────
function VSIDCardFront({ member }: { member: TeamMember; profileUrl: string }) {
  return (
    <div
      className="relative w-[340px] bg-[#FFEE00] select-none"
      style={{
        border: "3px solid #000",
        boxShadow: "6px 6px 0px #000",
        fontFamily: "'Arial Black', Arial, sans-serif",
      }}
    >
      {/* Header */}
      <div
        className="px-3 py-2 flex justify-between items-center"
        style={{ background: "#000", borderBottom: "3px solid #000" }}
      >
        <span className="text-[#FFEE00] font-black text-sm tracking-widest uppercase">
          TECHNOVATION GIRLS
        </span>
        <span
          className="text-[10px] font-black px-2 py-0.5 uppercase"
          style={{ background: "#FFEE00", color: "#000", border: "2px solid #FFEE00" }}
        >
          {member.role === "student" ? "STUDENT ID" : "MENTOR ID"}
        </span>
      </div>

      {/* Body */}
      <div className="p-3 flex gap-3">
        {/* Photo */}
        <div className="flex-shrink-0" style={{ border: "3px solid #000" }}>
          <ProtectedImage
            memberId={member.id}
            imageUrl={member.imageUrl}
            alt={member.name}
            className="w-20 h-24 object-cover block"
          />
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <p
            className="font-black text-base leading-tight uppercase"
            style={{ color: "#000", letterSpacing: "-0.5px" }}
          >
            {member.name}
          </p>
          <div
            className="mt-1 mb-1"
            style={{ height: "3px", background: "#000", width: "100%" }}
          />
          <p className="text-[11px] font-bold uppercase text-black">{member.school}</p>
          <p className="text-[10px] font-bold text-black opacity-70">
            {member.role === "student" ? "JUNIOR DIVISION" : member.specialty?.toUpperCase()}
          </p>

          {/* VSID badge */}
          <div
            className="mt-2 inline-block px-2 py-0.5"
            style={{ background: "#000", color: "#FFEE00" }}
          >
            <span className="font-black text-[11px] tracking-widest">{member.vsid}</span>
          </div>

          {/* Barcode */}
          <div className="mt-1 flex gap-[2px] items-end">
            {member.vsid.replace(/-/g, "").split("").map((c, i) => (
              <div
                key={i}
                style={{
                  width: i % 3 === 0 ? 3 : 2,
                  height: i % 2 === 0 ? 18 : 12,
                  background: "#000",
                }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div
        className="px-3 py-1.5 flex justify-between text-[9px] font-black uppercase"
        style={{ background: "#000", color: "#FFEE00", borderTop: "3px solid #000" }}
      >
        <span>ENROLLED: {member.enrolled}</span>
        <span>EXP: {member.expiry}</span>
        <span>#{member.cardNo}</span>
      </div>
    </div>
  );
}

// ── VSID Card (back) — Neo-Brutalist ─────────────────────────────────────────
function VSIDCardBack({ member, profileUrl }: { member: TeamMember; profileUrl: string }) {
  return (
    <div
      className="relative w-[340px] bg-white select-none"
      style={{
        border: "3px solid #000",
        boxShadow: "6px 6px 0px #000",
        fontFamily: "'Arial Black', Arial, sans-serif",
      }}
    >
      {/* Header */}
      <div
        className="px-3 py-2"
        style={{ background: "#000", borderBottom: "3px solid #000" }}
      >
        <span className="text-[#FFEE00] font-black text-sm tracking-widest uppercase">
          KESARARAM WITH DIGITAL
        </span>
      </div>

      {/* Body */}
      <div className="p-3 grid grid-cols-2 gap-3 text-[10px]">
        <div>
          <p
            className="font-black text-[10px] uppercase mb-1 px-1"
            style={{ background: "#FFEE00", display: "inline-block" }}
          >
            TERMS OF USE
          </p>
          <p className="text-black leading-relaxed font-bold mt-1">
            This card must be carried during all program sessions. Violation of policies may result in revocation.
          </p>
          <p
            className="font-black text-[10px] uppercase mt-2 mb-1 px-1"
            style={{ background: "#FFEE00", display: "inline-block" }}
          >
            LOST CARD
          </p>
          <p className="text-black leading-relaxed font-bold mt-1">
            Return to program coordinator or contact the team lead immediately.
          </p>
        </div>
        <div>
          <p
            className="font-black text-[10px] uppercase mb-1 px-1"
            style={{ background: "#FFEE00", display: "inline-block" }}
          >
            ACCESS
          </p>
          <ul className="text-black font-bold space-y-0.5 mt-1">
            {member.accessPrivileges.map((p) => (
              <li key={p} className="flex items-start gap-1">
                <span style={{ color: "#000" }}>▸</span> {p}
              </li>
            ))}
          </ul>
          <p
            className="font-black text-[10px] uppercase mt-2 mb-1 px-1"
            style={{ background: "#FFEE00", display: "inline-block" }}
          >
            CONTACT
          </p>
          <p className="text-black font-bold mt-1">Siem Reap, Cambodia</p>
        </div>
      </div>

      {/* QR section */}
      <div
        className="px-3 py-2 flex items-center gap-3"
        style={{ borderTop: "3px solid #000", background: "#FFEE00" }}
      >
        <div style={{ border: "3px solid #000" }}>
          <QRImage value={profileUrl} size={64} />
        </div>
        <div>
          <p className="font-black text-[11px] uppercase">SCAN TO VIEW PROFILE</p>
          <p className="font-bold text-[10px] mt-0.5">Link expires every 60 seconds.</p>
          <p className="font-bold text-[10px]">Secured with signed token.</p>
        </div>
      </div>
    </div>
  );
}

// ── Profile Modal ─────────────────────────────────────────────────────────────
function ProfileModal({
  member,
  onClose,
  isKhmer,
}: {
  member: TeamMember;
  onClose: () => void;
  isKhmer: boolean;
}) {
  const [token, setToken] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [showBack, setShowBack] = useState(false);
  const [countdown, setCountdown] = useState(60);

  const fetchToken = useCallback(async () => {
    const res = await fetch(
      `/api/profile-token?memberId=${member.id}&imageUrl=${encodeURIComponent(member.imageUrl)}`
    );
    if (res.ok) {
      const data = await res.json();
      setToken(data.token);
      setCountdown(24);
    }
  }, [member.id, member.imageUrl]);

  useEffect(() => {
    fetchToken();
  }, [fetchToken]);

  // Countdown + auto-refresh every 60 s
  useEffect(() => {
    const interval = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) { fetchToken(); return 60; }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [fetchToken]);

  const profileUrl = token
    ? `${typeof window !== 
"undefined" ? window.location.origin : ""}/profile/${member.id}?token=${token}`
    : "";

  const copyLink = async () => {
    if (!profileUrl) return;
    await navigator.clipboard.writeText(profileUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Modal header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-blue-600" />
            <span className="font-bold text-gray-900">
              {isKhmer ? "ប្រវត្តិរូបសមាជិក" : "MEMBER PROFILE"}
            </span>
            <span className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full font-medium">
              {isKhmer ? "ការតភ្ជាប់សុវត្ថិភាព" : "SECURED"}
            </span>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Token countdown */}
          <div className="flex items-center gap-3 bg-amber-50 border border-amber-300 rounded-lg p-3">
            <RefreshCw className={`w-4 h-4 text-amber-600 ${countdown <= 5 ? "animate-spin" : ""}`} />
            <div className="flex-1 text-sm text-amber-800">
              <span className="font-bold">
                {isKhmer ? "តំណផុតកំណត់ក្នុង" : "LINK EXPIRES IN"} {countdown}s
              </span>
              <span className="text-amber-600 ml-2 text-xs">
                {isKhmer ? "— ធ្វើឱ្យស្រស់ស្អាតដោយស្វ័យប្រវត្តិ" : "— auto-refreshes"}
              </span>
            </div>
            <button
              onClick={fetchToken}
              className="text-xs bg-amber-200 hover:bg-amber-300 text-amber-800 px-2 py-1 rounded"
            >
              {isKhmer ? "ធ្វើឱ្យស្រស់ស្អាត" : "REFRESH NOW"}
            </button>
          </div>

          {/* VSID Card flip */}
          <div className="flex flex-col items-center gap-4">
            <div className="flex gap-2 mb-2">
              <button
                onClick={() => setShowBack(false)}
                className={`px-3 py-1 text-xs rounded ${!showBack ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700"}`}
              >
                {isKhmer ? "មុខ" : "FRONT"}
              </button>
              <button
                onClick={() => setShowBack(true)}
                className={`px-3 py-1 text-xs rounded ${showBack ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700"}`}
              >
                {isKhmer ? "ខាងក្រោយ" : "BACK"}
              </button>
            </div>

            {!showBack
              ? <VSIDCardFront member={member} profileUrl={profileUrl} />
              : <VSIDCardBack member={member} profileUrl={profileUrl} />
            }
          </div>

          {/* Signed URL section */}
          <div className="bg-gray-50 border border-gr
ay-200 rounded-lg p-4">
            <p className="text-xs font-bold text-gray-700 mb-2 flex items-center gap-1">
              <Shield className="w-3 h-3" />
              {isKhmer ? "URL ដែលបានចុះហត្ថលេខា (ផុតកំណត់ ៦០ វិនាទី)" : "SIGNED PROFILE URL (expires 60s)"}
            </p>
            <div className="flex gap-2">
              <code className="flex-1 text-xs bg-white border border-gray-300 rounded px-2 py-2 truncate text-gray-600">
                {profileUrl || "Generating..."}
              </code>
              <button
                onClick={copyLink}
                className="flex items-center gap-1 px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700"
              >
                {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                {copied ? (isKhmer ? "បានចម្លង" : "COPIED") : (isKhmer ? "ចម្លង" : "COPY")}
              </button>
            </div>
          </div>

          {/* Bio */}
          <div>
            <p className="text-sm font-bold text-gray-700 mb-1">
              {isKhmer ? "ប្រវត្តិរូបសង្ខេប" : "BIO"}
            </p>
            <p className="text-sm text-gray-600">
              {isKhmer ? member.bioKh : member.bio}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main exported component ───────────────────────────────────────────────────
export function TeamProfiles({ isKhmer }: { isKhmer: boolean }) {
  const [selected, setSelected] = useState<TeamMember | null>(null);

  const students = TEAM_MEMBERS.filter((m) => m.role === "student");
  const mentors = TEAM_MEMBERS.filter((m) => m.role === "mentor");

  const MemberCard = ({ member }: { member: TeamMember }) => (
    <div
      className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-all cursor-pointer group"
      onClick={() => setSelected(member)}
    >
      <div className="flex items-center gap-3 mb-3">
        <div className="relative">
          <ProtectedImage
            memberId={member.id}
            imageUrl={member.imageUrl}
            alt={member.name}
            className="w-14 h-14 rounded-full object-cover border-2 border-gray-200"
          />
          <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${
            member.role === "mentor" ? "bg-blue-500" : "bg-green-500"
          }`} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-sm text-gray-900 truncate">{member.name}</p>
          <p className="text-xs text-gray-500">
            {member.role === "student"
              ? `${isKhmer ? "អាយុ" : "Age"} ${member.age}`
              : (isKhmer ? member.specialtyKh : member.specialty)}
          </p>
          <span className={`inline-block text-[10px] px-2 py-0.5 rounded-full font-medium mt-1 ${
            member.role === "mentor"
              ? "bg-blue-100 text-blue-700"
              : "bg-green-100 text-green-700"
          }`}>
            {isKhmer
              ? (member.role === "mentor" ? "អ្នកណែនាំ" : "សិស្ស")
              : member.role.toUpperCase()}
          </span>
        </div>
      </div>

      <div className="text-[10px] text-gray-400 flex items-center justify-between">
        <span>{member.vsid}</span>
        <span className="flex items-center gap-1 text-blue-500 group-hover:underline">
          <ExternalLink className="w-3 h-3" />
          {isKhmer ? "មើលប្រវត្តិរូប" : "VIEW PROFILE"}
        </span>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-3">
          {isKhmer ? "សិស្ស (៥)" : "STUDENTS (5)"}
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {students.map((m) => <MemberCard key={m.id} member={m} />)}
        </div>
      </div>

      <div>
        <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-3">
          {isKhmer ? "អ្នកណែនាំ (២)" : "MENTORS (2)"}
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {mentors.map((m) => <MemberCard key={m.id} member={m} />)}
        </div>
      </div>

      {selected && (
        <ProfileModal
          member={selected}
          onClose={() => setSelected(null)}
          isKhmer={isKhmer}
        />
      )}
    </div>
  );
}
