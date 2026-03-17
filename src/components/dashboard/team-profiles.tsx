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
    // Mark expired after 24 s so UI shows refresh indicator
    setTimeout(() => setExpired(true), 24000);
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

// ── VSID Card (front) ─────────────────────────────────────────────────────────
function VSIDCardFront({ member, profileUrl }: { member: TeamMember; profileUrl: string }) {
  return (
    <div
      className="relative w-[340px] bg-white rounded-xl overflow-hidden shadow-lg border border-gray-200 select-none"
      style={{ fontFamily: "Arial, Helvetica, sans-serif" }}
    >
      {/* diagonal watermark pattern */}
      <div
        className="absolute inset-0 opacity-5 pointer-events-none"
        style={{
          backgroundImage: "repeating-linear-gradient(45deg,#000 0,#000 1px,transparent 0,transparent 50%)",
          backgroundSize: "20px 20px",
        }}
      />

      {/* Header bar */}
      <div className="bg-gradient-to-r from-blue-800 to-blue-600 px-4 py-2 flex justify-between items-center">
        <span className="text-white font-bold text-sm tracking-wide">TECHNOVATION GIRLS</span>
        <span className="text-blue-200 text-xs font-semibold">
          {member.role === "student" ? "Student ID" : "Mentor ID"}
        </span>
      </div>

      {/* Body */}
      <div className="px-4 pt-3 pb-4 flex gap-4">
        {/* Photo */}
        <div className="flex-shrink-0">
          <ProtectedImage
            memberId={member.id}
            imageUrl={member.imageUrl}
            alt={member.name}
            className="w-20 h-24 object-cover rounded border-2 border-gray-300"
          />
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <p className="font-bold text-gray-900 text-base leading-tight">{member.name}</p>
          <p className="text-gray-500 text-xs mt-0.5">{member.school}</p>
          <p className="text-gray-500 text-xs">{member.role === "student" ? "Junior Division" : member.specialty}</p>

          {/* Signature line */}
          <div className="mt-2 border-b border-gray-400 w-28" />
          <p className="text-gray-400 text-[9px] mt-0.5">Registrar&apos;s Office</p>

          {/* VSID + barcode */}
          <p className="text-red-600 font-bold text-xs mt-2">{member.vsid}</p>
          <div className="mt-1 flex gap-1">
            {member.vsid.split("").map((c, i) => (
              <div key={i} className="bg-black" style={{ width: c === "-" ? 4 : 2, height: 20 }} />
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-gray-50 border-t border-gray-200 px-4 py-2 flex justify-between text-[10px] text-gray-500">
        <span>Enrolled: {member.enrolled}</span>
        <span>Expiry: {member.expiry}</span>
        <span>Card No. {member.cardNo}</span>
      </div>
    </div>
  );
}

// ── VSID Card (back) ──────────────────────────────────────────────────────────
function VSIDCardBack({ member, profileUrl }: { member: TeamMember; profileUrl: string }) {
  return (
    <div
      className="relative w-[340px] bg-white rounded-xl overflow-hidden shadow-lg border border-gray-200 select-none"
      style={{ fontFamily: "Arial, Helvetica, sans-serif" }}
    >
      <div
        className="absolute inset-0 opacity-5 pointer-events-none"
        style={{
          backgroundImage: "repeating-linear-gradient(45deg,#000 0,#000 1px,transparent 0,transparent 50%)",
          backgroundSize: "20px 20px",
        }}
      />

      <div className="bg-gradient-to-r from-blue-800 to-blue-600 px-4 py-2">
        <span className="text-white font-bold text-sm">KESARARAM WITH DIGITAL</span>
      </div>

      <div className="px-4 py-3 grid grid-cols-2 gap-4 text-xs">
        <div>
          <p className="font-bold text-gray-800 mb-1">TERMS OF USE</p>
          <p className="text-gray-600 leading-relaxed">
            This card must be carried during all program sessions. Violation of program policies may result in card revocation.
          </p>
          <p className="font-bold text-gray-800 mt-2 mb-1">LOST CARD</p>
          <p className="text-gray-600 leading-relaxed">
            If found, please return to the program coordinator or contact the team lead.
          </p>
        </div>
        <div>
          <p className="font-bold text-gray-800 mb-1">ACCESS PRIVILEGES</p>
          <ul className="text-gray-600 space-y-0.5">
            {member.accessPrivileges.map((p) => (
              <li key={p}>• {p}</li>
            ))}
          </ul>
          <p className="font-bold text-gray-800 mt-2 mb-1">CONTACT INFO</p>
          <p className="text-gray-600">Siem Reap, Cambodia</p>
          <p className="text-blue-600">technovation-one.vercel.app</p>
        </div>
      </div>

      {/* QR code */}
      <div className="border-t border-gray-200 px-4 py-3 flex items-center gap-4">
        <QRImage value={profileUrl} size={72} />
        <div className="text-[10px] text-gray-500">
          <p className="font-bold text-gray-700 mb-1">SCAN TO VIEW PROFILE</p>
          <p>Link expires every 24 seconds.</p>
          <p>Secured with signed token.</p>
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
  const [countdown, setCountdown] = useState(24);

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

  // Countdown + auto-refresh every 24 s
  useEffect(() => {
    const interval = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) { fetchToken(); return 24; }
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
              {isKhmer ? "URL ដែលបានចុះហត្ថលេខា (ផុតកំណត់ ២៤ វិនាទី)" : "SIGNED PROFILE URL (expires 24s)"}
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
