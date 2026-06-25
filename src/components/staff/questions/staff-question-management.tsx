"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { 
  Plus, Search, RefreshCw, Edit, Trash2, HelpCircle, 
  ChevronRight, ArrowLeft, BookOpen, Circle, CheckCircle, 
  HelpCircle as HelpIcon, FileText, Lock, AlertTriangle, 
  Clock, Check, Play, Settings
} from "lucide-react";
import { QuestionFormModal } from "@/components/admin/questions/question-form-modal";
import { BrandSelect } from "@/components/ui/brand-select";
import { useToast } from "@/components/ui/toast-container";

interface Question {
  id: number;
  topicId: number;
  topicName: string;
  categoryName: string;
  categoryId: number;
  questionEn: string;
  questionKm: string;
  questionType: string;
  difficulty: string;
  status: string;
  answerCount: number;
  createdAt: string;
  answers?: any[];
}

interface Category {
  id: number;
  slug: string;
  titleEn: string;
  titleKm?: string;
  color?: string;
}

interface Topic {
  id: number;
  topicCode: string;
  nameEn: string;
  nameKm: string;
  categoryId: number;
  categoryName?: string;
  status: string;
  createdBy: number;
  questionCount?: number;
  question_count?: number;
  primaryImageUrl?: string;
}

const CATEGORY_SLUGS: Record<number, string> = {
  1: "road-sign",
  2: "road-traffic",
  3: "priority",
  4: "driving",
  5: "technical",
  6: "loading-people-goods",
  7: "general-knowledge",
  8: "emergency",
};

const CATEGORIES = [
  { id: 1, slug: "road-sign",            titleEn: "Traffic Signs",          titleKm: "សញ្ញាផ្លូវវិថី",      color: "#eab308" },
  { id: 2, slug: "road-traffic",         titleEn: "Road Traffic Law",       titleKm: "ច្បាប់ចរាចរ",          color: "#3b82f6" },
  { id: 3, slug: "priority",             titleEn: "Right of Way",           titleKm: "សិទ្ធិដំណើរ",          color: "#22c55e" },
  { id: 4, slug: "driving",              titleEn: "Driving Skills",         titleKm: "ជំនាញបើកបរ",           color: "#06b6d4" },
  { id: 5, slug: "technical",            titleEn: "Vehicle Technology",     titleKm: "បច្ចេកវិទ្យាយានយន្ត",  color: "#8b5cf6" },
  { id: 6, slug: "loading-people-goods", titleEn: "Loading People & Goods", titleKm: "ការដឹកអ្នកដំណើរ",      color: "#f59e0b" },
  { id: 7, slug: "general-knowledge",    titleEn: "General Knowledge",      titleKm: "ចំណេះដឹងទូទៅ",         color: "#ef4444" },
  { id: 8, slug: "emergency",            titleEn: "Emergency",              titleKm: "ជំនួយបន្ទាន់",          color: "#dc2626" },
];

const STATUS_CONFIG: Record<string, { label: string; bg: string; border: string; text: string; icon: React.ElementType }> = {
  draft: { label: "Draft", bg: "bg-zinc-100", border: "border-zinc-400", text: "text-zinc-700", icon: FileText },
  pending: { label: "Under Review", bg: "bg-yellow-100", border: "border-yellow-400", text: "text-yellow-800", icon: Clock },
  approved: { label: "Approved", bg: "bg-green-100", border: "border-green-400", text: "text-green-800", icon: CheckCircle },
  published: { label: "Published", bg: "bg-blue-100", border: "border-blue-400", text: "text-blue-800", icon: CheckCircle },
  rejected: { label: "Rejected", bg: "bg-red-100", border: "border-red-400", text: "text-red-800", icon: AlertTriangle },
};

const DIFFICULTY_COLORS: Record<string, string> = {
  easy: "bg-green-100 text-green-800 border-green-300",
  medium: "bg-yellow-100 text-yellow-800 border-yellow-300",
  hard: "bg-red-100 text-red-800 border-red-300",
};

type View = "categories" | "topics" | "questions";

export function StaffQuestionManagement() {
  const { showToast } = useToast();

  const [topics, setTopics] = useState<Topic[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [questionsLoading, setQuestionsLoading] = useState(false);

  // Views and navigation
  const [view, setView] = useState<View>("categories");
  const [activeCategory, setActiveCategory] = useState<Category | null>(null);
  const [activeTopic, setActiveTopic] = useState<Topic | null>(null);

  // Search & Filter state
  const [topicSearch, setTopicSearch] = useState("");
  const [topicStatusFilter, setTopicStatusFilter] = useState("all");
  const [questionSearch, setQuestionSearch] = useState("");
  const [diffFilter, setDiffFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");

  // Modal controls
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<any | null>(null);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  // Load all topics on mount
  useEffect(() => {
    fetchTopics();
  }, []);

  const fetchTopics = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/staff/topics?limit=500");
      const data = await res.json();
      setTopics(data.topics || []);
    } catch (e) {
      showToast("Error loading topics", "error");
    } finally {
      setLoading(false);
    }
  };

  const fetchQuestionsForTopic = useCallback(async (topicId: number) => {
    setQuestionsLoading(true);
    try {
      const res = await fetch(`/api/staff/topics/${topicId}/questions`);
      const data = await res.json();
      // Map properties to match Question shape
      const mapped = (data.questions || []).map((q: any) => ({
        id: q.id,
        topicId: q.topic_id,
        topicName: activeTopic?.nameEn || "",
        categoryId: activeTopic?.categoryId || 0,
        categoryName: activeCategory?.titleEn || "",
        questionEn: q.question_en,
        questionKm: q.question_km,
        difficulty: q.difficulty,
        status: q.status,
        answerCount: q.answers?.length || 0,
        answers: q.answers || [],
        createdAt: q.created_at,
        questionType: deriveQuestionType(q.answers || [])
      }));
      setQuestions(mapped);
    } catch (e) {
      showToast("Error loading questions", "error");
    } finally {
      setQuestionsLoading(false);
    }
  }, [activeTopic, activeCategory, showToast]);

  const deriveQuestionType = (dbAnswers: any[]) => {
    const hasImages = dbAnswers.some((a) => Boolean(a.imageUrl || a.image_url));
    const correctCount = dbAnswers.filter((a) => a.isCorrect === true || a.is_correct === true).length;
    const isTF = dbAnswers.length === 2 && dbAnswers.every((a) => {
      const en = (a.answerEn || a.answer_en || "").toLowerCase();
      return en === "true" || en === "false";
    });

    if (isTF) return "true-false";
    if (hasImages) return "image-match";
    if (correctCount > 1) return "multi-select";
    if (dbAnswers.length === 1) return "type-answer";
    return "mcq";
  };

  const handleDeleteQuestion = async (qid: number) => {
    if (!confirm("Are you sure you want to delete this question?")) return;
    try {
      const res = await fetch(`/api/staff/topics/${activeTopic?.id}/questions/${qid}`, {
        method: "DELETE",
      });
      if (res.ok) {
        showToast("Question deleted", "success");
        if (activeTopic) fetchQuestionsForTopic(activeTopic.id);
      } else {
        const d = await res.json();
        showToast(d.error || "Failed to delete question", "error");
      }
    } catch (e) {
      showToast("Error deleting question", "error");
    }
  };

  // Helper counts
  const categoryStats = useMemo(() => {
    const stats: Record<number, { topics: number; questions: number }> = {};
    CATEGORIES.forEach(c => {
      const catTopics = topics.filter(t => t.categoryId === c.id);
      const qCount = catTopics.reduce((acc, t) => acc + (t.questionCount ?? t.question_count ?? 0), 0);
      stats[c.id] = { topics: catTopics.length, questions: qCount };
    });
    return stats;
  }, [topics]);

  const filteredTopics = useMemo(() => {
    if (!activeCategory) return [];
    return topics
      .filter(t => t.categoryId === activeCategory.id)
      .filter(t => topicStatusFilter === "all" || t.status === topicStatusFilter)
      .filter(t => {
        if (!topicSearch.trim()) return true;
        const q = topicSearch.toLowerCase();
        return t.nameEn.toLowerCase().includes(q) || t.nameKm.includes(q) || t.topicCode.toLowerCase().includes(q);
      });
  }, [topics, activeCategory, topicSearch, topicStatusFilter]);

  const filteredQuestions = useMemo(() => {
    return questions
      .filter(q => diffFilter === "all" || q.difficulty === diffFilter)
      .filter(q => typeFilter === "all" || q.questionType === typeFilter)
      .filter(q => {
        if (!questionSearch.trim()) return true;
        const s = questionSearch.toLowerCase();
        return q.questionEn.toLowerCase().includes(s) || (q.questionKm && q.questionKm.includes(s));
      });
  }, [questions, diffFilter, typeFilter, questionSearch]);

  const isEditable = activeTopic && (activeTopic.status === "draft" || activeTopic.status === "rejected");

  const openCategory = (cat: Category) => {
    setActiveCategory(cat);
    setView("topics");
    setTopicSearch("");
    setTopicStatusFilter("all");
  };

  const openTopic = (topic: Topic) => {
    setActiveTopic(topic);
    setView("questions");
    setQuestionSearch("");
    setDiffFilter("all");
    setTypeFilter("all");
    fetchQuestionsForTopic(topic.id);
  };

  const goBack = () => {
    if (view === "questions") {
      setView("topics");
      setActiveTopic(null);
      fetchTopics(); // Refresh topic question counts
    } else if (view === "topics") {
      setView("categories");
      setActiveCategory(null);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <div className="animate-spin w-10 h-10 border-4 border-black border-t-transparent rounded-full mb-4" />
        <p className="font-black text-sm uppercase tracking-wide">Loading Dashboard...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* breadcrumbs + title */}
      <div className="bg-white border-2 border-black p-4 flex flex-col md:flex-row md:items-center justify-between gap-4" style={{ boxShadow: "4px 4px 0 #000" }}>
        <div className="flex items-center gap-3">
          {view !== "categories" && (
            <button
              onClick={goBack}
              className="p-2 border-2 border-black bg-white hover:bg-zinc-100 hover:shadow-[2px_2px_0_#000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all"
            >
              <ArrowLeft size={16} />
            </button>
          )}
          <div>
            <div className="flex items-center gap-1 text-[10px] font-black uppercase text-zinc-400">
              <span className="cursor-pointer hover:text-black" onClick={() => { setView("categories"); setActiveCategory(null); setActiveTopic(null); }}>Categories</span>
              {activeCategory && (
                <>
                  <ChevronRight size={10} />
                  <span className="cursor-pointer hover:text-black" onClick={() => { setView("topics"); setActiveTopic(null); }}>{activeCategory.titleEn}</span>
                </>
              )}
              {activeTopic && (
                <>
                  <ChevronRight size={10} />
                  <span className="text-black">{activeTopic.nameEn}</span>
                </>
              )}
            </div>
            <h1 className="text-xl md:text-2xl font-black uppercase tracking-wide mt-0.5">
              {view === "categories" && "Question Library"}
              {view === "topics" && activeCategory?.titleEn}
              {view === "questions" && activeTopic?.nameEn}
            </h1>
          </div>
        </div>

        {view === "questions" && activeTopic && (
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-green-400 border-2 border-black px-4 py-2 font-black text-xs hover:shadow-[3px_3px_0_#000] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all inline-flex items-center gap-1.5 uppercase"
          >
            <Plus size={14} /> Add Question
          </button>
        )}
      </div>

      {/* VIEW 1: Categories */}
      {view === "categories" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {CATEGORIES.map((cat, i) => {
            const stats = categoryStats[cat.id] || { topics: 0, questions: 0 };
            return (
              <div 
                key={cat.id}
                onClick={() => openCategory(cat)}
                className="bg-white border-2 border-black p-5 cursor-pointer hover:shadow-[6px_6px_0_#000] hover:-translate-x-1 hover:-translate-y-1 transition-all flex flex-col justify-between"
                style={{ boxShadow: "3px 3px 0 #000" }}
              >
                <div>
                  <div 
                    className="w-10 h-10 border-2 border-black flex items-center justify-center font-black text-sm mb-4"
                    style={{ backgroundColor: cat.color }}
                  >
                    {i + 1}
                  </div>
                  <h3 className="font-black text-base uppercase leading-tight mb-1">{cat.titleEn}</h3>
                  <p className="text-xs text-zinc-500 font-bold mb-4" style={{ fontFamily: "var(--font-system)" }}>{cat.titleKm}</p>
                </div>

                <div className="border-t-2 border-black pt-3 flex items-center justify-between text-xs font-black uppercase tracking-wide">
                  <span className="text-zinc-500">{stats.topics} Topics</span>
                  <span className="text-blue-600">{stats.questions} Q&A</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* VIEW 2: Topics List */}
      {view === "topics" && activeCategory && (
        <div className="space-y-4">
          {/* Filters Panel */}
          <div className="bg-white border-2 border-black p-4 space-y-3" style={{ boxShadow: "3px 3px 0 #000" }}>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              {/* Search */}
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={16} />
                <input
                  type="text"
                  placeholder="Search topics by code or name..."
                  value={topicSearch}
                  onChange={e => setTopicSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 border-2 border-black text-xs font-bold focus:outline-none focus:shadow-[2px_2px_0_#000]"
                />
              </div>

              {/* Status pills */}
              <div className="flex flex-wrap gap-1.5 items-center">
                <span className="text-[10px] font-black uppercase text-zinc-400 mr-1.5">Status:</span>
                <button
                  onClick={() => setTopicStatusFilter("all")}
                  className={`px-2.5 py-1 border-2 border-black text-xs font-black uppercase transition-all ${
                    topicStatusFilter === "all" ? "bg-black text-white" : "bg-white hover:bg-zinc-50"
                  }`}
                >
                  All
                </button>
                {Object.keys(STATUS_CONFIG).map(s => (
                  <button
                    key={s}
                    onClick={() => setTopicStatusFilter(s)}
                    className={`px-2.5 py-1 border-2 border-black text-xs font-black uppercase transition-all ${
                      topicStatusFilter === s ? "bg-black text-white" : "bg-white hover:bg-zinc-50"
                    }`}
                  >
                    {STATUS_CONFIG[s].label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Topics Grid */}
          {filteredTopics.length === 0 ? (
            <div className="bg-white border-2 border-black p-12 text-center" style={{ boxShadow: "3px 3px 0 #000" }}>
              <BookOpen className="mx-auto mb-2 text-zinc-300" size={32} />
              <p className="font-black text-zinc-500 text-sm uppercase">No topics found</p>
              <p className="text-xs text-zinc-400 mt-1">Try modifying your filters or search terms.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredTopics.map(t => {
                const s = STATUS_CONFIG[t.status] || STATUS_CONFIG.draft;
                const StatusIcon = s.icon;
                return (
                  <div
                    key={t.id}
                    onClick={() => openTopic(t)}
                    className="bg-white border-2 border-black p-4 hover:shadow-[5px_5px_0_#000] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all cursor-pointer flex flex-col justify-between gap-4"
                    style={{ boxShadow: "3px 3px 0 #000" }}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-mono text-[10px] font-black bg-zinc-100 border border-zinc-300 px-2 py-0.5 text-zinc-500">
                          {t.topicCode}
                        </span>
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-[9px] font-black uppercase border-2 border-black ${s.bg} ${s.text}`}>
                          <StatusIcon size={10} /> {s.label}
                        </span>
                      </div>
                      <h4 className="font-black text-sm uppercase leading-tight">{t.nameEn}</h4>
                      <p className="text-xs text-zinc-500 font-bold mt-0.5" style={{ fontFamily: "var(--font-system)" }}>{t.nameKm}</p>
                    </div>

                    <div className="border-t-2 border-black pt-3 flex items-center justify-between">
                      <span className="text-xs text-blue-600 font-black uppercase tracking-wide">
                        {t.questionCount ?? t.question_count ?? 0} Questions
                      </span>
                      <span className="text-xs font-black text-zinc-400 group-hover:text-black flex items-center gap-0.5">
                        Manage <ChevronRight size={14} />
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* VIEW 3: Topic Questions (collapsible dashboard) */}
      {view === "questions" && activeTopic && (
        <div className="space-y-4">
          {/* Alert / Lock Notice */}
          <div className="bg-white border-2 border-black p-4 flex items-start gap-3" style={{ boxShadow: "3px 3px 0 #000" }}>
            <HelpIcon size={18} className="text-blue-500 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-black text-black uppercase tracking-wide">
                Moderation Queue Active
              </h4>
              <p className="text-xs text-zinc-500 mt-1 leading-relaxed">
                You can add new questions to this topic. Any new or edited questions will enter the review queue and require Administrator approval. Once approved or published, questions cannot be edited or deleted by staff.
              </p>
            </div>
          </div>

          {/* Filters panel */}
          <div className="bg-white border-2 border-black p-4 space-y-4" style={{ boxShadow: "3px 3px 0 #000" }}>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              {/* Search */}
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={16} />
                <input
                  type="text"
                  placeholder="Search questions..."
                  value={questionSearch}
                  onChange={e => setQuestionSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 border-2 border-black text-xs font-bold focus:outline-none focus:shadow-[2px_2px_0_#000]"
                />
              </div>

              <div className="flex flex-wrap gap-2">
                {/* Type filter */}
                <BrandSelect 
                  value={typeFilter} 
                  onValueChange={setTypeFilter} 
                  ariaLabel="Filter by type" 
                  className="px-3 py-2 text-xs min-w-[130px]"
                  options={[
                    { value: "all", label: "All Types" },
                    { value: "mcq", label: "Multiple Choice" },
                    { value: "true-false", label: "True / False" },
                    { value: "multi-select", label: "Multi-Select" },
                    { value: "image-match", label: "Image Based" },
                    { value: "type-answer", label: "Type Answer" },
                  ]} 
                />

                {/* Diff filter */}
                <BrandSelect 
                  value={diffFilter} 
                  onValueChange={setDiffFilter} 
                  ariaLabel="Filter by level" 
                  className="px-3 py-2 text-xs min-w-[130px]"
                  options={[
                    { value: "all", label: "All Levels" },
                    { value: "easy", label: "Easy" },
                    { value: "medium", label: "Medium" },
                    { value: "hard", label: "Hard" },
                  ]} 
                />
              </div>
            </div>
          </div>

          {/* Question List */}
          {questionsLoading ? (
            <div className="bg-white border-2 border-black py-16 text-center" style={{ boxShadow: "3px 3px 0 #000" }}>
              <div className="animate-spin w-8 h-8 border-4 border-black border-t-transparent rounded-full mx-auto mb-3" />
              <p className="text-xs font-black uppercase text-zinc-500">Loading questions...</p>
            </div>
          ) : filteredQuestions.length === 0 ? (
            <div className="bg-white border-2 border-black p-12 text-center" style={{ boxShadow: "3px 3px 0 #000" }}>
              <HelpCircle className="mx-auto mb-2 text-zinc-300" size={32} />
              <p className="font-black text-zinc-500 text-sm uppercase">No questions found</p>
              <button
                onClick={() => setShowAddModal(true)}
                className="mt-4 bg-green-400 border-2 border-black px-4 py-2 font-black text-xs hover:shadow-[3px_3px_0_#000] inline-flex items-center gap-1.5 uppercase"
              >
                <Plus size={14} /> Create First Question
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredQuestions.map((q, idx) => {
                const s = STATUS_CONFIG[q.status] || STATUS_CONFIG.draft;
                const StatusIcon = s.icon;
                const isExpanded = expandedId === q.id;
                return (
                  <div 
                    key={q.id}
                    className={`border-2 border-black bg-white overflow-hidden transition-all ${
                      isExpanded ? "shadow-[5px_5px_0_#000]" : "shadow-[3px_3px_0_#000]"
                    }`}
                  >
                    {/* summary card row */}
                    <div 
                      onClick={() => setExpandedId(isExpanded ? null : q.id)}
                      className="flex items-center justify-between gap-4 px-4 py-3 cursor-pointer hover:bg-zinc-50"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="w-6 h-6 border-2 border-black bg-black text-white text-[10px] font-black flex items-center justify-center shrink-0">
                          {idx + 1}
                        </span>
                        <div className="min-w-0">
                          <h4 className="font-bold text-sm text-black truncate">{q.questionEn}</h4>
                          {q.questionKm && (
                            <p className="text-xs text-zinc-500 truncate mt-0.5" style={{ fontFamily: "var(--font-system)" }}>{q.questionKm}</p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className={`px-2 py-0.5 text-[9px] font-black uppercase border border-black ${s.bg} ${s.text} inline-flex items-center gap-1`}>
                          <StatusIcon size={9} /> {s.label}
                        </span>
                        <span className={`px-2 py-0.5 text-[9px] font-black uppercase border border-zinc-300 ${DIFFICULTY_COLORS[q.difficulty] || DIFFICULTY_COLORS.medium}`}>
                          {q.difficulty}
                        </span>

                          {q.status !== "approved" && q.status !== "published" && (
                            <div className="flex items-center gap-1 ml-2" onClick={e => e.stopPropagation()}>
                              <button
                                onClick={() => setEditingQuestion(q)}
                                className="p-1.5 border-2 border-black bg-yellow-100 hover:bg-yellow-200 transition-all"
                                title="Edit Question"
                              >
                                <Edit size={12} />
                              </button>
                              <button
                                onClick={() => handleDeleteQuestion(q.id)}
                                className="p-1.5 border-2 border-black bg-red-100 hover:bg-red-200 transition-all text-red-700"
                                title="Delete Question"
                              >
                                <Trash2 size={12} />
                              </button>
                            </div>
                          )}
                      </div>
                    </div>

                    {/* expanded content */}
                    {isExpanded && (
                      <div className="border-t-2 border-black p-4 bg-zinc-50 space-y-4">
                        {q.image_url && (
                          <div className="border-2 border-black bg-white p-2 inline-block">
                            <img src={q.image_url} alt="" className="max-h-24 object-contain" />
                          </div>
                        )}

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                          {q.answers?.map((a: any, ai: number) => (
                            <div 
                              key={ai}
                              className={`flex items-center gap-2 px-3 py-2 border-2 text-xs font-bold ${
                                a.isCorrect 
                                  ? "border-green-500 bg-green-50 text-green-900"
                                  : "border-zinc-300 bg-white text-zinc-600"
                              }`}
                            >
                              {a.isCorrect ? (
                                <CheckCircle size={13} className="text-green-600 shrink-0" />
                              ) : (
                                <Circle size={13} className="text-zinc-400 shrink-0" />
                              )}
                              <div className="truncate">
                                <p className="font-bold">{a.answerEn}</p>
                                {a.answerKm && <p className="text-[10px] text-zinc-400 font-medium mt-0.5" style={{ fontFamily: "var(--font-system)" }}>{a.answerKm}</p>}
                              </div>
                            </div>
                          ))}
                        </div>

                        {(q.hint_en || q.hint_km) && (
                          <div className="bg-yellow-50 border-2 border-yellow-200 p-3 text-xs">
                            {q.hint_en && <p className="font-bold text-yellow-900">Hint (EN): {q.hint_en}</p>}
                            {q.hint_km && <p className="font-bold text-yellow-900 mt-1" style={{ fontFamily: "var(--font-system)" }}>Hint (KM): {q.hint_km}</p>}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Question Modals */}
      {showAddModal && activeTopic && (
        <QuestionFormModal
          preSelectedTopic={{
            id: activeTopic.id,
            topicCode: activeTopic.topicCode,
            nameEn: activeTopic.nameEn,
            nameKm: activeTopic.nameKm,
            categoryId: activeTopic.categoryId,
            categorySlug: CATEGORY_SLUGS[activeTopic.categoryId] || "road-sign",
            primaryImageUrl: activeTopic.primaryImageUrl,
          }}
          userRole="staff"
          onClose={() => setShowAddModal(false)}
          onSuccess={() => {
            setShowAddModal(false);
            fetchQuestionsForTopic(activeTopic.id);
          }}
        />
      )}

      {editingQuestion && activeTopic && (
        <QuestionFormModal
          initialData={editingQuestion}
          preSelectedTopic={{
            id: activeTopic.id,
            topicCode: activeTopic.topicCode,
            nameEn: activeTopic.nameEn,
            nameKm: activeTopic.nameKm,
            categoryId: activeTopic.categoryId,
            categorySlug: CATEGORY_SLUGS[activeTopic.categoryId] || "road-sign",
            primaryImageUrl: activeTopic.primaryImageUrl,
          }}
          userRole="staff"
          onClose={() => setEditingQuestion(null)}
          onSuccess={() => {
            setEditingQuestion(null);
            fetchQuestionsForTopic(activeTopic.id);
          }}
        />
      )}
    </div>
  );
}
