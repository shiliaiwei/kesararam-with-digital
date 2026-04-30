"use client";

import { useEffect, useRef, useState } from "react";
import { AlertTriangle, Navigation, RefreshCw, Layers } from "lucide-react";

interface MapboxTrafficMapProps {
  lat?: number;
  lon?: number;
  zoom?: number;
}

export function MapboxTrafficMap({
  lat = 13.41013,
  lon = 103.94728,
  zoom = 12,
}: MapboxTrafficMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mapStyle, setMapStyle] = useState<"streets" | "satellite">("streets");

  useEffect(() => {
    if (!mapContainerRef.current) return;

    let map: any;

    const initMap = async () => {
      try {
        // Dynamically import mapbox-gl to avoid SSR issues
        const mapboxgl = (await import("mapbox-gl")).default;

        // Import CSS
        await import("mapbox-gl/dist/mapbox-gl.css");

        mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN!;

        map = new mapboxgl.Map({
          container: mapContainerRef.current!,
          style: "mapbox://styles/mapbox/streets-v12",
          center: [lon, lat],
          zoom: zoom,
          attributionControl: false,
        });

        // Store ref for style switching
        mapRef.current = map;

        map.on("load", () => {
          // ── Traffic congestion layer ──────────────────────────────
          map.addSource("mapbox-traffic", {
            type: "vector",
            url: "mapbox://mapbox.mapbox-traffic-v1",
          });

          // Traffic congestion fill (colored roads)
          map.addLayer({
            id: "traffic-congestion",
            type: "line",
            source: "mapbox-traffic",
            "source-layer": "traffic",
            paint: {
              "line-width": [
                "interpolate",
                ["linear"],
                ["zoom"],
                10, 2,
                14, 5,
                18, 8,
              ],
              "line-color": [
                "match",
                ["get", "congestion"],
                "low",    "#22c55e",   // green  – smooth
                "moderate", "#eab308", // yellow – moderate
                "heavy",  "#ef4444",   // red    – heavy
                "severe", "#7f1d1d",   // dark   – stopped
                "#94a3b8",             // default gray
              ],
              "line-opacity": 0.85,
            },
          });

          // ── Marker for Phnom Penh ─────────────────────────────────
          const el = document.createElement("div");
          el.className = "mapbox-marker";
          el.style.cssText = `
            width: 20px;
            height: 20px;
            background: #ef4444;
            border: 3px solid #fff;
            border-radius: 50%;
            box-shadow: 0 2px 8px rgba(0,0,0,0.4);
            cursor: pointer;
          `;

          new mapboxgl.Marker({ element: el })
            .setLngLat([lon, lat])
            .setPopup(
              new mapboxgl.Popup({ offset: 25 }).setHTML(
                `<div style="font-family:sans-serif;font-size:13px;font-weight:700;padding:4px 8px;">
                  📍 Phnom Penh, Cambodia
                </div>`
              )
            )
            .addTo(map);

          // ── Attribution ───────────────────────────────────────────
          map.addControl(
            new mapboxgl.AttributionControl({ compact: true }),
            "bottom-right"
          );

          // ── Navigation controls ───────────────────────────────────
          map.addControl(new mapboxgl.NavigationControl(), "top-right");

          // ── Fullscreen ────────────────────────────────────────────
          map.addControl(new mapboxgl.FullscreenControl(), "top-right");

          setMapLoaded(true);
        });

        map.on("error", (e: any) => {
          console.error("Mapbox error:", e);
          setError("Map failed to load. Check your access token.");
          setMapLoaded(true);
        });
      } catch (err) {
        console.error("Mapbox init error:", err);
        setError("Failed to initialize map.");
        setMapLoaded(true);
      }
    };

    initMap();

    return () => {
      if (map) map.remove();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Switch between streets and satellite style
  const toggleStyle = () => {
    if (!mapRef.current) return;
    const next = mapStyle === "streets" ? "satellite" : "streets";
    setMapStyle(next);
    const styleUrl =
      next === "streets"
        ? "mapbox://styles/mapbox/streets-v12"
        : "mapbox://styles/mapbox/satellite-streets-v12";
    mapRef.current.setStyle(styleUrl);

    // Re-add traffic layer after style change
    mapRef.current.once("style.load", () => {
      const map = mapRef.current;
      if (!map.getSource("mapbox-traffic")) {
        map.addSource("mapbox-traffic", {
          type: "vector",
          url: "mapbox://mapbox.mapbox-traffic-v1",
        });
      }
      if (!map.getLayer("traffic-congestion")) {
        map.addLayer({
          id: "traffic-congestion",
          type: "line",
          source: "mapbox-traffic",
          "source-layer": "traffic",
          paint: {
            "line-width": [
              "interpolate", ["linear"], ["zoom"],
              10, 2, 14, 5, 18, 8,
            ],
            "line-color": [
              "match", ["get", "congestion"],
              "low",      "#22c55e",
              "moderate", "#eab308",
              "heavy",    "#ef4444",
              "severe",   "#7f1d1d",
              "#94a3b8",
            ],
            "line-opacity": 0.85,
          },
        });
      }
    });
  };

  const handleRetry = () => {
    setError(null);
    setMapLoaded(false);
    window.location.reload();
  };

  return (
    <div className="bg-white border-4 border-black shadow-[8px_8px_0_#000] overflow-hidden">
      {/* ── Header ─────────────────────────────────────────────────── */}
      <div className="bg-red-500 border-b-4 border-black px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white border-2 border-black flex items-center justify-center">
            <Navigation size={20} className="text-red-500" />
          </div>
          <div>
            <h3 className="text-xl font-black text-white">Live Traffic Map</h3>
            <p className="text-xs font-bold text-white/90">
              Real-time road conditions · Powered by Mapbox
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Style toggle */}
          {mapLoaded && !error && (
            <button
              onClick={toggleStyle}
              className="flex items-center gap-1.5 bg-white border-2 border-black px-3 py-1.5 text-xs font-black hover:bg-yellow-400 transition-colors"
            >
              <Layers size={14} />
              {mapStyle === "streets" ? "Satellite" : "Streets"}
            </button>
          )}

          {/* Live badge */}
          <div className="flex items-center gap-2 bg-white border-2 border-black px-3 py-1.5">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            <span className="text-xs font-black uppercase">Live</span>
          </div>
        </div>
      </div>

      {/* ── Map Container ──────────────────────────────────────────── */}
      <div className="relative w-full" style={{ height: "500px" }}>
        {/* Mapbox renders into this div */}
        <div ref={mapContainerRef} className="absolute inset-0" />

        {/* Loading overlay */}
        {!mapLoaded && !error && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-10">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-black border-t-red-500 rounded-full animate-spin mx-auto mb-4" />
              <p className="text-sm font-bold text-gray-600">Loading traffic data...</p>
              <p className="text-xs text-gray-400 mt-1">Powered by Mapbox GL</p>
            </div>
          </div>
        )}

        {/* Error overlay */}
        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-red-50 z-10">
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-red-500 border-2 border-black rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle size={32} className="text-white" />
              </div>
              <p className="text-lg font-black text-red-900 mb-2">Map Failed to Load</p>
              <p className="text-sm text-red-700 mb-4">{error}</p>
              <button
                onClick={handleRetry}
                className="bg-red-500 text-white border-2 border-black px-6 py-2 font-black hover:shadow-[4px_4px_0_#000] transition-all inline-flex items-center gap-2"
              >
                <RefreshCw size={16} />
                Retry
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Footer / Legend ────────────────────────────────────────── */}
      <div className="bg-yellow-400 border-t-4 border-black px-6 py-4">
        <div className="flex items-start gap-3 mb-3">
          <AlertTriangle size={20} className="shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-black mb-0.5">Stay Safe on the Road</p>
            <p className="text-xs font-medium text-black/80">
              Real-time traffic conditions for Phnom Penh and surrounding areas.
            </p>
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-5 flex-wrap">
          {[
            { color: "bg-green-500",  label: "Smooth" },
            { color: "bg-yellow-500", label: "Moderate" },
            { color: "bg-red-500",    label: "Heavy" },
            { color: "bg-red-900",    label: "Stopped" },
          ].map(({ color, label }) => (
            <div key={label} className="flex items-center gap-2">
              <div className={`w-5 h-1.5 ${color} border border-black`} />
              <span className="text-xs font-bold">{label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
