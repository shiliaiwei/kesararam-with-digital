"use client";

import { useState, useMemo } from "react";
import {
  Crown, Building2, Zap, Plus, Search, Filter,
  Clock, CheckCircle, XCircle, AlertTriangle, RefreshCw,
  ChevronDown, Shield, Users, BarChart3, Trash2, Edit3,
} from "lucide-react";
import { PLAN_DISPLAY, type PlanTier } from "@/lib/subscription-plans";

type SubStatus = "active" | "expired" | "cancelled" | "trial";

interface SubRow {
  id: number;
  userId: number;
  plan: string;
  status: string;
  isTrial: boolean;
  trialEndsAt: Date | string | null;
  startsAt: Date | string;
  endsAt: Date | string | null;
  note: string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
  userName: string | null;
  userEmail: string;
  userRole: string;
}

interface UserOption {
  id: number;
  displayName: string | null;
  email: string;
  role: string;
}

interface Props {
  initialRows: SubRow[];
  allUsers: UserOption[];
  adminId: number;
}

const PLAN_ICONS: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  free: Zap,
  teacher_pro: Crown,
  school: Building2,
};

const STATUS_CONFIG: Record<SubStatus, { label: string; color: string; icon: React.ComponentType<{ size?: number; className?: string }> }> = {
  active: { label: "Active", color: "text-green-400 bg-green-400/10 border-green-400/30", icon: CheckCircle },
  trial: { label: "Trial", color: "text-amber-400 bg-amber-400/10 border-amber-400/30", icon: Clock },
  expired: { label: "Expired", color: "text-red-400 bg-red-400/10 border-red-400/30", icon: XCircle },
  cancelled: { label: "Cancelled", color: "text-zinc-400 bg-zinc-400/10 border-zinc-400/30", icon: XCircle },
};

function fmt(d: Date | string | null) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

function daysLeft(d: Date | string | null) {
  if (!d) return null;
  const diff = new Date(d).getTime() - Date.now();
  return Math.ceil(diff / 86400000);
}

// ─── Assign Dialog ────────────────────────────────────────────────────────────
function AssignDialog({
  users,
  onClose,
  onSuccess,
}: {
  users: UserOption[];
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [userId, setUserId] = useState("");
  const [plan, setPlan] = useState<PlanTier>("teacher_pro");
  const [isTrial, setIsTrial] = useState(true);
  const [trialDays, setTrialDays] = useState(30);
  const [endsAt, setEndsAt] = useState("");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const filtered = users.filter(
    (u) =>
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      (u.displayName ?? "").toLowerCase().includes(search.toLowerCase())
  );

  async function submit() {
    if (!userId) { setError("Select a user"); return; }
    setLoading(true); setError("");
    try {
      const res = await fetch("/api/admin/subscriptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: parseInt(userId),
          plan,
          isTrial,
          trialDays: isTrial ? trialDays : undefined,
          endsAt: !isTrial && endsAt ? endsAt : undefined,
          note: note || undefined,
        }),
      });
      if (!res.ok) { const d = await res.json(); setError(d.error ?? "Failed"); return; }
      onSuccess();
      onClose();
    } catch { setError("Network error"); }
    finally { setLoading(false); }
  }

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#111] border border-white/10 rounded-2xl w-full max-w-md p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-black text-white flex items-center gap-2">
            <Shield size={18} className="text-amber-400" /> Assign Subscription
          </h2>
          <button onClick={onClose} className="text-white/40 hover:text-white text-xl">✕</button>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm px-3 py-2 rounded-lg mb-4">
            {error}
          </div>
        )}

        {/* User search */}
        <label className="block text-xs text-white/40 uppercase tracking-widest mb-1">User</label>
        <div className="relative mb-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or email..."
            className="w-full bg-white/5 border border-white/10 rounded-lg pl-8 pr-3 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:border-amber-400/50"
          />
        </div>
        <select
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white mb-4 focus:outline-none focus:border-amber-400/50"
          size={4}
        >
          {filtered.map((u) => (
            <option key={u.id} value={u.id} className="bg-[#111]">
              {u.displayName ?? u.email} ({u.role}) — {u.email}
            </option>
          ))}
        </select>

        {/* Plan */}
        <label className="block text-xs text-white/40 uppercase tracking-widest mb-1">Plan</label>
        <div className="grid grid-cols-3 gap-2 mb-4">
          {(["free", "teacher_pro", "school"] as PlanTier[]).map((p) => {
            const Icon = PLAN_ICONS[p];
            return (
              <button
                key={p}
                onClick={() => setPlan(p)}
                className={`flex flex-col items-center gap-1 py-2 rounded-lg border text-xs font-bold transition-all ${
                  plan === p
                    ? "border-amber-400 bg-amber-400/10 text-amber-400"
                    : "border-white/10 text-white/40 hover:border-white/30"
                }`}
              >
                <Icon size={16} />
                {PLAN_DISPLAY[p].name}
              </button>
            );
          })}
        </div>

        {/* Trial toggle */}
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-sm font-bold text-white">Scarcity Trial Offer</p>
            <p className="text-xs text-white/40">Free trial period (admin-granted only)</p>
          </div>
          <button
            onClick={() => setIsTrial(!isTrial)}
            className={`relative w-10 h-5 rounded-full transition-colors ${isTrial ? "bg-amber-400" : "bg-white/20"}`}
          >
            <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-transform ${isTrial ? "translate-x-5" : "translate-x-0.5"}`} />
          </button>
        </div>

        {isTrial ? (
          <div className="mb-4">
            <label className="block text-xs text-white/40 uppercase tracking-widest mb-1">Trial Days</label>
            <input
              type="number"
              value={trialDays}
              onChange={(e) => setTrialDays(parseInt(e.target.value) || 30)}
              min={1} max={90}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-400/50"
            />
          </div>
        ) : (
          <div className="mb-4">
            <label className="block text-xs text-white/40 uppercase tracking-widest mb-1">Ends At (optional)</label>
            <input
              type="date"
              value={endsAt}
              onChange={(e) => setEndsAt(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-400/50"
            />
          </div>
        )}

        {/* Note */}
        <label className="block text-xs text-white/40 uppercase tracking-widest mb-1">Admin Note (optional)</label>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="e.g. Promo — Phnom Penh driving school"
          rows={2}
          className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:border-amber-400/50 resize-none mb-5"
        />

        <button
          onClick={submit}
          disabled={loading}
          className="w-full bg-amber-400 text-black font-black py-3 rounded-xl hover:bg-amber-300 transition-colors disabled:opacity-50"
        >
          {loading ? "Assigning..." : "Assign Subscription"}
        </button>
      </div>
    </div>
  );
}

// ─── Edit Dialog ──────────────────────────────────────────────────────────────
function EditDialog({ sub, onClose, onSuccess }: { sub: SubRow; onClose: () => void; onSuccess: () => void }) {
  const [status, setStatus] = useState(sub.status);
  const [note, setNote] = useState(sub.note ?? "");
  const [endsAt, setEndsAt] = useState(sub.endsAt ? new Date(sub.endsAt).toISOString().split("T")[0] : "");
  const [loading, setLoading] = useState(false);

  async function save() {
    setLoading(true);
    await fetch(`/api/admin/subscriptions/${sub.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, note: note || null, endsAt: endsAt || null }),
    });
    setLoading(false);
    onSuccess(); onClose();
  }

  async function revoke() {
    if (!confirm("Revoke this subscription?")) return;
    await fetch(`/api/admin/subscriptions/${sub.id}`, { method: "DELETE" });
    onSuccess(); onClose();
  }

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#111] border border-white/10 rounded-2xl w-full max-w-sm p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-black text-white">Edit Subscription #{sub.id}</h2>
          <button onClick={onClose} className="text-white/40 hover:text-white text-xl">✕</button>
        </div>
        <p className="text-sm text-white/50 mb-4">{sub.userName ?? sub.userEmail}</p>

        <label className="block text-xs text-white/40 uppercase tracking-widest mb-1">Status</label>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white mb-4 focus:outline-none"
        >
          {["active", "trial", "expired", "cancelled"].map((s) => (
            <option key={s} value={s} className="bg-[#111]">{s}</option>
          ))}
        </select>

        <label className="block text-xs text-white/40 uppercase tracking-widest mb-1">Ends At</label>
        <input
          type="date"
          value={endsAt}
          onChange={(e) => setEndsAt(e.target.value)}
          className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white mb-4 focus:outline-none"
        />

        <label className="block text-xs text-white/40 uppercase tracking-widest mb-1">Note</label>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={2}
          className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-white/30 focus:outline-none resize-none mb-5"
        />

        <div className="flex gap-2">
          <button onClick={save} disabled={loading} className="flex-1 bg-amber-400 text-black font-black py-2.5 rounded-xl hover:bg-amber-300 disabled:opacity-50">
            {loading ? "Saving..." : "Save"}
          </button>
          <button onClick={revoke} className="px-4 py-2.5 bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl hover:bg-red-500/20 font-bold">
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export function SubscriptionsManager({ initialRows, allUsers, adminId }: Props) {
  const [rows, setRows] = useState<SubRow[]>(initialRows);
  const [migrationPending] = useState(initialRows.length === 0 && allUsers.length > 0 === false);
  const [showAssign, setShowAssign] = useState(false);
  const [editSub, setEditSub] = useState<SubRow | null>(null);
  const [search, setSearch] = useState("");
  const [filterPlan, setFilterPlan] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [loading, setLoading] = useState(false);

  async function refresh() {
    setLoading(true);
    const res = await fetch("/api/admin/subscriptions");
    const data = await res.json();
    setRows(data.subscriptions ?? []);
    setLoading(false);
  }

  const filtered = useMemo(() => {
    return rows.filter((r) => {
      const matchSearch =
        !search ||
        (r.userName ?? "").toLowerCase().includes(search.toLowerCase()) ||
        r.userEmail.toLowerCase().includes(search.toLowerCase());
      const matchPlan = filterPlan === "all" || r.plan === filterPlan;
      const matchStatus = filterStatus === "all" || r.status === filterStatus;
      return matchSearch && matchPlan && matchStatus;
    });
  }, [rows, search, filterPlan, filterStatus]);

  // Stats
  const stats = useMemo(() => ({
    total: rows.length,
    active: rows.filter((r) => r.status === "active").length,
    trial: rows.filter((r) => r.status === "trial").length,
    teacher_pro: rows.filter((r) => r.plan === "teacher_pro" && r.status !== "cancelled").length,
    school: rows.filter((r) => r.plan === "school" && r.status !== "cancelled").length,
  }), [rows]);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white p-6">
      {showAssign && (
        <AssignDialog users={allUsers} onClose={() => setShowAssign(false)} onSuccess={refresh} />
      )}
      {editSub && (
        <EditDialog sub={editSub} onClose={() => setEditSub(null)} onSuccess={refresh} />
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-black flex items-center gap-2">
            <Shield size={22} className="text-amber-400" /> Subscription Management
          </h1>
          <p className="text-white/40 text-sm mt-0.5">Only admins can assign or modify subscriptions</p>
        </div>
        <div className="flex gap-2">
          <button onClick={refresh} disabled={loading} className="p-2.5 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-colors">
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          </button>
          <button
            onClick={() => setShowAssign(true)}
            className="flex items-center gap-2 bg-amber-400 text-black font-black px-4 py-2.5 rounded-xl hover:bg-amber-300 transition-colors"
          >
            <Plus size={16} /> Assign Plan
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
        {[
          { label: "Total", value: stats.total, icon: Users, color: "text-white" },
          { label: "Active", value: stats.active, icon: CheckCircle, color: "text-green-400" },
          { label: "Trials", value: stats.trial, icon: Clock, color: "text-amber-400" },
          { label: "Teacher Pro", value: stats.teacher_pro, icon: Crown, color: "text-amber-400" },
          { label: "School", value: stats.school, icon: Building2, color: "text-purple-400" },
        ].map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="bg-white/5 border border-white/10 rounded-xl p-4">
              <Icon size={16} className={`${s.color} mb-1`} />
              <p className="text-2xl font-black">{s.value}</p>
              <p className="text-xs text-white/40">{s.label}</p>
            </div>
          );
        })}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-5">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search user..."
            className="w-full bg-white/5 border border-white/10 rounded-xl pl-8 pr-3 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:border-amber-400/50"
          />
        </div>
        <select
          value={filterPlan}
          onChange={(e) => setFilterPlan(e.target.value)}
          className="bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none"
        >
          <option value="all" className="bg-[#111]">All Plans</option>
          <option value="free" className="bg-[#111]">Free</option>
          <option value="teacher_pro" className="bg-[#111]">Teacher Pro</option>
          <option value="school" className="bg-[#111]">School</option>
        </select>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none"
        >
          <option value="all" className="bg-[#111]">All Status</option>
          <option value="active" className="bg-[#111]">Active</option>
          <option value="trial" className="bg-[#111]">Trial</option>
          <option value="expired" className="bg-[#111]">Expired</option>
          <option value="cancelled" className="bg-[#111]">Cancelled</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10 text-white/40 text-xs uppercase tracking-widest">
                <th className="text-left px-4 py-3">User</th>
                <th className="text-left px-4 py-3">Plan</th>
                <th className="text-left px-4 py-3">Status</th>
                <th className="text-left px-4 py-3">Trial</th>
                <th className="text-left px-4 py-3">Starts</th>
                <th className="text-left px-4 py-3">Ends</th>
                <th className="text-left px-4 py-3">Note</th>
                <th className="text-left px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-white/30">No subscriptions found</td>
                </tr>
              )}
              {filtered.map((row) => {
                const PlanIcon = PLAN_ICONS[row.plan] ?? Zap;
                const planDisplay = PLAN_DISPLAY[row.plan as PlanTier];
                const statusCfg = STATUS_CONFIG[row.status as SubStatus] ?? STATUS_CONFIG.cancelled;
                const StatusIcon = statusCfg.icon;
                const days = row.isTrial ? daysLeft(row.trialEndsAt) : daysLeft(row.endsAt);

                return (
                  <tr key={row.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-bold text-white">{row.userName ?? "—"}</p>
                      <p className="text-xs text-white/40">{row.userEmail}</p>
                      <span className="text-xs text-white/30 capitalize">{row.userRole}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <span style={{ color: planDisplay?.color }}><PlanIcon size={14} /></span>
                        <span className="font-bold" style={{ color: planDisplay?.color }}>
                          {planDisplay?.name ?? row.plan}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full border ${statusCfg.color}`}>
                        <StatusIcon size={11} />
                        {statusCfg.label}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {row.isTrial ? (
                        <div>
                          <span className="text-xs text-amber-400 font-bold">Trial</span>
                          {days !== null && (
                            <p className={`text-xs ${days <= 3 ? "text-red-400" : "text-white/40"}`}>
                              {days > 0 ? `${days}d left` : "Expired"}
                            </p>
                          )}
                        </div>
                      ) : (
                        <span className="text-xs text-white/30">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-xs text-white/50">{fmt(row.startsAt)}</td>
                    <td className="px-4 py-3 text-xs text-white/50">
                      {row.endsAt ? (
                        <span className={days !== null && days <= 7 ? "text-red-400 font-bold" : ""}>
                          {fmt(row.endsAt)}
                        </span>
                      ) : "∞"}
                    </td>
                    <td className="px-4 py-3 text-xs text-white/40 max-w-[140px] truncate">
                      {row.note ?? "—"}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => setEditSub(row)}
                        className="p-1.5 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-colors"
                      >
                        <Edit3 size={14} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Anti-cheat notice */}
      <div className="mt-6 bg-amber-400/5 border border-amber-400/20 rounded-xl p-4 flex items-start gap-3">
        <AlertTriangle size={16} className="text-amber-400 mt-0.5 shrink-0" />
        <div>
          <p className="text-sm font-bold text-amber-400">Anti-Cheat Policy</p>
          <p className="text-xs text-white/40 mt-0.5">
            Subscriptions can only be assigned by admins via this dashboard. There is no self-upgrade flow, no payment gateway bypass, and no client-side plan injection. Every assignment is logged with the admin ID. Trial offers are scarcity-based and admin-granted only.
          </p>
        </div>
      </div>
    </div>
  );
}
