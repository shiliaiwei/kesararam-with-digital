"use client";

import Link from "next/link";
import { useLang } from "@/context/lang-context";

const TRAFFIC_SIGNS = [
  "https://res.cloudinary.com/dpgivqzrl/image/upload/e_background_removal/f_auto,q_auto/photo_29_2026-03-15_14-25-55_fe1jw4?_a=BAMAAAUs0",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/e_background_removal/f_auto,q_auto/photo_28_2026-03-15_14-25-55_shzh19?_a=BAMAAAUs0",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/e_background_removal/f_auto,q_auto/photo_27_2026-03-15_14-25-55_dzw4l5?_a=BAMAAAUs0",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/e_background_removal/f_auto,q_auto/photo_26_2026-03-15_14-25-55_yleyvu?_a=BAMAAAUs0",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/e_background_removal/f_auto,q_auto/photo_25_2026-03-15_14-25-55_eakxhh?_a=BAMAAAUs0",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/e_background_removal/f_auto,q_auto/photo_24_2026-03-15_14-25-55_d5pki2?_a=BAMAAAUs0",
];

export function RoadHero() {
  const { lang } = useLang();
  const kh = lang === "kh";
  const khFont = kh ? { fontFamily: "Siemreap, sans-serif" } : {};

  return (
    <section className="relative min-h-screen bg-white overflow-hidden">
      {/* Animated road background */}
      <div className="absolute inset-0">
        {/* Road surface */}
        <div className="absolute inset-0 bg-gradient-to-b from-zinc-100 to-zinc-200" />
        
        {/* Road markings - animated dashed lines */}
        <div className="absolute left-1/2 top-0 bottom-0 w-2 -ml-1">
          <div className="h-full flex flex-col justify-around animate-road-scroll">
            {[...Array(20)].map((_, i) => (
              <div key={i} className="h-16 w-2 bg-yellow-400 rounded-full" />
            ))}
          </div>
        </div>

        {/* Side road lines */}
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-white" />
        <div className="absolute right-0 top-0 bottom-0 w-1 bg-white" />
      </div>

      {/* Floating traffic signs */}
      <div className="absolute inset-0 pointer-events-none">
        {TRAFFIC_SIGNS.map((sign, index) => (
          <div
            key={index}
            className="absolute animate-float"
            style={{
              left: `${10 + (index % 3) * 30}%`,
              top: `${15 + Math.floor(index / 3) * 35}%`,
              animationDelay: `${index * 0.5}s`,
              animationDuration: `${3 + (index % 3)}s`,
            }}
          >
            <img
              src={sign}
              alt="Traffic sign"
              className="w-16 h-16 md:w-24 md:h-24 opacity-20 hover:opacity-60 transition-opacity duration-300"
            />
          </div>
        ))}
      </div>

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-6 py-20">
        {/* Badge */}
        <div
          className="inline-block bg-yellow-400 text-black text-xs font-black tracking-widest uppercase px-4 py-2 border-2 border-black shadow-[4px_4px_0_#000] mb-8 animate-bounce-slow"
          style={khFont}
        >
          {kh ? "ប្រព័ន្ធសិក្សាថ្មី" : "New Learning System"}
        </div>

        {/* Main headline */}
        <h1 className="text-center mb-6">
          <div
            className="text-5xl md:text-7xl lg:text-8xl font-black text-black leading-tight mb-2"
            style={khFont}
          >
            {kh ? "ស្គាល់ស្ញ្ញា" : "Master Every"}
          </div>
          <div className="text-6xl md:text-8xl lg:text-9xl font-black leading-none">
            <span className="text-yellow-400 underline decoration-black decoration-8">
              {kh ? "ចរាចរណ៍" : "Road Sign"}
            </span>
          </div>
          <div
            className="text-4xl md:text-6xl lg:text-7xl font-black text-black leading-tight mt-2"
            style={khFont}
          >
            {kh ? "ប្រឡងជោគជ័យ" : "Pass Your Exam"}
          </div>
        </h1>

        {/* Subtitle */}
        <p
          className="text-lg md:text-2xl text-zinc-700 font-medium text-center max-w-3xl mb-12"
          style={khFont}
        >
          {kh
            ? "រៀនស្ញ្ញាចរាចរណ៍ ច្បាប់ផ្លូវ និងជំនាញបើកបរជាមួយប្រព័ន្ធអន្តរកម្ម"
            : "Learn traffic signs, road laws, and driving skills with interactive lessons"}
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 mb-16">
          <Link
            href="/learn"
            className="group px-8 py-4 bg-yellow-400 text-black font-black text-lg border-2 border-black shadow-[6px_6px_0_#000] hover:shadow-[8px_8px_0_#000] hover:-translate-x-1 hover:-translate-y-1 transition-all duration-150"
            style={khFont}
          >
            <span className="flex items-center gap-2">
              {kh ? "ចាប់ផ្តើមរៀន" : "Start Learning"}
              <span className="group-hover:translate-x-1 transition-transform">
                →
              </span>
            </span>
          </Link>
          <Link
            href="/play"
            className="px-8 py-4 bg-white text-black font-black text-lg border-2 border-black shadow-[6px_6px_0_#000] hover:shadow-[8px_8px_0_#000] hover:-translate-x-1 hover:-translate-y-1 transition-all duration-150"
            style={khFont}
          >
            {kh ? "ចូលប្រកួត" : "Take Challenge"}
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-6 md:gap-12">
          <div className="text-center">
            <div className="text-3xl md:text-5xl font-black text-yellow-400 mb-2">
              1,200+
            </div>
            <div
              className="text-xs md:text-sm font-bold text-zinc-600 uppercase tracking-wider"
              style={khFont}
            >
              {kh ? "សិស្ស" : "Students"}
            </div>
          </div>
          <div className="text-center">
            <div className="text-3xl md:text-5xl font-black text-yellow-400 mb-2">
              500+
            </div>
            <div
              className="text-xs md:text-sm font-bold text-zinc-600 uppercase tracking-wider"
              style={khFont}
            >
              {kh ? "សំណួរ" : "Questions"}
            </div>
          </div>
          <div className="text-center">
            <div className="text-3xl md:text-5xl font-black text-yellow-400 mb-2">
              8
            </div>
            <div
              className="text-xs md:text-sm font-bold text-zinc-600 uppercase tracking-wider"
              style={khFont}
            >
              {kh ? "ប្រធានបទ" : "Categories"}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom road fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white to-transparent pointer-events-none" />

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes road-scroll {
          0% {
            transform: translateY(-100%);
          }
          100% {
            transform: translateY(0);
          }
        }
        @keyframes float {
          0%,
          100% {
            transform: translateY(0) rotate(0deg);
          }
          50% {
            transform: translateY(-20px) rotate(5deg);
          }
        }
        @keyframes bounce-slow {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }
        .animate-road-scroll {
          animation: road-scroll 3s linear infinite;
        }
        .animate-float {
          animation: float 4s ease-in-out infinite;
        }
        .animate-bounce-slow {
          animation: bounce-slow 2s ease-in-out infinite;
        }
      `}</style>
    </section>
  );
}
