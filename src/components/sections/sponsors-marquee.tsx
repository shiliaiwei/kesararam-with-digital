"use client";

import { Marquee } from "@/components/ui/marquee";
import { useState } from "react";
import { useLang } from "@/context/lang-context";

const LOGOS: { src: string; name: string; cls?: string }[] = [
  { src: "https://res.cloudinary.com/dpgivqzrl/image/upload/v1773556277/logo-girls_o7e3tg.png",    name: "Technovation Girls" },
  { src: "https://res.cloudinary.com/dpgivqzrl/image/upload/v1773556276/FDTboy_qofevj.png",        name: "Future Digital Talents" },
  { src: "https://res.cloudinary.com/dpgivqzrl/image/upload/v1773556276/66aafc8e5a697_obtttu.png", name: "Ministry of Education, Youth and Sport" },
  { src: "https://res.cloudinary.com/dpgivqzrl/image/upload/v1773556274/60b09a9dcc100_a0nmfz.png", name: "Tech for Kids Academy", cls: "h-12 w-32" },
  { src: "https://res.cloudinary.com/dpgivqzrl/image/upload/v1773556276/66aafc9f1b03a_pbp6oz.png", name: "Ministry of Post and Telecommunications", cls: "h-16 w-16" },
  { src: "https://mptc.obsv3.kh-gov-1.mptccloud.gov.kh/2024/10/CBRD-and-USO-Fund-Logo-Final.png", name: "CBRD Fund", cls: "h-12 w-32" },
  { src: "https://images.squarespace-cdn.com/content/v1/5e560c623afd7726eeee68f3/1595557577370-7TMFJPEMM6IBMEOO9GLI/image.png", name: "Khmer Enterprise", cls: "h-12 w-32" },
  { src: "https://res.cloudinary.com/dpgivqzrl/image/upload/v1775035064/efabroad_ddoo1r.png",     name: "EF Abroad", cls: "h-14 w-14" },
  { src: "https://res.cloudinary.com/dpgivqzrl/image/upload/v1775035059/cctimes-kh_iyipdo.png",    name: "The Cambodia China Times", cls: "h-12 w-28" },
  // Square logos (~800×800): use a taller box so object-contain doesn't shrink them
  { src: "https://res.cloudinary.com/dpgivqzrl/image/upload/v1782299398/kwdblacknobackground_tikazv.png", name: "Kesararam With Digital", cls: "h-16 w-16" },
  { src: "https://res.cloudinary.com/dpgivqzrl/image/upload/v1782299393/KWDxTGC_d2m05u.png",        name: "Kesararam With Digital × TGC", cls: "h-16 w-16" },
];

function LogoItem({ src, name, cls = "h-12 w-28" }: { src: string; name: string; cls?: string }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className="relative flex h-16 flex-col items-center justify-center"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <img
        src={src}
        alt={name}
        className={`${cls} object-contain transition-all duration-300 ${
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
        repeat={3}
        className="[--duration:35s] [--gap:0px]"
      >
        {LOGOS.map((logo, i) => (
          <div key={i} className="px-10">
            <LogoItem src={logo.src} name={logo.name} cls={logo.cls} />
          </div>
        ))}
      </Marquee>
    </section>
  );
}
