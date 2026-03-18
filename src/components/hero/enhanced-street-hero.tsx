"use client";

import Link from "next/link";
import { useLang } from "@/context/lang-context";
import {
  RealisticCar,
  RealisticBus,
  RealisticCyclist,
  RealisticPedestrian,
  StreetLight,
  BikeStencil,
  BusStencil,
  ArrowDown,
  ArrowUp,
  LeftTurnArrow,
} from "./street-elements";

export function EnhancedStreetHero() {
  const { lang } = useLang();
  const kh = lang === "kh";
  const khFont = kh ? { fontFamily: "Siemreap, sans-serif" } : {};

  return (
    <section className="relative min-h-screen bg-gradient-to-b from-zinc-50 to-white overflow-hidden flex items-center justify-center py-8 md:py-16">
      {/* Main Content Container */}
      <div className="relative z-10 w-full max-w-[1600px] mx-auto px-4 md:px-6 lg:px-8">
        {/* Text Content Above Street */}
        <div className="text-center mb-8 md:mb-12">
          <div
            className="inline-block bg-yellow-400 text-black text-xs md:text-sm font-black tracking-widest uppercase px-4 py-2 border-2 border-black shadow-[4px_4px_0_#000] mb-6"
            style={khFont}
          >
            {kh ? "ប្រព័ន្ធសិក្សាថ្មី" : "NEW LEARNING SYSTEM"}
          </div>

          <h1 className="mb-6">
            <div
              className="text-3xl md:text-5xl lg:text-6xl font-black text-zinc-800 leading-tight mb-2"
              style={khFont}
            >
              {kh ? "ស្គាល់សញ្ញា" : "Master Every"}
            </div>
            <div className="text-4xl md:text-6xl lg:text-7xl font-black leading-none mb-2">
              <span className="text-yellow-400 [-webkit-text-stroke:2px_black] [text-stroke:2px_black]">
                {kh ? "ចរាចរ" : "Road Sign"}
              </span>
            </div>
            <div
              className="text-2xl md:text-4xl lg:text-5xl font-black text-zinc-800 leading-tight"
              style={khFont}
            >
              {kh ? "សុវត្ថិភាពជាចម្បងជានិច្ច" : "Safety First, Always"}
            </div>
          </h1>

          <p
            className="text-sm md:text-lg text-zinc-600 font-medium max-w-3xl mx-auto mb-8"
            style={khFont}
          >
            {kh
              ? "រៀនសញ្ញាចរាចរ ច្បាប់ផ្លូវ និងជំនាញបើកបរជាមួយប្រព័ន្ធអន្តរកម្ម"
              : "Learn traffic signs, road laws, and driving skills with interactive lessons"}
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8 md:mb-12">
            <Link
              href="/learn"
              className="group px-6 md:px-8 py-3 md:py-4 bg-yellow-400 text-black font-black text-base md:text-lg border-2 border-black shadow-[6px_6px_0_#000] hover:shadow-[8px_8px_0_#000] hover:-translate-x-1 hover:-translate-y-1 transition-all duration-150"
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
              className="px-6 md:px-8 py-3 md:py-4 bg-white text-black font-black text-base md:text-lg border-2 border-black shadow-[6px_6px_0_#000] hover:shadow-[8px_8px_0_#000] hover:-translate-x-1 hover:-translate-y-1 transition-all duration-150"
              style={khFont}
            >
              {kh ? "ចូលប្រកួត" : "Take Challenge"}
            </Link>
          </div>
        </div>

        {/* Street Cross Section Illustration */}
        <div className="relative w-full overflow-x-auto pb-4">
          <div className="min-w-[1000px] lg:min-w-full w-full mx-auto">
            {/* Streetlights */}
            <div className="relative h-24 md:h-32 mb-2 md:mb-4">
              <div className="absolute left-0 top-0 scale-75 md:scale-100">
                <StreetLight x={0} y={0} side="left" />
              </div>
              <div className="absolute right-0 top-0 scale-75 md:scale-100">
                <StreetLight x={0} y={0} side="right" />
              </div>
            </div>

            {/* Vehicles and Elements Layer */}
            <div className="relative h-32 md:h-40 mb-2">
              <svg width="100%" height="160" viewBox="0 0 1200 160" preserveAspectRatio="xMidYMid meet" className="w-full">
                {/* Left Pedestrian */}
                <RealisticPedestrian x={35} y={90} shirtColor="#3b82f6" />
                
                {/* Parked Car (Left) */}
                <RealisticCar x={100} y={80} color="#9ca3af" />
                
                {/* Transit Bus */}
                <RealisticBus x={200} y={65} />
                
                {/* Cyclist (Transit Lane) */}
                <RealisticCyclist x={180} y={85} color="#ef4444" />
                
                {/* Southbound Cars */}
                <RealisticCar x={380} y={80} color="#6b7280" />
                <RealisticCar x={470} y={80} color="#9ca3af" />
                
                {/* Northbound Turn Lane Car */}
                <RealisticCar x={610} y={80} color="#374151" />
                
                {/* Northbound Traffic Cars */}
                <RealisticCar x={700} y={80} color="#6b7280" />
                <RealisticCar x={790} y={80} color="#9ca3af" />
                
                {/* Cyclist (Right Bike Lane) */}
                <RealisticCyclist x={920} y={85} color="#22c55e" />
                
                {/* Parked Car (Right) */}
                <RealisticCar x={980} y={80} color="#9ca3af" />
                
                {/* Right Pedestrian */}
                <RealisticPedestrian x={1100} y={90} shirtColor="#ef4444" />
              </svg>
            </div>

            {/* Street Lanes with Labels */}
            <div className="flex items-stretch border-t-2 border-b-2 border-zinc-900 shadow-lg">
              {/* Left Sidewalk - 9ft */}
              <div className="flex-none w-[7.5%] bg-zinc-200 border-r-2 border-zinc-400 relative min-h-[100px] md:min-h-[120px]">
                <div className="absolute inset-0 opacity-10" style={{
                  backgroundImage: 'repeating-linear-gradient(45deg, #000 0, #000 1px, transparent 1px, transparent 6px)'
                }}/>
                <div className="absolute inset-0 flex flex-col items-center justify-center p-1 md:p-2">
                  <div className="text-[8px] md:text-[10px] font-bold text-zinc-700 mb-1">SIDEWALK</div>
                  <div className="text-xs md:text-sm font-black text-zinc-900">9 ft.</div>
                </div>
              </div>

              {/* Left Parking - 8ft */}
              <div className="flex-none w-[6.7%] bg-zinc-300 border-r-2 border-zinc-400 relative min-h-[100px] md:min-h-[120px]">
                <div className="absolute inset-0 flex flex-col items-center justify-center p-1 md:p-2">
                  <div className="w-6 h-6 md:w-8 md:h-8 bg-blue-600 rounded flex items-center justify-center mb-1 border-2 border-white shadow-md">
                    <span className="text-white font-black text-sm md:text-lg">P</span>
                  </div>
                  <div className="text-[8px] md:text-[10px] font-bold text-zinc-700">PARKING</div>
                  <div className="text-xs md:text-sm font-black text-zinc-900">8 ft.</div>
                </div>
              </div>

              {/* Southbound Transit/Bike Lane - 12ft */}
              <div className="flex-none w-[10%] bg-red-400/40 border-r-2 border-white relative min-h-[100px] md:min-h-[120px]">
                <div className="absolute inset-0 flex flex-col items-center justify-center p-1 md:p-2">
                  <div className="mb-1">
                    <svg width="20" height="20" viewBox="0 0 32 32" className="w-5 h-5 md:w-6 md:h-6">
                      <BusStencil x={0} y={0} color="white" />
                    </svg>
                  </div>
                  <div className="text-[7px] md:text-[9px] font-bold text-zinc-800 text-center leading-tight mb-1">
                    SOUTHBOUND<br/>TRANSIT/BIKE
                  </div>
                  <div className="text-xs md:text-sm font-black text-zinc-900">12 ft.</div>
                </div>
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2">
                  <svg width="20" height="20" viewBox="0 0 32 32" className="w-5 h-5">
                    <BikeStencil x={0} y={0} color="white" />
                  </svg>
                </div>
              </div>

              {/* Southbound Traffic Lane 1 - 10ft */}
              <div className="flex-none w-[8.3%] bg-zinc-600 border-r border-dashed border-white relative min-h-[100px] md:min-h-[120px]">
                <div className="absolute inset-0 flex flex-col items-center justify-center p-1 md:p-2">
                  <div className="mb-1">
                    <svg width="16" height="24" viewBox="0 0 32 32" className="w-4 h-6 md:w-5 md:h-8">
                      <ArrowDown x={0} y={0} color="white" />
                    </svg>
                  </div>
                  <div className="text-[7px] md:text-[9px] font-bold text-white text-center leading-tight mb-1">
                    SOUTHBOUND<br/>TRAFFIC
                  </div>
                  <div className="text-xs md:text-sm font-black text-white">10 ft.</div>
                </div>
              </div>

              {/* Southbound Traffic Lane 2 - 10ft */}
              <div className="flex-none w-[8.3%] bg-zinc-600 border-r-2 border-yellow-400 relative min-h-[100px] md:min-h-[120px]">
                <div className="absolute inset-0 flex flex-col items-center justify-center p-1 md:p-2">
                  <div className="mb-1">
                    <svg width="16" height="24" viewBox="0 0 32 32" className="w-4 h-6 md:w-5 md:h-8">
                      <ArrowDown x={0} y={0} color="white" />
                    </svg>
                  </div>
                  <div className="text-[7px] md:text-[9px] font-bold text-white text-center leading-tight mb-1">
                    SOUTHBOUND<br/>TRAFFIC
                  </div>
                  <div className="text-xs md:text-sm font-black text-white">10 ft.</div>
                </div>
              </div>

              {/* Center Median - 4ft */}
              <div className="flex-none w-[3.3%] bg-zinc-700 border-r-2 border-yellow-400 relative min-h-[100px] md:min-h-[120px] overflow-hidden">
                <div className="absolute inset-0" style={{
                  backgroundImage: 'repeating-linear-gradient(45deg, #fbbf24 0, #fbbf24 6px, #1f2937 6px, #1f2937 12px)'
                }}/>
                <div className="absolute inset-0 flex flex-col items-center justify-center p-1 z-10">
                  <div className="text-[7px] md:text-[8px] font-bold text-white text-center leading-tight mb-1 bg-zinc-900/80 px-1 rounded">
                    MEDIAN
                  </div>
                  <div className="text-[9px] md:text-[10px] font-black text-white bg-zinc-900/80 px-1 rounded">4 ft.</div>
                </div>
              </div>

              {/* Northbound Left Turn Lane - 10ft */}
              <div className="flex-none w-[8.3%] bg-zinc-600 border-r border-dashed border-white relative min-h-[100px] md:min-h-[120px]">
                <div className="absolute inset-0 flex flex-col items-center justify-center p-1 md:p-2">
                  <div className="mb-1">
                    <svg width="20" height="20" viewBox="0 0 32 32" className="w-5 h-5 md:w-6 md:h-6">
                      <LeftTurnArrow x={0} y={0} color="white" />
                    </svg>
                  </div>
                  <div className="text-[7px] md:text-[9px] font-bold text-white text-center leading-tight mb-1">
                    NORTHBOUND<br/>LEFT TURN
                  </div>
                  <div className="text-xs md:text-sm font-black text-white">10 ft.</div>
                </div>
              </div>

              {/* Northbound Traffic Lane 1 - 10ft */}
              <div className="flex-none w-[8.3%] bg-zinc-600 border-r border-dashed border-white relative min-h-[100px] md:min-h-[120px]">
                <div className="absolute inset-0 flex flex-col items-center justify-center p-1 md:p-2">
                  <div className="mb-1">
                    <svg width="16" height="24" viewBox="0 0 32 32" className="w-4 h-6 md:w-5 md:h-8">
                      <ArrowUp x={0} y={0} color="white" />
                    </svg>
                  </div>
                  <div className="text-[7px] md:text-[9px] font-bold text-white text-center leading-tight mb-1">
                    NORTHBOUND<br/>TRAFFIC
                  </div>
                  <div className="text-xs md:text-sm font-black text-white">10 ft.</div>
                </div>
              </div>

              {/* Northbound Traffic Lane 2 - 10ft */}
              <div className="flex-none w-[8.3%] bg-zinc-600 border-r-2 border-white relative min-h-[100px] md:min-h-[120px]">
                <div className="absolute inset-0 flex flex-col items-center justify-center p-1 md:p-2">
                  <div className="mb-1">
                    <svg width="16" height="24" viewBox="0 0 32 32" className="w-4 h-6 md:w-5 md:h-8">
                      <ArrowUp x={0} y={0} color="white" />
                    </svg>
                  </div>
                  <div className="text-[7px] md:text-[9px] font-bold text-white text-center leading-tight mb-1">
                    NORTHBOUND<br/>TRAFFIC
                  </div>
                  <div className="text-xs md:text-sm font-black text-white">10 ft.</div>
                </div>
              </div>

              {/* Safety Buffer - 2ft */}
              <div className="flex-none w-[1.7%] bg-white border-r-2 border-zinc-400 relative min-h-[100px] md:min-h-[120px] overflow-hidden">
                <div className="absolute inset-0" style={{
                  backgroundImage: 'repeating-linear-gradient(45deg, white 0, white 3px, #e5e7eb 3px, #e5e7eb 6px)'
                }}/>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-[6px] md:text-[7px] font-bold text-zinc-700 [writing-mode:vertical-lr] rotate-180">
                    BUFFER 2ft
                  </div>
                </div>
              </div>

              {/* Northbound Bike Lane - 6ft */}
              <div className="flex-none w-[5%] bg-green-500/50 border-r-2 border-white relative min-h-[100px] md:min-h-[120px]">
                <div className="absolute inset-0 flex flex-col items-center justify-center p-1 md:p-2">
                  <div className="mb-1">
                    <svg width="20" height="20" viewBox="0 0 32 32" className="w-5 h-5 md:w-6 md:h-6">
                      <BikeStencil x={0} y={0} color="white" />
                    </svg>
                  </div>
                  <div className="text-[7px] md:text-[9px] font-bold text-zinc-800 text-center leading-tight mb-1">
                    N-BOUND<br/>BIKE
                  </div>
                  <div className="text-xs md:text-sm font-black text-zinc-900">6 ft.</div>
                </div>
              </div>

              {/* Right Parking - 8ft */}
              <div className="flex-none w-[6.7%] bg-zinc-300 border-r-2 border-zinc-400 relative min-h-[100px] md:min-h-[120px]">
                <div className="absolute inset-0 flex flex-col items-center justify-center p-1 md:p-2">
                  <div className="w-6 h-6 md:w-8 md:h-8 bg-blue-600 rounded flex items-center justify-center mb-1 border-2 border-white shadow-md">
                    <span className="text-white font-black text-sm md:text-lg">P</span>
                  </div>
                  <div className="text-[8px] md:text-[10px] font-bold text-zinc-700">PARKING</div>
                  <div className="text-xs md:text-sm font-black text-zinc-900">8 ft.</div>
                </div>
              </div>

              {/* Right Sidewalk - 9ft */}
              <div className="flex-none w-[7.5%] bg-zinc-200 relative min-h-[100px] md:min-h-[120px]">
                <div className="absolute inset-0 opacity-10" style={{
                  backgroundImage: 'repeating-linear-gradient(45deg, #000 0, #000 1px, transparent 1px, transparent 6px)'
                }}/>
                <div className="absolute inset-0 flex flex-col items-center justify-center p-1 md:p-2">
                  <div className="text-[8px] md:text-[10px] font-bold text-zinc-700 mb-1">SIDEWALK</div>
                  <div className="text-xs md:text-sm font-black text-zinc-900">9 ft.</div>
                </div>
              </div>
            </div>

            {/* Underground Layer */}
            <div className="h-12 md:h-16 bg-gradient-to-b from-amber-900 via-amber-800 to-amber-950 border-b-2 border-zinc-900 relative shadow-inner">
              <div className="absolute inset-0 opacity-30" style={{
                backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.3) 2px, rgba(0,0,0,0.3) 4px)'
              }}/>
              <div className="absolute inset-0 opacity-20" style={{
                backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(139,69,19,0.5) 1px, transparent 1px)',
                backgroundSize: '8px 8px'
              }}/>
            </div>

            {/* Labels Below */}
            <div className="mt-4 md:mt-6 text-center space-y-1 md:space-y-2">
              <div className="text-xs md:text-sm font-bold text-zinc-600 tracking-wider">INTERSECTION</div>
              <div className="text-base md:text-lg font-black text-zinc-800">POTRERO AVENUE FACING NORTH</div>
              <div className="text-sm md:text-base font-bold text-zinc-600">17TH TO 21ST, TYPICAL BLOCK</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
