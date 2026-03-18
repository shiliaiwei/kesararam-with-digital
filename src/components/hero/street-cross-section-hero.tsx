"use client";

import Link from "next/link";
import { useLang } from "@/context/lang-context";

export function StreetCrossSectionHero() {
  const { lang } = useLang();
  const kh = lang === "kh";
  const khFont = kh ? { fontFamily: "Siemreap, sans-serif" } : {};

  return (
    <section className="relative min-h-screen bg-white overflow-hidden flex items-center justify-center py-12 md:py-20">
      {/* Main Content Container */}
      <div className="relative z-10 w-full max-w-[1800px] mx-auto px-4 md:px-8">
        {/* Text Content Above Street */}
        <div className="text-center mb-8 md:mb-16">
          <div
            className="inline-block bg-yellow-400 text-black text-xs font-black tracking-widest uppercase px-4 py-2 border-2 border-black shadow-[4px_4px_0_#000] mb-6"
            style={khFont}
          >
            {kh ? "ប្រព័ន្ធសិក្សាថ្មី" : "NEW LEARNING SYSTEM"}
          </div>

          <h1 className="mb-6">
            <div
              className="text-4xl md:text-6xl lg:text-7xl font-black text-zinc-800 leading-tight mb-2"
              style={khFont}
            >
              {kh ? "ស្គាល់សញ្ញា" : "Master Every"}
            </div>
            <div className="text-5xl md:text-7xl lg:text-8xl font-black leading-none mb-2">
              <span className="text-yellow-400 [-webkit-text-stroke:2px_black] [text-stroke:2px_black]">
                {kh ? "ចរាចរ" : "Road Sign"}
              </span>
            </div>
            <div
              className="text-3xl md:text-5xl lg:text-6xl font-black text-zinc-800 leading-tight"
              style={khFont}
            >
              {kh ? "សុវត្ថិភាពជាចម្បងជានិច្ច" : "Safety First, Always"}
            </div>
          </h1>

          <p
            className="text-base md:text-xl text-zinc-600 font-medium max-w-3xl mx-auto mb-8"
            style={khFont}
          >
            {kh
              ? "រៀនសញ្ញាចរាចរ ច្បាប់ផ្លូវ និងជំនាញបើកបរជាមួយប្រព័ន្ធអន្តរកម្ម"
              : "Learn traffic signs, road laws, and driving skills with interactive lessons"}
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link
              href="/learn"
              className="group px-8 py-4 bg-yellow-400 text-black font-black text-lg border-2 border-black shadow-[6px_6px_0_#000] hover:shadow-[8px_8px_0_#000] hover:-translate-x-1 hover:-translate-y-1 transition-all duration-150"
              style={khFont}
            >
              <span className="flex items-center justify-center gap-2">
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
        </div>

        {/* Street Cross Section Illustration */}
        <div className="relative w-full overflow-x-auto">
          <div className="min-w-[1200px] w-full mx-auto">
            {/* Streetlights */}
            <div className="relative h-32 mb-4">
              {/* Left Streetlight */}
              <div className="absolute left-0 top-0">
                <svg width="60" height="120" viewBox="0 0 60 120" className="drop-shadow-lg">
                  <path d="M30 10 Q20 40, 25 80 L25 120" stroke="#4a5568" strokeWidth="3" fill="none"/>
                  <circle cx="30" cy="8" r="8" fill="#fbbf24" stroke="#1f2937" strokeWidth="2"/>
                  <path d="M30 8 L35 15 L25 15 Z" fill="#fbbf24" opacity="0.3"/>
                </svg>
              </div>
              
              {/* Right Streetlight */}
              <div className="absolute right-0 top-0">
                <svg width="60" height="120" viewBox="0 0 60 120" className="drop-shadow-lg">
                  <path d="M30 10 Q40 40, 35 80 L35 120" stroke="#4a5568" strokeWidth="3" fill="none"/>
                  <circle cx="30" cy="8" r="8" fill="#fbbf24" stroke="#1f2937" strokeWidth="2"/>
                  <path d="M30 8 L35 15 L25 15 Z" fill="#fbbf24" opacity="0.3"/>
                </svg>
              </div>
            </div>

            {/* Main Street Section */}
            <div className="relative">
              {/* Vehicles and Elements Layer */}
              <div className="relative h-48 mb-2">
                <svg width="100%" height="192" viewBox="0 0 1200 192" preserveAspectRatio="xMidYMid meet" className="w-full">
                  {/* Left Pedestrian */}
                  <g transform="translate(40, 140)">
                    <ellipse cx="10" cy="35" rx="8" ry="3" fill="#00000020"/>
                    <circle cx="10" cy="10" r="8" fill="#e5e7eb" stroke="#1f2937" strokeWidth="1.5"/>
                    <rect x="6" y="18" width="8" height="12" rx="2" fill="#3b82f6" stroke="#1f2937" strokeWidth="1"/>
                    <rect x="6" y="30" width="3" height="8" fill="#1f2937"/>
                    <rect x="11" y="30" width="3" height="8" fill="#1f2937"/>
                  </g>

                  {/* Parked Car (Left) */}
                  <g transform="translate(140, 130)">
                    <ellipse cx="30" cy="45" rx="25" ry="4" fill="#00000030"/>
                    <rect x="5" y="25" width="50" height="18" rx="2" fill="#9ca3af" stroke="#1f2937" strokeWidth="2"/>
                    <rect x="15" y="20" width="30" height="8" rx="1" fill="#60a5fa" stroke="#1f2937" strokeWidth="1.5"/>
                    <circle cx="15" cy="43" r="5" fill="#1f2937" stroke="#4b5563" strokeWidth="2"/>
                    <circle cx="45" cy="43" r="5" fill="#1f2937" stroke="#4b5563" strokeWidth="2"/>
                  </g>

                  {/* Transit Bus */}
                  <g transform="translate(280, 115)">
                    <ellipse cx="50" cy="65" rx="45" ry="5" fill="#00000040"/>
                    <rect x="5" y="30" width="90" height="32" rx="3" fill="#ef4444" stroke="#1f2937" strokeWidth="2.5"/>
                    <rect x="10" y="35" width="75" height="15" rx="1" fill="#93c5fd" stroke="#1f2937" strokeWidth="1.5"/>
                    <rect x="88" y="40" width="8" height="8" fill="#fbbf24"/>
                    <circle cx="20" cy="62" r="6" fill="#1f2937" stroke="#4b5563" strokeWidth="2"/>
                    <circle cx="80" cy="62" r="6" fill="#1f2937" stroke="#4b5563" strokeWidth="2"/>
                    <text x="45" y="48" fontSize="10" fill="#1f2937" fontWeight="bold" textAnchor="middle">BUS</text>
                  </g>

                  {/* Cyclist (Left Transit Lane) */}
                  <g transform="translate(240, 135)">
                    <ellipse cx="12" cy="38" rx="10" ry="3" fill="#00000025"/>
                    <circle cx="12" cy="8" r="6" fill="#fbbf24" stroke="#1f2937" strokeWidth="1"/>
                    <path d="M12 14 L12 24" stroke="#3b82f6" strokeWidth="2"/>
                    <path d="M12 18 L8 28 M12 18 L16 28" stroke="#1f2937" strokeWidth="1.5"/>
                    <circle cx="8" cy="32" r="5" fill="none" stroke="#1f2937" strokeWidth="2"/>
                    <circle cx="16" cy="32" r="5" fill="none" stroke="#1f2937" strokeWidth="2"/>
                  </g>

                  {/* Southbound Cars */}
                  <g transform="translate(420, 130)">
                    <ellipse cx="25" cy="42" rx="22" ry="4" fill="#00000030"/>
                    <rect x="5" y="25" width="40" height="15" rx="2" fill="#6b7280" stroke="#1f2937" strokeWidth="2"/>
                    <rect x="12" y="20" width="26" height="7" rx="1" fill="#60a5fa" stroke="#1f2937" strokeWidth="1.5"/>
                    <circle cx="13" cy="40" r="4" fill="#1f2937" stroke="#4b5563" strokeWidth="1.5"/>
                    <circle cx="37" cy="40" r="4" fill="#1f2937" stroke="#4b5563" strokeWidth="1.5"/>
                  </g>

                  <g transform="translate(510, 130)">
                    <ellipse cx="25" cy="42" rx="22" ry="4" fill="#00000030"/>
                    <rect x="5" y="25" width="40" height="15" rx="2" fill="#9ca3af" stroke="#1f2937" strokeWidth="2"/>
                    <rect x="12" y="20" width="26" height="7" rx="1" fill="#60a5fa" stroke="#1f2937" strokeWidth="1.5"/>
                    <circle cx="13" cy="40" r="4" fill="#1f2937" stroke="#4b5563" strokeWidth="1.5"/>
                    <circle cx="37" cy="40" r="4" fill="#1f2937" stroke="#4b5563" strokeWidth="1.5"/>
                  </g>

                  {/* Northbound Turn Lane Car */}
                  <g transform="translate(650, 130)">
                    <ellipse cx="25" cy="42" rx="22" ry="4" fill="#00000030"/>
                    <rect x="5" y="25" width="40" height="15" rx="2" fill="#374151" stroke="#1f2937" strokeWidth="2"/>
                    <rect x="12" y="20" width="26" height="7" rx="1" fill="#60a5fa" stroke="#1f2937" strokeWidth="1.5"/>
                    <circle cx="13" cy="40" r="4" fill="#1f2937" stroke="#4b5563" strokeWidth="1.5"/>
                    <circle cx="37" cy="40" r="4" fill="#1f2937" stroke="#4b5563" strokeWidth="1.5"/>
                  </g>

                  {/* Northbound Traffic Cars */}
                  <g transform="translate(740, 130)">
                    <ellipse cx="25" cy="42" rx="22" ry="4" fill="#00000030"/>
                    <rect x="5" y="25" width="40" height="15" rx="2" fill="#6b7280" stroke="#1f2937" strokeWidth="2"/>
                    <rect x="12" y="20" width="26" height="7" rx="1" fill="#60a5fa" stroke="#1f2937" strokeWidth="1.5"/>
                    <circle cx="13" cy="40" r="4" fill="#1f2937" stroke="#4b5563" strokeWidth="1.5"/>
                    <circle cx="37" cy="40" r="4" fill="#1f2937" stroke="#4b5563" strokeWidth="1.5"/>
                  </g>

                  <g transform="translate(830, 130)">
                    <ellipse cx="25" cy="42" rx="22" ry="4" fill="#00000030"/>
                    <rect x="5" y="25" width="40" height="15" rx="2" fill="#9ca3af" stroke="#1f2937" strokeWidth="2"/>
                    <rect x="12" y="20" width="26" height="7" rx="1" fill="#60a5fa" stroke="#1f2937" strokeWidth="1.5"/>
                    <circle cx="13" cy="40" r="4" fill="#1f2937" stroke="#4b5563" strokeWidth="1.5"/>
                    <circle cx="37" cy="40" r="4" fill="#1f2937" stroke="#4b5563" strokeWidth="1.5"/>
                  </g>

                  {/* Cyclist (Right Bike Lane) */}
                  <g transform="translate(960, 135)">
                    <ellipse cx="12" cy="38" rx="10" ry="3" fill="#00000025"/>
                    <circle cx="12" cy="8" r="6" fill="#fbbf24" stroke="#1f2937" strokeWidth="1"/>
                    <path d="M12 14 L12 24" stroke="#22c55e" strokeWidth="2"/>
                    <path d="M12 18 L8 28 M12 18 L16 28" stroke="#1f2937" strokeWidth="1.5"/>
                    <circle cx="8" cy="32" r="5" fill="none" stroke="#1f2937" strokeWidth="2"/>
                    <circle cx="16" cy="32" r="5" fill="none" stroke="#1f2937" strokeWidth="2"/>
                  </g>

                  {/* Right Pedestrian */}
                  <g transform="translate(1080, 140)">
                    <ellipse cx="10" cy="35" rx="8" ry="3" fill="#00000020"/>
                    <circle cx="10" cy="10" r="8" fill="#e5e7eb" stroke="#1f2937" strokeWidth="1.5"/>
                    <rect x="6" y="18" width="8" height="12" rx="2" fill="#ef4444" stroke="#1f2937" strokeWidth="1"/>
                    <rect x="6" y="30" width="3" height="8" fill="#1f2937"/>
                    <rect x="11" y="30" width="3" height="8" fill="#1f2937"/>
                  </g>
                </svg>
              </div>

              {/* Street Lanes with Labels */}
              <div className="flex items-stretch border-t-2 border-b-2 border-zinc-800">
                {/* Left Sidewalk - 9ft */}
                <div className="flex-none w-[7.5%] bg-zinc-200 border-r-2 border-zinc-400 relative">
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-2">
                    <div className="text-[10px] font-bold text-zinc-700 mb-1">SIDEWALK</div>
                    <div className="text-xs font-black text-zinc-900">9 ft.</div>
                  </div>
                </div>

                {/* Left Parking - 8ft */}
                <div className="flex-none w-[6.7%] bg-zinc-300 border-r-2 border-zinc-400 relative">
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-2">
                    <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center mb-1 border-2 border-white">
                      <span className="text-white font-black text-lg">P</span>
                    </div>
                    <div className="text-[10px] font-bold text-zinc-700">PARKING</div>
                    <div className="text-xs font-black text-zinc-900">8 ft.</div>
                  </div>
                </div>

                {/* Southbound Transit/Bike Lane - 12ft */}
                <div className="flex-none w-[10%] bg-red-400/40 border-r-2 border-white relative">
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-2">
                    <svg width="24" height="24" viewBox="0 0 24 24" className="mb-1">
                      <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z" fill="white" stroke="#1f2937" strokeWidth="1.5"/>
                      <circle cx="12" cy="12" r="3" fill="#ef4444"/>
                    </svg>
                    <div className="text-[9px] font-bold text-zinc-800 text-center leading-tight mb-1">SOUTHBOUND<br/>TRANSIT/BIKE</div>
                    <div className="text-xs font-black text-zinc-900">12 ft.</div>
                  </div>
                  {/* Bus Icon Stencil */}
                  <div className="absolute top-2 left-1/2 -translate-x-1/2">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="white" opacity="0.8">
                      <rect x="4" y="6" width="16" height="12" rx="2" stroke="#1f2937" strokeWidth="1.5"/>
                      <rect x="6" y="8" width="12" height="6" fill="#60a5fa"/>
                      <circle cx="8" cy="16" r="1.5" fill="#1f2937"/>
                      <circle cx="16" cy="16" r="1.5" fill="#1f2937"/>
                    </svg>
                  </div>
                  {/* Bike Icon Stencil */}
                  <div className="absolute bottom-2 left-1/2 -translate-x-1/2">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" opacity="0.8">
                      <circle cx="7" cy="17" r="3"/>
                      <circle cx="17" cy="17" r="3"/>
                      <path d="M12 5l-2 8h4l-2-8z"/>
                    </svg>
                  </div>
                </div>

                {/* Southbound Traffic Lane 1 - 10ft */}
                <div className="flex-none w-[8.3%] bg-zinc-600 border-r border-dashed border-white relative">
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-2">
                    <svg width="20" height="32" viewBox="0 0 20 32" className="mb-1">
                      <path d="M10 2 L10 30 M6 22 L10 30 L14 22" fill="white" stroke="white" strokeWidth="2"/>
                    </svg>
                    <div className="text-[9px] font-bold text-white text-center leading-tight mb-1">SOUTHBOUND<br/>TRAFFIC</div>
                    <div className="text-xs font-black text-white">10 ft.</div>
                  </div>
                </div>

                {/* Southbound Traffic Lane 2 - 10ft */}
                <div className="flex-none w-[8.3%] bg-zinc-600 border-r-2 border-yellow-400 relative">
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-2">
                    <svg width="20" height="32" viewBox="0 0 20 32" className="mb-1">
                      <path d="M10 2 L10 30 M6 22 L10 30 L14 22" fill="white" stroke="white" strokeWidth="2"/>
                    </svg>
                    <div className="text-[9px] font-bold text-white text-center leading-tight mb-1">SOUTHBOUND<br/>TRAFFIC</div>
                    <div className="text-xs font-black text-white">10 ft.</div>
                  </div>
                </div>

                {/* Center Median - 4ft */}
                <div className="flex-none w-[3.3%] bg-zinc-700 border-r-2 border-yellow-400 relative overflow-hidden">
                  <div className="absolute inset-0" style={{
                    backgroundImage: 'repeating-linear-gradient(45deg, #fbbf24 0, #fbbf24 8px, #1f2937 8px, #1f2937 16px)'
                  }}/>
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-1 z-10">
                    <div className="text-[8px] font-bold text-white text-center leading-tight mb-1 bg-zinc-900/70 px-1 rounded">MEDIAN</div>
                    <div className="text-[10px] font-black text-white bg-zinc-900/70 px-1 rounded">4 ft.</div>
                  </div>
                </div>

                {/* Northbound Left Turn Lane - 10ft */}
                <div className="flex-none w-[8.3%] bg-zinc-600 border-r border-dashed border-white relative">
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-2">
                    <svg width="24" height="24" viewBox="0 0 24 24" className="mb-1">
                      <path d="M12 20 L12 8 M12 8 L6 14 M12 8 Q12 4, 8 4 L4 4" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
                      <path d="M6 4 L2 6 M6 4 L8 8" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                    <div className="text-[9px] font-bold text-white text-center leading-tight mb-1">NORTHBOUND<br/>LEFT TURN</div>
                    <div className="text-xs font-black text-white">10 ft.</div>
                  </div>
                </div>

                {/* Northbound Traffic Lane 1 - 10ft */}
                <div className="flex-none w-[8.3%] bg-zinc-600 border-r border-dashed border-white relative">
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-2">
                    <svg width="20" height="32" viewBox="0 0 20 32" className="mb-1">
                      <path d="M10 30 L10 2 M6 10 L10 2 L14 10" fill="white" stroke="white" strokeWidth="2"/>
                    </svg>
                    <div className="text-[9px] font-bold text-white text-center leading-tight mb-1">NORTHBOUND<br/>TRAFFIC</div>
                    <div className="text-xs font-black text-white">10 ft.</div>
                  </div>
                </div>

                {/* Northbound Traffic Lane 2 - 10ft */}
                <div className="flex-none w-[8.3%] bg-zinc-600 border-r-2 border-white relative">
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-2">
                    <svg width="20" height="32" viewBox="0 0 20 32" className="mb-1">
                      <path d="M10 30 L10 2 M6 10 L10 2 L14 10" fill="white" stroke="white" strokeWidth="2"/>
                    </svg>
                    <div className="text-[9px] font-bold text-white text-center leading-tight mb-1">NORTHBOUND<br/>TRAFFIC</div>
                    <div className="text-xs font-black text-white">10 ft.</div>
                  </div>
                </div>

                {/* Safety Buffer - 2ft */}
                <div className="flex-none w-[1.7%] bg-white border-r-2 border-zinc-400 relative overflow-hidden">
                  <div className="absolute inset-0" style={{
                    backgroundImage: 'repeating-linear-gradient(45deg, white 0, white 4px, #e5e7eb 4px, #e5e7eb 8px)'
                  }}/>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-[7px] font-bold text-zinc-700 [writing-mode:vertical-lr] rotate-180">BUFFER 2ft</div>
                  </div>
                </div>

                {/* Northbound Bike Lane - 6ft */}
                <div className="flex-none w-[5%] bg-green-500/50 border-r-2 border-white relative">
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-2">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" className="mb-1">
                      <circle cx="7" cy="17" r="3"/>
                      <circle cx="17" cy="17" r="3"/>
                      <path d="M12 5l-2 8h4l-2-8z" fill="white"/>
                    </svg>
                    <div className="text-[9px] font-bold text-zinc-800 text-center leading-tight mb-1">N-BOUND<br/>BIKE</div>
                    <div className="text-xs font-black text-zinc-900">6 ft.</div>
                  </div>
                </div>

                {/* Right Parking - 8ft */}
                <div className="flex-none w-[6.7%] bg-zinc-300 border-r-2 border-zinc-400 relative">
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-2">
                    <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center mb-1 border-2 border-white">
                      <span className="text-white font-black text-lg">P</span>
                    </div>
                    <div className="text-[10px] font-bold text-zinc-700">PARKING</div>
                    <div className="text-xs font-black text-zinc-900">8 ft.</div>
                  </div>
                </div>

                {/* Right Sidewalk - 9ft */}
                <div className="flex-none w-[7.5%] bg-zinc-200 relative">
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-2">
                    <div className="text-[10px] font-bold text-zinc-700 mb-1">SIDEWALK</div>
                    <div className="text-xs font-black text-zinc-900">9 ft.</div>
                  </div>
                </div>
              </div>

              {/* Underground Layer */}
              <div className="h-16 bg-gradient-to-b from-amber-900 via-amber-800 to-amber-950 border-b-2 border-zinc-900 relative">
                <div className="absolute inset-0 opacity-30" style={{
                  backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.3) 2px, rgba(0,0,0,0.3) 4px)'
                }}/>
              </div>

              {/* Labels Below */}
              <div className="mt-6 text-center space-y-2">
                <div className="text-sm font-bold text-zinc-600 tracking-wider">INTERSECTION</div>
                <div className="text-lg font-black text-zinc-800">POTRERO AVENUE FACING NORTH</div>
                <div className="text-base font-bold text-zinc-600">17TH TO 21ST, TYPICAL BLOCK</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
