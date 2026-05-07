"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { Search, ArrowLeft, X, Volume2, ChevronDown, ChevronUp } from "lucide-react";
import { useLang } from "@/context/lang-context";
import { SaveCardButton } from "./save-card-button";

interface Topic {
  id: number;
  topic_code: string;
  name_en: string;
  name_km: string;
  description_en: string;
  description_km: string;
  sub_group: string;
  law_reference: string;
  audio_url_en: string;
  audio_url_km: string;
  primary_image_url: string | null;
}

const SUB_GROUPS: { key: string; en: string; km: string }[] = [
  { key: "Road Safety", en: "Road Safety", km: "សុវត្ថិភាពផ្លូវ" },
  { key: "Environmental", en: "Environmental", km: "បរិស្ថាន" },
  { key: "Legal", en: "Legal", km: "ច្បាប់" },
];

const UI = {
  en: {
    title: "General Knowledge",
    titleKm: "ចំណេះដឹងទូទៅ",
    desc: "Essential road safety topics and broad driving knowledge. Learn about environmental awareness, legal responsibilities, and general safety practices.",
    search: "Search questions...",
    all: "All",
    showing: "Showing", of: "of", questions: "questions",
    noQuestions: "No questions found",
    reset: "Reset",
    answer: "Answer",
    lawRef: "Law Reference",
    playAudio: "Play Audio",
    stopAudio: "Stop",
    back: "Back to Categories",
  },
  kh: {
    title: "ចំណេះដឹងទូទៅ",
    titleKm: "General Knowledge",
    desc: "ប្រធានបទសុវត្ថិភាពផ្លូវសំខាន់ៗ និងចំណេះដឹងបើកបរទូលំទូលាយ។ រៀនអំពីការយល់ដឹងបរិស្ថាន ទំនួលខុសត្រូវផ្នែកច្បាប់ និងការអនុវត្តសុវត្ថិភាពទូទៅ។",
    search: "ស្វែងរកសំណួរ...",
    all: "ទាំងអស់",
    showing: "បង្ហាញ", of: "នៃ", questions: "សំណួរ",
    noQuestions: "រកមិនឃើញសំណួរ",
    reset: "កំណត់ឡើងវិញ",
    answer: "ចម្លើយ",
    lawRef: "ឯកសារយោងច្បាប់",
    playAudio: "ចាក់សំឡេង",
    stopAudio: "ឈប់",
    back: "ត្រឡប់ទៅប្រភេទ",
  },
} as const;

function useAudio(url: string | null) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const playingRef = useRef(false);
  const [playing, setPlaying] = useState(false);
  const [loading, setLoading] = useState(false);
  useEffect(() => { return () => { if (audioRef.current) { audioRef.current.pause(); audioRef.current.src = ""; audioRef.current = null; } playingRef.current = false; }; }, [url]);
  const toggle = () => {
    if (!url) return;
    if (playingRef.current || loading) { audioRef.current?.pause(); if (audioRef.current) { audioRef.current.src = ""; audioRef.current = null; } playingRef.current = false; setPlaying(false); setLoading(false); return; }
    const audio = new Audio(url); audioRef.current = audio; setLoading(true);
    audio.addEventListener("canplaythrough", () => { audio.play().catch(() => { setLoading(false); setPlaying(false); playingRef.current = false; }); setLoading(false); setPlaying(true); playingRef.current = true; }, { once: true });
    audio.addEventListener("ended", () => { setPlaying(false); playingRef.current = false; audioRef.current = null; }, { once: true });
    audio.addEventListener("error", () => { setPlaying(false); setLoading(false); playingRef.current = false; audioRef.current = null; }, { once: true });
    audio.load();
  };
  return { playing, loading, toggle };
}

function AnswerCard({ topic, isKh, t }: { topic: Topic; isKh: boolean; t: typeof UI.en }) {
  const kf = isKh ? { fontFamily: "Siemreap, sans-serif" } : {};
  const audioUrlEn = topic.audio_url_en || "";
  const audioUrlKm = topic.audio_url_km || "";
  const audioUrl = isKh ? (audioUrlKm || audioUrlEn) : (audioUrlEn || audioUrlKm);
  const { playing, loading, toggle } = useAudio(audioUrl || null);
  const answer = isKh ? topic.description_km : topic.description_en;
  const subGroup = SUB_GROUPS.find((s) => s.key === topic.sub_group);
  return (
    <div className="border-t-2 border-black bg-white">
      <div className="px-4 pt-2 pb-1">
        <span className="text-[10px] font-mono font-bold text-zinc-900/20 select-none">
          {topic.topic_code}{subGroup ? ` · ${isKh ? subGroup.km : subGroup.en}` : ""}
        </span>
      </div>
      {topic.primary_image_url && <div className="w-full relative"><img src={topic.primary_image_url} alt={isKh ? topic.name_km : topic.name_en} className="w-full h-auto block select-none pointer-events-none" draggable={false} onContextMenu={(e) => e.preventDefault()} /><span className="absolute bottom-1 left-1/2 -translate-x-1/2 text-[9px] font-medium text-black pointer-events-none select-none" style={{ opacity: 0.50, whiteSpace: "nowrap" }}>⚠ AI illustration — may not reflect real-world appearance</span></div>}
      <div className="px-4 pb-4 pt-3">
        {/* ── Question title — centered ── */}
        <p className="text-base font-black text-black text-center mb-3 leading-snug" style={kf}>
          {isKh ? topic.name_km : topic.name_en}
        </p>
        {answer && (
          <div className={`rounded overflow-hidden border transition-all duration-300 ${playing ? "border-yellow-400" : "border-purple-400"}`}>
            <div className={`px-3 py-1.5 flex items-center gap-2 transition-colors duration-300 ${playing ? "bg-yellow-400" : "bg-purple-500"}`}>
              <span className="text-[10px] font-black uppercase tracking-widest text-white" style={kf}>{t.answer}</span>
              {playing && <span className="flex gap-0.5 items-end h-3 ml-auto">{[60, 100, 75, 90, 55].map((h, i) => <span key={i} className="w-0.5 bg-black rounded-sm animate-pulse" style={{ height: `${h}%`, animationDelay: `${i * 100}ms` }} />)}</span>}
            </div>
            <div className={`px-3 py-3 transition-colors duration-300 ${playing ? "bg-yellow-50" : "bg-purple-50"}`}>
              <p className={`font-bold text-sm leading-relaxed ${playing ? "text-black" : "text-purple-900"}`} style={kf}>{answer}</p>
            </div>
          </div>
        )}
        {topic.law_reference && (
          <div className="mt-2 rounded overflow-hidden border border-amber-300">
            <div className="bg-amber-400 px-3 py-1"><p className="text-[10px] font-black uppercase tracking-widest text-amber-900" style={kf}>{t.lawRef}</p></div>
            <div className="bg-amber-50 px-3 py-2"><p className="text-xs font-mono text-amber-900" style={kf}>{topic.law_reference}</p></div>
          </div>
        )}
        {/* Save + Audio row — Save left (icon), Audio right (prominent) */}
        <div className="mt-3 flex items-center justify-between gap-2">
          <SaveCardButton topic={topic} isKh={isKh} size="lg" />
          {(audioUrlEn || audioUrlKm) && (
            <button onClick={toggle} className={`inline-flex items-center gap-2 px-5 py-2.5 border-2 border-black font-black text-sm transition-all select-none ${loading ? "bg-zinc-100 text-zinc-400 cursor-wait" : playing ? "bg-black text-purple-400" : "bg-purple-400 hover:bg-purple-500 text-black shadow-[3px_3px_0_#000] hover:shadow-[4px_4px_0_#000]"}`} style={kf}>
              {loading ? (<><span className="flex gap-0.5 items-end h-3">{[60, 100, 75].map((h, i) => <span key={i} className="w-0.5 bg-zinc-400 rounded-sm animate-pulse" style={{ height: `${h}%`, animationDelay: `${i * 120}ms` }} />)}</span>{isKh ? "ផ្ទុក..." : "Loading..."}</>) : playing ? (<><span className="flex gap-0.5 items-end h-4">{[60, 100, 75, 90, 55].map((h, i) => <span key={i} className="w-0.5 bg-purple-400 rounded-sm animate-pulse" style={{ height: `${h}%`, animationDelay: `${i * 100}ms` }} />)}</span>{t.stopAudio}</>) : (<><Volume2 size={16} />{t.playAudio}</>)}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export function GeneralKnowledgeCatalogue() {
  const { lang } = useLang();
  const isKh = lang === "kh";
  const kf = isKh ? { fontFamily: "Siemreap, sans-serif" } : {};
  const t = isKh ? UI.kh : UI.en;

  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [subGroupFilter, setSubGroupFilter] = useState("");
  const [expandedTopic, setExpandedTopic] = useState<number | null>(null);
  const [questionNumbers, setQuestionNumbers] = useState<Record<number, number>>({});

  useEffect(() => {
    window.scrollTo(0, 0);
    setLoading(true);
    fetch("/api/public/topics?categoryId=7&status=published")
      .then((r) => r.json())
      .then((d) => {
        const data = d.topics || [];
        setTopics(data);
        const nums: Record<number, number> = {};
        data.forEach((tp: Topic, i: number) => { nums[tp.id] = i + 1; });
        setQuestionNumbers(nums);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => topics.filter((tp) => {
    const q = search.trim().toLowerCase();
    const matchSearch = !q || tp.name_en.toLowerCase().includes(q) || tp.name_km.includes(search.trim()) || tp.topic_code.toLowerCase().includes(q);
    const matchGroup = !subGroupFilter || tp.sub_group === subGroupFilter;
    return matchSearch && matchGroup;
  }), [topics, search, subGroupFilter]);

  const countMap = useMemo(() => topics.reduce<Record<string, number>>((acc, tp) => { acc[tp.sub_group] = (acc[tp.sub_group] || 0) + 1; return acc; }, {}), [topics]);
  const availableGroups = SUB_GROUPS.filter((sg) => countMap[sg.key]);
  const isDefaultFilter = !subGroupFilter && !search.trim();

  return (
    <div className="min-h-screen bg-white pt-4">

      {/* ── Back to Categories ─────────────────────────────────────── */}
      <div className="max-w-4xl mx-auto px-4 pb-3">
        <a
          href="/learn#categories"
          className="inline-flex items-center gap-2 px-3 py-1.5 border-2 border-black bg-white font-black text-xs hover:bg-yellow-400 transition-all shadow-[2px_2px_0_#000] hover:shadow-[3px_3px_0_#000]"
          style={kf}
        >
          <ArrowLeft size={13} />
          {t.back}
        </a>
      </div>

      <div className="max-w-4xl mx-auto px-4 pt-5 pb-5">
        <div className="bg-white border-2 border-black p-4" style={{ boxShadow: "4px 4px 0 #000" }}>
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
            <input type="text" placeholder={t.search} value={search}
              onChange={(e) => { setSearch(e.target.value); setSubGroupFilter(""); setExpandedTopic(null); }}
              className="w-full pl-10 pr-9 py-2.5 border-2 border-black font-medium focus:outline-none focus:shadow-[2px_2px_0_#000] text-sm" style={kf} />
            {search && <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-black"><X size={15} /></button>}
          </div>
          <div className="flex items-center gap-1.5 overflow-x-auto py-0.5" style={{ scrollbarWidth: "none" } as React.CSSProperties}>
            <button onClick={() => { setSubGroupFilter(""); setExpandedTopic(null); }}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 border-2 border-black text-xs font-black whitespace-nowrap shrink-0 rounded-full transition-all ${!subGroupFilter && !search ? "bg-black text-purple-400 shadow-[2px_2px_0_#7e22ce]" : "bg-white hover:bg-purple-400 hover:shadow-[2px_2px_0_#000]"}`} style={kf}>
              {t.all}
              <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-full ${!subGroupFilter && !search ? "bg-purple-400 text-black" : "bg-zinc-100 text-zinc-600"}`}>{topics.length}</span>
            </button>
            <span className="w-px h-4 bg-zinc-300 shrink-0 mx-0.5" />
            {availableGroups.map((sg) => {
              const isActive = subGroupFilter === sg.key && !search;
              return (
                <button key={sg.key} onClick={() => { setSubGroupFilter(sg.key); setExpandedTopic(null); }}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 border-2 border-black text-xs font-black whitespace-nowrap shrink-0 rounded-full transition-all ${isActive ? "bg-purple-400 border-black shadow-[2px_2px_0_#000]" : "bg-white hover:bg-purple-400 hover:shadow-[2px_2px_0_#000]"}`} style={kf}>
                  {isKh ? sg.km : sg.en}
                  <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-full ${isActive ? "bg-black text-purple-400" : "bg-zinc-100 text-zinc-600"}`}>{countMap[sg.key] || 0}</span>
                </button>
              );
            })}
          </div>
          <div className="mt-3 pt-3 border-t border-zinc-200 flex items-center justify-between">
            <p className="text-xs font-bold text-zinc-500" style={kf}>{t.showing} <span className="text-black font-black">{filtered.length}</span> {t.of} {topics.length} {t.questions}</p>
            {!isDefaultFilter && <button onClick={() => { setSubGroupFilter(""); setSearch(""); setExpandedTopic(null); }} className="text-xs font-bold text-zinc-400 hover:text-black underline" style={kf}>{t.reset}</button>}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 pb-16">
        {loading ? (
          <div className="space-y-3">{Array.from({ length: 8 }).map((_, i) => <div key={i} className="h-16 bg-gray-200 border-2 border-black animate-pulse" style={{ boxShadow: "4px 4px 0 #000" }} />)}</div>
        ) : filtered.length === 0 ? (
          <div className="bg-white border-2 border-black p-12 text-center" style={{ boxShadow: "4px 4px 0 #000" }}><p className="text-zinc-600 font-bold" style={kf}>{t.noQuestions}</p></div>
        ) : (
          <div className="space-y-3">
            {filtered.map((topic, displayIndex) => {
              const isOpen = expandedTopic === topic.id;
              const question = isKh ? topic.name_km : topic.name_en;
              const questionNumber = questionNumbers[topic.id] || displayIndex + 1;
              return (
                <div key={topic.id} className={`border-2 border-black transition-all ${isOpen ? "shadow-[6px_6px_0_#a855f7]" : "shadow-[4px_4px_0_#000]"} bg-white`}>
                  <button onClick={() => setExpandedTopic(isOpen ? null : topic.id)}
                    className={`w-full flex items-start justify-between gap-3 px-4 py-4 md:py-5 text-left transition-colors ${isOpen ? "bg-purple-400" : "hover:bg-purple-50"}`}>
                    <div className="flex-1 flex items-start gap-3">
                      <span className="font-black text-lg md:text-xl text-purple-600 shrink-0 pt-0.5 min-w-[40px]">{questionNumber}.</span>
                      <p className={`font-black text-base md:text-lg leading-snug ${isOpen ? "text-black" : "text-zinc-900"}`} style={kf}>{question}</p>
                    </div>
                    <span className="shrink-0 mt-0.5">{isOpen ? <ChevronUp size={22} className="text-black" /> : <ChevronDown size={22} className="text-zinc-400" />}</span>
                  </button>
                  {isOpen && (
                    <>
                      <AnswerCard topic={topic} isKh={isKh} t={t} />
                    </>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
