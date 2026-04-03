"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import { useLang } from "@/context/lang-context";

// ── Blue signs
const BLUE = [
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1775173153/PW03-R2-07KWD_x7pgky.svg",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1775173156/PW03-R2-01KWD_anmelo.svg",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1775173156/PW03-R2-03KWD_bupf9g.svg",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1775173155/PW03-R2-05KWD_mvuvri.svg",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1775173151/PW03-R2-12KWD_rharui.svg",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1775173150/PW03-R2-13KWD_pmrcwz.svg",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1775173147/PW03-R2-19KWD_cqhabi.svg",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1775173149/PW03-R2-17KWD_tcvwdc.svg",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1775173146/PW03-R2-21KWD_vyc3hx.svg",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1775173107/PW03-G4-01KWD_eqrsua.svg",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1775173106/PW03-G4-03KWD_lidtce.svg",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1775173105/PW03-G4-06KWD_ldcl6b.svg",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1775173105/PW03-G4-08KWD_dzn2mj.svg",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1775173105/PW03-G4-07KWD_mu7xwz.svg",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1775173103/PW03-G4-09KWD_ylweno.svg",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1775173102/PW03-G4-13KWD_pa5avd.svg",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1775173102/PW03-G4-11KWD_kcaq9q.svg",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1775173102/PW03-G4-14KWD_rvl9kg.svg",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1775173101/PW03-G4-15KWD_c4x3pr.svg",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1775173099/PW03-G4-19KWD_b87iar.svg",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1775173096/PW03-G4-23KWD_b0tuge.svg",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1775173095/PW03-G4-26KWD_qzunw7.svg",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1775173093/PW03-G4-30KWD_diswfo.svg",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1775173092/PW03-G4-34KWD_glerod.svg",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1775173089/PW03-G4-39KWD_gizeat.svg",
];

// ── Red signs (PW03-P1-10 and PW03-P1-09 removed)
const RED = [
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1775173158/PW03-R1-44KWD_qyidtw.svg",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1775173159/PW03-R1-41KWD_bhxu0a.svg",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1775173162/PW03-R1-36KWD_h9cv1z.svg",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1775173162/PW03-R1-35KWD_ovejxd.svg",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1775173164/PW03-R1-31KWD_mjyetc.svg",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1775173167/PW03-R1-25KWD_cnzq32.svg",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1775173168/PW03-R1-23KWD_c6ybme.svg",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1775173170/PW03-R1-20KWD_smst1z.svg",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1775173177/PW03-R1-05KWD_hd0yrg.svg",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1775173177/PW03-R1-04KWD_jowasr.svg",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1775173161/PW03-R1-38KWD_m1blii.svg",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1775173109/PW03-R3-07KWD_cyly8r.svg",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1775173111/PW03-R3-02KWD_xty4we.svg",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1775173111/PW03-R3-03KWD_yyjpsq.svg",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1775173111/PW03-R3-01KWD_dvwtzg.svg",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1775173119/PW03-P1-02KWD_ns8moh.svg",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1775173119/PW03-P1-01KWD_ry8dbh.svg",
];

// ── Yellow signs
const YELLOW = [
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1775173074/PW03-W2-01KWD_pqsgka.svg",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1775173111/PW03-R3-04KWD_rb9coq.svg",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1775173145/PW03-W1-01KWD_ixzytx.svg",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1775173143/PW03-W1-03KWD_tvwy7i.svg",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1775173141/PW03-W1-09KWD_wicncp.svg",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1775173140/PW03-W1-10KWD_zs0k3g.svg",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1775173138/PW03-W1-15KWD_jxwep5.svg",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1775173137/PW03-W1-17KWD_ne24sh.svg",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1775173137/PW03-W1-16KWD_f6zb2j.svg",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1775173129/PW03-W1-33KWD_gsyiso.svg",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1775173128/PW03-W1-35KWD_wgbbmt.svg",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1775173127/PW03-W1-38KWD_z656j0.svg",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1775173125/PW03-W1-42KWD_soj7yw.svg",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1775173127/PW03-W1-37KWD_xvt2xn.svg",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1775173128/PW03-W1-34KWD_lq5jye.svg",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1775173137/PW03-W1-18KWD_todz9o.svg",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1775173073/PW03-W2-02KWD_m6vu3u.svg",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1775173070/PW03-W2-07KWD_pv8k7r.svg",
];

// Interleave all three pools into one big mixed list
function interleave(a: string[], b: string[], c: string[]): string[] {
  const out: string[] = [];
  const len = Math.max(a.length, b.length, c.length);
  for (let i = 0; i < len; i++) {
    if (a[i % a.length]) out.push(a[i % a.length]);
    if (b[i % b.length]) out.push(b[i % b.length]);
    if (c[i % c.length]) out.push(c[i % c.length]);
  }
  return out;
}

// Variable sizes to create a "busy" uneven rhythm
const SIZES = [56, 48, 64, 52, 60, 44, 68, 50, 56, 48, 72, 52, 60, 44, 56, 64, 48, 56, 52, 68];

const ALL = interleave(BLUE, RED, YELLOW);
// Split into 4 rows with different offsets for density
const ROW1 = ALL.slice(0, 20);
const ROW2 = ALL.slice(15, 35);
const ROW3 = ALL.slice(10, 30);
const ROW4 = ALL.slice(5, 25);

// ── Draggable marquee row ─────────────────────────────────────────────────────
function DragRow({
  signs,
  speed,
  reverse,
  sizeOffset = 0,
}: {
  signs: string[];
  speed: number; // px per second
  reverse?: boolean;
  sizeOffset?: number;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const posRef = useRef(0);
  const velRef = useRef(reverse ? speed : -speed);
  const dragging = useRef(false);
  const lastX = useRef(0);
  const rafRef = useRef<number>(0);
  const [hovered, setHovered] = useState(false);
  const items = [...signs, ...signs, ...signs]; // triple for seamless loop

  const getHalfWidth = useCallback(() => {
    const el = trackRef.current;
    if (!el) return 0;
    return el.scrollWidth / 3;
  }, []);

  useEffect(() => {
    let last = performance.now();

    const tick = (now: number) => {
      const dt = (now - last) / 1000;
      last = now;

      if (!dragging.current) {
        // Friction decay toward auto-scroll speed
        const target = reverse ? speed : -speed;
        velRef.current += (target - velRef.current) * Math.min(dt * 4, 1);
      } else {
        // Friction when dragging released
        velRef.current *= 0.92;
      }

      if (!hovered || dragging.current) {
        posRef.current += velRef.current * dt;
      }

      const half = getHalfWidth();
      if (half > 0) {
        // Wrap seamlessly
        if (posRef.current < -half) posRef.current += half;
        if (posRef.current > 0) posRef.current -= half;
      }

      if (trackRef.current) {
        trackRef.current.style.transform = `translateX(${posRef.current}px)`;
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [hovered, reverse, speed, getHalfWidth]);

  // Mouse drag
  const onMouseDown = (e: React.MouseEvent) => {
    dragging.current = true;
    lastX.current = e.clientX;
    velRef.current = 0;
  };
  const onMouseMove = (e: React.MouseEvent) => {
    if (!dragging.current) return;
    const dx = e.clientX - lastX.current;
    lastX.current = e.clientX;
    posRef.current += dx;
    velRef.current = dx / (1 / 60); // approximate velocity
  };
  const onMouseUp = () => { dragging.current = false; };

  // Touch drag
  const onTouchStart = (e: React.TouchEvent) => {
    dragging.current = true;
    lastX.current = e.touches[0].clientX;
    velRef.current = 0;
  };
  const onTouchMove = (e: React.TouchEvent) => {
    if (!dragging.current) return;
    const dx = e.touches[0].clientX - lastX.current;
    lastX.current = e.touches[0].clientX;
    posRef.current += dx;
    velRef.current = dx / (1 / 60);
  };
  const onTouchEnd = () => { dragging.current = false; };

  return (
    <div
      className="overflow-hidden cursor-grab active:cursor-grabbing select-none"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => { setHovered(false); dragging.current = false; }}
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      <div ref={trackRef} className="flex items-center gap-1 w-max will-change-transform">
        {items.map((src, i) => {
          const sz = SIZES[(i + sizeOffset) % SIZES.length];
          return (
            <div
              key={i}
              className="shrink-0 flex items-center justify-center transition-transform duration-150 hover:scale-125 hover:z-10 relative"
              style={{ width: sz, height: sz }}
            >
              <img
                src={src}
                alt=""
                width={sz}
                height={sz}
                loading="lazy"
                decoding="async"
                draggable={false}
                className="object-contain w-full h-full pointer-events-none"
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Main export ───────────────────────────────────────────────────────────────
export function RoadSigns3DHero() {
  const { lang } = useLang();
  const kh = lang === "kh";
  const kf = kh ? { fontFamily: "Siemreap, sans-serif" } : {};

  return (
    <section className="relative w-full overflow-hidden bg-white py-10 select-none">
      {/* Edge fades */}
      <div className="absolute inset-y-0 left-0 w-16 md:w-28 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
      <div className="absolute inset-y-0 right-0 w-16 md:w-28 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />

      {/* Label */}
      <div className="relative z-10 text-center mb-5 px-4">
        <div
          className="inline-flex items-center gap-2 text-black text-[11px] font-black px-4 py-1.5 uppercase tracking-widest mb-3"
          style={{
            background: "rgba(0,0,0,0.04)",
            border: "1.5px solid rgba(0,0,0,0.18)",
            borderRadius: "999px",
            backdropFilter: "blur(12px) saturate(180%)",
            WebkitBackdropFilter: "blur(12px) saturate(180%)",
            boxShadow: "0 0 0 1px rgba(0,0,0,0.06) inset, 0 2px 16px rgba(0,0,0,0.06)",
          }}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-black opacity-60" />
          {kh ? "\u179f\u17d2\u1782\u17b6\u179b\u179f\u1789\u17d2\u1789\u17b6\u1785\u179a\u17b6\u1785\u179a \u2014 \u17a2\u17bc\u179f \u1794\u17d0\u1794\u17d0\u17b7\u1780\u17d2\u1780\u17c1\u1794\u17d0\u1794\u17d0\u17b7\u1780\u17d2\u1780\u17c1" : "Know Every Sign — drag or touch"}
        </div>
        <h2 className="text-3xl md:text-4xl font-black text-black" style={kf}>
          {kh ? "វីថីសុវត្ថិភាព" : "The Way of Safety"}
        </h2>
      </div>

      {/* 4 rows — alternating direction, different speeds, size offsets */}
      <div className="relative z-10 flex flex-col gap-1">
        <DragRow signs={ROW1} speed={80}  reverse={false} sizeOffset={0} />
        <DragRow signs={ROW2} speed={60}  reverse={true}  sizeOffset={7} />
        <DragRow signs={ROW3} speed={100} reverse={false} sizeOffset={3} />
        <DragRow signs={ROW4} speed={70}  reverse={true}  sizeOffset={11} />
      </div>

      {/* Hint */}
      <p className="relative z-10 text-center text-[10px] font-bold text-zinc-400 uppercase tracking-widest mt-4" style={kf}>
        {kh ? "អូស ឬប៉ះ ដើម្បីរំកិល" : "Drag or swipe to scroll"}
      </p>
    </section>
  );
}
