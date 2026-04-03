"use client";

import { useState, useEffect, useCallback } from "react";
import QRCode from "react-qr-code";

const STUDENTS = [
  { id: "VSID-2026-001", name: "D. YIN",      fullName: "D.YIN",      role: "UI/UX Designer" },
  { id: "VSID-2026-002", name: "C. KANIKA",   fullName: "C.KANIKA", role: "Content & Research" },
  { id: "VSID-2026-003", name: "R. NEUN",     fullName: "R.NEUN",      role: "Frontend Developer" },
  { id: "VSID-2026-004", name: "L. MANY",     fullName: "L.MANY",       role: "Backend & Database" },
  { id: "VSID-2026-005", name: "S. RUNAMARA", fullName: "S.RUNAMARA",   role: "QA & Testing" },
];

const MENTORS = [
  { id: "VSID-2026-M01", name: "P. PHEAP", fullName: "PISETH PHEAP", role: "Teacher & Program Lead", image: "https://res.cloudinary.com/dpgivqzrl/image/upload/v1775248421/904da627410290a5ae64edr_xtkjjp.png" },
  { id: "VSID-2026-M02", name: "S. WEI", fullName: "SHILIAI WEI", role: "Design, Technical / Project Mgmt", image: "https://res.cloudinary.com/dpgivqzrl/image/upload/v1775248420/07d5d96b3f0a8af7743f3b4053ba18dr_ydb0zm.png" },
];

interface Member { id: string; name: string; fullName: string; role: string; image?: string; }

// Cyberpunk clip-path polygon
const CLIP = "polygon(0 12px, 12px 0, calc(100% - 12px) 0, 100% 12px, 100% calc(100% - 12px), calc(100% - 12px) 100%, 12px 100%, 0 calc(100% - 12px))";

function MemberCard({ member, isMentor }: { member: Member; isMentor: boolean }) {
  const [qrLink, setQrLink] = useState<string | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [loading, setLoading] = useState(false);
  const accent = isMentor ? "#f59e0b" : "#eab308";

  const handleReveal = useCallback(async () => {
    setLoading(true);
    
    try {
      const res = await fetch(`/api/team-token?id=${member.id}`);
      const { code } = await res.json();
      setQrLink(`${window.location.origin}/team/${code}`);
      setRevealed(true);
    } catch {
      // Fallback if API fails
      setQrLink(`${window.location.origin}/team/${member.id}`);
      setRevealed(true);
    }
    finally { setLoading(false); }
  }, [member.id, member.image]);

  // Auto-refresh every 50 seconds (token expires in 1 min)
  useEffect(() => {
    if (!qrLink) return;
    const t = setInterval(async () => {
      try {
        const res = await fetch(`/api/team-token?id=${member.id}`);
        const { code } = await res.json();
        setQrLink(`${window.location.origin}/team/${code}`);
      } catch { /* ignore */ }
    }, 50000);
    return () => clearInterval(t);
  }, [qrLink, member.id]);

  return (
    <div className="relative group" style={{ clipPath: CLIP }}>
      {/* Outer border layer */}
      <div className="absolute inset-0 z-0" style={{ clipPath: CLIP, backgroundColor: accent, padding: 1 }} />

      {/* Card body */}
      <div
        className="relative z-10 flex flex-col"
        style={{
          clipPath: CLIP,
          background: "linear-gradient(160deg, #1a1a1a 0%, #0d0d0d 100%)",
          margin: "1.5px",
        }}
      >
        {/* Top accent bar */}
        <div className="h-0.5 w-full" style={{ backgroundColor: accent }} />

        {/* Corner decorations */}
        <div className="absolute top-3 left-3 w-3 h-3 border-t border-l opacity-60" style={{ borderColor: accent }} />
        <div className="absolute top-3 right-3 w-3 h-3 border-t border-r opacity-60" style={{ borderColor: accent }} />
        <div className="absolute bottom-3 left-3 w-3 h-3 border-b border-l opacity-60" style={{ borderColor: accent }} />
        <div className="absolute bottom-3 right-3 w-3 h-3 border-b border-r opacity-60" style={{ borderColor: accent }} />

        <div className="px-4 pt-4 pb-4 flex flex-col items-center gap-3">
          {/* Role badge & Brand Logo */}
          <div className="w-full flex items-center justify-between">
            <div className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 border"
              style={{ color: accent, borderColor: accent + "50", backgroundColor: accent + "12" }}>
              {isMentor ? "MENTOR" : "STUDENT"}
            </div>
            <img src="/brand/kwd-black-text.png" alt="KWD" className="h-2.5 opacity-30 brightness-0 invert object-contain" />
          </div>

          {/* QR or placeholder */}
          <div
            className="w-full flex items-center justify-center rounded-sm overflow-hidden"
            style={{ background: "#0a0a0a", border: `1px solid ${accent}30`, minHeight: 120 }}
          >
            {revealed && qrLink ? (
                <div className="bg-white p-2 shrink-0">
                  <QRCode value={qrLink} size={96} level="L" />
                </div>
            ) : (
              <div className="flex flex-col items-center justify-center gap-3 py-6 opacity-40 w-full h-full">
                <img src="/brand/kwd-black-text.png" alt="Logo" className="w-16 h-8 object-contain mx-auto brightness-0 invert" />
                <span className="text-[8px] font-black uppercase tracking-widest text-center" style={{ color: accent }}>SCAN ID</span>
              </div>
            )}
          </div>

          {/* Name */}
          <div className="text-center">
            <p className="font-black text-white text-sm leading-tight tracking-wide">{member.name}</p>
            <p className="text-[10px] mt-0.5" style={{ color: accent + "cc" }}>{member.role}</p>
          </div>

          {/* Scan button */}
          <button
            onClick={handleReveal}
            disabled={loading}
            className="w-full py-2 text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-1.5"
            style={{
              clipPath: CLIP,
              backgroundColor: accent,
              color: "#000",
              boxShadow: loading ? "none" : `0 0 12px ${accent}66`,
            }}
          >
            {loading ? (
              <span className="w-3 h-3 border-2 border-black border-t-transparent rounded-full animate-spin" />
            ) : revealed ? "REFRESH QR" : "REVEAL QR"}
          </button>
        </div>

        {/* Bottom scan line animation */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="absolute left-0 right-0 h-px animate-scan-line" style={{ backgroundColor: accent + "40" }} />
        </div>
      </div>

      <style>{`
        @keyframes scan-line {
          0%   { top: 0%; }
          100% { top: 100%; }
        }
        .animate-scan-line { animation: scan-line 2s linear infinite; }
      `}</style>
    </div>
  );
}

export function TeamSection() {
  return (
    <div className="bg-white py-16 px-6 border-t-2 border-yellow-400">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-block bg-yellow-400 text-black text-[10px] font-black tracking-widest uppercase px-3 py-1 mb-4"
            style={{ clipPath: CLIP, boxShadow: "3px 3px 0 #000" }}>
            The Team
          </div>
          <h2 className="text-3xl md:text-4xl font-black text-black mb-2">
            Built by Students.<br />Guided by Mentors.
          </h2>
          <p className="text-black/50 text-sm max-w-sm mx-auto">
            Reveal the QR code on each card. Scan it to view their full profile.
          </p>
        </div>

        {/* Students */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <span className="text-[10px] font-black uppercase tracking-widest text-yellow-400 border border-yellow-400/30 px-3 py-1"
              style={{ clipPath: CLIP }}>
              Students (5)
            </span>
            <div className="flex-1 h-px" style={{ background: "linear-gradient(to right, #eab30840, transparent)" }} />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            {STUDENTS.map(m => <MemberCard key={m.id} member={m} isMentor={false} />)}
          </div>
        </div>

        {/* Mentors */}
        <div>
          <div className="flex items-center gap-3 mb-6">
            <span className="text-[10px] font-black uppercase tracking-widest text-amber-400 border border-amber-400/30 px-3 py-1"
              style={{ clipPath: CLIP }}>
              Mentors (2)
            </span>
            <div className="flex-1 h-px" style={{ background: "linear-gradient(to right, #f59e0b40, transparent)" }} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-sm">
            {MENTORS.map(m => <MemberCard key={m.id} member={m} isMentor={true} />)}
          </div>
        </div>

      </div>
    </div>
  );
}
