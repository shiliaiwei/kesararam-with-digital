"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Plus, Search, Edit, Trash2, BookOpen } from "lucide-react";
import { BrandSelect } from "@/components/ui/brand-select";

interface Question {
    id: number;
    topicId: number;
    questionType: string;
    questionEn: string;
    questionKm: string;
    difficulty: string;
    status: string;
    createdAt: string;
    topic?: { id: number; nameEn: string; topicCode: string; };
}

const QUESTION_TYPES = [
    { value: "mcq", label: "Quiz (MCQ)" },
    { value: "true_false", label: "True / False" },
    { value: "type_answer", label: "Type Answer" },
    { value: "puzzle", label: "Puzzle" },
    { value: "slider", label: "Slider" },
    { value: "pin_answer", label: "Pin Answer" },
    { value: "guess_pic", label: "Guess Picture" },
    { value: "multi_select", label: "Multi-Select" },
];

export default function AdminQuestionsClient() {
    const searchParams = useSearchParams();
    const initialTopicId = searchParams.get("topicId");

    const [data, setData] = useState<{ question: Question; topic?: Question['topic'] | null }[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [typeFilter, setTypeFilter] = useState("all");
    const [topicFilter] = useState(initialTopicId || "");
    const [loading, setLoading] = useState(true);

    useEffect(() => { fetchQuestions(); }, []);

    const fetchQuestions = async () => {
        try {
            const res = await fetch("/api/admin/questions");
            const result = await res.json();
            setData(result.questions || []);
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Delete this question?")) return;
        await fetch(`/api/admin/questions/${id}`, { method: "DELETE" });
        fetchQuestions();
    };

    const filtered = data.filter(({ question, topic }) => {
        const matchSearch =
            question.questionEn.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (topic?.nameEn || "").toLowerCase().includes(searchTerm.toLowerCase());
        const matchType = typeFilter === "all" || question.questionType === typeFilter;
        const matchTopic = !topicFilter || question.topicId.toString() === topicFilter;
        return matchSearch && matchType && matchTopic;
    });

    if (loading) return <div className="p-6 font-bold text-zinc-500">Loading questions...</div>;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-black">Topic Questions</h1>
                    <p className="text-sm text-zinc-600">Admin-only: manage questions linked to topics</p>
                </div>
                <a
                    href="/admin/content/questions/new"
                    className="flex items-center gap-2 px-4 py-2 bg-green-400 border-2 border-black font-bold text-sm hover:shadow-[2px_2px_0_#000] transition-all"
                >
                    <Plus size={16} /> Add Question
                </a>
            </div>

            <div className="flex items-center gap-4 bg-white p-4 border-2 border-black shadow-[4px_4px_0_#000]">
                <div className="relative flex-1">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                    <input
                        type="text"
                        placeholder="Search questions or topics..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border-2 border-black font-medium text-sm focus:outline-none focus:bg-yellow-50"
                    />
                </div>
                <BrandSelect
                    value={typeFilter}
                    onValueChange={setTypeFilter}
                    ariaLabel="Filter by type"
                    className="px-4 py-2 text-sm"
                    options={[
                        { value: "all", label: "All Types" },
                        ...QUESTION_TYPES.map(t => ({ value: t.value, label: t.label })),
                    ]}
                />
                <span className="text-sm text-zinc-600 font-bold whitespace-nowrap">{filtered.length} questions</span>
            </div>

            <div className="bg-white border-2 border-black shadow-[4px_4px_0_#000] overflow-hidden">
                <table className="w-full text-left">
                    <thead>
                        <tr className="bg-amber-400 border-b-2 border-black">
                            {["Topic", "Question", "Type", "Difficulty", "Actions"].map(h => (
                                <th key={h} className="p-3 font-black uppercase tracking-wider text-xs border-r-2 border-black last:border-r-0">{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.length === 0 ? (
                            <tr><td colSpan={5} className="p-8 text-center text-zinc-500 font-bold">No questions found.</td></tr>
                        ) : filtered.map(({ question, topic }) => (
                            <tr key={question.id} className="border-b-2 border-black hover:bg-yellow-50 transition-colors">
                                <td className="p-3 border-r-2 border-black">
                                    <div className="flex items-center gap-2">
                                        <BookOpen size={14} className="text-blue-500" />
                                        <div>
                                            <p className="font-bold text-sm">{topic?.nameEn || "—"}</p>
                                            {topic?.topicCode && <p className="text-[10px] font-mono text-zinc-400">{topic.topicCode}</p>}
                                        </div>
                                    </div>
                                </td>
                                <td className="p-3 border-r-2 border-black max-w-xs">
                                    <p className="font-medium text-sm truncate">{question.questionEn}</p>
                                    {question.questionKm && <p className="text-xs text-zinc-500 truncate">{question.questionKm}</p>}
                                </td>
                                <td className="p-3 border-r-2 border-black">
                                    <span className="px-2 py-1 bg-purple-100 border border-black text-xs font-bold">
                                        {QUESTION_TYPES.find(t => t.value === question.questionType)?.label || question.questionType}
                                    </span>
                                </td>
                                <td className="p-3 border-r-2 border-black">
                                    <span className={`px-2 py-1 border text-xs font-bold capitalize ${question.difficulty === "hard" ? "bg-red-100 text-red-700 border-red-400" :
                                            question.difficulty === "medium" ? "bg-yellow-100 text-yellow-700 border-yellow-400" :
                                                "bg-green-100 text-green-700 border-green-400"
                                        }`}>{question.difficulty}</span>
                                </td>
                                <td className="p-3">
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleDelete(question.id)}
                                            className="p-1.5 border-2 border-black bg-red-100 hover:bg-red-200 transition-all"
                                            title="Delete"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
