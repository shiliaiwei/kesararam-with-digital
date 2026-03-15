"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const TRAFFIC_ICONS = [
  "https://res.cloudinary.com/dpgivqzrl/image/upload/e_background_removal/f_auto,q_auto/photo_29_2026-03-15_14-25-55_fe1jw4?_a=BAMAAAUs0",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/e_background_removal/f_auto,q_auto/photo_28_2026-03-15_14-25-55_shzh19?_a=BAMAAAUs0",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/e_background_removal/f_auto,q_auto/photo_27_2026-03-15_14-25-55_dzw4l5?_a=BAMAAAUs0",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/e_background_removal/f_auto,q_auto/photo_26_2026-03-15_14-25-55_yleyvu?_a=BAMAAAUs0",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/e_background_removal/f_auto,q_auto/photo_25_2026-03-15_14-25-55_eakxhh?_a=BAMAAAUs0",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/e_background_removal/f_auto,q_auto/photo_24_2026-03-15_14-25-55_d5pki2?_a=BAMAAAUs0",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/e_background_removal/f_auto,q_auto/photo_23_2026-03-15_14-25-55_cuea7i?_a=BAMAAAUs0",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/e_background_removal/f_auto,q_auto/photo_22_2026-03-15_14-25-55_uj6aij?_a=BAMAAAUs0",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/e_background_removal/f_auto,q_auto/photo_21_2026-03-15_14-25-55_ztok1p?_a=BAMAAAUs0",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/e_background_removal/f_auto,q_auto/photo_19_2026-03-15_14-25-55_rvnlm6?_a=BAMAAAUs0",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/e_background_removal/f_auto,q_auto/photo_18_2026-03-15_14-25-55_pm8nhx?_a=BAMAAAUs0",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/e_background_removal/f_auto,q_auto/photo_17_2026-03-15_14-25-55_wopjzl?_a=BAMAAAUs0",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/e_background_removal/f_auto,q_auto/photo_16_2026-03-15_14-25-55_gmvp9h?_a=BAMAAAUs0",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/e_background_removal/f_auto,q_auto/photo_15_2026-03-15_14-25-55_e9lohq?_a=BAMAAAUs0",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/e_background_removal/f_auto,q_auto/photo_14_2026-03-15_14-25-55_vev44f?_a=BAMAAAUs0",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/e_background_removal/f_auto,q_auto/photo_13_2026-03-15_14-25-55_trm0oz?_a=BAMAAAUs0",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/e_background_removal/f_auto,q_auto/photo_12_2026-03-15_14-25-55_bkheog?_a=BAMAAAUs0",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/e_background_removal/f_auto,q_auto/photo_11_2026-03-15_14-25-55_uvo2rk?_a=BAMAAAUs0",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/e_background_removal/f_auto,q_auto/photo_10_2026-03-15_14-25-55_zflbbg?_a=BAMAAAUs0",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/e_background_removal/f_auto,q_auto/photo_9_2026-03-15_14-25-55_oecfcj?_a=BAMAAAUs0",
];

interface IconPosition {
  angle: number;
  radius: number;
  size: number;
  delay: number;
}

export function FloatingIconsHero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const iconsRef = useRef<HTMLDivElement[]>([]);

  useEffect(() => {
    if (!containerRef.current) return;

    const ctx = gsap.context(() => {
      // Animate each icon with orbital motion
      iconsRef.current.forEach((icon, index) => {
        if (!icon) return;

        const angle = (index / TRAFFIC_ICONS.length) * Math.PI * 2;
        const radius = 300 + Math.random() * 200;

        // Initial state: scattered around center, fully visible
        gsap.set(icon, {
          x: Math.cos(angle) * radius * 2,
          y: Math.sin(angle) * radius * 2,
          opacity: 0.6,
          scale: 0.8,
        });

        // Scroll animation: orbit toward center
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: containerRef.current,
            start: "top top",
            end: "bottom center",
            scrub: 1,
          },
        });

        // Phase 1: Move toward center with orbital path
        tl.to(icon, {
          x: Math.cos(angle) * radius * 0.5,
          y: Math.sin(angle) * radius * 0.5,
          opacity: 0.9,
          scale: 1,
          ease: "power2.out",
        })
          // Phase 2: Pass through center - scale up and glow
          .to(icon, {
            x: Math.cos(angle) * radius * 0.2,
            y: Math.sin(angle) * radius * 0.2,
            opacity: 1,
            scale: 1.2,
            filter: "drop-shadow(0 0 20px rgba(250, 204, 21, 0.6))",
            ease: "power1.inOut",
          })
          // Phase 3: Exit - drift upward and fade
          .to(icon, {
            y: "-=200",
            opacity: 0,
            scale: 0.9,
            ease: "power2.in",
          });
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  // Generate orbital positions for icons
  const iconPositions: IconPosition[] = TRAFFIC_ICONS.map((_, index) => {
    const angle = (index / TRAFFIC_ICONS.length) * Math.PI * 2;
    return {
      angle,
      radius: 300 + Math.random() * 200,
      size: 60 + Math.random() * 60,
      delay: Math.random() * 0.5,
    };
  });

  return (
    <section
      ref={containerRef}
      className="relative min-h-[150vh] bg-white overflow-hidden flex items-center justify-center"
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
              className="absolute left-1/2 top-1/2"
              style={{
                width: `${pos.size}px`,
                height: `${pos.size}px`,
                marginLeft: `-${pos.size / 2}px`,
                marginTop: `-${pos.size / 2}px`,
              }}
            >
              <img
                src={icon}
                alt="Traffic sign"
                className="w-full h-full object-contain"
              />
            </div>
          );
        })}
      </div>
    </section>
  );
}
