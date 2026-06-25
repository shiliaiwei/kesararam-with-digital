"use client";

import { useState, useMemo, useRef, useEffect, useCallback } from "react";
import { PLAN_DISPLAY, type PlanTier } from "@/lib/subscription-plans";
import {
  PLAN_META, PAID_PLANS, getPlanPrice, getStandardPrice, computeEndsAt,
  isPromoActive, isPaidPlan, type BillingCycle, type PaidPlan,
} from "@/lib/pricing";
import { BrandSelect } from "@/components/ui/brand-select";

type SubStatus = "active" | "expired" | "cancelled" | "trial";

interface SubRow {
  id: number; userId: number; plan: string; status: string;
  isTrial: boolean; trialEndsAt: Date | string | null;
  startsAt: Date | string; endsAt: Date | string | null;
  billingCycle: string | null;
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

const PLAN_ICONS = { free: "bolt", teacher_pro: "crown", school: "domain", family: "group", driving_school: "directions_car" } as const;

const STATUS_CONFIG: Record<SubStatus, { label: string; color: string; icon: string }> = {
  active:    { label: "Active",    color: "text-green-400 bg-green-400/10 border-green-400/30",  icon: "check_circle" },
  trial:     { label: "Trial",     color: "text-amber-400 bg-amber-400/10 border-amber-400/30",  icon: "schedule" },
  expired:   { label: "Expired",   color: "text-red-400 bg-red-400/10 border-red-400/30",        icon: "cancel" },
  cancelled: { label: "Cancelled", color: "text-zinc-400 bg-zinc-400/10 border-zinc-400/30",     icon: "cancel" },
};

const PLAN_FEATURES: Record<PlanTier, { label: string; icon: string; locked: boolean }[]> = {
  free: [
    { label: "1 session/month", icon: "sports_esports", locked: false },
    { label: "10 players max", icon: "group", locked: false },
    { label: "1 category only", icon: "lock", locked: false },
    { label: "Analytics", icon: "bar_chart", locked: true },
    { label: "Export results", icon: "download", locked: true },
    { label: "Advanced modes", icon: "sports_esports", locked: true },
    { label: "Suar AI", icon: "smart_toy", locked: true },
  ],
  teacher_pro: [
    { label: "Unlimited sessions", icon: "sports_esports", locked: false },
    { label: "50 players/session", icon: "group", locked: false },
    { label: "All 8 categories", icon: "lock_open", locked: false },
    { label: "Analytics & reports", icon: "bar_chart", locked: false },
    { label: "Export results", icon: "download", locked: false },
    { label: "Advanced game modes", icon: "sports_esports", locked: false },
    { label: "Suar AI unlimited", icon: "smart_toy", locked: false },
  ],
  school: [
    { label: "Unlimited sessions", icon: "sports_esports", locked: false },
    { label: "200 players/session", icon: "group", locked: false },
    { label: "10 teacher accounts", icon: "group", locked: false },
    { label: "All 8 categories", icon: "lock_open", locked: false },
    { label: "Analytics & reports", icon: "bar_chart", locked: false },
    { label: "Export results", icon: "download", locked: false },
    { label: "Suar AI unlimited", icon: "smart_toy", locked: false },
  ],
  family: [
    { label: "9 children max", icon: "group", locked: false },
    { label: "All categories", icon: "lock_open", locked: false },
    { label: "Analytics & reports", icon: "bar_chart", locked: false },
    { label: "Export results", icon: "download", locked: false },
    { label: "Advanced game modes", icon: "sports_esports", locked: false },
  ],
  driving_school: [
    { label: "Unlimited sessions", icon: "sports_esports", locked: false },
    { label: "Unlimited learners", icon: "group", locked: false },
    { label: "All categories", icon: "lock_open", locked: false },
    { label: "Analytics & reports", icon: "bar_chart", locked: false },
    { label: "Export results", icon: "download", locked: false },
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
      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-none border-2 border-black transition-colors duration-200 focus:outline-none ${checked ? "bg-amber-400" : "bg-white/20"}`}>
      <span className={`pointer-events-none inline-block h-5 w-5 rounded-none border border-black bg-white shadow-md transform transition-transform duration-200 ${checked ? "translate-x-5" : "translate-x-0"}`} />
    </button>
  );
}

// ─── Plan Badge ───────────────────────────────────────────────────────────────
function PlanBadge({ plan, isTrial, trialEndsAt }: { plan: string; isTrial?: boolean; trialEndsAt?: string | null }) {
  const p = plan as PlanTier;
  const display = PLAN_DISPLAY[p] ?? PLAN_DISPLAY.free;
  const iconName = PLAN_ICONS[p] ?? "bolt";
  const days = trialEndsAt ? daysLeft(trialEndsAt) : null;

  return (
    <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-none border border-black"
      style={{ color: display.color, borderColor: display.color + "40", backgroundColor: display.color + "15" }}>
      <span className="material-symbols-rounded shrink-0" style={{ fontSize: "10px" }}>{iconName}</span>
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
      <div className="flex items-center gap-3 bg-amber-400/10 border-2 border-amber-400/40 rounded-none px-3 py-2.5">
        <div className="w-9 h-9 rounded-none border border-black bg-amber-400 text-black text-xs font-black flex items-center justify-center shrink-0">
          {(selected.displayName ?? selected.username).slice(0, 2).toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap text-xs">
            <p className="text-sm font-black text-white">{selected.displayName ?? selected.username}</p>
            <span className="text-white/60 bg-white/10 px-1.5 py-0.5 border border-white/10 rounded-none font-mono text-[10px]">ID: {selected.id}</span>
            <span className="text-white/40">@{selected.username}</span>
            {selected.currentPlan && (
              <PlanBadge plan={selected.currentPlan} isTrial={selected.isTrial} trialEndsAt={selected.trialEndsAt} />
            )}
          </div>
          <p className="text-xs text-white/35 truncate mt-1">{selected.email}</p>
        </div>
        <button onClick={onClear} className="text-white/30 hover:text-white p-1 rounded-none border border-transparent hover:border-white/20 transition-all shrink-0">
          <span className="material-symbols-rounded" style={{ fontSize: "16px" }}>close</span>
        </button>
      </div>
    );
  }

  return (
    <div ref={ref} className="relative">
      <div className="relative">
        <span className="material-symbols-rounded absolute left-3 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none" style={{ fontSize: "16px" }}>search</span>
        <input
          value={query}
          onChange={e => { setQuery(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          placeholder="Type @username, email, or name..."
          className="w-full bg-white/5 border border-white/10 rounded-none pl-9 pr-3 py-2.5 text-sm text-white placeholder-white/25 focus:outline-none focus:border-amber-400/60 transition-colors"
          autoComplete="off"
        />
      </div>
      {open && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-[#1c1c1c] border-2 border-black rounded-none shadow-2xl z-20 overflow-hidden max-h-72 overflow-y-auto">
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
                  className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-white/10 transition-colors text-left border-t border-white/5 first:border-0 rounded-none">
                  <div className="w-8 h-8 rounded-none border border-white/20 bg-white/10 text-white text-xs font-black flex items-center justify-center shrink-0">
                    {(u.displayName ?? u.username).slice(0, 2).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap text-xs">
                      <p className="text-sm font-semibold text-white">{u.displayName ?? u.username}</p>
                      <span className="text-white/60 bg-white/10 px-1.5 py-0.5 border border-white/15 rounded-none font-mono text-[9px]">ID: {u.id}</span>
                      <span className="text-white/35">@{u.username}</span>
                      {u.currentPlan && (
                        <PlanBadge plan={u.currentPlan} isTrial={u.isTrial} trialEndsAt={u.trialEndsAt} />
                      )}
                    </div>
                    <p className="text-xs text-white/35 mt-0.5 truncate">{u.email}</p>
                  </div>
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 border rounded-none shrink-0 ${
                    u.role === "teacher" ? "bg-green-500/15 text-green-400 border-green-500/20" :
                    u.role === "admin"   ? "bg-red-500/15 text-red-400 border-red-500/20" :
                    "bg-white/10 text-white/40 border-white/10"
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
    <div className="bg-white/3 border border-white/8 rounded-none p-3">
      <p className="text-[10px] text-white/30 uppercase tracking-widest mb-2">What this plan includes</p>
      <div className="grid grid-cols-2 gap-2">
        {features.map((f, i) => {
          return (
            <div key={i} className={`flex items-center gap-1.5 text-xs ${f.locked ? "text-white/25" : "text-white/70"}`}>
              <span className="material-symbols-rounded shrink-0 text-white/40" style={{ fontSize: "12px" }}>
                {f.locked ? "lock" : "check_circle"}
              </span>
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
  const [licenseType, setLicenseType] = useState<"trial" | "paid">("trial");
  const [trialDays, setTrialDays] = useState(7);
  const [cycle, setCycle] = useState<BillingCycle>("yearly");
  const [lifetime, setLifetime] = useState(false);
  const [endsAt, setEndsAt] = useState(""); // manual end-date override (optional)
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const paid = plan !== "free";
  const isTrial = paid && licenseType === "trial";
  const promo = isPromoActive();
  // Resolved renewal/end date the subscriber will see.
  const resolvedEnd: string | null =
    paid && licenseType === "paid" && !lifetime
      ? (endsAt && endsAt.length > 4 ? new Date(endsAt).toISOString() : computeEndsAt(new Date(), cycle))
      : null;

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
        } else if (paid) {
          // Paid license — record the billing cycle; API auto-computes the end
          // date from the cycle unless we override it or mark it lifetime.
          payload.billingCycle = cycle;
          payload.lifetime = lifetime;
          if (!lifetime && endsAt && endsAt.length > 4) payload.endsAt = endsAt;
        }

      const res = await fetch("/api/admin/subscriptions", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      let data: unknown = {};
      try { data = await res.json(); } catch { /* empty body */ }

      if (!res.ok) {
        const errMsg = data && typeof data === "object" && "error" in data ? (data as any).error : undefined;
        setError(errMsg ?? `Request failed (${res.status})`);
        return;
      }
      setSuccess(true);
      setTimeout(() => { onSuccess(); onClose(); }, 800);
    } catch (err) {
      setError(`Network error: ${err instanceof Error ? err.message : "Unknown"}`);
    } finally { setLoading(false); }
  }

  // Plans the admin can assign. Paid plans pull live prices from @/lib/pricing
  // (same numbers as the public /pricing page). Free is appended last.
  const planMeta: { key: PlanTier; icon: string; label: string; desc: string }[] = [
    ...PAID_PLANS.map((k) => ({ key: k as PlanTier, icon: PLAN_META[k].icon, label: PLAN_META[k].name, desc: PLAN_META[k].blurb })),
    { key: "free", icon: "bolt", label: "Free", desc: "Basic access" },
  ];

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
      <div className="bg-[#111] border-2 border-black rounded-none w-full max-w-lg shadow-[8px_8px_0_#000] overflow-hidden max-h-[92vh] flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 border border-amber-400/40 bg-amber-400/10 flex items-center justify-center rounded-none">
              <span className="material-symbols-rounded text-amber-400" style={{ fontSize: "16px" }}>shield</span>
            </div>
            <div>
              <h2 className="text-base font-black text-white uppercase tracking-tight">Assign Subscription</h2>
              <p className="text-xs text-white/30 font-bold uppercase tracking-wider">Admin-only · logged action</p>
            </div>
          </div>
          <button onClick={onClose} className="w-7 h-7 rounded-none border border-white/10 bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/40 hover:text-white transition-all">
            <span className="material-symbols-rounded" style={{ fontSize: "14px" }}>close</span>
          </button>
        </div>

        <div className="overflow-y-auto flex-1 px-5 py-4 flex flex-col gap-4">
          {error && (
            <div className="flex items-center gap-2 bg-red-500/10 border-2 border-red-500/30 text-red-400 text-sm px-3 py-2.5 rounded-none font-bold">
              <span className="material-symbols-rounded shrink-0" style={{ fontSize: "14px" }}>warning</span> {error}
            </div>
          )}
          {success && (
            <div className="flex items-center gap-2 bg-green-500/10 border-2 border-green-500/30 text-green-400 text-sm px-3 py-2.5 rounded-none font-bold">
              <span className="material-symbols-rounded shrink-0" style={{ fontSize: "14px" }}>check_circle</span> Subscription assigned!
            </div>
          )}

          {/* Step 1 — User */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-5 h-5 rounded-none border border-black bg-amber-400 text-black text-[10px] font-black flex items-center justify-center shrink-0">1</span>
              <label className="text-xs font-bold text-white/50 uppercase tracking-widest">Select User</label>
              <span className="text-[10px] text-white/25 ml-auto font-bold">{users.length} users loaded</span>
            </div>
            <UserTagSearch users={users} selected={selectedUser} onSelect={u => { setSelectedUser(u); }} onClear={() => setSelectedUser(null)} />

            {/* Current plan info for selected user */}
            {selectedUser?.currentPlan && selectedUser.currentPlan !== "free" && (
              <div className="mt-2 flex items-center gap-2 bg-white/4 border border-white/8 rounded-none px-3 py-2">
                <span className="material-symbols-rounded text-amber-400 shrink-0" style={{ fontSize: "14px" }}>schedule</span>
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
              <span className="w-5 h-5 rounded-none border border-black bg-amber-400 text-black text-[10px] font-black flex items-center justify-center shrink-0">2</span>
              <label className="text-xs font-bold text-white/50 uppercase tracking-widest">Choose Plan</label>
            </div>
            <div className="grid grid-cols-3 gap-2 mb-3">
              {planMeta.map(({ key, icon: IconName, label, desc }) => {
                const isFree = key === "free";
                const usd = isFree ? 0 : getPlanPrice(key as PaidPlan, cycle, { promo });
                const std = isFree ? 0 : getStandardPrice(key as PaidPlan, cycle);
                const suffix = cycle === "yearly" ? "/yr" : "/mo";
                return (
                  <button key={key} onClick={() => setPlan(key)}
                    className={`relative flex flex-col items-center gap-1.5 py-3 px-2 rounded-none border transition-all ${
                      plan === key
                        ? "border-amber-400 bg-amber-400/10 shadow-[0_0_12px_rgba(251,191,36,0.15)]"
                        : "border-white/10 bg-white/4 hover:border-white/20"
                    }`}>
                    {plan === key && <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-none bg-amber-400" />}
                    <span className={`material-symbols-rounded ${plan === key ? "text-amber-400" : "text-white/35"}`} style={{ fontSize: "20px" }}>{IconName}</span>
                    <span className={`text-xs font-black ${plan === key ? "text-amber-400" : "text-white/55"}`}>{label}</span>
                    <span className="flex items-baseline gap-1">
                      <span className="text-[11px] text-white/70 font-black">${usd}<span className="text-white/30 font-bold">{isFree ? "" : suffix}</span></span>
                      {!isFree && promo && std > usd && (
                        <span className="text-[9px] text-white/25 line-through font-bold">${std}</span>
                      )}
                    </span>
                    <span className="text-[10px] text-white/20 text-center leading-tight">{desc}</span>
                  </button>
                );
              })}
            </div>
            {/* Feature lock list for selected plan */}
            <FeatureLockList plan={plan} />
          </div>

          {/* Step 3 — License type */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-5 h-5 rounded-none border border-black bg-amber-400 text-black text-[10px] font-black flex items-center justify-center shrink-0">3</span>
              <label className="text-xs font-bold text-white/50 uppercase tracking-widest">License Type</label>
            </div>

            {paid ? (
              <>
                {/* Trial vs Paid choice */}
                <div className="grid grid-cols-2 gap-2 mb-3">
                  <button onClick={() => setLicenseType("trial")}
                    className={`flex flex-col items-start gap-0.5 p-3 rounded-none border-2 transition-all text-left ${
                      licenseType === "trial" ? "border-amber-400 bg-amber-400/10" : "border-white/10 bg-white/4 hover:border-white/20"
                    }`}>
                    <span className="flex items-center gap-1.5">
                      <span className={`material-symbols-rounded ${licenseType === "trial" ? "text-amber-400" : "text-white/35"}`} style={{ fontSize: "16px" }}>schedule</span>
                      <span className={`text-xs font-black uppercase tracking-tight ${licenseType === "trial" ? "text-amber-400" : "text-white/60"}`}>Free Trial</span>
                    </span>
                    <span className="text-[10px] text-white/30">Time-limited, no charge</span>
                  </button>
                  <button onClick={() => setLicenseType("paid")}
                    className={`flex flex-col items-start gap-0.5 p-3 rounded-none border-2 transition-all text-left ${
                      licenseType === "paid" ? "border-amber-400 bg-amber-400/10" : "border-white/10 bg-white/4 hover:border-white/20"
                    }`}>
                    <span className="flex items-center gap-1.5">
                      <span className={`material-symbols-rounded ${licenseType === "paid" ? "text-amber-400" : "text-white/35"}`} style={{ fontSize: "16px" }}>verified</span>
                      <span className={`text-xs font-black uppercase tracking-tight ${licenseType === "paid" ? "text-amber-400" : "text-white/60"}`}>Paid License</span>
                    </span>
                    <span className="text-[10px] text-white/30">Monthly or annual</span>
                  </button>
                </div>

                <div className="bg-white/4 border border-white/10 rounded-none p-3.5">
                  {licenseType === "trial" ? (
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="material-symbols-rounded text-amber-400 shrink-0" style={{ fontSize: "14px" }}>schedule</span>
                      <input type="number" value={trialDays}
                        onChange={e => setTrialDays(Math.max(1, Math.min(90, parseInt(e.target.value) || 7)))}
                        min={1} max={90}
                        className="w-16 bg-black/30 border border-white/10 rounded-none px-2 py-1.5 text-sm text-white text-center focus:outline-none focus:border-amber-400/50" />
                      <span className="text-xs text-white/40 font-bold uppercase tracking-wider">days free trial</span>
                      <div className="flex gap-1 ml-auto">
                        {[7, 14, 30].map(d => (
                          <button key={d} onClick={() => setTrialDays(d)}
                            className={`text-[10px] font-bold px-2 py-1 rounded-none border transition-colors ${trialDays === d ? "bg-amber-400 text-black border-amber-400" : "bg-white/10 text-white/50 border-white/10 hover:bg-white/15"}`}>
                            {d}d
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-3">
                      {/* Billing cycle segmented control */}
                      <div>
                        <p className="text-[10px] text-white/30 uppercase tracking-widest mb-1.5 font-bold">Billing Cycle</p>
                        <div className="grid grid-cols-2 gap-2">
                          {(["monthly", "yearly"] as BillingCycle[]).map(c => {
                            const usd = getPlanPrice(plan as PaidPlan, c, { promo });
                            return (
                              <button key={c} onClick={() => setCycle(c)}
                                className={`flex items-center justify-between px-3 py-2 rounded-none border-2 transition-all ${
                                  cycle === c ? "border-amber-400 bg-amber-400/10" : "border-white/10 bg-black/20 hover:border-white/20"
                                }`}>
                                <span className={`text-xs font-black uppercase tracking-tight ${cycle === c ? "text-amber-400" : "text-white/55"}`}>
                                  {c === "yearly" ? "Annual" : "Monthly"}
                                </span>
                                <span className={`text-xs font-black ${cycle === c ? "text-white" : "text-white/40"}`}>
                                  ${usd}<span className="text-white/30 font-bold">{c === "yearly" ? "/yr" : "/mo"}</span>
                                </span>
                              </button>
                            );
                          })}
                        </div>
                        {cycle === "yearly" && (
                          <p className="text-[10px] text-green-400/80 font-bold mt-1.5 flex items-center gap-1">
                            <span className="material-symbols-rounded" style={{ fontSize: "11px" }}>savings</span>
                            Best value — billed once a year
                          </p>
                        )}
                      </div>

                      {/* Renewal date — auto / lifetime / manual override */}
                      <div className="border-t border-white/8 pt-3">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-[10px] text-white/30 uppercase tracking-widest font-bold">Renewal Date</p>
                          <label className="flex items-center gap-1.5 cursor-pointer">
                            <span className="text-[10px] text-white/40 font-bold uppercase tracking-wider">Lifetime ∞</span>
                            <Toggle checked={lifetime} onChange={setLifetime} />
                          </label>
                        </div>
                        {lifetime ? (
                          <p className="text-xs text-white/50 flex items-center gap-1.5">
                            <span className="material-symbols-rounded text-amber-400" style={{ fontSize: "14px" }}>all_inclusive</span>
                            Never expires — no renewal date
                          </p>
                        ) : (
                          <div className="flex items-center gap-2">
                            <span className="material-symbols-rounded text-white/35 shrink-0" style={{ fontSize: "14px" }}>event</span>
                            <input type="date" value={endsAt} onChange={e => setEndsAt(e.target.value)}
                              className="flex-1 bg-black/30 border border-white/10 rounded-none px-3 py-1.5 text-sm text-white focus:outline-none focus:border-amber-400/50" />
                            <span className="text-[10px] text-white/30 font-bold uppercase tracking-wider whitespace-nowrap">
                              {endsAt ? "override" : `auto · ${fmt(resolvedEnd)}`}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="bg-white/4 border border-white/10 rounded-none p-3.5 flex items-center gap-2">
                <span className="material-symbols-rounded text-white/35 shrink-0" style={{ fontSize: "16px" }}>info</span>
                <p className="text-xs text-white/45">The Free plan has no billing — it activates immediately and never expires.</p>
              </div>
            )}
          </div>

          {/* Live license summary */}
          {selectedUser && (
            <div className="border-2 border-amber-400/40 bg-amber-400/5 rounded-none p-3.5">
              <p className="text-[10px] text-amber-400/70 uppercase tracking-widest mb-2 font-black flex items-center gap-1.5">
                <span className="material-symbols-rounded" style={{ fontSize: "12px" }}>receipt_long</span> License Summary
              </p>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs">
                <span className="text-white/40">Subscriber</span>
                <span className="text-white font-bold text-right truncate">{selectedUser.displayName ?? selectedUser.username}</span>
                <span className="text-white/40">Plan</span>
                <span className="font-black text-right" style={{ color: PLAN_DISPLAY[plan].color }}>{PLAN_DISPLAY[plan].name}</span>
                <span className="text-white/40">Type</span>
                <span className="text-white font-bold text-right">
                  {!paid ? "Free" : isTrial ? `Free trial · ${trialDays}d` : `Paid · ${cycle === "yearly" ? "Annual" : "Monthly"}`}
                </span>
                {paid && !isTrial && (
                  <>
                    <span className="text-white/40">Price</span>
                    <span className="text-white font-bold text-right">${getPlanPrice(plan as PaidPlan, cycle, { promo })}{cycle === "yearly" ? "/yr" : "/mo"}{promo ? " (promo)" : ""}</span>
                  </>
                )}
                <span className="text-white/40">Starts</span>
                <span className="text-white font-bold text-right">{fmt(new Date())}</span>
                <span className="text-white/40">{isTrial ? "Trial ends" : "Renews / ends"}</span>
                <span className="text-white font-bold text-right">
                  {isTrial ? fmt(new Date(Date.now() + trialDays * 86400000)) : resolvedEnd ? fmt(resolvedEnd) : "∞ Lifetime"}
                </span>
              </div>
            </div>
          )}

          {/* Note */}
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="material-symbols-rounded text-white/25 shrink-0" style={{ fontSize: "14px" }}>description</span>
              <label className="text-xs font-bold text-white/35 uppercase tracking-widest">Admin Note (optional)</label>
            </div>
            <input value={note} onChange={e => setNote(e.target.value)}
              placeholder="e.g. Promo — Phnom Penh driving school"
              className="w-full bg-white/4 border border-white/10 rounded-none px-3 py-2.5 text-sm text-white placeholder-white/20 focus:outline-none focus:border-amber-400/30 transition-colors" />
          </div>
        </div>

        {/* Footer CTA */}
        <div className="px-5 pb-5 shrink-0 border-t border-white/8 pt-4">
          <button onClick={submit} disabled={loading || success || !selectedUser}
            className="w-full flex items-center justify-center gap-2 bg-amber-400 text-black font-black py-3.5 border-2 border-black rounded-none hover:bg-amber-300 transition-all disabled:opacity-40 disabled:cursor-not-allowed text-sm shadow-[3px_3px_0_#000] hover:shadow-[4px_4px_0_#000]">
            {loading ? <><span className="material-symbols-rounded animate-spin" style={{ fontSize: "15px" }}>refresh</span> Assigning...</>
              : success ? <><span className="material-symbols-rounded" style={{ fontSize: "15px" }}>check_circle</span> Done!</>
              : <><span className="material-symbols-rounded" style={{ fontSize: "15px" }}>shield</span> Assign {PLAN_DISPLAY[plan].name}{selectedUser ? ` → @${selectedUser.username}` : ""}</>
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
  const [billingCycle, setBillingCycle] = useState<string>(sub.billingCycle ?? "");
  const [loading, setLoading] = useState(false);

  async function save() {
    setLoading(true);
    await fetch(`/api/admin/subscriptions/${sub.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, note: note || null, endsAt: endsAt || null, billingCycle: billingCycle || null }),
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
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
      <div className="bg-[#111] border-2 border-black rounded-none w-full max-w-sm shadow-[8px_8px_0_#000] overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
          <div>
            <h2 className="text-base font-black text-white uppercase tracking-tight">Edit Subscription</h2>
            <p className="text-xs text-white/30 font-bold uppercase tracking-wider">#{sub.id} · {sub.userName ?? sub.userEmail}</p>
          </div>
          <button onClick={onClose} className="w-7 h-7 rounded-none border border-white/10 bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/40 hover:text-white transition-colors">
            <span className="material-symbols-rounded" style={{ fontSize: "14px" }}>close</span>
          </button>
        </div>
        <div className="px-5 py-4 flex flex-col gap-4">
          <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-none px-3 py-2.5">
            <div className="w-8 h-8 rounded-none border border-white/20 bg-white/10 text-white text-xs font-black flex items-center justify-center">
              {(sub.userName ?? sub.userEmail).slice(0, 2).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-white truncate">{sub.userName ?? sub.userEmail}</p>
              <p className="text-xs truncate font-bold uppercase tracking-wider" style={{ color: planDisplay?.color }}>{planDisplay?.name ?? sub.plan}</p>
            </div>
          </div>
          <div>
            <label className="block text-xs text-white/40 uppercase tracking-widest mb-2 font-bold">Status</label>
            <div className="grid grid-cols-2 gap-2">
              {(["active", "trial", "expired", "cancelled"] as SubStatus[]).map(s => {
                const cfg = STATUS_CONFIG[s];
                return (
                  <button key={s} onClick={() => setStatus(s)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-none border text-xs font-bold transition-all ${
                      status === s ? cfg.color + " border-current" : "border-white/10 text-white/40 hover:border-white/20"
                    }`}>
                    <span className="material-symbols-rounded shrink-0" style={{ fontSize: "12px" }}>{cfg.icon}</span> {cfg.label}
                  </button>
                );
              })}
            </div>
          </div>
          {sub.plan !== "free" && (
            <div>
              <label className="block text-xs text-white/40 uppercase tracking-widest mb-2 font-bold">Billing Cycle</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { v: "monthly", label: "Monthly" },
                  { v: "yearly", label: "Annual" },
                  { v: "", label: "Lifetime ∞" },
                ].map(({ v, label }) => (
                  <button key={v} onClick={() => setBillingCycle(v)}
                    className={`px-2 py-2 rounded-none border text-xs font-bold transition-all ${
                      billingCycle === v ? "border-amber-400 bg-amber-400/10 text-amber-400" : "border-white/10 text-white/40 hover:border-white/20"
                    }`}>
                    {label}
                  </button>
                ))}
              </div>
            </div>
          )}
          <div>
            <label className="block text-xs text-white/40 uppercase tracking-widest mb-1.5 font-bold">Ends At</label>
            <input type="date" value={endsAt} onChange={e => setEndsAt(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-none px-3 py-2.5 text-sm text-white focus:outline-none focus:border-amber-400/50" />
          </div>
          <div>
            <label className="block text-xs text-white/40 uppercase tracking-widest mb-1.5 font-bold">Note</label>
            <textarea value={note} onChange={e => setNote(e.target.value)} rows={2}
              className="w-full bg-white/5 border border-white/10 rounded-none px-3 py-2 text-sm text-white placeholder-white/20 focus:outline-none resize-none" />
          </div>
          <div className="flex gap-2">
            <button onClick={save} disabled={loading}
              className="flex-1 bg-amber-400 text-black font-black py-2.5 rounded-none border-2 border-black hover:bg-amber-300 disabled:opacity-50 text-sm transition-colors shadow-[2px_2px_0_#000] hover:shadow-[3px_3px_0_#000]">
              {loading ? "Saving..." : "Save Changes"}
            </button>
            <button onClick={revoke}
              className="px-3 py-2.5 bg-red-500/10 border border-red-500/30 text-red-400 rounded-none hover:bg-red-500/20 transition-colors">
              <span className="material-symbols-rounded" style={{ fontSize: "15px" }}>delete</span>
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
          <h1 className="text-2xl font-black flex items-center gap-2 uppercase tracking-tight">
            <span className="material-symbols-rounded text-amber-400" style={{ fontSize: "24px" }}>shield</span> Subscriptions
          </h1>
          <p className="text-white/40 text-sm mt-0.5 font-bold uppercase tracking-wider">Admin-only · all changes are logged</p>
        </div>
        <div className="flex gap-2">
          <button onClick={refresh} disabled={loading} className="p-2.5 bg-white/5 border border-white/10 rounded-none hover:bg-white/10 transition-colors">
            <span className={`material-symbols-rounded ${loading ? "animate-spin" : ""}`} style={{ fontSize: "16px" }}>refresh</span>
          </button>
          <button onClick={() => setShowAssign(true)}
            className="flex items-center gap-2 bg-amber-400 text-black font-black px-4 py-2.5 border-2 border-black rounded-none hover:bg-amber-300 transition-colors text-sm shadow-[3px_3px_0_#000] hover:shadow-[4px_4px_0_#000]">
            <span className="material-symbols-rounded font-black" style={{ fontSize: "16px" }}>add</span> Assign Plan
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
        {[
          { label: "Total",       value: stats.total,       icon: "group",          color: "text-white" },
          { label: "Active",      value: stats.active,      icon: "check_circle",   color: "text-green-400" },
          { label: "Trials",      value: stats.trial,       icon: "schedule",       color: "text-amber-400" },
          { label: "Teacher Pro", value: stats.teacher_pro, icon: "crown",          color: "text-amber-400" },
          { label: "School",      value: stats.school,      icon: "domain",         color: "text-purple-400" },
        ].map(s => {
          return (
            <div key={s.label} className="bg-white/5 border border-white/10 rounded-none p-4 shadow-sm">
              <span className={`material-symbols-rounded ${s.color} mb-1`} style={{ fontSize: "18px" }}>{s.icon}</span>
              <p className="text-2xl font-black">{s.value}</p>
              <p className="text-xs text-white/40 font-bold uppercase tracking-wider mt-0.5">{s.label}</p>
            </div>
          );
        })}
      </div>

      <div className="flex flex-wrap gap-3 mb-5">
        <div className="relative flex-1 min-w-[200px]">
          <span className="material-symbols-rounded absolute left-3 top-1/2 -translate-y-1/2 text-white/30" style={{ fontSize: "15px" }}>search</span>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search user..."
            className="w-full bg-white/5 border border-white/10 rounded-none pl-8 pr-3 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:border-amber-400/50" />
        </div>
        <BrandSelect value={filterPlan} onValueChange={setFilterPlan} variant="dark"
          ariaLabel="Filter by plan" className="px-3 py-2.5 text-sm"
          options={[
            { value: "all", label: "All Plans" },
            { value: "free", label: "Free" },
            { value: "teacher_pro", label: "Teacher Pro" },
            { value: "school", label: "School" },
            { value: "family", label: "Family" },
            { value: "driving_school", label: "Driving School" },
          ]} />
        <BrandSelect value={filterStatus} onValueChange={setFilterStatus} variant="dark"
          ariaLabel="Filter by status" className="px-3 py-2.5 text-sm"
          options={[
            { value: "all", label: "All Status" },
            { value: "active", label: "Active" },
            { value: "trial", label: "Trial" },
            { value: "expired", label: "Expired" },
            { value: "cancelled", label: "Cancelled" },
          ]} />
      </div>

      <div className="bg-white/5 border border-white/10 rounded-none overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10 text-white/40 text-xs uppercase tracking-widest">
                <th className="text-left px-4 py-3 font-bold">User</th>
                <th className="text-left px-4 py-3 font-bold">Plan</th>
                <th className="text-left px-4 py-3 font-bold">Status</th>
                <th className="text-left px-4 py-3 font-bold">Billing</th>
                <th className="text-left px-4 py-3 font-bold">Starts</th>
                <th className="text-left px-4 py-3 font-bold">Ends</th>
                <th className="text-left px-4 py-3 font-bold">Note</th>
                <th className="text-left px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr><td colSpan={8} className="text-center py-12 text-white/30 font-bold uppercase tracking-wider">No subscriptions found</td></tr>
              )}
              {filtered.map(row => {
                const iconName = PLAN_ICONS[row.plan as PlanTier] ?? "bolt";
                const planDisplay = PLAN_DISPLAY[row.plan as PlanTier];
                const statusCfg = STATUS_CONFIG[row.status as SubStatus] ?? STATUS_CONFIG.cancelled;
                const days = row.isTrial ? daysLeft(row.trialEndsAt) : daysLeft(row.endsAt);
                return (
                  <tr key={row.id} className="border-b border-white/5 hover:bg-white/4 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-none border border-white/15 bg-white/10 text-white text-xs font-black flex items-center justify-center shrink-0">
                          {(row.userName ?? row.userEmail).slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-white text-sm">{row.userName ?? "—"}</p>
                          <p className="text-xs text-white/40 font-mono">@{row.userEmail.split("@")[0]} ({row.userEmail})</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <span className="material-symbols-rounded shrink-0" style={{ color: planDisplay?.color, fontSize: "14px" }}>{iconName}</span>
                        <span className="font-bold text-sm" style={{ color: planDisplay?.color }}>{planDisplay?.name ?? row.plan}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-none border ${statusCfg.color}`}>
                        <span className="material-symbols-rounded shrink-0" style={{ fontSize: "11px" }}>{statusCfg.icon}</span>{statusCfg.label}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {row.isTrial ? (
                        <div>
                          <span className="text-xs text-amber-400 font-bold uppercase tracking-wide">Trial</span>
                          {days !== null && <p className={`text-xs ${days <= 3 ? "text-red-400 font-bold" : "text-white/40"}`}>{days > 0 ? `${days}d left` : "Expired"}</p>}
                        </div>
                      ) : row.billingCycle === "monthly" || row.billingCycle === "yearly" ? (
                        <div>
                          <span className="text-xs text-white/70 font-bold uppercase tracking-wide">{row.billingCycle === "yearly" ? "Annual" : "Monthly"}</span>
                          {isPaidPlan(row.plan) && (
                            <p className="text-xs text-white/40 font-mono">
                              ${getPlanPrice(row.plan, row.billingCycle as BillingCycle)}{row.billingCycle === "yearly" ? "/yr" : "/mo"}
                            </p>
                          )}
                        </div>
                      ) : row.plan !== "free" && !row.endsAt ? (
                        <span className="text-xs text-white/40 font-bold uppercase tracking-wide flex items-center gap-1">
                          <span className="material-symbols-rounded" style={{ fontSize: "12px" }}>all_inclusive</span> Lifetime
                        </span>
                      ) : <span className="text-xs text-white/20">—</span>}
                    </td>
                    <td className="px-4 py-3 text-xs text-white/50">{fmt(row.startsAt)}</td>
                    <td className="px-4 py-3 text-xs text-white/50">
                      {row.endsAt ? <span className={days !== null && days <= 7 ? "text-red-400 font-bold" : ""}>{fmt(row.endsAt)}</span> : "∞"}
                    </td>
                    <td className="px-4 py-3 text-xs text-white/40 max-w-[120px] truncate">{row.note ?? "—"}</td>
                    <td className="px-4 py-3">
                      <button onClick={() => setEditSub(row)} className="p-1.5 bg-white/5 border border-white/10 rounded-none hover:bg-white/10 transition-colors">
                        <span className="material-symbols-rounded" style={{ fontSize: "14px" }}>edit</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-5 bg-amber-400/5 border border-amber-400/20 rounded-none p-4 flex items-start gap-3">
        <span className="material-symbols-rounded text-amber-400 shrink-0 mt-0.5" style={{ fontSize: "16px" }}>warning</span>
        <div>
          <p className="text-sm font-bold text-amber-400 uppercase tracking-tight">Anti-Cheat Policy</p>
          <p className="text-xs text-white/40 mt-0.5 font-bold">Admin-assigned only. No self-upgrade, no payment bypass. Every action logged. New teacher accounts auto-receive a 7-day Teacher Pro trial.</p>
        </div>
      </div>
    </div>
  );
}
