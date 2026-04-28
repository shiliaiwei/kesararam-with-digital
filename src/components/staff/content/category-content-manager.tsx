"use client";
import { useState, useEffect, useMemo, useCallback } from "react";
import { Plus, Search, Edit, Trash2, Send, Globe, Clock, FileText, XCircle, CheckCircle, Image as ImageIcon, Music, RefreshCw, HelpCircle, ChevronDown, ChevronUp, Circle, Save, X, Loader2 } from "lucide-react";
import { TopicFormModal } from "./topic-form-modal";
import { useToast } from "@/components/ui/toast-container";

interface Topic { id: number; topicCode: string; topic_code: string; nameEn: string; name_en: string; nameKm: string; name_km: string; status: string; questionCount?: number; question_count?: number; createdAt: string; created_at: string; updatedAt: string; updated_at: string; subGroup: string | null; sub_group: string | null; createdBy: number; created_by: number; primaryImageUrl?: string | null; primary_image_url?: string | null; audioUrlEn?: string | null; audio_url_en?: string | null; rejectionReason?: string | null; rejection_reason?: string | null; descriptionEn?: string; description_en?: string; descriptionKm?: string; description_km?: string; lawReference?: string | null; law_reference?: string | null; audioUrlKm?: string | null; audio_url_km?: string | null; audioSourceEn?: string; audio_source_en?: string; audioSourceKm?: string; audio_source_km?: string; primaryImageSource?: string; primary_image_source?: string; categoryId?: number; category_id?: number; }
interface Answer { id?: number; answerEn: string; answerKm: string; isCorrect: boolean; imageUrl: string; }
interface Question { id: number; question_en: string; question_km: string; hint_en: string | null; image_url: string | null; difficulty: string; answers: Answer[]; }
interface CategoryContentManagerProps { categoryId: number; categoryName: string; categorySlug: string; requiresImage?: boolean; requiresAudio?: boolean; }

const SUB_GROUPS: Record<string, string[]> = { "road-sign": ["Arrows Markings", "Buildup Area Boundary Signs", "Direction Signs", "Informative Signs", "Longitudinal Markings", "Mandatory Signs", "Other Road Markings", "Priority Signs", "Prohibitory Signs", "Sign Posts", "Street Name Signs", "Supplementary Signs", "Temporary Signs", "Traffic Lights", "Traffic Police Signals", "Transverse Markings", "Warning Signs"], "road-traffic": ["Traffic Rules","Speed Limits","Parking","Overtaking"], "priority": ["Intersections","Roundabouts","Pedestrian Crossings"], "driving": ["Basic Maneuvers","Advanced Techniques","Defensive Driving"], "technical": ["Engine","Brakes","Lights","Safety Systems"], "loading-people-goods": ["Weight Limits","Passenger Safety","Cargo Securing"], "general-knowledge": ["Road Safety","Environmental","Legal"], "emergency": ["Accidents","Breakdowns","First Aid","Emergency Contacts"] };
const S_ICON: Record<string, React.ReactNode> = { published: <Globe size={11} className="text-blue-600" />, pending: <Clock size={11} className="text-yellow-600" />, approved: <CheckCircle size={11} className="text-green-600" />, draft: <FileText size={11} className="text-gray-500" />, rejected: <XCircle size={11} className="text-red-600" /> };
const S_STYLE: Record<string, string> = { published: "bg-blue-100 text-blue-800 border border-blue-300", pending: "bg-yellow-100 text-yellow-800 border border-yellow-300", approved: "bg-green-100 text-green-800 border border-green-300", draft: "bg-gray-100 text-gray-700 border border-gray-300", rejected: "bg-red-100 text-red-800 border border-red-300" };
const S_LABEL: Record<string, string> = { published: "Public", pending: "Review", approved: "Approved", draft: "Draft", rejected: "Rejected" };
const ALL_ST = ["published", "pending", "approved", "draft", "rejected"] as const;
const BLANK = (): Answer => ({ answerEn: "", answerKm: "", isCorrect: false, imageUrl: "" });
const DIFF_C: Record<string, string> = { easy: "bg-green-100 text-green-800 border-green-300", medium: "bg-yellow-100 text-yellow-800 border-yellow-300", hard: "bg-red-100 text-red-800 border-red-300" };

function QuestionForm({ topicId, initial, onSave, onCancel }: { topicId: number; initial?: Question; onSave: () => void; onCancel: () => void; }) {
  const [qEn, setQEn] = useState(initial?.question_en ?? "");
  const [qKm, setQKm] = useState(initial?.question_km ?? "");
  const [imgUrl, setImgUrl] = useState(initial?.image_url ?? "");
  const [diff, setDiff] = useState(initial?.difficulty ?? "medium");
  const [answers, setAnswers] = useState<Answer[]>(initial?.answers?.length ? initial.answers.map(a => ({ id: a.id, answerEn: a.answerEn, answerKm: a.answerKm, isCorrect: a.isCorrect, imageUrl: a.imageUrl ?? "" })) : [BLANK(), BLANK(), BLANK(), BLANK()]);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");
  const upd = (i: number, f: keyof Answer, v: string | boolean) => setAnswers(p => p.map((a, idx) => idx === i ? { ...a, [f]: v } : a));
  const save = async () => {
    if (!qEn.trim()) { setErr("Question (English) is required"); return; }
    const valid = answers.filter(a => a.answerEn.trim());
    if (valid.length < 2) { setErr("At least 2 answers required"); return; }
    if (!valid.some(a => a.isCorrect)) { setErr("Mark at least one correct answer"); return; }
    setSaving(true); setErr("");
    try {
      const url = initial ? `/api/staff/topics/${topicId}/questions/${initial.id}` : `/api/staff/topics/${topicId}/questions`;
      const res = await fetch(url, { method: initial ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ questionEn: qEn.trim(), questionKm: qKm.trim(), imageUrl: imgUrl.trim() || null, difficulty: diff, answers: valid }) });
      if (res.ok) onSave(); else { const d = await res.json(); setErr(d.error || "Failed"); }
    } catch { setErr("Network error"); } finally { setSaving(false); }
  };
  return (
    <div className="border-2 border-black bg-white p-4 space-y-3 mx-2 my-2" style={{ boxShadow: "3px 3px 0 #000" }}>
      <div className="flex items-center justify-between">
        <span className="font-black text-xs uppercase">{initial ? "Edit Question" : "New Question"}</span>
        <button onClick={onCancel} className="p-1 border border-black hover:bg-gray-100"><X size={12} /></button>
      </div>
      {err && <div className="bg-red-50 border border-red-400 px-3 py-1.5 text-xs font-bold text-red-700">{err}</div>}
      <div className="grid grid-cols-2 gap-2">
        <textarea value={qEn} onChange={e => setQEn(e.target.value)} rows={2} className="border-2 border-black px-2 py-1.5 text-sm focus:outline-none resize-none" placeholder="Question (English) *" />
        <textarea value={qKm} onChange={e => setQKm(e.target.value)} rows={2} className="border-2 border-black px-2 py-1.5 text-sm focus:outline-none resize-none" placeholder="Question (Khmer)" />
      </div>
      <div className="grid grid-cols-3 gap-2">
        <select value={diff} onChange={e => setDiff(e.target.value)} className="border-2 border-black px-2 py-1.5 text-sm font-bold bg-white focus:outline-none">
          <option value="easy">Easy</option><option value="medium">Medium</option><option value="hard">Hard</option>
        </select>
        <input value={imgUrl} onChange={e => setImgUrl(e.target.value)} className="col-span-2 border-2 border-black px-2 py-1.5 text-sm focus:outline-none" placeholder="Image URL — shown above answers (use for Image Pick questions)" />
      </div>
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-black uppercase">Answers — tick correct one(s)</span>
          {answers.length < 6 && <button onClick={() => setAnswers(p => [...p, BLANK()])} className="text-[10px] font-black border border-black px-2 py-0.5 bg-green-100 hover:bg-green-200 inline-flex items-center gap-1"><Plus size={10} /> Add</button>}
        </div>
        {answers.map((a, i) => (
          <div key={i} className="flex items-center gap-1.5">
            <button onClick={() => upd(i, "isCorrect", !a.isCorrect)} className={`w-6 h-6 shrink-0 border-2 border-black flex items-center justify-center ${a.isCorrect ? "bg-green-400" : "bg-white"}`}>
              {a.isCorrect ? <CheckCircle size={12} /> : <Circle size={12} />}
            </button>
            <input value={a.answerEn} onChange={e => upd(i, "answerEn", e.target.value)} className="flex-1 border-2 border-black px-2 py-1 text-sm focus:outline-none" placeholder={`Answer ${i + 1} (EN)`} />
            <input value={a.answerKm} onChange={e => upd(i, "answerKm", e.target.value)} className="flex-1 border-2 border-black px-2 py-1 text-sm focus:outline-none" placeholder={`Answer ${i + 1} (KM)`} />
            {answers.length > 2 && <button onClick={() => setAnswers(p => p.filter((_, idx) => idx !== i))} className="p-1 border border-black hover:bg-red-100"><X size={11} /></button>}
          </div>
        ))}
        <p className="text-[10px] text-zinc-400">2 answers = True/False | 4 answers = MCQ | image answers = Image Pick</p>
      </div>
      <div className="flex justify-end gap-2 pt-1 border-t border-black">
        <button onClick={onCancel} className="px-3 py-1.5 border-2 border-black text-xs font-black hover:bg-gray-100">Cancel</button>
        <button onClick={save} disabled={saving} className="px-3 py-1.5 border-2 border-black bg-green-400 text-xs font-black hover:shadow-[2px_2px_0_#000] disabled:opacity-50 inline-flex items-center gap-1.5">
          {saving ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />}
          {saving ? "Saving..." : "Save Question"}
        </button>
      </div>
    </div>
  );
}

function QuestionsPanel({ topicId, topicStatus, isStaff = true }: { topicId: number; topicStatus: string; isStaff?: boolean }) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [delConfirm, setDelConfirm] = useState<number | null>(null);
  const load = useCallback(async () => { setLoading(true); try { const res = await fetch(`/api/staff/topics/${topicId}/questions`); const d = await res.json(); setQuestions(d.questions || []); } catch { } finally { setLoading(false); } }, [topicId]);
  useEffect(() => { load(); }, [load]);
  const del = async (qid: number) => { await fetch(`/api/staff/topics/${topicId}/questions/${qid}`, { method: "DELETE" }); setDelConfirm(null); load(); };
  const canEdit = topicStatus !== "pending" && !isStaff; // Only admin can edit questions
  
  return (
    <div className="border-t-2 border-black bg-zinc-50">
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-zinc-200">
        <span className="font-black text-xs uppercase flex items-center gap-1.5 text-purple-800"><HelpCircle size={13} className="text-purple-600" /> Questions ({questions.length})</span>
        {canEdit && !showCreate && <button onClick={() => setShowCreate(true)} className="bg-purple-500 text-white border-2 border-black px-3 py-1 text-[10px] font-black hover:shadow-[2px_2px_0_#000] inline-flex items-center gap-1"><Plus size={11} /> Add Question</button>}
      </div>
      {isStaff && <p className="text-[10px] font-bold text-blue-700 bg-blue-50 border-b border-blue-200 px-4 py-1.5">Questions can only be added by administrators. Submit your topic for review first.</p>}
      {topicStatus === "pending" && <p className="text-[10px] font-bold text-yellow-700 bg-yellow-50 border-b border-yellow-200 px-4 py-1.5">Under review — questions are read-only until admin decision.</p>}
      {showCreate && <QuestionForm topicId={topicId} onSave={() => { setShowCreate(false); load(); }} onCancel={() => setShowCreate(false)} />}
      <div className="p-3 space-y-1.5">
        {loading ? <p className="text-xs text-zinc-400 font-bold py-3 text-center">Loading questions...</p>
        : questions.length === 0 && !showCreate ? (
          <div className="text-center py-6 border-2 border-dashed border-purple-200">
            <p className="text-xs font-bold text-zinc-500 mb-2">No questions yet for this topic</p>
            {canEdit && <button onClick={() => setShowCreate(true)} className="bg-purple-500 text-white border-2 border-black px-4 py-1.5 text-xs font-black hover:shadow-[2px_2px_0_#000] inline-flex items-center gap-1.5"><Plus size={12} /> Create First Question</button>}
          </div>
        ) : questions.map((q, idx) => (
          <div key={q.id} className="border-2 border-black bg-white">
            {editingId === q.id ? <QuestionForm topicId={topicId} initial={q} onSave={() => { setEditingId(null); load(); }} onCancel={() => setEditingId(null)} /> : (
              <>
                <div className="flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-purple-50" onClick={() => setExpandedId(expandedId === q.id ? null : q.id)}>
                  <span className="w-5 h-5 shrink-0 bg-purple-600 text-white text-[10px] font-black flex items-center justify-center">{idx + 1}</span>
                  <div className="flex-1 min-w-0"><p className="text-sm font-bold truncate">{q.question_en}</p>{q.question_km && <p className="text-[10px] text-zinc-500 truncate">{q.question_km}</p>}</div>
                  <span className={`px-1.5 py-0.5 text-[10px] font-black border ${DIFF_C[q.difficulty] ?? DIFF_C.medium}`}>{q.difficulty}</span>
                  <span className="text-[10px] text-zinc-400 font-bold shrink-0">{q.answers?.length ?? 0} ans</span>
                  {expandedId === q.id ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                </div>
                {expandedId === q.id && (
                  <div className="border-t-2 border-black px-3 py-2 bg-gray-50 space-y-2">
                    {q.image_url && <img src={q.image_url} alt="" className="h-20 object-contain border border-black" />}
                    <div className="grid grid-cols-2 gap-1.5">
                      {q.answers?.map((a, ai) => (
                        <div key={ai} className={`flex items-center gap-1.5 px-2 py-1.5 border-2 text-xs font-bold ${a.isCorrect ? "border-green-500 bg-green-50 text-green-900" : "border-zinc-300 bg-white text-zinc-600"}`}>
                          {a.isCorrect ? <CheckCircle size={11} className="text-green-600 shrink-0" /> : <Circle size={11} className="text-zinc-400 shrink-0" />}
                          <span className="truncate">{a.answerEn}</span>
                        </div>
                      ))}
                    </div>
                    {q.hint_en && <p className="text-[10px] text-zinc-500 italic">Hint: {q.hint_en}</p>}
                    {canEdit && (
                      <div className="flex gap-1.5 pt-1">
                        <button onClick={() => { setEditingId(q.id); setExpandedId(null); }} className="px-2.5 py-1 border-2 border-black bg-yellow-100 hover:bg-yellow-200 text-[10px] font-black inline-flex items-center gap-1"><Edit size={11} /> Edit</button>
                        {delConfirm === q.id ? (<><button onClick={() => del(q.id)} className="px-2.5 py-1 border-2 border-black bg-red-500 text-white text-[10px] font-black">Confirm</button><button onClick={() => setDelConfirm(null)} className="px-2.5 py-1 border-2 border-black bg-white text-[10px] font-black">Cancel</button></>) : (<button onClick={() => setDelConfirm(q.id)} className="px-2.5 py-1 border-2 border-black bg-red-100 hover:bg-red-200 text-[10px] font-black inline-flex items-center gap-1"><Trash2 size={11} /> Delete</button>)}
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export function CategoryContentManager({ categoryId, categoryName, categorySlug, requiresImage = false, requiresAudio = false }: CategoryContentManagerProps) {
  const { showToast } = useToast();
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [subGroupFilter, setSubGroupFilter] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingTopic, setEditingTopic] = useState<Topic | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  const [expandedTopicId, setExpandedTopicId] = useState<number | null>(null);

  useEffect(() => { fetchTopics(); }, [categoryId]);

  const fetchTopics = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ categoryId: categoryId.toString(), scope: "all", limit: "500" });
      const res = await fetch(`/api/staff/topics?${params}`, { cache: "no-store" });
      const data = await res.json();
      setTopics((data.topics || []).sort((a: Topic, b: Topic) => a.id - b.id));
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  const stats = useMemo(() => { const s: Record<string, number> = { all: topics.length }; for (const st of ALL_ST) s[st] = topics.filter(t => t.status === st).length; return s; }, [topics]);
  const filtered = useMemo(() => topics.filter(t => { if (statusFilter !== "all" && t.status !== statusFilter) return false; const sg = t.subGroup || t.sub_group; if (subGroupFilter && sg !== subGroupFilter) return false; if (search.trim()) { const q = search.toLowerCase(); const ne = (t.nameEn || t.name_en || "").toLowerCase(); const tc = (t.topicCode || t.topic_code || "").toLowerCase(); const nk = (t.nameKm || t.name_km || "").toLowerCase(); return ne.includes(q) || tc.includes(q) || nk.includes(q); } return true; }), [topics, statusFilter, subGroupFilter, search]);

  const handleDelete = async (id: number) => { try { const res = await fetch(`/api/staff/topics/${id}`, { method: "DELETE" }); if (res.ok) { showToast("Deleted", "success"); setDeleteConfirm(null); fetchTopics(); } else { const d = await res.json(); showToast(d.error || "Failed", "error"); } } catch { showToast("Failed to delete", "error"); } };
  const handleSubmit = async (id: number) => { try { const res = await fetch(`/api/staff/topics/${id}/submit`, { method: "POST" }); if (res.ok) { showToast("Submitted for review", "success"); fetchTopics(); } else { const d = await res.json(); showToast(d.error || "Failed", "error"); } } catch { showToast("Failed to submit", "error"); } };
  const subGroups = SUB_GROUPS[categorySlug] || [];

  return (
    <div className="space-y-4">
      <div className="bg-white border-2 border-black p-5" style={{ boxShadow: "4px 4px 0 #000" }}>
        <div className="flex items-center justify-between mb-4">
          <div><h1 className="text-2xl font-black">{categoryName}</h1><p className="text-xs text-zinc-500 mt-0.5">Click the purple Questions button on any topic to manage its questions</p></div>
          <div className="flex gap-2">
            <button onClick={fetchTopics} className="p-2.5 border-2 border-black hover:bg-gray-100" title="Refresh"><RefreshCw size={16} /></button>
            <button onClick={() => setShowCreateModal(true)} className="bg-green-400 border-2 border-black px-4 py-2.5 font-black hover:shadow-[4px_4px_0_#000] transition-all inline-flex items-center gap-2 text-sm"><Plus size={16} /> New Topic</button>
          </div>
        </div>
        <div className="flex flex-wrap gap-1.5 mb-3">
          <button onClick={() => setStatusFilter("all")} className={`px-3 py-1.5 border-2 border-black text-xs font-black transition-all ${statusFilter === "all" ? "bg-black text-white" : "bg-white hover:bg-gray-100"}`}>All ({stats.all})</button>
          {ALL_ST.map(s => stats[s] > 0 && (<button key={s} onClick={() => setStatusFilter(statusFilter === s ? "all" : s)} className={`px-3 py-1.5 border-2 border-black text-xs font-black transition-all inline-flex items-center gap-1.5 ${statusFilter === s ? "shadow-[2px_2px_0_#000]" : ""} ${S_STYLE[s]}`}>{S_ICON[s]} {S_LABEL[s]} ({stats[s]})</button>))}
        </div>
        <div className="flex gap-2">
          <div className="flex-1 relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={15} /><input type="text" placeholder="Search by name or code..." value={search} onChange={e => setSearch(e.target.value)} className="w-full pl-9 pr-3 py-2 border-2 border-black text-sm font-medium focus:outline-none focus:shadow-[2px_2px_0_#000]" /></div>
          {subGroups.length > 0 && <select value={subGroupFilter} onChange={e => setSubGroupFilter(e.target.value)} className="px-3 py-2 border-2 border-black text-sm font-bold bg-white focus:outline-none min-w-[130px]"><option value="">All Types</option>{subGroups.map(sg => <option key={sg} value={sg}>{sg}</option>)}</select>}
        </div>
      </div>
      <div className="bg-white border-2 border-black overflow-hidden" style={{ boxShadow: "4px 4px 0 #000" }}>
        {loading ? (<div className="divide-y divide-gray-100">{[1,2,3].map(i => (<div key={i} className="p-4 flex gap-3 animate-pulse"><div className="w-12 h-12 bg-gray-100 shrink-0" /><div className="flex-1 space-y-2"><div className="h-4 bg-gray-100 w-2/3" /><div className="h-3 bg-gray-100 w-1/3" /></div></div>))}</div>)
        : filtered.length === 0 ? (<div className="p-12 text-center"><Globe size={40} className="mx-auto mb-3 text-zinc-300" /><p className="font-bold text-zinc-500 mb-4">No topics found</p><button onClick={() => setShowCreateModal(true)} className="bg-green-400 border-2 border-black px-5 py-2.5 font-black hover:shadow-[4px_4px_0_#000] transition-all inline-flex items-center gap-2 text-sm"><Plus size={16} /> Create Topic</button></div>)
        : (
          <div>
            {filtered.map(topic => (
              <div key={topic.id} className="border-b-2 border-black last:border-b-0">
                <div className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors">
                  {topic.status === "rejected" && (topic.rejectionReason || topic.rejection_reason) && (
                    <div className="absolute left-0 right-0 top-0 bg-red-500 text-white px-4 py-2 text-xs font-black flex items-center gap-2 z-10">
                      <XCircle size={14} />
                      <span>REJECTED:</span>
                      <span className="flex-1">{topic.rejectionReason || topic.rejection_reason}</span>
                    </div>
                  )}
                  <div className={`w-11 h-11 shrink-0 border border-gray-200 bg-gray-50 flex items-center justify-center overflow-hidden ${topic.status === "rejected" ? "mt-10" : ""}`}>{(topic.primaryImageUrl || topic.primary_image_url) ? <img src={(topic.primaryImageUrl || topic.primary_image_url) as string} alt="" className="w-full h-full object-cover" /> : <ImageIcon size={18} className="text-gray-300" />}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap"><span className="font-bold text-sm truncate">{topic.nameEn || topic.name_en}</span>{(topic.audioUrlEn || topic.audio_url_en) && <Music size={11} className="text-purple-400 shrink-0" />}</div>
                    <div className="flex items-center gap-2 mt-0.5"><span className="text-[10px] font-mono text-zinc-400">#{topic.id}</span>{(topic.subGroup || topic.sub_group) && <span className="text-[10px] text-zinc-500">{topic.subGroup || topic.sub_group}</span>}<span className="text-[10px] text-zinc-400">{topic.questionCount ?? topic.question_count ?? 0} Q</span></div>
                  </div>
                  <span className={`px-2 py-0.5 text-[10px] font-black uppercase inline-flex items-center gap-1 shrink-0 ${S_STYLE[topic.status]}`}>{S_ICON[topic.status]} {S_LABEL[topic.status]}</span>
                  <div className={`flex items-center gap-1.5 shrink-0 ${topic.status === "rejected" ? "mt-10" : ""}`}>
                    <button onClick={() => setExpandedTopicId(expandedTopicId === topic.id ? null : topic.id)} className={`px-2.5 py-1.5 border-2 border-black text-[10px] font-black inline-flex items-center gap-1 transition-all ${expandedTopicId === topic.id ? "bg-purple-600 text-white" : "bg-purple-100 hover:bg-purple-200 text-purple-800"}`}><HelpCircle size={12} /> Questions {expandedTopicId === topic.id ? <ChevronUp size={11} /> : <ChevronDown size={11} />}</button>
                    <button onClick={() => setEditingTopic(topic)} className="p-1.5 border-2 border-black hover:bg-yellow-100 transition-all" title="Edit Topic"><Edit size={14} /></button>
                    {(topic.status === "draft" || topic.status === "rejected") && <button onClick={() => handleSubmit(topic.id)} className="p-1.5 border-2 border-black bg-green-100 hover:bg-green-200 transition-all" title="Submit for review"><Send size={14} /></button>}
                    {(topic.status === "draft" || topic.status === "rejected") && (deleteConfirm === topic.id ? (<div className="flex gap-1"><button onClick={() => handleDelete(topic.id)} className="px-2 py-1 text-[10px] font-black bg-red-500 text-white border-2 border-black">Yes</button><button onClick={() => setDeleteConfirm(null)} className="px-2 py-1 text-[10px] font-black bg-white border-2 border-black">No</button></div>) : (<button onClick={() => setDeleteConfirm(topic.id)} className="p-1.5 border-2 border-black hover:bg-red-100 transition-all" title="Delete"><Trash2 size={14} /></button>))}
                  </div>
                </div>
                {expandedTopicId === topic.id && <QuestionsPanel topicId={topic.id} topicStatus={topic.status} isStaff={true} />}
              </div>
            ))}
          </div>
        )}
      </div>
      {(showCreateModal || editingTopic) && <TopicFormModal categoryId={categoryId} categorySlug={categorySlug} requiresImage={requiresImage} requiresAudio={requiresAudio} initialData={editingTopic} onClose={() => { setShowCreateModal(false); setEditingTopic(null); }} onSuccess={() => { setShowCreateModal(false); setEditingTopic(null); fetchTopics(); }} />}
    </div>
  );
}
