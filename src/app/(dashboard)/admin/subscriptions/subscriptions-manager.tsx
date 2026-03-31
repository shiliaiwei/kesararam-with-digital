"use client";

import { useState, useMemo, useRef, useEffect, useCallback } from "react";
import {
  Crown, Building2, Zap, Plus, Search,
  Clock, CheckCircle, XCircle, AlertTriangle, RefreshCw,
  Shield, Users, Trash2, Edit3, X, CalendarDays, StickyNote,
  Lock, Unlock, Bot, BarChart3, Download, Gamepad2,
} from "lucide-react";
import { PLAN_DISPLAY, PLAN_LIMITS, type PlanTier } from "@/lib/subscription-plans";

type SubStatus = "active" | "expired" | "cancelled" | "trial";

interface SubRow {
  id: number; userId: number; plan: string; status: string;
  isTrial: boolean; trialEndsAt: Date | string | null;
  startsAt: Date | string; endsAt: Date | string | null;
  note: string | null; createdAt: Date | string; updatedAt: Date | string;
  userName: string | null; userEmail: string; userRole: string;
}

interface UserOption {
  id: number;
  displayName: string | null;
  username: string;
  email: string;
  role: string;
  currentPlan?: string;
  planStatus?: string;
  isTrial?: boolean;
  trialEndsAt?: string | null;
}

interface Props { initialRows: SubRow[]; allUsers: UserOption[]; adminId: number; }

const PLAN_ICONS = { free: Zap, teacher_pro: Crown, school: Building2 } as const;

const STATUS_CONFIG: Record<SubStatus, { label: string; color: string; icon: React.ComponentType<{ size?: number; className?: string }> }> = {
  active:    { label: "Active",    color: "text-green-400 bg-green-400/10 border-green-400/30",  icon: CheckCircle },
  trial:     { label: "Trial",     color: "text-amber-400 bg-amber-400/10 border-amber-400/30",  icon: Clock },
  expired:   { label: "Expired",   color: "text-red-400 bg-red-400/10 border-red-400/30",        icon: XCircle },
  cancelled: { label: "Cancelled", color: "text-zinc-400 bg-zinc-400/10 border-zinc-400/30",     icon: XCircle },
};

const PLAN_FEATURES: Record<PlanTier, { label: string; icon: React.ComponentType<{ size?: number; className?: string }>; locked: boolean }[]> = {
  free: [
    { label: "1 session/month", icon: Gamepad2, locked: false },
    { label: "10 players max", icon: Users, locked: false },
    { label: "1 category only", icon: Lock, locked: false },
    { label: "Analytics", icon: BarChart3, locked: true },
    { label: "Export results", icon: Download, locked: true },
    { label: "Advanced modes", icon: Gamepad2, locked: true },
    { label: "Suar AI", icon: Bot, locked: true },
  ],
  teacher_pro: [
    { label: "Unlimited sessions", icon: Gamepad2, locked: false },
    { label: "50 players/session", icon: Users, locked: false },
    { label: "All 8 categories", icon: Unlock, locked: false },
    { label: "Analytics & reports", icon: BarChart3, locked: false },
    { label: "Export results", icon: Download, locked: false },
    { label: "Advanced game modes", icon: Gamepad2, locked: false },
    { label: "Suar AI unlimited", icon: Bot, locked: false },
  ],
  school: [
    { label: "Unlimited sessions", icon: Gamepad2, locked: false },
    { label: "200 players/session", icon: Users, locked: false },
    { label: "10 teacher accounts", icon: Users, locked: false },
    { label: "All 8 categories", icon: Unlock, locked: false },
    { label: "Analytics & reports", icon: BarChart3, locked: false },
    { label: "Export results", icon: Download, locked: false },
    { label: "Suar AI unlimited", icon: Bot, locked: false },
  ],
};

function fmt(d: Date | string | null) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}
function daysLeft(d: Date | string | null) {
  if (!d) return null;
  return Math.ceil((new Date(d).getTime() - Date.now()) / 86400000);
}

// ─── Toggle ───────────────────────────────────────────────────────────────────
function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button type="button" role="switch" aria-checked={checked} onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 ${checked ? "bg-amber-400" : "bg-white/20"}`}>
      <span className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-lg transform transition-transform duration-200 ${checked ? "translate-x-5" : "translate-x-0"}`} />
    </button>
  );
}

// ─── Plan Badge ───────────────────────────────────────────────────────────────
function PlanBadge({ plan, isTrial, trialEndsAt }: { plan: string; isTrial?: boolean; trialEndsAt?: string | null }) {
  const p = plan as PlanTier;
  const display = PLAN_DISPLAY[p] ?? PLAN_DISPLAY.free;
  const Icon = PLAN_ICONS[p] ?? Zap;
  const days = trialEndsAt ? daysLeft(trialEndsAt) : null;

  return (
    <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border"
      style={{ color: display.color, borderColor: display.color + "40", backgroundColor: display.color + "15" }}>
      <Icon size={10} />
      {display.name}
      {isTrial && days !== null && (
        <span className={`ml-0.5 ${days <= 2 ? "text-red-400" : "text-white/50"}`}>· {days}d</span>
      )}
    </span>
  );
}

// ─── User Tag Search ──────────────────────────────────────────────────────────
function UserTagSearch({ users, selected, onSelect, onClear }: {
  users: UserOption[];
  selected: UserOption | null;
  onSelect: (u: UserOption) => void;
  onClear: () => void;
}) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function h(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase().replace(/^@/, "");
    if (!q) return users.slice(0, 12);
    return users.filter(u =>
      u.username.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      (u.displayName ?? "").toLowerCase().includes(q)
    ).slice(0, 12);
  }, [query, users]);

  if (selected) {
    return (
      <div className="flex items-center gap-3 bg-amber-400/10 border border-amber-400/40 rounded-xl px-3 py-2.5">
        <div className="w-9 h-9 rounded-full bg-amber-400 text-black text-xs font-black flex items-center justify-center shrink-0">
          {(selected.displayName ?? selected.username).slice(0, 2).toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-sm font-bold text-white">{selected.displayName ?? selected.username}</p>
            <span className="text-white/40 text-xs">@{selected.username}</span>
            {selected.currentPlan && (
              <PlanBadge plan={selected.currentPlan} isTrial={selected.isTrial} trialEndsAt={selected.trialEndsAt} />
            )}
          </div>
          <p className="text-xs text-white/35 truncate">{selected.email}</p>
        </div>
        <button onClick={onClear} className="text-white/30 hover:text-white transition-colors shrink-0">
          <X size={14} />
        </button>
      </div>
    );
  }

  return (
    <div ref={ref} className="relative">
      <div className="relative">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none" />
        <input
          value={query}
          onChange={e => { setQuery(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          placeholder="Type @username, email, or name..."
          className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-3 py-2.5 text-sm text-white placeholder-white/25 focus:outline-none focus:border-amber-400/60 transition-colors"
          autoComplete="off"
        />
      </div>
      {open && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-[#1c1c1c] border border-white/10 rounded-xl shadow-2xl z-20 overflow-hidden max-h-72 overflow-y-auto">
          {results.length === 0 ? (
            <p className="text-center text-white/30 text-xs py-4 px-3">
              No users match "{query.replace(/^@/, "")}"
            </p>
          ) : (
            <>
              <p className="text-[10px] text-white/25 uppercase tracking-widest px-3 pt-2 pb-1">
                {results.length} user{results.length !== 1 ? "s" : ""} found
              </p>
              {results.map(u => (
                <button key={u.id} onClick={() => { onSelect(u); setQuery(""); setOpen(false); }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-white/6 transition-colors text-left border-t border-white/5 first:border-0">
                  <div className="w-8 h-8 rounded-full bg-white/10 text-white text-xs font-black flex items-center justify-center shrink-0">
                    {(u.displayName ?? u.username).slice(0, 2).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <p className="text-sm font-semibold text-white">{u.displayName ?? u.username}</p>
                      <span className="text-white/35 text-xs">@{u.username}</span>
                      {u.currentPlan && (
                        <PlanBadge plan={u.currentPlan} isTrial={u.isTrial} trialEndsAt={u.trialEndsAt} />
                      )}
                    </div>
                    <p className="text-xs text-white/35 truncate">{u.email}</p>
                  </div>
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full shrink-0 ${
                    u.role === "teacher" ? "bg-green-500/15 text-green-400" :
                    u.role === "admin"   ? "bg-red-500/15 text-red-400" :
                    "bg-white/10 text-white/40"
                  }`}>{u.role}</span>
                </button>
              ))}
            </>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Feature Lock List ────────────────────────────────────────────────────────
function FeatureLockList({ plan }: { plan: PlanTier }) {
  const features = PLAN_FEATURES[plan];
  return (
    <div className="bg-white/3 border border-white/8 rounded-xl p-3">
      <p className="text-[10px] text-white/30 uppercase tracking-widest mb-2">What this plan includes</p>
      <div className="grid grid-cols-2 gap-1">
        {features.map((f, i) => {
          const Icon = f.icon;
          return (
            <div key={i} className={`flex items-center gap-1.5 text-xs ${f.locked ? "text-white/25" : "text-white/70"}`}>
              {f.locked
                ? <Lock size={10} className="text-white/20 shrink-0" />
                : <CheckCircle size={10} className="text-green-400 shrink-0" />
              }
              <span className={f.locked ? "line-through" : ""}>{f.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Assign Dialog ────────────────────────────────────────────────────────────
function AssignDialog({ users: initialUsers, onClose, onSuccess }: {
  users: UserOption[];
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [users, setUsers] = useState<UserOption[]>(initialUsers);
  const [selectedUser, setSelectedUser] = useState<UserOption | null>(null);
  const [plan, setPlan] = useState<PlanTier>("teacher_pro");
  const [isTrial, setIsTrial] = useState(true);
  const [trialDays, setTrialDays] = useState(7);
  const [endsAt, setEndsAt] = useState("");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // Fetch users with current plan info on mount
  useEffect(() => {
    fetch("/api/admin/users-with-plans", { credentials: "include" })
      .then(r => r.json())
      .then(d => { if (d.users) setUsers(d.users); })
      .catch(() => {});
  }, []);

  async function submit() {
    if (!selectedUser) { setError("Please select a user first"); return; }
    setLoading(true); setError("");
    try {
      const payload: Record<string, unknown> = {
          userId: selectedUser.id,
          plan,
          isTrial,
          note: note.trim() || undefined,
        };
        if (isTrial) {
          payload.trialDays = trialDays;
        } else if (endsAt && endsAt.length > 4) {
          payload.endsAt = endsAt;
        }

      const res = await fetch("/api/admin/subscriptions", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      let data: any = {};
      try { data = await res.json(); } catch { /* empty body */ }

      if (!res.ok) {
        setError(data.error ?? `Request failed (${res.status})`);
        return;
      }
      setSuccess(true);
      setTimeout(() => { onSuccess(); onClose(); }, 800);
    } catch (err) {
      setError(`Network error: ${err instanceof Error ? err.message : "Unknown"}`);
    } finally { setLoading(false); }
  }

  const planMeta: { key: PlanTier; icon: typeof Zap; label: string; price: string; desc: string }[] = [
    { key: "free",        icon: Zap,       label: "Free",        price: "$0",  desc: "Basic access" },
    { key: "teacher_pro", icon: Crown,     label: "Teacher Pro", price: "$10", desc: "Unlimited sessions" },
    { key: "school",      icon: Building2, label: "School",      price: "$49", desc: "Multi-teacher" },
  ];

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#111] border border-white/10 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-400/10 border border-amber-400/30 flex items-center justify-center">
              <Shield size={15} className="text-amber-400" />
            </div>
            <div>
              <h2 className="text-base font-black text-white">Assign Subscription</h2>
              <p className="text-xs text-white/30">Admin-only · logged action</p>
            </div>
          </div>
          <button onClick={onClose} className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/40 hover:text-white transition-colors">
            <X size={14} />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 px-5 py-4 flex flex-col gap-4">
          {error && (
            <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 text-red-400 text-sm px-3 py-2.5 rounded-xl">
              <XCircle size={14} className="shrink-0" /> {error}
            </div>
          )}
          {success && (
            <div className="flex items-center gap-2 bg-green-500/10 border border-green-500/30 text-green-400 text-sm px-3 py-2.5 rounded-xl">
              <CheckCircle size={14} className="shrink-0" /> Subscription assigned!
            </div>
          )}

          {/* Step 1 — User */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-5 h-5 rounded-full bg-amber-400 text-black text-[10px] font-black flex items-center justify-center shrink-0">1</span>
              <label className="text-xs font-bold text-white/50 uppercase tracking-widest">Select User</label>
              <span className="text-[10px] text-white/25 ml-auto">{users.length} users loaded</span>
            </div>
            <UserTagSearch users={users} selected={selectedUser} onSelect={u => { setSelectedUser(u); }} onClear={() => setSelectedUser(null)} />

            {/* Current plan info for selected user */}
            {selectedUser?.currentPlan && selectedUser.currentPlan !== "free" && (
              <div className="mt-2 flex items-center gap-2 bg-white/4 border border-white/8 rounded-lg px-3 py-2">
                <Clock size={12} className="text-amber-400 shrink-0" />
                <span className="text-xs text-white/50">
                  Currently on <span className="text-white font-bold">{PLAN_DISPLAY[selectedUser.currentPlan as PlanTier]?.name ?? selectedUser.currentPlan}</span>
                  {selectedUser.isTrial && selectedUser.trialEndsAt && (
                    <> · <span className={daysLeft(selectedUser.trialEndsAt) !== null && daysLeft(selectedUser.trialEndsAt)! <= 2 ? "text-red-400 font-bold" : "text-amber-400"}>
                      {daysLeft(selectedUser.trialEndsAt)}d trial left
                    </span></>
                  )}
                  {" "}— assigning will replace it
                </span>
              </div>
            )}
          </div>

          {/* Step 2 — Plan */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-5 h-5 rounded-full bg-amber-400 text-black text-[10px] font-black flex items-center justify-center shrink-0">2</span>
              <label className="text-xs font-bold text-white/50 uppercase tracking-widest">Choose Plan</label>
            </div>
            <div className="grid grid-cols-3 gap-2 mb-3">
              {planMeta.map(({ key, icon: Icon, label, price, desc }) => (
                <button key={key} onClick={() => setPlan(key)}
                  className={`relative flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl border transition-all ${
                    plan === key
                      ? "border-amber-400 bg-amber-400/10 shadow-[0_0_12px_rgba(251,191,36,0.15)]"
                      : "border-white/10 bg-white/4 hover:border-white/20"
                  }`}>
                  {plan === key && <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-amber-400" />}
                  <Icon size={18} className={plan === key ? "text-amber-400" : "text-white/35"} />
                  <span className={`text-xs font-black ${plan === key ? "text-amber-400" : "text-white/55"}`}>{label}</span>
                  <span className="text-[10px] text-white/25">{price}/mo</span>
                  <span className="text-[10px] text-white/20 text-center leading-tight">{desc}</span>
                </button>
              ))}
            </div>
            {/* Feature lock list for selected plan */}
            <FeatureLockList plan={plan} />
          </div>

          {/* Step 3 — Duration */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-5 h-5 rounded-full bg-amber-400 text-black text-[10px] font-black flex items-center justify-center shrink-0">3</span>
              <label className="text-xs font-bold text-white/50 uppercase tracking-widest">Duration</label>
            </div>
            <div className="bg-white/4 border border-white/10 rounded-xl p-3.5">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-sm font-bold text-white">🔥 Scarcity Trial Offer</p>
                  <p className="text-xs text-white/35">Free trial — admin-granted only</p>
                </div>
                <Toggle checked={isTrial} onChange={setIsTrial} />
              </div>
              {isTrial ? (
                <div className="flex items-center gap-2">
                  <Clock size={13} className="text-amber-400 shrink-0" />
                  <input type="number" value={trialDays}
                    onChange={e => setTrialDays(Math.max(1, Math.min(90, parseInt(e.target.value) || 7)))}
                    min={1} max={90}
                    className="w-16 bg-black/30 border border-white/10 rounded-lg px-2 py-1.5 text-sm text-white text-center focus:outline-none focus:border-amber-400/50" />
                  <span className="text-xs text-white/40">days free trial</span>
                  <div className="flex gap-1 ml-auto">
                    {[7, 14, 30].map(d => (
                      <button key={d} onClick={() => setTrialDays(d)}
                        className={`text-[10px] font-bold px-2 py-1 rounded-lg transition-colors ${trialDays === d ? "bg-amber-400 text-black" : "bg-white/10 text-white/50 hover:bg-white/15"}`}>
                        {d}d
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <CalendarDays size={13} className="text-white/35 shrink-0" />
                  <input type="date" value={endsAt} onChange={e => setEndsAt(e.target.value)}
                    className="flex-1 bg-black/30 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-amber-400/50" />
                  <span className="text-xs text-white/35">end date (optional)</span>
                </div>
              )}
            </div>
          </div>

          {/* Note */}
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <StickyNote size={13} className="text-white/25" />
              <label className="text-xs font-bold text-white/35 uppercase tracking-widest">Admin Note (optional)</label>
            </div>
            <input value={note} onChange={e => setNote(e.target.value)}
              placeholder="e.g. Promo — Phnom Penh driving school"
              className="w-full bg-white/4 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white placeholder-white/20 focus:outline-none focus:border-amber-400/30 transition-colors" />
          </div>
        </div>

        {/* Footer CTA */}
        <div className="px-5 pb-5 shrink-0 border-t border-white/8 pt-4">
          <button onClick={submit} disabled={loading || success || !selectedUser}
            className="w-full flex items-center justify-center gap-2 bg-amber-400 text-black font-black py-3.5 rounded-xl hover:bg-amber-300 transition-all disabled:opacity-40 disabled:cursor-not-allowed text-sm">
            {loading ? <><RefreshCw size={15} className="animate-spin" /> Assigning...</>
              : success ? <><CheckCircle size={15} /> Done!</>
              : <><Shield size={15} /> Assign {PLAN_DISPLAY[plan].name}{selectedUser ? ` → @${selectedUser.username}` : ""}</>
            }
          </button>
        </div>
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
    setLoading(false); onSuccess(); onClose();
  }

  async function revoke() {
    if (!confirm("Revoke this subscription?")) return;
    await fetch(`/api/admin/subscriptions/${sub.id}`, { method: "DELETE" });
    onSuccess(); onClose();
  }

  const planDisplay = PLAN_DISPLAY[sub.plan as PlanTier];

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#111] border border-white/10 rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
          <div>
            <h2 className="text-base font-black text-white">Edit Subscription</h2>
            <p className="text-xs text-white/30">#{sub.id} · {sub.userName ?? sub.userEmail}</p>
          </div>
          <button onClick={onClose} className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/40 hover:text-white transition-colors">
            <X size={14} />
          </button>
        </div>
        <div className="px-5 py-4 flex flex-col gap-4">
          <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-3 py-2.5">
            <div className="w-8 h-8 rounded-full bg-white/10 text-white text-xs font-black flex items-center justify-center">
              {(sub.userName ?? sub.userEmail).slice(0, 2).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-white truncate">{sub.userName ?? sub.userEmail}</p>
              <p className="text-xs truncate" style={{ color: planDisplay?.color }}>{planDisplay?.name ?? sub.plan}</p>
            </div>
          </div>
          <div>
            <label className="block text-xs text-white/40 uppercase tracking-widest mb-2">Status</label>
            <div className="grid grid-cols-2 gap-2">
              {(["active", "trial", "expired", "cancelled"] as SubStatus[]).map(s => {
                const cfg = STATUS_CONFIG[s];
                const Icon = cfg.icon;
                return (
                  <button key={s} onClick={() => setStatus(s)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-bold transition-all ${
                      status === s ? cfg.color + " border-current" : "border-white/10 text-white/40 hover:border-white/20"
                    }`}>
                    <Icon size={12} /> {cfg.label}
                  </button>
                );
              })}
            </div>
          </div>
          <div>
            <label className="block text-xs text-white/40 uppercase tracking-widest mb-1.5">Ends At</label>
            <input type="date" value={endsAt} onChange={e => setEndsAt(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-amber-400/50" />
          </div>
          <div>
            <label className="block text-xs text-white/40 uppercase tracking-widest mb-1.5">Note</label>
            <textarea value={note} onChange={e => setNote(e.target.value)} rows={2}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder-white/20 focus:outline-none resize-none" />
          </div>
          <div className="flex gap-2">
            <button onClick={save} disabled={loading}
              className="flex-1 bg-amber-400 text-black font-black py-2.5 rounded-xl hover:bg-amber-300 disabled:opacity-50 text-sm transition-colors">
              {loading ? "Saving..." : "Save Changes"}
            </button>
            <button onClick={revoke}
              className="px-3 py-2.5 bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl hover:bg-red-500/20 transition-colors">
              <Trash2 size={15} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export function SubscriptionsManager({ initialRows, allUsers }: Props) {
  const [rows, setRows] = useState<SubRow[]>(initialRows);
  const [showAssign, setShowAssign] = useState(false);
  const [editSub, setEditSub] = useState<SubRow | null>(null);
  const [search, setSearch] = useState("");
  const [filterPlan, setFilterPlan] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/subscriptions", { credentials: "include" });
      const data = await res.json();
      setRows(data.subscriptions ?? []);
    } catch { /* ignore */ }
    setLoading(false);
  }, []);

  const filtered = useMemo(() => rows.filter(r => {
    const q = search.toLowerCase();
    const matchSearch = !q || (r.userName ?? "").toLowerCase().includes(q) || r.userEmail.toLowerCase().includes(q);
    return matchSearch && (filterPlan === "all" || r.plan === filterPlan) && (filterStatus === "all" || r.status === filterStatus);
  }), [rows, search, filterPlan, filterStatus]);

  const stats = useMemo(() => ({
    total: rows.length,
    active: rows.filter(r => r.status === "active").length,
    trial: rows.filter(r => r.status === "trial").length,
    teacher_pro: rows.filter(r => r.plan === "teacher_pro" && r.status !== "cancelled").length,
    school: rows.filter(r => r.plan === "school" && r.status !== "cancelled").length,
  }), [rows]);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white p-6">
      {showAssign && <AssignDialog users={allUsers} onClose={() => setShowAssign(false)} onSuccess={refresh} />}
      {editSub && <EditDialog sub={editSub} onClose={() => setEditSub(null)} onSuccess={refresh} />}

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black flex items-center gap-2">
            <Shield size={22} className="text-amber-400" /> Subscriptions
          </h1>
          <p className="text-white/40 text-sm mt-0.5">Admin-only · all changes are logged</p>
        </div>
        <div className="flex gap-2">
          <button onClick={refresh} disabled={loading} className="p-2.5 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-colors">
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          </button>
          <button onClick={() => setShowAssign(true)}
            className="flex items-center gap-2 bg-amber-400 text-black font-black px-4 py-2.5 rounded-xl hover:bg-amber-300 transition-colors text-sm">
            <Plus size={16} /> Assign Plan
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
        {[
          { label: "Total",       value: stats.total,       icon: Users,        color: "text-white" },
          { label: "Active",      value: stats.active,      icon: CheckCircle,  color: "text-green-400" },
          { label: "Trials",      value: stats.trial,       icon: Clock,        color: "text-amber-400" },
          { label: "Teacher Pro", value: stats.teacher_pro, icon: Crown,        color: "text-amber-400" },
          { label: "School",      value: stats.school,      icon: Building2,    color: "text-purple-400" },
        ].map(s => {
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

      <div className="flex flex-wrap gap-3 mb-5">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search user..."
            className="w-full bg-white/5 border border-white/10 rounded-xl pl-8 pr-3 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:border-amber-400/50" />
        </div>
        <select value={filterPlan} onChange={e => setFilterPlan(e.target.value)}
          className="bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none">
          <option value="all" className="bg-[#111]">All Plans</option>
          <option value="free" className="bg-[#111]">Free</option>
          <option value="teacher_pro" className="bg-[#111]">Teacher Pro</option>
          <option value="school" className="bg-[#111]">School</option>
        </select>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
          className="bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none">
          <option value="all" className="bg-[#111]">All Status</option>
          <option value="active" className="bg-[#111]">Active</option>
          <option value="trial" className="bg-[#111]">Trial</option>
          <option value="expired" className="bg-[#111]">Expired</option>
          <option value="cancelled" className="bg-[#111]">Cancelled</option>
        </select>
      </div>

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
                <th className="text-left px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr><td colSpan={8} className="text-center py-12 text-white/30">No subscriptions found</td></tr>
              )}
              {filtered.map(row => {
                const PlanIcon = PLAN_ICONS[row.plan as PlanTier] ?? Zap;
                const planDisplay = PLAN_DISPLAY[row.plan as PlanTier];
                const statusCfg = STATUS_CONFIG[row.status as SubStatus] ?? STATUS_CONFIG.cancelled;
                const StatusIcon = statusCfg.icon;
                const days = row.isTrial ? daysLeft(row.trialEndsAt) : daysLeft(row.endsAt);
                return (
                  <tr key={row.id} className="border-b border-white/5 hover:bg-white/4 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-white/10 text-white text-xs font-black flex items-center justify-center shrink-0">
                          {(row.userName ?? row.userEmail).slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-white text-sm">{row.userName ?? "—"}</p>
                          <p className="text-xs text-white/40">{row.userEmail}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <span style={{ color: planDisplay?.color }}><PlanIcon size={14} /></span>
                        <span className="font-bold text-sm" style={{ color: planDisplay?.color }}>{planDisplay?.name ?? row.plan}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full border ${statusCfg.color}`}>
                        <StatusIcon size={11} />{statusCfg.label}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {row.isTrial ? (
                        <div>
                          <span className="text-xs text-amber-400 font-bold">Trial</span>
                          {days !== null && <p className={`text-xs ${days <= 3 ? "text-red-400" : "text-white/40"}`}>{days > 0 ? `${days}d left` : "Expired"}</p>}
                        </div>
                      ) : <span className="text-xs text-white/20">—</span>}
                    </td>
                    <td className="px-4 py-3 text-xs text-white/50">{fmt(row.startsAt)}</td>
                    <td className="px-4 py-3 text-xs text-white/50">
                      {row.endsAt ? <span className={days !== null && days <= 7 ? "text-red-400 font-bold" : ""}>{fmt(row.endsAt)}</span> : "∞"}
                    </td>
                    <td className="px-4 py-3 text-xs text-white/40 max-w-[120px] truncate">{row.note ?? "—"}</td>
                    <td className="px-4 py-3">
                      <button onClick={() => setEditSub(row)} className="p-1.5 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-colors">
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

      <div className="mt-5 bg-amber-400/5 border border-amber-400/20 rounded-xl p-4 flex items-start gap-3">
        <AlertTriangle size={15} className="text-amber-400 mt-0.5 shrink-0" />
        <div>
          <p className="text-sm font-bold text-amber-400">Anti-Cheat Policy</p>
          <p className="text-xs text-white/40 mt-0.5">Admin-assigned only. No self-upgrade, no payment bypass. Every action logged. New teacher accounts auto-receive a 7-day Teacher Pro trial.</p>
        </div>
      </div>
    </div>
  );
}
