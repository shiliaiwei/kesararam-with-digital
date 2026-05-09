"use client";

import { useState, useEffect } from "react";
import {
    Plus, Search, RefreshCw, Edit, Trash2, HelpCircle,
    CheckSquare, CheckCheck, Type, Puzzle, Images, MapPin,
    CircleDot, Layers, ChevronDown, ChevronRight,
    User, Users, ArrowUpDown, X
} from "lucide-react";
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
    tags?: string[];
    gameMode?: string;
    isLive?: boolean;
}

interface Category {
    id: number;
    slug: string;
    titleEn: string;
}

const QUESTION_TYPES = [
    { value: "all", label: "All", icon: Layers },
    { value: "mcq", label: "MCQ", icon: CircleDot },
    { value: "true-false", label: "T/F", icon: CheckCheck },
    { value: "type-answer", label: "Type", icon: Type },
    { value: "puzzle", label: "Puzzle", icon: Puzzle },
    { value: "image-match", label: "Image", icon: Images },
    { value: "pin-location", label: "Pin", icon: MapPin },
    { value: "multi-select", label: "Multi", icon: CheckSquare },
];

const DIFFICULTY_LEVELS = [
    { value: "all", label: "All", color: "#6b7280" },
    { value: "easy", label: "Easy", color: "#22c55e" },
    { value: "medium", label: "Med", color: "#f59e0b" },
    { value: "hard", label: "Hard", color: "#ef4444" },
];

const GAME_MODES = [
    { value: "all", label: "All Modes", icon: null },
    { value: "solo", label: "Solo", icon: User },
    { value: "live", label: "Live", icon: Users },
];

const SORT_OPTIONS = [
    { value: "newest", label: "Newest" },
    { value: "oldest", label: "Oldest" },
    { value: "difficulty-asc", label: "Easiest" },
    { value: "difficulty-desc", label: "Hardest" },
    { value: "topic-asc", label: "Topic A-Z" },
    { value: "category-asc", label: "Category A-Z" },
];

export function QuestionManagementPanel() {
    const { showToast } = useToast();
    const [questions, setQuestions] = useState<Question[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [topics, setTopics] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Filters
    const [search, setSearch] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("all");
    const [typeFilter, setTypeFilter] = useState("all");
    const [difficultyFilter, setDifficultyFilter] = useState("all");
    const [gameModeFilter, setGameModeFilter] = useState("all");
    const [sortBy, setSortBy] = useState("newest");

    // UI state
    const [expandedCategories, setExpandedCategories] = useState<Set<number>>(new Set());
    const [selectedTopic, setSelectedTopic] = useState<any | null>(null);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
    const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

    useEffect(() => {
        fetchCategories();
        fetchTopics();
        fetchQuestions();
    }, []);

    const fetchCategories = async () => {
        try {
            const res = await fetch("/api/categories");
            const data = await res.json();
            const cats = Array.isArray(data.categories) ? data.categories : [];
            setCategories(cats);
            // Expand all by default
            setExpandedCategories(new Set(cats.map((c: Category) => c.id)));
        } catch (e) { console.error(e); }
    };

    const fetchTopics = async () => {
        try {
            const res = await fetch("/api/admin/topics?status=approved");
            const data = await res.json();
            setTopics(Array.isArray(data.topics) ? data.topics : []);
        } catch (e) { console.error(e); }
    };

    const fetchQuestions = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (categoryFilter !== "all") params.append("categoryId", categoryFilter);
            if (typeFilter !== "all") params.append("type", typeFilter);
            if (difficultyFilter !== "all") params.append("difficulty", difficultyFilter);
            if (search) params.append("search", search);
            const res = await fetch(`/api/admin/questions?${params}`);
            const data = await res.json();
            setQuestions(Array.isArray(data.questions) ? data.questions : []);
        } catch {
            showToast("Failed to load questions", "error");
            setQuestions([]);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: number) => {
        try {
            const res = await fetch(`/api/admin/questions/${id}`, { method: "DELETE" });
            if (res.ok) {
                showToast("Question deleted", "success");
                setDeleteConfirm(null);
                fetchQuestions();
            } else {
                const data = await res.json();
                showToast(data.error || "Failed to delete", "error");
            }
        } catch {
            showToast("Failed to delete question", "error");
        }
    };

    const handleCloseModal = () => {
        setShowCreateModal(false);
        setEditingQuestion(null);
        setSelectedTopic(null);
    };

    const toggleCategory = (id: number) => {
        setExpandedCategories(prev => {
            const next = new Set(prev);
            next.has(id) ? next.delete(id) : next.add(id);
            return next;
        });
    };

    const safeQuestions = Array.isArray(questions) ? questions : [];

    const filteredQuestions = safeQuestions.filter((q) => {
        if (categoryFilter !== "all" && q.categoryId !== Number(categoryFilter)) return false;
        if (typeFilter !== "all" && q.questionType !== typeFilter) return false;
        if (difficultyFilter !== "all" && q.difficulty !== difficultyFilter) return false;
        if (gameModeFilter === "solo" && q.isLive) return false;
        if (gameModeFilter === "live" && !q.isLive) return false;
        if (selectedTopic && q.topicId !== selectedTopic.id) return false;
        if (search) {
            const s = search.toLowerCase();
            return (
                q.questionEn?.toLowerCase().includes(s) ||
                q.topicName?.toLowerCase().includes(s) ||
                q.categoryName?.toLowerCase().includes(s)
            );
        }
        return true;
    });

    const sortedQuestions = [...filteredQuestions].sort((a, b) => {
        const diffOrder = { easy: 1, medium: 2, hard: 3 };
        switch (sortBy) {
            case "newest": return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
            case "oldest": return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
            case "difficulty-asc": return (diffOrder[a.difficulty as keyof typeof diffOrder] || 2) - (diffOrder[b.difficulty as keyof typeof diffOrder] || 2);
            case "difficulty-desc": return (diffOrder[b.difficulty as keyof typeof diffOrder] || 2) - (diffOrder[a.difficulty as keyof typeof diffOrder] || 2);
            case "topic-asc": return (a.topicName || "").localeCompare(b.topicName || "");
            case "category-asc": return (a.categoryName || "").localeCompare(b.categoryName || "");
            default: return 0;
        }
    });

    const getTopicQuestionCount = (topicId: number) =>
        safeQuestions.filter(q => q.topicId === topicId).length;

    return (
        <div className="flex flex-col h-full gap-0">
            {/* Top Bar */}
            <div className="bg-white border-4 border-black p-4 shadow-[4px_4px_0_#000] mb-4">
                <div className="flex items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-black text-black">Topic Questions</h1>
                        <p className="text-xs text-zinc-500 font-bold">Manage questions linked to topics</p>
                    </div>

                    {/* Compact Filters Row */}
                    <div className="flex items-center gap-2 flex-1 max-w-3xl">
                        {/* Search */}
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={15} />
                            <input
                                type="text"
                                placeholder="Search questions..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full pl-9 pr-3 py-2 border-2 border-black text-xs font-medium focus:outline-none focus:shadow-[2px_2px_0_#000]"
                            />
                        </div>

                        {/* Type */}
                        <select
                            value={typeFilter}
                            onChange={(e) => setTypeFilter(e.target.value)}
                            className="px-2 py-2 border-2 border-black text-xs font-bold focus:outline-none bg-white"
                        >
                            {QUESTION_TYPES.map(t => (
                                <option key={t.value} value={t.value}>{t.label}</option>
                            ))}
                        </select>

                        {/* Difficulty */}
                        <select
                            value={difficultyFilter}
                            onChange={(e) => setDifficultyFilter(e.target.value)}
                            className="px-2 py-2 border-2 border-black text-xs font-bold focus:outline-none bg-white"
                        >
                            {DIFFICULTY_LEVELS.map(d => (
                                <option key={d.value} value={d.value}>{d.label}</option>
                            ))}
                        </select>

                        {/* Game Mode */}
                        <select
                            value={gameModeFilter}
                            onChange={(e) => setGameModeFilter(e.target.value)}
                            className="px-2 py-2 border-2 border-black text-xs font-bold focus:outline-none bg-white"
                        >
                            {GAME_MODES.map(m => (
                                <option key={m.value} value={m.value}>{m.label}</option>
                            ))}
                        </select>

                        {/* Sort */}
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="px-2 py-2 border-2 border-black text-xs font-bold focus:outline-none bg-white"
                        >
                            {SORT_OPTIONS.map(s => (
                                <option key={s.value} value={s.value}>{s.label}</option>
                            ))}
                        </select>

                        <button
                            onClick={fetchQuestions}
                            className="p-2 border-2 border-black bg-white hover:bg-gray-100 hover:shadow-[2px_2px_0_#000] transition-all"
                            title="Refresh"
                        >
                            <RefreshCw size={15} />
                        </button>
                    </div>

                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="bg-green-400 border-2 border-black px-4 py-2 font-black text-sm hover:shadow-[4px_4px_0_#000] transition-all inline-flex items-center gap-2 whitespace-nowrap"
                    >
                        <Plus size={18} />
                        Add Question
                    </button>
                </div>

                {/* Active filters summary */}
                {(selectedTopic || categoryFilter !== "all" || typeFilter !== "all" || difficultyFilter !== "all" || gameModeFilter !== "all" || search) && (
                    <div className="flex items-center gap-2 mt-3 pt-3 border-t-2 border-black flex-wrap">
                        <span className="text-xs font-black text-zinc-500 uppercase">Active:</span>
                        {selectedTopic && (
                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-400 border-2 border-black text-xs font-bold">
                                Topic: {selectedTopic.nameEn}
                                <button onClick={() => setSelectedTopic(null)}><X size={12} /></button>
                            </span>
                        )}
                        {categoryFilter !== "all" && (
                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-200 border-2 border-black text-xs font-bold">
                                {categories.find(c => String(c.id) === categoryFilter)?.titleEn}
                                <button onClick={() => setCategoryFilter("all")}><X size={12} /></button>
                            </span>
                        )}
                        {typeFilter !== "all" && (
                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-200 border-2 border-black text-xs font-bold">
                                {QUESTION_TYPES.find(t => t.value === typeFilter)?.label}
                                <button onClick={() => setTypeFilter("all")}><X size={12} /></button>
                            </span>
                        )}
                        {difficultyFilter !== "all" && (
                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-orange-200 border-2 border-black text-xs font-bold">
                                {DIFFICULTY_LEVELS.find(d => d.value === difficultyFilter)?.label}
                                <button onClick={() => setDifficultyFilter("all")}><X size={12} /></button>
                            </span>
                        )}
                        {gameModeFilter !== "all" && (
                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-200 border-2 border-black text-xs font-bold">
                                {GAME_MODES.find(m => m.value === gameModeFilter)?.label}
                                <button onClick={() => setGameModeFilter("all")}><X size={12} /></button>
                            </span>
                        )}
                        <button
                            onClick={() => { setSelectedTopic(null); setCategoryFilter("all"); setTypeFilter("all"); setDifficultyFilter("all"); setGameModeFilter("all"); setSearch(""); }}
                            className="text-xs font-black text-red-600 underline ml-auto"
                        >
                            Clear all
                        </button>
                    </div>
                )}
            </div>

            {/* Main Layout: Sidebar + Content */}
            <div className="flex gap-4 min-h-0">
                {/* Left Sidebar: Category + Topic Tree */}
                <div className="w-64 flex-shrink-0 bg-white border-4 border-black shadow-[4px_4px_0_#000] overflow-y-auto" style={{ maxHeight: "calc(100vh - 220px)" }}>
                    <div className="p-3 border-b-2 border-black bg-black">
                        <h2 className="text-xs font-black text-white uppercase tracking-wider">Categories & Topics</h2>
                    </div>

                    {/* All */}
                    <button
                        onClick={() => { setCategoryFilter("all"); setSelectedTopic(null); }}
                        className={`w-full text-left px-3 py-2 text-xs font-black border-b border-zinc-200 transition-all ${categoryFilter === "all" && !selectedTopic ? "bg-yellow-400" : "hover:bg-yellow-50"}`}
                    >
                        All Categories
                    </button>

                    {categories.map((category) => {
                        const catTopics = topics.filter(t => t.categoryId === category.id);
                        const isExpanded = expandedCategories.has(category.id);
                        const isCatActive = categoryFilter === String(category.id);
                        const catQCount = safeQuestions.filter(q => q.categoryId === category.id).length;

                        return (
                            <div key={category.id} className="border-b border-zinc-200">
                                {/* Category Row */}
                                <div className={`flex items-center gap-1 transition-all ${isCatActive && !selectedTopic ? "bg-yellow-400" : "hover:bg-yellow-50"}`}>
                                    <button
                                        onClick={() => toggleCategory(category.id)}
                                        className="p-2 flex-shrink-0"
                                    >
                                        {isExpanded
                                            ? <ChevronDown size={14} className="text-zinc-600" />
                                            : <ChevronRight size={14} className="text-zinc-600" />
                                        }
                                    </button>
                                    <button
                                        onClick={() => { setCategoryFilter(String(category.id)); setSelectedTopic(null); }}
                                        className="flex-1 text-left py-2 pr-2"
                                    >
                                        <div className="text-xs font-black text-black">{category.titleEn}</div>
                                        <div className="text-xs text-zinc-500">{catTopics.length} topics · {catQCount} Q</div>
                                    </button>
                                </div>

                                {/* Topics under category */}
                                {isExpanded && catTopics.map((topic) => {
                                    const qCount = getTopicQuestionCount(topic.id);
                                    const isTopicActive = selectedTopic?.id === topic.id;
                                    return (
                                        <div
                                            key={topic.id}
                                            className={`flex items-center justify-between pl-7 pr-2 py-1.5 border-t border-zinc-100 cursor-pointer transition-all group ${isTopicActive ? "bg-yellow-300" : "hover:bg-yellow-50"}`}
                                        >
                                            <button
                                                onClick={() => { setSelectedTopic(topic); setCategoryFilter(String(category.id)); }}
                                                className="flex-1 text-left"
                                            >
                                                <div className="text-xs font-bold text-black line-clamp-1">{topic.nameEn}</div>
                                                <div className="text-xs text-zinc-400">{topic.topicCode}</div>
                                            </button>
                                            <div className="flex items-center gap-1 flex-shrink-0">
                                                <span className={`text-xs font-black px-1.5 py-0.5 border border-black ${qCount > 0 ? "bg-blue-100 text-blue-800" : "bg-zinc-100 text-zinc-500"}`}>
                                                    {qCount}
                                                </span>
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); setSelectedTopic(topic); setShowCreateModal(true); }}
                                                    className="opacity-0 group-hover:opacity-100 p-1 bg-green-400 border border-black hover:shadow-[1px_1px_0_#000] transition-all"
                                                    title="Add question to this topic"
                                                >
                                                    <Plus size={11} />
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        );
                    })}
                </div>

                {/* Right: Stats + Table */}
                <div className="flex-1 flex flex-col gap-4 min-w-0">
                    {/* Stats Row */}
                    <div className="grid grid-cols-4 gap-3">
                        {[
                            { label: "Total", value: sortedQuestions.length, color: "text-black" },
                            { label: "Easy", value: sortedQuestions.filter(q => q.difficulty === "easy").length, color: "text-green-600" },
                            { label: "Medium", value: sortedQuestions.filter(q => q.difficulty === "medium").length, color: "text-yellow-600" },
                            { label: "Hard", value: sortedQuestions.filter(q => q.difficulty === "hard").length, color: "text-red-600" },
                        ].map(stat => (
                            <div key={stat.label} className="bg-white border-2 border-black p-3 shadow-[2px_2px_0_#000]">
                                <div className={`text-2xl font-black ${stat.color}`}>{stat.value}</div>
                                <div className="text-xs font-bold text-zinc-500 uppercase">{stat.label}</div>
                            </div>
                        ))}
                    </div>

                    {/* Context bar when topic selected */}
                    {selectedTopic && (
                        <div className="bg-yellow-400 border-2 border-black p-3 flex items-center justify-between shadow-[2px_2px_0_#000]">
                            <div>
                                <span className="text-xs font-black uppercase text-zinc-700">Viewing topic: </span>
                                <span className="text-sm font-black">{selectedTopic.nameEn}</span>
                                <span className="ml-2 text-xs text-zinc-600">({selectedTopic.topicCode})</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => { setShowCreateModal(true); }}
                                    className="bg-green-400 border-2 border-black px-3 py-1.5 text-xs font-black hover:shadow-[2px_2px_0_#000] transition-all inline-flex items-center gap-1"
                                >
                                    <Plus size={14} />
                                    Add Question Here
                                </button>
                                <button onClick={() => setSelectedTopic(null)} className="p-1.5 border-2 border-black bg-white hover:bg-gray-100">
                                    <X size={14} />
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Questions Table */}
                    <div className="bg-white border-2 border-black overflow-hidden shadow-[4px_4px_0_#000] flex-1">
                        {loading ? (
                            <div className="p-12 text-center">
                                <div className="inline-block w-10 h-10 border-4 border-black border-t-transparent rounded-full animate-spin" />
                                <p className="mt-3 font-bold text-zinc-500 text-sm">Loading questions...</p>
                            </div>
                        ) : sortedQuestions.length === 0 ? (
                            <div className="p-12 text-center">
                                <HelpCircle size={40} className="mx-auto mb-3 text-zinc-300" />
                                <p className="font-black text-zinc-500 mb-1">No questions found</p>
                                <p className="text-xs text-zinc-400 mb-4">
                                    {selectedTopic ? `No questions for "${selectedTopic.nameEn}" yet` : "Try adjusting your filters"}
                                </p>
                                <button
                                    onClick={() => setShowCreateModal(true)}
                                    className="bg-green-400 border-2 border-black px-4 py-2 font-black text-sm hover:shadow-[3px_3px_0_#000] transition-all inline-flex items-center gap-2"
                                >
                                    <Plus size={15} />
                                    {selectedTopic ? `Add Question to ${selectedTopic.nameEn}` : "Create First Question"}
                                </button>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-yellow-400 border-b-2 border-black">
                                        <tr>
                                            <th className="px-3 py-2.5 text-left text-xs font-black uppercase border-r-2 border-black w-40">Category / Topic</th>
                                            <th className="px-3 py-2.5 text-left text-xs font-black uppercase border-r-2 border-black">Question</th>
                                            <th className="px-3 py-2.5 text-left text-xs font-black uppercase border-r-2 border-black w-24">Type</th>
                                            <th className="px-3 py-2.5 text-left text-xs font-black uppercase border-r-2 border-black w-20">Level</th>
                                            <th className="px-3 py-2.5 text-left text-xs font-black uppercase w-20">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-zinc-200">
                                        {sortedQuestions.map((question) => {
                                            const typeInfo = QUESTION_TYPES.find(t => t.value === question.questionType);
                                            const diffInfo = DIFFICULTY_LEVELS.find(d => d.value === question.difficulty);
                                            const TypeIcon = typeInfo?.icon;

                                            return (
                                                <tr key={question.id} className="hover:bg-yellow-50 transition-colors">
                                                    <td className="px-3 py-2.5 border-r-2 border-black">
                                                        <div className="text-xs font-black text-black line-clamp-1">{question.topicName}</div>
                                                        <div className="text-xs text-zinc-400 font-medium">{question.categoryName}</div>
                                                    </td>
                                                    <td className="px-3 py-2.5 border-r-2 border-black">
                                                        <div className="text-sm font-bold text-black line-clamp-2">{question.questionEn}</div>
                                                        {question.questionKm && (
                                                            <div className="text-xs text-zinc-400 line-clamp-1 mt-0.5">{question.questionKm}</div>
                                                        )}
                                                    </td>
                                                    <td className="px-3 py-2.5 border-r-2 border-black">
                                                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 border border-blue-200 text-xs font-bold text-blue-700">
                                                            {TypeIcon && <TypeIcon size={12} />}
                                                            {typeInfo?.label || question.questionType}
                                                        </span>
                                                    </td>
                                                    <td className="px-3 py-2.5 border-r-2 border-black">
                                                        <span
                                                            className="inline-block px-2 py-1 border border-black text-xs font-black"
                                                            style={{ backgroundColor: diffInfo?.color || "#6b7280", color: "#fff" }}
                                                        >
                                                            {question.difficulty.toUpperCase()}
                                                        </span>
                                                    </td>
                                                    <td className="px-3 py-2.5">
                                                        <div className="flex items-center gap-1">
                                                            <button
                                                                onClick={() => setEditingQuestion(question)}
                                                                className="p-1.5 border-2 border-black bg-yellow-100 hover:bg-yellow-200 hover:shadow-[2px_2px_0_#000] transition-all"
                                                                title="Edit"
                                                            >
                                                                <Edit size={13} />
                                                            </button>
                                                            {deleteConfirm === question.id ? (
                                                                <div className="flex gap-1">
                                                                    <button onClick={() => handleDelete(question.id)} className="px-2 py-1 text-xs font-black bg-red-500 text-white border border-black">Yes</button>
                                                                    <button onClick={() => setDeleteConfirm(null)} className="px-2 py-1 text-xs font-black bg-white border border-black">No</button>
                                                                </div>
                                                            ) : (
                                                                <button
                                                                    onClick={() => setDeleteConfirm(question.id)}
                                                                    className="p-1.5 border-2 border-black bg-red-100 hover:bg-red-200 hover:shadow-[2px_2px_0_#000] transition-all"
                                                                    title="Delete"
                                                                >
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
                </div>
            </div>

            {/* Modal */}
            {(showCreateModal || editingQuestion) && (
                <QuestionFormModal
                    initialData={editingQuestion}
                    preSelectedTopic={selectedTopic}
                    onClose={handleCloseModal}
                    onSuccess={() => { handleCloseModal(); fetchQuestions(); }}
                />
            )}
        </div>
    );
}
