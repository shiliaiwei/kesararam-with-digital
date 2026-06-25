"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  Check, X, Search, AlertCircle, XCircle, ChevronDown, ChevronRight,
  CheckCircle, Circle, Lock,
} from "lucide-react";
import { BrandSelect } from "@/components/ui/brand-select";
import { useToast } from "@/components/ui/toast-container";

interface Answer {
  id: number;
  answerEn: string;
  answerKm: string;
  isCorrect: boolean;
  imageUrl?: string | null;
}

interface PendingQuestion {
  id: number;
  topic_id: number;
  question_en: string;
  question_km: string;
  hint_en?: string | null;
  hint_km?: string | null;
  image_url?: string | null;
  difficulty: string;
  status: string;
  created_at: string;
  topic_code: string;
  topic_name_en: string;
  topic_status: string;
  category_id: number;
  category_name: string;
  creator_name: string;
  answers: Answer[];
}

const CATEGORIES = [
  { id: 1, name: "Traffic Signs" },
  { id: 2, name: "Road Traffic Law" },
  { id: 3, name: "Right of Way" },
  { id: 4, name: "Driving Skills" },
  { id: 5, name: "Vehicle Technology" },
  { id: 6, name: "Loading People & Goods" },
  { id: 7, name: "General Knowledge" },
  { id: 8, name: "Emergency" },
];

const DIFFICULTY_COLORS: Record<string, string> = {
  easy: "bg-green-100 text-green-800 border-green-300",
  medium: "bg-yellow-100 text-yellow-800 border-yellow-300",
  hard: "bg-red-100 text-red-800 border-red-300",
};

export function PendingQuestionsReview() {
  const { showToast } = useToast();

  const [questions, setQuestions] = useState<PendingQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [stats, setStats] = useState({ pending: 0, approved: 0, rejected: 0 });

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [creatorFilter, setCreatorFilter] = useState("");
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const handleSearchChange = (value: string) => {
    setSearch(value);
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => setDebouncedSearch(value), 350);
  };

  const creators = Array.from(
    new Map(
      questions.filter((q) => q.creator_name).map((q) => [q.creator_name, q.creator_name])
    ).values()
  ).sort();

  const fetchQuestions = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (categoryFilter) params.append("categoryId", categoryFilter);
      if (creatorFilter) params.append("creator", creatorFilter);
      if (debouncedSearch) params.append("search", debouncedSearch);

      const res = await fetch(`/api/admin/questions/pending?${params}`);
      const data = await res.json();
      setQuestions(data.questions || []);
      setStats(data.stats || { pending: 0, approved: 0, rejected: 0 });
    } catch {
      showToast("Failed to load pending questions", "error");
    } finally {
      setLoading(false);
    }
  }, [categoryFilter, creatorFilter, debouncedSearch, showToast]);

  useEffect(() => {
    fetchQuestions();
  }, [fetchQuestions]);

  const updateStatus = async (id: number, status: "published" | "rejected") => {
    if (status === "rejected" && !confirm("Reject this question? Staff will be able to edit and resubmit it.")) return;
    setBusyId(id);
    try {
      const res = await fetch(`/api/admin/questions/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        showToast(status === "published" ? "Question approved & published" : "Question rejected", "success");
        setQuestions((prev) => prev.filter((q) => q.id !== id));
        setStats((s) => ({
          ...s,
          pending: Math.max(0, s.pending - 1),
          approved: status === "published" ? s.approved + 1 : s.approved,
          rejected: status === "rejected" ? s.rejected + 1 : s.rejected,
        }));
      } else {
        const d = await res.json().catch(() => ({}));
        showToast(d.error || "Failed to update question", "error");
      }
    } catch {
      showToast("Failed to update question", "error");
    } finally {
      setBusyId(null);
    }
  };

  const activeFilters = [
    categoryFilter && { key: "category", label: CATEGORIES.find((c) => String(c.id) === categoryFilter)?.name ?? categoryFilter, clear: () => setCategoryFilter("") },
    creatorFilter && { key: "creator", label: creatorFilter, clear: () => setCreatorFilter("") },
  ].filter(Boolean) as { key: string; label: string; clear: () => void }[];

  const clearAllFilters = () => {
    setSearch("");
    setDebouncedSearch("");
    setCategoryFilter("");
    setCreatorFilter("");
  };

  return (
    <div className="space-y-6">
      {/* Header card */}
      <div className="bg-white border-2 border-black p-6" style={{ boxShadow: "4px 4px 0 #000" }}>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-black">Question Review Queue</h1>
            <p className="text-zinc-600">Approve or reject individual questions submitted by staff</p>
          </div>
          <div className="bg-yellow-100 border-2 border-black px-4 py-2 text-center">
            <div className="text-2xl font-black">{stats.pending}</div>
            <div className="text-xs font-bold uppercase">Pending</div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            { bg: "bg-yellow-50", icon: <AlertCircle size={24} />, iconBg: "bg-yellow-400", value: stats.pending, label: "Pending Review" },
            { bg: "bg-green-50", icon: <Check size={24} />, iconBg: "bg-green-400", value: stats.approved, label: "Approved Today" },
            { bg: "bg-red-50", icon: <X size={24} />, iconBg: "bg-red-400", value: stats.rejected, label: "Rejected Today" },
          ].map(({ bg, icon, iconBg, value, label }) => (
            <div key={label} className={`${bg} border-2 border-black p-4`} style={{ boxShadow: "2px 2px 0 #000" }}>
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 ${iconBg} border-2 border-black flex items-center justify-center`}>{icon}</div>
                <div>
                  <div className="text-2xl font-black">{value}</div>
                  <div className="text-sm font-bold">{label}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
            <input
              type="text"
              placeholder="Search question text..."
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full pl-9 pr-8 py-2 border-2 border-black font-medium focus:outline-none focus:shadow-[2px_2px_0_#000]"
            />
            {search && (
              <button onClick={() => handleSearchChange("")} className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-black">
                <XCircle size={16} />
              </button>
            )}
          </div>

          <BrandSelect
            value={categoryFilter}
            onValueChange={setCategoryFilter}
            fullWidth
            ariaLabel="Filter by category"
            className="px-4 py-2"
            options={[{ value: "", label: "All Categories" }, ...CATEGORIES.map((c) => ({ value: String(c.id), label: c.name }))]}
          />

          <BrandSelect
            value={creatorFilter}
            onValueChange={setCreatorFilter}
            fullWidth
            ariaLabel="Filter by creator"
            className="px-4 py-2"
            options={[{ value: "", label: "All Staff" }, ...creators.map((name) => ({ value: name, label: name }))]}
          />
        </div>

        {/* Active filter badges */}
        {activeFilters.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 mt-3">
            <span className="text-xs font-bold text-zinc-500 uppercase">Active filters:</span>
            {activeFilters.map((f) => (
              <span key={f.key} className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-200 border border-black text-xs font-bold">
                {f.label}
                <button onClick={f.clear} className="hover:text-red-600">
                  <X size={12} />
                </button>
              </span>
            ))}
            <button onClick={clearAllFilters} className="text-xs font-bold text-red-600 underline hover:no-underline ml-1">
              Clear all
            </button>
          </div>
        )}
      </div>

      {/* List */}
      <div className="bg-white border-2 border-black overflow-hidden" style={{ boxShadow: "4px 4px 0 #000" }}>
        {!loading && (
          <div className="px-4 py-2 border-b-2 border-black bg-zinc-50 flex items-center justify-between">
            <span className="text-sm font-bold text-zinc-600">
              {questions.length === 0 ? "No results" : `Showing ${questions.length} question${questions.length !== 1 ? "s" : ""}`}
            </span>
            {(activeFilters.length > 0 || debouncedSearch) && (
              <button onClick={clearAllFilters} className="text-xs font-bold text-zinc-500 hover:text-black underline">
                Reset filters
              </button>
            )}
          </div>
        )}

        {loading ? (
          <div className="p-12 text-center">
            <div className="inline-block w-8 h-8 border-4 border-black border-t-yellow-400 rounded-full animate-spin mb-3" />
            <p className="text-zinc-600 font-medium">Loading questions...</p>
          </div>
        ) : questions.length === 0 ? (
          <div className="p-12 text-center">
            <div className="text-6xl mb-4">✅</div>
            <p className="text-xl font-bold mb-2">All caught up!</p>
            <p className="text-zinc-600">No pending questions match your filters</p>
            {(activeFilters.length > 0 || debouncedSearch) && (
              <button onClick={clearAllFilters} className="mt-4 px-4 py-2 border-2 border-black font-bold hover:shadow-[2px_2px_0_#000] transition-all">
                Clear filters
              </button>
            )}
          </div>
        ) : (
          <div className="divide-y-2 divide-black">
            {questions.map((q) => {
              const isExpanded = expandedId === q.id;
              const isBusy = busyId === q.id;
              return (
                <div key={q.id} className={isBusy ? "opacity-50 pointer-events-none" : ""}>
                  {/* summary row */}
                  <div className="flex items-start justify-between gap-4 px-4 py-3 hover:bg-yellow-50 transition-colors">
                    <button
                      onClick={() => setExpandedId(isExpanded ? null : q.id)}
                      className="flex items-start gap-3 min-w-0 text-left flex-1"
                    >
                      <span className="mt-0.5 shrink-0">
                        {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                      </span>
                      <div className="min-w-0">
                        <div className="font-bold leading-tight truncate">{q.question_en}</div>
                        {q.question_km && (
                          <div className="text-sm text-zinc-500 leading-tight truncate" style={{ fontFamily: "var(--font-system)" }}>
                            {q.question_km}
                          </div>
                        )}
                        <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                          <span className="font-mono text-[10px] font-bold bg-zinc-100 border border-zinc-300 px-1.5 py-0.5 text-zinc-600">
                            {q.topic_code}
                          </span>
                          <span className="text-[10px] font-bold px-1.5 py-0.5 bg-blue-100 border border-blue-300">
                            {q.category_name}
                          </span>
                          <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 border ${DIFFICULTY_COLORS[q.difficulty] || DIFFICULTY_COLORS.medium}`}>
                            {q.difficulty}
                          </span>
                          {q.topic_status === "published" && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 bg-zinc-100 border border-zinc-300 text-zinc-600">
                              <Lock size={9} /> live topic
                            </span>
                          )}
                          <button
                            onClick={(e) => { e.stopPropagation(); setCreatorFilter(q.creator_name); }}
                            className="text-[10px] font-medium text-zinc-500 hover:text-blue-700 hover:underline"
                            title="Filter by this staff member"
                          >
                            by {q.creator_name || "—"}
                          </button>
                        </div>
                      </div>
                    </button>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => updateStatus(q.id, "published")}
                        disabled={isBusy}
                        className="p-2 border-2 border-black bg-green-400 hover:shadow-[2px_2px_0_#000] transition-all disabled:opacity-40"
                        title="Approve & publish"
                      >
                        <Check size={15} />
                      </button>
                      <button
                        onClick={() => updateStatus(q.id, "rejected")}
                        disabled={isBusy}
                        className="p-2 border-2 border-black bg-red-400 hover:shadow-[2px_2px_0_#000] transition-all disabled:opacity-40"
                        title="Reject"
                      >
                        <X size={15} />
                      </button>
                    </div>
                  </div>

                  {/* expanded detail */}
                  {isExpanded && (
                    <div className="border-t-2 border-black bg-zinc-50 p-4 space-y-4">
                      {q.image_url && (
                        <div className="border-2 border-black bg-white p-2 inline-block">
                          <img src={q.image_url} alt="" className="max-h-32 object-contain" />
                        </div>
                      )}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {q.answers?.map((a, ai) => (
                          <div
                            key={ai}
                            className={`flex items-center gap-2 px-3 py-2 border-2 text-sm font-bold ${
                              a.isCorrect ? "border-green-500 bg-green-50 text-green-900" : "border-zinc-300 bg-white text-zinc-600"
                            }`}
                          >
                            {a.isCorrect ? (
                              <CheckCircle size={14} className="text-green-600 shrink-0" />
                            ) : (
                              <Circle size={14} className="text-zinc-400 shrink-0" />
                            )}
                            {a.imageUrl && <img src={a.imageUrl} alt="" className="h-8 w-8 object-contain border border-zinc-300 bg-white shrink-0" />}
                            <div className="truncate">
                              <p>{a.answerEn}</p>
                              {a.answerKm && (
                                <p className="text-[11px] text-zinc-400 font-medium" style={{ fontFamily: "var(--font-system)" }}>{a.answerKm}</p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                      {(q.hint_en || q.hint_km) && (
                        <div className="bg-yellow-50 border-2 border-yellow-200 p-3 text-sm">
                          {q.hint_en && <p className="font-bold text-yellow-900">Hint (EN): {q.hint_en}</p>}
                          {q.hint_km && <p className="font-bold text-yellow-900 mt-1" style={{ fontFamily: "var(--font-system)" }}>Hint (KM): {q.hint_km}</p>}
                        </div>
                      )}
                      <div className="text-xs text-zinc-500">
                        Topic: <span className="font-bold text-zinc-700">{q.topic_name_en}</span> · Submitted {new Date(q.created_at).toLocaleDateString()}
                      </div>
                    </div>
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
