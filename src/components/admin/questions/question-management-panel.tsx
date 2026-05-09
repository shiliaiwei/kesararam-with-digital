"use client";

import { useState, useEffect } from "react";
import {
    Plus,
    Search,
    Filter,
    RefreshCw,
    Edit,
    Trash2,
    Eye,
    HelpCircle,
    ListChecks,
    CheckSquare,
    Keyboard,
    Puzzle,
    Images,
    MapPin,
    CheckCheck,
    Layers,
    CircleDot,
    Type,
    Grid3x3,
    FolderTree,
    Tag,
    ArrowUpDown,
    Users,
    User
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

const GAME_MODE_TAGS = [
    { value: "all", label: "All Modes" },
    { value: "solo", label: "Solo Practice" },
    { value: "live", label: "Live Challenge" },
    { value: "quick-quiz", label: "Quick Quiz" },
    { value: "exam-prep", label: "Exam Prep" },
    { value: "daily-challenge", label: "Daily Challenge" },
    { value: "timed", label: "Timed Mode" },
    { value: "untimed", label: "Practice Mode" },
];

const SORT_OPTIONS = [
    { value: "newest", label: "Newest First" },
    { value: "oldest", label: "Oldest First" },
    { value: "difficulty-asc", label: "Easiest First" },
    { value: "difficulty-desc", label: "Hardest First" },
    { value: "topic-asc", label: "Topic A-Z" },
    { value: "topic-desc", label: "Topic Z-A" },
    { value: "category-asc", label: "Category A-Z" },
];

const QUESTION_TYPES = [
    { value: "all", label: "All Types", icon: Layers, color: "bg-gray-50 border-gray-300 text-gray-700 hover:bg-gray-100" },
    { value: "mcq", label: "Multiple Choice", icon: CircleDot, color: "bg-blue-50 border-blue-300 text-blue-700 hover:bg-blue-100" },
    { value: "true-false", label: "True / False", icon: CheckCheck, color: "bg-purple-50 border-purple-300 text-purple-700 hover:bg-purple-100" },
    { value: "type-answer", label: "Type Answer", icon: Type, color: "bg-green-50 border-green-300 text-green-700 hover:bg-green-100" },
    { value: "puzzle", label: "Puzzle", icon: Puzzle, color: "bg-orange-50 border-orange-300 text-orange-700 hover:bg-orange-100" },
    { value: "image-match", label: "Image Match", icon: Images, color: "bg-pink-50 border-pink-300 text-pink-700 hover:bg-pink-100" },
    { value: "pin-location", label: "Pin Location", icon: MapPin, color: "bg-red-50 border-red-300 text-red-700 hover:bg-red-100" },
    { value: "multi-select", label: "Multi-Select", icon: CheckSquare, color: "bg-teal-50 border-teal-300 text-teal-700 hover:bg-teal-100" },
];

const DIFFICULTY_LEVELS = [
    { value: "all", label: "All Levels", color: "#6b7280" },
    { value: "easy", label: "Easy", color: "#22c55e" },
    { value: "medium", label: "Medium", color: "#f59e0b" },
    { value: "hard", label: "Hard", color: "#ef4444" },
];

export function QuestionManagementPanel() {
    const { showToast } = useToast();
    const [questions, setQuestions] = useState<Question[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("all");
    const [tagFilter, setTagFilter] = useState("all");
    const [typeFilter, setTypeFilter] = useState("all");
    const [difficultyFilter, setDifficultyFilter] = useState("all");
    const [sortBy, setSortBy] = useState("newest");
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
    const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

    useEffect(() => {
        fetchCategories();
        fetchQuestions();
    }, []);

    const fetchCategories = async () => {
        try {
            const res = await fetch("/api/categories");
            const data = await res.json();
            setCategories(Array.isArray(data.categories) ? data.categories : []);
        } catch (error) {
            console.error("Failed to fetch categories:", error);
        }
    };

    const fetchQuestions = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (categoryFilter !== "all") params.append("categoryId", categoryFilter);
            if (tagFilter !== "all") params.append("tag", tagFilter);
            if (typeFilter !== "all") params.append("type", typeFilter);
            if (difficultyFilter !== "all") params.append("difficulty", difficultyFilter);
            if (sortBy) params.append("sort", sortBy);
            if (search) params.append("search", search);

            const res = await fetch(`/api/admin/questions?${params}`);
            const data = await res.json();

            // Ensure questions is always an array
            setQuestions(Array.isArray(data.questions) ? data.questions : []);
        } catch (error) {
            console.error("Failed to fetch questions:", error);
            showToast("Failed to load questions", "error");
            setQuestions([]); // Set empty array on error
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

    // Ensure questions is always an array before filtering
    const safeQuestions = Array.isArray(questions) ? questions : [];

    const filteredQuestions = safeQuestions.filter((q) => {
        if (categoryFilter !== "all" && q.categoryId !== Number(categoryFilter)) return false;
        if (typeFilter !== "all" && q.questionType !== typeFilter) return false;
        if (difficultyFilter !== "all" && q.difficulty !== difficultyFilter) return false;

        // Tag filtering for game modes
        if (tagFilter !== "all") {
            if (tagFilter === "solo" && q.isLive) return false;
            if (tagFilter === "live" && !q.isLive) return false;
            if (tagFilter !== "solo" && tagFilter !== "live" && q.gameMode !== tagFilter) return false;
        }

        if (search) {
            const query = search.toLowerCase();
            return (
                q.questionEn?.toLowerCase().includes(query) ||
                q.questionKm?.toLowerCase().includes(query) ||
                q.topicName?.toLowerCase().includes(query) ||
                q.categoryName?.toLowerCase().includes(query)
            );
        }
        return true;
    });

    // Apply sorting
    const sortedQuestions = [...filteredQuestions].sort((a, b) => {
        switch (sortBy) {
            case "newest":
                return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
            case "oldest":
                return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
            case "difficulty-asc":
                const diffOrder = { easy: 1, medium: 2, hard: 3 };
                return (diffOrder[a.difficulty as keyof typeof diffOrder] || 2) - (diffOrder[b.difficulty as keyof typeof diffOrder] || 2);
            case "difficulty-desc":
                const diffOrderDesc = { easy: 1, medium: 2, hard: 3 };
                return (diffOrderDesc[b.difficulty as keyof typeof diffOrderDesc] || 2) - (diffOrderDesc[a.difficulty as keyof typeof diffOrderDesc] || 2);
            case "topic-asc":
                return (a.topicName || "").localeCompare(b.topicName || "");
            case "topic-desc":
                return (b.topicName || "").localeCompare(a.topicName || "");
            case "category-asc":
                return (a.categoryName || "").localeCompare(b.categoryName || "");
            default:
                return 0;
        }
    });

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-white border-4 border-black p-6 shadow-[6px_6px_0_#000]">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h1 className="text-3xl font-black text-black mb-1">Topic Questions</h1>
                        <p className="text-sm text-zinc-600 font-bold">
                            Admin-only: manage questions linked to topics
                        </p>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={fetchQuestions}
                            className="p-3 border-2 border-black bg-white hover:bg-gray-100 hover:shadow-[2px_2px_0_#000] transition-all"
                            title="Refresh"
                        >
                            <RefreshCw size={18} />
                        </button>
                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="bg-green-400 border-2 border-black px-5 py-3 font-black hover:shadow-[4px_4px_0_#000] transition-all inline-flex items-center gap-2"
                        >
                            <Plus size={20} />
                            Add Question
                        </button>
                    </div>
                </div>

                {/* Filters */}
                <div className="space-y-4">
                    {/* Search */}
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search questions or topics..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 border-2 border-black text-sm font-medium focus:outline-none focus:shadow-[2px_2px_0_#000]"
                        />
                    </div>

                    {/* Category Filter */}
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <FolderTree size={16} className="text-zinc-600" />
                            <span className="text-xs font-black text-zinc-600 uppercase">Category</span>
                        </div>
                        <div className="flex items-center gap-2 flex-wrap">
                            <button
                                onClick={() => setCategoryFilter("all")}
                                className={`px-3 py-2 border-2 border-black text-xs font-bold transition-all ${categoryFilter === "all"
                                    ? "bg-yellow-400 shadow-[3px_3px_0_#000] scale-105"
                                    : "bg-white hover:bg-gray-50"
                                    }`}
                            >
                                All Categories
                            </button>
                            {categories.map((category) => {
                                const isActive = categoryFilter === String(category.id);
                                return (
                                    <button
                                        key={category.id}
                                        onClick={() => setCategoryFilter(String(category.id))}
                                        className={`px-3 py-2 border-2 border-black text-xs font-bold transition-all ${isActive
                                            ? "bg-yellow-400 shadow-[3px_3px_0_#000] scale-105"
                                            : "bg-white hover:bg-gray-50"
                                            }`}
                                    >
                                        {category.titleEn}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Type Filter */}
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <Filter size={16} className="text-zinc-600" />
                            <span className="text-xs font-black text-zinc-600 uppercase">Question Type</span>
                        </div>
                        <div className="flex items-center gap-2 flex-wrap">
                            {QUESTION_TYPES.map((type) => {
                                const IconComponent = type.icon;
                                const isActive = typeFilter === type.value;
                                return (
                                    <button
                                        key={type.value}
                                        onClick={() => setTypeFilter(type.value)}
                                        className={`px-3 py-2 border-2 border-black text-xs font-bold transition-all inline-flex items-center gap-2 ${isActive
                                            ? "bg-yellow-400 shadow-[3px_3px_0_#000] scale-105"
                                            : type.color
                                            }`}
                                    >
                                        <IconComponent size={16} strokeWidth={2.5} />
                                        {type.label}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Difficulty Filter */}
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <Grid3x3 size={16} className="text-zinc-600" />
                            <span className="text-xs font-black text-zinc-600 uppercase">Difficulty Level</span>
                        </div>
                        <div className="flex items-center gap-2 flex-wrap">
                            {DIFFICULTY_LEVELS.map((level) => {
                                const isActive = difficultyFilter === level.value;
                                return (
                                    <button
                                        key={level.value}
                                        onClick={() => setDifficultyFilter(level.value)}
                                        className={`px-4 py-2 border-2 border-black text-xs font-black transition-all uppercase ${isActive
                                            ? "shadow-[3px_3px_0_#000] scale-105"
                                            : "bg-white hover:shadow-[2px_2px_0_#000]"
                                            }`}
                                        style={{
                                            backgroundColor: isActive ? level.color : "#ffffff",
                                            color: isActive ? "#ffffff" : "#000000",
                                        }}
                                    >
                                        {level.label}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Game Mode Tag Filter */}
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <Tag size={16} className="text-zinc-600" />
                            <span className="text-xs font-black text-zinc-600 uppercase">Game Mode</span>
                        </div>
                        <div className="flex items-center gap-2 flex-wrap">
                            {GAME_MODE_TAGS.map((tag) => {
                                const isActive = tagFilter === tag.value;
                                const isSolo = tag.value === "solo";
                                const isLive = tag.value === "live";
                                return (
                                    <button
                                        key={tag.value}
                                        onClick={() => setTagFilter(tag.value)}
                                        className={`px-3 py-2 border-2 border-black text-xs font-bold transition-all inline-flex items-center gap-2 ${isActive
                                            ? "bg-yellow-400 shadow-[3px_3px_0_#000] scale-105"
                                            : "bg-white hover:bg-gray-50"
                                            }`}
                                    >
                                        {isSolo && <User size={14} />}
                                        {isLive && <Users size={14} />}
                                        {tag.label}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Sort Options */}
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <ArrowUpDown size={16} className="text-zinc-600" />
                            <span className="text-xs font-black text-zinc-600 uppercase">Sort By</span>
                        </div>
                        <div className="flex items-center gap-2 flex-wrap">
                            {SORT_OPTIONS.map((option) => {
                                const isActive = sortBy === option.value;
                                return (
                                    <button
                                        key={option.value}
                                        onClick={() => setSortBy(option.value)}
                                        className={`px-3 py-2 border-2 border-black text-xs font-bold transition-all ${isActive
                                            ? "bg-indigo-400 text-white shadow-[3px_3px_0_#000] scale-105"
                                            : "bg-white hover:bg-indigo-50"
                                            }`}
                                    >
                                        {option.label}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-4 gap-4">
                <div className="bg-white border-2 border-black p-4 shadow-[3px_3px_0_#000]">
                    <div className="text-3xl font-black text-black">{safeQuestions.length}</div>
                    <div className="text-xs font-bold text-zinc-500 uppercase">Total Questions</div>
                </div>
                <div className="bg-white border-2 border-black p-4 shadow-[3px_3px_0_#000]">
                    <div className="text-3xl font-black text-green-600">
                        {safeQuestions.filter((q) => q.difficulty === "easy").length}
                    </div>
                    <div className="text-xs font-bold text-zinc-500 uppercase">Easy</div>
                </div>
                <div className="bg-white border-2 border-black p-4 shadow-[3px_3px_0_#000]">
                    <div className="text-3xl font-black text-yellow-600">
                        {safeQuestions.filter((q) => q.difficulty === "medium").length}
                    </div>
                    <div className="text-xs font-bold text-zinc-500 uppercase">Medium</div>
                </div>
                <div className="bg-white border-2 border-black p-4 shadow-[3px_3px_0_#000]">
                    <div className="text-3xl font-black text-red-600">
                        {safeQuestions.filter((q) => q.difficulty === "hard").length}
                    </div>
                    <div className="text-xs font-bold text-zinc-500 uppercase">Hard</div>
                </div>
            </div>

            {/* Questions Table */}
            <div className="bg-white border-2 border-black overflow-hidden shadow-[4px_4px_0_#000]">
                {loading ? (
                    <div className="p-12 text-center">
                        <div className="inline-block w-12 h-12 border-4 border-black border-t-transparent rounded-full animate-spin" />
                        <p className="mt-4 font-bold text-zinc-500">Loading questions...</p>
                    </div>
                ) : sortedQuestions.length === 0 ? (
                    <div className="p-12 text-center">
                        <HelpCircle size={48} className="mx-auto mb-4 text-zinc-300" />
                        <p className="font-black text-zinc-500 mb-2">No questions found</p>
                        <p className="text-sm text-zinc-400 mb-4">
                            {search || typeFilter !== "all" || difficultyFilter !== "all"
                                ? "Try adjusting your filters"
                                : "Create your first question to get started"}
                        </p>
                        {!search && typeFilter === "all" && difficultyFilter === "all" && (
                            <button
                                onClick={() => setShowCreateModal(true)}
                                className="bg-green-400 border-2 border-black px-5 py-2.5 font-black hover:shadow-[3px_3px_0_#000] transition-all inline-flex items-center gap-2"
                            >
                                <Plus size={16} />
                                Create First Question
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-yellow-400 border-b-2 border-black">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-black uppercase border-r-2 border-black">
                                        Topic
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-black uppercase border-r-2 border-black">
                                        Question
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-black uppercase border-r-2 border-black">
                                        Type
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-black uppercase border-r-2 border-black">
                                        Difficulty
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-black uppercase border-r-2 border-black">
                                        Answers
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-black uppercase">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y-2 divide-black">
                                {sortedQuestions.map((question) => {
                                    const typeInfo = QUESTION_TYPES.find((t) => t.value === question.questionType);
                                    const diffInfo = DIFFICULTY_LEVELS.find((d) => d.value === question.difficulty);

                                    return (
                                        <tr key={question.id} className="hover:bg-yellow-50 transition-colors">
                                            <td className="px-4 py-3 border-r-2 border-black">
                                                <div className="text-sm font-bold text-black">{question.topicName}</div>
                                                <div className="text-xs text-zinc-500">{question.categoryName}</div>
                                            </td>
                                            <td className="px-4 py-3 border-r-2 border-black">
                                                <div className="text-sm font-bold text-black line-clamp-2">
                                                    {question.questionEn}
                                                </div>
                                                {question.questionKm && (
                                                    <div className="text-xs text-zinc-500 line-clamp-1">
                                                        {question.questionKm}
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-4 py-3 border-r-2 border-black">
                                                <span className="inline-flex items-center gap-1.5 px-2 py-1 bg-blue-100 border border-blue-300 text-xs font-bold text-blue-800">
                                                    {typeInfo?.icon && <typeInfo.icon size={14} />}
                                                    {typeInfo?.label || question.questionType}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 border-r-2 border-black">
                                                <span
                                                    className="inline-block px-2 py-1 border-2 border-black text-xs font-black"
                                                    style={{
                                                        backgroundColor: diffInfo?.color || "#6b7280",
                                                        color: "#ffffff",
                                                    }}
                                                >
                                                    {question.difficulty.toUpperCase()}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 border-r-2 border-black">
                                                <span className="text-sm font-bold text-black">
                                                    {question.answerCount} answers
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() => setEditingQuestion(question)}
                                                        className="p-2 border-2 border-black bg-yellow-100 hover:bg-yellow-200 hover:shadow-[2px_2px_0_#000] transition-all"
                                                        title="Edit"
                                                    >
                                                        <Edit size={14} />
                                                    </button>
                                                    {deleteConfirm === question.id ? (
                                                        <div className="flex gap-1">
                                                            <button
                                                                onClick={() => handleDelete(question.id)}
                                                                className="px-2 py-1 text-xs font-black bg-red-500 text-white border-2 border-black"
                                                            >
                                                                Confirm
                                                            </button>
                                                            <button
                                                                onClick={() => setDeleteConfirm(null)}
                                                                className="px-2 py-1 text-xs font-black bg-white border-2 border-black"
                                                            >
                                                                Cancel
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <button
                                                            onClick={() => setDeleteConfirm(question.id)}
                                                            className="p-2 border-2 border-black bg-red-100 hover:bg-red-200 hover:shadow-[2px_2px_0_#000] transition-all"
                                                            title="Delete"
                                                        >
                                                            <Trash2 size={14} />
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

            {/* Modals */}
            {(showCreateModal || editingQuestion) && (
                <QuestionFormModal
                    initialData={editingQuestion}
                    onClose={() => {
                        setShowCreateModal(false);
                        setEditingQuestion(null);
                    }}
                    onSuccess={() => {
                        setShowCreateModal(false);
                        setEditingQuestion(null);
                        fetchQuestions();
                    }}
                />
            )}
        </div>
    );
}
