"use client";

import { useState, useEffect } from "react";
import { X, Plus, Trash2, Lightbulb, AlertCircle, CheckCircle, Zap, RefreshCw, Clipboard, Settings, Image as ImageIcon } from "lucide-react";
import { useToast } from "@/components/ui/toast-container";

interface QuestionFormModalProps {
    initialData?: any;
    preSelectedTopic?: any;
    onClose: () => void;
    onSuccess: () => void;
}

interface Category { id: number; slug: string; titleEn: string; }
interface Topic { id: number; topicCode: string; nameEn: string; nameKm: string; categoryId: number; primaryImageUrl?: string; categorySlug?: string; }
interface Answer { id: string; answerEn: string; answerKm: string; isCorrect: boolean; imageUrl?: string; }

const SCORE_MAP: Record<string, number> = { easy: 1, medium: 2, hard: 3 };

const Q_TYPES = [
    { value: "mcq", label: "Multiple Choice", desc: "One correct answer", min: 2, max: 5, multi: false },
    { value: "true-false", label: "True / False", desc: "Binary choice", min: 2, max: 2, multi: false },
    { value: "multi-select", label: "Multi-Select", desc: "Multiple correct answers", min: 3, max: 5, multi: true },
    { value: "image-match", label: "Image Match", desc: "Pick the correct image", min: 2, max: 4, multi: false },
];

const DIFF = [
    { value: "easy", label: "Easy", color: "#22c55e", pts: 1, desc: "Basic recall" },
    { value: "medium", label: "Medium", color: "#f59e0b", pts: 2, desc: "Application" },
    { value: "hard", label: "Hard", color: "#ef4444", pts: 3, desc: "Critical thinking" },
];

// Categories that support image-match (road signs & priority)
const IMAGE_MATCH_SLUGS = ["road-sign", "priority"];

export function QuestionFormModal({ initialData, preSelectedTopic, onClose, onSuccess }: QuestionFormModalProps) {
    const { showToast } = useToast();
    const [saving, setSaving] = useState(false);
    const [mode, setMode] = useState<"quick" | "full" | "json">("quick");
    const [categories, setCategories] = useState<Category[]>([]);
    const [topics, setTopics] = useState<Topic[]>([]);
    const [filteredTopics, setFilteredTopics] = useState<Topic[]>([]);
    const [distImages, setDistImages] = useState<string[]>([]);

    const isPreSelected = !!preSelectedTopic;

    // Form state
    const [catId, setCatId] = useState<number | null>(preSelectedTopic?.categoryId || null);
    const [topicId, setTopicId] = useState<number | null>(preSelectedTopic?.id || null);
    const [topicData, setTopicData] = useState<Topic | null>(preSelectedTopic || null);
    const [qType, setQType] = useState("mcq");
    const [diff, setDiff] = useState("medium");
    const [qEn, setQEn] = useState("");
    const [qKm, setQKm] = useState("");
    const [hintEn, setHintEn] = useState("");
    const [hintKm, setHintKm] = useState("");
    const [imageUrl, setImageUrl] = useState(preSelectedTopic?.primaryImageUrl || "");
    const [answers, setAnswers] = useState<Answer[]>([
        { id: "1", answerEn: "", answerKm: "", isCorrect: false },
        { id: "2", answerEn: "", answerKm: "", isCorrect: false },
    ]);

    const selectedType = Q_TYPES.find(t => t.value === qType)!;
    const selectedDiff = DIFF.find(d => d.value === diff)!;
    const catSlug = categories.find(c => c.id === catId)?.slug || "";
    const canUseImageMatch = IMAGE_MATCH_SLUGS.includes(catSlug);

    useEffect(() => { fetchCategories(); fetchTopics(); }, []);

    useEffect(() => {
        if (catId) setFilteredTopics(topics.filter(t => t.categoryId === catId));
        else setFilteredTopics([]);
    }, [catId, topics]);

    // Auto-link topic image when topic changes
    useEffect(() => {
        if (topicData?.primaryImageUrl) {
            setImageUrl(topicData.primaryImageUrl);
        }
    }, [topicData]);

    // Auto-load distractor images for image-match
    useEffect(() => {
        if (qType === "image-match" && catId && canUseImageMatch) {
            fetchDistractors();
        }
    }, [qType, catId]);

    const fetchCategories = async () => {
        try {
            const res = await fetch("/api/categories");
            const data = await res.json();
            setCategories(Array.isArray(data) ? data : (data.categories || []));
        } catch { }
    };

    const fetchTopics = async () => {
        try {
            const res = await fetch("/api/admin/topics");
            const data = await res.json();
            setTopics(Array.isArray(data) ? data : (data.topics || []));
        } catch { }
    };

    const fetchDistractors = async () => {
        try {
            // Fetch random images from same category's traffic signs
            const res = await fetch(`/api/admin/distractor-images?categoryId=${catId}&exclude=${topicData?.primaryImageUrl || ""}`);
            if (res.ok) {
                const data = await res.json();
                setDistImages(data.images || []);
            }
        } catch { }
    };

    const handleTopicChange = (id: number) => {
        setTopicId(id);
        const t = topics.find(t => t.id === id) || null;
        setTopicData(t);
    };

    const handleTypeChange = (type: string) => {
        setQType(type);
        const t = Q_TYPES.find(q => q.value === type)!;
        if (type === "true-false") {
            setAnswers([
                { id: "1", answerEn: "True", answerKm: "ពិត", isCorrect: false },
                { id: "2", answerEn: "False", answerKm: "មិនពិត", isCorrect: false },
            ]);
        } else if (type === "image-match") {
            // Pre-fill correct answer with topic image, 3 distractors
            const correct = topicData?.primaryImageUrl || "";
            const dists = distImages.slice(0, 3);
            const all = [
                { id: "1", answerEn: topicData?.nameEn || "Correct", answerKm: topicData?.nameKm || "", isCorrect: true, imageUrl: correct },
                ...dists.map((img, i) => ({ id: String(i + 2), answerEn: `Option ${i + 2}`, answerKm: "", isCorrect: false, imageUrl: img })),
            ];
            setAnswers(all.length >= 2 ? all : [
                { id: "1", answerEn: "", answerKm: "", isCorrect: true, imageUrl: correct },
                { id: "2", answerEn: "", answerKm: "", isCorrect: false, imageUrl: "" },
            ]);
        } else {
            setAnswers([
                { id: "1", answerEn: "", answerKm: "", isCorrect: false },
                { id: "2", answerEn: "", answerKm: "", isCorrect: false },
            ]);
        }
    };

    const addAnswer = () => {
        if (answers.length < selectedType.max) {
            setAnswers([...answers, { id: Date.now().toString(), answerEn: "", answerKm: "", isCorrect: false }]);
        }
    };

    const removeAnswer = (id: string) => {
        if (answers.length > selectedType.min) setAnswers(answers.filter(a => a.id !== id));
    };

    const updateAnswer = (id: string, field: keyof Answer, value: any) => {
        setAnswers(answers.map(a => a.id === id ? { ...a, [field]: value } : a));
    };

    const toggleCorrect = (id: string) => {
        if (selectedType.multi) {
            setAnswers(answers.map(a => a.id === id ? { ...a, isCorrect: !a.isCorrect } : a));
        } else {
            setAnswers(answers.map(a => ({ ...a, isCorrect: a.id === id })));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!topicId) { showToast("Select a topic", "error"); return; }
        if (!qEn.trim()) { showToast("Enter question in English", "error"); return; }
        if (qType !== "image-match" && answers.some(a => !a.answerEn.trim())) { showToast("Fill all answer fields", "error"); return; }
        if (!answers.some(a => a.isCorrect)) { showToast("Mark at least one correct answer", "error"); return; }

        setSaving(true);
        try {
            const payload = {
                topicId,
                questionEn: qEn,
                questionKm: qKm,
                hintEn, hintKm,
                imageUrl,
                difficulty: diff,
                pointsMultiplier: SCORE_MAP[diff],
                answers: answers.map(a => ({
                    answerEn: a.answerEn,
                    answerKm: a.answerKm,
                    isCorrect: a.isCorrect,
                    imageUrl: a.imageUrl || null,
                })),
            };
            const url = initialData ? `/api/admin/questions/${initialData.id}` : "/api/admin/questions";
            const res = await fetch(url, { method: initialData ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
            if (res.ok) {
                showToast(initialData ? "Question updated!" : "Question created!", "success");
                onSuccess();
            } else {
                const d = await res.json();
                showToast(d.error || "Failed to save", "error");
            }
        } catch { showToast("Failed to save question", "error"); }
        finally { setSaving(false); }
    };

    // ── Quick mode state ──
    const [quickText, setQuickText] = useState("");
    const [quickAnswers, setQuickAnswers] = useState<{ text: string; correct: boolean }[]>([]);
    const [quickDiff, setQuickDiff] = useState("medium");

    const parseQuickText = (text: string) => {
        const lines = text.split("\n").map(l => l.trim()).filter(Boolean);
        return lines.map(line => ({
            text: line.replace(/^[*✓✔►\-•]\s*/, "").trim(),
            correct: /^[*✓✔►]/.test(line),
        }));
    };

    const handleQuickPaste = (text: string) => {
        setQuickText(text);
        setQuickAnswers(parseQuickText(text));
    };

    const toggleQuickCorrect = (i: number) => {
        setQuickAnswers(prev => prev.map((a, idx) => ({ ...a, correct: idx === i })));
    };

    const handleQuickSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!topicId) { showToast("Select a topic first", "error"); return; }
        if (!qEn.trim()) { showToast("Enter the question text", "error"); return; }
        if (quickAnswers.length < 2) { showToast("Add at least 2 answers (one per line)", "error"); return; }
        if (!quickAnswers.some(a => a.correct)) { showToast("Click an answer to mark it correct", "error"); return; }
        setSaving(true);
        try {
            const payload = {
                topicId, questionEn: qEn, questionKm: qKm,
                difficulty: quickDiff, pointsMultiplier: SCORE_MAP[quickDiff],
                imageUrl: topicData?.primaryImageUrl || "",
                answers: quickAnswers.map(a => ({ answerEn: a.text, answerKm: "", isCorrect: a.correct, imageUrl: null })),
            };
            const res = await fetch("/api/admin/questions", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
            if (res.ok) {
                showToast("Question created!", "success");
                setQEn(""); setQKm(""); setQuickText(""); setQuickAnswers([]);
                onSuccess();
            } else {
                const d = await res.json();
                showToast(d.error || "Failed to save", "error");
            }
        } catch { showToast("Failed to save", "error"); }
        finally { setSaving(false); }
    };

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
            <div className="bg-white border-4 border-black w-full max-w-3xl max-h-[92vh] overflow-y-auto shadow-[12px_12px_0_#000] flex flex-col">

                {/* Header */}
                <div className="bg-green-400 border-b-4 border-black px-5 py-3 flex items-center justify-between sticky top-0 z-10 flex-shrink-0">
                    <div>
                        <h2 className="text-xl font-black">{initialData ? "Edit Question" : "Create Question"}</h2>
                        {isPreSelected && (
                            <p className="text-xs font-bold text-black/70 mt-0.5 flex items-center gap-1">
                                <CheckCircle size={12} />
                                {preSelectedTopic.nameEn} · {preSelectedTopic.topicCode}
                            </p>
                        )}
                    </div>
                    <div className="flex items-center gap-2">
                        {!initialData && (
                            <div className="flex border-2 border-black overflow-hidden">
                                <button type="button" onClick={() => setMode("quick")}
                                    className={`px-3 py-1.5 text-xs font-black flex items-center gap-1 transition-all ${mode === "quick" ? "bg-black text-white" : "bg-white hover:bg-gray-100"}`}>
                                    <Clipboard size={13} /> Quick
                                </button>
                                <button type="button" onClick={() => setMode("json")}
                                    className={`px-3 py-1.5 text-xs font-black flex items-center gap-1 transition-all border-l-2 border-black ${mode === "json" ? "bg-black text-white" : "bg-white hover:bg-gray-100"}`}>
                                    <Zap size={13} /> JSON
                                </button>
                                <button type="button" onClick={() => setMode("full")}
                                    className={`px-3 py-1.5 text-xs font-black flex items-center gap-1 transition-all border-l-2 border-black ${mode === "full" ? "bg-black text-white" : "bg-white hover:bg-gray-100"}`}>
                                    <Settings size={13} /> Full
                                </button>
                            </div>
                        )}
                        <button onClick={onClose} className="p-2 bg-white border-2 border-black hover:shadow-[2px_2px_0_#000] transition-all"><X size={20} /></button>
                    </div>
                </div>

                {/* ── QUICK MODE ── */}
                {mode === "quick" && !initialData && (
                    <form onSubmit={handleQuickSubmit} className="p-5 space-y-4">
                        {!isPreSelected && (
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-black uppercase mb-1">Category *</label>
                                    <select value={catId || ""} onChange={e => { setCatId(Number(e.target.value)); setTopicId(null); setTopicData(null); }}
                                        className="w-full px-3 py-2 border-2 border-black text-sm font-medium focus:outline-none" required>
                                        <option value="">Choose category...</option>
                                        {categories.map(c => <option key={c.id} value={c.id}>{c.titleEn}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-black uppercase mb-1">Topic *</label>
                                    <select value={topicId || ""} onChange={e => handleTopicChange(Number(e.target.value))}
                                        className="w-full px-3 py-2 border-2 border-black text-sm font-medium focus:outline-none disabled:bg-gray-100"
                                        disabled={!catId} required>
                                        <option value="">Choose topic...</option>
                                        {filteredTopics.map(t => <option key={t.id} value={t.id}>{t.nameEn} ({t.topicCode})</option>)}
                                    </select>
                                </div>
                            </div>
                        )}

                        <div>
                            <label className="block text-xs font-black uppercase mb-1">Question *</label>
                            <textarea value={qEn} onChange={e => setQEn(e.target.value)} required
                                className="w-full px-3 py-2.5 border-2 border-black text-sm font-medium focus:outline-none min-h-[70px] resize-none"
                                placeholder="Paste or type your question here..." />
                        </div>

                        <div>
                            <label className="block text-xs font-black uppercase mb-1">
                                Answers — one per line
                                <span className="ml-2 text-zinc-400 font-medium normal-case text-xs">Start with * to mark correct answer</span>
                            </label>
                            <textarea value={quickText} onChange={e => handleQuickPaste(e.target.value)}
                                className="w-full px-3 py-2.5 border-2 border-black text-sm font-mono focus:outline-none min-h-[100px] resize-none"
                                placeholder={"* 30 km/h\n50 km/h\n60 km/h\n80 km/h"} />
                        </div>

                        {quickAnswers.length > 0 && (
                            <div className="border-2 border-black overflow-hidden">
                                <div className="bg-black text-white px-3 py-2 text-xs font-black uppercase">
                                    Click to mark correct answer
                                </div>
                                <div className="divide-y divide-zinc-200">
                                    {quickAnswers.map((a, i) => (
                                        <button key={i} type="button" onClick={() => toggleQuickCorrect(i)}
                                            className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-all ${a.correct ? "bg-green-100" : "bg-white hover:bg-yellow-50"}`}>
                                            <div className={`w-6 h-6 flex-shrink-0 border-2 border-black flex items-center justify-center font-black text-xs ${a.correct ? "bg-green-500 text-white" : "bg-white text-zinc-400"}`}>
                                                {a.correct ? <CheckCircle size={14} /> : String.fromCharCode(65 + i)}
                                            </div>
                                            <span className={`text-sm font-bold flex-1 ${a.correct ? "text-green-800" : "text-black"}`}>{a.text}</span>
                                            {a.correct && <span className="text-xs font-black text-green-600">CORRECT</span>}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="flex items-center gap-2">
                            <span className="text-xs font-black uppercase text-zinc-500">Difficulty:</span>
                            {DIFF.map(d => (
                                <button key={d.value} type="button" onClick={() => setQuickDiff(d.value)}
                                    className={`px-3 py-1.5 border-2 border-black text-xs font-black transition-all ${quickDiff === d.value ? "shadow-[2px_2px_0_#000]" : "bg-white hover:shadow-[1px_1px_0_#000]"}`}
                                    style={{ backgroundColor: quickDiff === d.value ? d.color : "#fff", color: quickDiff === d.value ? "#fff" : "#000" }}>
                                    {d.label} +{d.pts}pt
                                </button>
                            ))}
                        </div>

                        <div className="flex justify-end gap-3 pt-2 border-t-2 border-black">
                            <button type="button" onClick={onClose} className="px-5 py-2.5 border-2 border-black bg-white font-black text-sm hover:shadow-[2px_2px_0_#000] transition-all">Cancel</button>
                            <button type="submit" disabled={saving} className="px-5 py-2.5 border-2 border-black bg-green-400 font-black text-sm hover:shadow-[4px_4px_0_#000] transition-all disabled:opacity-50">
                                {saving ? "Saving..." : "Create Question"}
                            </button>
                        </div>
                    </form>
                )}

                {/* ── JSON MODE ── */}
                {mode === "json" && !initialData && <JsonImportMode
                    topicId={topicId}
                    topicData={topicData}
                    catId={catId}
                    isPreSelected={isPreSelected}
                    preSelectedTopic={preSelectedTopic}
                    categories={categories}
                    filteredTopics={filteredTopics}
                    setCatId={(id) => { setCatId(id); setTopicId(null); setTopicData(null); }}
                    setTopicId={handleTopicChange}
                    onClose={onClose}
                    onSuccess={onSuccess}
                    showToast={showToast}
                />}

                {/* ── FULL MODE ── */}
                {(mode === "full" || initialData) && (<form onSubmit={handleSubmit} className="p-5 space-y-4 flex-1">

                    {/* ── STEP 1: Topic (only if not pre-selected) ── */}
                    {!isPreSelected && (
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-xs font-black uppercase mb-1">Category *</label>
                                <select value={catId || ""} onChange={e => { setCatId(Number(e.target.value)); setTopicId(null); setTopicData(null); }}
                                    className="w-full px-3 py-2 border-2 border-black text-sm font-medium focus:outline-none" required>
                                    <option value="">Choose category...</option>
                                    {categories.map(c => <option key={c.id} value={c.id}>{c.titleEn}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-black uppercase mb-1">Topic *</label>
                                <select value={topicId || ""} onChange={e => handleTopicChange(Number(e.target.value))}
                                    className="w-full px-3 py-2 border-2 border-black text-sm font-medium focus:outline-none disabled:bg-gray-100"
                                    disabled={!catId} required>
                                    <option value="">Choose topic...</option>
                                    {filteredTopics.map(t => <option key={t.id} value={t.id}>{t.nameEn} ({t.topicCode})</option>)}
                                </select>
                            </div>
                        </div>
                    )}

                    {/* ── STEP 2: Type + Difficulty (side by side) ── */}
                    <div className="grid grid-cols-2 gap-4">
                        {/* Question Type */}
                        <div>
                            <label className="block text-xs font-black uppercase mb-2">Question Type *</label>
                            <div className="grid grid-cols-2 gap-2">
                                {Q_TYPES.map(t => {
                                    const disabled = t.value === "image-match" && !canUseImageMatch;
                                    return (
                                        <button key={t.value} type="button"
                                            onClick={() => !disabled && handleTypeChange(t.value)}
                                            disabled={disabled}
                                            title={disabled ? "Only for Road Signs & Priority categories" : ""}
                                            className={`p-2.5 border-2 border-black text-left transition-all ${qType === t.value ? "bg-yellow-400 shadow-[2px_2px_0_#000]" : disabled ? "bg-zinc-100 opacity-50 cursor-not-allowed" : "bg-white hover:shadow-[2px_2px_0_#000]"}`}>
                                            <div className="font-black text-xs">{t.label}</div>
                                            <div className="text-xs text-zinc-500 mt-0.5">{t.desc}</div>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Difficulty */}
                        <div>
                            <label className="block text-xs font-black uppercase mb-2">Difficulty & Points *</label>
                            <div className="space-y-2">
                                {DIFF.map(d => (
                                    <button key={d.value} type="button" onClick={() => setDiff(d.value)}
                                        className={`w-full p-2.5 border-2 border-black text-left flex items-center justify-between transition-all ${diff === d.value ? "shadow-[2px_2px_0_#000]" : "bg-white hover:shadow-[1px_1px_0_#000]"}`}
                                        style={{ backgroundColor: diff === d.value ? d.color : "#fff", color: diff === d.value ? "#fff" : "#000" }}>
                                        <div>
                                            <span className="font-black text-sm">{d.label}</span>
                                            <span className={`text-xs ml-2 ${diff === d.value ? "text-white/80" : "text-zinc-500"}`}>{d.desc}</span>
                                        </div>
                                        <span className={`font-black text-sm px-2 py-0.5 border border-black ${diff === d.value ? "bg-white/20" : "bg-zinc-100"}`}>
                                            +{d.pts} pt{d.pts > 1 ? "s" : ""}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* ── STEP 3: Question Text ── */}
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-black uppercase mb-1">Question (English) *</label>
                            <textarea value={qEn} onChange={e => setQEn(e.target.value)} required
                                className="w-full px-3 py-2 border-2 border-black text-sm font-medium focus:outline-none min-h-[80px] resize-none"
                                placeholder="Enter question in English..." />
                        </div>
                        <div>
                            <label className="block text-xs font-black uppercase mb-1">Question (Khmer)</label>
                            <textarea value={qKm} onChange={e => setQKm(e.target.value)}
                                className="w-full px-3 py-2 border-2 border-black text-sm font-medium focus:outline-none min-h-[80px] resize-none"
                                placeholder="បញ្ចូលសំណួរជាភាសាខ្មែរ..." />
                        </div>
                    </div>

                    {/* ── Question Image (auto-linked from topic) ── */}
                    <div>
                        <label className="block text-xs font-black uppercase mb-1 flex items-center gap-1">
                            <ImageIcon size={13} /> Question Image
                            {topicData?.primaryImageUrl && (
                                <span className="ml-1 text-xs font-bold text-green-600 flex items-center gap-1">
                                    <Zap size={11} /> Auto-linked from topic
                                </span>
                            )}
                        </label>
                        <div className="flex gap-2">
                            <input type="url" value={imageUrl} onChange={e => setImageUrl(e.target.value)}
                                className="flex-1 px-3 py-2 border-2 border-black text-sm font-medium focus:outline-none"
                                placeholder="https://... (auto-filled from topic)" />
                            {topicData?.primaryImageUrl && (
                                <button type="button" onClick={() => setImageUrl(topicData.primaryImageUrl!)}
                                    className="px-3 py-2 border-2 border-black bg-green-100 hover:bg-green-200 text-xs font-bold flex items-center gap-1 transition-all">
                                    <RefreshCw size={13} /> Reset
                                </button>
                            )}
                        </div>
                        {imageUrl && (
                            <div className="mt-2 flex items-center gap-2">
                                <img src={imageUrl} alt="preview" className="h-16 w-16 object-cover border-2 border-black" onError={e => (e.currentTarget.style.display = "none")} />
                                <span className="text-xs text-zinc-500 font-medium">Preview</span>
                            </div>
                        )}
                    </div>

                    {/* ── Hint ── */}
                    <div className="bg-yellow-50 border-2 border-yellow-400 p-3">
                        <div className="flex items-center gap-1 mb-2">
                            <Lightbulb size={14} className="text-yellow-700" />
                            <span className="text-xs font-black text-yellow-900 uppercase">Learning Hint (Optional)</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            <input type="text" value={hintEn} onChange={e => setHintEn(e.target.value)}
                                className="px-3 py-2 border-2 border-yellow-400 text-sm font-medium focus:outline-none"
                                placeholder="Hint in English..." />
                            <input type="text" value={hintKm} onChange={e => setHintKm(e.target.value)}
                                className="px-3 py-2 border-2 border-yellow-400 text-sm font-medium focus:outline-none"
                                placeholder="ជំនួយជាភាសាខ្មែរ..." />
                        </div>
                    </div>

                    {/* ── STEP 4: Answers ── */}
                    <div className="border-2 border-black">
                        <div className="bg-black text-white px-4 py-2.5 flex items-center justify-between">
                            <span className="text-sm font-black uppercase">
                                Answer Options
                                <span className="ml-2 font-medium text-white/60 text-xs">
                                    {selectedType.multi ? "Select all correct" : "Select one correct"}
                                </span>
                            </span>
                            {answers.length < selectedType.max && qType !== "true-false" && (
                                <button type="button" onClick={addAnswer}
                                    className="px-3 py-1 bg-green-400 border border-white text-black font-black text-xs hover:bg-green-300 transition-all flex items-center gap-1">
                                    <Plus size={13} /> Add
                                </button>
                            )}
                        </div>

                        <div className="divide-y divide-zinc-200">
                            {answers.map((ans, i) => (
                                <div key={ans.id} className={`flex items-start gap-3 p-3 ${ans.isCorrect ? "bg-green-50" : "bg-white"}`}>
                                    {/* Correct toggle */}
                                    <button type="button" onClick={() => toggleCorrect(ans.id)}
                                        className={`mt-1 w-7 h-7 flex-shrink-0 border-2 border-black flex items-center justify-center transition-all ${ans.isCorrect ? "bg-green-500" : "bg-white hover:bg-gray-100"}`}>
                                        {ans.isCorrect ? <CheckCircle size={15} className="text-white" /> : <span className="text-xs font-black text-zinc-400">{String.fromCharCode(65 + i)}</span>}
                                    </button>

                                    <div className="flex-1 space-y-1.5">
                                        {qType === "image-match" ? (
                                            /* Image match: show image preview + label */
                                            <div className="flex items-center gap-2">
                                                {ans.imageUrl ? (
                                                    <img src={ans.imageUrl} alt="" className="h-14 w-14 object-cover border-2 border-black flex-shrink-0" />
                                                ) : (
                                                    <div className="h-14 w-14 border-2 border-dashed border-zinc-300 flex items-center justify-center flex-shrink-0">
                                                        <ImageIcon size={20} className="text-zinc-300" />
                                                    </div>
                                                )}
                                                <div className="flex-1 space-y-1">
                                                    <input type="url" value={ans.imageUrl || ""} onChange={e => updateAnswer(ans.id, "imageUrl", e.target.value)}
                                                        className="w-full px-2 py-1.5 border-2 border-black text-xs font-medium focus:outline-none"
                                                        placeholder="Image URL..." />
                                                    <input type="text" value={ans.answerEn} onChange={e => updateAnswer(ans.id, "answerEn", e.target.value)}
                                                        className="w-full px-2 py-1.5 border border-zinc-300 text-xs font-medium focus:outline-none"
                                                        placeholder="Label (English)" />
                                                </div>
                                            </div>
                                        ) : (
                                            /* Text answers */
                                            <div className="grid grid-cols-2 gap-2">
                                                <input type="text" value={ans.answerEn} onChange={e => updateAnswer(ans.id, "answerEn", e.target.value)}
                                                    className="px-3 py-2 border-2 border-black text-sm font-medium focus:outline-none"
                                                    placeholder="English *" required
                                                    disabled={qType === "true-false"} />
                                                <input type="text" value={ans.answerKm} onChange={e => updateAnswer(ans.id, "answerKm", e.target.value)}
                                                    className="px-3 py-2 border-2 border-black text-sm font-medium focus:outline-none"
                                                    placeholder="ខ្មែរ"
                                                    disabled={qType === "true-false"} />
                                            </div>
                                        )}
                                    </div>

                                    {answers.length > selectedType.min && qType !== "true-false" && (
                                        <button type="button" onClick={() => removeAnswer(ans.id)}
                                            className="mt-1 p-1.5 border-2 border-black bg-red-100 hover:bg-red-200 transition-all flex-shrink-0">
                                            <Trash2 size={13} />
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>

                        {/* Tip */}
                        <div className="px-4 py-2 bg-blue-50 border-t border-blue-200 flex items-center gap-2">
                            <AlertCircle size={13} className="text-blue-600 flex-shrink-0" />
                            <span className="text-xs font-bold text-blue-800">
                                {qType === "image-match"
                                    ? "Correct image is auto-linked from the topic. Add 3 distractor images from the same category."
                                    : qType === "multi-select"
                                        ? "Click the checkbox to mark multiple correct answers."
                                        : "Click the letter button to mark the correct answer."}
                            </span>
                        </div>
                    </div>

                    {/* ── Score preview ── */}
                    <div className="flex items-center gap-3 p-3 bg-zinc-50 border-2 border-zinc-300">
                        <Zap size={16} className="text-yellow-600" />
                        <span className="text-xs font-black text-zinc-600 uppercase">Score Preview:</span>
                        <span className="text-sm font-black" style={{ color: selectedDiff.color }}>
                            +{selectedDiff.pts} point{selectedDiff.pts > 1 ? "s" : ""} per correct answer
                        </span>
                        <span className="text-xs text-zinc-400 font-medium">· Streak bonus applies in live mode</span>
                    </div>

                    {/* ── Actions ── */}
                    <div className="flex justify-end gap-3 pt-2 border-t-2 border-black">
                        <button type="button" onClick={onClose}
                            className="px-5 py-2.5 border-2 border-black bg-white font-black text-sm hover:shadow-[2px_2px_0_#000] transition-all">
                            Cancel
                        </button>
                        <button type="submit" disabled={saving}
                            className="px-5 py-2.5 border-2 border-black bg-green-400 font-black text-sm hover:shadow-[4px_4px_0_#000] transition-all disabled:opacity-50">
                            {saving ? "Saving..." : initialData ? "Update Question" : "Create Question"}
                        </button>
                    </div>
                </form>
                )}
            </div>
        </div>
    );
}

// ─────────────────────────────────────────────────────────────
// JSON IMPORT MODE — paste JSON array, preview, bulk create
// ─────────────────────────────────────────────────────────────

interface JsonImportModeProps {
    topicId: number | null;
    topicData: any;
    catId: number | null;
    isPreSelected: boolean;
    preSelectedTopic: any;
    categories: Category[];
    filteredTopics: Topic[];
    setCatId: (id: number) => void;
    setTopicId: (id: number) => void;
    onClose: () => void;
    onSuccess: () => void;
    showToast: (msg: string, type: string) => void;
}

const JSON_TEMPLATE = `[
  {
    "q": "What is the maximum speed limit in a built-up area?",
    "qkm": "ល្បឿនកំណត់អតិបរមានៅក្នុងតំបន់ដែលមានប្រជាជនរស់នៅ?",
    "type": "mcq",
    "diff": "easy",
    "hint": "Look for speed limit signs",
    "image": "auto",
    "answers": [
      { "a": "40 km/h", "akm": "៤០ គ.ម/ម", "correct": true },
      { "a": "60 km/h", "akm": "៦០ គ.ម/ម" },
      { "a": "80 km/h", "akm": "៨០ គ.ម/ម" },
      { "a": "100 km/h", "akm": "១០០ គ.ម/ម" }
    ]
  },
  {
    "q": "This sign is a street name sign.",
    "qkm": "សញ្ញានេះជាសញ្ញាឈ្មោះផ្លូវ។",
    "type": "true-false",
    "diff": "easy",
    "image": "auto",
    "answers": [
      { "a": "True", "akm": "ពិត", "correct": true },
      { "a": "False", "akm": "មិនពិត" }
    ]
  },
  {
    "q": "Which statements are TRUE about this sign?",
    "qkm": "ចំណុចណាខ្លះជាការពិតអំពីសញ្ញានេះ?",
    "type": "multi-select",
    "diff": "medium",
    "image": "auto",
    "answers": [
      { "a": "It identifies a road name", "akm": "វាកំណត់ឈ្មោះផ្លូវ", "correct": true },
      { "a": "It helps drivers navigate", "akm": "វាជួយអ្នកបើកបរធ្វើដំណើរ", "correct": true },
      { "a": "It shows the speed limit", "akm": "វាបង្ហាញល្បឿនកំណត់" },
      { "a": "It is an informational sign", "akm": "វាជាសញ្ញាព័ត៌មាន", "correct": true }
    ]
  },
  {
    "q": "Which image shows the correct sign for this topic?",
    "qkm": "រូបភាពណាបង្ហាញសញ្ញាត្រឹមត្រូវសម្រាប់ប្រធានបទនេះ?",
    "type": "image-match",
    "diff": "medium",
    "image": "auto",
    "answers": []
  }
]`;

function JsonImportMode({ topicId, topicData, catId, isPreSelected, preSelectedTopic, categories, filteredTopics, setCatId, setTopicId, onClose, onSuccess, showToast }: JsonImportModeProps) {
    const [jsonText, setJsonText] = useState("");
    const [parsed, setParsed] = useState<any[]>([]);
    const [parseError, setParseError] = useState("");
    const [importing, setImporting] = useState(false);
    const [results, setResults] = useState<{ q: string; ok: boolean; err?: string }[]>([]);
    const [localCatId, setLocalCatId] = useState<number | null>(catId);
    const [localTopicId, setLocalTopicId] = useState<number | null>(topicId);

    const handleParse = (text: string) => {
        setJsonText(text);
        setParseError("");
        setParsed([]);
        setResults([]);
        if (!text.trim()) return;
        try {
            const data = JSON.parse(text);
            if (!Array.isArray(data)) { setParseError("Must be a JSON array [ ... ]"); return; }
            setParsed(data);
        } catch (e: any) {
            setParseError(`JSON Error: ${e.message}`);
        }
    };

    const handleImport = async () => {
        const tid = isPreSelected ? topicId : localTopicId;
        if (!tid) { showToast("Select a topic first", "error"); return; }
        if (parsed.length === 0) { showToast("No valid questions to import", "error"); return; }

        setImporting(true);
        const res: { q: string; ok: boolean; err?: string }[] = [];

        // Pre-fetch distractor images once if any image-match questions exist
        let distractorImages: string[] = [];
        const hasImageMatch = parsed.some(item => (item.type || item.questionType) === "image-match");
        if (hasImageMatch && (catId || localCatId)) {
            try {
                const cid = catId || localCatId;
                const exclude = topicData?.primaryImageUrl || "";
                const dr = await fetch(`/api/admin/distractor-images?categoryId=${cid}&exclude=${encodeURIComponent(exclude)}`);
                if (dr.ok) {
                    const dd = await dr.json();
                    distractorImages = dd.images || [];
                }
            } catch { }
        }

        for (const item of parsed) {
            try {
                const qType = item.type || item.questionType || "mcq";
                const topicImg = topicData?.primaryImageUrl || "";

                // Build answers — handle "auto" image for image-match
                let answers = (item.answers || []).map((a: any, idx: number) => {
                    let imgUrl = a.imageUrl || a.img || null;
                    // "auto" = use topic image for correct, distractors for others
                    if (imgUrl === "auto" || (qType === "image-match" && !imgUrl)) {
                        if (a.correct) {
                            imgUrl = topicImg;
                        } else {
                            imgUrl = distractorImages[idx] || distractorImages[idx - 1] || "";
                        }
                    }
                    return {
                        answerEn: a.a || a.answerEn || "",
                        answerKm: a.akm || a.answerKm || "",
                        isCorrect: a.correct === true,
                        imageUrl: imgUrl,
                    };
                });

                // If image-match with no answers defined, auto-build from topic + distractors
                if (qType === "image-match" && answers.length === 0) {
                    answers = [
                        { answerEn: topicData?.nameEn || "Correct", answerKm: topicData?.nameKm || "", isCorrect: true, imageUrl: topicImg },
                        ...distractorImages.slice(0, 3).map((img, i) => ({
                            answerEn: `Option ${i + 2}`, answerKm: "", isCorrect: false, imageUrl: img,
                        })),
                    ];
                }

                const payload = {
                    topicId: tid,
                    questionEn: item.q || item.questionEn || "",
                    questionKm: item.qkm || item.questionKm || "",
                    hintEn: item.hint || item.hintEn || "",
                    hintKm: item.hintKm || "",
                    imageUrl: item.image === "auto" ? topicImg : (item.image || item.imageUrl || topicImg),
                    difficulty: item.diff || item.difficulty || "medium",
                    pointsMultiplier: ({ easy: 1, medium: 2, hard: 3 } as Record<string, number>)[item.diff || item.difficulty || "medium"] || 2,
                    answers,
                };

                if (!payload.questionEn) { res.push({ q: "(empty)", ok: false, err: "Missing question text" }); continue; }
                if (answers.length < 2) { res.push({ q: payload.questionEn, ok: false, err: "Need at least 2 answers" }); continue; }
                if (!answers.some((a: any) => a.isCorrect)) { res.push({ q: payload.questionEn, ok: false, err: "No correct answer marked" }); continue; }

                const r = await fetch("/api/admin/questions", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload),
                });

                if (r.ok) {
                    res.push({ q: payload.questionEn, ok: true });
                } else {
                    const d = await r.json();
                    res.push({ q: payload.questionEn, ok: false, err: d.error || "Failed" });
                }
            } catch (e: any) {
                res.push({ q: item.q || "?", ok: false, err: e.message });
            }
        }

        setResults(res);
        setImporting(false);

        const ok = res.filter(r => r.ok).length;
        const fail = res.filter(r => !r.ok).length;
        showToast(`Imported ${ok} questions${fail > 0 ? `, ${fail} failed` : ""}`, ok > 0 ? "success" : "error");
        if (ok > 0 && fail === 0) onSuccess();
    };

    const okCount = results.filter(r => r.ok).length;
    const failCount = results.filter(r => !r.ok).length;

    return (
        <div className="p-5 space-y-4">
            {/* Topic selector */}
            {!isPreSelected && (
                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className="block text-xs font-black uppercase mb-1">Category *</label>
                        <select value={localCatId || ""} onChange={e => { setLocalCatId(Number(e.target.value)); setLocalTopicId(null); setCatId(Number(e.target.value)); }}
                            className="w-full px-3 py-2 border-2 border-black text-sm font-medium focus:outline-none">
                            <option value="">Choose category...</option>
                            {categories.map(c => <option key={c.id} value={c.id}>{c.titleEn}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-black uppercase mb-1">Topic *</label>
                        <select value={localTopicId || ""} onChange={e => { setLocalTopicId(Number(e.target.value)); setTopicId(Number(e.target.value)); }}
                            className="w-full px-3 py-2 border-2 border-black text-sm font-medium focus:outline-none disabled:bg-gray-100"
                            disabled={!localCatId}>
                            <option value="">Choose topic...</option>
                            {filteredTopics.map(t => <option key={t.id} value={t.id}>{t.nameEn} ({t.topicCode})</option>)}
                        </select>
                    </div>
                </div>
            )}

            {/* JSON format guide */}
            <div className="bg-zinc-900 text-green-400 p-3 text-xs font-mono border-2 border-black">
                <div className="text-zinc-400 mb-1 font-sans font-black text-xs uppercase">JSON Format — each question:</div>
                <div className="space-y-0.5 text-xs">
                    <div><span className="text-yellow-400">"q"</span>: <span className="text-green-300">"Question in English"</span> <span className="text-zinc-500">// required</span></div>
                    <div><span className="text-yellow-400">"qkm"</span>: <span className="text-green-300">"សំណួរជាខ្មែរ"</span> <span className="text-zinc-500">// optional</span></div>
                    <div><span className="text-yellow-400">"type"</span>: <span className="text-green-300">"mcq"</span> <span className="text-zinc-500">// mcq | true-false | multi-select</span></div>
                    <div><span className="text-yellow-400">"diff"</span>: <span className="text-green-300">"easy"</span> <span className="text-zinc-500">// easy | medium | hard</span></div>
                    <div><span className="text-yellow-400">"hint"</span>: <span className="text-green-300">"Hint text"</span> <span className="text-zinc-500">// optional</span></div>
                    <div><span className="text-yellow-400">"answers"</span>: [&#123; <span className="text-yellow-400">"a"</span>: <span className="text-green-300">"Answer"</span>, <span className="text-yellow-400">"akm"</span>: <span className="text-green-300">"ចម្លើយ"</span>, <span className="text-yellow-400">"correct"</span>: <span className="text-blue-400">true</span> &#125;]</div>
                </div>
            </div>

            {/* Paste area */}
            <div>
                <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-black uppercase">Paste JSON here *</label>
                    <button type="button" onClick={() => handleParse(JSON_TEMPLATE)}
                        className="text-xs font-bold text-blue-600 underline hover:text-blue-800">
                        Load example
                    </button>
                </div>
                <textarea
                    value={jsonText}
                    onChange={e => handleParse(e.target.value)}
                    className="w-full px-3 py-2.5 border-2 border-black text-xs font-mono focus:outline-none min-h-[160px] resize-y bg-zinc-50"
                    placeholder='[{"q": "...", "type": "mcq", "diff": "easy", "answers": [...]}]'
                    spellCheck={false}
                />
                {parseError && (
                    <p className="mt-1 text-xs font-bold text-red-600 flex items-center gap-1">
                        <AlertCircle size={13} /> {parseError}
                    </p>
                )}
            </div>

            {/* Preview */}
            {parsed.length > 0 && results.length === 0 && (
                <div className="border-2 border-black overflow-hidden">
                    <div className="bg-blue-500 text-white px-3 py-2 flex items-center justify-between">
                        <span className="text-xs font-black uppercase">{parsed.length} Questions Ready to Import</span>
                    </div>
                    <div className="divide-y divide-zinc-200 max-h-48 overflow-y-auto">
                        {parsed.map((item, i) => {
                            const answers = item.answers || [];
                            const correct = answers.find((a: any) => a.correct);
                            const diff = item.diff || item.difficulty || "medium";
                            const diffColors: Record<string, string> = { easy: "#22c55e", medium: "#f59e0b", hard: "#ef4444" };
                            return (
                                <div key={i} className="px-3 py-2.5 flex items-start gap-3">
                                    <span className="text-xs font-black text-zinc-400 flex-shrink-0 mt-0.5">#{i + 1}</span>
                                    <div className="flex-1 min-w-0">
                                        <div className="text-sm font-bold text-black line-clamp-1">{item.q || item.questionEn}</div>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="text-xs font-bold text-zinc-500">{answers.length} answers</span>
                                            {correct && <span className="text-xs font-bold text-green-600">✓ {correct.a}</span>}
                                        </div>
                                    </div>
                                    <span className="text-xs font-black px-2 py-0.5 border border-black flex-shrink-0"
                                        style={{ backgroundColor: diffColors[diff] || "#f59e0b", color: "#fff" }}>
                                        {diff}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Results after import */}
            {results.length > 0 && (
                <div className="border-2 border-black overflow-hidden">
                    <div className={`px-3 py-2 flex items-center justify-between ${failCount === 0 ? "bg-green-500" : "bg-orange-400"} text-white`}>
                        <span className="text-xs font-black uppercase">
                            {okCount} created · {failCount} failed
                        </span>
                        {failCount === 0 && <CheckCircle size={16} />}
                    </div>
                    <div className="divide-y divide-zinc-200 max-h-48 overflow-y-auto">
                        {results.map((r, i) => (
                            <div key={i} className={`px-3 py-2 flex items-center gap-3 ${r.ok ? "bg-green-50" : "bg-red-50"}`}>
                                <span className={`text-xs font-black ${r.ok ? "text-green-600" : "text-red-600"}`}>
                                    {r.ok ? "✓" : "✗"}
                                </span>
                                <span className="text-xs font-bold text-black flex-1 line-clamp-1">{r.q}</span>
                                {r.err && <span className="text-xs text-red-600 font-medium">{r.err}</span>}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-2 border-t-2 border-black">
                <button type="button" onClick={onClose}
                    className="px-5 py-2.5 border-2 border-black bg-white font-black text-sm hover:shadow-[2px_2px_0_#000] transition-all">
                    {results.length > 0 && okCount > 0 ? "Done" : "Cancel"}
                </button>
                {results.length === 0 && (
                    <button type="button" onClick={handleImport} disabled={importing || parsed.length === 0}
                        className="px-5 py-2.5 border-2 border-black bg-blue-500 text-white font-black text-sm hover:shadow-[4px_4px_0_#000] transition-all disabled:opacity-50 flex items-center gap-2">
                        <Zap size={16} />
                        {importing ? `Importing ${parsed.length}...` : `Import ${parsed.length} Questions`}
                    </button>
                )}
                {results.length > 0 && failCount > 0 && (
                    <button type="button" onClick={() => { setResults([]); }}
                        className="px-5 py-2.5 border-2 border-black bg-orange-400 font-black text-sm hover:shadow-[2px_2px_0_#000] transition-all">
                        Retry Failed
                    </button>
                )}
            </div>
        </div>
    );
}
