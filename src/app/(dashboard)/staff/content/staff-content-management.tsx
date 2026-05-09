"use client";

import { useState, useEffect, useCallback } from "react";
import {
  BookOpen, Plus, Edit2, Trash2, Eye, EyeOff, Search,
  X, Check, RefreshCw, Image as ImageIcon,
  Globe, Volume2, HelpCircle, Star, Clock, Layers
} from "lucide-react";

const CATEGORIES = [
  { slug: "road-sign",             titleEn: "Traffic Signs",          titleKm: "សញ្ញាផ្លូវវិថី",      color: "#eab308" },
  { slug: "road-traffic",          titleEn: "Road Traffic Law",       titleKm: "ច្បាប់ចរាចរ",          color: "#3b82f6" },
  { slug: "priority",              titleEn: "Right of Way",           titleKm: "សិទ្ធិដំណើរ",          color: "#22c55e" },
  { slug: "driving",               titleEn: "Driving Skills",         titleKm: "ជំនាញបើកបរ",           color: "#06b6d4" },
  { slug: "technical",             titleEn: "Vehicle Technology",     titleKm: "បច្ចេកវិទ្យាយានយន្ត",  color: "#8b5cf6" },
  { slug: "loading-people-goods",  titleEn: "Loading People & Goods", titleKm: "ការដឹកអ្នកដំណើរ",      color: "#f59e0b" },
  { slug: "general-knowledge",     titleEn: "General Knowledge",      titleKm: "ចំណេះដឹងទូទៅ",         color: "#ef4444" },
  { slug: "emergency",             titleEn: "Emergency",              titleKm: "ជំនួយបន្ទាន់",          color: "#dc2626" },
];

interface ContentItem {
  id: number;
  categoryId: number;
  type: string;
  titleEn: string;
  titleKm: string;
  descriptionEn: string;
  descriptionKm: string;
  imageUrl: string | null;
  audioUrlEn: string | null;
  audioUrlKm: string | null;
  questionEn: string;
  questionKm: string;
  answerEn: string;
  answerKm: string;
  scorePoints: number;
  timeLimit: number;
  difficulty: string | null;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

const EMPTY_FORM: Omit<ContentItem, "id" | "createdAt" | "updatedAt"> = {
  categoryId: 1,
  type: "sign",
  titleEn: "",
  titleKm: "",
  descriptionEn: "",
  descriptionKm: "",
  imageUrl: "",
  audioUrlEn: "",
  audioUrlKm: "",
  questionEn: "",
  questionKm: "",
  answerEn: "",
  answerKm: "",
  scorePoints: 10,
  timeLimit: 30,
  difficulty: "medium",
  sortOrder: 0,
  isActive: false,
};

// ── Form Modal ────────────────────────────────────────────────────────────────
function ContentForm({
  initial,
  onSave,
  onClose,
  saving,
}: {
  initial: Partial<ContentItem>;
  onSave: (data: Omit<ContentItem, "id" | "createdAt" | "updatedAt">) => void;
  onClose: () => void;
  saving: boolean;
}) {
  const [form, setForm] = useState({ ...EMPTY_FORM, ...initial });
  const set = (k: string, v: unknown) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="bg-white w-full max-w-3xl max-h-[90vh] overflow-y-auto" style={{ border: "3px solid #000", boxShadow: "8px 8px 0 #000" }}>
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 sticky top-0 z-10" style={{ background: "#000", borderBottom: "3px solid #000" }}>
          <span className="font-black text-sm uppercase tracking-widest" style={{ color: "#FFEE00" }}>
            {initial.id ? "EDIT CONTENT ITEM" : "NEW CONTENT ITEM"}
          </span>
          <button onClick={onClose} style={{ color: "#FFEE00" }}><X className="w-5 h-5" /></button>
        </div>

        <div className="p-5 space-y-5">
          {/* Category + Type + Difficulty row */}
          <div className="grid grid-cols-3 gap-3">
            <label className="flex flex-col gap-1">
              <span className="text-[10px] font-black uppercase">Category</span>
              <select value={form.categoryId} onChange={(e) => set("categoryId", Number(e.target.value))}
                className="border-2 border-black px-2 py-1.5 text-sm font-bold focus:outline-none">
                {CATEGORIES.map((c, i) => <option key={c.slug} value={i + 1}>{c.titleEn}</option>)}
              </select>
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-[10px] font-black uppercase">Type</span>
              <select value={form.type} onChange={(e) => set("type", e.target.value)}
                className="border-2 border-black px-2 py-1.5 text-sm font-bold focus:outline-none">
                {["sign","rule","skill","fact","warning","procedure"].map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-[10px] font-black uppercase">Difficulty</span>
              <select value={form.difficulty ?? "medium"} onChange={(e) => set("difficulty", e.target.value)}
                className="border-2 border-black px-2 py-1.5 text-sm font-bold focus:outline-none">
                {["easy","medium","hard"].map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </label>
          </div>

          {/* Titles */}
          <div className="grid grid-cols-2 gap-3">
            <label className="flex flex-col gap-1">
              <span className="text-[10px] font-black uppercase flex items-center gap-1"><Globe className="w-3 h-3"/>Title (English)</span>
              <input value={form.titleEn} onChange={(e) => set("titleEn", e.target.value)}
                className="border-2 border-black px-3 py-1.5 text-sm font-bold focus:outline-none" placeholder="English title" />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-[10px] font-black uppercase flex items-center gap-1"><Globe className="w-3 h-3"/>Title (Khmer)</span>
              <input value={form.titleKm} onChange={(e) => set("titleKm", e.target.value)}
                className="border-2 border-black px-3 py-1.5 text-sm font-bold focus:outline-none" placeholder="ចំណងជើងខ្មែរ" />
            </label>
          </div>

          {/* Descriptions */}
          <div className="grid grid-cols-2 gap-3">
            <label className="flex flex-col gap-1">
              <span className="text-[10px] font-black uppercase">Description (EN)</span>
              <textarea value={form.descriptionEn} onChange={(e) => set("descriptionEn", e.target.value)} rows={3}
                className="border-2 border-black px-3 py-1.5 text-sm font-bold focus:outline-none resize-none" placeholder="English description" />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-[10px] font-black uppercase">Description (KH)</span>
              <textarea value={form.descriptionKm} onChange={(e) => set("descriptionKm", e.target.value)} rows={3}
                className="border-2 border-black px-3 py-1.5 text-sm font-bold focus:outline-none resize-none" placeholder="ការពិពណ៌នាខ្មែរ" />
            </label>
          </div>

          {/* Image URL */}
          <label className="flex flex-col gap-1">
            <span className="text-[10px] font-black uppercase flex items-center gap-1"><ImageIcon className="w-3 h-3"/>Image URL</span>
            <input value={form.imageUrl ?? ""} onChange={(e) => set("imageUrl", e.target.value)}
              className="border-2 border-black px-3 py-1.5 text-sm font-mono focus:outline-none" placeholder="https://res.cloudinary.com/..." />
            {form.imageUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={form.imageUrl} alt="preview" className="mt-1 h-24 object-contain border-2 border-black" />
            )}
          </label>

          {/* Audio URLs */}
          <div className="grid grid-cols-2 gap-3">
            <label className="flex flex-col gap-1">
              <span className="text-[10px] font-black uppercase flex items-center gap-1"><Volume2 className="w-3 h-3"/>Audio URL (EN)</span>
              <input value={form.audioUrlEn ?? ""} onChange={(e) => set("audioUrlEn", e.target.value)}
                className="border-2 border-black px-3 py-1.5 text-sm font-mono focus:outline-none" placeholder="https://..." />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-[10px] font-black uppercase flex items-center gap-1"><Volume2 className="w-3 h-3"/>Audio URL (KH)</span>
              <input value={form.audioUrlKm ?? ""} onChange={(e) => set("audioUrlKm", e.target.value)}
                className="border-2 border-black px-3 py-1.5 text-sm font-mono focus:outline-none" placeholder="https://..." />
            </label>
          </div>

          {/* Q&A */}
          <div className="grid grid-cols-2 gap-3">
            <label className="flex flex-col gap-1">
              <span className="text-[10px] font-black uppercase flex items-center gap-1"><HelpCircle className="w-3 h-3"/>Question (EN)</span>
              <textarea value={form.questionEn} onChange={(e) => set("questionEn", e.target.value)} rows={2}
                className="border-2 border-black px-3 py-1.5 text-sm font-bold focus:outline-none resize-none" />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-[10px] font-black uppercase flex items-center gap-1"><HelpCircle className="w-3 h-3"/>Question (KH)</span>
              <textarea value={form.questionKm} onChange={(e) => set("questionKm", e.target.value)} rows={2}
                className="border-2 border-black px-3 py-1.5 text-sm font-bold focus:outline-none resize-none" />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-[10px] font-black uppercase">Answer (EN)</span>
              <textarea value={form.answerEn} onChange={(e) => set("answerEn", e.target.value)} rows={2}
                className="border-2 border-black px-3 py-1.5 text-sm font-bold focus:outline-none resize-none" />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-[10px] font-black uppercase">Answer (KH)</span>
              <textarea value={form.answerKm} onChange={(e) => set("answerKm", e.target.value)} rows={2}
                className="border-2 border-black px-3 py-1.5 text-sm font-bold focus:outline-none resize-none" />
            </label>
          </div>

          {/* Score / Time / Sort */}
          <div className="grid grid-cols-3 gap-3">
            <label className="flex flex-col gap-1">
              <span className="text-[10px] font-black uppercase flex items-center gap-1"><Star className="w-3 h-3"/>Score Points</span>
              <input type="number" value={form.scorePoints} onChange={(e) => set("scorePoints", Number(e.target.value))}
                className="border-2 border-black px-3 py-1.5 text-sm font-bold focus:outline-none" />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-[10px] font-black uppercase flex items-center gap-1"><Clock className="w-3 h-3"/>Time Limit (s)</span>
              <input type="number" value={form.timeLimit} onChange={(e) => set("timeLimit", Number(e.target.value))}
                className="border-2 border-black px-3 py-1.5 text-sm font-bold focus:outline-none" />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-[10px] font-black uppercase flex items-center gap-1"><Layers className="w-3 h-3"/>Sort Order</span>
              <input type="number" value={form.sortOrder} onChange={(e) => set("sortOrder", Number(e.target.value))}
                className="border-2 border-black px-3 py-1.5 text-sm font-bold focus:outline-none" />
            </label>
          </div>

          {/* Active toggle */}
          <label className="flex items-center gap-3 cursor-pointer">
            <div
              onClick={() => set("isActive", !form.isActive)}
              className="w-10 h-5 border-2 border-black relative transition-colors"
              style={{ background: form.isActive ? "#22c55e" : "#e5e7eb" }}
            >
              <div className="absolute top-0 w-4 h-4 border-2 border-black bg-white transition-all"
                style={{ left: form.isActive ? "calc(100% - 18px)" : "0px" }} />
            </div>
            <span className="text-sm font-black uppercase">{form.isActive ? "ACTIVE — visible to users" : "DRAFT — hidden from users"}</span>
          </label>

          {/* Actions */}
          <div className="flex gap-3 pt-2" style={{ borderTop: "2px solid #000" }}>
            <button onClick={() => onSave(form)} disabled={saving || !form.titleEn}
              className="flex items-center gap-2 px-5 py-2 font-black text-sm uppercase disabled:opacity-50"
              style={{ background: "#000", color: "#FFEE00", border: "2px solid #000" }}>
              {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
              {saving ? "SAVING..." : "SAVE"}
            </button>
            <button onClick={onClose} className="px-5 py-2 font-black text-sm uppercase"
              style={{ background: "#fff", border: "2px solid #000" }}>CANCEL</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export function StaffContentManagement() {
  const [selectedCat, setSelectedCat] = useState(CATEGORIES[0]);
  const [items, setItems] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [filterActive, setFilterActive] = useState<"all" | "active" | "draft">("all");
  const [editItem, setEditItem] = useState<Partial<ContentItem> | null>(null);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const loadItems = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/staff/content?category=${selectedCat.slug}`);
      const data = await res.json();
      setItems(data.items ?? []);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [selectedCat.slug]);

  useEffect(() => { loadItems(); }, [loadItems]);

  const handleSave = async (form: Omit<ContentItem, "id" | "createdAt" | "updatedAt">) => {
    setSaving(true);
    try {
      const isEdit = editItem?.id;
      const res = await fetch(`/api/staff/content${isEdit ? `/${isEdit}` : ""}`, {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, categorySlug: selectedCat.slug }),
      });
      if (!res.ok) throw new Error("Failed");
      showToast(isEdit ? "Item updated" : "Item created");
      setEditItem(null);
      loadItems();
    } catch {
      showToast("Error saving item");
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (item: ContentItem) => {
    try {
      await fetch(`/api/staff/content/${item.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !item.isActive }),
      });
      setItems((prev) => prev.map((i) => i.id === item.id ? { ...i, isActive: !i.isActive } : i));
    } catch { showToast("Error updating"); }
  };

  const handleDelete = async (id: number) => {
    try {
      await fetch(`/api/staff/content/${id}`, { method: "DELETE" });
      setItems((prev) => prev.filter((i) => i.id !== id));
      setDeleteConfirm(null);
      showToast("Item deleted");
    } catch { showToast("Error deleting"); }
  };

  const filtered = items.filter((i) => {
    const matchSearch = !search || i.titleEn.toLowerCase().includes(search.toLowerCase()) || i.titleKm.includes(search);
    const matchActive = filterActive === "all" || (filterActive === "active" ? i.isActive : !i.isActive);
    return matchSearch && matchActive;
  });

  const activeCount = items.filter((i) => i.isActive).length;

  return (
    <div className="flex h-[calc(100vh-120px)] gap-0" style={{ fontFamily: "'Arial Black', Arial, sans-serif" }}>

      {/* Category Sidebar */}
      <div className="w-52 flex-shrink-0 flex flex-col" style={{ border: "2px solid #000", borderRight: "none", background: "#fff" }}>
        <div className="px-3 py-2" style={{ background: "#000", borderBottom: "2px solid #000" }}>
          <span className="font-black text-[11px] uppercase tracking-widest" style={{ color: "#FFEE00" }}>CATEGORIES</span>
        </div>
        <div className="flex-1 overflow-y-auto">
          {CATEGORIES.map((cat) => (
            <button key={cat.slug} onClick={() => setSelectedCat(cat)}
              className="w-full flex items-center gap-2 px-3 py-2.5 text-left text-[11px] font-black uppercase transition-colors"
              style={{ background: selectedCat.slug === cat.slug ? cat.color : "#fff", borderBottom: "1px solid #000" }}>
              <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: cat.color, border: "1px solid #000" }} />
              <span className="truncate">{cat.titleEn}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Panel */}
      <div className="flex-1 flex flex-col min-w-0" style={{ border: "2px solid #000", background: "#f9f9f9" }}>

        {/* Toolbar */}
        <div className="flex items-center gap-2 px-3 py-2 flex-wrap" style={{ background: "#fff", borderBottom: "2px solid #000" }}>
          <div className="flex items-center gap-1 px-3 py-1" style={{ background: selectedCat.color, border: "2px solid #000" }}>
            <BookOpen className="w-3 h-3" />
            <span className="font-black text-[11px] uppercase">{selectedCat.titleEn}</span>
          </div>

          <div className="relative">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search..."
              className="pl-7 pr-3 py-1.5 text-[11px] font-bold focus:outline-none w-40"
              style={{ border: "2px solid #000" }} />
          </div>

          {/* Filter tabs */}
          {(["all", "active", "draft"] as const).map((f) => (
            <button key={f} onClick={() => setFilterActive(f)}
              className="px-3 py-1.5 text-[10px] font-black uppercase"
              style={{ background: filterActive === f ? "#000" : "#fff", color: filterActive === f ? "#FFEE00" : "#000", border: "2px solid #000" }}>
              {f} {f === "active" ? `(${activeCount})` : f === "draft" ? `(${items.length - activeCount})` : `(${items.length})`}
            </button>
          ))}

          <button onClick={() => setEditItem({})}
            className="ml-auto flex items-center gap-1 px-3 py-1.5 text-[11px] font-black uppercase"
            style={{ background: "#FFEE00", border: "2px solid #000" }}>
            <Plus className="w-3 h-3" /> NEW ITEM
          </button>
          <button onClick={loadItems} disabled={loading}
            className="flex items-center gap-1 px-3 py-1.5 text-[11px] font-black uppercase"
            style={{ background: "#000", color: "#FFEE00", border: "2px solid #000" }}>
            <RefreshCw className={`w-3 h-3 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>

        {/* Table */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center h-40">
              <RefreshCw className="w-6 h-6 animate-spin text-gray-400" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 gap-2">
              <BookOpen className="w-10 h-10 text-gray-300" />
              <p className="text-[11px] font-black uppercase text-gray-400">No items found</p>
              <button onClick={() => setEditItem({})}
                className="flex items-center gap-1 px-3 py-1.5 text-[11px] font-black uppercase"
                style={{ background: "#FFEE00", border: "2px solid #000" }}>
                <Plus className="w-3 h-3" /> ADD FIRST ITEM
              </button>
            </div>
          ) : (
            <table className="w-full text-[11px]" style={{ borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "#000", color: "#FFEE00" }}>
                  {["#", "TITLE EN", "TITLE KH", "TYPE", "DIFFICULTY", "SCORE", "STATUS", "ACTIONS"].map((h) => (
                    <th key={h} className="px-3 py-2 text-left font-black uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((item, idx) => (
                  <tr key={item.id} style={{ borderBottom: "1px solid #000", background: idx % 2 === 0 ? "#fff" : "#fafafa" }}>
                    <td className="px-3 py-2 font-bold text-gray-400">{item.sortOrder || idx + 1}</td>
                    <td className="px-3 py-2 font-black max-w-[160px] truncate" title={item.titleEn}>{item.titleEn || "—"}</td>
                    <td className="px-3 py-2 font-bold max-w-[140px] truncate" title={item.titleKm}>{item.titleKm || "—"}</td>
                    <td className="px-3 py-2">
                      <span className="px-1.5 py-0.5 font-black uppercase" style={{ background: "#e5e7eb", border: "1px solid #000" }}>{item.type}</span>
                    </td>
                    <td className="px-3 py-2">
                      <span className="px-1.5 py-0.5 font-black uppercase" style={{
                        background: item.difficulty === "easy" ? "#bbf7d0" : item.difficulty === "hard" ? "#fecaca" : "#fef9c3",
                        border: "1px solid #000"
                      }}>{item.difficulty ?? "—"}</span>
                    </td>
                    <td className="px-3 py-2 font-bold">{item.scorePoints}pt</td>
                    <td className="px-3 py-2">
                      <button onClick={() => handleToggleActive(item)}
                        className="flex items-center gap-1 px-2 py-0.5 font-black uppercase text-[10px]"
                        style={{ background: item.isActive ? "#22c55e" : "#e5e7eb", border: "1px solid #000" }}>
                        {item.isActive ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                        {item.isActive ? "LIVE" : "DRAFT"}
                      </button>
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex items-center gap-1">
                        <button onClick={() => setEditItem(item)}
                          className="p-1 hover:bg-yellow-100" style={{ border: "1px solid #000" }} title="Edit">
                          <Edit2 className="w-3 h-3" />
                        </button>
                        {deleteConfirm === item.id ? (
                          <>
                            <button onClick={() => handleDelete(item.id)}
                              className="p-1 font-black text-[9px] uppercase" style={{ background: "#ef4444", color: "#fff", border: "1px solid #000" }}>YES</button>
                            <button onClick={() => setDeleteConfirm(null)}
                              className="p-1 font-black text-[9px] uppercase" style={{ border: "1px solid #000" }}>NO</button>
                          </>
                        ) : (
                          <button onClick={() => setDeleteConfirm(item.id)}
                            className="p-1 hover:bg-red-100" style={{ border: "1px solid #000" }} title="Delete">
                            <Trash2 className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Footer stats */}
        <div className="px-3 py-1.5 flex items-center gap-4 text-[10px] font-bold" style={{ background: "#fff", borderTop: "2px solid #000" }}>
          <span>{filtered.length} shown</span>
          <span style={{ color: "#22c55e" }}>{activeCount} active</span>
          <span style={{ color: "#6b7280" }}>{items.length - activeCount} draft</span>
        </div>
      </div>

      {/* Form Modal */}
      {editItem !== null && (
        <ContentForm initial={editItem} onSave={handleSave} onClose={() => setEditItem(null)} saving={saving} />
      )}

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-2 font-black text-sm uppercase"
          style={{ background: "#000", color: "#FFEE00", border: "2px solid #FFEE00", boxShadow: "4px 4px 0 #FFEE00" }}>
          {toast}
        </div>
      )}
    </div>
  );
}
