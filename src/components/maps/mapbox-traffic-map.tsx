"use client";

import { useEffect, useRef, useState } from "react";
import { AlertTriangle, Navigation, RefreshCw, Layers, ShieldAlert, Car, TriangleAlert, Info } from "lucide-react";

interface MapboxTrafficMapProps {
  lat?: number;
  lon?: number;
  zoom?: number;
}

// ── Static road safety alerts for Cambodia ──────────────────────────────────
const ROAD_ALERTS = [
  {
    id: 1,
    type: "accident",
    icon: Car,
    color: "bg-red-500",
    textColor: "text-red-700",
    bgColor: "bg-red-50 border-red-300",
    title: "Accident Risk Zone",
    desc: "National Road 6 — High accident frequency near Skun intersection. Drive carefully.",
    time: "Active Alert",
  },
  {
    id: 2,
    type: "congestion",
    icon: AlertTriangle,
    color: "bg-yellow-500",
    textColor: "text-yellow-700",
    bgColor: "bg-yellow-50 border-yellow-300",
    title: "Heavy Congestion",
    desc: "Phnom Penh city center — Rush hour traffic. Expect delays on Monivong Blvd.",
    time: "Peak Hours: 7–9am, 5–7pm",
  },
  {
    id: 3,
    type: "road",
    icon: TriangleAlert,
    color: "bg-orange-500",
    textColor: "text-orange-700",
    bgColor: "bg-orange-50 border-orange-300",
    title: "Road Construction",
    desc: "National Road 4 — Lane closure near Kampong Speu. Reduce speed to 40km/h.",
    time: "Ongoing",
  },
  {
    id: 4,
    type: "safety",
    icon: ShieldAlert,
    color: "bg-blue-500",
    textColor: "text-blue-700",
    bgColor: "bg-blue-50 border-blue-300",
    title: "Safety Reminder",
    desc: "Wear seatbelts at all times. Drunk driving enforcement active on all major roads.",
    time: "Always Active",
  },
];

export function MapboxTrafficMap({
  lat = 11.5564,
  lon = 104.9282,
  zoom = 12,
}: MapboxTrafficMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mapStyle, setMapStyle] = useState<"streets" | "satellite">("streets");

  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapRef.current) return;

    let cancelled = false;

    const initMap = async () => {
      try {
        const mapboxgl = (await import("mapbox-gl")).default;
        if (cancelled) return;

        // Inject Mapbox CSS once
        if (!document.getElementById("mapbox-gl-css")) {
          const link = document.createElement("link");
          link.id = "mapbox-gl-css";
          link.rel = "stylesheet";
          link.href = "https://api.mapbox.com/mapbox-gl-js/v3.3.0/mapbox-gl.css";
          document.head.appendChild(link);
        }

        mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN!;

        const map = new mapboxgl.Map({
          container: mapContainerRef.current!,
          style: "mapbox://styles/mapbox/streets-v12",
          center: [lon, lat],
          zoom,
          attributionControl: false,
          trackResize: true,
        });

        mapRef.current = map;

        map.on("load", () => {
          if (cancelled) return;

          // Traffic layer
          map.addSource("mapbox-traffic", {
            type: "vector",
            url: "mapbox://mapbox.mapbox-traffic-v1",
          });

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
              "line-opacity": 0.9,
            },
          });

          // Controls only — NO marker/pin
          map.addControl(new mapboxgl.NavigationControl(), "top-right");
          map.addControl(new mapboxgl.FullscreenControl(), "top-right");
          map.addControl(
            new mapboxgl.AttributionControl({ compact: true }),
            "bottom-right"
          );

          map.resize();
          setMapLoaded(true);
        });

        map.on("error", (e: any) => {
          if (cancelled) return;
          console.error("Mapbox error:", e);
          setError("Map failed to load. Please check your access token.");
          setMapLoaded(true);
        });

      } catch (err) {
        if (cancelled) return;
        console.error("Mapbox init error:", err);
        setError("Failed to initialize map.");
        setMapLoaded(true);
      }
    };

    initMap();

    return () => {
      cancelled = true;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const addTrafficLayer = (map: any) => {
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
          "line-opacity": 0.9,
        },
      });
    }
  };

  const toggleStyle = () => {
    if (!mapRef.current) return;
    const next = mapStyle === "streets" ? "satellite" : "streets";
    setMapStyle(next);
    mapRef.current.setStyle(
      next === "streets"
        ? "mapbox://styles/mapbox/streets-v12"
        : "mapbox://styles/mapbox/satellite-streets-v12"
    );
    mapRef.current.once("style.load", () => addTrafficLayer(mapRef.current));
  };

  return (
    <div className="bg-white border-4 border-black shadow-[8px_8px_0_#000] overflow-hidden">

      {/* ── Header ─────────────────────────────────────────────────── */}
      <div className="bg-red-500 border-b-4 border-black px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white border-2 border-black flex items-center justify-center shrink-0">
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
          {mapLoaded && !error && (
            <button
              onClick={toggleStyle}
              className="flex items-center gap-1.5 bg-white border-2 border-black px-3 py-1.5 text-xs font-black hover:bg-yellow-400 transition-colors"
            >
              <Layers size={14} />
              {mapStyle === "streets" ? "Satellite" : "Streets"}
            </button>
          )}
          <div className="flex items-center gap-2 bg-white border-2 border-black px-3 py-1.5">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            <span className="text-xs font-black uppercase">Live</span>
          </div>
        </div>
      </div>

      {/* ── Map ────────────────────────────────────────────────────── */}
      <div className="relative w-full" style={{ height: 480 }}>
        <div
          ref={mapContainerRef}
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
        />

        {!mapLoaded && !error && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-10 pointer-events-none">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-black border-t-red-500 rounded-full animate-spin mx-auto mb-4" />
              <p className="text-sm font-bold text-gray-600">Loading traffic data...</p>
              <p className="text-xs text-gray-400 mt-1">Powered by Mapbox GL</p>
            </div>
          </div>
        )}

        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-red-50 z-10">
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-red-500 border-2 border-black rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle size={32} className="text-white" />
              </div>
              <p className="text-lg font-black text-red-900 mb-2">Map Failed to Load</p>
              <p className="text-sm text-red-700 mb-4">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="bg-red-500 text-white border-2 border-black px-6 py-2 font-black hover:shadow-[4px_4px_0_#000] transition-all inline-flex items-center gap-2"
              >
                <RefreshCw size={16} />
                Retry
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Traffic Legend ─────────────────────────────────────────── */}
      <div className="bg-yellow-400 border-t-4 border-black px-6 py-3 flex items-center gap-6 flex-wrap">
        <div className="flex items-center gap-2">
          <Info size={16} className="shrink-0" />
          <span className="text-xs font-black uppercase">Traffic Legend:</span>
        </div>
        {[
          { color: "bg-green-500",  label: "Smooth"   },
          { color: "bg-yellow-500", label: "Moderate" },
          { color: "bg-red-500",    label: "Heavy"    },
          { color: "bg-red-900",    label: "Stopped"  },
        ].map(({ color, label }) => (
          <div key={label} className="flex items-center gap-2">
            <div className={`w-5 h-1.5 ${color} border border-black`} />
            <span className="text-xs font-bold">{label}</span>
          </div>
        ))}
      </div>

      {/* ── Road Alerts Panel ──────────────────────────────────────── */}
      <div className="border-t-4 border-black">
        {/* Alert header */}
        <div className="bg-black px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldAlert size={18} className="text-yellow-400" />
            <span className="text-sm font-black text-white uppercase tracking-widest">
              Traffic &amp; Road Safety Alerts
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse" />
            <span className="text-xs font-bold text-yellow-400 uppercase">Live Updates</span>
          </div>
        </div>

        {/* Alert cards grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-0 divide-y-2 sm:divide-y-0 sm:divide-x-0 divide-black">
          {ROAD_ALERTS.map((alert, i) => {
            const Icon = alert.icon;
            return (
              <div
                key={alert.id}
                className={`flex items-start gap-4 px-5 py-4 border-black ${
                  // add right border on left column items, bottom border on all
                  i % 2 === 0 ? "sm:border-r-2" : ""
                } ${i < 2 ? "border-b-2" : ""}`}
              >
                {/* Icon badge */}
                <div className={`w-10 h-10 ${alert.color} border-2 border-black flex items-center justify-center shrink-0`}>
                  <Icon size={18} className="text-white" />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="text-sm font-black">{alert.title}</span>
                    <span className={`text-[10px] font-black px-2 py-0.5 border border-black ${alert.color} text-white uppercase`}>
                      {alert.time}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 leading-relaxed">{alert.desc}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom safety tip */}
        <div className="bg-gray-50 border-t-2 border-black px-6 py-3 flex items-center gap-3">
          <AlertTriangle size={16} className="text-yellow-600 shrink-0" />
          <p className="text-xs text-gray-600">
            <span className="font-black text-black">Stay Alert:</span>{" "}
            Always follow traffic signs, keep safe distance, and never use your phone while driving.
          </p>
        </div>
      </div>

    </div>
  );
}
