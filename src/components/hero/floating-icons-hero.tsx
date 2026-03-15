"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const TRAFFIC_ICONS = [
  "https://res.cloudinary.com/dpgivqzrl/image/upload/f_auto,q_auto/photo_29_2026-03-15_14-25-55_fe1jw4?_a=BAMAAAUs0",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/f_auto,q_auto/photo_28_2026-03-15_14-25-55_shzh19?_a=BAMAAAUs0",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/f_auto,q_auto/photo_27_2026-03-15_14-25-55_dzw4l5?_a=BAMAAAUs0",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/f_auto,q_auto/photo_26_2026-03-15_14-25-55_yleyvu?_a=BAMAAAUs0",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/f_auto,q_auto/photo_25_2026-03-15_14-25-55_eakxhh?_a=BAMAAAUs0",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/f_auto,q_auto/photo_24_2026-03-15_14-25-55_d5pki2?_a=BAMAAAUs0",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/f_auto,q_auto/photo_23_2026-03-15_14-25-55_cuea7i?_a=BAMAAAUs0",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/f_auto,q_auto/photo_22_2026-03-15_14-25-55_uj6aij?_a=BAMAAAUs0",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/f_auto,q_auto/photo_21_2026-03-15_14-25-55_ztok1p?_a=BAMAAAUs0",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/f_auto,q_auto/photo_19_2026-03-15_14-25-55_rvnlm6?_a=BAMAAAUs0",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/f_auto,q_auto/photo_18_2026-03-15_14-25-55_pm8nhx?_a=BAMAAAUs0",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/f_auto,q_auto/photo_17_2026-03-15_14-25-55_wopjzl?_a=BAMAAAUs0",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/f_auto,q_auto/photo_16_2026-03-15_14-25-55_gmvp9h?_a=BAMAAAUs0",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/f_auto,q_auto/photo_15_2026-03-15_14-25-55_e9lohq?_a=BAMAAAUs0",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/f_auto,q_auto/photo_14_2026-03-15_14-25-55_vev44f?_a=BAMAAAUs0",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/f_auto,q_auto/photo_13_2026-03-15_14-25-55_trm0oz?_a=BAMAAAUs0",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/f_auto,q_auto/photo_12_2026-03-15_14-25-55_bkheog?_a=BAMAAAUs0",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/f_auto,q_auto/photo_11_2026-03-15_14-25-55_uvo2rk?_a=BAMAAAUs0",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/f_auto,q_auto/photo_10_2026-03-15_14-25-55_zflbbg?_a=BAMAAAUs0",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/f_auto,q_auto/photo_9_2026-03-15_14-25-55_oecfcj?_a=BAMAAAUs0",
];

interface IconPosition {
  x: number;
  y: number;
  size: number;
  speed: number;
  delay: number;
  rotation: number;
}

export function FloatingIconsHero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const iconsRef = useRef<HTMLDivElement[]>([]);

  useEffect(() => {
    if (!containerRef.current) return;

    const ctx = gsap.context(() => {
      // Animate each icon
      iconsRef.current.forEach((icon, index) => {
        if (!icon) return;

        // Bobbing animation (continuous)
        gsap.to(icon, {
          y: "+=20",
          duration: 2 + Math.random() * 2,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
          delay: Math.random() * 2,
        });

        // Scroll-triggered animation: float toward center
        gsap.fromTo(
          icon,
          {
            x: index % 2 === 0 ? "-100vw" : "100vw",
            y: Math.random() * window.innerHeight,
            opacity: 0,
            scale: 0.5,
          },
          {
            x: 0,
            y: 0,
            opacity: 0.8,
            scale: 1,
            duration: 2 + Math.random() * 2,
            ease: "power2.out",
            scrollTrigger: {
              trigger: containerRef.current,
              start: "top center",
              end: "center center",
              scrub: 1 + Math.random() * 2, // Different parallax speeds
            },
          }
        );
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  // Generate random positions for icons
  const iconPositions: IconPosition[] = TRAFFIC_ICONS.map((_, index) => ({
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: 60 + Math.random() * 80,
    speed: 1 + Math.random() * 3,
    delay: Math.random() * 2,
    rotation: Math.random() * 360,
  }));

  return (
    <section
      ref={containerRef}
      className="relative min-h-screen bg-white overflow-hidden flex items-center justify-center"
    >
      {/* Floating traffic icons */}
      <div className="absolute inset-0 pointer-events-none">
        {TRAFFIC_ICONS.map((icon, index) => {
          const pos = iconPositions[index];
          return (
            <div
              key={index}
              ref={(el) => {
                if (el) iconsRef.current[index] = el;
              }}
              className="absolute"
              style={{
                left: `${pos.x}%`,
                top: `${pos.y}%`,
                width: `${pos.size}px`,
                height: `${pos.size}px`,
                transform: `rotate(${pos.rotation}deg)`,
              }}
            >
              <img
                src={icon}
                alt="Traffic sign"
                className="w-full h-full object-contain"
                style={{
                  backdropFilter: "blur(8px)",
                  WebkitBackdropFilter: "blur(8px)",
                  filter: "drop-shadow(0 4px 20px rgba(0, 0, 0, 0.1))",
                }}
              />
            </div>
          );
        })}
      </div>

      {/* Central headline */}
      <div className="relative z-10 text-center px-6 max-w-4xl">
        <h1 className="text-6xl md:text-8xl font-black text-black leading-tight mb-6">
          Get Exclusive
          <br />
          <span className="text-yellow-400 underline decoration-black decoration-4">
            Access
          </span>
        </h1>
        <p className="text-xl md:text-2xl text-zinc-600 font-medium mb-8">
          Master every road sign and pass your driving exam with confidence
        </p>
        <button className="px-8 py-4 bg-yellow-400 text-black font-black text-lg border-2 border-black shadow-[6px_6px_0_#000] hover:shadow-[8px_8px_0_#000] hover:-translate-x-1 hover:-translate-y-1 transition-all duration-150">
          Start Learning Now
        </button>
      </div>
    </section>
  );
}
