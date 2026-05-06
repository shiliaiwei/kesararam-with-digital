"use client";

import { useState, useEffect, useRef, Fragment } from "react";
import { Search, ArrowLeft, X, Volume2, Download } from "lucide-react";
import { useLang } from "@/context/lang-context";
import { SaveCardButton } from "./save-card-button";

interface Topic {
  id: number;
  topic_code: string;
  name_en: string;
  name_km: string;
  description_en: string;
  description_km: string;
  primary_image_url: string;
  sub_group: string;
  law_reference: string;
  audio_url_en: string;
  audio_url_km: string;
}

const SUB_GROUPS: { key: string; en: string; km: string }[] = [
  { key: "Prohibitory Signs", en: "Prohibitory", km: "ហាមឃាត់" },
  { key: "Mandatory Signs", en: "Mandatory", km: "បង្គាប់" },
  { key: "Priority Signs", en: "Priority", km: "អាទិភាព" },
  { key: "Warning Signs", en: "Warning", km: "ព្រមាន" },
  { key: "Temporary Signs", en: "Temporary", km: "បណ្ដោះអាសន្ន" },
  { key: "Direction Signs", en: "Direction", km: "ទិសដៅ" },
  { key: "Buildup Area Boundary Signs", en: "Area Boundary", km: "ព្រំដែនតំបន់" },
  { key: "Street Name Signs", en: "Street Name", km: "ឈ្មោះផ្លូវវិថី" },
  { key: "Informative Signs", en: "Informative", km: "ព័ត៌មាន" },
  { key: "Supplementary Signs", en: "Supplementary", km: "បន្ថែម" },
  { key: "Sign Posts", en: "Sign Posts", km: "បង្គោលសញ្ញា" },
  { key: "Transverse Markings", en: "Transverse", km: "ចំណារឆ្លងកាត់" },
  { key: "Longitudinal Markings", en: "Longitudinal", km: "ចំណារបណ្ដោយ" },
  { key: "Arrows Markings", en: "Arrows", km: "ចំណារព្រួញ" },
  { key: "Other Road Markings", en: "Other Markings", km: "ចំណារផ្សេងទៀត" },
  { key: "Traffic Lights", en: "Traffic Lights", km: "ភ្លើងសញ្ញា" },
  { key: "Traffic Police Signals", en: "Police Signals", km: "សញ្ញាប៉ូលិស" },
];

// Default: show all signs on entry. User can tap a tag to filter.
function getDefaultFilter(): string {
  return "";
}

const UI = {
  en: {
    backButton: "Back to Categories",
    searchPlaceholder: "Search by sign name or code...",
    all: "All Signs",
    showing: "Showing", of: "of", signs: "signs",
    noSigns: "No signs found",
    lawRef: "Law Reference",
    relatedQ: "Related Questions",
    loadingQ: "Loading questions...",
    playAudio: "Play Audio",
    stopAudio: "Stop Audio",
    reset: "Reset",
  },
  kh: {
    backButton: "ត្រឡប់ទៅប្រភេទ",
    searchPlaceholder: "ស្វែងរកតាមឈ្មោះ ឬលេខកូដសញ្ញា...",
    all: "សញ្ញាទាំងអស់",
    showing: "បង្ហាញ", of: "នៃ", signs: "សញ្ញា",
    noSigns: "រកមិនឃើញសញ្ញា",
    lawRef: "ឯកសារយោងច្បាប់",
    relatedQ: "សំណួរពាក់ព័ន្ធ",
    loadingQ: "កំពុងផ្ទុកសំណួរ...",
    playAudio: "ចាក់សំឡេង",
    stopAudio: "ឈប់សំឡេង",
    reset: "កំណត់ឡើងវិញ",
  },
} as const;

// ── Detail Panel ──────────────────────────────────────────────────────────────
function DetailPanel({
  topic, questions, loadingQuestions, isKh, kf, t, onClose,
}: {
  topic: Topic;
  questions: any[];
  loadingQuestions: boolean;
  isKh: boolean;
  kf: React.CSSProperties;
  t: typeof UI.en;
  onClose: () => void;
}) {
  const [playing, setPlaying] = useState(false);
  const [loadingAudio, setLoadingAudio] = useState(false);
  // Use a ref so the stop handler always has the current audio instance
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const playingRef = useRef(false);
  const panelRef = useRef<HTMLDivElement>(null);

  const name = isKh ? topic.name_km : topic.name_en;
  const description = isKh ? topic.description_km : topic.description_en;
  const audioUrl = isKh ? topic.audio_url_km : topic.audio_url_en;
  const subGroupLabel = SUB_GROUPS.find(s => s.key === topic.sub_group);

  // Cleanup when topic changes or panel unmounts
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = "";
        audioRef.current = null;
      }
      playingRef.current = false;
    };
  }, [topic.id]);

  const handleAudio = () => {
    if (!audioUrl) return;

    // STOP — audio is playing or loading
    if (playingRef.current || loadingAudio) {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = "";
        audioRef.current = null;
      }
      playingRef.current = false;
      setPlaying(false);
      setLoadingAudio(false);
      return;
    }

    // PLAY — create fresh audio element
    const audio = new Audio(audioUrl);
    audioRef.current = audio;
    setLoadingAudio(true);

    audio.addEventListener("canplaythrough", () => {
      audio.play().catch(() => {
        setLoadingAudio(false);
        setPlaying(false);
        playingRef.current = false;
      });
      setLoadingAudio(false);
      setPlaying(true);
      playingRef.current = true;
    }, { once: true });

    audio.addEventListener("ended", () => {
      setPlaying(false);
      playingRef.current = false;
      audioRef.current = null;
    }, { once: true });

    audio.addEventListener("error", () => {
      setPlaying(false);
      setLoadingAudio(false);
      playingRef.current = false;
      audioRef.current = null;
    }, { once: true });

    audio.load();
  };

  // Export as landscape image (1920x1080)
  const handleExport = async (action: 'download' | 'print' | 'share') => {
    setExporting(true);
    try {
      // Dynamically import html2canvas
      const html2canvas = (await import('html2canvas')).default;

      // Create a temporary canvas element
      const canvas = document.createElement('div');
      canvas.style.position = 'fixed';
      canvas.style.left = '-9999px';
      canvas.style.width = '1920px';
      canvas.style.height = '1080px';
      canvas.style.background = 'white';
      canvas.style.padding = '60px';
      canvas.style.boxSizing = 'border-box';

      // Build the content
      canvas.innerHTML = `
        <div style="width: 100%; height: 100%; display: flex; flex-direction: column; font-family: ${isKh ? 'Siemreap, sans-serif' : 'system-ui, sans-serif'};">
          <!-- Header with logo -->
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 40px;">
            <div style="display: flex; align-items: center; gap: 20px;">
              <img src="/brand/kwd-gray.png" alt="KWD" style="height: 60px; opacity: 0.7;" />
              <div>
                <div style="font-size: 14px; font-weight: bold; color: #666; text-transform: uppercase; letter-spacing: 1px;">
                  ${isKh ? 'សញ្ញាចរាចរណ៍' : 'Traffic Sign'}
                </div>
                <div style="font-size: 24px; font-weight: 900; color: #000; margin-top: 4px;">
                  ${topic.topic_code}
                </div>
              </div>
            </div>
            <div style="text-align: right; color: #666; font-size: 14px;">
              <div style="font-weight: bold;">kesararamwithdigital.tech</div>
              <div style="font-size: 12px; margin-top: 4px;">${isKh ? 'រៀនបើកបរ ប្រកបដោយសុវត្ថិភាព' : 'Learn to Drive Safely'}</div>
            </div>
          </div>
          
          <!-- Main content -->
          <div style="flex: 1; display: flex; gap: 60px; align-items: center;">
            <!-- Sign image -->
            <div style="flex-shrink: 0; width: 400px; height: 400px; display: flex; align-items: center; justify-content: center; background: #f9fafb; border: 4px solid #000; padding: 40px;">
              <img src="${topic.primary_image_url}" alt="${name}" style="max-width: 100%; max-height: 100%; object-fit: contain;" crossorigin="anonymous" />
            </div>
            
            <!-- Text content -->
            <div style="flex: 1; display: flex; flex-direction: column; gap: 24px;">
              <div>
                <div style="font-size: 48px; font-weight: 900; line-height: 1.2; color: #000; margin-bottom: 16px;">
                  ${name}
                </div>
                ${description ? `
                  <div style="font-size: 24px; line-height: 1.6; color: #374151;">
                    ${description}
                  </div>
                ` : ''}
              </div>
              
              ${subGroupLabel ? `
                <div style="display: inline-block; background: #fef3c7; border: 3px solid #000; padding: 12px 24px; font-size: 18px; font-weight: bold;">
                  ${isKh ? subGroupLabel.km : subGroupLabel.en}
                </div>
              ` : ''}
              
              ${topic.law_reference ? `
                <div style="background: #dbeafe; border: 3px solid #3b82f6; padding: 16px 20px; font-size: 16px; color: #1e40af;">
                  <div style="font-weight: 900; text-transform: uppercase; margin-bottom: 8px; font-size: 14px;">
                    ${isKh ? 'ឯកសារយោងច្បាប់' : 'Law Reference'}
                  </div>
                  <div>${topic.law_reference}</div>
                </div>
              ` : ''}
            </div>
          </div>
          
          <!-- Footer -->
          <div style="margin-top: 40px; padding-top: 20px; border-top: 2px solid #e5e7eb; display: flex; justify-content: space-between; align-items: center; font-size: 12px; color: #9ca3af;">
            <div>${isKh ? 'ទាញយកពី' : 'Downloaded from'} <strong style="color: #000;">kesararamwithdigital.tech</strong></div>
            <div>${new Date().toLocaleDateString(isKh ? 'km-KH' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
          </div>
        </div>
      `;

      document.body.appendChild(canvas);

      // Wait for images to load
      const images = canvas.querySelectorAll('img');
      await Promise.all(
        Array.from(images).map(img => {
          if (img.complete) return Promise.resolve();
          return new Promise((resolve, reject) => {
            img.onload = resolve;
            img.onerror = reject;
            // Add timeout
            setTimeout(reject, 5000);
          });
        })
      );

      // Generate canvas
      const generatedCanvas = await html2canvas(canvas, {
        width: 1920,
        height: 1080,
        scale: 1,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
      });

      document.body.removeChild(canvas);

      // Convert to blob
      const blob = await new Promise<Blob>((resolve) => {
        generatedCanvas.toBlob((b) => resolve(b!), 'image/png', 1.0);
      });

      const filename = `${topic.topic_code}-${name.replace(/[^a-zA-Z0-9]/g, '-')}.png`;

      if (action === 'download') {
        // Download
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
      } else if (action === 'print') {
        // Print
        const url = URL.createObjectURL(blob);
        const printWindow = window.open(url);
        if (printWindow) {
          printWindow.onload = () => {
            printWindow.print();
          };
        }
      } else if (action === 'share') {
        // Share
        if (navigator.share && navigator.canShare) {
          const file = new File([blob], filename, { type: 'image/png' });
          if (navigator.canShare({ files: [file] })) {
            await navigator.share({
              title: `${topic.topic_code} - ${name}`,
              text: description || name,
              files: [file],
            });
          } else {
            // Fallback to download
            handleExport('download');
          }
        } else {
          // Fallback to download
          handleExport('download');
        }
      }
    } catch (error) {
      console.error('Export failed:', error);
      alert(isKh ? 'មានបញ្ហាក្នុងការទាញយក' : 'Failed to export image');
    } finally {
      setExporting(false);
    }
  };

  return (
    <div ref={panelRef} className="col-span-full border-4 border-yellow-400 bg-white" style={{ boxShadow: "6px 6px 0 #000", scrollMarginTop: "100px" }}>
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3 bg-yellow-400 border-b-2 border-black">
        <div className="flex items-center gap-3 flex-wrap">
          <span className="font-mono text-xs font-black bg-black text-yellow-400 px-2 py-0.5">
            {topic.topic_code}
          </span>
          {subGroupLabel && (
            <span className="text-xs font-bold text-black/70" style={kf}>
              {isKh ? subGroupLabel.km : subGroupLabel.en}
            </span>
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

      {/* Body */}
      <div className="border-t-2 border-black bg-white">

        {/* ── ZONE 1: Context strip — code + category (low visual weight) ── */}
        <div className="px-4 pt-3 pb-1 flex items-center gap-2">
          <span className="font-mono text-[10px] font-black bg-zinc-100 border border-zinc-300 text-zinc-500 px-2 py-0.5 rounded">
            {topic.topic_code}
          </span>
          {subGroupLabel && (
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider" style={kf}>
              {isKh ? subGroupLabel.km : subGroupLabel.en}
            </span>
          )}
        </div>

        {/* ── ZONE 2: Visual anchor — full width image ── */}
        {topic.primary_image_url && (
          <div className="bg-white flex items-center justify-center" style={{ maxHeight: "240px", minHeight: "120px" }}>
            <img
              src={topic.primary_image_url}
              alt={name}
              className="w-full h-full object-contain"
              style={{ maxHeight: "240px" }}
            />
          </div>
        )}

        <div className="px-3 pb-3">
          {/* ── Title ── */}
          <p className="text-sm font-black leading-snug text-black mt-2 mb-2" style={kf}>
            {name}
          </p>

          {/* ── Description zone ── */}
          {description && (
            <div className={`rounded overflow-hidden border transition-all duration-300 ${playing ? "border-yellow-400" : "border-emerald-400"}`}>
              <div className={`px-2 py-1 flex items-center gap-2 transition-colors duration-300 ${playing ? "bg-yellow-400" : "bg-emerald-500"}`}>
                <span className="text-[8px] font-black uppercase tracking-widest text-white" style={kf}>{isKh ? "ពិពណ៌នា" : "Description"}</span>
                {playing && (
                  <span className="flex gap-0.5 items-end h-2.5 ml-auto">
                    {[60, 100, 75, 90, 55].map((h, i) => (
                      <span key={i} className="w-0.5 bg-black rounded-sm animate-pulse" style={{ height: `${h}%`, animationDelay: `${i * 100}ms` }} />
                    ))}
                  </span>
                )}
              </div>
              <div className={`px-3 py-2 transition-colors duration-300 ${playing ? "bg-yellow-50" : "bg-emerald-50"}`}>
                <p className={`font-bold text-sm leading-snug ${playing ? "text-black" : "text-emerald-900"}`} style={kf}>
                  {description}
                </p>
              </div>
            </div>
          )}

          {/* ── Law reference ── */}
          {topic.law_reference && (
            <div className="mt-1.5 rounded overflow-hidden border border-amber-300">
              <div className="bg-amber-400 px-2 py-0.5">
                <p className="text-[8px] font-black uppercase tracking-widest text-amber-900" style={kf}>{t.lawRef}</p>
              </div>
              <div className="bg-amber-50 px-2 py-1.5">
                <p className="text-[11px] font-mono text-amber-900" style={kf}>{topic.law_reference}</p>
              </div>
            </div>
          )}

          {/* ── Audio + Save row ── */}
          <div className="mt-2 flex items-center justify-between gap-2">
            {audioUrl && (
              <button
                onClick={handleAudio}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 border-2 border-black font-black text-xs transition-all select-none rounded ${loadingAudio ? "bg-zinc-100 text-zinc-400 cursor-wait"
                  : playing ? "bg-black text-yellow-400"
                    : "bg-white hover:bg-yellow-400"
                  }`}
                style={kf}
              >
                {loadingAudio ? (
                  <><span className="flex gap-0.5 items-end h-3">{[60, 100, 75].map((h, i) => <span key={i} className="w-0.5 bg-zinc-400 rounded-sm animate-pulse" style={{ height: `${h}%`, animationDelay: `${i * 120}ms` }} />)}</span>{isKh ? "ផ្ទុក..." : "Loading..."}</>
                ) : playing ? (
                  <><span className="flex gap-0.5 items-end h-3">{[60, 100, 75, 90, 55].map((h, i) => <span key={i} className="w-0.5 bg-yellow-400 rounded-sm animate-pulse" style={{ height: `${h}%`, animationDelay: `${i * 100}ms` }} />)}</span>{t.stopAudio}</>
                ) : (
                  <><Volume2 size={13} />{t.playAudio}</>
                )}
              </button>
            )}
            <SaveCardButton topic={topic} isKh={isKh} size="lg" />
          </div>
        </div>
      </div>

      {/* Related questions */}
      {loadingQuestions ? (
        <div className="border-t-2 border-black px-5 py-4 text-xs font-bold text-zinc-400" style={kf}>
          {t.loadingQ}
        </div>
      ) : questions.length > 0 && (
        <div className="border-t-2 border-black px-5 py-4 space-y-2">
          <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-3" style={kf}>
            {t.relatedQ} ({questions.length})
          </p>
          {questions.map((q: any, i: number) => (
            <details key={q.id} className="border-2 border-black">
              <summary className="px-4 py-3 flex items-start gap-3 cursor-pointer hover:bg-zinc-50 list-none">
                <span className="font-black text-[10px] bg-black text-white px-1.5 py-0.5 shrink-0 mt-0.5">Q{i + 1}</span>
                <span className="font-bold text-sm flex-1" style={kf}>
                  {isKh ? q.question_km : q.question_en}
                </span>
              </summary>
              <div className="border-t-2 border-black bg-zinc-50 p-3 space-y-2">
                {q.answers?.map((a: any, ai: number) => (
                  <div key={a.id} className={`px-3 py-2 border-2 text-sm flex gap-2 ${a.is_correct ? "bg-green-100 border-green-500" : "bg-white border-zinc-200"}`}>
                    <span className="font-bold shrink-0">{String.fromCharCode(65 + ai)}.</span>
                    <span className="flex-1" style={kf}>{isKh ? a.answer_km : a.answer_en}</span>
                    {a.is_correct && <span className="text-green-600 font-black text-xs">✓</span>}
                  </div>
                ))}
              </div>
            </details>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Main catalogue ────────────────────────────────────────────────────────────
export function TrafficSignsCatalogue() {
  const { lang } = useLang();
  const isKh = lang === "kh";
  const kf = isKh ? { fontFamily: "Siemreap, sans-serif" } : {};
  const t = isKh ? UI.kh : UI.en;

  const [topics, setTopics] = useState<Topic[]>([]);
  const [filteredTopics, setFilteredTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  // Initialise with alternating default (runs once on mount)
  const [subGroupFilter, setSubGroupFilter] = useState<string>(() => getDefaultFilter());
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
  const [selectedQuestions, setSelectedQuestions] = useState<any[]>([]);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const gridRef = useRef<HTMLDivElement>(null);
  const [cols, setCols] = useState(8);

  useEffect(() => {
    const updateCols = () => {
      if (window.innerWidth >= 1024) setCols(8); // lg
      else if (window.innerWidth >= 768) setCols(6); // md
      else if (window.innerWidth >= 640) setCols(4); // sm
      else setCols(3); // default (matches grid-cols-3)
    };
    updateCols();
    window.addEventListener("resize", updateCols);
    return () => window.removeEventListener("resize", updateCols);
  }, []);

  const handleTopicClick = async (topic: Topic) => {
    if (selectedTopic?.id === topic.id) {
      setSelectedTopic(null);
      setSelectedQuestions([]);
      return;
    }
    setSelectedTopic(topic);
    setLoadingQuestions(true);
    try {
      const res = await fetch(`/api/public/topics/${topic.id}/questions`);
      const data = await res.json();
      setSelectedQuestions(data.questions || []);
    } catch {
      setSelectedQuestions([]);
    } finally {
      setLoadingQuestions(false);
    }
  };

  const handleFilterChange = (key: string) => {
    setSubGroupFilter(key);
    setSelectedTopic(null);
    setSelectedQuestions([]);
  };

  useEffect(() => { window.scrollTo(0, 0); fetchTopics(); }, []);

  useEffect(() => {
    let filtered = [...topics];
    if (search.trim()) {
      const q = search.toLowerCase();
      filtered = filtered.filter(
        tp => tp.name_en.toLowerCase().includes(q) ||
          tp.name_km.includes(search) ||
          tp.topic_code.toLowerCase().includes(q)
      );
    }
    if (subGroupFilter) {
      filtered = filtered.filter(tp => tp.sub_group === subGroupFilter);
    }
    setFilteredTopics(filtered);
  }, [topics, search, subGroupFilter]);

  const fetchTopics = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/public/topics?categoryId=1&status=published");
      const data = await res.json();
      setTopics(data.topics || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const availableKeys = new Set(topics.map(tp => tp.sub_group));
  // Category tags — all except "All Signs" which goes at the end
  const availableGroups = SUB_GROUPS.filter(sg => availableKeys.has(sg.key));
  const countMap = topics.reduce<Record<string, number>>((acc, tp) => {
    acc[tp.sub_group] = (acc[tp.sub_group] || 0) + 1;
    return acc;
  }, {});

  const isDefaultFilter = subGroupFilter === "";

  return (
    <div className="min-h-screen bg-white pt-4">

      {/* ── Filter Tag Bar ─────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 pb-4">
        <div className="bg-white border-2 border-black p-4" style={{ boxShadow: "4px 4px 0 #000" }}>

          {/* Search */}
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
            <input
              type="text"
              placeholder={t.searchPlaceholder}
              value={search}
              onChange={(e) => { setSearch(e.target.value); setSubGroupFilter(""); setSelectedTopic(null); }}
              className="w-full pl-10 pr-9 py-2.5 border-2 border-black font-medium focus:outline-none focus:shadow-[2px_2px_0_#000] text-sm"
              style={kf}
            />
            {search && (
              <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-black">
                <X size={15} />
              </button>
            )}
          </div>

          {/* Tag pills — single scrollable row, "All Signs" first */}
          <div
            className="flex items-center gap-1.5 overflow-x-auto py-0.5"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" } as React.CSSProperties}
          >
            {/* All Signs — first */}
            <button
              onClick={() => handleFilterChange("")}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 border-2 border-black text-xs font-black whitespace-nowrap shrink-0 rounded-full transition-all ${subGroupFilter === "" && !search
                ? "bg-black text-yellow-400 shadow-[2px_2px_0_#ca8a04]"
                : "bg-white hover:bg-yellow-400 hover:shadow-[2px_2px_0_#000]"
                }`}
              style={kf}
            >
              {t.all}
              <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-full ${subGroupFilter === "" && !search ? "bg-yellow-400 text-black" : "bg-zinc-100 text-zinc-600"}`}>
                {topics.length}
              </span>
            </button>

            {/* Divider */}
            <span className="w-px h-4 bg-zinc-300 shrink-0 mx-0.5" />

            {/* Category tags */}
            {availableGroups.map(sg => {
              const isActive = subGroupFilter === sg.key && !search;
              const count = countMap[sg.key] || 0;
              return (
                <button
                  key={sg.key}
                  onClick={() => handleFilterChange(sg.key)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 border-2 border-black text-xs font-black whitespace-nowrap shrink-0 rounded-full transition-all ${isActive
                    ? "bg-yellow-400 border-black shadow-[2px_2px_0_#000]"
                    : "bg-white hover:bg-yellow-400 hover:shadow-[2px_2px_0_#000]"
                    }`}
                  style={kf}
                >
                  {isKh ? sg.km : sg.en}
                  {count > 0 && (
                    <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-full ${isActive ? "bg-black text-yellow-400" : "bg-zinc-100 text-zinc-600"}`}>
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Result count + reset */}
          <div className="mt-3 pt-3 border-t border-zinc-200 flex items-center justify-between">
            <p className="text-xs font-bold text-zinc-500" style={kf}>
              {t.showing} <span className="text-black font-black">{filteredTopics.length}</span> {t.of} {topics.length} {t.signs}
              {subGroupFilter && !search && (
                <span className="ml-2 text-yellow-700">
                  — {isKh ? SUB_GROUPS.find(s => s.key === subGroupFilter)?.km : SUB_GROUPS.find(s => s.key === subGroupFilter)?.en}
                </span>
              )}
            </p>
            {(!isDefaultFilter || search) && (
              <button
                onClick={() => { setSubGroupFilter(getDefaultFilter()); setSearch(""); setSelectedTopic(null); }}
                className="text-xs font-bold text-zinc-400 hover:text-black underline"
                style={kf}
              >
                {t.reset}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── Signs Grid ─────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 pb-12" ref={gridRef}>
        {loading ? (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
            {Array.from({ length: 16 }).map((_, i) => (
              <div key={i} className="aspect-square bg-gray-200 border-2 border-black animate-pulse" />
            ))}
          </div>
        ) : filteredTopics.length === 0 ? (
          <div className="bg-white border-2 border-black p-12 text-center" style={{ boxShadow: "4px 4px 0 #000" }}>
            <p className="text-zinc-600 font-bold" style={kf}>{t.noSigns}</p>
          </div>
        ) : (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
            {filteredTopics.map((topic, idx) => {
              const isSelected = selectedTopic?.id === topic.id;
              const isLastInRow = (idx + 1) % cols === 0 || idx === filteredTopics.length - 1;
              const selectedIdx = selectedTopic ? filteredTopics.findIndex(tp => tp.id === selectedTopic.id) : -1;
              const showPanelAfter =
                selectedTopic &&
                selectedIdx >= 0 &&
                idx >= selectedIdx &&
                Math.floor(idx / cols) === Math.floor(selectedIdx / cols) &&
                isLastInRow;

              return (
                <Fragment key={topic.id}>
                  <button
                    onClick={() => handleTopicClick(topic)}
                    aria-expanded={isSelected}
                    className={`group border-2 transition-all duration-150 flex flex-col focus:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400 ${isSelected
                      ? "border-yellow-400 bg-yellow-400 shadow-[4px_4px_0_#ca8a04]"
                      : "border-black bg-white hover:border-yellow-400 hover:bg-yellow-400 hover:shadow-[4px_4px_0_#ca8a04]"
                      }`}
                  >
                    <div className="relative w-full overflow-hidden" style={{ paddingBottom: "100%" }}>
                      {topic.primary_image_url ? (
                        <img
                          src={topic.primary_image_url}
                          alt={topic.topic_code}
                          className="absolute inset-0 w-full h-full object-contain p-2 group-hover:scale-105 transition-transform duration-200"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                          <span className="text-2xl">🚦</span>
                        </div>
                      )}
                    </div>
                    <div className={`border-t-2 px-1 py-1.5 w-full transition-colors ${isSelected ? "border-yellow-500 bg-yellow-500" : "border-black bg-zinc-50 group-hover:border-yellow-500 group-hover:bg-yellow-500"
                      }`}>
                      <div className="font-mono text-[9px] font-black text-center text-black leading-none">
                        {topic.topic_code}
                      </div>
                    </div>
                  </button>

                  {showPanelAfter && selectedTopic && (
                    <DetailPanel
                      key={`panel-${selectedTopic.id}`}
                      topic={selectedTopic}
                      questions={selectedQuestions}
                      loadingQuestions={loadingQuestions}
                      isKh={isKh}
                      kf={kf}
                      t={t}
                      onClose={() => { setSelectedTopic(null); setSelectedQuestions([]); }}
                    />
                  )}
                </Fragment>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
