"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import {
  Trophy,
  Award,
  Sparkles,
  ArrowRight,
  Play,
  Pause,
  Maximize2,
  ChevronLeft,
  ChevronRight,
  Grid,
  Film,
  X,
  RotateCcw,
  Eye,
  Camera,
  Layers,
} from "lucide-react";
import { useLang } from "@/context/lang-context";
import { CautionTape } from "@/components/brand/brand-kit";

export interface ChampionPhoto {
  id: string;
  num: string;
  url: string;
  titleEn: string;
  titleKh: string;
  tagEn: string;
  tagKh: string;
}

export const CHAMPION_PHOTOS: ChampionPhoto[] = [
  {
    id: "photo-01",
    num: "01",
    url: "https://res.cloudinary.com/dpgivqzrl/image/upload/v1786649329/01_h8y0wn.jpg",
    titleEn: "National Champions 2026 — Team #50777 Victory Celebration",
    titleKh: "ជើងឯកថ្នាក់ជាតិ ២០២៦ — ការអបអរសាទរជ័យជម្នះក្រុម ៥០៧៧៧",
    tagEn: "National Winner",
    tagKh: "ជ័យលាភីថ្នាក់ជាតិ",
  },
  {
    id: "photo-02",
    num: "02",
    url: "https://res.cloudinary.com/dpgivqzrl/image/upload/v1786649332/02_wozvje.jpg",
    titleEn: "National Champion Trophy & Award Certificate Stage Presentation",
    titleKh: "ពិធីប្រគល់ពានរង្វាន់ និងវិញ្ញាបនបត្រជើងឯកថ្នាក់ជាតិលើឆាក",
    tagEn: "Trophy Ceremony",
    tagKh: "ពិធីប្រគល់ពាន",
  },
  {
    id: "photo-03",
    num: "03",
    url: "https://res.cloudinary.com/dpgivqzrl/image/upload/v1786649331/03_zzcanc.png",
    titleEn: "Technovation Girls Cambodia 2026 Winner Official Banner",
    titleKh: "បដាផ្លូវការជ័យលាភី Technovation Girls Cambodia 2026",
    tagEn: "Official Banner",
    tagKh: "បដាជ័យលាភី",
  },
  {
    id: "photo-04",
    num: "04",
    url: "https://res.cloudinary.com/dpgivqzrl/image/upload/v1786649330/03_o0jb48.jpg",
    titleEn: "Junior Division National Finals Stage Group Moment",
    titleKh: "រូបភាពក្រុមលើឆាកប្រកួតផ្តាច់ព្រ័ត្រថ្នាក់ជាតិ Junior Division",
    tagEn: "Stage Spotlight",
    tagKh: "ការបង្ហាញលើឆាក",
  },
  {
    id: "photo-05",
    num: "05",
    url: "https://res.cloudinary.com/dpgivqzrl/image/upload/v1786649334/04_bzlzbr.jpg",
    titleEn: "Grand Winner Announcement & Team Victory Cheers",
    titleKh: "ការប្រកាសលទ្ធផលជ័យលាភី និងការអបអរសាទរយ៉ាងរីករាយ",
    tagEn: "Victory Cheers",
    tagKh: "ការអបអរសាទរ",
  },
  {
    id: "photo-06",
    num: "06",
    url: "https://res.cloudinary.com/dpgivqzrl/image/upload/v1786649333/05_ghtama.jpg",
    titleEn: "Live Project Pitching & App Presentation Session",
    titleKh: "សកម្មភាពធ្វើ Pitching និងការបង្ហាញកម្មវិធីឌីជីថល",
    tagEn: "Project Pitch",
    tagKh: "ការបង្ហាញគម្រោង",
  },
  {
    id: "photo-07",
    num: "07",
    url: "https://res.cloudinary.com/dpgivqzrl/image/upload/v1786649332/06_rda0tx.jpg",
    titleEn: "Demonstrating Interactive Road-Safety Solution to Judges",
    titleKh: "ការបង្ហាញគំរូអន្តរកម្មសុវត្ថិភាពចរាចរណ៍ជូនគណៈកម្មការ",
    tagEn: "Judges Demo",
    tagKh: "ការបង្ហាញគណៈកម្មការ",
  },
  {
    id: "photo-08",
    num: "08",
    url: "https://res.cloudinary.com/dpgivqzrl/image/upload/v1786649333/07_xsblls.jpg",
    titleEn: "Future Digital Talents 2026 Stage Recognition",
    titleKh: "ការទទួលស្គាល់លើឆាក Future Digital Talents 2026",
    tagEn: "Digital Talents",
    tagKh: "ពានរង្វាន់ឌីជីថល",
  },
  {
    id: "photo-09",
    num: "09",
    url: "https://res.cloudinary.com/dpgivqzrl/image/upload/v1786649335/08_yluxi1.jpg",
    titleEn: "Award Ceremony Group Photo with National Dignitaries",
    titleKh: "រូបថតរួមក្រុមជាមួយថ្នាក់ដឹកនាំក្នុងពិធីប្រគល់ពានរង្វាន់",
    tagEn: "Honor Photo",
    tagKh: "រូបថតកិត្តិយស",
  },
  {
    id: "photo-10",
    num: "10",
    url: "https://res.cloudinary.com/dpgivqzrl/image/upload/v1786649335/09_pu5ccc.jpg",
    titleEn: "KWD Team Members Holding Championship Trophy",
    titleKh: "សមាជិកាក្រុម KWD លើកពានរង្វាន់ជើងឯកថ្នាក់ជាតិ",
    tagEn: "Team Joy",
    tagKh: "ក្តីរីករាយក្រុម",
  },
  {
    id: "photo-11",
    num: "11",
    url: "https://res.cloudinary.com/dpgivqzrl/image/upload/v1786649334/10_oojq6w.jpg",
    titleEn: "Technovation Girls Cambodia Champion Medals Showcase",
    titleKh: "ការបង្ហាញមេដាយជើងឯក Technovation Girls Cambodia",
    tagEn: "Gold Medals",
    tagKh: "មេដាយមាស",
  },
  {
    id: "photo-12",
    num: "12",
    url: "https://res.cloudinary.com/dpgivqzrl/image/upload/v1786649334/11_kghnbq.jpg",
    titleEn: "Judges Q&A Session & Interactive App Evaluation",
    titleKh: "វគ្គសាកសួរសំណួរ និងការវាយតម្លៃកម្មវិធី",
    tagEn: "Q&A Session",
    tagKh: "វគ្គឆ្លើយសំណួរ",
  },
  {
    id: "photo-13",
    num: "13",
    url: "https://res.cloudinary.com/dpgivqzrl/image/upload/v1786649332/12_kj9lvg.jpg",
    titleEn: "Presenting Road Safety Solutions for Youth Education",
    titleKh: "ការបង្ហាញដំណោះស្រាយសុវត្ថិភាពចរាចរណ៍សម្រាប់យុវជន",
    tagEn: "Youth Innovation",
    tagKh: "ការបង្កើតថ្មី",
  },
  {
    id: "photo-14",
    num: "14",
    url: "https://res.cloudinary.com/dpgivqzrl/image/upload/v1786649333/13_xbix6x.jpg",
    titleEn: "National Championship Exhibition & Project Booth Showcase",
    titleKh: "ការតាំងបង្ហាញស្តង់គម្រោងក្នុងពិធីជើងឯកថ្នាក់ជាតិ",
    tagEn: "Project Booth",
    tagKh: "ស្តង់ពិព័រណ៍",
  },
  {
    id: "photo-15",
    num: "15",
    url: "https://res.cloudinary.com/dpgivqzrl/image/upload/v1786649329/14_c3jjen.jpg",
    titleEn: "Students & Mentors Celebrating National Championship",
    titleKh: "សិស្ស និង Mentors អបអរសាទរជ័យជម្នះថ្នាក់ជាតិ",
    tagEn: "Mentorship",
    tagKh: "ការណែនាំ",
  },
  {
    id: "photo-16",
    num: "16",
    url: "https://res.cloudinary.com/dpgivqzrl/image/upload/v1786649328/15_wvxd29.jpg",
    titleEn: "Technovation Stage Trophy Handover Moment",
    titleKh: "ពិធីប្រគល់ពានរង្វាន់នៅលើឆាក Technovation",
    tagEn: "Award Stage",
    tagKh: "ឆាកប្រគល់ពាន",
  },
  {
    id: "photo-17",
    num: "17",
    url: "https://res.cloudinary.com/dpgivqzrl/image/upload/v1786649332/16_votuqe.jpg",
    titleEn: "Siem Reap Kesararam Team Representing Road Safety",
    titleKh: "ក្រុមសាលាកេសារារាម ខេត្តសៀមរាប",
    tagEn: "Siem Reap Team",
    tagKh: "ក្រុមសៀមរាប",
  },
  {
    id: "photo-18",
    num: "18",
    url: "https://res.cloudinary.com/dpgivqzrl/image/upload/v1786649328/17_pbejy6.jpg",
    titleEn: "Judges Panel Scoring & Technical Review",
    titleKh: "ការវាយតម្លៃបច្ចេកទេស និងការផ្តល់ពិន្ទុពីគណៈកម្មការ",
    tagEn: "Scoring Panel",
    tagKh: "គណៈកម្មការ",
  },
  {
    id: "photo-19",
    num: "19",
    url: "https://res.cloudinary.com/dpgivqzrl/image/upload/v1786649331/18_awxarl.jpg",
    titleEn: "Team Acceptance Speech on National Stage",
    titleKh: "ការថ្លែងសារអំណរគុណនៅលើឆាកថ្នាក់ជាតិ",
    tagEn: "Stage Speech",
    tagKh: "ការថ្លែងសារ",
  },
  {
    id: "photo-20",
    num: "20",
    url: "https://res.cloudinary.com/dpgivqzrl/image/upload/v1786649333/19_ohbhdb.jpg",
    titleEn: "National Championship Smiles & Joyful Victory",
    titleKh: "ស្នាមញញឹមនៃជ័យជម្នះជើងឯកថ្នាក់ជាតិ",
    tagEn: "Victory Smile",
    tagKh: "ស្នាមញញឹម",
  },
  {
    id: "photo-21",
    num: "21",
    url: "https://res.cloudinary.com/dpgivqzrl/image/upload/v1786649329/20_xnxtsg.jpg",
    titleEn: "Future Digital Talents Certificate Presentation",
    titleKh: "ការប្រគល់វិញ្ញាបនបត្រ Future Digital Talents",
    tagEn: "Certificate",
    tagKh: "វិញ្ញាបនបត្រ",
  },
  {
    id: "photo-22",
    num: "22",
    url: "https://res.cloudinary.com/dpgivqzrl/image/upload/v1786649334/21_ltcv3g.jpg",
    titleEn: "Young Cambodian Female Innovators Spotlight",
    titleKh: "ការលេចធ្លោនៃយុវតីកម្ពុជាផ្នែកបច្ចេកវិទ្យា",
    tagEn: "Innovators",
    tagKh: "យុវតីឆ្នើម",
  },
  {
    id: "photo-23",
    num: "23",
    url: "https://res.cloudinary.com/dpgivqzrl/image/upload/v1786649329/22_yna1dn.jpg",
    titleEn: "National Champions Banner & Team Honor",
    titleKh: "បដាជើងឯកថ្នាក់ជាតិ និងកិត្តិយសក្រុម",
    tagEn: "Team Honor",
    tagKh: "កិត្តិយសក្រុម",
  },
  {
    id: "photo-24",
    num: "24",
    url: "https://res.cloudinary.com/dpgivqzrl/image/upload/v1786649330/23_mkzm7y.jpg",
    titleEn: "Technovation Girls Cambodia 2026 Group Pose",
    titleKh: "រូបថតក្រុម Technovation Girls Cambodia 2026",
    tagEn: "Group Pose",
    tagKh: "រូបថតក្រុម",
  },
  {
    id: "photo-25",
    num: "25",
    url: "https://res.cloudinary.com/dpgivqzrl/image/upload/v1786649332/24_q2tcnl.jpg",
    titleEn: "Displaying National Champion Trophy Together",
    titleKh: "ការបង្ហាញពានរង្វាន់ជើងឯកថ្នាក់ជាតិជាមួយគ្នា",
    tagEn: "Trophy Pose",
    tagKh: "រូបភាពពានរង្វាន់",
  },
  {
    id: "photo-26",
    num: "26",
    url: "https://res.cloudinary.com/dpgivqzrl/image/upload/v1786649333/25_cmyyzh.jpg",
    titleEn: "Commemorative Stage Photo — Technovation Finals",
    titleKh: "រូបថតអនុស្សាវរីយ៍លើឆាក — វគ្គផ្តាច់ព្រ័ត្រ",
    tagEn: "Commemorative",
    tagKh: "អនុស្សាវរីយ៍",
  },
  {
    id: "photo-27",
    num: "27",
    url: "https://res.cloudinary.com/dpgivqzrl/image/upload/v1786649331/26_hdr0l5.jpg",
    titleEn: "Junior Division Championship Gold Achievement",
    titleKh: "សមិទ្ធផលមាសជើងឯក Junior Division",
    tagEn: "Gold Victory",
    tagKh: "ជ័យជម្នះមាស",
  },
  {
    id: "photo-28",
    num: "28",
    url: "https://res.cloudinary.com/dpgivqzrl/image/upload/v1786649330/27_rexswy.jpg",
    titleEn: "National Champions Certificate Handshake & Honors",
    titleKh: "ពិធីប្រគល់វិញ្ញាបនបត្រជើងឯកថ្នាក់ជាតិ",
    tagEn: "Honors",
    tagKh: "កិត្តិយស",
  },
  {
    id: "photo-29",
    num: "29",
    url: "https://res.cloudinary.com/dpgivqzrl/image/upload/v1786649334/708616050-1411688547651231-245747157063622069-n_pe1qxq.jpg",
    titleEn: "Official Technovation Girls Cambodia 2026 Champion Photo",
    titleKh: "រូបភាពផ្លូវការជើងឯក Technovation Girls 2026",
    tagEn: "Official Photo",
    tagKh: "រូបភាពផ្លូវការ",
  },
];

export function AwardsSection() {
  const { lang } = useLang();
  const kh = lang === "kh";
  const khFont = kh ? { fontFamily: "var(--font-system)" } : {};

  // Active Photo Index (Starts with 0 -> Photo #01)
  const [activeIndex, setActiveIndex] = useState<number>(0);
  
  // View Mode: 'cinema' (Stage + Filmstrip) or 'wall' (Full Grid Gallery)
  const [viewMode, setViewMode] = useState<"cinema" | "wall">("cinema");

  // Slideshow Autoplay State
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [progress, setProgress] = useState<number>(0);

  // Lightbox Modal Index State
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  // Thumbnail Scroll Reference
  const thumbnailRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const filmstripContainerRef = useRef<HTMLDivElement | null>(null);

  const totalPhotos = CHAMPION_PHOTOS.length;
  const currentPhoto = CHAMPION_PHOTOS[activeIndex];

  // Auto-scroll active thumbnail into view
  const scrollToThumbnail = useCallback((index: number) => {
    const el = thumbnailRefs.current[index];
    if (el && filmstripContainerRef.current) {
      el.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "center",
      });
    }
  }, []);

  const handleSelectPhoto = useCallback(
    (index: number) => {
      setActiveIndex(index);
      setProgress(0);
      scrollToThumbnail(index);
    },
    [scrollToThumbnail]
  );

  const handleNext = useCallback(() => {
    const nextIdx = (activeIndex + 1) % totalPhotos;
    handleSelectPhoto(nextIdx);
  }, [activeIndex, totalPhotos, handleSelectPhoto]);

  const handlePrev = useCallback(() => {
    const prevIdx = (activeIndex - 1 + totalPhotos) % totalPhotos;
    handleSelectPhoto(prevIdx);
  }, [activeIndex, totalPhotos, handleSelectPhoto]);

  // Autoplay Timer Loop (4 seconds per slide)
  useEffect(() => {
    if (!isPlaying || lightboxIndex !== null) {
      setProgress(0);
      return;
    }

    const intervalTime = 40; // update progress every 40ms
    const step = 100 / (4000 / intervalTime);

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          handleNext();
          return 0;
        }
        return prev + step;
      });
    }, intervalTime);

    return () => clearInterval(timer);
  }, [isPlaying, lightboxIndex, handleNext]);

  // Keyboard navigation for Lightbox modal
  useEffect(() => {
    if (lightboxIndex === null) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") {
        setLightboxIndex((prev) => (prev !== null ? (prev + 1) % totalPhotos : 0));
      } else if (e.key === "ArrowLeft") {
        setLightboxIndex((prev) => (prev !== null ? (prev - 1 + totalPhotos) % totalPhotos : 0));
      } else if (e.key === "Escape") {
        setLightboxIndex(null);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [lightboxIndex, totalPhotos]);

  return (
    <section className="relative bg-amber-500/10 border-b-2 border-black py-12 sm:py-16 md:py-20 overflow-hidden">
      {/* Top Caution Tape Accent */}
      <div className="absolute top-0 left-0 right-0 z-10">
        <CautionTape variant="caution" height={14} />
      </div>

      {/* Background Decorative Elements */}
      <div className="absolute inset-0 grid-bg opacity-30 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        
        {/* Section Header Banner */}
        <div className="flex flex-col items-center text-center mb-8 sm:mb-12">
          <div className="inline-flex items-center gap-2 bg-black text-amber-400 text-xs font-mono font-black tracking-widest uppercase px-4 py-1.5 border-2 border-black shadow-[3px_3px_0_#000] mb-4">
            <Trophy size={16} className="text-amber-400 animate-bounce" />
            <span>{kh ? "សមិទ្ធផលជើងឯក — CHAMPIONS SHOWCASE" : "NATIONAL CHAMPIONS SHOWCASE"}</span>
          </div>

          <h2
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black uppercase tracking-tight text-black text-balance"
            style={khFont}
          >
            {kh ? (
              <>
                ជើងឯកថ្នាក់ជាតិ <span className="bg-amber-400 px-2.5 py-0.5 border-2 border-black shadow-[3px_3px_0_#000]">២០២៦</span>
              </>
            ) : (
              <>
                NATIONAL CHAMPIONS <span className="bg-amber-400 px-2.5 py-0.5 border-2 border-black shadow-[3px_3px_0_#000]">2026</span>
              </>
            )}
          </h2>

          <p
            className="mt-3 text-base sm:text-lg md:text-xl font-black text-zinc-900 max-w-3xl text-balance"
            style={khFont}
          >
            Technovation Girls Cambodia x Future Digital Talents 2026
          </p>

          <div className="mt-3 flex items-center gap-2 text-xs font-mono font-bold text-zinc-700 bg-white/80 border border-black px-3 py-1 shadow-[2px_2px_0_#000]">
            <Camera size={14} className="text-amber-600" />
            <span>{kh ? `កម្រងរូបភាពជើងឯកចំនួន ២៩ រូបភាព` : `CHAMPION GALLERY — ALL 29 PHOTOS`}</span>
          </div>

          {/* Mode Switcher & Controls Bar */}
          <div className="flex flex-wrap items-center justify-center gap-3 mt-6 sm:mt-8">
            <div className="inline-flex bg-white border-2 border-black p-1 shadow-[3px_3px_0_#000]">
              <button
                onClick={() => setViewMode("cinema")}
                className={`flex items-center gap-2 text-xs font-black uppercase px-4 py-2 border border-black transition-all ${
                  viewMode === "cinema"
                    ? "bg-amber-400 text-black shadow-[2px_2px_0_#000]"
                    : "bg-transparent text-zinc-700 hover:bg-zinc-100"
                }`}
                style={khFont}
              >
                <Film size={14} />
                <span>{kh ? "របៀប SHOWCASE" : "CINEMA STAGE"}</span>
              </button>

              <button
                onClick={() => setViewMode("wall")}
                className={`flex items-center gap-2 text-xs font-black uppercase px-4 py-2 border border-black transition-all ${
                  viewMode === "wall"
                    ? "bg-amber-400 text-black shadow-[2px_2px_0_#000]"
                    : "bg-transparent text-zinc-700 hover:bg-zinc-100"
                }`}
                style={khFont}
              >
                <Grid size={14} />
                <span>{kh ? "រូបភាពទាំងអស់ (29)" : "PHOTO WALL (29)"}</span>
              </button>
            </div>

            {/* Play/Pause Control (for Cinema Mode) */}
            {viewMode === "cinema" && (
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="flex items-center gap-2 bg-black text-amber-400 text-xs font-mono font-black uppercase px-4 py-2.5 border-2 border-black shadow-[3px_3px_0_#000] hover:bg-zinc-900 transition-all active:translate-x-0.5 active:translate-y-0.5 cursor-pointer"
              >
                {isPlaying ? <Pause size={14} /> : <Play size={14} />}
                <span>{isPlaying ? (kh ? "ផ្អាកស្លាយ" : "PAUSE SLIDESHOW") : (kh ? "លេងស្លាយ" : "PLAY SLIDESHOW")}</span>
              </button>
            )}
          </div>
        </div>

        {/* ---------------------------------------------------- */}
        {/* CINEMA STAGE MODE (FEATURED HERO IMAGE + FILMSTRIP) */}
        {/* ---------------------------------------------------- */}
        {viewMode === "cinema" && (
          <div className="space-y-6">
            {/* Main Stage Frame */}
            <div className="bg-white border-[3px] border-black shadow-[8px_8px_0_#000] relative overflow-hidden">
              
              {/* Top Autoplay Progress Bar */}
              {isPlaying && (
                <div className="w-full bg-zinc-200 h-1.5 border-b border-black">
                  <div
                    className="bg-amber-400 h-full transition-all ease-linear"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              )}

              {/* Champion Badge Banner */}
              <div className="absolute top-3 left-3 z-20 flex flex-wrap items-center gap-2 pointer-events-none">
                <div className="bg-amber-400 border-2 border-black text-black font-black text-xs uppercase tracking-wider px-3 py-1 shadow-[3px_3px_0_#000] flex items-center gap-1.5">
                  <Trophy size={14} className="text-black" />
                  <span>★ #1 NATIONAL CHAMPION ★</span>
                </div>
                <div className="bg-black text-amber-400 border-2 border-black text-xs font-mono font-black uppercase px-2.5 py-1 shadow-[3px_3px_0_#000]">
                  PHOTO {currentPhoto.num} / {totalPhotos}
                </div>
              </div>

              {/* Lightbox / Zoom Trigger */}
              <button
                onClick={() => setLightboxIndex(activeIndex)}
                className="absolute top-3 right-3 z-20 w-10 h-10 bg-amber-400 border-2 border-black flex items-center justify-center text-black shadow-[3px_3px_0_#000] hover:bg-amber-300 transition-all cursor-pointer"
                title="Open Fullscreen Lightbox"
              >
                <Maximize2 size={18} />
              </button>

              {/* Stage Image Display Container */}
              <div className="relative aspect-[16/9] sm:aspect-[21/9] md:aspect-[21/9] min-h-[300px] sm:min-h-[420px] md:min-h-[500px] bg-zinc-950 flex items-center justify-center overflow-hidden">
                <img
                  key={currentPhoto.id}
                  src={currentPhoto.url}
                  alt={currentPhoto.titleEn}
                  className="w-full h-full object-cover transition-all duration-700 ease-out animate-fade-in"
                />

                {/* Bottom Overlay Gradient for Text Readability */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent pointer-events-none" />

                {/* Left/Right Navigation Overlay Buttons */}
                <button
                  onClick={handlePrev}
                  className="absolute left-3 sm:left-5 top-1/2 -translate-y-1/2 z-20 w-12 h-12 bg-amber-400 border-2 border-black flex items-center justify-center text-black shadow-[4px_4px_0_#000] hover:bg-amber-300 transition-all active:translate-x-0.5 active:translate-y-0.5 cursor-pointer"
                  aria-label="Previous photo"
                >
                  <ChevronLeft size={26} strokeWidth={3} />
                </button>

                <button
                  onClick={handleNext}
                  className="absolute right-3 sm:right-5 top-1/2 -translate-y-1/2 z-20 w-12 h-12 bg-amber-400 border-2 border-black flex items-center justify-center text-black shadow-[4px_4px_0_#000] hover:bg-amber-300 transition-all active:translate-x-0.5 active:translate-y-0.5 cursor-pointer"
                  aria-label="Next photo"
                >
                  <ChevronRight size={26} strokeWidth={3} />
                </button>

                {/* Photo Details Overlay Footer */}
                <div className="absolute bottom-4 left-4 right-4 sm:left-6 sm:right-6 z-10 flex flex-col sm:flex-row sm:items-end justify-between gap-3 text-white">
                  <div className="max-w-3xl space-y-1">
                    <div className="inline-flex items-center gap-2 bg-amber-400 text-black text-[11px] font-mono font-black uppercase px-2.5 py-1 border border-black shadow-[2px_2px_0_#000]">
                      <Award size={13} /> {kh ? currentPhoto.tagKh : currentPhoto.tagEn}
                    </div>
                    <h3 className="text-base sm:text-xl md:text-2xl font-black leading-snug drop-shadow-md" style={khFont}>
                      {kh ? currentPhoto.titleKh : currentPhoto.titleEn}
                    </h3>
                  </div>

                  <div className="flex items-center gap-2 self-start sm:self-auto">
                    <button
                      onClick={() => setLightboxIndex(activeIndex)}
                      className="bg-white text-black hover:bg-amber-300 text-xs font-black uppercase px-3 py-2 border-2 border-black shadow-[3px_3px_0_#000] inline-flex items-center gap-1.5 cursor-pointer transition-all"
                      style={khFont}
                    >
                      <Eye size={14} />
                      <span>{kh ? "មើលរូបពេញ" : "FULL VIEW"}</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Stage Bottom Bar */}
              <div className="bg-black text-amber-400 px-4 py-3 border-t-2 border-black flex flex-wrap items-center justify-between gap-3 text-xs font-mono font-bold">
                <div className="flex items-center gap-2">
                  <Sparkles size={14} className="text-amber-400 animate-spin" />
                  <span>NATIONAL CHAMPIONSHIP GALLERY 2026</span>
                </div>
                <div className="text-white">
                  PHOTO <span className="text-amber-400 font-black">{currentPhoto.num}</span> OF <span className="text-amber-400 font-black">{totalPhotos}</span>
                </div>
              </div>
            </div>

            {/* Scrollable Filmstrip Thumbnail Strip */}
            <div className="bg-white border-2 border-black p-3 sm:p-4 shadow-[6px_6px_0_#000]">
              <div className="flex items-center justify-between mb-3 px-1">
                <div className="flex items-center gap-2 text-xs font-mono font-black uppercase text-black">
                  <Layers size={15} className="text-amber-500" />
                  <span>{kh ? "កម្រងរូបភាពទាំងអស់ ២៩" : "FILMSTRIP SELECTOR (29 PHOTOS)"}</span>
                </div>
                <div className="text-[11px] font-bold text-zinc-500">
                  {kh ? "ចុចលើរូបដើម្បីជ្រើសរើស" : "Click thumbnail to view"}
                </div>
              </div>

              {/* Horizontal Scroll Area */}
              <div
                ref={filmstripContainerRef}
                className="flex items-center gap-3 overflow-x-auto pb-2 pt-1 scrollbar-thin scrollbar-thumb-amber-400 scrollbar-track-zinc-100"
              >
                {CHAMPION_PHOTOS.map((photo, idx) => {
                  const isActive = idx === activeIndex;
                  return (
                    <button
                      key={photo.id}
                      ref={(el) => {
                        thumbnailRefs.current[idx] = el;
                      }}
                      onClick={() => handleSelectPhoto(idx)}
                      className={`relative flex-shrink-0 w-24 sm:w-32 aspect-[4/3] border-2 border-black transition-all cursor-pointer overflow-hidden ${
                        isActive
                          ? "bg-amber-400 ring-4 ring-amber-400 ring-offset-2 ring-offset-black scale-105 shadow-[4px_4px_0_#000] z-10"
                          : "bg-zinc-200 hover:bg-amber-200 opacity-75 hover:opacity-100 shadow-[2px_2px_0_#000]"
                      }`}
                    >
                      <img
                        src={photo.url}
                        alt={photo.titleEn}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                      
                      {/* Thumbnail Number Pill */}
                      <div className={`absolute top-1 left-1 text-[10px] font-mono font-black px-1.5 py-0.5 border border-black ${
                        isActive ? "bg-black text-amber-400" : "bg-white/90 text-black"
                      }`}>
                        {photo.num}
                      </div>

                      {isActive && (
                        <div className="absolute inset-0 border-2 border-amber-400 pointer-events-none" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ---------------------------------------------------- */}
        {/* PHOTO WALL GRID MODE (DISPLAY ALL 29 PHOTOS SIDE BY SIDE) */}
        {/* ---------------------------------------------------- */}
        {viewMode === "wall" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
              {CHAMPION_PHOTOS.map((photo, idx) => (
                <div
                  key={photo.id}
                  onClick={() => {
                    setActiveIndex(idx);
                    setLightboxIndex(idx);
                  }}
                  className="group bg-white border-2 border-black p-2.5 shadow-[4px_4px_0_#000] hover:shadow-[7px_7px_0_#000] transition-all duration-300 hover:-translate-y-1 cursor-pointer flex flex-col justify-between"
                >
                  <div className="relative aspect-[4/3] overflow-hidden border border-black bg-zinc-950">
                    <img
                      src={photo.url}
                      alt={photo.titleEn}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                    />

                    {/* Image Number Badge */}
                    <div className="absolute top-2 left-2 bg-black text-amber-400 text-[10px] font-mono font-black px-2 py-0.5 border border-black shadow-[2px_2px_0_#000]">
                      #{photo.num}
                    </div>

                    <div className="absolute top-2 right-2 bg-amber-400 text-black text-[10px] font-mono font-black px-2 py-0.5 border border-black shadow-[2px_2px_0_#000]">
                      {kh ? photo.tagKh : photo.tagEn}
                    </div>

                    {/* Hover Zoom Icon */}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <div className="w-10 h-10 bg-amber-400 border-2 border-black flex items-center justify-center shadow-[3px_3px_0_#000] text-black font-black">
                        <Maximize2 size={18} />
                      </div>
                    </div>
                  </div>

                  <div className="pt-2.5 px-1">
                    <h4 className="text-xs font-bold text-black line-clamp-2 leading-snug" style={khFont}>
                      {kh ? photo.titleKh : photo.titleEn}
                    </h4>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons Section */}
        <div className="mt-10 sm:mt-12 flex flex-wrap items-center justify-center gap-4 border-t-2 border-black/20 pt-8">
          <Link
            href="/about"
            className="nb-btn bg-amber-400 text-black hover:bg-amber-300 text-sm font-black uppercase tracking-wider px-6 py-3.5 border-2 border-black shadow-[4px_4px_0_#000] inline-flex items-center gap-2 transition-all hover:translate-x-0.5 hover:translate-y-0.5"
            style={khFont}
          >
            <span>{kh ? "អានអំពីក្រុមយើង" : "Learn Team Story"}</span>
            <ArrowRight size={16} />
          </Link>

          <Link
            href="/Regional-Pitch-Event"
            className="bg-white text-black hover:bg-zinc-100 text-sm font-black uppercase tracking-wider px-6 py-3.5 border-2 border-black shadow-[4px_4px_0_#000] inline-flex items-center gap-2 transition-all hover:translate-x-0.5 hover:translate-y-0.5"
            style={khFont}
          >
            <Award size={16} />
            <span>{kh ? "ទស្សនា PITCH EVENT" : "View Regional Pitch"}</span>
          </Link>
        </div>
      </div>

      {/* ---------------------------------------------------- */}
      {/* FULLSCREEN LIGHTBOX MODAL VIEWER */}
      {/* ---------------------------------------------------- */}
      {lightboxIndex !== null && (
        <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-3 sm:p-6 animate-fade-in">
          <div className="relative max-w-5xl w-full bg-white border-[3px] border-black shadow-[12px_12px_0_#000] overflow-hidden flex flex-col max-h-[92vh]">
            
            {/* Top Modal Header */}
            <div className="bg-black text-white px-4 py-3 border-b-2 border-black flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-mono font-bold text-amber-400">
                <Trophy size={16} />
                <span>
                  NATIONAL CHAMPION PHOTO {CHAMPION_PHOTOS[lightboxIndex].num} OF {totalPhotos}
                </span>
              </div>

              <button
                onClick={() => setLightboxIndex(null)}
                className="w-9 h-9 bg-amber-400 text-black border-2 border-black flex items-center justify-center font-black hover:bg-amber-300 cursor-pointer shadow-[2px_2px_0_#000]"
                title="Close (Esc)"
              >
                <X size={20} />
              </button>
            </div>

            {/* Lightbox Center Image Stage */}
            <div className="relative bg-zinc-950 flex items-center justify-center p-2 min-h-[350px] sm:min-h-[500px] flex-1 overflow-hidden">
              <img
                key={CHAMPION_PHOTOS[lightboxIndex].id}
                src={CHAMPION_PHOTOS[lightboxIndex].url}
                alt={CHAMPION_PHOTOS[lightboxIndex].titleEn}
                className="max-h-[68vh] w-auto object-contain border border-zinc-800 animate-fade-in"
              />

              {/* Prev / Next Buttons */}
              <button
                onClick={() => setLightboxIndex((lightboxIndex - 1 + totalPhotos) % totalPhotos)}
                className="absolute left-3 top-1/2 -translate-y-1/2 w-11 h-11 bg-amber-400 border-2 border-black flex items-center justify-center text-black shadow-[4px_4px_0_#000] hover:bg-amber-300 cursor-pointer transition-all active:translate-x-0.5 active:translate-y-0.5"
                title="Previous photo (Left Arrow)"
              >
                <ChevronLeft size={24} strokeWidth={3} />
              </button>

              <button
                onClick={() => setLightboxIndex((lightboxIndex + 1) % totalPhotos)}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-11 h-11 bg-amber-400 border-2 border-black flex items-center justify-center text-black shadow-[4px_4px_0_#000] hover:bg-amber-300 cursor-pointer transition-all active:translate-x-0.5 active:translate-y-0.5"
                title="Next photo (Right Arrow)"
              >
                <ChevronRight size={24} strokeWidth={3} />
              </button>
            </div>

            {/* Bottom Caption & Mini Selector */}
            <div className="p-4 bg-white border-t-2 border-black flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <span className="inline-block bg-black text-amber-400 text-[10px] font-mono font-black uppercase px-2 py-0.5 mb-1 border border-black">
                  {kh ? CHAMPION_PHOTOS[lightboxIndex].tagKh : CHAMPION_PHOTOS[lightboxIndex].tagEn}
                </span>
                <h3 className="text-sm sm:text-base font-black text-black" style={khFont}>
                  {kh ? CHAMPION_PHOTOS[lightboxIndex].titleKh : CHAMPION_PHOTOS[lightboxIndex].titleEn}
                </h3>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-auto text-xs font-mono font-bold text-zinc-600">
                <span>Use ← → keys to navigate</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
