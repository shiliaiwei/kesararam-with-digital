"use client";

import { useEffect, useRef, useState } from "react";
import { AlertTriangle, Navigation, RefreshCw, Layers, ShieldAlert, Car, TriangleAlert, Info } from "lucide-react";
import { useLang } from "@/context/lang-context";

interface MapboxTrafficMapProps {
  lat?: number;
  lon?: number;
  zoom?: number;
}

// ── Bilingual road safety alerts ─────────────────────────────────────────────
const ROAD_ALERTS = [
  {
    id: 1,
    type: "accident",
    icon: Car,
    color: "bg-red-500",
    title: { en: "Accident Risk Zone", km: "តំបន់ប្រថុយប្រថាន" },
    badge: { en: "Active Alert", km: "ការព្រមានសកម្ម" },
    desc: {
      en: "National Road 6 — High accident frequency near Skun intersection. Drive carefully.",
      km: "ផ្លូវជាតិលេខ ៦ — ចំនួនគ្រោះថ្នាក់ខ្ពស់នៅជិតផ្លូវប្រសព្វស្គូន។ បើកបរដោយប្រុងប្រយ័ត្ន។",
    },
  },
  {
    id: 2,
    type: "congestion",
    icon: AlertTriangle,
    color: "bg-yellow-500",
    title: { en: "Heavy Congestion", km: "ការស្ទះចរាចរណ៍ធ្ងន់" },
    badge: { en: "Peak Hours: 7–9am, 5–7pm", km: "ម៉ោងមមាញឹក: ៧–៩ព្រឹក, ៥–៧ល្ងាច" },
    desc: {
      en: "Phnom Penh city center — Rush hour traffic. Expect delays on Monivong Blvd.",
      km: "មជ្ឈមណ្ឌលក្រុងភ្នំពេញ — ចរាចរណ៍ម៉ោងមមាញឹក។ រំពឹងការពន្យារពេលនៅផ្លូវវ៉ានីវ៉ុង។",
    },
  },
  {
    id: 3,
    type: "road",
    icon: TriangleAlert,
    color: "bg-orange-500",
    title: { en: "Road Construction", km: "ការសាងសង់ផ្លូវវិថី" },
    badge: { en: "Ongoing", km: "កំពុងដំណើរការ" },
    desc: {
      en: "National Road 4 — Lane closure near Kampong Speu. Reduce speed to 40km/h.",
      km: "ផ្លូវជាតិលេខ ៤ — បិទផ្លូវជិតកំពង់ស្ពឺ។ កាត់បន្ថយល្បឿនដល់ ៤០គ.ម/ម.",
    },
  },
  {
    id: 4,
    type: "safety",
    icon: ShieldAlert,
    color: "bg-blue-500",
    title: { en: "Safety Reminder", km: "ការរំលឹកសុវត្ថិភាព" },
    badge: { en: "Always Active", km: "សកម្មជានិច្ច" },
    desc: {
      en: "Wear seatbelts at all times. Drunk driving enforcement active on all major roads.",
      km: "ពាក់ខ្សែក្រវ៉ាត់សុវត្ថិភាពជានិច្ច។ ការអនុវត្តការបើកបរស្រវឹងសកម្មនៅគ្រប់ផ្លូវវិថីធំ។",
    },
  },
  {
    id: 5,
    type: "speed",
    icon: TriangleAlert,
    color: "bg-purple-500",
    title: { en: "Speed Camera Zone", km: "តំបន់កាមេរ៉ាល្បឿន" },
    badge: { en: "Enforced", km: "អនុវត្ត" },
    desc: {
      en: "National Road 1 — Speed cameras active between Phnom Penh and Neak Loeung.",
      km: "ផ្លូវជាតិលេខ ១ — កាមេរ៉ាល្បឿនសកម្មរវាងភ្នំពេញ និងនាគឡើង។",
    },
  },
  {
    id: 6,
    type: "flood",
    icon: AlertTriangle,
    color: "bg-cyan-600",
    title: { en: "Flood Risk Road", km: "ផ្លូវវិថីប្រថុយទឹកជំនន់" },
    badge: { en: "Seasonal Warning", km: "ការព្រមានតាមរដូវ" },
    desc: {
      en: "Mekong riverside roads — Flooding possible during rainy season. Check before travel.",
      km: "ផ្លូវវិថីតាមដងទន្លេមេគង្គ — ទឹកជំនន់អាចកើតមានក្នុងរដូវវស្សា។ ពិនិត្យមុនធ្វើដំណើរ។",
    },
  },
  {
    id: 7,
    type: "night",
    icon: ShieldAlert,
    color: "bg-zinc-700",
    title: { en: "Night Driving Alert", km: "ការព្រមានបើកបរពេលយប់" },
    badge: { en: "8pm – 5am", km: "ម៉ោង ៨យប់ – ៥ព្រឹក" },
    desc: {
      en: "Reduced visibility on rural roads at night. Use headlights and reduce speed.",
      km: "ការមើលឃើញថយចុះនៅផ្លូវវិថីជនបទពេលយប់។ ប្រើភ្លើងមុខ និងកាត់បន្ថយល្បឿន។",
    },
  },
  {
    id: 8,
    type: "checkpoint",
    icon: Car,
    color: "bg-green-600",
    title: { en: "Police Checkpoint", km: "ចំណុចត្រួតពិនិត្យប៉ូលិស" },
    badge: { en: "Active", km: "សកម្ម" },
    desc: {
      en: "National Road 5 — Document and vehicle inspection checkpoint near Prek Pnov.",
      km: "ផ្លូវជាតិលេខ ៥ — ចំណុចត្រួតពិនិត្យឯកសារ និងយានយន្តជិតព្រែកព្នៅ។",
    },
  },
];

const UI = {
  en: {
    header: "Live Traffic Map",
    subheader: "Real-time road conditions · Powered by Mapbox",
    live: "Live",
    satellite: "Satellite",
    streets: "Streets",
    legend: "Traffic Legend:",
    smooth: "Smooth",
    moderate: "Moderate",
    heavy: "Heavy",
    stopped: "Stopped",
    alertsTitle: "Traffic & Road Safety Alerts",
    liveUpdates: "Live Updates",
    stayAlert: "Stay Alert:",
    stayAlertMsg: "Always follow traffic signs, keep safe distance, and never use your phone while driving.",
    loading: "Loading traffic data...",
    loadingPowered: "Powered by Mapbox GL",
    mapFailed: "Map Failed to Load",
    retry: "Retry",
  },
  km: {
    header: "ផែនទីចរាចរណ៍ផ្ទាល់",
    subheader: "ស្ថានភាពផ្លូវវិថីពេលវេលាជាក់ស្ដែង · ដំណើរការដោយ Mapbox",
    live: "ផ្ទាល់",
    satellite: "រូបភាពផ្កាយរណប",
    streets: "ផ្លូវវិថី",
    legend: "សញ្ញា:",
    smooth: "រលូន",
    moderate: "មធ្យម",
    heavy: "ធ្ងន់",
    stopped: "ឈប់",
    alertsTitle: "ការព្រមានចរាចរណ៍",
    liveUpdates: "ផ្ទាល់",
    stayAlert: "ប្រុងប្រយ័ត្ន:",
    stayAlertMsg: "តែងតែអនុវត្តតាមសញ្ញាចរាចរណ៍ រក្សាចម្ងាយសុវត្ថិភាព និងកុំប្រើទូរស័ព្ទពេលបើកបរ។",
    loading: "កំពុងផ្ទុក...",
    loadingPowered: "ដំណើរការដោយ Mapbox GL",
    mapFailed: "ផែនទីបរាជ័យ",
    retry: "ព្យាយាមម្ដងទៀត",
  },
} as const;

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
  const { lang } = useLang();
  const isKh = lang === "kh";
  const kf = isKh ? { fontFamily: "Siemreap, sans-serif" } : {};
  const t = isKh ? UI.km : UI.en;

  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapRef.current) return;

    let cancelled = false;

    const initMap = async () => {
      try {
        const mapboxgl = (await import("mapbox-gl")).default;
        if (cancelled) return;

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
              "line-width": ["interpolate", ["linear"], ["zoom"], 10, 2, 14, 5, 18, 8],
              "line-color": [
                "match", ["get", "congestion"],
                "low", "#22c55e",
                "moderate", "#eab308",
                "heavy", "#ef4444",
                "severe", "#7f1d1d",
                "#94a3b8",
              ],
              "line-opacity": 0.9,
            },
          });
          map.addControl(new mapboxgl.NavigationControl(), "top-right");
          map.addControl(new mapboxgl.FullscreenControl(), "top-right");
          map.addControl(new mapboxgl.AttributionControl({ compact: true }), "bottom-right");
          requestAnimationFrame(() => {
            if (mapRef.current) map.resize();
          });
          setMapLoaded(true);
        });

        map.on("error", (e: any) => {
          if (cancelled) return;
          console.error("Mapbox error:", e);
          setError("Map failed to load.");
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
      if (mapRef.current) { mapRef.current.remove(); mapRef.current = null; }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const addTrafficLayer = (map: any) => {
    if (!map.getSource("mapbox-traffic")) {
      map.addSource("mapbox-traffic", { type: "vector", url: "mapbox://mapbox.mapbox-traffic-v1" });
    }
    if (!map.getLayer("traffic-congestion")) {
      map.addLayer({
        id: "traffic-congestion", type: "line", source: "mapbox-traffic", "source-layer": "traffic",
        paint: {
          "line-width": ["interpolate", ["linear"], ["zoom"], 10, 2, 14, 5, 18, 8],
          "line-color": ["match", ["get", "congestion"], "low", "#22c55e", "moderate", "#eab308", "heavy", "#ef4444", "severe", "#7f1d1d", "#94a3b8"],
          "line-opacity": 0.9,
        },
      });
    }
  };

  const toggleStyle = () => {
    if (!mapRef.current) return;
    const next = mapStyle === "streets" ? "satellite" : "streets";
    setMapStyle(next);
    mapRef.current.setStyle(next === "streets" ? "mapbox://styles/mapbox/streets-v12" : "mapbox://styles/mapbox/satellite-streets-v12");
    mapRef.current.once("style.load", () => addTrafficLayer(mapRef.current));
  };

  return (
    <div className="bg-white border-2 sm:border-4 border-black shadow-[4px_4px_0_#000] sm:shadow-[8px_8px_0_#000] overflow-hidden">

      {/* ── Header ─────────────────────────────────────────────────── */}
      <div className="bg-red-500 border-b-2 sm:border-b-4 border-black px-3 sm:px-6 py-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white border-2 border-black flex items-center justify-center shrink-0">
            <Navigation size={16} className="text-red-500 sm:hidden" />
            <Navigation size={20} className="text-red-500 hidden sm:block" />
          </div>
          <div className="min-w-0">
            <h3 className="text-sm sm:text-xl font-black text-white leading-tight truncate" style={kf}>{t.header}</h3>
            <p className="text-[10px] sm:text-xs font-bold text-white/80 leading-tight hidden sm:block" style={kf}>{t.subheader}</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {mapLoaded && !error && (
            <button
              onClick={toggleStyle}
              aria-label="Toggle map style"
              className="flex items-center gap-1 sm:gap-1.5 bg-white border-2 border-black px-2 sm:px-3 py-1 sm:py-1.5 text-[10px] sm:text-xs font-black hover:bg-yellow-400 transition-colors"
              style={kf}
            >
              <Layers size={12} className="sm:hidden" />
              <Layers size={14} className="hidden sm:block" />
              <span className="hidden xs:inline">{mapStyle === "streets" ? t.satellite : t.streets}</span>
            </button>
          )}
          <div className="flex items-center gap-1.5 bg-white border-2 border-black px-2 sm:px-3 py-1 sm:py-1.5">
            <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-red-500 rounded-full animate-pulse" />
            <span className="text-[10px] sm:text-xs font-black uppercase" style={kf}>{t.live}</span>
          </div>
        </div>
      </div>

      {/* ── Map ────────────────────────────────────────────────────── */}
      <div className="relative w-full" style={{ height: "clamp(220px, 45vw, 480px)" }}>
        <div ref={mapContainerRef} style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} />

        {!mapLoaded && !error && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-10 pointer-events-none">
            <div className="text-center px-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 border-4 border-black border-t-red-500 rounded-full animate-spin mx-auto mb-3" />
              <p className="text-xs sm:text-sm font-bold text-gray-600" style={kf}>{t.loading}</p>
              <p className="text-[10px] sm:text-xs text-gray-400 mt-1">{t.loadingPowered}</p>
            </div>
          </div>
        )}

        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-red-50 z-10 p-4">
            <div className="text-center">
              <div className="w-12 h-12 bg-red-500 border-2 border-black rounded-full flex items-center justify-center mx-auto mb-3">
                <AlertTriangle size={24} className="text-white" />
              </div>
              <p className="text-base font-black text-red-900 mb-1" style={kf}>{t.mapFailed}</p>
              <p className="text-xs text-red-700 mb-3">{error}</p>
              <button
                onClick={() => window.location.reload()}
                aria-label="Retry loading map"
                className="bg-red-500 text-white border-2 border-black px-4 py-2 font-black hover:shadow-[4px_4px_0_#000] transition-all inline-flex items-center gap-2 text-sm"
                style={kf}
              >
                <RefreshCw size={14} />
                {t.retry}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Traffic Legend ─────────────────────────────────────────── */}
      <div className="bg-yellow-400 border-t-2 sm:border-t-4 border-black px-3 sm:px-6 py-2 sm:py-3 flex items-center gap-2 sm:gap-6 flex-wrap">
        <div className="flex items-center gap-1.5">
          <Info size={14} className="shrink-0" />
          <span className="text-[10px] sm:text-xs font-black uppercase" style={kf}>{t.legend}</span>
        </div>
        {[
          { color: "bg-green-500", label: { en: "Smooth", km: "រលូន" } },
          { color: "bg-yellow-500", label: { en: "Moderate", km: "មធ្យម" } },
          { color: "bg-red-500", label: { en: "Heavy", km: "ធ្ងន់" } },
          { color: "bg-red-900", label: { en: "Stopped", km: "ឈប់" } },
        ].map(({ color, label }) => (
          <div key={label.en} className="flex items-center gap-1.5">
            <div className={`w-4 sm:w-5 h-1.5 ${color} border border-black`} />
            <span className="text-[10px] sm:text-xs font-bold" style={kf}>{isKh ? label.km : label.en}</span>
          </div>
        ))}
      </div>

      {/* ── Road Alerts Panel ──────────────────────────────────────── */}
      <div className="border-t-2 sm:border-t-4 border-black">

        {/* Alert header */}
        <div className="bg-black px-3 sm:px-6 py-2.5 sm:py-3 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <ShieldAlert size={16} className="text-yellow-400 shrink-0" />
            <span className="text-xs sm:text-sm font-black text-white uppercase tracking-wide truncate" style={kf}>
              {t.alertsTitle}
            </span>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <div className="w-1.5 h-1.5 bg-yellow-400 rounded-full animate-pulse" />
            <span className="text-[10px] sm:text-xs font-bold text-yellow-400 uppercase" style={kf}>{t.liveUpdates}</span>
          </div>
        </div>

        {/* Alert cards — 1 col mobile, 2 col tablet+ */}
        <div className="grid grid-cols-1 sm:grid-cols-2">
          {ROAD_ALERTS.map((alert, i) => {
            const Icon = alert.icon;
            const isRight = i % 2 === 0;
            const isBottom = i < ROAD_ALERTS.length - (ROAD_ALERTS.length % 2 === 0 ? 2 : 1);
            return (
              <div
                key={alert.id}
                className={`flex items-start gap-3 sm:gap-4 px-3 sm:px-5 py-3 sm:py-4 border-black border-b-2 ${isRight ? "sm:border-r-2" : ""} ${isBottom ? "" : "border-b-0"}`}
              >
                <div className={`w-8 h-8 sm:w-10 sm:h-10 ${alert.color} border-2 border-black flex items-center justify-center shrink-0 mt-0.5`}>
                  <Icon size={14} className="text-white sm:hidden" />
                  <Icon size={18} className="text-white hidden sm:block" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start gap-1.5 sm:gap-2 mb-1 flex-wrap">
                    <span className="text-xs sm:text-sm font-black leading-tight" style={kf}>
                      {isKh ? alert.title.km : alert.title.en}
                    </span>
                    <span className={`text-[9px] sm:text-[10px] font-black px-1.5 sm:px-2 py-0.5 border border-black ${alert.color} text-white uppercase shrink-0`} style={kf}>
                      {isKh ? alert.badge.km : alert.badge.en}
                    </span>
                  </div>
                  <p className="text-[11px] sm:text-xs text-gray-600 leading-relaxed" style={kf}>
                    {isKh ? alert.desc.km : alert.desc.en}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom safety tip */}
        <div className="bg-gray-50 border-t-2 border-black px-3 sm:px-6 py-2.5 sm:py-3 flex items-start sm:items-center gap-2 sm:gap-3">
          <AlertTriangle size={14} className="text-yellow-600 shrink-0 mt-0.5 sm:mt-0" />
          <p className="text-[11px] sm:text-xs text-gray-600 leading-relaxed" style={kf}>
            <span className="font-black text-black">{t.stayAlert}</span>{" "}
            {t.stayAlertMsg}
          </p>
        </div>
      </div>

    </div>
  );
}
