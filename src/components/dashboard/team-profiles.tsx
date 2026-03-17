"use client";

import { useState, useEffect, useCallback } from "react";
import { Shield, RefreshCw, Copy, Check, X } from "lucide-react";
import { TEAM_MEMBERS, type TeamMember } from "@/lib/team-data";

// QR image — encodes a signed URL with token
function QRImage({ value, size = 180 }: { value: string; size?: number }) {
  if (!value) return <div style={{ width: size, height: size, background: "#ccc" }} />;
  const src = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(value)}&color=000000&bgcolor=FFEE00&margin=8`;
  return (
    <img
      src={src}
      alt="QR Code"
      width={size}
      height={size}
      style={{ display: "block", imageRendering: "pixelated" }}
    />
  );
}

// Protected image via proxy (dashboard only)
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
    setTimeout(() => setExpired(true), 60000);
  }, [memberId, imageUrl]);

  useEffect(() => { refresh(); }, [refresh]);

  if (!src) return <div className={`${className} bg-gray-300 animate-pulse`} />;

  return (
    <div className="relative">
      <img
        src={src}
        alt={alt}
        className={className}
        onContextMenu={(e) => e.preventDefault()}
        draggable={false}
        style={{ userSelect: "none", WebkitUserSelect: "none" }}
      />
      {expired && (
        <button
          onClick={refresh}
          className="absolute inset-0 flex items-center justify-center bg-black/70 font-black text-[10px] uppercase"
          style={{ color: "#FFEE00" }}
        >
          <RefreshCw className="w-3 h-3 mr-1" /> REFRESH
        </button>
      )}
    </div>
  );
}

// ── VSID Card Front ───────────────────────────────────────────────────────────
function VSIDCardFront({ member }: { member: TeamMember }) {
  return (
    <div
      className="w-[340px] bg-[#FFEE00] select-none"
      style={{ border: "3px solid #000", boxShadow: "6px 6px 0 #000", fontFamily: "'Arial Black', Arial, sans-serif" }}
    >
      <div className="px-3 py-2 flex justify-between items-center" style={{ background: "#000" }}>
        <span className="font-black text-sm tracking-widest uppercase" style={{ color: "#FFEE00" }}>
          TECHNOVATION GIRLS
        </span>
        <span className="font-black text-[10px] px-2 py-0.5 uppercase" style={{ background: "#FFEE00", color: "#000" }}>
          {member.role === "student" ? "STUDENT ID" : "MENTOR ID"}
        </span>
      </div>

      <div className="p-3 flex gap-3">
        <div style={{ border: "3px solid #000", flexShrink: 0 }}>
          <ProtectedImage
            memberId={member.id}
            imageUrl={member.imageUrl}
            alt={member.name}
            className="w-20 h-24 object-cover block"
          />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-black text-base uppercase leading-tight" style={{ letterSpacing: "-0.5px" }}>
            {member.name}
          </p>
          <div style={{ height: 3, background: "#000", margin: "4px 0" }} />
          <p className="font-bold text-[11px] uppercase">{member.school}</p>
          <p className="font-bold text-[10px] opacity-70">
            {member.role === "student" ? "JUNIOR DIVISION" : member.specialty?.toUpperCase()}
          </p>
          <div className="mt-2 inline-block px-2 py-0.5" style={{ background: "#000", color: "#FFEE00" }}>
            <span className="font-black text-[11px] tracking-widest">{member.vsid}</span>
          </div>
          <div className="mt-1 flex gap-[2px] items-end">
            {member.vsid.replace(/-/g, "").split("").map((_, i) => (
              <div key={i} style={{ width: i % 3 === 0 ? 3 : 2, height: i % 2 === 0 ? 18 : 12, background: "#000" }} />
            ))}
          </div>
        </div>
      </div>

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

// ── VSID Card Back — QR rotates every 60s with unique signed token ────────────
function VSIDCardBack({ member }: { member: TeamMember }) {
  const [signedUrl, setSignedUrl] = useState<string>("");
  const [countdown, setCountdown] = useState(60);

  const fetchToken = useCallback(async () => {
    const res = await fetch(
      `/api/profile-token?memberId=${encodeURIComponent(member.id)}&imageUrl=${encodeURIComponent(member.imageUrl)}`
    );
    if (!res.ok) return;
    const { token } = await res.json();
    // Always use the public app URL so QR links work without login
    const base = process.env.NEXT_PUBLIC_APP_URL ?? (typeof window !== "undefined" ? window.location.origin : "");
    setSignedUrl(`${base}/p/${member.id}?token=${token}`);
    setCountdown(60);
  }, [member.id, member.imageUrl]);

  // Fetch on mount
  useEffect(() => { fetchToken(); }, [fetchToken]);

  // Countdown + auto-refresh every 60s
  useEffect(() => {
    const interval = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) { fetchToken(); return 60; }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [fetchToken]);

  return (
    <div
      className="w-[340px] bg-white select-none"
      style={{ border: "3px solid #000", boxShadow: "6px 6px 0 #000", fontFamily: "'Arial Black', Arial, sans-serif" }}
    >
      <div className="px-3 py-2" style={{ background: "#000" }}>
        <span className="font-black text-sm tracking-widest uppercase" style={{ color: "#FFEE00" }}>
          KESARARAM WITH DIGITAL
        </span>
      </div>

      <div className="p-3 grid grid-cols-2 gap-3 text-[10px]">
        <div>
          <p className="font-black text-[10px] uppercase px-1 mb-1" style={{ background: "#FFEE00", display: "inline-block" }}>
            TERMS OF USE
          </p>
          <p className="font-bold leading-relaxed mt-1">
            This card must be carried during all sessions. Violation may result in revocation.
          </p>
          <p className="font-black text-[10px] uppercase px-1 mt-2 mb-1" style={{ background: "#FFEE00", display: "inline-block" }}>
            LOST CARD
          </p>
          <p className="font-bold leading-relaxed mt-1">
            Return to program coordinator immediately.
          </p>
        </div>
        <div>
          <p className="font-black text-[10px] uppercase px-1 mb-1" style={{ background: "#FFEE00", display: "inline-block" }}>
            ACCESS
          </p>
          <ul className="font-bold space-y-0.5 mt-1">
            {member.accessPrivileges.map((p) => (
              <li key={p} className="flex gap-1"><span>▸</span>{p}</li>
            ))}
          </ul>
        </div>
      </div>

      {/* QR — unique signed URL, rotates every 60s */}
      <div
        className="px-3 py-3 flex items-center gap-4"
        style={{ borderTop: "3px solid #000", background: "#FFEE00" }}
      >
        <div className="flex flex-col items-center gap-1">
          <div style={{ border: "3px solid #000" }}>
            <QRImage value={signedUrl} size={120} />
          </div>
          {/* Countdown below QR — not overlapping */}
          <div
            className="w-full text-center font-black text-[10px] px-2 py-0.5"
            style={{ background: "#000", color: "#FFEE00" }}
          >
            EXPIRES {countdown}s
          </div>
        </div>
        <div>
          <p className="font-black text-[13px] uppercase leading-tight">SCAN TO VIEW</p>
          <p className="font-black text-[13px] uppercase leading-tight">PROFILE</p>
          <p className="font-bold text-[10px] mt-2">Unique link per scan.</p>
          <p className="font-bold text-[10px] opacity-60">No login needed.</p>
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
  const [showBack, setShowBack] = useState(false);
  const [signedUrl, setSignedUrl] = useState<string>("");
  const [countdown, setCountdown] = useState(60);
  const [copied, setCopied] = useState(false);

  const fetchToken = useCallback(async () => {
    const res = await fetch(
      `/api/profile-token?memberId=${member.id}&imageUrl=${encodeURIComponent(member.imageUrl)}`
    );
    if (res.ok) {
      const { token } = await res.json();
      const base = process.env.NEXT_PUBLIC_APP_URL ?? (typeof window !== "undefined" ? window.location.origin : "");
      setSignedUrl(`${base}/p/${member.id}?token=${token}`);
      setCountdown(60);
    }
  }, [member.id, member.imageUrl]);

  useEffect(() => { fetchToken(); }, [fetchToken]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) { fetchToken(); return 60; }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [fetchToken]);

  const copyLink = async () => {
    if (!signedUrl) return;
    await navigator.clipboard.writeText(signedUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div
        className="bg-white w-full max-w-xl max-h-[90vh] overflow-y-auto"
        style={{ border: "3px solid #000", boxShadow: "8px 8px 0 #000", fontFamily: "'Arial Black', Arial, sans-serif" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3" style={{ background: "#000" }}>
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5" style={{ color: "#FFEE00" }} />
            <span className="font-black text-sm tracking-widest uppercase" style={{ color: "#FFEE00" }}>
              {isKhmer ? "ប្រវត្តិរូបសមាជិក" : "MEMBER PROFILE"}
            </span>
            <span
              className="font-black text-[10px] px-2 py-0.5"
              style={{ background: countdown <= 10 ? "#ff4444" : "#FFEE00", color: "#000" }}
            >
              {countdown}s
            </span>
          </div>
          <button onClick={onClose} style={{ color: "#FFEE00" }}>
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-5">
          {/* Card flip toggle */}
          <div className="flex">
            {(["FRONT", "BACK"] as const).map((side, i) => (
              <button
                key={side}
                onClick={() => setShowBack(side === "BACK")}
                className="flex-1 py-2 text-xs font-black uppercase"
                style={{
                  background: (side === "BACK") === showBack ? "#000" : "#fff",
                  color: (side === "BACK") === showBack ? "#FFEE00" : "#000",
                  border: "2px solid #000",
                  borderLeft: i > 0 ? "1px solid #000" : "2px solid #000",
                }}
              >
                {isKhmer ? (side === "FRONT" ? "មុខ" : "ខាងក្រោយ") : side}
              </button>
            ))}
          </div>

          {/* Card display */}
          <div className="flex justify-center">
            {!showBack ? <VSIDCardFront member={member} /> : <VSIDCardBack member={member} />}
          </div>

          {/* Signed URL — unique, rotates every 60s */}
          <div style={{ border: "2px solid #000" }}>
            <div className="px-3 py-1.5 flex items-center justify-between" style={{ background: "#000" }}>
              <div className="flex items-center gap-2">
                <Shield className="w-3 h-3" style={{ color: "#FFEE00" }} />
                <span className="font-black text-[11px] uppercase" style={{ color: "#FFEE00" }}>
                  {isKhmer ? "តំណតែមួយគត់ — ផុតកំណត់ ៦០ វិនាទី" : "UNIQUE SIGNED URL — EXPIRES 60s"}
                </span>
              </div>
              <button
                onClick={fetchToken}
                className="font-black text-[10px] px-2 py-0.5 flex items-center gap-1"
                style={{ background: "#FFEE00", color: "#000" }}
              >
                <RefreshCw className={`w-3 h-3 ${countdown <= 5 ? "animate-spin" : ""}`} />
                {isKhmer ? "ថ្មី" : "NEW"}
              </button>
            </div>
            <div className="flex">
              <code className="flex-1 text-[10px] px-3 py-2 truncate text-gray-600 bg-white font-mono">
                {signedUrl || "Generating..."}
              </code>
              <button
                onClick={copyLink}
                className="flex items-center gap-1 px-3 py-2 font-black text-[11px]"
                style={{ background: "#FFEE00", borderLeft: "2px solid #000" }}
              >
                {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                {copied ? (isKhmer ? "បានចម្លង" : "COPIED") : (isKhmer ? "ចម្លង" : "COPY")}
              </button>
            </div>
          </div>

          {/* Bio */}
          <div style={{ border: "2px solid #000" }}>
            <div className="px-3 py-1.5" style={{ background: "#000" }}>
              <span className="font-black text-[11px] uppercase" style={{ color: "#FFEE00" }}>
                {isKhmer ? "ប្រវត្តិរូបសង្ខេប" : "BIO"}
              </span>
            </div>
            <p className="text-sm px-3 py-2 text-gray-800 font-bold leading-relaxed">
              {isKhmer ? member.bioKh : member.bio}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Member Card ───────────────────────────────────────────────────────────────
function MemberCard({
  member,
  isKhmer,
  onClick,
}: {
  member: TeamMember;
  isKhmer: boolean;
  onClick: () => void;
}) {
  const isStudent = member.role === "student";
  return (
    <div
      className="bg-white cursor-pointer select-none"
      style={{
        border: "3px solid #000",
        boxShadow: "5px 5px 0 #000",
        fontFamily: "'Arial Black', Arial, sans-serif",
        transition: "transform 0.1s",
      }}
      onClick={onClick}
      onMouseEnter={(e) => (e.currentTarget.style.transform = "translate(-2px,-2px)")}
      onMouseLeave={(e) => (e.currentTarget.style.transform = "translate(0,0)")}
    >
      <div style={{ height: 6, background: isStudent ? "#FFEE00" : "#000" }} />

      <div className="flex justify-center pt-4 pb-2">
        <div style={{ border: "3px solid #000", width: 80, height: 80, overflow: "hidden" }}>
          <ProtectedImage
            memberId={member.id}
            imageUrl={member.imageUrl}
            alt={member.name}
            className="w-full h-full object-cover block"
          />
        </div>
      </div>

      <div className="px-3 pb-3 text-center">
        <p className="font-black text-sm uppercase leading-tight">{member.name}</p>
        <p className="text-[10px] font-bold text-gray-500 mt-0.5">
          {isStudent
            ? `${isKhmer ? "អាយុ" : "AGE"} ${member.age}`
            : (isKhmer ? member.specialtyKh : member.specialty)}
        </p>
        <div
          className="inline-block mt-2 px-2 py-0.5 text-[10px] font-black uppercase"
          style={{
            background: isStudent ? "#FFEE00" : "#000",
            color: isStudent ? "#000" : "#FFEE00",
            border: "2px solid #000",
          }}
        >
          {isKhmer ? (isStudent ? "សិស្ស" : "អ្នកណែនាំ") : member.role.toUpperCase()}
        </div>
        <p className="text-[9px] font-bold text-gray-400 mt-2 tracking-widest">{member.vsid}</p>
      </div>

      <div
        className="py-2 text-center text-[10px] font-black uppercase"
        style={{ background: "#000", color: "#FFEE00", borderTop: "2px solid #000" }}
      >
        {isKhmer ? "ចុចដើម្បីមើល ID" : "TAP TO VIEW ID"}
      </div>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export function TeamProfiles({ isKhmer }: { isKhmer: boolean }) {
  const [selected, setSelected] = useState<TeamMember | null>(null);
  const students = TEAM_MEMBERS.filter((m) => m.role === "student");
  const mentors = TEAM_MEMBERS.filter((m) => m.role === "mentor");

  return (
    <div className="space-y-8" style={{ fontFamily: "'Arial Black', Arial, sans-serif" }}>
      <div style={{ borderBottom: "3px solid #000", paddingBottom: 8 }}>
        <h2 className="font-black text-2xl uppercase tracking-widest">
          {isKhmer ? "ក្រុម" : "TEAM PROFILES"}
        </h2>
        <p className="text-xs font-bold text-gray-500 mt-1">
          {isKhmer ? "ចុចលើប្រវត្តិរូបដើម្បីមើល VSID" : "TAP ANY CARD TO VIEW VSID & QR CODE"}
        </p>
      </div>

      <div>
        <div
          className="inline-block px-3 py-1 mb-4 font-black text-sm uppercase"
          style={{ background: "#FFEE00", border: "2px solid #000" }}
        >
          {isKhmer ? "សិស្ស (៥)" : "STUDENTS (5)"}
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {students.map((m) => (
            <MemberCard key={m.id} member={m} isKhmer={isKhmer} onClick={() => setSelected(m)} />
          ))}
        </div>
      </div>

      <div>
        <div
          className="inline-block px-3 py-1 mb-4 font-black text-sm uppercase"
          style={{ background: "#000", color: "#FFEE00", border: "2px solid #000" }}
        >
          {isKhmer ? "អ្នកណែនាំ (២)" : "MENTORS (2)"}
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {mentors.map((m) => (
            <MemberCard key={m.id} member={m} isKhmer={isKhmer} onClick={() => setSelected(m)} />
          ))}
        </div>
      </div>

      {selected && (
        <ProfileModal member={selected} onClose={() => setSelected(null)} isKhmer={isKhmer} />
      )}
    </div>
  );
}
