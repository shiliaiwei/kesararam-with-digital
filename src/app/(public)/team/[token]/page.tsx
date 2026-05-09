"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

const MEMBERS: Record<string, {
  lastName: string; fullName: string; role: string; type: "student" | "mentor";
  photo: string; contributions: string[]; quote: string;
}> = {
  "VSID-2026-001": {
    lastName: "YIN", fullName: "DANAI YIN", role: "Voice Reading · Team Lead", type: "student",
    photo: "https://res.cloudinary.com/dpgivqzrl/image/upload/f_auto,q_auto,w_400/v1773739866/DANAI_YIN_sezo2q.jpg",
    contributions: ["Designed all UI screens", "Created the design system", "Led visual identity"],
    quote: "Design is how we make technology feel human.",
  },
  "VSID-2026-002": {
    lastName: "KANIKA", fullName: "CHANTHA KANIKA", role: "Content & Research", type: "student",
    photo: "https://res.cloudinary.com/dpgivqzrl/image/upload/f_auto,q_auto,w_400/v1773739866/CHANTHA_KANIKA_gmh6w9.jpg",
    contributions: ["Researched all 8 traffic sign categories", "Wrote bilingual content (KH/EN)", "Validated exam accuracy"],
    quote: "Knowledge is the foundation of every safe road.",
  },
  "VSID-2026-003": {
    lastName: "NEUN", fullName: "ROZA NEUN", role: "UI/UX Design", type: "student",
    photo: "https://res.cloudinary.com/dpgivqzrl/image/upload/f_auto,q_auto,w_400/v1773739867/Roza_Neun_ciz33b.jpg",
    contributions: ["Built interactive quiz components", "Implemented live game UI", "Developed mobile-responsive layouts"],
    quote: "Every line of code is a step toward something real.",
  },
  "VSID-2026-004": {
    lastName: "MANY", fullName: "LIN MANY", role: "QA & Testing", type: "student",
    photo: "https://res.cloudinary.com/dpgivqzrl/image/upload/f_auto,q_auto,w_400/v1773739866/Lin_Many_nffno6.jpg",
    contributions: ["Designed the database schema", "Built API endpoints", "Implemented real-time game engine"],
    quote: "The backend is the engine — invisible but essential.",
  },
  "VSID-2026-005": {
    lastName: "RUNAMARA", fullName: "SUN RUNAMARA", role: "QA & Testing", type: "student",
    photo: "https://res.cloudinary.com/dpgivqzrl/image/upload/f_auto,q_auto,w_400/v1773739866/SUN_RUNAMARA_rmtlzf.jpg",
    contributions: ["Tested all game modes and flows", "Reported and tracked bugs", "Ensured bilingual accuracy"],
    quote: "Quality is not an act, it is a habit.",
  },
  "VSID-2026-M01": {
    lastName: "PISETH", fullName: "PHEAP PISETH", role: "Teacher & Program Lead", type: "mentor",
    photo: "https://res.cloudinary.com/dpgivqzrl/image/upload/f_auto,q_auto,w_400/v1775248418/481f63ff38a1842e9fce11ad5edr_xp2anf.png",
    contributions: ["Program Lead connecting team with resources", "Resolved resource conflicts & challenges", "Mentored students throughout competition"],
    quote: "Teaching is not filling a bucket — it is lighting a fire.",
  },
  "VSID-2026-M02": {
    lastName: "WEI", fullName: "SHILIAI WEI", role: "Design, Technical & Project Management", type: "mentor",
    photo: "https://res.cloudinary.com/dpgivqzrl/image/upload/f_auto,q_auto,w_400/v1775248420/07d5d96b3f0a8af7743f3b4053ba18dr_ydb0zm.png",
    contributions: ["Advised on software architecture", "Reviewed code quality", "Supported project management"],
    quote: "Build with intention. Ship with confidence.",
  },
};

export default function TeamMemberPage() {
  const params = useParams();
  const router = useRouter();
  const code = params.token as string;

  const [member, setMember] = useState<typeof MEMBERS[string] | null>(null);
  const [status, setStatus] = useState<"loading" | "valid" | "expired">("loading");
  const [countdown, setCountdown] = useState(60);

  // Verify token
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
          setStatus("valid");
        } else {
          setStatus("expired");
        }
      })
      .catch(() => setStatus("expired"));
  }, [code]);

  // 60-second countdown then redirect
  useEffect(() => {
    if (status !== "valid") return;
    const interval = setInterval(() => {
      setCountdown(c => {
        if (c <= 1) {
          clearInterval(interval);
          router.replace("/");
          return 0;
        }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [status, router]);

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (status === "expired") {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center gap-5 px-4 text-center">
        <p className="text-white/20 text-xs uppercase tracking-widest">Access expired</p>
        <p className="text-white/50 text-sm max-w-xs">Please scan the QR code again to get a fresh link.</p>
        <Link href="/about"
          className="text-xs font-black uppercase tracking-widest px-5 py-2.5 bg-yellow-400 text-black">
          Back to About
        </Link>
      </div>
    );
  }

  if (!member) return null;

  const isMentor = member.type === "mentor";
  const accent = isMentor ? "#f59e0b" : "#eab308";

  return (
    <div className="min-h-screen bg-[#060606] flex items-center justify-center px-4 py-10 relative overflow-hidden">
      {/* Background FUI decorations */}
      <div className="absolute top-10 left-10 text-[10px] text-white/10 font-mono hidden md:block">SYS_CORE // VER_2.0.26</div>
      <div className="absolute bottom-10 right-10 text-[10px] text-white/10 font-mono hidden md:block">VSID_LINK // AUTH_GRANTED</div>
      <div className="absolute top-1/2 left-0 w-full h-px bg-yellow-400/5 -translate-y-1/2" />
      <div className="absolute left-1/2 top-0 h-full w-px bg-yellow-400/5 -translate-x-1/2" />

      <div className="w-full max-w-xs relative z-10">

        {/* FUI framing */}
        <div className="absolute -top-3 -left-3 w-6 h-6 border-t-[1.5px] border-l-[1.5px] border-yellow-500/50" />
        <div className="absolute -top-3 -right-3 w-6 h-6 border-t-[1.5px] border-r-[1.5px] border-yellow-500/50" />
        <div className="absolute -bottom-3 -left-3 w-6 h-6 border-b-[1.5px] border-l-[1.5px] border-yellow-500/50" />
        <div className="absolute -bottom-3 -right-3 w-6 h-6 border-b-[1.5px] border-r-[1.5px] border-yellow-500/50" />

        {/* Card */}
        <div className="bg-[#0c0c0c] border border-white/5 overflow-hidden shadow-[0_0_30px_rgba(234,179,8,0.05)] relative"
          style={{ clipPath: "polygon(0 15px, 15px 0, 100% 0, 100% calc(100% - 15px), calc(100% - 15px) 100%, 0 100%)" }}>

          {/* FUI Brand Logo */}
          <div className="absolute top-4 right-4 z-20">
             <img src="/brand/kwd-black-text.png" alt="KWD" className="h-4 opacity-50 brightness-0 invert object-contain" />
          </div>

          {/* Top color bar */}
          <div className="h-1" style={{ backgroundColor: accent }} />

          {/* Photo — full width, portrait crop, download restricted */}
          <div className="relative w-full select-none" style={{ paddingBottom: "100%" }}
            onContextMenu={e => e.preventDefault()}
            onDragStart={e => e.preventDefault()}
          >
            <img
              src={member.photo}
              alt={member.lastName}
              draggable={false}
              className="absolute inset-0 w-full h-full object-cover object-top pointer-events-none"
              style={{ userSelect: "none", WebkitUserSelect: "none" }}
            />
            {/* Invisible overlay blocks right-click on image */}
            <div className="absolute inset-0" onContextMenu={e => e.preventDefault()} />
            {/* Gradient overlay at bottom of photo */}
            <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-[#111] to-transparent pointer-events-none" />
          </div>

          {/* Info */}
          <div className="px-5 pt-3 pb-5">

            {/* Type badge */}
            <div className="flex items-center justify-between mb-3">
              <span className="text-[9px] font-black uppercase tracking-widest"
                style={{ color: accent }}>
                {isMentor ? "Mentor" : "Student"} · KWD 2026
              </span>
              {/* Countdown dot */}
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full"
                  style={{ backgroundColor: countdown > 15 ? "#22c55e" : "#ef4444" }} />
                <span className="text-[9px] text-white/25 tabular-nums">{countdown}s</span>
              </div>
            </div>

            {/* Last name — large */}
            <h1 className="text-4xl font-black text-white leading-none mb-1 tracking-tight">
              {member.lastName}
            </h1>
            <p className="text-xs text-white/40 mb-4">{member.role}</p>

            {/* Divider */}
            <div className="h-px bg-white/8 mb-4" />

            {/* Contributions */}
            <div className="flex flex-col gap-2 mb-4">
              {member.contributions.map((c, i) => (
                <div key={i} className="flex items-start gap-2">
                  <span className="text-xs shrink-0 mt-0.5" style={{ color: accent }}>—</span>
                  <span className="text-xs text-white/55 leading-relaxed">{c}</span>
                </div>
              ))}
            </div>

            {/* Quote */}
            <p className="text-[11px] text-white/30 italic border-l-2 pl-3 leading-relaxed"
              style={{ borderColor: accent + "60" }}>
              "{member.quote}"
            </p>
          </div>

          {/* Footer */}
          <div className="px-5 py-3 border-t border-white/8 flex items-center justify-between">
            <span className="text-[9px] text-white/20 uppercase tracking-widest">
              Kesararam With Digital
            </span>
            <Link href="/about"
              className="text-[9px] font-black uppercase tracking-widest text-white/30 hover:text-white transition-colors">
              ← About
            </Link>
          </div>
        </div>

        {/* Redirect notice */}
        <p className="text-center text-[9px] text-white/15 mt-4 uppercase tracking-widest">
          Redirecting in {countdown}s
        </p>
      </div>
    </div>
  );
}
