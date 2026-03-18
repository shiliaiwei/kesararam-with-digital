"use client";

import { Marquee } from "@/components/ui/marquee";

const sponsors = [
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1773855614/nasa.3bf5af29_lqc4ug.png",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1773855572/mit.1af911d7_oxjxvl.png",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1773855612/princeton.5d0a5006_rhkhhk.png",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1773855612/pennsylvania.8c9f4108_rn54hi.png",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1773855497/ibm.bcec6b9a_-_Copy_2_xo6g3o.png",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1773855498/microsoft.4a9a93f0_rnrdzu.png",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1773855497/dell.09332c44_ds3d9t.png",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1773855496/logo-windows_-_Copy_2_xudhpj.svg",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1773855496/boeing.3037b0a6_i4jjpa.png",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1773855495/logo-wechat_-_Copy_2_bwnb92.svg",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1773855494/logo-tux_-_Copy_2_yvc8c0.svg",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1773855495/logo-vercel_-_Copy_2_nqbvcq.svg",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1773855494/logo-twitter_-_Copy_2_molxhh.svg",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1773855494/logo-hackernews_-_Copy_2_iqt9b1.svg",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1773855493/logo-google_-_Copy_2_mqpc8z.svg",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1773855493/logo-figma_-_Copy_2_ezvawh.svg",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1773855492/logo-github_-_Copy_2_i7hx6p.svg",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1773855492/logo-tiktok_-_Copy_2_vjaj7l.svg",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1773855491/logo-facebook_-_Copy_2_wj4op6.svg",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1773855491/logo-android_-_Copy_2_kj5kbu.svg",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1773855491/logo-apple_-_Copy_2_mq79nl.svg",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1773556277/66aafcb1a2919_aftdmt.png",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1773556277/logo-girls_o7e3tg.png",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1773556276/logo.872049b00b8e_swyx1w.svg",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1773556276/66aafc9f1b03a_pbp6oz.png",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1773556276/logo_tg_halxkd.png",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1773556276/FDTboy_qofevj.png",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1773556276/66aafc8e5a697_obtttu.png",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1773556275/66b471efa76ad_i13cdm.png",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1773556274/60b09a9dcc100_a0nmfz.png",
];

function SponsorLogo({ src, index }: { src: string; index: number }) {
  return (
    <div className="flex items-center justify-center px-6 grayscale hover:grayscale-0 transition-all duration-300">
      <img
        src={src}
        alt={`Sponsor ${index + 1}`}
        className="h-12 w-auto object-contain opacity-60 hover:opacity-100 transition-opacity"
        loading="lazy"
      />
    </div>
  );
}

export function SponsorsMarquee() {
  return (
    <section className="bg-white py-12 border-b-2 border-black overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 mb-8">
        <h2 className="text-2xl font-black text-center text-zinc-800">
          Trusted By
        </h2>
      </div>
      
      <div className="relative">
        <Marquee className="[--duration:80s]" pauseOnHover>
          {sponsors.map((src, i) => (
            <SponsorLogo key={i} src={src} index={i} />
          ))}
        </Marquee>
        
        {/* Fade edges */}
        <div className="absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-white to-transparent pointer-events-none" />
        <div className="absolute inset-y-0 right-0 w-20 bg-gradient-to-l from-white to-transparent pointer-events-none" />
      </div>
    </section>
  );
}
