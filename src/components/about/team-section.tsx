"use client";

import { useState, useEffect, useCallback } from "react";
import { QrCode } from "lucide-react";

// QR code via Google Charts API — no npm package needed
function qrUrl(data: string) {
  return `https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(data)}&bgcolor=111111&color=ffffff&margin=8`;
}

const STUDENTS = [
  { id: "VSID-2026-001", name: "DANAI YIN",      age: "12", role: "UI/UX Designer",         photo: "https://res.cloudinary.com/dpgivqzrl/image/upload/f_auto,q_auto,w_200/v1773739866/DANAI_YIN_sezo2q.jpg" },
  { id: "VSID-2026-002", name: "CHANTHA KANIKA", age: "13", role: "Content & Research",      photo: "https://res.cloudinary.com/dpgivqzrl/image/upload/f_auto,q_auto,w_200/v1773739866/CHANTHA_KANIKA_gmh6w9.jpg" },
  { id: "VSID-2026-003", name: "ROZA NEUN",      age: "11", role: "Frontend Developer",      photo: "https://res.cloudinary.com/dpgivqzrl/image/upload/f_auto,q_auto,w_200/v1773739867/Roza_Neun_ciz33b.jpg" },
  { id: "VSID-2026-004", name: "LIN MANY",       age: "13", role: "Backend & Database",      photo: "https://res.cloudinary.com/dpgivqzrl/image/upload/f_auto,q_auto,w_200/v1773739866/Lin_Many_nffno6.jpg" },
  { id: "VSID-2026-005", name: "SUN RUNAMARA",   age: "11", role: "QA & Testing",            photo: "https://res.cloudinary.com/dpgivqzrl/image/upload/f_auto,q_auto,w_200/v1773739866/SUN_RUNAMARA_rmtlzf.jpg" },
];

const MENTORS = [
  { id: "VSID-2026-M01", name: "PISETH PHEAP", role: "Teacher & Program Lead",                    photo: "https://res.cloudinary.com/dpgivqzrl/image/upload/f_auto,q_auto,w_200/v1773739866/Piseth_Pheap_b189jm.jpg" },
  { id: "VSID-2026-M02", name: "VI SRIE",      role: "University Student — Java / Project Mgmt",  photo: "https://res.cloudinary.com/dpgivqzrl/image/upload/f_auto,q_auto,w_200/v1775038113/eirsvi_scinny.jpg" },
];

interface Member {
  id: string; name: string; role: string; photo: string; age?: string;
}

function MemberCard({ member, isMentor }: { member: Member; isMentor: boolean }) {
  const [flipped, setFlipped] = useState(false);
  const [qrLink, setQrLink] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const accent = isMentor ? "#f59e0b" : "#eab308";

  const generateQR = useCallback(async () => {
    if (qrLink) { setFlipped(true); return; }
    setLoading(true);
    try {
      const res = await fetch(`/api/team-token?id=${member.id}`);
      const { token } = await res.json();
      const url = `${window.location.origin}/team/${token}`;
      setQrLink(url);
      setFlipped(true);
    } catch { /* ignore */ }
    finally { setLoading(false); }
  }, [member.id, qrLink]);

  // Auto-refresh QR every 2.5 min so it doesn't expire while displayed
  useEffect(() => {
    if (!flipped) return;
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/team-token?id=${member.id}`);
        const { token } = await res.json();
        setQrLink(`${window.location.origin}/team/${token}`);
      } catch { /* ignore */ }
    }, 150000); // 2.5 min
    return () => clearInterval(interval);
  }, [flipped, member.id]);

  return (
    <div className="relative" style={{ perspective: "1000px" }}>
      <div
        className="relative transition-transform duration-500"
        style={{
          transformStyle: "preserve-3d",
          transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)",
          height: 320,
        }}
      >
        {/* FRONT — ID card */}
        <div
          className="absolute inset-0 bg-[#111] border-2 border-white/10 rounded-2xl overflow-hidden flex flex-col"
          style={{ backfaceVisibility: "hidden", boxShadow: `0 8px 32px rgba(0,0,0,0.6), 0 0 0 1px ${accent}22` }}
        >
          <div className="h-1" style={{ backgroundColor: accent }} />

          {/* Top label */}
          <div className="px-4 pt-3 pb-2 flex items-center justify-between">
            <span className="text-[9px] font-black uppercase tracking-widest text-white/25">KWD · 2026</span>
            <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border"
              style={{ color: accent, borderColor: accent + "40", backgroundColor: accent + "15" }}>
              {isMentor ? "MENTOR" : "STUDENT"}
            </span>
          </div>

          {/* Photo */}
          <div className="flex justify-center py-3">
            <div className="w-20 h-20 rounded-full overflow-hidden border-2"
              style={{ borderColor: accent, boxShadow: `0 0 16px ${accent}44` }}>
              <img src={member.photo} alt={member.name} className="w-full h-full object-cover object-top" />
            </div>
          </div>

          {/* Info */}
          <div className="text-center px-4 flex-1">
            <p className="text-[9px] text-white/25 uppercase tracking-widest mb-0.5">
              @{member.name.toLowerCase().replace(/\s/g, "")}
            </p>
            <p className="font-black text-white text-sm leading-tight">{member.name}</p>
            <p className="text-[10px] text-white/45 mt-0.5">{member.role}</p>
            {member.age && <p className="text-[9px] text-white/20 mt-0.5">Age {member.age}</p>}
          </div>

          {/* Divider + ID */}
          <div className="mx-4 border-t border-white/8 mt-2 pt-2 pb-1 flex items-center justify-between">
            <span className="text-[9px] text-white/20 font-mono">{member.id}</span>
            <span className="text-[9px] text-white/20">TECHNOVATION</span>
          </div>

          {/* Tap button */}
          <button
            onClick={generateQR}
            disabled={loading}
            className="mx-4 mb-4 py-2 flex items-center justify-center gap-2 font-black text-xs uppercase tracking-widest border-2 transition-all hover:-translate-y-0.5"
            style={{ backgroundColor: accent, color: "#000", borderColor: accent, boxShadow: `2px 2px 0 #000` }}
          >
            {loading ? (
              <span className="w-3 h-3 border-2 border-black border-t-transparent rounded-full animate-spin" />
            ) : (
              <QrCode size={13} />
            )}
            {loading ? "Generating..." : "TAP TO VIEW ID"}
          </button>
        </div>

        {/* BACK — QR code */}
        <div
          className="absolute inset-0 bg-[#111] border-2 border-white/10 rounded-2xl overflow-hidden flex flex-col items-center justify-center gap-4"
          style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)", boxShadow: `0 8px 32px rgba(0,0,0,0.6)` }}
        >
          <div className="h-1 absolute top-0 left-0 right-0" style={{ backgroundColor: accent }} />

          <p className="text-[9px] font-black uppercase tracking-widest text-white/30">Scan to view profile</p>

          {qrLink && (
            <div className="p-2 bg-white rounded-xl">
              <img
                src={qrUrl(qrLink)}
                alt="QR Code"
                width={140}
                height={140}
                className="block"
              />
            </div>
          )}

          <p className="text-[9px] text-white/20 font-mono px-4 text-center break-all">{member.id}</p>

          <button
            onClick={() => setFlipped(false)}
            className="text-[10px] font-black uppercase tracking-widest px-4 py-1.5 border rounded-full transition-colors"
            style={{ color: accent, borderColor: accent + "40" }}
          >
            ← Back
          </button>
        </div>
      </div>
    </div>
  );
}

export function TeamSection() {
  return (
    <div className="bg-[#0a0a0a] py-16 px-6">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-block bg-yellow-400 text-black text-[10px] font-black tracking-widest uppercase px-3 py-1 mb-4 border-2 border-black shadow-[2px_2px_0_#000]">
            The Team
          </div>
          <h2 className="text-3xl md:text-4xl font-black text-white mb-2">
            Built by Students.<br />Guided by Mentors.
          </h2>
          <p className="text-white/40 text-sm max-w-md mx-auto">
            Tap any card to reveal the QR code. Scan it to view their full profile.
          </p>
        </div>

        {/* Students */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-6">
            <div className="inline-block bg-yellow-400 text-black text-[10px] font-black tracking-widest uppercase px-3 py-1 border-2 border-black shadow-[2px_2px_0_#000]">
              Students (5)
            </div>
            <div className="flex-1 h-px bg-white/10" />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            {STUDENTS.map(m => (
              <MemberCard key={m.id} member={m} isMentor={false} />
            ))}
          </div>
        </div>

        {/* Mentors */}
        <div>
          <div className="flex items-center gap-3 mb-6">
            <div className="inline-block bg-amber-500 text-black text-[10px] font-black tracking-widest uppercase px-3 py-1 border-2 border-black shadow-[2px_2px_0_#000]">
              Mentors (2)
            </div>
            <div className="flex-1 h-px bg-white/10" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-lg">
            {MENTORS.map(m => (
              <MemberCard key={m.id} member={m} isMentor={true} />
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
