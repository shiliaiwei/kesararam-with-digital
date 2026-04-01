"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

const CLIP = "polygon(0 16px,16px 0,calc(100% - 16px) 0,100% 16px,100% calc(100% - 16px),calc(100% - 16px) 100%,16px 100%,0 calc(100% - 16px))";
const CLIP_SM = "polygon(0 10px,10px 0,calc(100% - 10px) 0,100% 10px,100% calc(100% - 10px),calc(100% - 10px) 100%,10px 100%,0 calc(100% - 10px))";

const MEMBERS: Record<string, {
  name: string; role: string; type: "student" | "mentor";
  photo: string; contributions: string[]; quote: string;
}> = {
  "VSID-2026-001": {
    name: "DANAI YIN", role: "UI/UX Designer", type: "student",
    photo: "https://res.cloudinary.com/dpgivqzrl/image/upload/f_auto,q_auto,w_300/v1773739866/DANAI_YIN_sezo2q.jpg",
    contributions: ["Designed all UI screens", "Created the neo-brutalist design system", "Led visual identity"],
    quote: "Design is how we make technology feel human.",
  },
  "VSID-2026-002": {
    name: "CHANTHA KANIKA", role: "Content & Research", type: "student",
    photo: "https://res.cloudinary.com/dpgivqzrl/image/upload/f_auto,q_auto,w_300/v1773739866/CHANTHA_KANIKA_gmh6w9.jpg",
    contributions: ["Researched all 8 traffic sign categories", "Wrote bilingual content (KH/EN)", "Validated exam accuracy"],
    quote: "Knowledge is the foundation of every safe road.",
  },
  "VSID-2026-003": {
    name: "ROZA NEUN", role: "Frontend Developer", type: "student",
    photo: "https://res.cloudinary.com/dpgivqzrl/image/upload/f_auto,q_auto,w_300/v1773739867/Roza_Neun_ciz33b.jpg",
    contributions: ["Built interactive quiz components", "Implemented live game UI", "Developed mobile-responsive layouts"],
    quote: "Every line of code is a step toward something real.",
  },
  "VSID-2026-004": {
    name: "LIN MANY", role: "Backend & Database", type: "student",
    photo: "https://res.cloudinary.com/dpgivqzrl/image/upload/f_auto,q_auto,w_300/v1773739866/Lin_Many_nffno6.jpg",
    contributions: ["Designed the database schema", "Built API endpoints", "Implemented real-time game engine"],
    quote: "The backend is the engine — invisible but essential.",
  },
  "VSID-2026-005": {
    name: "SUN RUNAMARA", role: "QA & Testing", type: "student",
    photo: "https://res.cloudinary.com/dpgivqzrl/image/upload/f_auto,q_auto,w_300/v1773739866/SUN_RUNAMARA_rmtlzf.jpg",
    contributions: ["Tested all game modes and flows", "Reported and tracked bugs", "Ensured bilingual accuracy"],
    quote: "Quality is not an act, it is a habit.",
  },
  "VSID-2026-M01": {
    name: "PISETH PHEAP", role: "Teacher & Program Lead", type: "mentor",
    photo: "https://res.cloudinary.com/dpgivqzrl/image/upload/f_auto,q_auto,w_300/v1773739866/Piseth_Pheap_b189jm.jpg",
    contributions: ["Guided the team through Technovation curriculum", "Mentored project planning and execution", "Connected team with resources"],
    quote: "Teaching is not filling a bucket — it is lighting a fire.",
  },
  "VSID-2026-M02": {
    name: "VI SRIE", role: "Design, Technical / Project Management", type: "mentor",
    photo: "https://res.cloudinary.com/dpgivqzrl/image/upload/f_auto,q_auto,w_300/v1775038113/eirsvi_scinny.jpg",
    contributions: ["Advised on software architecture", "Reviewed code quality and best practices", "Supported project management"],
    quote: "Build with intention. Ship with confidence.",
  },
};

export default function TeamMemberPage() {
  const params = useParams();
  const router = useRouter();
  const code = params.token as string;
  const [member, setMember] = useState<typeof MEMBERS[string] | null>(null);
  const [memberId, setMemberId] = useState<string>("");
  const [status, setStatus] = useState<"loading" | "valid" | "expired">("loading");

  useEffect(() => {
    if (!code) { setStatus("expired"); return; }
    fetch("/api/team-token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code }),
    })
      .then(r => r.json())
      .then(d => {
        if (d.valid && d.id && MEMBERS[d.id]) {
          setMember(MEMBERS[d.id]);
          setMemberId(d.id);
          setStatus("valid");
        } else {
          setStatus("expired");
        }
      })
      .catch(() => setStatus("expired"));
  }, [code]);

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-[#050508] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin" />
          <p className="text-yellow-400 text-xs font-black uppercase tracking-widest animate-pulse">Verifying access...</p>
        </div>
      </div>
    );
  }

  if (status === "expired") {
    return (
      <div className="min-h-screen bg-[#050508] flex flex-col items-center justify-center gap-6 px-4 text-center">
        <style>{`
          @keyframes glitch {
            0%,100% { transform: translate(0); }
            20% { transform: translate(-2px, 2px); }
            40% { transform: translate(2px, -2px); }
            60% { transform: translate(-1px, 1px); }
          }
        `}</style>
        <div className="text-7xl font-black text-red-500/20" style={{ animation: "glitch 0.5s infinite" }}>
          ⚠
        </div>
        <div style={{ clipPath: CLIP }} className="bg-red-500/10 border border-red-500/30 px-8 py-6 max-w-xs">
          <p className="text-red-400 font-black text-lg mb-1">ACCESS DENIED</p>
          <p className="text-red-400/50 text-xs">QR code has expired or already been used.</p>
        </div>
        <Link href="/about"
          className="text-xs font-black uppercase tracking-widest px-6 py-3 transition-all"
          style={{ clipPath: CLIP_SM, backgroundColor: "#eab308", color: "#000" }}>
          ← Return to About
        </Link>
      </div>
    );
  }

  if (!member) return null;

  const isMentor = member.type === "mentor";
  const accent = isMentor ? "#f59e0b" : "#eab308";
  const accentDim = accent + "30";

  return (
    <div className="min-h-screen bg-[#050508] text-white overflow-hidden">
      <style>{`
        @keyframes scan { 0% { top: -10% } 100% { top: 110% } }
        @keyframes flicker { 0%,100% { opacity:1 } 92% { opacity:1 } 93% { opacity:0.4 } 94% { opacity:1 } 97% { opacity:0.8 } }
        @keyframes glow-pulse { 0%,100% { box-shadow: 0 0 20px ${accent}44 } 50% { box-shadow: 0 0 40px ${accent}88 } }
        .scan-line { animation: scan 3s linear infinite; }
        .flicker { animation: flicker 4s infinite; }
        .glow-pulse { animation: glow-pulse 2s ease-in-out infinite; }
      `}</style>

      {/* Background grid */}
      <div className="fixed inset-0 pointer-events-none"
        style={{ backgroundImage: `linear-gradient(${accentDim} 1px, transparent 1px), linear-gradient(90deg, ${accentDim} 1px, transparent 1px)`, backgroundSize: "40px 40px", opacity: 0.3 }} />

      {/* Scan line */}
      <div className="fixed left-0 right-0 h-px pointer-events-none z-50 scan-line"
        style={{ backgroundColor: accent + "60" }} />

      {/* Corner brackets */}
      <div className="fixed top-4 left-4 w-8 h-8 border-t-2 border-l-2 pointer-events-none" style={{ borderColor: accent }} />
      <div className="fixed top-4 right-4 w-8 h-8 border-t-2 border-r-2 pointer-events-none" style={{ borderColor: accent }} />
      <div className="fixed bottom-4 left-4 w-8 h-8 border-b-2 border-l-2 pointer-events-none" style={{ borderColor: accent }} />
      <div className="fixed bottom-4 right-4 w-8 h-8 border-b-2 border-r-2 pointer-events-none" style={{ borderColor: accent }} />

      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 py-12">

        {/* Top status bar */}
        <div className="w-full max-w-sm mb-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: accent }} />
            <span className="text-[9px] font-black uppercase tracking-widest flicker" style={{ color: accent }}>
              KWD · TECHNOVATION 2026
            </span>
          </div>
          <span className="text-[9px] font-black uppercase tracking-widest text-white/20">
            {isMentor ? "MENTOR" : "STUDENT"} · VERIFIED
          </span>
        </div>

        {/* Main card */}
        <div className="w-full max-w-sm glow-pulse" style={{ clipPath: CLIP, border: `1.5px solid ${accent}` }}>
          <div style={{ background: "linear-gradient(160deg,#111118 0%,#0a0a10 100%)" }}>

            {/* Header stripe */}
            <div className="h-1" style={{ background: `linear-gradient(to right, transparent, ${accent}, transparent)` }} />

            {/* Top section */}
            <div className="px-6 pt-5 pb-4 border-b" style={{ borderColor: accentDim }}>
              <div className="flex items-center justify-between mb-3">
                <span className="text-[9px] font-black uppercase tracking-widest text-white/25">ALL-ACCESS</span>
                <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5"
                  style={{ clipPath: CLIP_SM, backgroundColor: accent, color: "#000" }}>
                  {isMentor ? "MENTOR" : "STUDENT"}
                </span>
              </div>
              <p className="text-[9px] text-white/20 uppercase tracking-widest">{memberId}</p>
            </div>

            {/* Photo */}
            <div className="flex justify-center py-6">
              <div className="relative">
                <div className="w-28 h-28 overflow-hidden"
                  style={{ clipPath: CLIP, border: `2px solid ${accent}`, boxShadow: `0 0 30px ${accent}44` }}>
                  <img src={member.photo} alt={member.name} className="w-full h-full object-cover object-top" />
                </div>
                {/* Scan overlay on photo */}
                <div className="absolute inset-0 pointer-events-none overflow-hidden" style={{ clipPath: CLIP }}>
                  <div className="absolute left-0 right-0 h-0.5 scan-line" style={{ backgroundColor: accent + "80" }} />
                </div>
              </div>
            </div>

            {/* Name & role */}
            <div className="px-6 pb-5 text-center border-b" style={{ borderColor: accentDim }}>
              <p className="text-[9px] uppercase tracking-widest mb-1" style={{ color: accent + "80" }}>
                @{member.name.toLowerCase().replace(/\s/g, "")}
              </p>
              <h1 className="text-xl font-black text-white mb-1 flicker">{member.name}</h1>
              <p className="text-xs" style={{ color: accent }}>{member.role}</p>
            </div>

            {/* Contributions */}
            <div className="px-6 py-4 border-b" style={{ borderColor: accentDim }}>
              <p className="text-[9px] font-black uppercase tracking-widest mb-3" style={{ color: accent + "60" }}>
                // CONTRIBUTIONS
              </p>
              {member.contributions.map((c, i) => (
                <div key={i} className="flex items-start gap-2 mb-2">
                  <span className="text-xs shrink-0 mt-0.5" style={{ color: accent }}>▸</span>
                  <span className="text-xs text-white/60">{c}</span>
                </div>
              ))}
            </div>

            {/* Quote */}
            <div className="px-6 py-4 border-b" style={{ borderColor: accentDim }}>
              <p className="text-[9px] font-black uppercase tracking-widest mb-2" style={{ color: accent + "60" }}>
                // QUOTE
              </p>
              <p className="text-xs text-white/40 italic">"{member.quote}"</p>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 flex items-center justify-between">
              <div>
                <p className="text-[8px] text-white/15 uppercase tracking-widest">Project</p>
                <p className="text-[9px] font-black text-white/30">Kesararam With Digital</p>
              </div>
              <Link href="/about"
                className="text-[9px] font-black uppercase tracking-widest px-3 py-1.5 transition-all hover:opacity-80"
                style={{ clipPath: CLIP_SM, backgroundColor: accent + "20", color: accent, border: `1px solid ${accent}40` }}>
                ← About
              </Link>
            </div>

            {/* Bottom stripe */}
            <div className="h-0.5" style={{ background: `linear-gradient(to right, transparent, ${accent}, transparent)` }} />
          </div>
        </div>

        {/* Bottom label */}
        <p className="mt-6 text-[9px] text-white/15 uppercase tracking-widest">
          Technovation Girls · Cambodia · 2026
        </p>
      </div>
    </div>
  );
}
