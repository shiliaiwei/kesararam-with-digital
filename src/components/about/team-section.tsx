"use client";

import { useState, useCallback } from "react";
import QRCode from "react-qr-code";

// Names and roles from KWD_អំពីពួកយើង.txt — do not alter
// displayName = last name shown on the card face
const STUDENTS = [
  { id: "VSID-2026-001", name: "YIN DANAI",      displayName: "DANAI",    role: "អ្នកអានសំលេង · អ្នកដឹកនាំក្រុម · ត្រួតពិនិត្យ និងកែសម្រួលមាតិកា" },
  { id: "VSID-2026-002", name: "CHANTHA KANIKA", displayName: "KANIKA",   role: "ត្រួតពិនិត្យ និងកែសម្រួលមាតិកា · ការស្រាវជ្រាវ" },
  { id: "VSID-2026-003", name: "ROZA NEUN",      displayName: "NEUN",     role: "រចនា UI/UX · ត្រួតពិនិត្យ និងកែសម្រួលមាតិកា" },
  { id: "VSID-2026-004", name: "LIM MANY",       displayName: "MANY",     role: "ធានាគុណភាព និងតេស្ត · ត្រួតពិនិត្យ និងកែសម្រួលមាតិកា" },
  { id: "VSID-2026-005", name: "SUN RUNAMARA",   displayName: "RUNAMARA", role: "ធានាគុណភាព និងតេស្ត · ត្រួតពិនិត្យ និងកែសម្រួលមាតិកា" },
];

const MENTORS = [
  {
    id: "VSID-2026-M01",
    name: "PHEAP PISETH", displayName: "PISETH",
    role: "គ្រូបង្រៀន · អ្នកដឹកនាំកម្មវិធី · ត្រួតពិនិត្យប្រសិទ្ធភាពការងារក្រុម",
    image: "https://res.cloudinary.com/dpgivqzrl/image/upload/v1775248421/904da627410290a5ae64edr_xtkjjp.png",
  },
  {
    id: "VSID-2026-M02",
    name: "SHILI AIWEI", displayName: "AIWEI",
    role: "គ្រូណែនាំ · គ្រប់គ្រងបច្ចេកទេស · គំនិតច្នៃប្រឌិត និងធនធានគម្រោង",
    image: "https://avatars.githubusercontent.com/u/70220432?v=4",
  },
];

interface Member { id: string; name: string; displayName: string; role: string; image?: string; }

const CLIP = "polygon(0 12px, 12px 0, calc(100% - 12px) 0, 100% 12px, 100% calc(100% - 12px), calc(100% - 12px) 100%, 12px 100%, 0 calc(100% - 12px))";

function MemberCard({ member, isMentor }: { member: Member; isMentor: boolean }) {
  const [qrLink, setQrLink] = useState<string | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [loading, setLoading] = useState(false);
  const accent = isMentor ? "#f59e0b" : "#eab308";

  // Fetch a fresh token on each tap — no auto-refresh to prevent glitch
  const handleReveal = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/team-token?id=${member.id}`);
      const { code } = await res.json();
      setQrLink(`${window.location.origin}/team/${code}`);
      setRevealed(true);
    } catch {
      setQrLink(`${window.location.origin}/team/${member.id}`);
      setRevealed(true);
    } finally {
      setLoading(false);
    }
  }, [member.id]);

  return (
    <div className="relative group" style={{ clipPath: CLIP }}>
      <div className="absolute inset-0 z-0" style={{ clipPath: CLIP, backgroundColor: accent, padding: 1 }} />

      <div
        className="relative z-10 flex flex-col"
        style={{ clipPath: CLIP, background: "linear-gradient(160deg,#1a1a1a 0%,#0d0d0d 100%)", margin: "1.5px" }}
      >
        <div className="h-0.5 w-full" style={{ backgroundColor: accent }} />

        <div className="absolute top-3 left-3 w-3 h-3 border-t border-l opacity-60" style={{ borderColor: accent }} />
        <div className="absolute top-3 right-3 w-3 h-3 border-t border-r opacity-60" style={{ borderColor: accent }} />
        <div className="absolute bottom-3 left-3 w-3 h-3 border-b border-l opacity-60" style={{ borderColor: accent }} />
        <div className="absolute bottom-3 right-3 w-3 h-3 border-b border-r opacity-60" style={{ borderColor: accent }} />

        <div className="px-4 pt-4 pb-4 flex flex-col items-center gap-3">
          <div className="w-full flex items-center justify-between">
            <div className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 border"
              style={{ color: accent, borderColor: accent + "50", backgroundColor: accent + "12" }}>
              {isMentor ? "MENTOR" : "STUDENT"}
            </div>
            <img src="/brand/kwd-black_nobackground.png" alt="KWD" className="h-2.5 opacity-30 brightness-0 invert object-contain" />
          </div>

          {/* QR area — stable height prevents layout shift */}
          <div
            className="w-full flex items-center justify-center overflow-hidden"
            style={{ background: "#0a0a0a", border: `1px solid ${accent}30`, minHeight: 120 }}
          >
            {revealed && qrLink ? (
              <div className="bg-white p-2 shrink-0">
                <QRCode value={qrLink} size={96} level="L" />
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center gap-3 py-6 opacity-40 w-full">
                <img src="/brand/kwd-black_nobackground.png" alt="" className="w-16 h-8 object-contain mx-auto brightness-0 invert" />
                <span className="text-[8px] font-black uppercase tracking-widest text-center" style={{ color: accent }}>SCAN ID</span>
              </div>
            )}
          </div>

          <div className="text-center">
            <p className="font-black text-white text-sm leading-tight tracking-wide">{member.displayName}</p>
          </div>

          <button
            onClick={handleReveal}
            disabled={loading}
            className="w-full py-2 text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-1.5"
            style={{ clipPath: CLIP, backgroundColor: accent, color: "#000", boxShadow: loading ? "none" : `0 0 12px ${accent}66` }}
          >
            {loading
              ? <span className="w-3 h-3 border-2 border-black border-t-transparent rounded-full animate-spin" />
              : revealed ? "REFRESH" : "UNLOCK PROFILE"}
          </button>
        </div>

        <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="absolute left-0 right-0 h-px animate-scan-line" style={{ backgroundColor: accent + "40" }} />
        </div>
      </div>

      <style>{`
        @keyframes scan-line { 0% { top:0% } 100% { top:100% } }
        .animate-scan-line { animation: scan-line 2s linear infinite; }
      `}</style>
    </div>
  );
}

export function TeamSection() {
  return (
    <div className="bg-white py-16 px-6 border-t border-zinc-200">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="mb-12">
          <div className="inline-block bg-yellow-400 text-black text-[10px] font-black tracking-widest uppercase px-3 py-1 mb-5"
            style={{ clipPath: CLIP, boxShadow: "3px 3px 0 #000" }}>
            {/* From doc: "សមាជិកក្រុម និងគ្រូណែនាំ" */}
            សមាជិកក្រុម និងគ្រូណែនាំ
          </div>
          <h2 className="text-3xl md:text-4xl font-black text-black mb-3">
            Girls Who Build.<br />Leaders Who Guide.
          </h2>
          <p className="text-zinc-500 text-sm max-w-sm">
            Tap any card to reveal the QR code. Scan it to view their full profile.
          </p>
        </div>

        {/* Students */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <span className="text-[10px] font-black uppercase tracking-widest text-yellow-500 border border-yellow-400/30 px-3 py-1"
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
