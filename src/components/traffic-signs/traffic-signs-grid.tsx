"use client";

import { useState, useEffect, useRef, Fragment } from "react";
import Image from "next/image";
import { Volume2, X, ChevronDown, ChevronUp } from "lucide-react";
import { useLang } from "@/context/lang-context";
import type { TrafficSign } from "@/db/schema";

// ── Sub-group order matches the official Cambodian traffic sign PDF ───────────
// ក. Traffic Signs: Regulatory → Warning → Informative → Supplementary → Guide Post
// ខ. Road Markings: Transverse → Longitudinal → Arrow → Other
// គ. Traffic Signals: Traffic Lights
// ឃ. Traffic Police Signals
const ORDERED_SUB_GROUPS: { key: string; label: string }[] = [
  // ── Regulatory Signs (ក១) ──────────────────────────────────────────────────
  { key: "Prohibitory Signs", label: "Prohibitory Signs" },
  { key: "Mandatory Signs", label: "Mandatory Signs" },
  { key: "Priority Signs", label: "Priority Signs" },
  // ── Warning Signs (ក២) ────────────────────────────────────────────────────
  { key: "Warning Signs", label: "Warning Signs" },
  { key: "Temporary Signs", label: "Temporary Signs" },
  // ── Informative Signs (ក៣) ────────────────────────────────────────────────
  { key: "Direction Signs", label: "Direction Signs" },
  { key: "Buildup Area Boundary Signs", label: "Buildup Area Boundary Signs" },
  { key: "Street Name Signs", label: "Street Name Signs" },
  { key: "Informative Signs", label: "Informative Signs" },
  // ── Supplementary Signs (ក៤) ──────────────────────────────────────────────
  { key: "Supplementary Signs", label: "Supplementary Signs" },
  // ── Guide Post (ក៥) ───────────────────────────────────────────────────────
  { key: "Sign Posts", label: "Sign Posts / Guide Post" },
  // ── Road Markings (ខ) ─────────────────────────────────────────────────────
  { key: "Transverse Markings", label: "Transverse Markings" },
  { key: "Longitudinal Markings", label: "Longitudinal Markings" },
  { key: "Arrows Markings", label: "Arrow Markings" },
  { key: "Other Road Markings", label: "Other Road Markings" },
  // ── Traffic Signals (គ) ───────────────────────────────────────────────────
  { key: "Traffic Lights", label: "Traffic Lights" },
  // ── Traffic Police Signals (ឃ) ────────────────────────────────────────────
  { key: "Traffic Police Signals", label: "Traffic Police Signals" },
];

interface TrafficSignsGridProps {
  initialSigns?: TrafficSign[];
}

// ── Inline detail panel ───────────────────────────────────────────────────────
function SignDetailPanel({
  sign,
  onClose,
  lang,
}: {
  sign: TrafficSign;
  onClose: () => void;
  lang: string;
}) {
  const [playing, setPlaying] = useState(false);
  const [loadingAudio, setLoadingAudio] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const isKh = lang === "kh";
  const kf = isKh ? { fontFamily: "Siemreap, sans-serif" } : {};
  const name = isKh ? sign.titleKm : sign.titleEn;
  const description = isKh ? sign.descriptionKm : sign.descriptionEn;
  const audioUrl = isKh ? sign.audioUrlKm : sign.audioUrlEn;

  useEffect(() => {
    // Scroll the panel into view when opened or sign changes
    const timer = setTimeout(() => {
      if (panelRef.current) {
        // block: 'nearest' is usually less jumpy than 'center' or 'start', 
        // but 'center' ensures it's clearly visible. Let's use 'nearest'.
        panelRef.current.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }
    }, 100);
    return () => clearTimeout(timer);
  }, [sign.id]);

  const toggleAudio = () => {
    const el = audioRef.current;
    if (!el) return;
    if (playing) {
      el.pause();
      el.currentTime = 0;
      setPlaying(false);
    } else {
      setLoadingAudio(true);
      el.load();
      el.oncanplaythrough = () => {
        el.play();
        setLoadingAudio(false);
        setPlaying(true);
        el.oncanplaythrough = null;
      };
    }
  };

  return (
    <div
      ref={panelRef}
      className="col-span-full border-4 border-yellow-400 bg-white"
      style={{ boxShadow: "6px 6px 0 #000", scrollMarginTop: "100px" }}
    >
      <div className="flex items-center justify-between px-5 py-3 bg-yellow-400 border-b-2 border-black">
        <div className="flex items-center gap-3">
          <span className="font-mono text-xs font-black bg-black text-yellow-400 px-2 py-0.5">
            {sign.signCode || sign.signType}
          </span>
          {sign.category && (
            <span className="text-xs font-bold text-black/70">{sign.category}</span>
          )}
        </div>
        <button
          onClick={onClose}
          className="p-1.5 bg-white border-2 border-black hover:bg-black hover:text-white transition-all"
          aria-label="Close"
        >
          <X size={14} />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-0">
        {/* Image */}
        <div className="flex items-center justify-center p-6 border-b-2 md:border-b-0 md:border-r-2 border-black bg-zinc-50">
          <div className="relative w-36 h-36">
            <Image
              src={sign.imageUrl}
              alt={name}
              fill
              className="object-contain"
              unoptimized
            />
          </div>
        </div>

        {/* Content */}
        <div className="p-5 space-y-3 min-w-0">
          {/* Sign category label */}
          <p className="text-[9px] font-black uppercase tracking-widest text-amber-600">Sign Category</p>

          {/* Title — both languages */}
          <div>
            <h2 className="text-xl font-black leading-tight break-words" style={{ wordBreak: "break-word", overflowWrap: "anywhere" }}>
              {sign.titleEn}
            </h2>
            {sign.titleKm && sign.titleKm !== sign.titleEn && (
              <p className="text-base text-zinc-500 mt-0.5 break-words" style={{ fontFamily: "Siemreap, sans-serif", wordBreak: "break-word", overflowWrap: "anywhere" }}>
                {sign.titleKm}
              </p>
            )}
          </div>

          {/* Description — both languages in one green box */}
          {(sign.descriptionEn || sign.descriptionKm) && (
            <div className="rounded overflow-hidden border border-emerald-400">
              <div className="bg-emerald-500 px-3 py-1.5">
                <span className="text-[9px] font-black uppercase tracking-widest text-white">Description</span>
              </div>
              <div className="bg-emerald-50 px-3 py-2.5 space-y-2">
                {sign.descriptionEn && (
                  <p className="text-sm text-emerald-900 leading-relaxed break-words" style={{ wordBreak: "break-word", overflowWrap: "anywhere" }}>
                    {sign.descriptionEn}
                  </p>
                )}
                {sign.descriptionKm && (
                  <p className="text-sm text-emerald-900 leading-relaxed break-words" style={{ fontFamily: "Siemreap, sans-serif", wordBreak: "break-word", overflowWrap: "anywhere" }}>
                    {sign.descriptionKm}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Audio */}
          {audioUrl && (
            <div className="pt-2">
              <button
                onClick={toggleAudio}
                disabled={loadingAudio}
                className={`inline-flex items-center gap-2 px-4 py-2 border-2 border-black font-black text-sm transition-all ${loadingAudio
                  ? "bg-zinc-100 text-zinc-400 cursor-wait"
                  : playing
                    ? "bg-black text-yellow-400 shadow-[3px_3px_0_#ca8a04]"
                    : "bg-white hover:bg-yellow-400 shadow-[3px_3px_0_#000] hover:shadow-[3px_3px_0_#ca8a04]"
                  }`}
                style={kf}
              >
                <Volume2 size={15} />
                {loadingAudio ? "Loading..." : playing ? (isKh ? "ចុចដើម្បីឈប់" : "Stop") : (isKh ? "ចាក់សំឡេង" : "Play Audio")}
              </button>
              {audioUrl && (
                <audio ref={audioRef} src={audioUrl} onEnded={() => setPlaying(false)} />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Main grid ─────────────────────────────────────────────────────────────────
export function TrafficSignsGrid({ initialSigns = [] }: TrafficSignsGridProps) {
  const [signs, setSigns] = useState<TrafficSign[]>(initialSigns);
  const [selectedSign, setSelectedSign] = useState<TrafficSign | null>(null);
  const [loading, setLoading] = useState(!initialSigns.length);
  const [subGroupFilter, setSubGroupFilter] = useState("");
  const { lang } = useLang();
  const isKh = lang === "kh";
  const [cols, setCols] = useState(10); // Dynamic columns based on screen width

  useEffect(() => {
    if (!initialSigns.length) fetchSigns();

    const updateCols = () => {
      if (window.innerWidth >= 1280) setCols(10); // xl
      else if (window.innerWidth >= 1024) setCols(8); // lg
      else if (window.innerWidth >= 768) setCols(6); // md
      else if (window.innerWidth >= 640) setCols(4); // sm
      else setCols(3); // default (matches grid-cols-3)
    };

    updateCols();
    window.addEventListener("resize", updateCols);
    return () => window.removeEventListener("resize", updateCols);
  }, [initialSigns.length]);

  const fetchSigns = async () => {
    try {
      const res = await fetch("/api/traffic-signs");
      const data = await res.json();
      setSigns(data.signs || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSignClick = (sign: TrafficSign) => {
    setSelectedSign(prev => (prev?.id === sign.id ? null : sign));
  };

  // Filter by sub-group
  const filtered = subGroupFilter
    ? signs.filter(s => s.category === subGroupFilter || s.signType === subGroupFilter)
    : signs;

  // Derive available sub-groups from data, in PDF order
  const availableGroups = ORDERED_SUB_GROUPS.filter(sg =>
    signs.some(s => s.category === sg.key || s.signType === sg.key)
  );

  if (loading) {
    return (
      <div className="space-y-4">
        {/* Filter skeleton */}
        <div className="h-10 w-64 bg-gray-200 border-2 border-black animate-pulse" />
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-3">
          {Array.from({ length: 20 }).map((_, i) => (
            <div key={i} className="bg-gray-200 border-2 border-black animate-pulse aspect-square" />
          ))}
        </div>
      </div>
    );
  }

  if (!signs.length) {
    return (
      <div className="text-center py-12 border-2 border-dashed border-zinc-300">
        <p className="font-black text-zinc-500 mb-1">{isKh ? "មិនទាន់មានមាតិកា" : "No content yet"}</p>
        <p className="text-sm text-zinc-400">
          {isKh ? "អ្នកគ្រប់គ្រងនឹងបោះពុម្ពមាតិកាឆាប់ៗ" : "An administrator will publish content soon."}
        </p>
      </div>
    );
  }

  // Build rows: inject the detail panel after the row that contains the selected sign

  return (
    <div className="space-y-4">
      {/* Sub-group filter tabs */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => { setSubGroupFilter(""); setSelectedSign(null); }}
          className={`px-3 py-1.5 border-2 border-black text-xs font-black transition-all ${!subGroupFilter
            ? "bg-black text-yellow-400 shadow-[2px_2px_0_#ca8a04]"
            : "bg-white hover:bg-yellow-400 hover:shadow-[2px_2px_0_#000]"
            }`}
        >
          {isKh ? "ទាំងអស់" : "All"}
        </button>
        {availableGroups.map(sg => (
          <button
            key={sg.key}
            onClick={() => { setSubGroupFilter(sg.key); setSelectedSign(null); }}
            className={`px-3 py-1.5 border-2 border-black text-xs font-black transition-all ${subGroupFilter === sg.key
              ? "bg-yellow-400 shadow-[2px_2px_0_#000]"
              : "bg-white hover:bg-yellow-400 hover:shadow-[2px_2px_0_#000]"
              }`}
          >
            {sg.label}
          </button>
        ))}
      </div>

      {/* Count */}
      <p className="text-xs font-bold text-zinc-500">
        {isKh ? `បង្ហាញ ${filtered.length} នៃ ${signs.length} សញ្ញា` : `Showing ${filtered.length} of ${signs.length} signs`}
      </p>

      {/* Grid with inline detail panel */}
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-3">
        {filtered.map((sign, idx) => {
          const isSelected = selectedSign?.id === sign.id;
          // Inject panel after the row containing the selected sign
          const isLastInRow = (idx + 1) % cols === 0 || idx === filtered.length - 1;
          const selectedIdx = selectedSign ? filtered.findIndex(s => s.id === selectedSign.id) : -1;
          const showPanelAfter =
            selectedSign &&
            selectedIdx >= 0 &&
            idx >= selectedIdx &&
            (Math.floor(idx / cols) === Math.floor(selectedIdx / cols)) &&
            isLastInRow;

          return (
            <Fragment key={sign.id}>
              <button
                onClick={() => handleSignClick(sign)}
                className={`group border-2 transition-all duration-150 flex flex-col focus:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400 ${isSelected
                  ? "border-yellow-400 bg-yellow-400 shadow-[4px_4px_0_#ca8a04]"
                  : "border-black bg-white hover:border-yellow-400 hover:bg-yellow-400 hover:shadow-[4px_4px_0_#ca8a04]"
                  }`}
                aria-expanded={isSelected}
                aria-label={isKh ? sign.titleKm : sign.titleEn}
              >
                {/* Square image */}
                <div className="relative w-full overflow-hidden" style={{ paddingBottom: "100%" }}>
                  <div className="absolute inset-0 p-2 flex items-center justify-center">
                    <Image
                      src={sign.imageUrl}
                      alt={isKh ? sign.titleKm : sign.titleEn}
                      fill
                      sizes="(max-width: 640px) 33vw, (max-width: 768px) 25vw, 10vw"
                      className="object-contain group-hover:scale-105 transition-transform duration-200"
                      style={{ padding: "8px" }}
                      unoptimized
                    />
                  </div>
                </div>
                {/* Code label */}
                <div className={`border-t-2 px-1 py-1 w-full text-center transition-colors ${isSelected ? "border-yellow-500 bg-yellow-500" : "border-black bg-zinc-50 group-hover:border-yellow-500 group-hover:bg-yellow-500"
                  }`}>
                  <span className="font-mono text-[9px] font-black text-black leading-none">
                    {sign.signCode || sign.signType}
                  </span>
                </div>
              </button>

              {/* Inline detail panel — injected after the last card in the selected sign's row */}
              {showPanelAfter && selectedSign && (
                <SignDetailPanel
                  key={`panel-${selectedSign.id}`}
                  sign={selectedSign}
                  onClose={() => setSelectedSign(null)}
                  lang={lang}
                />
              )}
            </Fragment>
          );
        })}
      </div>
    </div>
  );
}
