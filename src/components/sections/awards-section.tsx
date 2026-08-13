"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Trophy,
  Award,
  Sparkles,
  ArrowRight,
  Maximize2,
  ChevronLeft,
  ChevronRight,
  X,
  Eye,
  Camera,
  ShieldCheck,
  MapPin,
  Users,
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
    url: "https://res.cloudinary.com/dpgivqzrl/image/upload/v1786649331/03_zzcanc.jpg",
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

  // Active Photo Index (Starts at 0 -> Photo #01)
  const [activeIndex, setActiveIndex] = useState<number>(0);
  
  // Lightbox Modal Index State
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const totalPhotos = CHAMPION_PHOTOS.length;
  const currentPhoto = CHAMPION_PHOTOS[activeIndex];

  // Pure state change handler (NO scrollIntoView, NO screen jumping!)
  const handleSelectPhoto = useCallback((index: number) => {
    setActiveIndex(index);
  }, []);

  const handleNext = useCallback(() => {
    setActiveIndex((prev) => (prev + 1) % totalPhotos);
  }, [totalPhotos]);

  const handlePrev = useCallback(() => {
    setActiveIndex((prev) => (prev - 1 + totalPhotos) % totalPhotos);
  }, [totalPhotos]);

  // Smooth Auto-Slide Timer (5 seconds) — pure state update, NO scroll hijacking!
  useEffect(() => {
    if (lightboxIndex !== null) return;

    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % totalPhotos);
    }, 5000);

    return () => clearInterval(timer);
  }, [lightboxIndex, totalPhotos]);

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
    <section className="relative bg-amber-50 text-black border-b-4 border-black py-12 sm:py-16 md:py-20 overflow-hidden">
      {/* Gold Top Caution Tape Accent */}
      <div className="absolute top-0 left-0 right-0 z-10">
        <CautionTape variant="caution" height={14} />
      </div>

      {/* Hero Dot / Grid Background Accent */}
      <div className="absolute inset-0 hero-dot-bg opacity-30 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        
        {/* ── SECTION HEADER ── */}
        <div className="flex flex-col items-center text-center mb-8 sm:mb-12">
          <div className="inline-flex items-center gap-2 bg-amber-400 text-black text-xs font-mono font-black tracking-widest uppercase px-4 py-1.5 border-2 border-black shadow-[4px_4px_0_#000] mb-4">
            <Trophy size={16} className="text-black animate-bounce" />
            <span>{kh ? "សមិទ្ធផលជើងឯកថ្នាក់ជាតិ — NATIONAL CHAMPIONS" : "NATIONAL CHAMPIONS 2026 SHOWCASE"}</span>
          </div>

          <h2
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black uppercase tracking-tight text-black text-balance"
            style={khFont}
          >
            {kh ? (
              <>
                ជើងឯកថ្នាក់ជាតិ <span className="bg-amber-400 text-black px-3 py-0.5 border-2 border-black shadow-[3px_3px_0_#000]">២០២៦</span>
              </>
            ) : (
              <>
                NATIONAL CHAMPIONS <span className="bg-amber-400 text-black px-3 py-0.5 border-2 border-black shadow-[3px_3px_0_#000]">2026</span>
              </>
            )}
          </h2>

          <p
            className="mt-3 text-base sm:text-lg md:text-xl font-black text-amber-800 max-w-3xl text-balance"
            style={khFont}
          >
            Technovation Girls Cambodia x Future Digital Talents 2026
          </p>
        </div>

        {/* ── CHAMPION FEATURED SPOTLIGHT STAGE (FULL UNUNCROPPED IMAGE DISPLAY) ── */}
        <div className="bg-white border-[3px] border-black shadow-[10px_10px_0_#000] relative overflow-hidden">
          
          {/* Top Gold Header Bar */}
          <div className="bg-amber-400 text-black px-4 py-2.5 border-b-2 border-black flex flex-wrap items-center justify-between gap-2 text-xs font-mono font-black uppercase">
            <div className="flex items-center gap-2">
              <Trophy size={16} />
              <span>★ #1 NATIONAL CHAMPION SPOTLIGHT ★</span>
            </div>
            <div className="bg-black text-amber-400 px-3 py-0.5 border border-black shadow-[2px_2px_0_#000]">
              PHOTO {currentPhoto.num} / {totalPhotos}
            </div>
          </div>

          {/* Full Image Presentation Container (Light Studio Stage, No Black Screen) */}
          <div
            onClick={() => setLightboxIndex(activeIndex)}
            className="relative bg-amber-100/50 hero-dot-bg border-y-2 border-black min-h-[340px] sm:min-h-[480px] md:min-h-[580px] flex items-center justify-center p-4 cursor-pointer group overflow-hidden"
          >
            <img
              key={currentPhoto.id}
              src={currentPhoto.url}
              alt={currentPhoto.titleEn}
              onError={() => {
                // If photo fails to load, automatically skip to next photo
                handleNext();
              }}
              className="max-h-[70vh] w-auto max-w-full object-contain mx-auto transition-all duration-500 ease-out animate-fade-in shadow-2xl border-2 border-black bg-white"
            />

            {/* Previous & Next Tap Arrows */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                handlePrev();
              }}
              className="absolute left-3 sm:left-5 top-1/2 -translate-y-1/2 z-20 w-12 h-12 bg-amber-400 border-2 border-black flex items-center justify-center text-black shadow-[4px_4px_0_#000] hover:bg-amber-300 transition-all active:scale-95 cursor-pointer"
              aria-label="Previous champion photo"
            >
              <ChevronLeft size={28} strokeWidth={3} />
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                handleNext();
              }}
              className="absolute right-3 sm:right-5 top-1/2 -translate-y-1/2 z-20 w-12 h-12 bg-amber-400 border-2 border-black flex items-center justify-center text-black shadow-[4px_4px_0_#000] hover:bg-amber-300 transition-all active:scale-95 cursor-pointer"
              aria-label="Next champion photo"
            >
              <ChevronRight size={28} strokeWidth={3} />
            </button>

            {/* Tap to Enlarge Hover Badge */}
            <div className="absolute top-4 right-4 bg-black text-amber-400 text-xs font-mono font-black uppercase px-3 py-1.5 border border-black opacity-90 group-hover:opacity-100 transition-opacity flex items-center gap-1.5 shadow-[2px_2px_0_#000]">
              <Maximize2 size={14} />
              <span>{kh ? "ចុចដើម្បីមើលរូបពេញ" : "TAP FOR FULL VIEW"}</span>
            </div>
          </div>

          {/* Champion Photo Caption Banner */}
          <div className="p-4 sm:p-6 bg-zinc-50 border-t-2 border-black flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1 max-w-3xl">
              <div className="inline-flex items-center gap-2 bg-amber-400 text-black text-xs font-mono font-black uppercase px-2.5 py-0.5 border border-black shadow-[2px_2px_0_#000]">
                <Award size={13} /> {kh ? currentPhoto.tagKh : currentPhoto.tagEn}
              </div>
              <h3 className="text-base sm:text-xl font-black text-black leading-snug" style={khFont}>
                {kh ? currentPhoto.titleKh : currentPhoto.titleEn}
              </h3>
            </div>

            <button
              onClick={() => setLightboxIndex(activeIndex)}
              className="bg-amber-400 text-black hover:bg-amber-300 text-xs font-mono font-black uppercase px-4 py-2.5 border-2 border-black shadow-[3px_3px_0_#000] inline-flex items-center gap-1.5 transition-all cursor-pointer"
              style={khFont}
            >
              <Eye size={14} />
              <span>{kh ? "មើលរូបភាពពេញ" : "FULL VIEW"}</span>
            </button>
          </div>
        </div>

        {/* ── THUMBNAIL TAP STRIP (FREE SCROLL, NO SCREEN HIJACKING!) ── */}
        <div className="mt-6 bg-white border-2 border-black p-3 sm:p-4 shadow-[6px_6px_0_#000]">
          <div className="flex items-center justify-between mb-3 px-1">
            <div className="flex items-center gap-2 text-xs font-mono font-black uppercase text-black">
              <Camera size={15} />
              <span>{kh ? "រូបភាពជើងឯកទាំង ២៩" : "ALL 29 CHAMPION PHOTOS (TAP TO VIEW)"}</span>
            </div>
            <div className="text-[11px] font-mono font-bold text-zinc-600">
              Photo {currentPhoto.num} of {totalPhotos}
            </div>
          </div>

          <div className="flex items-center gap-2.5 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-amber-400 scrollbar-track-zinc-100">
            {CHAMPION_PHOTOS.map((photo, idx) => {
              const isActive = idx === activeIndex;
              return (
                <button
                  key={photo.id}
                  onClick={() => handleSelectPhoto(idx)}
                  className={`relative flex-shrink-0 w-24 sm:w-28 aspect-[4/3] border-2 transition-all cursor-pointer overflow-hidden ${
                    isActive
                      ? "border-black bg-amber-400 scale-105 shadow-[3px_3px_0_#000] z-10"
                      : "border-zinc-300 bg-zinc-100 opacity-70 hover:opacity-100 hover:border-black"
                  }`}
                >
                  <img
                    src={photo.url}
                    alt={photo.titleEn}
                    onError={(e) => {
                      // Hide missing image container
                      const target = e.target as HTMLElement;
                      if (target.parentElement) {
                        target.parentElement.style.display = 'none';
                      }
                    }}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                  <div className={`absolute top-1 left-1 text-[9px] font-mono font-black px-1 py-0.2 border ${
                    isActive ? "bg-black text-amber-400 border-black" : "bg-white/90 text-black border-black"
                  }`}>
                    {photo.num}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── FULLSCREEN LIGHTBOX MODAL VIEWER ── */}
      {lightboxIndex !== null && (
        <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-3 sm:p-6 animate-fade-in">
          <div className="relative max-w-5xl w-full bg-zinc-900 border-[3px] border-amber-400 shadow-[12px_12px_0_#000] overflow-hidden flex flex-col max-h-[92vh]">
            
            <div className="bg-amber-400 text-black px-4 py-3 border-b-2 border-black flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-mono font-black uppercase">
                <Trophy size={16} />
                <span>
                  NATIONAL CHAMPION PHOTO {CHAMPION_PHOTOS[lightboxIndex].num} OF {totalPhotos}
                </span>
              </div>

              <button
                onClick={() => setLightboxIndex(null)}
                className="w-9 h-9 bg-black text-amber-400 border border-black flex items-center justify-center font-black hover:bg-zinc-800 cursor-pointer shadow-[2px_2px_0_#000]"
                title="Close (Esc)"
              >
                <X size={20} />
              </button>
            </div>

            <div className="relative bg-black flex items-center justify-center p-3 min-h-[350px] sm:min-h-[500px] flex-1 overflow-hidden">
              <img
                key={CHAMPION_PHOTOS[lightboxIndex].id}
                src={CHAMPION_PHOTOS[lightboxIndex].url}
                alt={CHAMPION_PHOTOS[lightboxIndex].titleEn}
                className="max-h-[70vh] w-auto max-w-full object-contain mx-auto border border-zinc-800 animate-fade-in"
              />

              <button
                onClick={() => setLightboxIndex((lightboxIndex - 1 + totalPhotos) % totalPhotos)}
                className="absolute left-3 top-1/2 -translate-y-1/2 w-11 h-11 bg-amber-400 border-2 border-black flex items-center justify-center text-black shadow-[4px_4px_0_#000] hover:bg-amber-300 cursor-pointer transition-all active:scale-95"
                title="Previous photo (Left Arrow)"
              >
                <ChevronLeft size={26} strokeWidth={3} />
              </button>

              <button
                onClick={() => setLightboxIndex((lightboxIndex + 1) % totalPhotos)}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-11 h-11 bg-amber-400 border-2 border-black flex items-center justify-center text-black shadow-[4px_4px_0_#000] hover:bg-amber-300 cursor-pointer transition-all active:scale-95"
                title="Next photo (Right Arrow)"
              >
                <ChevronRight size={26} strokeWidth={3} />
              </button>
            </div>

            <div className="p-4 bg-zinc-900 border-t-2 border-black flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-white">
              <div>
                <span className="inline-block bg-amber-400 text-black text-[10px] font-mono font-black uppercase px-2 py-0.5 mb-1 border border-black">
                  {kh ? CHAMPION_PHOTOS[lightboxIndex].tagKh : CHAMPION_PHOTOS[lightboxIndex].tagEn}
                </span>
                <h3 className="text-sm sm:text-base font-black text-white" style={khFont}>
                  {kh ? CHAMPION_PHOTOS[lightboxIndex].titleKh : CHAMPION_PHOTOS[lightboxIndex].titleEn}
                </h3>
              </div>

              <div className="text-xs font-mono font-bold text-amber-400">
                Use ← → keys to navigate
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
