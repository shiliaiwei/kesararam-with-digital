"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import Image from "next/image";
import {
  Trophy,
  Maximize2,
  ChevronLeft,
  ChevronRight,
  X,
  Download,
  Shuffle,
  Play,
  Pause,
  Sparkles,
  LayoutGrid,
  Film,
} from "lucide-react";
import { useLang } from "@/context/lang-context";
import { CHAMPION_PHOTOS, ShowcasePhoto } from "@/data/champion-photos-data";

// Helper to shuffle array randomly
function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function AwardsSection() {
  const { lang } = useLang();
  const kh = lang === "km";
  const khFont = kh ? { fontFamily: "var(--font-khmer)" } : undefined;

  const [photos, setPhotos] = useState<ShowcasePhoto[]>(CHAMPION_PHOTOS);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [viewMode, setViewMode] = useState<"stream" | "grid">("stream");

  // Randomize images on initial client-side mount so every scroll/visit shows random sequence
  useEffect(() => {
    setPhotos(shuffleArray(CHAMPION_PHOTOS));
  }, []);

  const handleShuffle = () => {
    setPhotos(shuffleArray(CHAMPION_PHOTOS));
  };

  // Split photos into 2 balanced rows for the dual-speed ribbon
  const row1 = useMemo(() => photos.filter((_, idx) => idx % 2 === 0), [photos]);
  const row2 = useMemo(() => photos.filter((_, idx) => idx % 2 !== 0), [photos]);

  // Lightbox handlers
  const openLightbox = useCallback((photoId: string) => {
    const idx = photos.findIndex((p) => p.id === photoId);
    if (idx !== -1) {
      setLightboxIndex(idx);
      setIsPlaying(false);
    }
  }, [photos]);

  const closeLightbox = useCallback(() => {
    setLightboxIndex(null);
  }, []);

  const prevPhoto = useCallback(() => {
    setLightboxIndex((prev) => {
      if (prev === null) return null;
      return prev === 0 ? photos.length - 1 : prev - 1;
    });
  }, [photos.length]);

  const nextPhoto = useCallback(() => {
    setLightboxIndex((prev) => {
      if (prev === null) return null;
      return prev === photos.length - 1 ? 0 : prev + 1;
    });
  }, [photos.length]);

  // Keyboard navigation for lightbox
  useEffect(() => {
    if (lightboxIndex === null) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowLeft") prevPhoto();
      if (e.key === "ArrowRight") nextPhoto();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [lightboxIndex, closeLightbox, prevPhoto, nextPhoto]);

  // Trigger browser download / direct image save
  const handleSaveImage = (url: string) => {
    const link = document.createElement("a");
    link.href = url;
    link.target = "_blank";
    link.download = `kwd-champion-${Date.now()}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <section className="relative bg-zinc-950 text-white py-12 md:py-16 overflow-hidden border-b-2 border-black">
      {/* Subtle background glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-500/10 via-zinc-950 to-zinc-950 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        {/* Header: Short attractive title & concise description */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/15 border border-amber-400/30 text-amber-300 text-xs font-bold uppercase tracking-wider mb-2">
              <Trophy size={14} className="text-amber-400" />
              <span>{kh ? "ជើងឯកថ្នាក់ជាតិ ២០២៦" : "National Champions 2026"}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-white tracking-tight" style={khFont}>
              {kh ? "សមិទ្ធផលជ័យលាភីពានរង្វាន់ជាតិ" : "Champion Showcase"}
            </h2>
            <p className="text-sm text-zinc-400 mt-1 max-w-xl" style={khFont}>
              {kh
                ? "អបអរសាទរជ័យជម្នះ និងមោទនភាពជាតិ — ចុចលើរូបភាពដើម្បីមើលទំហំពេញ និងទាញយកទុក"
                : "Celebrating our team's victory. Tap any photo to view full size and save."}
            </p>
          </div>

          {/* Minimalist Controls: Mode toggle, Play/Pause, Shuffle */}
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              onClick={() => setIsPlaying((p) => !p)}
              className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 hover:border-amber-400/50 text-zinc-300 hover:text-amber-400 transition-colors"
              title={isPlaying ? "Pause animation" : "Play animation"}
              aria-label={isPlaying ? "Pause animation" : "Play animation"}
            >
              {isPlaying ? <Pause size={16} /> : <Play size={16} />}
            </button>
            <button
              onClick={handleShuffle}
              className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 hover:border-amber-400/50 text-zinc-300 hover:text-amber-400 transition-colors"
              title="Shuffle photos randomly"
              aria-label="Shuffle photos"
            >
              <Shuffle size={16} />
            </button>
            <div className="flex bg-zinc-900 border border-zinc-800 rounded-xl p-0.5">
              <button
                onClick={() => setViewMode("stream")}
                className={`p-1.5 rounded-lg transition-colors ${
                  viewMode === "stream" ? "bg-amber-400 text-black font-bold" : "text-zinc-400 hover:text-white"
                }`}
                title="Stream view"
                aria-label="Stream view"
              >
                <Film size={15} />
              </button>
              <button
                onClick={() => setViewMode("grid")}
                className={`p-1.5 rounded-lg transition-colors ${
                  viewMode === "grid" ? "bg-amber-400 text-black font-bold" : "text-zinc-400 hover:text-white"
                }`}
                title="Grid view"
                aria-label="Grid view"
              >
                <LayoutGrid size={15} />
              </button>
            </div>
          </div>
        </div>

        {/* View Mode 1: Dynamic Dual-Ribbon Fast Stream */}
        {viewMode === "stream" ? (
          <div className="space-y-4 select-none">
            {/* Ribbon Row 1 (Fast Left) */}
            <div className="relative overflow-hidden py-1">
              <div
                className={`flex gap-3.5 w-max animate-photo-stream-left-fast ${
                  !isPlaying ? "pause-animation" : "hover-pause"
                }`}
              >
                {[...row1, ...row1].map((photo, idx) => (
                  <PhotoCard
                    key={`r1-${photo.id}-${idx}`}
                    photo={photo}
                    onClick={() => openLightbox(photo.id)}
                  />
                ))}
              </div>
            </div>

            {/* Ribbon Row 2 (Fast Right) */}
            <div className="relative overflow-hidden py-1">
              <div
                className={`flex gap-3.5 w-max animate-photo-stream-right-fast ${
                  !isPlaying ? "pause-animation" : "hover-pause"
                }`}
              >
                {[...row2, ...row2].map((photo, idx) => (
                  <PhotoCard
                    key={`r2-${photo.id}-${idx}`}
                    photo={photo}
                    onClick={() => openLightbox(photo.id)}
                  />
                ))}
              </div>
            </div>
          </div>
        ) : (
          /* View Mode 2: Responsive Full Masonry Grid */
          <div className="columns-2 sm:columns-3 md:columns-4 lg:columns-5 gap-3.5 space-y-3.5">
            {photos.map((photo) => (
              <div
                key={`grid-${photo.id}`}
                onClick={() => openLightbox(photo.id)}
                className="break-inside-avoid group relative rounded-2xl overflow-hidden border-2 border-black/80 shadow-[4px_4px_0_rgba(0,0,0,0.9)] bg-zinc-900 cursor-pointer hover:shadow-[6px_6px_0_#eab308] hover:-translate-y-1 transition-all duration-200"
              >
                <div
                  className={`w-full relative ${
                    photo.orientation === "portrait"
                      ? "aspect-[3/4]"
                      : photo.orientation === "square"
                      ? "aspect-[1/1]"
                      : "aspect-[16/10]"
                  }`}
                >
                  <Image
                    src={photo.url}
                    alt="National Champions 2026"
                    fill
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-end p-2.5">
                  <div className="w-8 h-8 rounded-full bg-amber-400 text-black flex items-center justify-center shadow-md">
                    <Maximize2 size={14} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ─── FULLSCREEN LIGHTBOX MODAL (Direct Save Image Allowed) ─── */}
      {lightboxIndex !== null && photos[lightboxIndex] && (
        <div
          className="fixed inset-0 z-[9999] bg-black/95 backdrop-blur-md flex flex-col justify-between p-3 sm:p-6 animate-in fade-in duration-200"
          onClick={closeLightbox}
        >
          {/* Top Bar: Minimalist Title + Save + Close */}
          <div
            className="flex items-center justify-between gap-4 relative z-10"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
              <span className="text-xs sm:text-sm font-bold tracking-wider uppercase text-amber-300">
                {kh ? "រូបភាពជើងឯកថ្នាក់ជាតិ" : "National Champion Photo"}
              </span>
            </div>

            <div className="flex items-center gap-2">
              {/* Direct Save/Download Button */}
              <button
                onClick={() => handleSaveImage(photos[lightboxIndex].url)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-black font-black text-xs shadow-md active:scale-95 transition-all"
                title="Save this image"
              >
                <Download size={14} />
                <span>{kh ? "ទាញយក" : "Save Image"}</span>
              </button>

              <button
                onClick={closeLightbox}
                className="p-2 rounded-xl bg-zinc-900/80 hover:bg-red-600 text-zinc-300 hover:text-white border border-zinc-700/60 transition-colors"
                title="Close (Esc)"
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Center Stage: Pure Uncropped Full Image */}
          <div
            className="flex-1 relative flex items-center justify-center my-auto p-2"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Prev Button */}
            <button
              onClick={prevPhoto}
              className="absolute left-1 sm:left-4 z-20 p-2 sm:p-3 rounded-full bg-black/60 hover:bg-amber-400 hover:text-black text-white border border-white/20 transition-all active:scale-90"
              title="Previous (Left Arrow)"
              aria-label="Previous"
            >
              <ChevronLeft size={22} />
            </button>

            {/* Next Button */}
            <button
              onClick={nextPhoto}
              className="absolute right-1 sm:right-4 z-20 p-2 sm:p-3 rounded-full bg-black/60 hover:bg-amber-400 hover:text-black text-white border border-white/20 transition-all active:scale-90"
              title="Next (Right Arrow)"
              aria-label="Next"
            >
              <ChevronRight size={22} />
            </button>

            {/* Standard Image allowing right-click save, long-press save */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={photos[lightboxIndex].url}
              alt="National Champion Spotlight"
              className="max-h-[82vh] max-w-[92vw] object-contain rounded-2xl border-2 border-white/10 shadow-2xl select-auto"
            />
          </div>

          {/* Bottom Bar: Touch/Keyboard Tip */}
          <div
            className="text-center text-[11px] text-zinc-500 select-none pb-1"
            onClick={(e) => e.stopPropagation()}
          >
            {kh
              ? "ប្រើព្រួញឆ្វេង/ស្តាំដើម្បីប្តូររូប • ចុច Save Image ដើម្បីទាញយករូបទុក"
              : "Use Left / Right arrow keys to navigate • Tap 'Save Image' or right click to download"}
          </div>
        </div>
      )}
    </section>
  );
}

// Subcomponent: Individual Fast Kinetic Stream Photo Card
function PhotoCard({ photo, onClick }: { photo: ShowcasePhoto; onClick: () => void }) {
  // Dimensions based on orientation for stable aspect ratio without clipping
  const sizeClasses =
    photo.orientation === "portrait"
      ? "w-[180px] sm:w-[220px] md:w-[260px] aspect-[3/4]"
      : photo.orientation === "square"
      ? "w-[200px] sm:w-[240px] md:w-[280px] aspect-[1/1]"
      : "w-[260px] sm:w-[320px] md:w-[360px] aspect-[16/10]";

  return (
    <div
      onClick={onClick}
      className={`group relative flex-shrink-0 rounded-2xl overflow-hidden border-2 border-black/90 shadow-[4px_4px_0_rgba(0,0,0,0.85)] bg-zinc-900 cursor-pointer hover:shadow-[7px_7px_0_#eab308] hover:-translate-y-1 transition-all duration-200 ${sizeClasses}`}
    >
      <Image
        src={photo.url}
        alt="Champion Photo"
        fill
        sizes="(max-width: 640px) 260px, 360px"
        className="object-cover group-hover:scale-105 transition-transform duration-300 pointer-events-auto select-auto"
        loading="lazy"
      />
      {/* Subtle hover overlay with expand icon */}
      <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
        <div className="w-9 h-9 rounded-full bg-amber-400 text-black flex items-center justify-center shadow-lg transform scale-75 group-hover:scale-100 transition-transform">
          <Maximize2 size={16} />
        </div>
      </div>
    </div>
  );
}
