"use client";

import { Marquee } from "@/components/ui/marquee";

const LOGOS = [
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1773556274/66b4722689fe3_oovtm3.png",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1773556274/607e44cbba851_pnmy8i.png",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1773556276/66aafc8e5a697_obtttu.png",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1773556275/cropped-Technovation-Logo-Girls-White_ykzwzq.webp",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1773556277/logo-girls_o7e3tg.png",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1773556276/logo_tg_halxkd.png",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1773556276/FDTboy_qofevj.png",
];

export function SponsorsMarquee() {
  return (
    <section className="bg-white py-10 border-b-2 border-black overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 mb-6 text-center">
        <p className="text-xs font-black uppercase tracking-widest text-zinc-400">
          We participate with
        </p>
      </div>

      <div className="relative">
        <Marquee className="[--duration:40s] hover:[animation-play-state:paused]">
          {/* Duplicate for seamless loop */}
          {[...LOGOS, ...LOGOS].map((src, i) => (
            <div
              key={i}
              className="flex items-center justify-center mx-10"
            >
              <img
                src={src}
                alt=""
                className="h-14 w-32 object-contain grayscale hover:grayscale-0 opacity-60 hover:opacity-100 transition-all duration-300"
                loading="lazy"
              />
            </div>
          ))}
        </Marquee>
      </div>
    </section>
  );
}
