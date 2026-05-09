"use client";

import { useState, useEffect } from "react";
import { Plus, Search, RefreshCw, Edit, Trash2, HelpCircle, ChevronRight, ArrowLeft, BookOpen, CircleDot, CheckCheck, Type, Puzzle, Images, MapPin, CheckSquare, Layers } from "lucide-react";
import { QuestionFormModal } from "./question-form-modal";
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
    answerCount: number;
    createdAt: string;
}

interface Category {
    id: number;
    slug: string;
    titleEn: string;
}

interface Topic {
    id: number;
    topicCode: string;
    nameEn: string;
    nameKm: string;
    categoryId: number;
    categoryName: string;
    subGroup?: string;
    status: string;
}

const DIFF_COLORS: Record<string, string> = {
    easy: "#22c55e",
    medium: "#f59e0b",
    hard: "#ef4444",
};

const TYPE_ICONS: Record<string, any> = {
    mcq: CircleDot,
    "true-false": CheckCheck,
    "type-answer": Type,
    puzzle: Puzzle,
    "image-match": Images,
    "pin-location": MapPin,
    "multi-select": CheckSquare,
};

const TYPE_LABELS: Record<string, string> = {
    mcq: "MCQ",
    "true-false": "True/False",
    "type-answer": "Type Answer",
    puzzle: "Puzzle",
    "image-match": "Image Match",
    "pin-location": "Pin Location",
    "multi-select": "Multi-Select",
};

// View states: "categories" | "topics" | "questions"
type View = "categories" | "topics" | "questions";

export function QuestionManagementPanel() {
    const { showToast } = useToast();

    // Data
    const [categories, setCategories] = useState<Category[]>([]);
    const [topics, setTopics] = useState<Topic[]>([]);
    const [questions, setQuestions] = useState<Question[]>([]);
    const [allQuestions, setAllQuestions] = useState<Question[]>([]);

    // Navigation
    const [view, setView] = useState<View>("categories");
    const [activeCategory, setActiveCategory] = useState<Category | null>(null);
    const [activeTopic, setActiveTopic] = useState<Topic | null>(null);

    // Filters (only for questions view)
    const [search, setSearch] = useState("");
    const [typeFilter, setTypeFilter] = useState("all");
    const [diffFilter, setDiffFilter] = useState("all");

    // Topic filters
    const [topicStatusFilter, setTopicStatusFilter] = useState("all");
    const [topicSubGroupFilter, setTopicSubGroupFilter] = useState("all");
    const [topicSearch, setTopicSearch] = useState("");

    // Modal
    const [showModal, setShowModal] = useState(false);
    const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
    const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAll();
    }, []);

    const fetchAll = async () => {
        setLoading(true);
        try {
            const [catRes, topicRes, qRes] = await Promise.all([
                fetch("/api/categories"),
                fetch("/api/admin/topics"),
                fetch("/api/admin/questions"),
            ]);
            const catData = await catRes.json();
            const topicData = await topicRes.json();
            const qData = await qRes.json();

            const cats = Array.isArray(catData) ? catData : (catData.categories || []);
            const tops = Array.isArray(topicData) ? topicData : (topicData.topics || []);
            const qs = Array.isArray(qData) ? qData : (qData.questions || []);

            setCategories(cats);
            setTopics(tops);
            setAllQuestions(qs);
            setQuestions(qs);
        } catch (e) {
            showToast("Failed to load data", "error");
        } finally {
            setLoading(false);
        }
    };

    // Refresh just the questions (faster, no full reload)
    const refreshQuestions = async (topicIdFilter?: number) => {
        try {
            const url = topicIdFilter
                ? `/api/admin/questions?topicId=${topicIdFilter}`
                : `/api/admin/questions`;
            const res = await fetch(url);
            const data = await res.json();
            const qs = Array.isArray(data.questions) ? data.questions : [];
            if (topicIdFilter) {
                setQuestions(qs);
                setAllQuestions(prev => [
                    ...prev.filter(q => q.topicId !== topicIdFilter),
                    ...qs
                ]);
            } else {
                setAllQuestions(qs);
                setQuestions(qs);
            }
        } catch { }
    };

    const handleDelete = async (id: number) => {
        try {
            const res = await fetch(`/api/admin/questions/${id}`, { method: "DELETE" });
            if (res.ok) {
                showToast("Question deleted", "success");
                setDeleteConfirm(null);
                const updated = allQuestions.filter(q => q.id !== id);
                setAllQuestions(updated);
                setQuestions(updated.filter(q => activeTopic ? q.topicId === activeTopic.id : true));
            } else {
                showToast("Failed to delete", "error");
            }
        } catch {
            showToast("Failed to delete question", "error");
        }
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setEditingQuestion(null);
    };

    const handleSuccess = () => {
        handleCloseModal();
        // Refresh questions for current topic or all
        if (activeTopic) {
            refreshQuestions(activeTopic.id);
        } else {
            refreshQuestions();
        }
    };

    // Derived counts
    const getTopicQCount = (topicId: number) =>
        allQuestions.filter(q => q.topicId === topicId).length;

    const getCategoryQCount = (categoryId: number) =>
        allQuestions.filter(q => q.categoryId === categoryId).length;

    const getCategoryTopicCount = (categoryId: number) =>
        topics.filter(t => t.categoryId === categoryId).length;

    // Filtered questions for topic view
    const filteredQuestions = questions.filter(q => {
        if (typeFilter !== "all" && q.questionType !== typeFilter) return false;
        if (diffFilter !== "all" && q.difficulty !== diffFilter) return false;
        if (search) {
            const s = search.toLowerCase();
            return q.questionEn?.toLowerCase().includes(s) || q.topicName?.toLowerCase().includes(s);
        }
        return true;
    });

    // Navigate to category topics
    const openCategory = (cat: Category) => {
        setActiveCategory(cat);
        setActiveTopic(null);
        setView("topics");
        setSearch("");
        setTypeFilter("all");
        setDiffFilter("all");
        setTopicStatusFilter("all");
        setTopicSubGroupFilter("all");
        setTopicSearch("");
    };

    // Navigate to topic questions — always fetch fresh from API
    const openTopic = async (topic: Topic) => {
        setActiveTopic(topic);
        setView("questions");
        setSearch("");
        setTypeFilter("all");
        setDiffFilter("all");
        // Fetch fresh questions for this topic from API
        try {
            const res = await fetch(`/api/admin/questions?topicId=${topic.id}`);
            const data = await res.json();
            const qs = Array.isArray(data.questions) ? data.questions : [];
            setQuestions(qs);
            // Also update allQuestions to include any new ones
            setAllQuestions(prev => {
                const existingIds = new Set(prev.map(q => q.id));
                const newOnes = qs.filter((q: Question) => !existingIds.has(q.id));
                return [...prev.filter(q => q.topicId !== topic.id), ...qs];
            });
        } catch {
            setQuestions(allQuestions.filter(q => q.topicId === topic.id));
        }
    };

    const goBack = () => {
        if (view === "questions") {
            setView("topics");
            setActiveTopic(null);
        } else {
            setView("categories");
            setActiveCategory(null);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <div className="inline-block w-10 h-10 border-4 border-black border-t-transparent rounded-full animate-spin mb-3" />
                    <p className="font-bold text-zinc-500 text-sm">Loading...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="bg-white border-4 border-black p-4 shadow-[4px_4px_0_#000] flex items-center justify-between">
                <div className="flex items-center gap-3">
                    {view !== "categories" && (
                        <button
                            onClick={goBack}
                            className="p-2 border-2 border-black bg-white hover:bg-gray-100 hover:shadow-[2px_2px_0_#000] transition-all"
                        >
                            <ArrowLeft size={18} />
                        </button>
                    )}
                    <div>
                        {/* Breadcrumb */}
                        <div className="flex items-center gap-1 text-xs text-zinc-500 font-bold mb-0.5">
                            <button onClick={() => { setView("categories"); setActiveCategory(null); setActiveTopic(null); }} className="hover:text-black">
                                All Categories
                            </button>
                            {activeCategory && (
                                <>
                                    <ChevronRight size={12} />
                                    <button onClick={() => { setView("topics"); setActiveTopic(null); }} className="hover:text-black">
                                        {activeCategory.titleEn}
                                    </button>
                                </>
                            )}
                            {activeTopic && (
                                <>
                                    <ChevronRight size={12} />
                                    <span className="text-black">{activeTopic.nameEn}</span>
                                </>
                            )}
                        </div>
                        <h1 className="text-xl font-black text-black">
                            {view === "categories" && "Topic Questions"}
                            {view === "topics" && activeCategory?.titleEn}
                            {view === "questions" && activeTopic?.nameEn}
                        </h1>
                        {view === "questions" && activeTopic && (
                            <p className="text-xs text-zinc-500 font-medium">{activeTopic.topicCode} · {activeCategory?.titleEn}</p>
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <button onClick={() => activeTopic ? refreshQuestions(activeTopic.id) : fetchAll()} className="p-2 border-2 border-black bg-white hover:bg-gray-100 hover:shadow-[2px_2px_0_#000] transition-all" title="Refresh">
                        <RefreshCw size={16} />
                    </button>
                    {(view === "topics" || view === "questions") && (
                        <button
                            onClick={() => setShowModal(true)}
                            className="bg-green-400 border-2 border-black px-4 py-2 font-black text-sm hover:shadow-[4px_4px_0_#000] transition-all inline-flex items-center gap-2"
                        >
                            <Plus size={16} />
                            Add Question
                        </button>
                    )}
                </div>
            </div>

            {/* VIEW: Categories */}
            {view === "categories" && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {categories.map((cat, i) => {
                        const topicCount = getCategoryTopicCount(cat.id);
                        const qCount = getCategoryQCount(cat.id);
                        const colors = [
                            "bg-blue-400", "bg-purple-400", "bg-green-400", "bg-yellow-400",
                            "bg-orange-400", "bg-pink-400", "bg-teal-400", "bg-red-400"
                        ];
                        return (
                            <button
                                key={cat.id}
                                onClick={() => openCategory(cat)}
                                className="bg-white border-4 border-black p-5 text-left hover:shadow-[6px_6px_0_#000] hover:-translate-y-0.5 transition-all group"
                            >
                                <div className={`w-10 h-10 ${colors[i % colors.length]} border-2 border-black flex items-center justify-center font-black text-lg mb-3`}>
                                    {i + 1}
                                </div>
                                <div className="font-black text-sm text-black mb-2 leading-tight">{cat.titleEn}</div>
                                <div className="flex items-center gap-3 mt-auto">
                                    <span className="text-xs font-bold text-zinc-500">{topicCount} topics</span>
                                    <span className="text-xs font-black text-blue-600">{qCount} Q</span>
                                </div>
                                <div className="mt-3 flex items-center gap-1 text-xs font-black text-zinc-400 group-hover:text-black transition-colors">
                                    View topics <ChevronRight size={12} />
                                </div>
                            </button>
                        );
                    })}
                </div>
            )}

            {/* VIEW: Topics in a category */}
            {view === "topics" && activeCategory && (() => {
                const catTopics = topics.filter(t => t.categoryId === activeCategory.id);

                // Derive unique subGroups for this category
                const subGroups = Array.from(
                    new Set(catTopics.map(t => t.subGroup).filter(Boolean))
                ).sort() as string[];

                const filtered = catTopics
                    .filter(t => topicStatusFilter === "all" || t.status === topicStatusFilter)
                    .filter(t => topicSubGroupFilter === "all" || t.subGroup === topicSubGroupFilter)
                    .filter(t => {
                        if (!topicSearch) return true;
                        const s = topicSearch.toLowerCase();
                        return t.nameEn?.toLowerCase().includes(s)
                            || t.nameKm?.toLowerCase().includes(s)
                            || t.topicCode?.toLowerCase().includes(s)
                            || String(t.id).includes(s);
                    });

                const statusTags = [
                    { value: "all", label: "All", bg: "bg-yellow-400" },
                    { value: "approved", label: "Approved", bg: "bg-green-400" },
                    { value: "pending", label: "Pending", bg: "bg-orange-300" },
                    { value: "draft", label: "Draft", bg: "bg-zinc-300" },
                    { value: "rejected", label: "Rejected", bg: "bg-red-400" },
                ];

                return (
                    <div className="space-y-3">
                        {/* Stats + filter bar */}
                        <div className="bg-white border-2 border-black p-3 shadow-[2px_2px_0_#000] space-y-3">
                            {/* Row 1: Stats + Status filters + Search */}
                            <div className="flex items-center gap-3 flex-wrap">
                                <div className="flex items-center gap-4 flex-shrink-0">
                                    <div>
                                        <span className="text-2xl font-black text-black">{catTopics.length}</span>
                                        <span className="text-xs font-bold text-zinc-500 ml-1">Topics</span>
                                    </div>
                                    <div>
                                        <span className="text-2xl font-black text-blue-600">{getCategoryQCount(activeCategory.id)}</span>
                                        <span className="text-xs font-bold text-zinc-500 ml-1">Questions</span>
                                    </div>
                                    <div>
                                        <span className="text-2xl font-black text-zinc-400">{filtered.length}</span>
                                        <span className="text-xs font-bold text-zinc-500 ml-1">Showing</span>
                                    </div>
                                </div>

                                {/* Status filters */}
                                <div className="flex items-center gap-1 flex-wrap">
                                    <span className="text-xs font-black text-zinc-400 uppercase mr-1">Status:</span>
                                    {statusTags.map(tag => {
                                        const count = tag.value === "all" ? catTopics.length : catTopics.filter(t => t.status === tag.value).length;
                                        const isActive = topicStatusFilter === tag.value;
                                        return (
                                            <button key={tag.value} onClick={() => setTopicStatusFilter(tag.value)}
                                                className={`px-2.5 py-1 border-2 border-black text-xs font-black transition-all ${isActive ? `${tag.bg} shadow-[2px_2px_0_#000]` : "bg-white hover:bg-gray-50"}`}>
                                                {tag.label} <span className="font-medium text-zinc-500">({count})</span>
                                            </button>
                                        );
                                    })}
                                </div>

                                {/* Search */}
                                <div className="relative ml-auto">
                                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-400" size={14} />
                                    <input type="text" placeholder="Search ID, code, name..." value={topicSearch}
                                        onChange={e => setTopicSearch(e.target.value)}
                                        className="pl-8 pr-3 py-1.5 border-2 border-black text-xs font-medium focus:outline-none w-48" />
                                </div>
                            </div>

                            {/* Row 2: SubGroup / Tag filters */}
                            {subGroups.length > 0 && (
                                <div className="flex items-center gap-1 flex-wrap pt-2 border-t border-zinc-200">
                                    <span className="text-xs font-black text-zinc-400 uppercase mr-1">Tag:</span>
                                    <button
                                        onClick={() => setTopicSubGroupFilter("all")}
                                        className={`px-2.5 py-1 border-2 border-black text-xs font-black transition-all ${topicSubGroupFilter === "all" ? "bg-black text-white shadow-[2px_2px_0_#000]" : "bg-white hover:bg-gray-50"}`}
                                    >
                                        All Tags
                                        <span className="ml-1 font-medium opacity-70">({catTopics.length})</span>
                                    </button>
                                    {subGroups.map(sg => {
                                        const count = catTopics.filter(t => t.subGroup === sg).length;
                                        const isActive = topicSubGroupFilter === sg;
                                        return (
                                            <button
                                                key={sg}
                                                onClick={() => setTopicSubGroupFilter(sg)}
                                                className={`px-2.5 py-1 border-2 border-black text-xs font-bold transition-all ${isActive ? "bg-purple-400 shadow-[2px_2px_0_#000]" : "bg-white hover:bg-purple-50"}`}
                                            >
                                                {sg}
                                                <span className="ml-1 font-medium text-zinc-500">({count})</span>
                                            </button>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        {filtered.length === 0 ? (
                            <div className="bg-white border-2 border-black p-12 text-center shadow-[2px_2px_0_#000]">
                                <BookOpen size={40} className="mx-auto mb-3 text-zinc-300" />
                                <p className="font-black text-zinc-500">No topics found</p>
                            </div>
                        ) : (
                            <div className="bg-white border-2 border-black overflow-hidden shadow-[4px_4px_0_#000]">
                                <table className="w-full">
                                    <thead className="bg-black text-white">
                                        <tr>
                                            <th className="px-3 py-2.5 text-left text-xs font-black uppercase w-12">ID</th>
                                            <th className="px-3 py-2.5 text-left text-xs font-black uppercase w-28">Code</th>
                                            <th className="px-3 py-2.5 text-left text-xs font-black uppercase">English</th>
                                            <th className="px-3 py-2.5 text-left text-xs font-black uppercase">Khmer</th>
                                            <th className="px-3 py-2.5 text-left text-xs font-black uppercase w-24">Status</th>
                                            <th className="px-3 py-2.5 text-center text-xs font-black uppercase w-16">Q</th>
                                            <th className="px-3 py-2.5 text-left text-xs font-black uppercase w-24">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-zinc-200">
                                        {filtered.map(topic => {
                                            const qCount = getTopicQCount(topic.id);
                                            return (
                                                <tr key={topic.id} className="hover:bg-yellow-50 transition-colors">
                                                    <td className="px-3 py-2.5">
                                                        <span className="text-xs font-black text-zinc-400">#{topic.id}</span>
                                                    </td>
                                                    <td className="px-3 py-2.5">
                                                        <span className="text-xs font-mono font-bold text-zinc-700 bg-zinc-100 px-2 py-1 border border-zinc-300 whitespace-nowrap">{topic.topicCode}</span>
                                                    </td>
                                                    <td className="px-3 py-2.5">
                                                        <div className="font-bold text-sm text-black">{topic.nameEn}</div>
                                                        {topic.subGroup && (
                                                            <span className="inline-block mt-1 text-xs font-bold px-2 py-0.5 bg-purple-100 border border-purple-300 text-purple-700">
                                                                {topic.subGroup}
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td className="px-3 py-2.5">
                                                        <div className="text-sm text-zinc-700">{topic.nameKm || <span className="text-zinc-300 italic text-xs">—</span>}</div>
                                                    </td>
                                                    <td className="px-3 py-2.5">
                                                        <span className={`text-xs font-black px-2 py-1 border border-black ${topic.status === "approved" ? "bg-green-100 text-green-800" :
                                                            topic.status === "pending" ? "bg-yellow-100 text-yellow-800" :
                                                                topic.status === "rejected" ? "bg-red-100 text-red-800" :
                                                                    "bg-zinc-100 text-zinc-600"}`}>
                                                            {topic.status}
                                                        </span>
                                                    </td>
                                                    <td className="px-3 py-2.5 text-center">
                                                        <button onClick={() => openTopic(topic)}
                                                            className={`inline-flex items-center gap-1 px-3 py-1 border-2 border-black font-black text-sm transition-all hover:shadow-[2px_2px_0_#000] ${qCount > 0 ? "bg-blue-400 text-black" : "bg-zinc-100 text-zinc-500"}`}>
                                                            {qCount}<ChevronRight size={13} />
                                                        </button>
                                                    </td>
                                                    <td className="px-3 py-2.5">
                                                        <button onClick={() => { setActiveTopic(topic); setShowModal(true); }}
                                                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-green-400 border-2 border-black font-black text-xs hover:shadow-[2px_2px_0_#000] transition-all">
                                                            <Plus size={12} />Add Q
                                                        </button>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                );
            })()}

            {/* VIEW: Questions in a topic */}
            {view === "questions" && activeTopic && (
                <div className="space-y-3">
                    {/* Topic stats + filters */}
                    <div className="bg-white border-2 border-black p-3 shadow-[2px_2px_0_#000]">
                        <div className="flex items-center gap-4 flex-wrap">
                            {/* Stats */}
                            <div className="flex items-center gap-4">
                                <div>
                                    <span className="text-2xl font-black text-black">{filteredQuestions.length}</span>
                                    <span className="text-xs font-bold text-zinc-500 ml-1">Questions</span>
                                </div>
                                {["easy", "medium", "hard"].map(d => (
                                    <div key={d}>
                                        <span className="text-lg font-black" style={{ color: DIFF_COLORS[d] }}>
                                            {filteredQuestions.filter(q => q.difficulty === d).length}
                                        </span>
                                        <span className="text-xs font-bold text-zinc-500 ml-1 capitalize">{d}</span>
                                    </div>
                                ))}
                            </div>

                            <div className="flex items-center gap-2 ml-auto flex-wrap">
                                {/* Search */}
                                <div className="relative">
                                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-400" size={14} />
                                    <input
                                        type="text"
                                        placeholder="Search..."
                                        value={search}
                                        onChange={e => setSearch(e.target.value)}
                                        className="pl-8 pr-3 py-1.5 border-2 border-black text-xs font-medium focus:outline-none w-40"
                                    />
                                </div>

                                {/* Type filter */}
                                <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} className="px-2 py-1.5 border-2 border-black text-xs font-bold bg-white focus:outline-none">
                                    <option value="all">All Types</option>
                                    <option value="mcq">MCQ</option>
                                    <option value="true-false">True/False</option>
                                    <option value="type-answer">Type Answer</option>
                                    <option value="puzzle">Puzzle</option>
                                    <option value="image-match">Image Match</option>
                                    <option value="pin-location">Pin Location</option>
                                    <option value="multi-select">Multi-Select</option>
                                </select>

                                {/* Difficulty filter */}
                                <select value={diffFilter} onChange={e => setDiffFilter(e.target.value)} className="px-2 py-1.5 border-2 border-black text-xs font-bold bg-white focus:outline-none">
                                    <option value="all">All Levels</option>
                                    <option value="easy">Easy</option>
                                    <option value="medium">Medium</option>
                                    <option value="hard">Hard</option>
                                </select>

                                <button
                                    onClick={() => setShowModal(true)}
                                    className="bg-green-400 border-2 border-black px-3 py-1.5 font-black text-xs hover:shadow-[3px_3px_0_#000] transition-all inline-flex items-center gap-1"
                                >
                                    <Plus size={14} />
                                    Add Question
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Questions list */}
                    {filteredQuestions.length === 0 ? (
                        <div className="bg-white border-2 border-black p-12 text-center shadow-[2px_2px_0_#000]">
                            <HelpCircle size={40} className="mx-auto mb-3 text-zinc-300" />
                            <p className="font-black text-zinc-500 mb-1">No questions yet</p>
                            <p className="text-xs text-zinc-400 mb-4">Be the first to add a question to this topic</p>
                            <button
                                onClick={() => setShowModal(true)}
                                className="bg-green-400 border-2 border-black px-4 py-2 font-black text-sm hover:shadow-[3px_3px_0_#000] transition-all inline-flex items-center gap-2"
                            >
                                <Plus size={15} />
                                Add First Question
                            </button>
                        </div>
                    ) : (
                        <div className="bg-white border-2 border-black overflow-hidden shadow-[4px_4px_0_#000]">
                            <table className="w-full">
                                <thead className="bg-black text-white">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-black uppercase">#</th>
                                        <th className="px-4 py-3 text-left text-xs font-black uppercase">Question</th>
                                        <th className="px-4 py-3 text-left text-xs font-black uppercase w-28">Type</th>
                                        <th className="px-4 py-3 text-left text-xs font-black uppercase w-20">Level</th>
                                        <th className="px-4 py-3 text-left text-xs font-black uppercase w-16">Ans</th>
                                        <th className="px-4 py-3 text-left text-xs font-black uppercase w-24">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-zinc-200">
                                    {filteredQuestions.map((q, i) => {
                                        const TypeIcon = TYPE_ICONS[q.questionType] || Layers;
                                        return (
                                            <tr key={q.id} className="hover:bg-yellow-50 transition-colors">
                                                <td className="px-4 py-3 text-xs font-black text-zinc-400">{i + 1}</td>
                                                <td className="px-4 py-3">
                                                    <div className="text-sm font-bold text-black line-clamp-2">{q.questionEn}</div>
                                                    {q.questionKm && <div className="text-xs text-zinc-400 line-clamp-1 mt-0.5">{q.questionKm}</div>}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 border border-blue-200 text-xs font-bold text-blue-700">
                                                        <TypeIcon size={12} />
                                                        {TYPE_LABELS[q.questionType] || q.questionType}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span className="inline-block px-2 py-1 border border-black text-xs font-black text-white" style={{ backgroundColor: DIFF_COLORS[q.difficulty] || "#6b7280" }}>
                                                        {q.difficulty?.toUpperCase()}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-xs font-bold text-zinc-600">{q.answerCount}</td>
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center gap-1">
                                                        <button onClick={() => setEditingQuestion(q)} className="p-1.5 border-2 border-black bg-yellow-100 hover:bg-yellow-200 hover:shadow-[2px_2px_0_#000] transition-all" title="Edit">
                                                            <Edit size={13} />
                                                        </button>
                                                        {deleteConfirm === q.id ? (
                                                            <div className="flex gap-1">
                                                                <button onClick={() => handleDelete(q.id)} className="px-2 py-1 text-xs font-black bg-red-500 text-white border border-black">Yes</button>
                                                                <button onClick={() => setDeleteConfirm(null)} className="px-2 py-1 text-xs font-black bg-white border border-black">No</button>
                                                            </div>
                                                        ) : (
                                                            <button onClick={() => setDeleteConfirm(q.id)} className="p-1.5 border-2 border-black bg-red-100 hover:bg-red-200 hover:shadow-[2px_2px_0_#000] transition-all" title="Delete">
                                                                <Trash2 size={13} />
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}

            {/* Modal */}
            {(showModal || editingQuestion) && (
                <QuestionFormModal
                    initialData={editingQuestion}
                    preSelectedTopic={activeTopic}
                    onClose={handleCloseModal}
                    onSuccess={handleSuccess}
                />
            )}
        </div>
    );
}
