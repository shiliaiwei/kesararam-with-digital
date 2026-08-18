"use client";

import { useState } from "react";

const IMG = "https://res.cloudinary.com/dpgivqzrl/image/upload/v1774751538/team_mzuldw.jpg";

export function TeamCard() {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className="border-2 border-black shadow-[6px_6px_0_#000] overflow-hidden cursor-pointer"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Image area */}
      <div className="relative border-b-2 border-black overflow-hidden" style={{ height: 240 }}>
        {/* B&W layer */}
        <img
          src={IMG}
          alt="Team Kesararam With Digital"
          className="absolute inset-0 w-full h-full object-cover"
          style={{ filter: "grayscale(100%) contrast(1.1)" }}
        />
        {/* Color layer — fades in on hover */}
        <img
          src={IMG}
          alt=""
          aria-hidden
          className="absolute inset-0 w-full h-full object-cover transition-opacity duration-500"
          style={{ opacity: hovered ? 1 : 0 }}
        />
        {/* Overlay hint */}
        <div
          className="absolute inset-0 flex items-end p-3 transition-opacity duration-300"
          style={{ opacity: hovered ? 0 : 1, background: "linear-gradient(to top, rgba(0,0,0,0.35) 0%, transparent 60%)" }}
        >
          <span className="text-white text-[10px] font-black tracking-widest uppercase">
            Hover to reveal
          </span>
        </div>
      </div>

      {/* Caption */}
      <div
        className="p-5 transition-colors duration-300"
        style={{ backgroundColor: hovered ? "#eab308" : "#fff" }}
      >
        <p className="font-black text-sm transition-colors duration-300" style={{ color: hovered ? "#000" : "#000" }}>
          Team Kesararam With Digital
        </p>
        <p className="text-xs mt-1 transition-colors duration-300" style={{ color: hovered ? "#000" : "#71717a" }}>
          Kesararam With Digital · Technovation Girls Cambodia
        </p>
      </div>
    </div>
  );
}
