"use client";

import { Marquee } from "@/components/ui/marquee";
import { useState } from "react";
import { useLang } from "@/context/lang-context";

const LOGOS = [
  { src: "https://res.cloudinary.com/dpgivqzrl/image/upload/v1773556277/logo-girls_o7e3tg.png",    name: "Technovation Girls" },
  { src: "https://res.cloudinary.com/dpgivqzrl/image/upload/v1773556276/FDTboy_qofevj.png",        name: "Future Digital Talents" },
  { src: "https://res.cloudinary.com/dpgivqzrl/image/upload/v1773556276/66aafc8e5a697_obtttu.png", name: "Ministry of Education, Youth and Sport" },
  { src: "https://res.cloudinary.com/dpgivqzrl/image/upload/v1782299398/kwdblacknobackground_tikazv.png", name: "Kesararam With Digital" },
  { src: "https://res.cloudinary.com/dpgivqzrl/image/upload/v1782299393/KWDxTGC_d2m05u.png",        name: "KWD × TGC" },
];

function LogoItem({ src, name }: { src: string; name: string }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className="relative flex flex-col items-center justify-center"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <img
        src={src}
        alt={name}
        className={`h-12 w-28 object-contain transition-all duration-300 ${
          hovered ? "grayscale-0 opacity-100 scale-110" : "grayscale opacity-50"
        }`}
        loading="lazy"
      />
      <span
        className={`absolute -bottom-6 whitespace-nowrap text-[10px] font-black uppercase tracking-wide text-zinc-600 transition-all duration-200 ${
          hovered ? "opacity-100 translate-y-0" : "opacity-0 translate-y-1"
        }`}
      >
        {name}
      </span>
    </div>
  );
}

export function SponsorsMarquee() {
  const { isKh } = useLang();

  return (
    <section className="bg-white py-10 pb-14 border-b-2 border-black overflow-hidden">
      <p className="text-[11px] font-black uppercase tracking-widest text-zinc-400 text-center mb-8">
        {isKh ? "យើងប្រកួតជាមួយកម្មវិធីដែលរៀបចំដោយ" : "We compete with the program organized by"}
      </p>

      <Marquee
        pauseOnHover
        repeat={4}
        className="[--duration:25s] [--gap:0px]"
      >
        {LOGOS.map((logo, i) => (
          <div key={i} className="px-10">
            <LogoItem src={logo.src} name={logo.name} />
          </div>
        ))}
      </Marquee>
    </section>
  );
}
