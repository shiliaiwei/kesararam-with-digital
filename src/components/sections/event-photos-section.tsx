"use client";

import { useState } from "react";
import { Camera, Maximize2, X, ChevronLeft, ChevronRight, Award, MapPin, Sparkles, Filter } from "lucide-react";
import { useLang } from "@/context/lang-context";
import { CautionTape } from "@/components/brand/brand-kit";

interface EventPhoto {
  id: string;
  url: string;
  titleEn: string;
  titleKh: string;
  category: "technovation" | "pitch" | "outreach" | "all";
  tagEn: string;
  tagKh: string;
  date: string;
}

const SAMPLE_EVENT_PHOTOS: EventPhoto[] = [
  {
    id: "p1",
    url: "https://res.cloudinary.com/dpgivqzrl/image/upload/v1783435140/OURTEAMFOUNDER_wcg9ao.webp",
    titleEn: "Technovation Girls Cambodia 2026 — National Champion Award",
    titleKh: "ពិធីប្រគល់ពានរង្វាន់ជើងឯកថ្នាក់ជាតិ Technovation Girls 2026",
    category: "technovation",
    tagEn: "National Award",
    tagKh: "ពានរង្វាន់ថ្នាក់ជាតិ",
    date: "2026",
  },
  {
    id: "p2",
    url: "https://res.cloudinary.com/dpgivqzrl/image/upload/v1783437729/DSC_1031_pxbzfi.jpg",
    titleEn: "Technovation Regional Pitch Day Presentation & Judges Demo",
    titleKh: "ការបង្ហាញ Pitch ថ្នាក់តំបន់ និងការធ្វើ Demo ជូនគណៈកម្មការ",
    category: "pitch",
    tagEn: "Regional Pitch",
    tagKh: "Pitch ថ្នាក់តំបន់",
    date: "2026",
  },
  {
    id: "p3",
    url: "https://res.cloudinary.com/dpgivqzrl/image/upload/v1775760771/00057File_d4gnzg.jpg",
    titleEn: "KWD School Outreach & Student Road Safety Training",
    titleKh: "ការចុះបង្រៀនសុវត្ថិភាពចរាចរណ៍នៅតាមសាលារៀន",
    category: "outreach",
    tagEn: "School Outreach",
    tagKh: "ចុះសាលារៀន",
    date: "2026",
  },
  {
    id: "p4",
    url: "https://res.cloudinary.com/dpgivqzrl/image/upload/v1775760782/00078File_mqcrbt.jpg",
    titleEn: "Interactive Road Safety Quiz & Student Sign Practice Session",
    titleKh: "សកម្មភាពធ្វើតេស្តអន្តរកម្ម និងការស្គាល់សញ្ញាចរាចរណ៍",
    category: "outreach",
    tagEn: "Interactive Workshop",
    tagKh: "សកម្មភាពសិស្ស",
    date: "2026",
  },
  {
    id: "p5",
    url: "https://res.cloudinary.com/dpgivqzrl/image/upload/v1775760777/00074File_a4s9d1.jpg",
    titleEn: "Team #50777 Mentorship & App Presentation Review",
    titleKh: "ការរៀបចំ និងត្រួតពិនិត្យការបង្ហាញកម្មវិធីជាមួយ Mentors",
    category: "pitch",
    tagEn: "Mentorship",
    tagKh: "ការណែនាំ Pitch",
    date: "2026",
  },
  {
    id: "p6",
    url: "https://res.cloudinary.com/dpgivqzrl/image/upload/v1775760788/00081File_vs67kw.jpg",
    titleEn: "Community Road Safety Awareness Event — Siem Reap",
    titleKh: "ព្រឹត្តិការណ៍ផ្សព្វផ្សាយសុវត្ថិភាពចរាចរណ៍ ខេត្តសៀមរាប",
    category: "outreach",
    tagEn: "Siem Reap Event",
    tagKh: "ព្រឹត្តិការណ៍សៀមរាប",
    date: "2026",
  },
  {
    id: "p7",
    url: "https://res.cloudinary.com/dpgivqzrl/image/upload/v1775760665/00058File_kxtz1c.jpg",
    titleEn: "Student Team Collaboration & Digital Learning Workshop",
    titleKh: "ការធ្វើការងារជាក្រុម និងការរៀនតាមបច្ចេកវិទ្យា",
    category: "outreach",
    tagEn: "Workshop",
    tagKh: "សិក្ខាសាលា",
    date: "2026",
  },
  {
    id: "p8",
    url: "https://res.cloudinary.com/dpgivqzrl/image/upload/v1775760668/00088File_pgummw.jpg",
    titleEn: "National Championship Judging & Q&A Session",
    titleKh: "វគ្គឆ្លើយសំណួរជាមួយគណៈកម្មការថ្នាក់ជាតិ",
    category: "technovation",
    tagEn: "National Finals",
    tagKh: "វគ្គផ្តាច់ព្រ័ត្រ",
    date: "2026",
  },
];

export function EventPhotosSection() {
  const { lang } = useLang();
  const kh = lang === "kh";
  const khFont = kh ? { fontFamily: "var(--font-system)" } : {};

  // Active Category Filter
  const [activeFilter, setActiveFilter] = useState<string>("all");

  // Lightbox Modal State
  const [activePhotoIdx, setActivePhotoIdx] = useState<number | null>(null);

  const filteredPhotos =
    activeFilter === "all"
      ? SAMPLE_EVENT_PHOTOS
      : SAMPLE_EVENT_PHOTOS.filter((p) => p.category === activeFilter);

  const handleNextPhoto = () => {
    if (activePhotoIdx !== null) {
      setActivePhotoIdx((activePhotoIdx + 1) % filteredPhotos.length);
    }
  };

  const handlePrevPhoto = () => {
    if (activePhotoIdx !== null) {
      setActivePhotoIdx((activePhotoIdx - 1 + filteredPhotos.length) % filteredPhotos.length);
    }
  };

  return (
    <section className="bg-zinc-50 border-b-2 border-black py-14 md:py-20 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        
        {/* Header Badge */}
        <div className="flex flex-col items-center text-center mb-10">
          <div
            className="inline-flex items-center gap-2 bg-black text-amber-400 text-xs font-mono font-black tracking-widest uppercase px-4 py-1.5 border-2 border-black shadow-[3px_3px_0_#000] mb-3"
            style={khFont}
          >
            <Camera size={14} className="text-amber-400" />
            <span>{kh ? "រូបភាពសកម្មភាព និងព្រឹត្តិការណ៍" : "EVENT PHOTOS & GALLERY"}</span>
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-black uppercase tracking-tight" style={khFont}>
            {kh ? (
              <>
                កម្រងរូបភាព <span className="bg-amber-400 px-2 py-0.5 border-2 border-black shadow-[3px_3px_0_#000]">ព្រឹត្តិការណ៍</span> KWD
              </>
            ) : (
              <>
                OUR EVENT <span className="bg-amber-400 px-2 py-0.5 border-2 border-black shadow-[3px_3px_0_#000]">HIGHLIGHTS</span>
              </>
            )}
          </h2>

          <p className="mt-3 text-base sm:text-lg font-medium text-zinc-600 max-w-2xl" style={khFont}>
            {kh
              ? "សកម្មភាពពីការប្រកួត Technovation Girls 2026 ការបង្ហាញ Pitch ថ្នាក់តំបន់ និងការចុះផ្សព្វផ្សាយនៅតាមសាលារៀន"
              : "Moments from Technovation Girls 2026, Regional Pitch competition, school visits, and community workshops."}
          </p>

          {/* Category Filter Tabs */}
          <div className="flex flex-wrap items-center justify-center gap-2 mt-6">
            {[
              { id: "all", labelEn: "All Photos", labelKh: "រូបភាពទាំងអស់" },
              { id: "technovation", labelEn: "Technovation 2026", labelKh: "Technovation ២០២៦" },
              { id: "pitch", labelEn: "Regional Pitch", labelKh: "Pitch ថ្នាក់តំបន់" },
              { id: "outreach", labelEn: "School Outreach", labelKh: "ចុះសាលារៀន" },
            ].map((tab) => {
              const isActive = activeFilter === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveFilter(tab.id)}
                  className={`text-xs font-black uppercase px-4 py-2 border-2 border-black transition-all cursor-pointer ${
                    isActive
                      ? "bg-amber-400 text-black shadow-[3px_3px_0_#000] -translate-y-0.5"
                      : "bg-white text-zinc-800 hover:bg-zinc-100 shadow-[2px_2px_0_#000]"
                  }`}
                  style={khFont}
                >
                  {kh ? tab.labelKh : tab.labelEn}
                </button>
              );
            })}
          </div>
        </div>

        {/* Gallery Image Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {filteredPhotos.map((photo, idx) => (
            <div
              key={photo.id}
              onClick={() => setActivePhotoIdx(idx)}
              className="group bg-white border-2 border-black p-2 shadow-[4px_4px_0_#000] hover:shadow-[6px_6px_0_#000] transition-all duration-300 hover:-translate-y-1 cursor-pointer flex flex-col justify-between"
            >
              <div className="relative aspect-[4/3] overflow-hidden border border-black bg-zinc-900">
                <img
                  src={photo.url}
                  alt={photo.titleEn}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                />
                
                {/* Image Overlay Badge */}
                <div className="absolute top-2 left-2 bg-black text-amber-400 text-[10px] font-mono font-black uppercase px-2 py-0.5 border border-black shadow-[2px_2px_0_#000]">
                  {kh ? photo.tagKh : photo.tagEn}
                </div>

                {/* Hover Zoom Icon */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <div className="w-10 h-10 bg-amber-400 border-2 border-black flex items-center justify-center shadow-[2px_2px_0_#000] text-black">
                    <Maximize2 size={18} />
                  </div>
                </div>
              </div>

              {/* Photo Title Footer */}
              <div className="p-2.5">
                <h4 className="text-xs font-bold text-black line-clamp-2 leading-snug" style={khFont}>
                  {kh ? photo.titleKh : photo.titleEn}
                </h4>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Lightbox Modal View */}
      {activePhotoIdx !== null && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 animate-fade-in">
          <div className="relative max-w-4xl w-full bg-white border-[3px] border-black shadow-[10px_10px_0_#000] overflow-hidden flex flex-col max-h-[90vh]">
            {/* Top Bar */}
            <div className="bg-black text-white px-4 py-3 border-b-2 border-black flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-mono font-bold text-amber-400">
                <Camera size={16} /> PHOTO {activePhotoIdx + 1} OF {filteredPhotos.length}
              </div>
              <button
                onClick={() => setActivePhotoIdx(null)}
                className="w-8 h-8 bg-amber-400 text-black border border-black flex items-center justify-center font-bold hover:bg-amber-300"
              >
                <X size={18} />
              </button>
            </div>

            {/* Photo Preview Container */}
            <div className="relative bg-zinc-950 flex items-center justify-center p-2 min-h-[350px] sm:min-h-[480px]">
              <img
                src={filteredPhotos[activePhotoIdx].url}
                alt={filteredPhotos[activePhotoIdx].titleEn}
                className="max-h-[65vh] w-auto object-contain border border-zinc-800"
              />

              {/* Prev / Next Buttons */}
              <button
                onClick={handlePrevPhoto}
                className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-amber-400 border-2 border-black flex items-center justify-center text-black shadow-[3px_3px_0_#000] hover:bg-amber-300"
              >
                <ChevronLeft size={22} strokeWidth={3} />
              </button>
              <button
                onClick={handleNextPhoto}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-amber-400 border-2 border-black flex items-center justify-center text-black shadow-[3px_3px_0_#000] hover:bg-amber-300"
              >
                <ChevronRight size={22} strokeWidth={3} />
              </button>
            </div>

            {/* Modal Bottom Caption */}
            <div className="p-4 bg-white border-t-2 border-black flex items-center justify-between gap-4">
              <div>
                <span className="inline-block bg-black text-amber-400 text-[10px] font-mono font-black uppercase px-2 py-0.5 mb-1">
                  {kh ? filteredPhotos[activePhotoIdx].tagKh : filteredPhotos[activePhotoIdx].tagEn}
                </span>
                <h3 className="text-sm sm:text-base font-black text-black" style={khFont}>
                  {kh ? filteredPhotos[activePhotoIdx].titleKh : filteredPhotos[activePhotoIdx].titleEn}
                </h3>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
