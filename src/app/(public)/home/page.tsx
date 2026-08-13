"use client";

import { useEffect, useRef, useState } from "react";
import { RoadSigns3DHero } from "@/components/hero/road-signs-3d-hero";
import { SponsorsMarquee } from "@/components/sections/sponsors-marquee";
import { CategoryGrid } from "@/components/categories/category-grid";
import { AwardsSection } from "@/components/sections/awards-section";
import { MentionsTestimonialsSection } from "@/components/sections/mentions-testimonials-section";
import { EventPhotosSection } from "@/components/sections/event-photos-section";
import { RegionalPitchSection } from "@/components/sections/regional-pitch-section";
import dynamic from "next/dynamic";
import { Users, LayoutGrid, FileQuestion, Radio } from "lucide-react";

const MapboxTrafficMap = dynamic(
  () => import("@/components/maps/mapbox-traffic-map").then((mod) => mod.MapboxTrafficMap),
  { ssr: false, loading: () => <div className="h-[300px] w-full flex items-center justify-center bg-gray-100 border-4 border-black">Loading map...</div> }
);
import { useLang } from "@/context/lang-context";
import { t } from "@/lib/translations";

/* ── animated count-up number ── */
function useCountUp(target: number, run: boolean, duration = 1200) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!run) return;
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3); // easeOutCubic
      setVal(Math.round(target * eased));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, run, duration]);
  return val;
}

interface Stats { students: number; categories: number; questions: number; sessions: number; }

function StatCard({
  icon: Icon, value, suffix, label, color, run, khFont,
}: {
  icon: typeof Users; value: number; suffix: string; label: string; color: string; run: boolean; khFont: React.CSSProperties;
}) {
  const n = useCountUp(value, run);
  return (
    <div className="bg-white border-2 border-black p-5 shadow-[4px_4px_0_#000] flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-3xl sm:text-4xl font-black tabular-nums" style={{ color }}>
          {n.toLocaleString()}{suffix}
        </span>
        <span className="w-9 h-9 border-2 border-black flex items-center justify-center" style={{ background: color }}>
          <Icon size={18} className="text-white" strokeWidth={2.5} />
        </span>
      </div>
      <span className="text-xs font-bold uppercase tracking-wide text-zinc-600" style={khFont}>{label}</span>
    </div>
  );
}

export default function HomePage() {
  const { lang } = useLang();
  const tr = t[lang].home;
  const kh = lang === "kh";
  const khFont = kh ? { fontFamily: "var(--font-system)" } : {};

  const [stats, setStats] = useState<Stats | null>(null);
  const [inView, setInView] = useState(false);
  const statsRef = useRef<HTMLDivElement>(null);

  // fetch real metrics
  useEffect(() => {
    fetch("/api/public/stats")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => { if (d) setStats(d); })
      .catch(() => { });
  }, []);

  // trigger count-up when scrolled into view
  useEffect(() => {
    const el = statsRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setInView(true); obs.disconnect(); } }, { threshold: 0.3 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const s = stats ?? { students: 0, categories: 8, questions: 0, sessions: 0 };

  return (
    <>
      {/* Hero: 3D animated road signs marquee */}
      <RoadSigns3DHero />

      {/* SECTION 1: About Cham AWARDS - National Champion Junior Division Technovation Girls Cambodia 2026 */}
      <AwardsSection />

      {/* Category Grid */}
      <CategoryGrid />

      {/* Real-data stats */}
      <section ref={statsRef} className="grid-bg py-14 border-b-2 border-black">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-5">
            <StatCard icon={Users} value={s.students} suffix="+" label={tr.statStudents} color="#ca8a04" run={inView} khFont={khFont} />
            <StatCard icon={LayoutGrid} value={s.categories} suffix="" label={tr.statAreas} color="#0891b2" run={inView} khFont={khFont} />
            <StatCard icon={FileQuestion} value={s.questions} suffix="+" label={tr.statQuestions} color="#16a34a" run={inView} khFont={khFont} />
            <StatCard icon={Radio} value={s.sessions} suffix="+" label={tr.statLive} color="#dc2626" run={inView} khFont={khFont} />
          </div>
        </div>
      </section>

      {/* As Mentioned In & What People Say — Infinite Marquee Mentions & Testimonials */}
      <MentionsTestimonialsSection />

      {/* Event Photos Gallery */}
      <EventPhotosSection />

      {/* Regional Pitch Event Section */}
      <RegionalPitchSection />

      {/* Live Traffic Map — compact */}
      <section className="bg-white py-14 border-b-2 border-black">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex items-center justify-between gap-4 mb-5 flex-wrap">
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center gap-1.5 bg-red-500 text-white text-[10px] font-black tracking-widest uppercase px-2.5 py-1">
                <Radio size={12} /> {kh ? "ផ្ទាល់" : "Live"}
              </span>
              <h2 className="text-xl sm:text-2xl font-black" style={khFont}>
                {kh ? "ស្ថានភាពចរាចរណ៍ពេលនេះ" : "Real-Time Road Safety"}
              </h2>
            </div>
            <p className="text-xs text-zinc-500 max-w-xs" style={khFont}>
              {kh ? "ស្ថានភាពចរាចរណ៍ផ្ទាល់ និងការព្រមានផ្លូវ" : "Live traffic conditions & road alerts"}
            </p>
          </div>
          <MapboxTrafficMap lat={11.5564} lon={104.9282} zoom={13} />
        </div>
      </section>

      {/* Sponsors / Trust section */}
      <SponsorsMarquee />
    </>
  );
}
