"use client";

import { useCallback, useEffect, useState } from "react";
import { REWARD_ITEMS } from "@/lib/rewards";

type ClaimStatus = "pending" | "accepted" | "fulfilled" | "rejected";

interface TeacherClaim {
  id: number;
  itemId: number;
  itemName: string;
  cost: number;
  status: ClaimStatus;
  studentNote: string | null;
  teacherNote: string | null;
  createdAt: string;
  decidedAt: string | null;
  fulfilledAt: string | null;
  studentId: number;
  studentUsername: string | null;
  studentName: string | null;
  studentAvatar: string | null;
  className: string | null;
}

const STATUS_META: Record<
  ClaimStatus,
  { label: string; color: string; icon: string }
> = {
  pending: { label: "PENDING", color: "#f97316", icon: "hourglass_top" },
  accepted: { label: "PREPARING", color: "#3b82f6", icon: "inventory_2" },
  fulfilled: { label: "GIVEN", color: "#22c55e", icon: "task_alt" },
  rejected: { label: "REJECTED", color: "#ef4444", icon: "cancel" },
};

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export function ClaimsContent() {
  const [activeTab, setActiveTab] = useState<"claims" | "inventory">("claims");
  const [claims, setClaims] = useState<TeacherClaim[]>([]);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [error, setError] = useState("");

  // Inventory states
  const [inventory, setInventory] = useState<any[]>([]);
  const [savingInv, setSavingInv] = useState(false);
  const [invError, setInvError] = useState("");
  const [invSuccess, setInvSuccess] = useState("");

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/teacher/claims", { cache: "no-store" });
      if (!res.ok) throw new Error("Failed to load claims");
      const data = await res.json();
      setClaims(data.claims ?? []);
      setCounts(data.countByStatus ?? {});
    } catch {
      setError("Could not load reward claims. Try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  const loadInventory = useCallback(async () => {
    try {
      const res = await fetch("/api/teacher/inventory", { cache: "no-store" });
      if (!res.ok) throw new Error("Failed to load inventory");
      const data = await res.json();
      
      const serverInv = data.inventory ?? [];
      const initialized = REWARD_ITEMS.map((item) => {
        const existing = serverInv.find((i: any) => i.itemId === item.id);
        return {
          itemId: item.id,
          name: item.name,
          nameKh: item.nameKh,
          cost: item.cost,
          stock: existing ? existing.stock : 10,
          frozen: existing ? !!existing.frozen : false,
          pushed: existing ? !!existing.pushed : false,
        };
      });
      setInventory(initialized);
    } catch (e) {
      console.error("Error loading inventory:", e);
    }
  }, []);

  useEffect(() => {
    load();
    loadInventory();
    const t = setInterval(load, 20000);
    return () => clearInterval(t);
  }, [load, loadInventory]);

  async function act(id: number, action: "accept" | "reject" | "fulfill") {
    if (action === "reject" && !confirm("Reject this claim? The student's points are refunded.")) return;
    setBusyId(id);
    setError("");
    try {
      const res = await fetch(`/api/teacher/claims/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.error || "Action failed");
      }
      await load();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusyId(null);
    }
  }

  async function saveInventory() {
    setSavingInv(true);
    setInvError("");
    setInvSuccess("");
    try {
      const res = await fetch("/api/teacher/inventory", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ inventory }),
      });
      if (!res.ok) throw new Error("Failed to save inventory settings");
      setInvSuccess("Inventory settings saved successfully!");
      setTimeout(() => setInvSuccess(""), 3000);
    } catch (e) {
      setInvError((e as Error).message);
    } finally {
      setSavingInv(false);
    }
  }

  const handleStockChange = (itemId: number, value: string) => {
    const stockVal = value === "" ? 0 : Math.max(0, parseInt(value) || 0);
    setInventory((prev) =>
      prev.map((i) => (i.itemId === itemId ? { ...i, stock: stockVal } : i))
    );
  };

  const toggleFrozen = (itemId: number) => {
    setInventory((prev) =>
      prev.map((i) => (i.itemId === itemId ? { ...i, frozen: !i.frozen } : i))
    );
  };

  const togglePushed = (itemId: number) => {
    setInventory((prev) =>
      prev.map((i) => (i.itemId === itemId ? { ...i, pushed: !i.pushed } : i))
    );
  };

  const pending = claims.filter((c) => c.status === "pending");
  const preparing = claims.filter((c) => c.status === "accepted");
  const history = claims.filter((c) => c.status === "fulfilled" || c.status === "rejected");

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="border-4 border-black bg-yellow-400 shadow-[6px_6px_0_#000] p-5 mb-6">
        <div className="flex items-center gap-3">
          <span className="material-symbols-rounded text-black" style={{ fontSize: "32px" }}>
            redeem
          </span>
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-black leading-none tracking-tight">
              REWARD CLAIMS & STORE CONTROL
            </h1>
            <p className="text-black/70 text-xs font-bold mt-1">
              Manage student claims and customize store item availability, stock count, and freeze status.
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 mt-4">
          <StatPill label="Pending" value={counts.pending ?? 0} color="#f97316" />
          <StatPill label="Preparing" value={counts.accepted ?? 0} color="#3b82f6" />
          <StatPill label="Given" value={counts.fulfilled ?? 0} color="#22c55e" />
        </div>
      </div>

      {/* Tabs Menu */}
      <div className="flex border-b-4 border-black mb-6">
        <button
          onClick={() => setActiveTab("claims")}
          className={`px-5 py-3 font-black text-sm border-t-4 border-x-4 border-black transition-all ${
            activeTab === "claims"
              ? "bg-black text-white translate-y-[4px]"
              : "bg-white text-black hover:bg-yellow-300"
          }`}
        >
          STUDENT CLAIMS ({pending.length + preparing.length})
        </button>
        <button
          onClick={() => setActiveTab("inventory")}
          className={`px-5 py-3 font-black text-sm border-t-4 border-x-4 border-black border-l-0 transition-all ${
            activeTab === "inventory"
              ? "bg-black text-white translate-y-[4px]"
              : "bg-white text-black hover:bg-yellow-300"
          }`}
        >
          MANAGE STORE INVENTORY
        </button>
      </div>

      {error && (
        <div className="border-2 border-black bg-red-100 text-red-800 font-bold text-sm p-3 mb-4 shadow-[3px_3px_0_#000]">
          {error}
        </div>
      )}

      {activeTab === "claims" ? (
        loading ? (
          <p className="text-center text-zinc-500 font-bold py-12">Loading claims…</p>
        ) : claims.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="space-y-8">
            <Section title="Needs your action" icon="notifications_active" count={pending.length}>
              {pending.length === 0 ? (
                <Muted>No pending claims right now.</Muted>
              ) : (
                pending.map((c) => (
                  <ClaimRow key={c.id} c={c} busy={busyId === c.id}>
                    <ActionBtn label="Accept" icon="check" color="#22c55e" onClick={() => act(c.id, "accept")} disabled={busyId === c.id} />
                    <ActionBtn label="Reject" icon="close" color="#ef4444" outline onClick={() => act(c.id, "reject")} disabled={busyId === c.id} />
                  </ClaimRow>
                ))
              )}
            </Section>

            <Section title="Preparing to give" icon="inventory_2" count={preparing.length}>
              {preparing.length === 0 ? (
                <Muted>Nothing being prepared.</Muted>
              ) : (
                preparing.map((c) => (
                  <ClaimRow key={c.id} c={c} busy={busyId === c.id}>
                    <ActionBtn label="Mark as given" icon="task_alt" color="#22c55e" onClick={() => act(c.id, "fulfill")} disabled={busyId === c.id} />
                    <ActionBtn label="Reject" icon="close" color="#ef4444" outline onClick={() => act(c.id, "reject")} disabled={busyId === c.id} />
                  </ClaimRow>
                ))
              )}
            </Section>

            {history.length > 0 && (
              <Section title="History" icon="history" count={history.length}>
                {history.map((c) => (
                  <ClaimRow key={c.id} c={c} busy={false} />
                ))}
              </Section>
            )}
          </div>
        )
      ) : (
        /* Inventory Management Tab */
        <div className="space-y-6">
          {invError && (
            <div className="border-2 border-black bg-red-100 text-red-800 font-bold text-sm p-3 shadow-[3px_3px_0_#000]">
              {invError}
            </div>
          )}
          {invSuccess && (
            <div className="border-2 border-black bg-green-100 text-green-800 font-bold text-sm p-3 shadow-[3px_3px_0_#000]">
              {invSuccess}
            </div>
          )}

          <div className="bg-white border-4 border-black p-5 shadow-[6px_6px_0_#000]">
            <h2 className="text-lg font-black text-black uppercase mb-4 flex items-center gap-2">
              <span className="material-symbols-rounded">inventory</span>
              Teacher Stock Controller
            </h2>

            <div className="divide-y-2 divide-black">
              {inventory.map((item) => (
                <div key={item.itemId} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-zinc-100 border-2 border-black flex items-center justify-center shrink-0">
                      <img src={`/rewards/${item.name.toLowerCase()}.webp`} alt="" className="w-full h-full object-cover" onError={(e) => { (e.target as any).src = "/rewards/eraser.webp"; }} />
                    </div>
                    <div>
                      <span className="font-black text-black block leading-none">{item.name} / {item.nameKh}</span>
                      <span className="text-xs font-bold text-zinc-500 font-mono mt-1 block">{item.cost.toLocaleString()} PTS</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    {/* Stock Count */}
                    <div className="flex items-center gap-2 bg-zinc-50 border-2 border-black px-2.5 py-1.5 shadow-[2px_2px_0_#000]">
                      <span className="text-[10px] font-black uppercase text-zinc-500">Stock:</span>
                      <input
                        type="number"
                        min="0"
                        value={item.stock}
                        onChange={(e) => handleStockChange(item.itemId, e.target.value)}
                        className="w-14 font-mono font-black text-center text-sm border-b border-black outline-none bg-transparent"
                      />
                    </div>

                    {/* Freeze toggle */}
                    <button
                      onClick={() => toggleFrozen(item.itemId)}
                      className={`px-3 py-1.5 text-xs font-black uppercase border-2 border-black shadow-[2px_2px_0_#000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all flex items-center gap-1 ${
                        item.frozen ? "bg-red-500 text-white" : "bg-white text-black hover:bg-yellow-300"
                      }`}
                    >
                      <span className="material-symbols-rounded text-sm" style={{ fontSize: "14px" }}>
                        {item.frozen ? "ac_unit" : "check_circle"}
                      </span>
                      {item.frozen ? "Frozen" : "Active"}
                    </button>

                    {/* Push toggle */}
                    <button
                      onClick={() => togglePushed(item.itemId)}
                      className={`px-3 py-1.5 text-xs font-black uppercase border-2 border-black shadow-[2px_2px_0_#000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all flex items-center gap-1 ${
                        item.pushed ? "bg-yellow-400 text-black" : "bg-white text-black hover:bg-yellow-300"
                      }`}
                    >
                      <span className="material-symbols-rounded text-sm" style={{ fontSize: "14px" }}>
                        {item.pushed ? "push_pin" : "keep"}
                      </span>
                      {item.pushed ? "Featured" : "Feature"}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 pt-4 border-t-2 border-dashed border-zinc-200 flex justify-end">
              <button
                onClick={saveInventory}
                disabled={savingInv}
                className="bg-yellow-400 hover:bg-yellow-500 text-black border-4 border-black px-6 py-3 font-black text-sm uppercase shadow-[4px_4px_0_#000] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none transition-all disabled:opacity-50 flex items-center gap-2"
              >
                <span className="material-symbols-rounded">save</span>
                {savingInv ? "Saving settings..." : "Save inventory settings"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatPill({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="flex items-center gap-1.5 bg-white border-2 border-black px-3 py-1 shadow-[2px_2px_0_#000]">
      <span className="w-2.5 h-2.5 border border-black" style={{ background: color }} />
      <span className="font-black text-black tabular-nums">{value}</span>
      <span className="text-[10px] font-bold uppercase tracking-wide text-black/60">{label}</span>
    </div>
  );
}

function Section({ title, icon, count, children }: { title: string; icon: string; count: number; children: React.ReactNode }) {
  return (
    <section>
      <div className="flex items-center gap-2 mb-3">
        <span className="material-symbols-rounded text-black" style={{ fontSize: "20px" }}>{icon}</span>
        <h2 className="font-black text-black uppercase tracking-wide text-sm">{title}</h2>
        <span className="font-black text-black/40 tabular-nums">({count})</span>
      </div>
      <div className="space-y-3">{children}</div>
    </section>
  );
}

function Muted({ children }: { children: React.ReactNode }) {
  return <p className="text-zinc-400 font-bold text-sm pl-7">{children}</p>;
}

function ClaimRow({ c, busy, children }: { c: TeacherClaim; busy: boolean; children?: React.ReactNode }) {
  const meta = STATUS_META[c.status];
  const name = c.studentName || c.studentUsername || `Student #${c.studentId}`;
  return (
    <div className={`border-2 border-black bg-white shadow-[4px_4px_0_#000] p-4 ${busy ? "opacity-60" : ""}`}>
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-start gap-3 min-w-0">
          <div className="w-10 h-10 border-2 border-black bg-zinc-100 flex items-center justify-center shrink-0 overflow-hidden">
            {c.studentAvatar ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={c.studentAvatar} alt="" className="w-full h-full object-cover" />
            ) : (
              <span className="material-symbols-rounded text-black" style={{ fontSize: "20px" }}>person</span>
            )}
          </div>
          <div className="min-w-0">
            <p className="font-black text-black leading-tight truncate">{name}</p>
            <p className="text-xs text-zinc-500 font-bold">
              {c.studentUsername ? `@${c.studentUsername}` : ""}{c.className ? ` · ${c.className}` : ""}
            </p>
            <div className="flex items-center gap-2 mt-1.5">
              <span className="font-black text-black">{c.itemName}</span>
              <span className="text-xs font-black tabular-nums px-1.5 py-0.5 border-2 border-black bg-yellow-300">
                {c.cost.toLocaleString()} pts
              </span>
            </div>
            {c.studentNote && (
              <p className="text-xs text-zinc-600 italic mt-1">“{c.studentNote}”</p>
            )}
            <p className="text-[11px] text-zinc-400 font-bold mt-1">{timeAgo(c.createdAt)}</p>
          </div>
        </div>
        <span
          className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wide px-2 py-1 border-2 border-black text-white shrink-0"
          style={{ background: meta.color }}
        >
          <span className="material-symbols-rounded" style={{ fontSize: "14px" }}>{meta.icon}</span>
          {meta.label}
        </span>
      </div>
      {children && <div className="flex gap-2 mt-3 pt-3 border-t-2 border-dashed border-zinc-200">{children}</div>}
    </div>
  );
}

function ActionBtn({ label, icon, color, outline, onClick, disabled }: {
  label: string; icon: string; color: string; outline?: boolean; onClick: () => void; disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="inline-flex items-center gap-1.5 font-black text-sm px-3 py-1.5 border-2 border-black shadow-[3px_3px_0_#000] active:translate-x-[3px] active:translate-y-[3px] active:shadow-none transition disabled:opacity-50 disabled:cursor-not-allowed"
      style={{ background: outline ? "#fff" : color, color: outline ? color : "#fff" }}
    >
      <span className="material-symbols-rounded" style={{ fontSize: "16px" }}>{icon}</span>
      {label}
    </button>
  );
}

function EmptyState() {
  return (
    <div className="border-4 border-dashed border-zinc-300 p-12 text-center">
      <span className="material-symbols-rounded text-zinc-300" style={{ fontSize: "48px" }}>redeem</span>
      <p className="font-black text-zinc-500 mt-2">No reward claims yet</p>
      <p className="text-sm text-zinc-400 font-bold">
        When your students claim store items with their live-game points, they show up here.
      </p>
    </div>
  );
}
