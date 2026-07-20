"use client";

import { useRef, useEffect, useState } from "react";
import Link from "next/link";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { CATEGORY_COLORS, CATEGORY_SHADOW } from "@/lib/utils";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

// ─── Per-category SVG icon scenes ───────────────────────────────────────────

function TrafficSignsIcon({ hovered }: { hovered: boolean }) {
  return (
    <svg viewBox="0 0 120 120" className="w-full h-full" fill="none">
      {/* Post */}
      <rect x="57" y="70" width="6" height="40" fill="#1a1a1a" rx="2" />
      {/* Diamond sign */}
      <g
        style={{
          transform: hovered ? "rotate(45deg) scale(1.1)" : "rotate(45deg)",
          transformOrigin: "60px 45px",
          transition: "transform 0.5s cubic-bezier(0.34,1.56,0.64,1)",
        }}
      >
        <rect x="30" y="15" width="60" height="60" rx="4" fill="#eab308" stroke="#1a1a1a" strokeWidth="4" />
      </g>
      {/* Warning icon inside */}
      <g
        style={{
          opacity: hovered ? 1 : 0.85,
          transition: "opacity 0.3s",
        }}
      >
        <text x="60" y="55" textAnchor="middle" fontSize="28" fill="#1a1a1a" fontWeight="900">!</text>
      </g>
      {/* Glow ring on hover */}
      <circle
        cx="60" cy="45" r="38"
        stroke="#eab308"
        strokeWidth="3"
        fill="none"
        strokeDasharray="8 6"
        style={{
          opacity: hovered ? 0.6 : 0,
          transform: hovered ? "scale(1)" : "scale(0.7)",
          transformOrigin: "60px 45px",
          transition: "all 0.4s ease",
        }}
      />
    </svg>
  );
}

function RoadTrafficLawIcon({ hovered }: { hovered: boolean }) {
  return (
    <svg viewBox="0 0 120 120" className="w-full h-full" fill="none">
      {/* Book base */}
      <rect x="20" y="30" width="80" height="65" rx="4" fill="#fff" stroke="#1a1a1a" strokeWidth="3" />
      <rect x="20" y="30" width="8" height="65" rx="2" fill="#1d4ed8" />
      {/* Lines of text */}
      {[0, 1, 2, 3].map((i) => (
        <rect
          key={i}
          x="36" y={46 + i * 12} width={hovered ? 60 : 40 + i * 5} height="5" rx="2"
          fill="#1d4ed8"
          style={{ transition: `width 0.3s ease ${i * 0.07}s` }}
        />
      ))}
      {/* Gavel */}
      <g
        style={{
          transform: hovered ? "rotate(-30deg) translate(10px,-10px)" : "rotate(0deg) translate(0,0)",
          transformOrigin: "85px 25px",
          transition: "transform 0.4s cubic-bezier(0.34,1.56,0.64,1)",
        }}
      >
        <rect x="72" y="10" width="28" height="12" rx="3" fill="#1a1a1a" />
        <rect x="83" y="20" width="5" height="20" rx="2" fill="#1a1a1a" />
      </g>
      {/* Stamp effect on hover */}
      {hovered && (
        <text x="60" y="85" textAnchor="middle" fontSize="11" fill="#ef4444" fontWeight="900"
          style={{ opacity: 0.8, letterSpacing: 1 }}>OFFICIAL</text>
      )}
    </svg>
  );
}

function RightOfWayIcon({ hovered }: { hovered: boolean }) {
  return (
    <svg viewBox="0 0 120 120" className="w-full h-full" fill="none">
      {/* Roundabout circle */}
      <circle cx="60" cy="60" r="38" stroke="#1a1a1a" strokeWidth="4" fill="#ef4444" />
      <circle cx="60" cy="60" r="22" stroke="#1a1a1a" strokeWidth="3" fill="#fff" />
      {/* Rotating arrows */}
      {[0, 90, 180, 270].map((deg, i) => (
        <g
          key={i}
          style={{
            transform: `rotate(${deg + (hovered ? 90 : 0)}deg)`,
            transformOrigin: "60px 60px",
            transition: `transform 0.6s cubic-bezier(0.4,0,0.2,1) ${i * 0.05}s`,
          }}
        >
          <path
            d="M60 24 L66 34 L54 34 Z"
            fill="#1a1a1a"
          />
        </g>
      ))}
      {/* Center dot */}
      <circle cx="60" cy="60" r="6" fill={hovered ? "#ef4444" : "#1a1a1a"}
        style={{ transition: "fill 0.3s" }} />
    </svg>
  );
}

function DrivingSkillsIcon({ hovered }: { hovered: boolean }) {
  return (
    <svg viewBox="0 0 120 120" className="w-full h-full" fill="none">
      {/* Road */}
      <rect x="0" y="80" width="120" height="40" fill="#374151" />
      <rect x="50" y="88" width="20" height="6" rx="2" fill="#fbbf24" />
      {/* Car body */}
      <g
        style={{
          transform: hovered ? "translateX(8px)" : "translateX(0)",
          transition: "transform 0.5s cubic-bezier(0.34,1.56,0.64,1)",
        }}
      >
        <rect x="18" y="55" width="84" height="30" rx="6" fill="#22c55e" stroke="#1a1a1a" strokeWidth="3" />
        <rect x="30" y="38" width="55" height="22" rx="5" fill="#22c55e" stroke="#1a1a1a" strokeWidth="3" />
        {/* Windows */}
        <rect x="34" y="42" width="20" height="14" rx="3" fill="#bfdbfe" />
        <rect x="60" y="42" width="20" height="14" rx="3" fill="#bfdbfe" />
        {/* Wheels */}
        <circle cx="35" cy="85" r="10" fill="#1a1a1a" />
        <circle cx="35" cy="85" r="5" fill="#9ca3af"
          style={{
            transform: hovered ? "rotate(180deg)" : "rotate(0)",
            transformOrigin: "35px 85px",
            transition: "transform 0.5s linear",
          }}
        />
        <circle cx="85" cy="85" r="10" fill="#1a1a1a" />
        <circle cx="85" cy="85" r="5" fill="#9ca3af"
          style={{
            transform: hovered ? "rotate(180deg)" : "rotate(0)",
            transformOrigin: "85px 85px",
            transition: "transform 0.5s linear",
          }}
        />
      </g>
      {/* Speed lines */}
      {hovered && [0, 1, 2].map((i) => (
        <line key={i} x1={5 + i * 6} y1={62 + i * 5} x2={18 + i * 6} y2={62 + i * 5}
          stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round"
          style={{ opacity: 0.7 }}
        />
      ))}
    </svg>
  );
}

function VehicleTechIcon({ hovered }: { hovered: boolean }) {
  return (
    <svg viewBox="0 0 120 120" className="w-full h-full" fill="none">
      {/* Engine block */}
      <rect x="25" y="35" width="70" height="55" rx="5" fill="#f97316" stroke="#1a1a1a" strokeWidth="3" />
      {/* Pistons */}
      {[0, 1, 2].map((i) => (
        <g key={i}>
          <rect
            x={32 + i * 22} y={hovered ? 20 : 28} width="14" height="20" rx="3"
            fill="#1a1a1a"
            style={{ transition: `y 0.2s ease ${i * 0.1}s` }}
          />
          <rect x={35 + i * 22} y="38" width="8" height="30" rx="2" fill="#fff" opacity="0.3" />
        </g>
      ))}
      {/* Gear */}
      <g
        style={{
          transform: hovered ? "rotate(60deg)" : "rotate(0deg)",
          transformOrigin: "60px 75px",
          transition: "transform 0.6s ease",
        }}
      >
        <circle cx="60" cy="75" r="14" fill="#1a1a1a" />
        <circle cx="60" cy="75" r="7" fill="#f97316" />
        {[0, 45, 90, 135].map((deg, i) => (
          <rect
            key={i}
            x="57" y="58" width="6" height="8" rx="2" fill="#1a1a1a"
            style={{
              transform: `rotate(${deg}deg)`,
              transformOrigin: "60px 75px",
            }}
          />
        ))}
      </g>
    </svg>
  );
}

function LoadingGoodsIcon({ hovered }: { hovered: boolean }) {
  return (
    <svg viewBox="0 0 120 120" className="w-full h-full" fill="none">
      {/* Truck body */}
      <rect x="10" y="55" width="65" height="35" rx="4" fill="#06b6d4" stroke="#1a1a1a" strokeWidth="3" />
      {/* Cab */}
      <rect x="75" y="65" width="35" height="25" rx="4" fill="#06b6d4" stroke="#1a1a1a" strokeWidth="3" />
      <rect x="78" y="68" width="18" height="14" rx="3" fill="#bfdbfe" />
      {/* Wheels */}
      <circle cx="30" cy="92" r="10" fill="#1a1a1a" />
      <circle cx="30" cy="92" r="5" fill="#9ca3af" />
      <circle cx="85" cy="92" r="10" fill="#1a1a1a" />
      <circle cx="85" cy="92" r="5" fill="#9ca3af" />
      {/* Cargo boxes */}
      {[0, 1, 2].map((i) => (
        <g
          key={i}
          style={{
            transform: hovered ? `translateY(${-i * 4}px)` : "translateY(0)",
            transition: `transform 0.3s ease ${i * 0.08}s`,
          }}
        >
          <rect x={15 + i * 20} y={35 - i * 2} width="18" height="18" rx="2"
            fill="#fff" stroke="#1a1a1a" strokeWidth="2" />
          <line x1={15 + i * 20} y1={44 - i * 2} x2={33 + i * 20} y2={44 - i * 2}
            stroke="#1a1a1a" strokeWidth="1.5" />
          <line x1={24 + i * 20} y1={35 - i * 2} x2={24 + i * 20} y2={53 - i * 2}
            stroke="#1a1a1a" strokeWidth="1.5" />
        </g>
      ))}
      {/* Arrow on hover */}
      {hovered && (
        <path d="M55 20 L65 30 L55 40" stroke="#06b6d4" strokeWidth="3" strokeLinecap="round" fill="none" />
      )}
    </svg>
  );
}

function GeneralKnowledgeIcon({ hovered }: { hovered: boolean }) {
  return (
    <svg viewBox="0 0 120 120" className="w-full h-full" fill="none">
      {/* Head */}
      <circle cx="60" cy="42" r="26" fill="#a855f7" stroke="#1a1a1a" strokeWidth="3" />
      {/* Face */}
      <circle cx="52" cy="40" r="4" fill="#1a1a1a" />
      <circle cx="68" cy="40" r="4" fill="#1a1a1a" />
      <path d={hovered ? "M50 52 Q60 60 70 52" : "M50 52 Q60 56 70 52"}
        stroke="#1a1a1a" strokeWidth="2.5" strokeLinecap="round" fill="none"
        style={{ transition: "d 0.3s ease" }}
      />
      {/* Thought bubbles */}
      {[
        { cx: 82, cy: 22, r: 8, delay: "0s" },
        { cx: 94, cy: 12, r: 5, delay: "0.1s" },
        { cx: 102, cy: 5, r: 3, delay: "0.2s" },
      ].map((b, i) => (
        <circle
          key={i}
          cx={b.cx} cy={b.cy} r={b.r}
          fill="#fff" stroke="#1a1a1a" strokeWidth="2"
          style={{
            opacity: hovered ? 1 : 0,
            transform: hovered ? "scale(1)" : "scale(0)",
            transformOrigin: `${b.cx}px ${b.cy}px`,
            transition: `all 0.3s ease ${b.delay}`,
          }}
        />
      ))}
      {/* Light bulb on hover */}
      <g
        style={{
          opacity: hovered ? 1 : 0,
          transform: hovered ? "translateY(0)" : "translateY(10px)",
          transition: "all 0.4s ease 0.1s",
        }}
      >
        <ellipse cx="82" cy="22" rx="7" ry="8" fill="#fbbf24" stroke="#1a1a1a" strokeWidth="1.5" />
        <rect x="79" y="29" width="6" height="4" rx="1" fill="#1a1a1a" />
      </g>
      {/* Road below */}
      <rect x="0" y="90" width="120" height="30" fill="#374151" />
      <rect x="10" y="100" width="100" height="4" rx="2" fill="#fbbf24" opacity="0.5" />
    </svg>
  );
}

function EmergencyIcon({ hovered }: { hovered: boolean }) {
  return (
    <svg viewBox="0 0 120 120" className="w-full h-full" fill="none">
      {/* Ambulance */}
      <rect x="10" y="60" width="75" height="38" rx="5" fill="#fff" stroke="#1a1a1a" strokeWidth="3" />
      <rect x="85" y="70" width="28" height="28" rx="4" fill="#fff" stroke="#1a1a1a" strokeWidth="3" />
      <rect x="88" y="73" width="16" height="12" rx="2" fill="#bfdbfe" />
      {/* Red cross */}
      <rect x="30" y="68" width="20" height="6" rx="2" fill="#ef4444" />
      <rect x="36" y="62" width="8" height="18" rx="2" fill="#ef4444" />
      {/* Wheels */}
      <circle cx="30" cy="100" r="10" fill="#1a1a1a" />
      <circle cx="30" cy="100" r="5" fill="#9ca3af" />
      <circle cx="88" cy="100" r="10" fill="#1a1a1a" />
      <circle cx="88" cy="100" r="5" fill="#9ca3af" />
      {/* Siren light */}
      <rect x="40" y="52" width="20" height="10" rx="3" fill="#1a1a1a" />
      <ellipse
        cx="50" cy="52" rx="10" ry="6"
        fill={hovered ? "#ef4444" : "#fda4af"}
        style={{ transition: "fill 0.15s" }}
      />
      {/* Flash rays */}
      {hovered && [0, 60, 120, 180, 240, 300].map((deg, i) => (
        <line
          key={i}
          x1="50" y1="52"
          x2={50 + Math.cos((deg * Math.PI) / 180) * 18}
          y2={52 + Math.sin((deg * Math.PI) / 180) * 18}
          stroke="#ef4444" strokeWidth="2" strokeLinecap="round"
          style={{ opacity: 0.7 }}
        />
      ))}
    </svg>
  );
}

// ─── Icon scene map ──────────────────────────────────────────────────────────

const ICON_SCENES: Record<string, React.ComponentType<{ hovered: boolean }>> = {
  "road-sign": TrafficSignsIcon,
  "road-traffic": RoadTrafficLawIcon,
  priority: RightOfWayIcon,
  driving: DrivingSkillsIcon,
  technical: VehicleTechIcon,
  "loading-people-goods": LoadingGoodsIcon,
  "general-knowledge": GeneralKnowledgeIcon,
  emergency: EmergencyIcon,
};

// ─── Per-category background patterns ───────────────────────────────────────

const BG_PATTERNS: Record<string, string> = {
  "road-sign": "radial-gradient(circle at 30% 70%, rgba(255,255,255,0.15) 0%, transparent 60%)",
  "road-traffic": "linear-gradient(135deg, rgba(255,255,255,0.1) 25%, transparent 25%, transparent 50%, rgba(255,255,255,0.1) 50%, rgba(255,255,255,0.1) 75%, transparent 75%)",
  priority: "radial-gradient(circle at 70% 30%, rgba(255,255,255,0.2) 0%, transparent 50%)",
  driving: "repeating-linear-gradient(90deg, transparent, transparent 20px, rgba(255,255,255,0.08) 20px, rgba(255,255,255,0.08) 22px)",
  technical: "radial-gradient(circle at 50% 50%, rgba(255,255,255,0.12) 0%, transparent 70%)",
  "loading-people-goods": "repeating-linear-gradient(45deg, transparent, transparent 15px, rgba(255,255,255,0.07) 15px, rgba(255,255,255,0.07) 30px)",
  "general-knowledge": "radial-gradient(ellipse at 60% 40%, rgba(255,255,255,0.18) 0%, transparent 60%)",
  emergency: "repeating-linear-gradient(-45deg, transparent, transparent 12px, rgba(255,255,255,0.06) 12px, rgba(255,255,255,0.06) 24px)",
};

// ─── Component ───────────────────────────────────────────────────────────────

interface AnimatedCategoryCardProps {
  slug: string;
  titleEn: string;
  titleKh: string;
  descEn: string;
  index: number;
  lang: "en" | "kh";
  studyNowText: string;
}

export function AnimatedCategoryCard({
  slug,
  titleEn,
  titleKh,
  descEn,
  index,
  lang,
  studyNowText,
}: AnimatedCategoryCardProps) {
  const cardRef = useRef<HTMLAnchorElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  const color = CATEGORY_COLORS[slug];
  const shadow = CATEGORY_SHADOW[slug];
  const kh = lang === "kh";

  const IconScene = ICON_SCENES[slug];


  // ScrollTrigger entrance animation
  useEffect(() => {
    if (!cardRef.current) return;
    gsap.set(cardRef.current, { opacity: 0, y: 50, scale: 0.9 });
    const trigger = ScrollTrigger.create({
      trigger: cardRef.current,
      start: "top 88%",
      once: true,
      onEnter: () => {
        gsap.to(cardRef.current, {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.6,
          delay: index * 0.07,
          ease: "back.out(1.5)",
        });
      },
    });
    return () => trigger.kill();
  }, [index]);

  // Hover: card lift
  useEffect(() => {
    if (!cardRef.current) return;
    gsap.to(cardRef.current, {
      y: isHovered ? -6 : 0,
      duration: 0.3,
      ease: "power2.out",
    });
  }, [isHovered]);

  return (
    <Link
      ref={cardRef}
      href={`/learn/${slug}`}
      className="flex flex-col bg-white border-2 border-black overflow-hidden"
      style={{
        boxShadow: isHovered ? shadow : "4px 4px 0 #000",
        borderRadius: "3px",
        transition: "box-shadow 0.25s ease",
        willChange: "transform",
      }}
      onMouseEnter={() => { setIsHovered(true); }}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* ── Animated cover header ── */}
      <div
        ref={headerRef}
        className="relative flex items-center justify-center border-b-2 border-black overflow-hidden h-20 sm:h-28 md:h-44"
        style={{
          backgroundColor: color,
          transition: "background-color 0.4s ease",
        }}
      >
        {/* Layered background pattern */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: BG_PATTERNS[slug],
            backgroundSize: "40px 40px",
            opacity: isHovered ? 1 : 0.5,
            transition: "opacity 0.4s ease",
          }}
        />

        {/* Animated diagonal stripe reveal on hover */}
        <div
          className="absolute inset-0"
          style={{
            background: `repeating-linear-gradient(
              -55deg,
              transparent 0px,
              transparent 18px,
              rgba(0,0,0,0.04) 18px,
              rgba(0,0,0,0.04) 36px
            )`,
            transform: isHovered ? "translateX(0)" : "translateX(-100%)",
            transition: "transform 0.5s ease",
          }}
        />

        {/* Icon scene */}
        <div
          className="relative z-10 w-16 h-16 sm:w-24 sm:h-24 md:w-32 md:h-32 lg:w-36 lg:h-36"
          style={{
            filter: isHovered ? "drop-shadow(0 8px 16px rgba(0,0,0,0.25))" : "drop-shadow(0 2px 4px rgba(0,0,0,0.15))",
            transition: "filter 0.3s ease",
          }}
        >
          {IconScene && <IconScene hovered={isHovered} />}
        </div>

        {/* Bottom caution tape slide-up */}
        <div
          className="absolute bottom-0 left-0 right-0 h-7"
          style={{
            background: "repeating-linear-gradient(45deg, #000 0px, #000 10px, #fbbf24 10px, #fbbf24 20px)",
            transform: isHovered ? "translateY(0)" : "translateY(100%)",
            transition: "transform 0.35s cubic-bezier(0.34,1.56,0.64,1)",
          }}
        />
      </div>

      {/* ── Card body ── */}
      <div
        className="flex flex-col flex-1 p-2 sm:p-3.5 md:p-5 gap-0.5 sm:gap-1 md:gap-2"
        style={{
          transform: isHovered ? "translateY(-3px)" : "translateY(0)",
          transition: "transform 0.3s ease",
        }}
      >
        <h3 className="font-black text-[11px] xs:text-xs sm:text-sm md:text-lg text-black leading-tight font-learning break-normal">
          {kh ? titleKh : titleEn}
        </h3>
        <p className="text-[9px] sm:text-xs text-zinc-400 font-learning break-normal">
          {titleKh}
        </p>
        <p className="hidden md:block text-sm text-zinc-600 leading-relaxed mt-1 flex-1 font-learning">
          {descEn}
        </p>

        {/* Study now button */}
        <div className="mt-1.5 md:mt-3 pt-1.5 md:pt-3 border-t border-black flex items-center justify-between">
          <span
            className="text-[9px] sm:text-xs font-black px-1.5 py-0.5 sm:px-3 sm:py-1 border sm:border-2 border-black font-system"
            style={{
              backgroundColor: isHovered ? "#000" : color,
              color: isHovered ? "#fff" : "#000",
              borderRadius: "3px",
              transition: "background-color 0.25s ease, color 0.25s ease",
            }}
          >
            {studyNowText}
          </span>
          {/* Arrow */}
          <svg
            className="w-3.5 h-3.5 sm:w-5 sm:h-5" viewBox="0 0 20 20" fill="none"
            style={{
              transform: isHovered ? "translateX(4px)" : "translateX(0)",
              transition: "transform 0.3s ease",
            }}
          >
            <path d="M4 10h12M12 6l4 4-4 4" stroke="#000" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>
    </Link>
  );
}
