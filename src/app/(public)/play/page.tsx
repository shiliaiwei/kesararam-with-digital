"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  FaGamepad, FaBolt, FaTrophy, FaClock, FaQuestion, FaRandom,
} from "react-icons/fa";
import { useLang } from "@/context/lang-context";
import { Users, ChevronRight } from "lucide-react";

const GAME_MODES = [
  { id: "quick-quiz", icon: FaQuestion, title: "Quick Quiz", titleKh: "សំណួរលឿន", desc: "10 random questions across all categories.", descKh: "សំណួរចៃដន្យ ១០ — ធ្វើតេស្តភ្លាមៗ", color: "#eab308", href: "/play/solo?mode=quick-quiz", badge: "10Q · 30s", badgeKh: "១០ · ៣០វ" },
  { id: "speed-round", icon: FaBolt, title: "Speed Round", titleKh: "វគ្គល្បឿន", desc: "Fast MCQ only — tap fast, score big.", descKh: "MCQ លឿន — ចុចឆាប់ ពិន្ទុច្រើន", color: "#ef4444", href: "/play/solo?mode=speed-round", badge: "20Q · 15s", badgeKh: "២០ · ១៥វ" },
  { id: "sign-challenge", icon: FaGamepad, title: "Sign Challenge", titleKh: "ប្រឡងសញ្ញា", desc: "Identify traffic signs from images only.", descKh: "ស្គាល់សញ្ញាផ្លូវវិថី — ផ្គូផ្គងអត្ថន័យ", color: "#3b82f6", href: "/play/solo?mode=sign-challenge", badge: "15Q · 20s", badgeKh: "១៥ · ២០វ" },
  { id: "mixed-battle", icon: FaRandom, title: "Mixed Battle", titleKh: "ប្រយុទ្ធចម្រុះ", desc: "All categories, all question types.", descKh: "ប្រភេទទាំង ៨ — ត្រៀមប្រឡងពិត", color: "#a855f7", href: "/play/solo?mode=mixed-battle", badge: "20Q · 30s", badgeKh: "២០ · ៣០វ" },
  { id: "daily-challenge", icon: FaClock, title: "Daily Challenge", titleKh: "បញ្ហាប្រចាំថ្ងៃ", desc: "New questions every day. Build your streak.", descKh: "សំណួរថ្មីរៀងរាល់ថ្ងៃ — ពិន្ទុបន្ថែម", color: "#22c55e", href: "/play/solo?mode=daily-challenge", badge: "15Q · 30s", badgeKh: "១៥ · ៣០វ" },
  { id: "exam-simulation", icon: FaTrophy, title: "Exam Simulation", titleKh: "ត្រាប់តាមប្រឡង", desc: "40 questions mirroring the real Cambodia exam.", descKh: "ស្រដៀងប្រឡងពិត — ៤០ សំណួរ", color: "#f97316", href: "/play/solo?mode=exam-simulation", badge: "40Q · 45s", badgeKh: "៤០ · ៤៥វ" },
];

const STATS = [
  { value: "500+", label: "Questions", labelKh: "សំណួរ", color: "#eab308" },
  { value: "6", label: "Game modes", labelKh: "របៀបលេង", color: "#3b82f6" },
  { value: "8", label: "Categories", labelKh: "ប្រភេទ", color: "#22c55e" },
  { value: "Live", label: "Multiplayer", labelKh: "ច្រើននាក់", color: "#ef4444" },
];

function JoinLiveSection({ lang }: { lang: string }) {
  const kh = lang === "kh";
  const khFont = kh ? { fontFamily: "Siemreap, sans-serif" } : {};
  const router = useRouter();
  const [code, setCode] = useState("");

  function join() {
    const c = code.trim().toUpperCase();
    if (c.length === 6) router.push(`/play/${c}`);
  }

  return (
    <section className="border-b-2 border-black bg-zinc-950 py-10">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row items-center gap-6 justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-yellow-400 border-2 border-yellow-400 flex items-center justify-center flex-shrink-0">
              <Users size={20} className="text-black" />
            </div>
            <div>
              <div className="text-white font-black text-lg" style={khFont}>
                {kh ? "ចូលហ្គេមផ្ទាល់" : "Join a Live Game"}
              </div>
              <div className="text-zinc-400 text-sm" style={khFont}>
                {kh ? "បញ្ចូលលេខកូដ ៦ ខ្ទង់" : "Enter the 6-character room code from your teacher"}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 w-full md:w-auto">
            <input
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase().slice(0, 6))}
              onKeyDown={(e) => e.key === "Enter" && join()}
              placeholder="ABC123"
              className="w-full md:w-40 border-2 border-yellow-400 bg-zinc-900 text-yellow-400 px-4 py-3 font-black text-xl tracking-widest text-center focus:outline-none placeholder:text-zinc-600"
              style={{ letterSpacing: "0.2em" }}
            />
            <button
              onClick={join}
              disabled={code.length !== 6}
              className="flex items-center gap-2 px-6 py-3 bg-yellow-400 text-black font-black border-2 border-yellow-400 disabled:opacity-40 transition-all hover:-translate-y-0.5"
              style={{ boxShadow: "3px 3px 0 #ffd700", ...khFont }}
            >
              {kh ? "ចូល" : "Join"}
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function PlayPage() {
  const { lang } = useLang();
  const kh = lang === "kh";
  const khFont = kh ? { fontFamily: "Siemreap, sans-serif" } : {};

  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="bg-yellow-400 border-b-2 border-black py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col items-start gap-4 max-w-2xl">
            <div className="inline-block bg-black text-white text-xs font-black tracking-widest uppercase px-3 py-1.5" style={khFont}>
              {kh ? "លេងហ្គេម" : "Game Center"}
            </div>
            <h1 className="text-5xl md:text-7xl font-black text-black leading-none" style={khFont}>
              {kh ? "ប្រកួត" : "Play &"}
              <br />
              {kh ? "ហ្វឹកហាត់" : "Practice"}
            </h1>
            <p className="text-lg text-black/70 max-w-lg leading-relaxed" style={khFont}>
              {kh
                ? "ជ្រើសរើសរបៀបលេង ហើយធ្វើតេស្តចំណេះដឹងបើកបររបស់អ្នក"
                : "Choose a game mode and sharpen your driving theory knowledge."}
            </p>
            <div className="flex flex-wrap gap-3 mt-2">
              <Link href="/leaderboard" className="px-6 py-3 bg-black text-white font-black border-2 border-black shadow-[4px_4px_0_#000] hover:shadow-[6px_6px_0_#000] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all duration-100" style={khFont}>
                {kh ? "មើលចំណាត់ថ្នាក់" : "View Leaderboard"}
              </Link>
              <Link href="/learn" className="px-6 py-3 bg-white text-black font-black border-2 border-black shadow-[4px_4px_0_#000] hover:shadow-[6px_6px_0_#000] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all duration-100" style={khFont}>
                {kh ? "រៀនមុន" : "Study First"}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Join live game */}
      <JoinLiveSection lang={lang} />

      {/* Stats */}
      <section className="border-b-2 border-black bg-white py-8">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {STATS.map(({ value, label, labelKh, color }) => (
              <div key={label} className="border-2 border-black p-5 shadow-[4px_4px_0_#000] flex flex-col gap-1">
                <span className="text-3xl font-black" style={{ color }}>{value}</span>
                <span className="text-sm font-bold text-zinc-600" style={khFont}>{kh ? labelKh : label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Game modes */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="mb-10">
            <div className="inline-block bg-black text-white text-xs font-black tracking-widest uppercase px-3 py-1.5 mb-3" style={khFont}>
              {kh ? "ជ្រើសរើស" : "Choose Mode"}
            </div>
            <h2 className="text-4xl font-black" style={khFont}>{kh ? "របៀបលេង" : "Game Modes"}</h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {GAME_MODES.map(({ id, icon: Icon, title, titleKh, desc, descKh, color, href, badge, badgeKh }) => (
              <Link
                key={id}
                href={href}
                className="group bg-white border-2 border-black p-6 shadow-[4px_4px_0_#000] hover:shadow-[8px_8px_0_#000] hover:-translate-x-1 hover:-translate-y-1 transition-all duration-150 flex flex-col gap-4"
              >
                <div className="flex items-start justify-between">
                  <div className="w-12 h-12 border-2 border-black flex items-center justify-center shadow-[2px_2px_0_#000]" style={{ backgroundColor: color }}>
                    <Icon size={20} className="text-black" />
                  </div>
                  <span className="text-[10px] font-black tracking-widest uppercase px-2.5 py-1 border-2 border-black" style={{ backgroundColor: color, ...khFont }}>
                    {kh ? badgeKh : badge}
                  </span>
                </div>
                <div className="flex flex-col gap-2">
                  <h3 className="text-xl font-black" style={khFont}>{kh ? titleKh : title}</h3>
                  <p className="text-sm text-zinc-600 leading-relaxed" style={khFont}>{kh ? descKh : desc}</p>
                </div>
                <div className="mt-auto pt-2">
                  <span className="inline-block text-sm font-black border-b-2 border-black group-hover:border-b-4 transition-all duration-100" style={khFont}>
                    {kh ? "ចាប់ផ្តើម" : "Start playing"}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-black py-16 border-t-2 border-black">
        <div className="max-w-4xl mx-auto px-6 text-center flex flex-col items-center gap-6">
          <h2 className="text-4xl md:text-5xl font-black text-white" style={khFont}>
            {kh ? "ត្រៀមខ្លួនប្រឡង?" : "Ready to test yourself?"}
          </h2>
          <p className="text-lg text-white/60" style={khFont}>
            {kh ? "ចូលរៀន — ចូលប្រកួត — ជោគជ័យ" : "Study the theory, play the games, pass the exam."}
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link href="/learn" className="px-8 py-4 bg-yellow-400 text-black font-black border-2 border-yellow-400 shadow-[4px_4px_0_#eab308] hover:shadow-[6px_6px_0_#eab308] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all duration-100" style={khFont}>
              {kh ? "ចូលរៀន" : "Start Learning"}
            </Link>
            <Link href="/login" className="px-8 py-4 bg-transparent text-white font-black border-2 border-white hover:bg-white hover:text-black transition-all duration-100" style={khFont}>
              {kh ? "បង្កើតគណនី" : "Create Free Account"}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
