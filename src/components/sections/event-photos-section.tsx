"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import Image from "next/image";
import {
  Camera,
  Maximize2,
  ChevronLeft,
  ChevronRight,
  X,
  Download,
  Shuffle,
  Play,
  Pause,
  LayoutGrid,
  Sparkles,
  Layers,
} from "lucide-react";
import { useLang } from "@/context/lang-context";
import { EVENT_PHOTOS } from "@/data/event-photos-data";
import { ShowcasePhoto } from "@/data/champion-photos-data";

// Helper to shuffle array randomly
function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function EventPhotosSection() {
  const { lang } = useLang();
  const kh = lang === "km";
  const khFont = kh ? { fontFamily: "var(--font-khmer)" } : undefined;

  const [photos, setPhotos] = useState<ShowcasePhoto[]>(EVENT_PHOTOS);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [displayCount, setDisplayCount] = useState(30);
  const [activeTab, setActiveTab] = useState<"mosaic" | "river">("mosaic");

  // Randomize photos on client-side mount so every scroll/visit presents a random sequence
  useEffect(() => {
    setPhotos(shuffleArray(EVENT_PHOTOS));
  }, []);

  const handleShuffle = () => {
    setPhotos(shuffleArray(EVENT_PHOTOS));
  };

  // Split into 3 alternating rows for 3-tier kinetic river
  const row1 = useMemo(() => photos.filter((_, i) => i % 3 === 0), [photos]);
  const row2 = useMemo(() => photos.filter((_, i) => i % 3 === 1), [photos]);
  const row3 = useMemo(() => photos.filter((_, i) => i % 3 === 2), [photos]);

  // Sliced photos for the mosaic grid
  const mosaicPhotos = useMemo(() => photos.slice(0, displayCount), [photos, displayCount]);

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
    link.download = `kwd-event-${Date.now()}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <section className="relative bg-zinc-900/50 py-12 md:py-18 border-b-2 border-black overflow-hidden">
      {/* Subtle dotted background grid */}
      <div className="absolute inset-0 bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:24px_24px] opacity-10 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        {/* Header: Short Attractive Title & Concise Description */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/15 border border-blue-500/30 text-blue-400 text-xs font-bold uppercase tracking-wider mb-2">
              <Camera size={14} className="text-blue-400" />
              <span>{kh ? "ទិដ្ឋភាពកម្មវិធីផ្ទាល់" : "Live Moments & Events"}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-zinc-900 dark:text-white tracking-tight" style={khFont}>
              {kh ? "អនុស្សាវរីយ៍ និងសកម្មភាព" : "Event Highlights"}
            </h2>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1 max-w-xl" style={khFont}>
              {kh
                ? "រូបភាពពិតពីការចុះសាលារៀន សិក្ខាសាលា និងការផ្សព្វផ្សាយសុវត្ថិភាពចរាចរណ៍"
                : "Real captures from school outreach, interactive sessions, and community road safety."}
            </p>
          </div>

          {/* Minimalist Controls */}
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              onClick={() => setIsPlaying((p) => !p)}
              className="p-2 rounded-xl bg-white dark:bg-zinc-800 border-2 border-black shadow-[2px_2px_0_#000] hover:shadow-[3px_3px_0_#3b82f6] text-zinc-800 dark:text-zinc-200 transition-all"
              title={isPlaying ? "Pause stream" : "Play stream"}
              aria-label={isPlaying ? "Pause stream" : "Play stream"}
            >
              {isPlaying ? <Pause size={16} /> : <Play size={16} />}
            </button>
            <button
              onClick={handleShuffle}
              className="p-2 rounded-xl bg-white dark:bg-zinc-800 border-2 border-black shadow-[2px_2px_0_#000] hover:shadow-[3px_3px_0_#3b82f6] text-zinc-800 dark:text-zinc-200 transition-all"
              title="Shuffle photos"
              aria-label="Shuffle photos"
            >
              <Shuffle size={16} />
            </button>
            <div className="flex bg-white dark:bg-zinc-800 border-2 border-black shadow-[2px_2px_0_#000] rounded-xl p-0.5">
              <button
                onClick={() => setActiveTab("mosaic")}
                className={`p-1.5 rounded-lg transition-colors ${
                  activeTab === "mosaic" ? "bg-blue-500 text-white font-bold" : "text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white"
                }`}
                title="Mosaic Gallery"
                aria-label="Mosaic Gallery"
              >
                <LayoutGrid size={15} />
              </button>
              <button
                onClick={() => setActiveTab("river")}
                className={`p-1.5 rounded-lg transition-colors ${
                  activeTab === "river" ? "bg-blue-500 text-white font-bold" : "text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white"
                }`}
                title="Tri-Lane Stream"
                aria-label="Tri-Lane Stream"
              >
                <Layers size={15} />
              </button>
            </div>
          </div>
        </div>

        {/* View Mode 1: Dynamic Staggered Mosaic Grid */}
        {activeTab === "mosaic" ? (
          <div>
            <div className="columns-2 sm:columns-3 md:columns-4 lg:columns-5 gap-3.5 space-y-3.5 select-none">
              {mosaicPhotos.map((photo) => (
                <div
                  key={`mosaic-${photo.id}`}
                  onClick={() => openLightbox(photo.id)}
                  className="break-inside-avoid group relative rounded-2xl overflow-hidden border-2 border-black shadow-[4px_4px_0_rgba(0,0,0,0.9)] bg-zinc-900 cursor-pointer hover:shadow-[6px_6px_0_#3b82f6] hover:-translate-y-1 transition-all duration-200"
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
                      alt="Event Moment"
                      fill
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-300 pointer-events-auto select-auto"
                      loading="lazy"
                    />
                  </div>
                  {/* Subtle expand icon on hover */}
                  <div className="absolute inset-0 bg-black/35 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center shadow-lg transform scale-75 group-hover:scale-100 transition-transform">
                      <Maximize2 size={15} />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Load More Trigger if more photos exist */}
            {displayCount < photos.length && (
              <div className="mt-8 text-center">
                <button
                  onClick={() => setDisplayCount((prev) => Math.min(prev + 30, photos.length))}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-white dark:bg-zinc-800 border-2 border-black font-black text-xs uppercase tracking-wider text-zinc-900 dark:text-white shadow-[4px_4px_0_#000] hover:shadow-[6px_6px_0_#3b82f6] hover:-translate-y-0.5 active:translate-y-0 active:shadow-[2px_2px_0_#000] transition-all"
                  style={khFont}
                >
                  <Sparkles size={15} className="text-blue-500" />
                  <span>{kh ? "មើលរូបភាពបន្ថែមទៀត" : "Show More Photos"}</span>
                </button>
              </div>
            )}
          </div>
        ) : (
          /* View Mode 2: 3-Tier Multi-Speed Kinetic River */
          <div className="space-y-3.5 select-none py-2">
            {/* Lane 1: Fast Left */}
            <div className="relative overflow-hidden">
              <div
                className={`flex gap-3.5 w-max animate-photo-stream-left-fast ${
                  !isPlaying ? "pause-animation" : "hover-pause"
                }`}
              >
                {[...row1, ...row1].map((photo, idx) => (
                  <EventPhotoCard
                    key={`l1-${photo.id}-${idx}`}
                    photo={photo}
                    onClick={() => openLightbox(photo.id)}
                  />
                ))}
              </div>
            </div>

            {/* Lane 2: Fast Right */}
            <div className="relative overflow-hidden">
              <div
                className={`flex gap-3.5 w-max animate-photo-stream-right-fast ${
                  !isPlaying ? "pause-animation" : "hover-pause"
                }`}
              >
                {[...row2, ...row2].map((photo, idx) => (
                  <EventPhotoCard
                    key={`l2-${photo.id}-${idx}`}
                    photo={photo}
                    onClick={() => openLightbox(photo.id)}
                  />
                ))}
              </div>
            </div>

            {/* Lane 3: Moderate Left */}
            <div className="relative overflow-hidden">
              <div
                className={`flex gap-3.5 w-max animate-photo-stream-left ${
                  !isPlaying ? "pause-animation" : "hover-pause"
                }`}
              >
                {[...row3, ...row3].map((photo, idx) => (
                  <EventPhotoCard
                    key={`l3-${photo.id}-${idx}`}
                    photo={photo}
                    onClick={() => openLightbox(photo.id)}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ─── FULLSCREEN LIGHTBOX MODAL (Direct Save Image Allowed) ─── */}
      {lightboxIndex !== null && photos[lightboxIndex] && (
        <div
          className="fixed inset-0 z-[9999] bg-black/95 backdrop-blur-md flex flex-col justify-between p-3 sm:p-6 animate-in fade-in duration-200"
          onClick={closeLightbox}
        >
          {/* Top Bar: Title + Save + Close */}
          <div
            className="flex items-center justify-between gap-4 relative z-10"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-ping" />
              <span className="text-xs sm:text-sm font-bold tracking-wider uppercase text-blue-400">
                {kh ? "រូបភាពព្រឹត្តិការណ៍" : "Event Photo Spotlight"}
              </span>
            </div>

            <div className="flex items-center gap-2">
              {/* Direct Save/Download Button */}
              <button
                onClick={() => handleSaveImage(photos[lightboxIndex].url)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-500 hover:bg-blue-400 text-white font-black text-xs shadow-md active:scale-95 transition-all"
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
              className="absolute left-1 sm:left-4 z-20 p-2 sm:p-3 rounded-full bg-black/60 hover:bg-blue-500 hover:text-white text-white border border-white/20 transition-all active:scale-90"
              title="Previous (Left Arrow)"
              aria-label="Previous"
            >
              <ChevronLeft size={22} />
            </button>

            {/* Next Button */}
            <button
              onClick={nextPhoto}
              className="absolute right-1 sm:right-4 z-20 p-2 sm:p-3 rounded-full bg-black/60 hover:bg-blue-500 hover:text-white text-white border border-white/20 transition-all active:scale-90"
              title="Next (Right Arrow)"
              aria-label="Next"
            >
              <ChevronRight size={22} />
            </button>

            {/* Standard Image allowing right-click save, long-press save */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={photos[lightboxIndex].url}
              alt="Event Spotlight"
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

// Subcomponent: Individual River Photo Card
function EventPhotoCard({ photo, onClick }: { photo: ShowcasePhoto; onClick: () => void }) {
  const sizeClasses =
    photo.orientation === "portrait"
      ? "w-[170px] sm:w-[210px] md:w-[240px] aspect-[3/4]"
      : photo.orientation === "square"
      ? "w-[190px] sm:w-[230px] md:w-[260px] aspect-[1/1]"
      : "w-[250px] sm:w-[300px] md:w-[340px] aspect-[16/10]";

  return (
    <div
      onClick={onClick}
      className={`group relative flex-shrink-0 rounded-2xl overflow-hidden border-2 border-black shadow-[4px_4px_0_rgba(0,0,0,0.85)] bg-zinc-900 cursor-pointer hover:shadow-[7px_7px_0_#3b82f6] hover:-translate-y-1 transition-all duration-200 ${sizeClasses}`}
    >
      <Image
        src={photo.url}
        alt="Event Moment"
        fill
        sizes="(max-width: 640px) 250px, 340px"
        className="object-cover group-hover:scale-105 transition-transform duration-300 pointer-events-auto select-auto"
        loading="lazy"
      />
      <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
        <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center shadow-lg transform scale-75 group-hover:scale-100 transition-transform">
          <Maximize2 size={15} />
        </div>
      </div>
    </div>
  );
}
