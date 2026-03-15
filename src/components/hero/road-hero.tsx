"use client";

import Link from "next/link";
import { useLang } from "@/context/lang-context";

export function RoadHero() {
  const { lang } = useLang();
  const kh = lang === "kh";
  const khFont = kh ? { fontFamily: "Siemreap, sans-serif" } : {};

  return (
    <section className="relative min-h-screen bg-zinc-800 overflow-hidden">
      {/* Main Road Surface */}
      <div className="absolute inset-0 bg-gradient-to-b from-zinc-700 via-zinc-600 to-zinc-700">
        {/* Road texture overlay */}
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.3) 2px, rgba(0,0,0,0.3) 4px)'
        }} />
      </div>

      {/* Left Lane - Single Yellow Broken Line (M2-01) */}
      <div className="absolute left-[15%] top-0 bottom-0 w-1">
        <div className="h-full flex flex-col animate-road-scroll-slow">
          {[...Array(30)].map((_, i) => (
            <div key={i} className="flex flex-col">
              <div className="h-20 w-1 bg-yellow-400" />
              <div className="h-20 w-1 bg-transparent" />
            </div>
          ))}
        </div>
      </div>

      {/* Left-Center Lane - Single Yellow Solid Line (M2-02) */}
      <div className="absolute left-[30%] top-0 bottom-0 w-1 bg-yellow-400" />

      {/* Center - Double Yellow Solid Line (M2-03) */}
      <div className="absolute left-[47%] top-0 bottom-0 w-1 bg-yellow-400" />
      <div className="absolute left-[49%] top-0 bottom-0 w-1 bg-yellow-400" />

      {/* Center-Right - Double Yellow Combination Line (M2-04) */}
      <div className="absolute left-[62%] top-0 bottom-0 w-1 bg-yellow-400" />
      <div className="absolute left-[64%] top-0 bottom-0 w-1">
        <div className="h-full flex flex-col animate-road-scroll-medium">
          {[...Array(30)].map((_, i) => (
            <div key={i} className="flex flex-col">
              <div className="h-20 w-1 bg-yellow-400" />
              <div className="h-20 w-1 bg-transparent" />
            </div>
          ))}
        </div>
      </div>

      {/* Right Lane - Single White Broken Line (M2-06) */}
      <div className="absolute left-[77%] top-0 bottom-0 w-1">
        <div className="h-full flex flex-col animate-road-scroll-fast">
          {[...Array(30)].map((_, i) => (
            <div key={i} className="flex flex-col">
              <div className="h-16 w-1 bg-white" />
              <div className="h-16 w-1 bg-transparent" />
            </div>
          ))}
        </div>
      </div>

      {/* Left Edge Line - White Solid (M2-08) */}
      <div className="absolute left-[5%] top-0 bottom-0 w-2 bg-white" />

      {/* Right Edge Line - White Solid (M2-08) */}
      <div className="absolute right-[5%] top-0 bottom-0 w-2 bg-white" />

      {/* Left Curb - Yellow-White Markings (M2-09) */}
      <div className="absolute left-0 top-0 bottom-0 w-12">
        <div className="h-full flex flex-col animate-curb-scroll">
          {[...Array(20)].map((_, i) => (
            <div key={i} className="flex flex-col">
              <div className="h-16 w-12 bg-yellow-400 border-r-4 border-black" style={{
                backgroundImage: 'repeating-linear-gradient(45deg, #fbbf24 0, #fbbf24 10px, #000 10px, #000 20px)'
              }} />
              <div className="h-16 w-12 bg-white border-r-4 border-black" style={{
                backgroundImage: 'repeating-linear-gradient(45deg, #fff 0, #fff 10px, #000 10px, #000 20px)'
              }} />
            </div>
          ))}
        </div>
      </div>

      {/* Right Curb - Red-White Markings (M2-10) */}
      <div className="absolute right-0 top-0 bottom-0 w-12">
        <div className="h-full flex flex-col animate-curb-scroll">
          {[...Array(20)].map((_, i) => (
            <div key={i} className="flex flex-col">
              <div className="h-16 w-12 bg-red-500 border-l-4 border-black" style={{
                backgroundImage: 'repeating-linear-gradient(45deg, #ef4444 0, #ef4444 10px, #000 10px, #000 20px)'
              }} />
              <div className="h-16 w-12 bg-white border-l-4 border-black" style={{
                backgroundImage: 'repeating-linear-gradient(45deg, #fff 0, #fff 10px, #000 10px, #000 20px)'
              }} />
            </div>
          ))}
        </div>
      </div>

      {/* Road Divider Blocks with Yellow-Black Markings (M2-11) */}
      <div className="absolute left-1/2 -ml-8 top-0 bottom-0 w-16">
        <div className="h-full flex flex-col justify-around animate-divider-scroll">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="relative h-24 w-16">
              {/* Divider block */}
              <div className="absolute inset-0 bg-zinc-400 border-2 border-black shadow-lg" />
              {/* Yellow-Black diagonal stripes */}
              <div className="absolute inset-0" style={{
                backgroundImage: 'repeating-linear-gradient(-45deg, #fbbf24 0, #fbbf24 15px, #000 15px, #000 30px)'
              }} />
              {/* Guide post circles */}
              <div className="absolute -top-2 left-1/2 -ml-2 w-4 h-4 bg-yellow-400 rounded-full border-2 border-black" />
              <div className="absolute -bottom-2 left-1/2 -ml-2 w-4 h-4 bg-yellow-400 rounded-full border-2 border-black" />
            </div>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-6 py-20">
        {/* Badge */}
        <div
          className="inline-block bg-yellow-400 text-black text-xs font-black tracking-widest uppercase px-4 py-2 border-2 border-black shadow-[4px_4px_0_#000] mb-8"
          style={khFont}
        >
          {kh ? "ប្រព័ន្ធសិក្សាថ្មី" : "New Learning System"}
        </div>

        {/* Main headline */}
        <h1 className="text-center mb-6">
          <div
            className="text-5xl md:text-7xl lg:text-8xl font-black text-white leading-tight mb-2 drop-shadow-[0_4px_8px_rgba(0,0,0,0.8)]"
            style={khFont}
          >
            {kh ? "ស្គាល់ស្ញ្ញា" : "Master Every"}
          </div>
          <div className="text-6xl md:text-8xl lg:text-9xl font-black leading-none drop-shadow-[0_4px_8px_rgba(0,0,0,0.8)]">
            <span className="text-yellow-400 underline decoration-white decoration-8">
              {kh ? "ចរាចរណ៍" : "Road Sign"}
            </span>
          </div>
          <div
            className="text-4xl md:text-6xl lg:text-7xl font-black text-white leading-tight mt-2 drop-shadow-[0_4px_8px_rgba(0,0,0,0.8)]"
            style={khFont}
          >
            {kh ? "ប្រឡងជោគជ័យ" : "Pass Your Exam"}
          </div>
        </h1>

        {/* Subtitle */}
        <p
          className="text-lg md:text-2xl text-white font-medium text-center max-w-3xl mb-12 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]"
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
            <div className="text-3xl md:text-5xl font-black text-yellow-400 mb-2 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
              1,200+
            </div>
            <div
              className="text-xs md:text-sm font-bold text-white uppercase tracking-wider drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]"
              style={khFont}
            >
              {kh ? "សិស្ស" : "Students"}
            </div>
          </div>
          <div className="text-center">
            <div className="text-3xl md:text-5xl font-black text-yellow-400 mb-2 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
              500+
            </div>
            <div
              className="text-xs md:text-sm font-bold text-white uppercase tracking-wider drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]"
              style={khFont}
            >
              {kh ? "សំណួរ" : "Questions"}
            </div>
          </div>
          <div className="text-center">
            <div className="text-3xl md:text-5xl font-black text-yellow-400 mb-2 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
              8
            </div>
            <div
              className="text-xs md:text-sm font-bold text-white uppercase tracking-wider drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]"
              style={khFont}
            >
              {kh ? "ប្រធានបទ" : "Categories"}
            </div>
          </div>
        </div>
      </div>

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes road-scroll-slow {
          0% {
            transform: translateY(-100%);
          }
          100% {
            transform: translateY(0);
          }
        }
        @keyframes road-scroll-medium {
          0% {
            transform: translateY(-100%);
          }
          100% {
            transform: translateY(0);
          }
        }
        @keyframes road-scroll-fast {
          0% {
            transform: translateY(-100%);
          }
          100% {
            transform: translateY(0);
          }
        }
        @keyframes curb-scroll {
          0% {
            transform: translateY(-100%);
          }
          100% {
            transform: translateY(0);
          }
        }
        @keyframes divider-scroll {
          0% {
            transform: translateY(-100%);
          }
          100% {
            transform: translateY(0);
          }
        }
        .animate-road-scroll-slow {
          animation: road-scroll-slow 8s linear infinite;
        }
        .animate-road-scroll-medium {
          animation: road-scroll-medium 6s linear infinite;
        }
        .animate-road-scroll-fast {
          animation: road-scroll-fast 4s linear infinite;
        }
        .animate-curb-scroll {
          animation: curb-scroll 5s linear infinite;
        }
        .animate-divider-scroll {
          animation: divider-scroll 10s linear infinite;
        }
      `}</style>
    </section>
  );
}
