"use client";

import { useState, useEffect } from "react";
import {
    X,
    Plus,
    Trash2,
    Image as ImageIcon,
    Volume2,
    Lightbulb,
    AlertCircle,
    CheckCircle,
    GripVertical,
    Upload
} from "lucide-react";
import { useToast } from "@/components/ui/toast-container";

interface QuestionFormModalProps {
    initialData?: any;
    preSelectedTopic?: any;
    onClose: () => void;
    onSuccess: () => void;
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
}

interface Answer {
    id?: string;
    answerEn: string;
    answerKm: string;
    isCorrect: boolean;
    imageUrl?: string;
    explanation?: string;
}

const QUESTION_TYPES = [
    {
        value: "mcq",
        label: "Multiple Choice",
        description: "Single correct answer from 2-5 options",
        minAnswers: 2,
        maxAnswers: 5,
        correctAnswers: 1
    },
    {
        value: "true-false",
        label: "True / False",
        description: "Simple binary choice question",
        minAnswers: 2,
        maxAnswers: 2,
        correctAnswers: 1
    },
    {
        value: "multi-select",
        label: "Multi-Select",
        description: "Multiple correct answers possible",
        minAnswers: 3,
        maxAnswers: 5,
        correctAnswers: 2
    },
    {
        value: "image-match",
        label: "Image Matching",
        description: "Match images with correct answers",
        minAnswers: 2,
        maxAnswers: 4,
        correctAnswers: 1
    },
];

const DIFFICULTY_LEVELS = [
    { value: "easy", label: "Easy", color: "#22c55e", description: "Basic recall and recognition" },
    { value: "medium", label: "Medium", color: "#f59e0b", description: "Application and understanding" },
    { value: "hard", label: "Hard", color: "#ef4444", description: "Analysis and critical thinking" },
];

export function QuestionFormModal({ initialData, preSelectedTopic, onClose, onSuccess }: QuestionFormModalProps) {
    const { showToast } = useToast();
    const [loading, setLoading] = useState(false);
    const [categories, setCategories] = useState<Category[]>([]);
    const [topics, setTopics] = useState<Topic[]>([]);
    const [filteredTopics, setFilteredTopics] = useState<Topic[]>([]);

    // Form state
    const [selectedCategory, setSelectedCategory] = useState<number | null>(preSelectedTopic?.categoryId || null);
    const [selectedTopic, setSelectedTopic] = useState<number | null>(preSelectedTopic?.id || null);
    const [questionType, setQuestionType] = useState("mcq");
    const [difficulty, setDifficulty] = useState("medium");
    const [questionEn, setQuestionEn] = useState("");
    const [questionKm, setQuestionKm] = useState("");
    const [hintEn, setHintEn] = useState("");
    const [hintKm, setHintKm] = useState("");
    const [imageUrl, setImageUrl] = useState("");
    const [answers, setAnswers] = useState<Answer[]>([
        { id: "1", answerEn: "", answerKm: "", isCorrect: false },
        { id: "2", answerEn: "", answerKm: "", isCorrect: false },
    ]);

    const isTopicPreSelected = !!preSelectedTopic;

    useEffect(() => {
        fetchCategories();
        fetchTopics();
    }, []);

    useEffect(() => {
        if (selectedCategory) {
            const filtered = topics.filter(t => t.categoryId === selectedCategory);
            setFilteredTopics(filtered);
        } else {
            setFilteredTopics([]);
        }
    }, [selectedCategory, topics]);

    const fetchCategories = async () => {
        try {
            const res = await fetch("/api/categories");
            const data = await res.json();
            setCategories(data.categories || []);
        } catch (error) {
            console.error("Failed to fetch categories:", error);
        }
    };

    const fetchTopics = async () => {
        try {
            const res = await fetch("/api/admin/topics?status=approved");
            const data = await res.json();
            setTopics(data.topics || []);
        } catch (error) {
            console.error("Failed to fetch topics:", error);
        }
    };

    const selectedQuestionType = QUESTION_TYPES.find(t => t.value === questionType);

    const addAnswer = () => {
        if (answers.length < (selectedQuestionType?.maxAnswers || 5)) {
            setAnswers([
                ...answers,
                { id: Date.now().toString(), answerEn: "", answerKm: "", isCorrect: false }
            ]);
        }
    };

    const removeAnswer = (id: string) => {
        if (answers.length > (selectedQuestionType?.minAnswers || 2)) {
            setAnswers(answers.filter(a => a.id !== id));
        }
    };

    const updateAnswer = (id: string, field: keyof Answer, value: any) => {
        setAnswers(answers.map(a => a.id === id ? { ...a, [field]: value } : a));
    };

    const toggleCorrectAnswer = (id: string) => {
        if (questionType === "mcq" || questionType === "true-false" || questionType === "image-match") {
            // Single correct answer
            setAnswers(answers.map(a => ({ ...a, isCorrect: a.id === id })));
        } else {
            // Multiple correct answers
            setAnswers(answers.map(a => a.id === id ? { ...a, isCorrect: !a.isCorrect } : a));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validation
        if (!selectedTopic) {
            showToast("Please select a topic", "error");
            return;
        }
        if (!questionEn.trim()) {
            showToast("Please enter question in English", "error");
            return;
        }
        if (answers.some(a => !a.answerEn.trim())) {
            showToast("All answers must have English text", "error");
            return;
        }
        if (!answers.some(a => a.isCorrect)) {
            showToast("Please mark at least one correct answer", "error");
            return;
        }

        setLoading(true);

        try {
            const payload = {
                topicId: selectedTopic,
                questionEn,
                questionKm,
                hintEn,
                hintKm,
                imageUrl,
                difficulty,
                answers: answers.map(a => ({
                    answerEn: a.answerEn,
                    answerKm: a.answerKm,
                    isCorrect: a.isCorrect,
                    imageUrl: a.imageUrl || null,
                })),
            };

            const url = initialData
                ? `/api/admin/questions/${initialData.id}`
                : "/api/admin/questions";

            const method = initialData ? "PUT" : "POST";

            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (res.ok) {
                showToast(
                    initialData ? "Question updated successfully!" : "Question created successfully!",
                    "success"
                );
                onSuccess();
            } else {
                const data = await res.json();
                showToast(data.error || "Failed to save question", "error");
            }
        } catch (error) {
            showToast("Failed to save question", "error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
            <div
                className="bg-white border-4 border-black max-w-5xl w-full max-h-[90vh] overflow-y-auto"
                style={{ boxShadow: "12px 12px 0 #000" }}
            >
                {/* Header */}
                <div className="bg-green-400 border-b-4 border-black p-6 flex items-center justify-between sticky top-0 z-10">
                    <div>
                        <h2 className="text-2xl font-black">
                            {initialData ? "Edit Question" : "Create New Question"}
                        </h2>
                        <p className="text-sm font-bold text-black/70 mt-1">
                            Build engaging questions with psychological learning principles
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 bg-white border-2 border-black hover:shadow-[2px_2px_0_#000] transition-all"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Step 1: Category & Topic Selection */}
                    <div className="bg-blue-50 border-2 border-black p-4">
                        <h3 className="text-lg font-black mb-3 flex items-center gap-2">
                            <span className="bg-blue-500 text-white w-7 h-7 rounded-full flex items-center justify-center text-sm">1</span>
                            Select Category & Topic
                        </h3>
                        {isTopicPreSelected && (
                            <div className="mb-3 p-3 bg-green-100 border-2 border-green-400">
                                <p className="text-sm font-bold text-green-800 flex items-center gap-2">
                                    <CheckCircle size={16} />
                                    Topic pre-selected: <span className="text-black">{preSelectedTopic.nameEn}</span>
                                </p>
                            </div>
                        )}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-bold mb-2">Category *</label>
                                <select
                                    value={selectedCategory || ""}
                                    onChange={(e) => {
                                        setSelectedCategory(Number(e.target.value));
                                        setSelectedTopic(null);
                                    }}
                                    className="w-full px-3 py-2 border-2 border-black font-medium focus:outline-none focus:shadow-[2px_2px_0_#000] disabled:bg-gray-100 disabled:cursor-not-allowed"
                                    required
                                    disabled={isTopicPreSelected}
                                >
                                    <option value="">Choose category...</option>
                                    {categories.map(cat => (
                                        <option key={cat.id} value={cat.id}>{cat.titleEn}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-bold mb-2">Topic *</label>
                                <select
                                    value={selectedTopic || ""}
                                    onChange={(e) => setSelectedTopic(Number(e.target.value))}
                                    className="w-full px-3 py-2 border-2 border-black font-medium focus:outline-none focus:shadow-[2px_2px_0_#000] disabled:bg-gray-100 disabled:cursor-not-allowed"
                                    disabled={!selectedCategory || isTopicPreSelected}
                                    required
                                >
                                    <option value="">Choose topic...</option>
                                    {filteredTopics.map(topic => (
                                        <option key={topic.id} value={topic.id}>
                                            {topic.nameEn} ({topic.topicCode})
                                        </option>
                                    ))}
                                </select>
                                {selectedCategory && filteredTopics.length === 0 && !isTopicPreSelected && (
                                    <p className="text-xs text-red-600 mt-1 font-bold">
                                        No approved topics in this category
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Step 2: Question Type & Difficulty */}
                    <div className="bg-purple-50 border-2 border-black p-4">
                        <h3 className="text-lg font-black mb-3 flex items-center gap-2">
                            <span className="bg-purple-500 text-white w-7 h-7 rounded-full flex items-center justify-center text-sm">2</span>
                            Question Type & Difficulty
                        </h3>
                        <div className="space-y-4">
                            {/* Question Type */}
                            <div>
                                <label className="block text-sm font-bold mb-2">Question Type *</label>
                                <div className="grid grid-cols-2 gap-3">
                                    {QUESTION_TYPES.map(type => (
                                        <button
                                            key={type.value}
                                            type="button"
                                            onClick={() => {
                                                setQuestionType(type.value);
                                                // Reset answers based on type
                                                if (type.value === "true-false") {
                                                    setAnswers([
                                                        { id: "1", answerEn: "True", answerKm: "ពិត", isCorrect: false },
                                                        { id: "2", answerEn: "False", answerKm: "មិនពិត", isCorrect: false },
                                                    ]);
                                                } else {
                                                    setAnswers([
                                                        { id: "1", answerEn: "", answerKm: "", isCorrect: false },
                                                        { id: "2", answerEn: "", answerKm: "", isCorrect: false },
                                                    ]);
                                                }
                                            }}
                                            className={`p-3 border-2 border-black text-left transition-all ${questionType === type.value
                                                ? "bg-yellow-400 shadow-[3px_3px_0_#000]"
                                                : "bg-white hover:shadow-[2px_2px_0_#000]"
                                                }`}
                                        >
                                            <div className="font-black text-sm">{type.label}</div>
                                            <div className="text-xs text-zinc-600 mt-1">{type.description}</div>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Difficulty */}
                            <div>
                                <label className="block text-sm font-bold mb-2">Difficulty Level *</label>
                                <div className="grid grid-cols-3 gap-3">
                                    {DIFFICULTY_LEVELS.map(level => (
                                        <button
                                            key={level.value}
                                            type="button"
                                            onClick={() => setDifficulty(level.value)}
                                            className={`p-3 border-2 border-black text-center transition-all ${difficulty === level.value
                                                ? "shadow-[3px_3px_0_#000]"
                                                : "bg-white hover:shadow-[2px_2px_0_#000]"
                                                }`}
                                            style={{
                                                backgroundColor: difficulty === level.value ? level.color : "#ffffff",
                                                color: difficulty === level.value ? "#ffffff" : "#000000",
                                            }}
                                        >
                                            <div className="font-black text-sm">{level.label}</div>
                                            <div className={`text-xs mt-1 ${difficulty === level.value ? "text-white/80" : "text-zinc-600"}`}>
                                                {level.description}
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Step 3: Question Content */}
                    <div className="bg-green-50 border-2 border-black p-4">
                        <h3 className="text-lg font-black mb-3 flex items-center gap-2">
                            <span className="bg-green-500 text-white w-7 h-7 rounded-full flex items-center justify-center text-sm">3</span>
                            Question Content
                        </h3>
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold mb-2">Question (English) *</label>
                                    <textarea
                                        value={questionEn}
                                        onChange={(e) => setQuestionEn(e.target.value)}
                                        className="w-full px-3 py-2 border-2 border-black font-medium focus:outline-none focus:shadow-[2px_2px_0_#000] min-h-[100px]"
                                        placeholder="Enter your question in English..."
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold mb-2">Question (Khmer)</label>
                                    <textarea
                                        value={questionKm}
                                        onChange={(e) => setQuestionKm(e.target.value)}
                                        className="w-full px-3 py-2 border-2 border-black font-medium focus:outline-none focus:shadow-[2px_2px_0_#000] min-h-[100px]"
                                        placeholder="បញ្ចូលសំណួររបស់អ្នកជាភាសាខ្មែរ..."
                                    />
                                </div>
                            </div>

                            {/* Hint (Optional) */}
                            <div className="bg-yellow-100 border-2 border-yellow-400 p-3">
                                <div className="flex items-center gap-2 mb-2">
                                    <Lightbulb size={16} className="text-yellow-700" />
                                    <span className="text-sm font-black text-yellow-900">Learning Hint (Optional)</span>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <input
                                        type="text"
                                        value={hintEn}
                                        onChange={(e) => setHintEn(e.target.value)}
                                        className="px-3 py-2 border-2 border-yellow-400 font-medium focus:outline-none"
                                        placeholder="Hint in English..."
                                    />
                                    <input
                                        type="text"
                                        value={hintKm}
                                        onChange={(e) => setHintKm(e.target.value)}
                                        className="px-3 py-2 border-2 border-yellow-400 font-medium focus:outline-none"
                                        placeholder="ជំនួយជាភាសាខ្មែរ..."
                                    />
                                </div>
                            </div>

                            {/* Image URL (Optional) */}
                            <div>
                                <label className="block text-sm font-bold mb-2 flex items-center gap-2">
                                    <ImageIcon size={16} />
                                    Question Image (Optional)
                                </label>
                                <input
                                    type="url"
                                    value={imageUrl}
                                    onChange={(e) => setImageUrl(e.target.value)}
                                    className="w-full px-3 py-2 border-2 border-black font-medium focus:outline-none focus:shadow-[2px_2px_0_#000]"
                                    placeholder="https://example.com/image.jpg"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Step 4: Answers */}
                    <div className="bg-orange-50 border-2 border-black p-4">
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="text-lg font-black flex items-center gap-2">
                                <span className="bg-orange-500 text-white w-7 h-7 rounded-full flex items-center justify-center text-sm">4</span>
                                Answer Options
                            </h3>
                            {answers.length < (selectedQuestionType?.maxAnswers || 5) && (
                                <button
                                    type="button"
                                    onClick={addAnswer}
                                    className="px-3 py-1.5 bg-green-400 border-2 border-black font-bold text-sm hover:shadow-[2px_2px_0_#000] transition-all inline-flex items-center gap-1"
                                >
                                    <Plus size={16} />
                                    Add Answer
                                </button>
                            )}
                        </div>

                        <div className="space-y-3">
                            {answers.map((answer, index) => (
                                <div
                                    key={answer.id}
                                    className={`border-2 border-black p-3 ${answer.isCorrect ? "bg-green-100" : "bg-white"
                                        }`}
                                >
                                    <div className="flex items-start gap-3">
                                        <div className="flex items-center gap-2 pt-2">
                                            <span className="font-black text-sm">{String.fromCharCode(65 + index)}</span>
                                            <button
                                                type="button"
                                                onClick={() => toggleCorrectAnswer(answer.id!)}
                                                className={`w-6 h-6 border-2 border-black flex items-center justify-center transition-all ${answer.isCorrect
                                                    ? "bg-green-500"
                                                    : "bg-white hover:bg-gray-100"
                                                    }`}
                                                title="Mark as correct"
                                            >
                                                {answer.isCorrect && <CheckCircle size={16} className="text-white" />}
                                            </button>
                                        </div>

                                        <div className="flex-1 space-y-2">
                                            <div className="grid grid-cols-2 gap-2">
                                                <input
                                                    type="text"
                                                    value={answer.answerEn}
                                                    onChange={(e) => updateAnswer(answer.id!, "answerEn", e.target.value)}
                                                    className="px-3 py-2 border-2 border-black font-medium focus:outline-none"
                                                    placeholder="Answer in English *"
                                                    required
                                                    disabled={questionType === "true-false"}
                                                />
                                                <input
                                                    type="text"
                                                    value={answer.answerKm}
                                                    onChange={(e) => updateAnswer(answer.id!, "answerKm", e.target.value)}
                                                    className="px-3 py-2 border-2 border-black font-medium focus:outline-none"
                                                    placeholder="ចម្លើយជាភាសាខ្មែរ"
                                                    disabled={questionType === "true-false"}
                                                />
                                            </div>
                                            {questionType === "image-match" && (
                                                <input
                                                    type="url"
                                                    value={answer.imageUrl || ""}
                                                    onChange={(e) => updateAnswer(answer.id!, "imageUrl", e.target.value)}
                                                    className="w-full px-3 py-2 border-2 border-black font-medium focus:outline-none text-sm"
                                                    placeholder="Image URL for this answer..."
                                                />
                                            )}
                                        </div>

                                        {answers.length > (selectedQuestionType?.minAnswers || 2) && (
                                            <button
                                                type="button"
                                                onClick={() => removeAnswer(answer.id!)}
                                                className="p-2 bg-red-100 border-2 border-black hover:bg-red-200 transition-all"
                                                title="Remove answer"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="mt-3 p-3 bg-blue-100 border-2 border-blue-300">
                            <div className="flex items-start gap-2">
                                <AlertCircle size={16} className="text-blue-700 mt-0.5" />
                                <div className="text-xs font-bold text-blue-900">
                                    <strong>Tip:</strong> Click the checkbox to mark correct answer(s).
                                    {questionType === "multi-select"
                                        ? " You can select multiple correct answers."
                                        : " Only one answer can be correct."}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end gap-3 pt-6 border-t-4 border-black">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-3 border-2 border-black bg-white font-black hover:shadow-[2px_2px_0_#000] transition-all"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-6 py-3 border-2 border-black bg-green-400 font-black hover:shadow-[4px_4px_0_#000] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? "Saving..." : initialData ? "Update Question" : "Create Question"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
