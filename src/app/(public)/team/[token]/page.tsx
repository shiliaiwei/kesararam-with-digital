"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

// Three bilingual role tags per member — KH verbatim from KWD_អំពីពួកយើង.txt
type RoleTag = { kh: string; en: string };

const MEMBERS: Record<string, {
  lastName: string;
  fullName: string;
  roleTags: RoleTag[];
  type: "student" | "mentor";
  photo: string;
  quote: string;
}> = {
  "VSID-2026-001": {
    lastName: "DANAI", fullName: "YIN DANAI", type: "student",
    photo: "https://res.cloudinary.com/dpgivqzrl/image/upload/f_auto,q_auto,w_400/v1773739866/DANAI_YIN_sezo2q.jpg",
    roleTags: [
      { kh: "អ្នកអានសំលេង",                    en: "Voice Reading" },
      { kh: "អ្នកដឹកនាំក្រុម",                  en: "Team Lead" },
      { kh: "ត្រួតពិនិត្យ និងកែសម្រួលមាតិកា", en: "Content Review & Editing" },
    ],
    quote: "Design is how we make technology feel human.",
  },
  "VSID-2026-002": {
    lastName: "KANIKA", fullName: "CHANTHA KANIKA", type: "student",
    photo: "https://res.cloudinary.com/dpgivqzrl/image/upload/f_auto,q_auto,w_400/v1773739866/CHANTHA_KANIKA_gmh6w9.jpg",
    roleTags: [
      { kh: "ត្រួតពិនិត្យ",                     en: "Review" },
      { kh: "កែសម្រួលមាតិកា",                    en: "Content Editing" },
      { kh: "ការស្រាវជ្រាវ",                     en: "Research" },
    ],
    quote: "Knowledge is the foundation of every safe road.",
  },
  "VSID-2026-003": {
    lastName: "NEUN", fullName: "ROZA NEUN", type: "student",
    photo: "https://res.cloudinary.com/dpgivqzrl/image/upload/f_auto,q_auto,w_400/v1773739867/Roza_Neun_ciz33b.jpg",
    roleTags: [
      { kh: "រចនា UI/UX",                        en: "UI/UX Design" },
      { kh: "ត្រួតពិនិត្យ",                     en: "Review" },
      { kh: "កែសម្រួលមាតិកា",                    en: "Content Editing" },
    ],
    quote: "Every design decision is a step toward something real.",
  },
  "VSID-2026-004": {
    lastName: "MANY", fullName: "LIM MANY", type: "student",
    photo: "https://res.cloudinary.com/dpgivqzrl/image/upload/f_auto,q_auto,w_400/v1773739866/Lin_Many_nffno6.jpg",
    roleTags: [
      { kh: "ធានាគុណភាព",                        en: "Quality Assurance" },
      { kh: "តេស្ត",                             en: "Testing" },
      { kh: "ត្រួតពិនិត្យ និងកែសម្រួលមាតិកា", en: "Content Review & Editing" },
    ],
    quote: "Quality is not an act — it is a habit.",
  },
  "VSID-2026-005": {
    lastName: "RUNAMARA", fullName: "SUN RUNAMARA", type: "student",
    photo: "https://res.cloudinary.com/dpgivqzrl/image/upload/f_auto,q_auto,w_400/v1773739866/SUN_RUNAMARA_rmtlzf.jpg",
    roleTags: [
      { kh: "ធានាគុណភាព",                        en: "Quality Assurance" },
      { kh: "តេស្ត",                             en: "Testing" },
      { kh: "ត្រួតពិនិត្យ និងកែសម្រួលមាតិកា", en: "Content Review & Editing" },
    ],
    quote: "Every test is a promise to the user.",
  },
  "VSID-2026-M01": {
    lastName: "PISETH", fullName: "PHEAP PISETH", type: "mentor",
    photo: "https://res.cloudinary.com/dpgivqzrl/image/upload/f_auto,q_auto,w_400/v1775248418/481f63ff38a1842e9fce11ad5edr_xp2anf.png",
    roleTags: [
      { kh: "គ្រូបង្រៀន",                        en: "Teacher & Mentor" },
      { kh: "អ្នកដឹកនាំកម្មវិធី",               en: "Program Lead" },
      { kh: "ការត្រួតពិនិត្យប្រសិទ្ធភាពការងារជាក្រុម", en: "Team Performance Oversight" },
    ],
    quote: "Teaching is not filling a bucket — it is lighting a fire.",
  },
  "VSID-2026-M02": {
    lastName: "AIWEI", fullName: "SHILI AIWEI", type: "mentor",
    photo: "https://avatars.githubusercontent.com/u/70220432?v=4",
    roleTags: [
      { kh: "គ្រូណែនាំ",                         en: "Mentor" },
      { kh: "គ្រប់គ្រងបច្ចេកទេស",               en: "Technical Management" },
      { kh: "គំនិតច្នៃប្រឌិត និងធនធានគម្រោង",  en: "Creative Ideas & Project Resources" },
    ],
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

  useEffect(() => {
    if (status !== "valid") return;
    const interval = setInterval(() => {
      setCountdown(c => {
        if (c <= 1) { clearInterval(interval); router.replace("/"); return 0; }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [status, router]);

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (status === "expired") {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center gap-5 px-4 text-center">
        <p className="text-white/20 text-xs uppercase tracking-widest">Access expired</p>
        <p className="text-white/50 text-sm max-w-xs">Please scan the QR code again to get a fresh link.</p>
        <Link href="/about" className="text-xs font-black uppercase tracking-widest px-5 py-2.5 bg-yellow-400 text-black">
          Back to About
        </Link>
      </div>
    );
  }

  if (!member) return null;

  const isMentor = member.type === "mentor";
  const accent = isMentor ? "#f59e0b" : "#eab308";
  const CLIP = "polygon(0 14px, 14px 0, 100% 0, 100% calc(100% - 14px), calc(100% - 14px) 100%, 0 100%)";

  return (
    <div className="min-h-screen bg-[#060606] flex items-center justify-center px-4 py-10 relative overflow-hidden">
      {/* Subtle FUI grid */}
      <div className="absolute inset-0 opacity-[0.03]"
        style={{ backgroundImage: "linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)", backgroundSize: "40px 40px" }} />
      <div className="absolute top-8 left-8 text-[9px] text-white/10 font-mono hidden md:block">KWD · VSID_AUTH · 2026</div>
      <div className="absolute bottom-8 right-8 text-[9px] text-white/10 font-mono hidden md:block">TECHNOVATION GIRLS · #50777</div>

      <div className="w-full max-w-xs relative z-10">

        {/* Corner brackets */}
        <div className="absolute -top-3 -left-3 w-5 h-5 border-t border-l border-yellow-500/40" />
        <div className="absolute -top-3 -right-3 w-5 h-5 border-t border-r border-yellow-500/40" />
        <div className="absolute -bottom-3 -left-3 w-5 h-5 border-b border-l border-yellow-500/40" />
        <div className="absolute -bottom-3 -right-3 w-5 h-5 border-b border-r border-yellow-500/40" />

        {/* Card */}
        <div className="bg-[#0c0c0c] border border-white/5 overflow-hidden" style={{ clipPath: CLIP }}>

          {/* Accent bar */}
          <div className="h-[3px] w-full" style={{ backgroundColor: accent }} />

          {/* Photo */}
          <div className="relative w-full select-none" style={{ paddingBottom: "90%" }}
            onContextMenu={e => e.preventDefault()} onDragStart={e => e.preventDefault()}>
            <img src={member.photo} alt={member.lastName} draggable={false}
              className="absolute inset-0 w-full h-full object-cover object-top pointer-events-none"
              style={{ userSelect: "none" }} />
            <div className="absolute inset-0" onContextMenu={e => e.preventDefault()} />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0c0c0c] via-transparent to-transparent" />

            {/* KWD logo watermark */}
            <div className="absolute top-3 right-3">
              <img src="/brand/kwd-black_nobackground.png" alt="KWD" className="h-4 opacity-30 brightness-0 invert" />
            </div>
          </div>

          {/* Info */}
          <div className="px-5 pt-4 pb-5 flex flex-col gap-4">

            {/* Header row */}
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-[9px] font-black uppercase tracking-widest mb-1" style={{ color: accent }}>
                  {isMentor ? "Mentor" : "Student"} · KWD 2026
                </p>
                <h1 className="text-3xl font-black text-white leading-none tracking-tight">{member.lastName}</h1>
                <p className="text-xs text-white/30 mt-0.5">{member.fullName}</p>
              </div>
              {/* Countdown */}
              <div className="flex items-center gap-1.5 shrink-0 mt-1">
                <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: countdown > 15 ? "#22c55e" : "#ef4444" }} />
                <span className="text-[9px] text-white/25 tabular-nums font-mono">{countdown}s</span>
              </div>
            </div>

            {/* ── Three bilingual role tags (KH verbatim from doc + EN) ── */}
            <div className="flex flex-col gap-1.5">
              {member.roleTags.map((tag, i) => (
                <div key={i}
                  className="flex items-center justify-between gap-3 px-3 py-2 border"
                  style={{ borderColor: accent + "30", backgroundColor: accent + "08" }}
                >
                  {/* Khmer — verbatim from source doc */}
                  <span className="text-[11px] text-white/80 leading-snug"
                    style={{ fontFamily: '"GoogleSans", "Google Sans Khmer", Siemreap, sans-serif' }}>
                    {tag.kh}
                  </span>
                  {/* English translation */}
                  <span className="text-[9px] font-bold uppercase tracking-wider shrink-0"
                    style={{ color: accent + "99" }}>
                    {tag.en}
                  </span>
                </div>
              ))}
            </div>

            {/* Divider */}
            <div className="h-px" style={{ backgroundColor: "rgba(255,255,255,0.06)" }} />

            {/* Quote */}
            <p className="text-[11px] text-white/30 italic leading-relaxed border-l-2 pl-3"
              style={{ borderColor: accent + "50" }}>
              "{member.quote}"
            </p>
          </div>

          {/* Footer */}
          <div className="px-5 py-3 border-t flex items-center justify-between" style={{ borderColor: "rgba(255,255,255,0.05)" }}>
            <span className="text-[9px] text-white/15 uppercase tracking-widest">Kesararam With Digital</span>
            <Link href="/about" className="text-[9px] font-black uppercase tracking-widest text-white/25 hover:text-white transition-colors">
              ← About
            </Link>
          </div>
        </div>

        <p className="text-center text-[9px] text-white/10 mt-4 uppercase tracking-widest font-mono">
          Redirecting in {countdown}s
        </p>
      </div>
    </div>
  );
}
