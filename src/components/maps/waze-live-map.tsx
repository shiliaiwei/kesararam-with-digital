"use client";

import { useEffect, useRef } from "react";
import { AlertTriangle, Navigation } from "lucide-react";

interface WazeLiveMapProps {
  lat?: number;
  lon?: number;
  zoom?: number;
}

export function WazeLiveMap({ 
  lat = 13.41013, 
  lon = 103.94728, 
  zoom = 12 
}: WazeLiveMapProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Waze Live Map embed URL
  const wazeUrl = `https://embed.waze.com/iframe?zoom=${zoom}&lat=${lat}&lon=${lon}&ct=livemap`;

  return (
    <div className="bg-white border-4 border-black shadow-[8px_8px_0_#000] overflow-hidden">
      {/* Header */}
      <div className="bg-red-500 border-b-4 border-black px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white border-2 border-black flex items-center justify-center">
            <Navigation size={20} className="text-red-500" />
          </div>
          <div>
            <h3 className="text-xl font-black text-white">Live Traffic Map</h3>
            <p className="text-xs font-bold text-white/90">Real-time road safety alerts</p>
          </div>
        </div>
        <div className="flex items-center gap-2 bg-white border-2 border-black px-3 py-1.5">
          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
          <span className="text-xs font-black uppercase">Live</span>
        </div>
      </div>

      {/* Map Container */}
      <div className="relative w-full bg-gray-100" style={{ height: "500px" }}>
        <iframe
          ref={iframeRef}
          src={wazeUrl}
          className="w-full h-full border-0"
          title="Waze Live Traffic Map"
          allowFullScreen
        />
      </div>

      {/* Footer Info */}
      <div className="bg-yellow-400 border-t-4 border-black px-6 py-4">
        <div className="flex items-start gap-3">
          <AlertTriangle size={20} className="shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-black mb-1">Stay Safe on the Road</p>
            <p className="text-xs font-medium text-black/80">
              View real-time traffic conditions, accidents, and road hazards reported by Waze community. 
              Plan your route safely before driving.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
