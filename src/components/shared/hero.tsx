"use client";

import Link from "next/link";
import Image from "next/image";
import {
  FaHandPaper,
  FaExclamationTriangle,
  FaArrowUp,
  FaInfoCircle,
  FaTachometerAlt,
  FaBan,
} from "react-icons/fa";
import { useLang } from "@/context/lang-context";
import { t } from "@/lib/translations";

export function Hero() {
  const { lang } = useLang();
  const tr = t[lang].hero;

  const SIGNS = [
    { color: "#ef4444", label: tr.signs.stop, Icon: FaHandPaper },
    { color: "#eab308", label: tr.signs.caution, Icon: FaExclamationTriangle },
    { color: "#22c55e", label: tr.signs.go, Icon: FaArrowUp },
    { color: "#3b82f6", label: tr.signs.info, Icon: FaInfoCircle },
    { color: "#f97316", label: tr.signs.speed, Icon: FaTachometerAlt },
    { color: "#a855f7", label: tr.signs.noEntry, Icon: FaBan },
  ];

  return (
    <section className="relative dot-bg min-h-[92vh] flex items-center overflow-hidden border-b-4 border-black">
      {/* Caution tape strip at the very top */}
      <div className="absolute top-0 left-0 right-0 h-2 caution-tape" />

      {/* Grid overlay lines */}
      <div
        className="absolute inset-0 pointer-events-none opacity-10"
        style={{
          backgroundImage:
            "linear-gradient(rgba(6,182,212,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(6,182,212,0.4) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 py-24 md:py-32">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* -- Left Content -- */}
          <div className="flex flex-col gap-6">
            {/* Badge */}
            <div className="inline-flex w-fit items-center gap-2 px-4 py-2 bg-yellow-400 border-2 border-black shadow-[3px_3px_0_#000]">
              <span className="w-2 h-2 bg-black animate-pulse" />
              <span className="text-xs font-black tracking-wider text-black uppercase">
                {tr.badge}
              </span>
            </div>

            {/* Headline */}
            <div>
              <h1
                className={`font-black text-black leading-[1.05] tracking-tight ${lang === "kh" ? "text-3xl md:text-4xl lg:text-5xl" : "text-5xl md:text-6xl lg:text-7xl"}`}
              >
                {tr.headline1}
                <br />
                <span
                  className="inline-block bg-yellow-400 text-black px-3 py-1 border-2 border-black shadow-[4px_4px_0_#ca8a04] mt-1"
                  style={{ borderRadius: "0px" }}
                >
                  {tr.headline2}
                </span>
                <br />
                {tr.headline3}
              </h1>
              {/* Khmer subtitle */}
              <p
                className="mt-3 text-lg text-cyan-600"
                style={{ fontFamily: "Siemreap, sans-serif" }}
              >
                {tr.subtitle}
              </p>
            </div>

            {/* Description */}
            <p
              className="text-zinc-700 text-lg leading-relaxed max-w-md"
              style={
                lang === "kh" ? { fontFamily: "Siemreap, sans-serif" } : {}
              }
            >
              {tr.desc}
            </p>

            {/* Stats row */}
            <div className="flex flex-wrap gap-4 mt-4 pt-4 border-t-2 border-black/20">
              {[
                { value: "8", label: tr.stats.categories },
                { value: "500+", label: tr.stats.questions },
                { value: "3", label: tr.stats.roles },
              ].map(({ value, label }) => (
                <div key={label} className="flex flex-col">
                  <span className="text-2xl font-black text-yellow-600">
                    {value}
                  </span>
                  <span
                    className="text-xs text-zinc-600 font-medium"
                    style={
                      lang === "kh"
                        ? { fontFamily: "Siemreap, sans-serif" }
                        : {}
                    }
                  >
                    {label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* -- Right Illustration -- */}
          <div className="relative flex justify-center md:justify-end">
            <div className="relative w-full max-w-sm md:max-w-md">
              {/* Card frame */}
              <div className="relative bg-white border-4 border-black shadow-[8px_8px_0_#eab308] p-6 overflow-hidden">
                {/* Top accent bar */}
                <div className="absolute top-0 left-0 right-0 h-3 bg-yellow-400 border-b-2 border-black" />

                {/* Logo */}
                <div className="flex items-center gap-3 mt-3 mb-6">
                  <div className="w-12 h-12 flex items-center justify-center overflow-hidden flex-shrink-0">
                    <Image
                      src="https://raw.githubusercontent.com/kesararam/kesararam/refs/heads/main/brand/lgo.png"
                      alt="KWD"
                      width={48}
                      height={48}
                      className="object-contain"
                      unoptimized
                    />
                  </div>
                  <div>
                    <p className="font-black text-lg leading-none">
                      KWD Platform
                    </p>
                    <p className="text-xs text-zinc-500">
                      Kesararam. with. digital.
                    </p>
                  </div>
                </div>

                {/* Sign preview cards */}
                <div className="grid grid-cols-3 gap-3">
                  {SIGNS.map(({ color, label, Icon }) => (
                    <div
                      key={label}
                      className="flex flex-col items-center gap-1 p-3 border-2 border-black shadow-[2px_2px_0_#000] hover:-translate-y-0.5 hover:shadow-[3px_3px_0_#000] transition-all duration-100"
                      style={{ backgroundColor: color + "22" }}
                    >
                      <span
                        className="w-10 h-10 border-2 border-black flex items-center justify-center"
                        style={{ backgroundColor: color }}
                      >
                        <Icon size={18} color="#fff" />
                      </span>
                      <span
                        className="text-[10px] font-bold text-center"
                        style={
                          lang === "kh"
                            ? { fontFamily: "Siemreap, sans-serif" }
                            : {}
                        }
                      >
                        {label}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Progress bar */}
                <div className="mt-5">
                  <div className="flex justify-between text-xs font-bold mb-1.5">
                    <span
                      style={
                        lang === "kh"
                          ? { fontFamily: "Siemreap, sans-serif" }
                          : {}
                      }
                    >
                      {tr.cardProgress}
                    </span>
                    <span className="text-green-600">68%</span>
                  </div>
                  <div className="h-3 bg-zinc-100 border-2 border-black overflow-hidden">
                    <div
                      className="h-full bg-green-400 border-r-2 border-black transition-all duration-700"
                      style={{ width: "68%" }}
                    />
                  </div>
                </div>
              </div>

              {/* Floating badges */}
              <div className="absolute -top-4 -right-4 bg-cyan-400 border-2 border-black px-3 py-1.5 shadow-[3px_3px_0_#000] rotate-3">
                <span className="text-xs font-black">EN / KH</span>
              </div>
              <div className="absolute -bottom-4 -left-4 bg-green-400 border-2 border-black px-3 py-1.5 shadow-[3px_3px_0_#000] -rotate-2">
                <span className="text-xs font-black">Live Challenges</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom caution tape */}
      <div className="absolute bottom-0 left-0 right-0 h-2 caution-tape" />
    </section>
  );
}
