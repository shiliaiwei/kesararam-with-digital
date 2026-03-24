"use client";

import { Marquee } from "@/components/ui/marquee";
import { useLang } from "@/context/lang-context";
import { useEffect, useState } from "react";

function SignCard({ src, index, scale }: { src: string; index: number; scale: number }) {
  return (
    <div
      className="relative shrink-0 cursor-pointer transition-all duration-300 hover:scale-110"
      style={{
        width: `${80 * scale}px`,
        height: `${80 * scale}px`,
      }}
    >
      <img
        src={src}
        alt={`Road sign ${index + 1}`}
        className="w-full h-full object-contain"
        loading="lazy"
      />
    </div>
  );
}

export function RoadSigns3DHero() {
  const { lang } = useLang();
  const kh = lang === "kh";
  const khFont = kh ? { fontFamily: "Siemreap, sans-serif" } : {};
  
  const [roadSigns, setRoadSigns] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch images from Cloudinary Slide folder
    fetch("/api/cloudinary/slide-images")
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        console.log("Slide images response:", data);
        if (data.images && data.images.length > 0) {
          setRoadSigns(data.images);
        } else {
          console.warn("No images returned from API");
        }
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error loading slide images:", error);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <section className="relative w-full overflow-hidden bg-transparent pt-4 pb-24 mb-8">
        <div className="text-center mb-6 px-4">
          <h2 
            className="inline-block text-2xl md:text-3xl font-black text-black bg-yellow-400 px-6 py-3 border-2 border-black shadow-[6px_6px_0_#000]" 
            style={khFont}
          >
            {kh ? "វីថីសុវត្ថិភាព" : "The Way of Safety"}
          </h2>
        </div>
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-black border-t-yellow-400 mx-auto mb-4"></div>
            <p className="text-sm font-bold text-zinc-600">Loading signs...</p>
          </div>
        </div>
      </section>
    );
  }

  if (roadSigns.length === 0) {
    return (
      <section className="relative w-full overflow-hidden bg-transparent pt-4 pb-24 mb-8">
        <div className="text-center mb-6 px-4">
          <h2 
            className="inline-block text-2xl md:text-3xl font-black text-black bg-yellow-400 px-6 py-3 border-2 border-black shadow-[6px_6px_0_#000]" 
            style={khFont}
          >
            {kh ? "វីថីសុវត្ថិភាព" : "The Way of Safety"}
          </h2>
        </div>
        <div className="text-center py-20">
          <p className="text-sm font-bold text-zinc-600">No signs available</p>
        </div>
      </section>
    );
  }

  // Split into rows
  const row1 = roadSigns.slice(0, Math.ceil(roadSigns.length / 4));
  const row2 = roadSigns.slice(Math.ceil(roadSigns.length / 4), Math.ceil(roadSigns.length / 2));
  const row3 = roadSigns.slice(Math.ceil(roadSigns.length / 2), Math.ceil(roadSigns.length * 3 / 4));
  const row4 = roadSigns.slice(Math.ceil(roadSigns.length * 3 / 4));

  return (
    <section className="relative w-full overflow-hidden bg-transparent pt-4 pb-24 mb-8">
      {/* Header */}
      <div className="text-center mb-6 px-4">
        <h2 
          className="inline-block text-2xl md:text-3xl font-black text-black bg-yellow-400 px-6 py-3 border-2 border-black shadow-[6px_6px_0_#000] transform hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[8px_8px_0_#000] transition-all" 
          style={khFont}
        >
          {kh ? "វីថីសុវត្ថិភាព" : "The Way of Safety"}
        </h2>
      </div>

      {/* Marquee rows with 3D perspective - smaller at top, bigger at bottom */}
      <div className="relative w-full space-y-6 overflow-visible py-4">
        {/* Row 1 - Smallest (far away) */}
        <div className="overflow-hidden">
          <Marquee className="[--duration:120s] [--gap:1rem]" pauseOnHover>
            {row1.map((src, i) => (
              <SignCard key={`r1-${i}`} src={src} index={i} scale={0.8} />
            ))}
          </Marquee>
        </div>

        {/* Row 2 - Medium-small */}
        <div className="overflow-hidden">
          <Marquee className="[--duration:100s] [--gap:1.2rem]" reverse pauseOnHover>
            {row2.map((src, i) => (
              <SignCard key={`r2-${i}`} src={src} index={i + row1.length} scale={1.0} />
            ))}
          </Marquee>
        </div>

        {/* Row 3 - Medium-large */}
        <div className="overflow-hidden">
          <Marquee className="[--duration:90s] [--gap:1.4rem]" pauseOnHover>
            {row3.map((src, i) => (
              <SignCard key={`r3-${i}`} src={src} index={i + row1.length + row2.length} scale={1.2} />
            ))}
          </Marquee>
        </div>

        {/* Row 4 - Largest (closest) */}
        <div className="overflow-hidden">
          <Marquee className="[--duration:80s] [--gap:1.6rem]" reverse pauseOnHover>
            {row4.map((src, i) => (
              <SignCard key={`r4-${i}`} src={src} index={i + row1.length + row2.length + row3.length} scale={1.4} />
            ))}
          </Marquee>
        </div>
      </div>
    </section>
  );
}
