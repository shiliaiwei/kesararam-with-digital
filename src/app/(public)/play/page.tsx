"use client";

import Link from "next/link";
import {
  FaGamepad,
  FaBolt,
  FaTrophy,
  FaClock,
  FaQuestion,
  FaRandom,
} from "react-icons/fa";
import { useLang } from "@/context/lang-context";

const GAME_MODES = [
  {
    id: "quick-quiz",
    icon: FaQuestion,
    title: "Quick Quiz",
    titleKh: "សំណួរលឿន",
    desc: "10 random questions. Test your knowledge across all categories in under 5 minutes.",
    descKh: "សំណួរចៃដន្យ ១០ — ធ្វើតេស្តភ្លាមៗ",
    color: "#eab308",
    href: "/road-sign",
    badge: "10 Questions",
    badgeKh: "១០ សំណួរ",
  },
  {
    id: "speed-round",
    icon: FaBolt,
    title: "Speed Round",
    titleKh: "វគ្គល្បឿន",
    desc: "60 seconds. Answer as many signs and rules as you can before time runs out.",
    descKh: "៦០ វិនាទី — ឆ្លើយចំនួនច្រើនបំផុត",
    color: "#ef4444",
    href: "/road-sign",
    badge: "60 Seconds",
    badgeKh: "៦០ វិនាទី",
  },
  {
    id: "sign-challenge",
    icon: FaGamepad,
    title: "Sign Challenge",
    titleKh: "ប្រឡងស្ញ្ញា",
    desc: "Identify traffic signs from images. Match the sign to its meaning — no multiple choice.",
    descKh: "ស្គាល់ស្ញ្ញាផ្លូវវិថី — ផ្គូផ្គងអត្ថន័យ",
    color: "#3b82f6",
    href: "/road-sign",
    badge: "Visual",
    badgeKh: "រូបភាព",
  },
  {
    id: "mixed-battle",
    icon: FaRandom,
    title: "Mixed Battle",
    titleKh: "ប្រយុទ្ធចម្រុះ",
    desc: "All 8 categories at random. The ultimate preparation for your driving theory exam.",
    descKh: "ប្រភេទទាំង ៨ — ត្រៀមប្រឡងពិត",
    color: "#a855f7",
    href: "/learn",
    badge: "All Categories",
    badgeKh: "គ្រប់ប្រភេទ",
  },
  {
    id: "daily-challenge",
    icon: FaClock,
    title: "Daily Challenge",
    titleKh: "បញ្ហាប្រចាំថ្ងៃ",
    desc: "A new set of 15 questions every day. Streak bonuses for consistent daily practice.",
    descKh: "សំណួរថ្មីរៀងរាល់ថ្ងៃ — ពិន្ទុបន្ថែម",
    color: "#22c55e",
    href: "/learn",
    badge: "Daily",
    badgeKh: "ប្រចាំថ្ងៃ",
  },
  {
    id: "exam-simulation",
    icon: FaTrophy,
    title: "Exam Simulation",
    titleKh: "ត្រាប់តាមប្រឡង",
    desc: "Full 40-question simulation timed like the real Cambodia driving theory exam.",
    descKh: "ស្រដៀងប្រឡងពិត — ៤០ សំណួរ",
    color: "#f97316",
    href: "/learn",
    badge: "40 Questions",
    badgeKh: "៤០ សំណួរ",
  },
];

const STATS = [
  {
    value: "500+",
    label: "Questions in pool",
    labelKh: "សំណួរក្នុងប្រព័ន្ធ",
    color: "#eab308",
  },
  { value: "6", label: "Game modes", labelKh: "របៀបលេង", color: "#3b82f6" },
  {
    value: "8",
    label: "Knowledge areas",
    labelKh: "ផ្នែកចំណេះដឹង",
    color: "#22c55e",
  },
  {
    value: "Real-time",
    label: "Leaderboard",
    labelKh: "ចំណាត់ថ្នាក់",
    color: "#ef4444",
  },
];

export default function PlayPage() {
  const { lang } = useLang();
  const kh = lang === "kh";
  const khFont = kh ? { fontFamily: "Siemreap, sans-serif" } : {};

  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="bg-yellow-400 border-b-2 border-[#a8a8a8] py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col items-start gap-4 max-w-2xl">
            <div
              className="inline-block bg-black text-white text-xs font-black tracking-widest uppercase px-3 py-1.5 rounded-[20px]"
              style={khFont}
            >
              {kh ? "លេងហ្គេម" : "Game Center"}
            </div>
            <h1
              className="text-5xl md:text-7xl font-black text-black leading-none"
              style={khFont}
            >
              {kh ? "ប្រកួត" : "Play &"}
              <br />
              {kh ? "ហ្វឹកហាត់" : "Practice"}
            </h1>
            <p
              className="text-lg text-black/70 max-w-lg leading-relaxed"
              style={khFont}
            >
              {kh
                ? "ជ្រើសរើសរបៀបលេង ហើយធ្វើតេស្តចំណេះដឹងបើកបររបស់អ្នក"
                : "Choose a game mode and sharpen your driving theory knowledge. Every session brings you closer to passing your exam."}
            </p>
            <div className="flex flex-wrap gap-3 mt-2">
              <Link
                href="/leaderboard"
                className="px-6 py-3 bg-black text-white font-black border-2 border-[#a8a8a8] rounded-[20px] shadow-[4px_4px_0_#000] hover:shadow-[6px_6px_0_#000] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all duration-100"
                style={khFont}
              >
                {kh ? "មើលចំណាត់ថ្នាក់" : "View Leaderboard"}
              </Link>
              <Link
                href="/learn"
                className="px-6 py-3 bg-white text-black font-black border-2 border-[#a8a8a8] rounded-[20px] shadow-[4px_4px_0_#000] hover:shadow-[6px_6px_0_#000] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all duration-100"
                style={khFont}
              >
                {kh ? "រៀនមុន" : "Study First"}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats row */}
      <section className="border-b-2 border-[#a8a8a8] bg-white py-8">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {STATS.map(({ value, label, labelKh, color }) => (
              <div
                key={label}
                className="border-2 border-[#a8a8a8] rounded-[20px] p-5 shadow-[4px_4px_0_#000] flex flex-col gap-1"
              >
                <span className="text-3xl font-black" style={{ color }}>
                  {value}
                </span>
                <span
                  className="text-sm font-bold text-zinc-600"
                  style={khFont}
                >
                  {kh ? labelKh : label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Game modes */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="mb-10">
            <div
              className="inline-block bg-black text-white text-xs font-black tracking-widest uppercase px-3 py-1.5 rounded-[20px] mb-3"
              style={khFont}
            >
              {kh ? "ជ្រើសរើស" : "Choose Mode"}
            </div>
            <h2 className="text-4xl font-black" style={khFont}>
              {kh ? "របៀបលេង" : "Game Modes"}
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {GAME_MODES.map(
              ({
                id,
                icon: Icon,
                title,
                titleKh,
                desc,
                descKh,
                color,
                href,
                badge,
                badgeKh,
              }) => (
                <Link
                  key={id}
                  href={href}
                  className="group bg-white border-2 border-[#a8a8a8] rounded-[20px] p-6 shadow-[4px_4px_0_#000] hover:shadow-[8px_8px_0_#000] hover:-translate-x-1 hover:-translate-y-1 transition-all duration-150 flex flex-col gap-4"
                >
                  {/* Icon + badge row */}
                  <div className="flex items-start justify-between">
                    <div
                      className="w-12 h-12 border-2 border-[#a8a8a8] rounded-[20px] flex items-center justify-center shadow-[2px_2px_0_#000]"
                      style={{ backgroundColor: color }}
                    >
                      <Icon size={20} className="text-black" />
                    </div>
                    <span
                      className="text-[10px] font-black tracking-widest uppercase px-2.5 py-1 border-2 border-[#a8a8a8] rounded-[20px]"
                      style={{ backgroundColor: color, ...khFont }}
                    >
                      {kh ? badgeKh : badge}
                    </span>
                  </div>

                  {/* Text */}
                  <div className="flex flex-col gap-2">
                    <h3 className="text-xl font-black" style={khFont}>
                      {kh ? titleKh : title}
                    </h3>
                    <p
                      className="text-sm text-zinc-600 leading-relaxed"
                      style={khFont}
                    >
                      {kh ? descKh : desc}
                    </p>
                  </div>

                  {/* CTA */}
                  <div className="mt-auto pt-2">
                    <span
                      className="inline-block text-sm font-black border-b-2 border-[#a8a8a8] group-hover:border-b-4 transition-all duration-100"
                      style={khFont}
                    >
                      {kh ? "ចាប់ផ្តើម" : "Start playing"}
                    </span>
                  </div>
                </Link>
              ),
            )}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="bg-black py-16 border-t-2 border-[#a8a8a8]">
        <div className="max-w-4xl mx-auto px-6 text-center flex flex-col items-center gap-6">
          <h2
            className="text-4xl md:text-5xl font-black text-white"
            style={khFont}
          >
            {kh ? "ត្រៀមខ្លួនប្រឡង?" : "Ready to test yourself?"}
          </h2>
          <p className="text-lg text-white/60" style={khFont}>
            {kh
              ? "ចូលរៀន — ចូលប្រកួត — ជោគជ័យ"
              : "Study the theory, play the games, pass the exam."}
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link
              href="/learn"
              className="px-8 py-4 bg-yellow-400 text-black font-black border-2 border-yellow-400 rounded-[20px] shadow-[4px_4px_0_#eab308] hover:shadow-[6px_6px_0_#eab308] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all duration-100"
              style={khFont}
            >
              {kh ? "ចូលរៀន" : "Start Learning"}
            </Link>
            <Link
              href="/login"
              className="px-8 py-4 bg-transparent text-white font-black border-2 border-white rounded-[20px] hover:bg-white hover:text-black transition-all duration-100"
              style={khFont}
            >
              {kh ? "បង្កើតគណនី" : "Create Free Account"}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
