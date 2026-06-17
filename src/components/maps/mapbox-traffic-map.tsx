"use client";

import { useEffect, useRef, useState } from "react";
import {
  AlertTriangle, Navigation, RefreshCw, Layers,
  ShieldAlert, Car, TriangleAlert, Info, ChevronDown, ChevronUp,
  Plus, Minus, Locate, Maximize2, Minimize2,
} from "lucide-react";
import { useLang } from "@/context/lang-context";

interface MapboxTrafficMapProps {
  lat?: number;
  lon?: number;
  zoom?: number;
}

const ROAD_ALERTS = [
  {
    id: 1,
    type: "accident",
    icon: Car,
    color: "bg-red-500",
    borderColor: "border-l-red-500",
    title: { en: "Accident Risk Zone", km: "តំបន់គ្រោះថ្នាក់" },
    badge: { en: "Active Warning", km: "ការព្រមាន" },
    badgeColor: "bg-red-500",
    desc: {
      en: "National Road 6 — High accident frequency near Skun intersection. Drive carefully.",
      km: "ផ្លូវជាតិលេខ ៦ — ឧស្សាហ៍មានគ្រោះថ្នាក់នៅជិតផ្លូវបំបែកស្គូន។ ធ្វើដំណើរដោយប្រុងប្រយ័ត្ន។",
    },
  },
  {
    id: 2,
    type: "congestion",
    icon: AlertTriangle,
    color: "bg-yellow-500",
    borderColor: "border-l-yellow-500",
    title: { en: "Heavy Congestion", km: "ស្ទះផ្លូវខ្លាំង" },
    badge: { en: "Peak Hours: 7–9am, 5–7pm", km: "ម៉ោងមមាញឹក: ៧–៩ព្រឹក, ៥–៧ល្ងាច" },
    badgeColor: "bg-yellow-500",
    desc: {
      en: "Phnom Penh city center — Rush hour traffic. Expect delays on Monivong Blvd.",
      km: "កណ្តាលក្រុងភ្នំពេញ — ស្ទះខ្លាំងម៉ោងមមាញឹក។ អាចយឺតយ៉ាវនៅផ្លូវមុនីវង្ស។",
    },
  },
  {
    id: 3,
    type: "road",
    icon: TriangleAlert,
    color: "bg-orange-500",
    borderColor: "border-l-orange-500",
    title: { en: "Road Construction", km: "កំពុងធ្វើផ្លូវ" },
    badge: { en: "Ongoing", km: "កំពុងធ្វើ" },
    badgeColor: "bg-orange-500",
    desc: {
      en: "National Road 4 — Lane closure near Kampong Speu. Reduce speed to 40km/h.",
      km: "ផ្លូវជាតិលេខ ៤ — បិទគន្លងផ្លូវជិតកំពង់ស្ពឺ។ សូមបន្ថយល្បឿនត្រឹម ៤០គ.ម/ម៉ោង។",
    },
  },
  {
    id: 4,
    type: "safety",
    icon: ShieldAlert,
    color: "bg-blue-500",
    borderColor: "border-l-blue-500",
    title: { en: "Safety Reminder", km: "រំលឹកសុវត្ថិភាព" },
    badge: { en: "Always Active", km: "ជាប្រចាំ" },
    badgeColor: "bg-blue-500",
    desc: {
      en: "Wear seatbelts at all times. Sobriety checkpoints active on all major roads.",
      km: "ពាក់ខ្សែក្រវ៉ាត់សុវត្ថិភាពជានិច្ច។ ត្រួតពិនិត្យជាតិស្រវឹងនៅគ្រប់ផ្លូវធំ។",
    },
  },
  {
    id: 5,
    type: "speed",
    icon: TriangleAlert,
    color: "bg-purple-500",
    borderColor: "border-l-purple-500",
    title: { en: "Speed Camera Zone", km: "កាមេរ៉ាចាប់ល្បឿន" },
    badge: { en: "Enforced", km: "ចាប់ល្បឿន" },
    badgeColor: "bg-purple-500",
    desc: {
      en: "National Road 1 — Speed cameras active between Phnom Penh and Neak Loeung.",
      km: "ផ្លូវជាតិលេខ ១ — មានកាមេរ៉ាចាប់ល្បឿនចន្លោះភ្នំពេញ និងអ្នកលឿង។",
    },
  },
  {
    id: 6,
    type: "flood",
    icon: AlertTriangle,
    color: "bg-cyan-600",
    borderColor: "border-l-cyan-600",
    title: { en: "Flood Risk Road", km: "ផ្លូវងាយលិចទឹក" },
    badge: { en: "Seasonal Warning", km: "តាមរដូវ" },
    badgeColor: "bg-cyan-600",
    desc: {
      en: "Mekong riverside roads — Flooding possible during rainy season. Check before travel.",
      km: "ផ្លូវតាមមាត់ទន្លេមេគង្គ — អាចលិចទឹកនៅរដូវវស្សា។ ពិនិត្យមុនធ្វើដំណើរ។",
    },
  },
  {
    id: 7,
    type: "night",
    icon: ShieldAlert,
    color: "bg-zinc-700",
    borderColor: "border-l-zinc-700",
    title: { en: "Night Travel Alert", km: "ធ្វើដំណើរពេលយប់" },
    badge: { en: "8pm – 5am", km: "ម៉ោង ៨យប់ – ៥ព្រឹក" },
    badgeColor: "bg-zinc-700",
    desc: {
      en: "Reduced visibility on rural roads at night. Use headlights and reduce speed.",
      km: "ងងឹតពិបាកមើលផ្លូវនៅជនបទពេលយប់។ ប្រើភ្លើងនិងបន្ថយល្បឿន។",
    },
  },
  {
    id: 8,
    type: "checkpoint",
    icon: Car,
    color: "bg-green-600",
    borderColor: "border-l-green-600",
    title: { en: "Police Checkpoint", km: "ប៉ុស្តិ៍ត្រួតពិនិត្យ" },
    badge: { en: "Active", km: "មានត្រួតពិនិត្យ" },
    badgeColor: "bg-green-600",
    desc: {
      en: "National Road 5 — Document and vehicle inspection checkpoint near Prek Pnov.",
      km: "ផ្លូវជាតិលេខ ៥ — ត្រួតពិនិត្យឯកសារនិងយានយន្តនៅជិតព្រែកព្នៅ។",
    },
  },
];

const FILTER_TABS = [
  { key: "all", en: "All", km: "ទាំងអស់" },
  { key: "accident", en: "Accidents", km: "គ្រោះថ្នាក់" },
  { key: "congestion", en: "Congestion", km: "ស្ទះ" },
  { key: "road", en: "Construction", km: "ធ្វើផ្លូវ" },
  { key: "safety", en: "Safety", km: "សុវត្ថិភាព" },
  { key: "checkpoint", en: "Checkpoint", km: "ត្រួតពិនិត្យ" },
];

const UI = {
  en: {
    header: "Live Traffic Map",
    subheader: "Real-time road conditions · Powered by Mapbox",
    live: "Live",
    satellite: "Satellite",
    streets: "Streets",
    legend: "Traffic:",
    smooth: "Smooth",
    moderate: "Moderate",
    heavy: "Heavy",
    stopped: "Stopped",
    alertsTitle: "Traffic & Road Safety Alerts",
    liveUpdates: "Live Updates",
    stayAlert: "Stay Alert:",
    stayAlertMsg: "Always follow traffic signs, keep safe distance, and never use your phone while on the road.",
    loading: "Loading traffic data...",
    loadingPowered: "Powered by Mapbox GL",
    mapFailed: "Map Failed to Load",
    retry: "Retry",
    showAll: "Show all alerts",
    showLess: "Show less",
    noAlerts: "No alerts in this category",
  },
  km: {
    header: "ផែនទីចរាចរណ៍ផ្ទាល់",
    subheader: "ស្ថានភាពផ្លូវវិថីពេលវេលាជាក់ស្ដែង · ដំណើរការដោយ Mapbox",
    live: "ផ្ទាល់",
    satellite: "រូបភាពផ្កាយរណប",
    streets: "ផ្លូវវិថី",
    legend: "ចរាចរណ៍:",
    smooth: "រលូន",
    moderate: "មធ្យម",
    heavy: "ធ្ងន់",
    stopped: "ឈប់",
    alertsTitle: "ការព្រមានចរាចរណ៍",
    liveUpdates: "ផ្ទាល់",
    stayAlert: "ប្រុងប្រយ័ត្ន:",
    stayAlertMsg: "គោរពសញ្ញាចរាចរណ៍ រក្សាចម្ងាយសុវត្ថិភាព និងកុំប្រើទូរស័ព្ទពេលធ្វើដំណើរ។",
    loading: "កំពុងផ្ទុក...",
    loadingPowered: "ដំណើរការដោយ Mapbox GL",
    mapFailed: "ផែនទីបរាជ័យ",
    retry: "ព្យាយាមម្ដងទៀត",
    showAll: "បង្ហាញការព្រមានទាំងអស់",
    showLess: "បង្ហាញតិច",
    noAlerts: "គ្មានការព្រមានក្នុងប្រភេទនេះ",
  },
} as const;

const VISIBLE_DEFAULT = 4;

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
  const [activeFilter, setActiveFilter] = useState("all");
  const [expanded, setExpanded] = useState(false);
  const [isExpandedHeight, setIsExpandedHeight] = useState(false);
  const [isLegendOpen, setIsLegendOpen] = useState(false);
  const [isLocating, setIsLocating] = useState(false);

  const { lang } = useLang();
  const isKh = lang === "kh";
  const kf = isKh ? { fontFamily: "var(--font-system)" } : {};
  const t = isKh ? UI.km : UI.en;

  const filtered =
    activeFilter === "all"
      ? ROAD_ALERTS
      : ROAD_ALERTS.filter((a) => a.type === activeFilter);
  const visibleAlerts = expanded ? filtered : filtered.slice(0, VISIBLE_DEFAULT);

  // Resize map canvas on height toggle
  useEffect(() => {
    if (!mapRef.current) return;
    const interval = setInterval(() => {
      mapRef.current?.resize();
    }, 50);
    const timeout = setTimeout(() => {
      clearInterval(interval);
      mapRef.current?.resize();
    }, 350);
    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [isExpandedHeight]);

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
          cooperativeGestures: true,
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
          map.addControl(new mapboxgl.AttributionControl({ compact: true }), "bottom-right");
          requestAnimationFrame(() => { if (mapRef.current) map.resize(); });
          setMapLoaded(true);
        });
        map.on("error", (e: any) => {
          if (cancelled) return;
          const err = e?.error;
          const msg: string = err?.message || e?.message || (typeof e === "string" ? e : "");
          const status: number = err?.status ?? 0;
          const isNonFatal =
            status === 403 || status === 404 || msg === "" ||
            msg.includes("Failed to fetch") || msg.includes("tile") || msg.includes("network");
          if (isNonFatal) { console.warn("Mapbox non-fatal warning:", msg || `status=${status}`); return; }
          console.error("Mapbox fatal error:", msg, e);
          setError(msg || "Map failed to load.");
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
    mapRef.current.setStyle(
      next === "streets" ? "mapbox://styles/mapbox/streets-v12" : "mapbox://styles/mapbox/satellite-streets-v12"
    );
    mapRef.current.once("style.load", () => addTrafficLayer(mapRef.current));
  };

  const toggleHeight = () => {
    setIsExpandedHeight((prev) => !prev);
  };

  const locateUser = () => {
    if (!mapRef.current) return;
    if (!("geolocation" in navigator)) {
      alert(isKh ? "កម្មវិធីរុករករបស់អ្នកមិនគាំទ្រទីតាំងភូមិសាស្ត្រទេ" : "Geolocation is not supported by your browser.");
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { longitude, latitude } = position.coords;
        if (mapRef.current) {
          mapRef.current.flyTo({
            center: [longitude, latitude],
            zoom: 14,
            essential: true,
          });
        }
        setIsLocating(false);
      },
      (err) => {
        console.error("Geolocation error:", err);
        alert(isKh ? "មិនអាចទទួលបានទីតាំងបច្ចុប្បន្នរបស់អ្នកទេ" : "Unable to retrieve your location.");
        setIsLocating(false);
      },
      { enableHighAccuracy: true, timeout: 5000 }
    );
  };

  return (
    <div className="bg-white border-2 border-black shadow-[6px_6px_0_#000] overflow-hidden">

      {/* ── Header ─────────────────────────────────────────────────── */}
      <div className="bg-red-500 border-b-2 border-black px-4 py-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 bg-white border-2 border-black flex items-center justify-center shrink-0">
            <Navigation size={16} className="text-red-500" />
          </div>
          <div className="min-w-0">
            <h3 className="text-sm sm:text-base font-black text-white leading-tight" style={kf}>{t.header}</h3>
            <p className="text-[10px] font-bold text-white/80 leading-tight" style={kf}>{t.subheader}</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 bg-white border-2 border-black px-2 py-1 shrink-0">
          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
          <span className="text-[10px] font-black uppercase" style={kf}>{t.live}</span>
        </div>
      </div>

      {/* ── Map ────────────────────────────────────────────────────── */}
      <div className={`relative w-full transition-all duration-300 ${isExpandedHeight ? "h-[65vh] md:h-[600px]" : "h-[260px] sm:h-[350px] md:h-[450px]"}`} style={{ minHeight: isExpandedHeight ? "380px" : "240px" }}>
        <div ref={mapContainerRef} style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} />

        {/* Floating Custom Brutalist Map Controls */}
        {mapLoaded && !error && (
          <div className="absolute top-3 right-3 flex flex-col gap-2 z-20">
            {/* Zoom Button Group */}
            <div className="flex flex-col bg-white border-2 border-black shadow-[2px_2px_0_#000]">
              <button
                onClick={() => mapRef.current?.zoomIn()}
                aria-label="Zoom in"
                className="p-2 hover:bg-yellow-400 border-b-2 border-black transition-colors"
              >
                <Plus size={16} strokeWidth={2.5} />
              </button>
              <button
                onClick={() => mapRef.current?.zoomOut()}
                aria-label="Zoom out"
                className="p-2 hover:bg-yellow-400 transition-colors"
              >
                <Minus size={16} strokeWidth={2.5} />
              </button>
            </div>

            {/* Locate Me */}
            <button
              onClick={locateUser}
              aria-label="Locate me"
              disabled={isLocating}
              className={`p-2 bg-white border-2 border-black shadow-[2px_2px_0_#000] hover:bg-yellow-400 transition-all ${
                isLocating ? "animate-pulse" : ""
              }`}
            >
              <Locate size={16} className={isLocating ? "text-yellow-500 animate-spin" : "text-black"} strokeWidth={2.5} />
            </button>

            {/* Map Style Toggle */}
            <button
              onClick={toggleStyle}
              aria-label="Toggle map style"
              className="p-2 bg-white border-2 border-black shadow-[2px_2px_0_#000] hover:bg-yellow-400 transition-all flex items-center justify-center"
            >
              <Layers size={16} strokeWidth={2.5} />
            </button>

            {/* Height Toggle */}
            <button
              onClick={toggleHeight}
              aria-label={isExpandedHeight ? "Collapse map" : "Expand map"}
              className="p-2 bg-white border-2 border-black shadow-[2px_2px_0_#000] hover:bg-yellow-400 transition-all flex items-center justify-center"
            >
              {isExpandedHeight ? <Minimize2 size={16} strokeWidth={2.5} /> : <Maximize2 size={16} strokeWidth={2.5} />}
            </button>
          </div>
        )}

        {/* Floating Custom Collapsible Legend */}
        {mapLoaded && !error && (
          <div className="absolute bottom-3 left-3 z-20 max-w-[200px] sm:max-w-[280px]">
            {isLegendOpen ? (
              <div className="bg-white border-2 border-black p-2.5 shadow-[3px_3px_0_#000] flex flex-col gap-2">
                <div className="flex items-center justify-between border-b border-black pb-1.5 gap-2">
                  <div className="flex items-center gap-1.5">
                    <Info size={13} className="text-black" />
                    <span className="text-[10px] font-black uppercase tracking-wider" style={kf}>
                      {isKh ? "ចរាចរណ៍" : "Traffic"}
                    </span>
                  </div>
                  <button
                    onClick={() => setIsLegendOpen(false)}
                    className="text-[10px] font-black uppercase text-zinc-500 hover:text-black"
                    style={kf}
                  >
                    {isKh ? "លាក់" : "Hide"}
                  </button>
                </div>
                <div className="flex flex-col gap-1.5">
                  {[
                    { color: "bg-green-500", label: t.smooth },
                    { color: "bg-yellow-500", label: t.moderate },
                    { color: "bg-red-500", label: t.heavy },
                    { color: "bg-red-900", label: t.stopped },
                  ].map(({ color, label }) => (
                    <div key={label} className="flex items-center gap-1.5">
                      <div className={`w-2.5 h-2.5 rounded-full ${color} border border-black`} />
                      <span className="text-[10px] font-bold text-zinc-800" style={kf}>
                        {label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <button
                onClick={() => setIsLegendOpen(true)}
                className="bg-yellow-400 border-2 border-black px-2.5 py-1.5 shadow-[2px_2px_0_#000] hover:bg-yellow-500 active:shadow-[1px_1px_0_#000] flex items-center gap-1.5 transition-all"
              >
                <Info size={12} className="text-black" strokeWidth={2.5} />
                <span className="text-[10px] font-black uppercase tracking-wider" style={kf}>
                  {isKh ? "សញ្ញាចរាចរណ៍" : "Legend"}
                </span>
              </button>
            )}
          </div>
        )}

        {!mapLoaded && !error && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-10 pointer-events-none">
            <div className="text-center px-4">
              <div className="w-10 h-10 border-4 border-black border-t-red-500 rounded-full animate-spin mx-auto mb-3" />
              <p className="text-sm font-bold text-gray-600" style={kf}>{t.loading}</p>
              <p className="text-xs text-gray-400 mt-1">{t.loadingPowered}</p>
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

      {/* ── Alerts Section ─────────────────────────────────────────── */}
      <div className="border-t-2 border-black">

        {/* Alerts header */}
        <div className="bg-black px-4 sm:px-6 py-3 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <ShieldAlert size={16} className="text-yellow-400 shrink-0" />
            <span className="text-sm font-black text-white uppercase tracking-wide" style={kf}>
              {t.alertsTitle}
            </span>
            <span className="bg-yellow-400 text-black text-[10px] font-black px-1.5 py-0.5 border border-white/30">
              {filtered.length}
            </span>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <div className="w-1.5 h-1.5 bg-yellow-400 rounded-full animate-pulse" />
            <span className="text-[11px] font-bold text-yellow-400 uppercase" style={kf}>{t.liveUpdates}</span>
          </div>
        </div>

        {/* Filter tabs */}
        <div className="bg-gray-50 border-b-2 border-black px-4 sm:px-6 py-2.5 overflow-x-auto">
          <div className="flex gap-2 min-w-max">
            {FILTER_TABS.map((tab) => {
              const count = tab.key === "all"
                ? ROAD_ALERTS.length
                : ROAD_ALERTS.filter((a) => a.type === tab.key).length;
              const isActive = activeFilter === tab.key;
              if (count === 0 && tab.key !== "all") return null;
              return (
                <button
                  key={tab.key}
                  onClick={() => { setActiveFilter(tab.key); setExpanded(false); }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-black border-2 border-black transition-colors whitespace-nowrap ${
                    isActive ? "bg-black text-white" : "bg-white text-black hover:bg-yellow-400"
                  }`}
                  style={kf}
                >
                  {isKh ? tab.km : tab.en}
                  <span
                    className={`text-[10px] font-black px-1 py-0 rounded-sm border ${
                      isActive ? "bg-yellow-400 text-black border-yellow-400" : "bg-gray-100 border-gray-300 text-gray-600"
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Alert cards */}
        {filtered.length === 0 ? (
          <div className="px-6 py-8 text-center text-sm text-gray-400 font-bold" style={kf}>
            {t.noAlerts}
          </div>
        ) : (
          <div className="divide-y-2 divide-black">
            {visibleAlerts.map((alert) => {
              const Icon = alert.icon;
              return (
                <div
                  key={alert.id}
                  className={`flex items-start gap-3 px-4 sm:px-6 py-4 border-l-4 ${alert.borderColor} hover:bg-gray-50 transition-colors`}
                >
                  <div className={`w-9 h-9 ${alert.color} border-2 border-black flex items-center justify-center shrink-0 mt-0.5`}>
                    <Icon size={16} className="text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="text-sm font-black leading-tight" style={kf}>
                        {isKh ? alert.title.km : alert.title.en}
                      </span>
                      <span
                        className={`text-[10px] font-black px-1.5 py-0.5 border border-black ${alert.badgeColor} text-white uppercase`}
                        style={kf}
                      >
                        {isKh ? alert.badge.km : alert.badge.en}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 leading-relaxed" style={kf}>
                      {isKh ? alert.desc.km : alert.desc.en}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Show more / less */}
        {filtered.length > VISIBLE_DEFAULT && (
          <button
            onClick={() => setExpanded((v) => !v)}
            className="w-full flex items-center justify-center gap-2 border-t-2 border-black bg-gray-50 hover:bg-yellow-400 transition-colors py-3 text-xs font-black uppercase"
            style={kf}
          >
            {expanded ? (
              <><ChevronUp size={14} /> {t.showLess}</>
            ) : (
              <><ChevronDown size={14} /> {t.showAll} ({filtered.length - VISIBLE_DEFAULT} more)</>
            )}
          </button>
        )}

        {/* Bottom safety tip */}
        <div className="bg-black px-4 sm:px-6 py-3 flex items-start sm:items-center gap-3">
          <AlertTriangle size={14} className="text-yellow-400 shrink-0 mt-0.5 sm:mt-0" />
          <p className="text-xs text-gray-300 leading-relaxed" style={kf}>
            <span className="font-black text-yellow-400">{t.stayAlert}</span>{" "}
            {t.stayAlertMsg}
          </p>
        </div>
      </div>

    </div>
  );
}
