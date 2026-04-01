"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

const MEMBERS: Record<string, {
  name: string; role: string; type: "student" | "mentor";
  id: string; photo: string; age?: string;
  contributions: string[]; quote: string;
}> = {
  "VSID-2026-001": {
    name: "DANAI YIN", role: "UI/UX Designer", type: "student", id: "VSID-2026-001", age: "12",
    photo: "https://res.cloudinary.com/dpgivqzrl/image/upload/v1773739866/DANAI_YIN_sezo2q.jpg",
    contributions: ["Designed all UI screens", "Created the neo-brutalist design system", "Led visual identity"],
    quote: "Design is how we make technology feel human.",
  },
  "VSID-2026-002": {
    name: "CHANTHA KANIKA", role: "Content & Research", type: "student", id: "VSID-2026-002", age: "13",
    photo: "https://res.cloudinary.com/dpgivqzrl/image/upload/v1773739866/CHANTHA_KANIKA_gmh6w9.jpg",
    contributions: ["Researched all 8 traffic sign categories", "Wrote bilingual content (KH/EN)", "Validated exam accuracy"],
    quote: "Knowledge is the foundation of every safe road.",
  },
  "VSID-2026-003": {
    name: "ROZA NEUN", role: "Frontend Developer", type: "student", id: "VSID-2026-003", age: "11",
    photo: "https://res.cloudinary.com/dpgivqzrl/image/upload/v1773739867/Roza_Neun_ciz33b.jpg",
    contributions: ["Built interactive quiz components", "Implemented live game UI", "Developed mobile-responsive layouts"],
    quote: "Every line of code is a step toward something real.",
  },
  "VSID-2026-004": {
    name: "LIN MANY", role: "Backend & Database", type: "student", id: "VSID-2026-004", age: "13",
    photo: "https://res.cloudinary.com/dpgivqzrl/image/upload/v1773739866/Lin_Many_nffno6.jpg",
    contributions: ["Designed the database schema", "Built API endpoints", "Implemented real-time game engine"],
    quote: "The backend is the engine — invisible but essential.",
  },
  "VSID-2026-005": {
    name: "SUN RUNAMARA", role: "QA & Testing", type: "student", id: "VSID-2026-005", age: "11",
    photo: "https://res.cloudinary.com/dpgivqzrl/image/upload/v1773739866/SUN_RUNAMARA_rmtlzf.jpg",
    contributions: ["Tested all game modes and flows", "Reported and tracked bugs", "Ensured bilingual accuracy"],
    quote: "Quality is not an act, it is a habit.",
  },
  "VSID-2026-M01": {
    name: "PISETH PHEAP", role: "Teacher & Program Lead", type: "mentor", id: "VSID-2026-M01",
    photo: "https://res.cloudinary.com/dpgivqzrl/image/upload/v1773739866/Piseth_Pheap_b189jm.jpg",
    contributions: ["Guided the team through Technovation curriculum", "Mentored project planning and execution", "Connected team with resources and community"],
    quote: "Teaching is not filling a bucket — it is lighting a fire.",
  },
  "VSID-2026-M02": {
    name: "VI SRIE", role: "University Student — Java / Project Management", type: "mentor", id: "VSID-2026-M02",
    photo: "https://res.cloudinary.com/dpgivqzrl/image/upload/v1775038113/eirsvi_scinny.jpg",
    contributions: ["Advised on software architecture", "Reviewed code quality and best practices", "Supported project management and timelines"],
    quote: "Build with intention. Ship with confidence.",
  },
};

export default function TeamMemberPage() {
  const params = useParams();
  const router = useRouter();
  const token = params.token as string;
  const [member, setMember] = useState<typeof MEMBERS[string] | null>(null);
  const [status, setStatus] = useState<"loading" | "valid" | "expired">("loading");

  useEffect(() => {
    if (!token) { setStatus("expired"); return; }
    fetch("/api/team-token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    })
      .then(r => r.json())
      .then(d => {
        if (d.valid && d.id && MEMBERS[d.id]) {
          setMember(MEMBERS[d.id]);
          setStatus("valid");
        } else {
          setStatus("expired");
        }
      })
      .catch(() => setStatus("expired"));
  }, [token]);

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (status === "expired") {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center gap-6 px-4 text-center">
        <div className="text-6xl font-black text-white/10">⏱</div>
        <h1 className="text-2xl font-black text-white">Access Expired</h1>
        <p className="text-white/40 text-sm max-w-xs">This QR code has expired. Please scan the card again to get a fresh link.</p>
        <Link href="/about" className="px-6 py-3 bg-yellow-400 text-black font-black text-sm border-2 border-black shadow-[3px_3px_0_#000] hover:shadow-[5px_5px_0_#000] transition-all">
          Back to About
        </Link>
      </div>
    );
  }

  if (!member) return null;

  const isMentor = member.type === "mentor";
  const accentColor = isMentor ? "#f59e0b" : "#eab308";

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col items-center justify-center px-4 py-12">
      {/* Card */}
      <div className="w-full max-w-sm bg-[#111] border-2 border-white/10 rounded-2xl overflow-hidden shadow-[0_0_60px_rgba(0,0,0,0.8)]">
        {/* Top stripe */}
        <div className="h-1.5" style={{ backgroundColor: accentColor }} />

        {/* Header */}
        <div className="px-6 pt-5 pb-4 border-b border-white/10">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-black uppercase tracking-widest text-white/30">KWD · Kesararam With Digital</span>
            <span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border"
              style={{ color: accentColor, borderColor: accentColor + "40", backgroundColor: accentColor + "15" }}>
              {isMentor ? "MENTOR" : "STUDENT"}
            </span>
          </div>
          <p className="text-[10px] text-white/20 uppercase tracking-widest">ALL-ACCESS · TECHNOVATION 2026</p>
        </div>

        {/* Photo */}
        <div className="flex justify-center pt-6 pb-4">
          <div className="w-28 h-28 rounded-full overflow-hidden border-4"
            style={{ borderColor: accentColor, boxShadow: `0 0 24px ${accentColor}44` }}>
            <img src={member.photo} alt={member.name} className="w-full h-full object-cover object-top" />
          </div>
        </div>

        {/* Info */}
        <div className="px-6 pb-5 text-center">
          <p className="text-[10px] text-white/30 uppercase tracking-widest mb-1">@{member.name.toLowerCase().replace(" ", "")}</p>
          <h1 className="text-2xl font-black text-white mb-1">{member.name}</h1>
          <p className="text-sm text-white/50 mb-1">{member.role}</p>
          {member.age && <p className="text-xs text-white/25">Age {member.age}</p>}
        </div>

        {/* Divider */}
        <div className="mx-6 border-t border-white/10" />

        {/* Contributions */}
        <div className="px-6 py-4">
          <p className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-3">Contributions</p>
          <div className="flex flex-col gap-2">
            {member.contributions.map((c, i) => (
              <div key={i} className="flex items-start gap-2">
                <span className="text-xs mt-0.5 shrink-0" style={{ color: accentColor }}>▸</span>
                <span className="text-xs text-white/65">{c}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Quote */}
        <div className="mx-6 mb-5 px-4 py-3 rounded-xl border border-white/8 bg-white/3">
          <p className="text-xs text-white/50 italic">"{member.quote}"</p>
        </div>

        {/* Footer */}
        <div className="px-6 pb-5 flex items-center justify-between">
          <div>
            <p className="text-[9px] text-white/20 uppercase tracking-widest">Reference ID</p>
            <p className="text-xs font-black text-white/40">{member.id}</p>
          </div>
          <Link href="/about"
            className="text-xs font-black px-3 py-1.5 rounded-lg border transition-colors"
            style={{ color: accentColor, borderColor: accentColor + "40", backgroundColor: accentColor + "10" }}>
            ← About
          </Link>
        </div>
      </div>
    </div>
  );
}
