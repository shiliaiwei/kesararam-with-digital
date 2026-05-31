"use client";

import { useState, useEffect, useTransition, useCallback } from "react";
import {
  Search, Plus, Edit3, Trash2, Eye, UserCheck, UserX,
  RefreshCw, Activity, Wifi, Clock, Crown, X,
} from "lucide-react";
import { createUser, updateUser, deleteUser, toggleUserActive } from "@/app/actions/users";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

// ── Types ─────────────────────────────────────────────────────────────────────
type Role = "student" | "teacher" | "admin" | "staff";

interface UserRow {
  id: number;
  username: string;
  email: string;
  displayName: string | null;
  schoolName?: string | null;
  province?: string | null;
  gradeLevel?: string | null;
  section?: string | null;
  role: Role;
  isActive: boolean;
  isSuspended?: boolean;
  loginAttempts: number;
  createdAt: string | Date;
  lastLoginAt?: string | Date | null;
  lastActivityAt?: string | Date | null;
  totalSessions?: number;
  timeSpent?: number;       // minutes
  isOnline?: boolean;
  lifetimePoints?: number;
  totalGamesPlayed?: number;
  plan?: string | null;
  planStatus?: string | null;
  isTrial?: boolean;
  trialEndsAt?: string | Date | null;
  planEndsAt?: string | Date | null;
}

const ROLE_CONFIG: Record<Role, { label: string; bg: string; text: string }> = {
  student: { label: "Student", bg: "bg-blue-400", text: "text-black" },
  teacher: { label: "Teacher", bg: "bg-green-400", text: "text-black" },
  admin: { label: "Admin", bg: "bg-red-400", text: "text-black" },
  staff: { label: "Staff", bg: "bg-yellow-400", text: "text-black" },
};

const PLAN_CONFIG: Record<string, { label: string; bg: string }> = {
  free: { label: "Free", bg: "bg-zinc-200" },
  teacher_pro: { label: "Pro", bg: "bg-amber-300" },
  school: { label: "School", bg: "bg-purple-300" },
};

function fmtTime(minutes: number) {
  if (!minutes) return "0m";
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

function fmtDate(d: string | Date | null | undefined) {
  if (!d) return "—";
  const date = new Date(d);
  if (isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

function timeAgo(d: string | Date | null | undefined) {
  if (!d) return null;
  const diff = Date.now() - new Date(d).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

// ── Role Picker ───────────────────────────────────────────────────────────────
function RolePicker({ value, onChange }: { value: Role; onChange: (v: Role) => void }) {
  return (
    <div className="grid grid-cols-4 gap-1.5">
      {(Object.keys(ROLE_CONFIG) as Role[]).map((r) => (
        <button key={r} type="button" onClick={() => onChange(r)}
          className={cn("py-2 px-1 font-black uppercase text-xs border-2 border-black transition-all",
            value === r ? `${ROLE_CONFIG[r].bg} shadow-[2px_2px_0_#000]` : "bg-white hover:bg-zinc-100"
          )}>
          {ROLE_CONFIG[r].label}
        </button>
      ))}
    </div>
  );
}

// ── Create User Dialog ────────────────────────────────────────────────────────
function CreateUserDialog({ onSuccess }: { onSuccess: () => void }) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const [role, setRole] = useState<Role>("student");

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      const res = await createUser(fd);
      if (res?.error) { setError(res.error); }
      else { setOpen(false); setError(""); setRole("student"); toast.success("User created"); onSuccess(); }
    });
  }

  if (!open) return (
    <button onClick={() => setOpen(true)}
      className="inline-flex items-center gap-2 px-4 py-2.5 bg-green-400 border-2 border-black font-black text-sm hover:shadow-[3px_3px_0_#000] transition-all">
      <Plus size={16} /> New User
    </button>
  );

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white border-4 border-black w-full max-w-md" style={{ boxShadow: "8px 8px 0 #000" }}>
        <div className="border-b-2 border-black bg-green-400 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-black uppercase">Create New User</h2>
          <button onClick={() => setOpen(false)} className="w-8 h-8 border-2 border-black bg-white hover:bg-red-400 flex items-center justify-center font-black text-lg">×</button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <input type="hidden" name="role" value={role} />
          {[
            { name: "username", label: "Username *", type: "text", placeholder: "sopheak01", required: true },
            { name: "email", label: "Email *", type: "email", placeholder: "user@kwd.tech", required: true },
            { name: "displayName", label: "Display Name", type: "text", placeholder: "Sopheak Chan", required: false },
            { name: "schoolName", label: "School Name", type: "text", placeholder: "Kesararam Primary School", required: false },
            { name: "province", label: "Province", type: "text", placeholder: "Siem Reap", required: false },
            { name: "gradeLevel", label: "Grade Level", type: "text", placeholder: "Grade 6", required: false },
            { name: "section", label: "Section", type: "text", placeholder: "Morning A", required: false },
            { name: "password", label: "Password *", type: "password", placeholder: "••••••••", required: true },
          ].map(f => (
            <div key={f.name} className="space-y-1">
              <label className="text-xs font-black uppercase tracking-widest">{f.label}</label>
              <input name={f.name} type={f.type} required={f.required} placeholder={f.placeholder}
                className="w-full p-2.5 border-2 border-black font-medium focus:outline-none focus:shadow-[2px_2px_0_#000]" />
            </div>
          ))}
          <div className="space-y-1">
            <label className="text-xs font-black uppercase tracking-widest">Role *</label>
            <RolePicker value={role} onChange={setRole} />
          </div>
          {error && <div className="p-3 border-2 border-black bg-red-400 text-sm font-bold">{error}</div>}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setOpen(false)}
              className="flex-1 py-2.5 border-2 border-black font-black text-sm hover:bg-zinc-100">Cancel</button>
            <button type="submit" disabled={pending}
              className="flex-1 py-2.5 bg-green-400 border-2 border-black font-black text-sm hover:shadow-[3px_3px_0_#000] disabled:opacity-50">
              {pending ? "Creating..." : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Edit User Dialog ──────────────────────────────────────────────────────────
function EditUserDialog({ user, onSuccess }: { user: UserRow; onSuccess: () => void }) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const [role, setRole] = useState<Role>(user.role);
  const [isActive, setIsActive] = useState(user.isActive);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      const res = await updateUser(user.id, fd);
      if (res?.error) { setError(res.error); }
      else { setOpen(false); toast.success("User updated"); onSuccess(); }
    });
  }

  if (!open) return (
    <button onClick={() => setOpen(true)}
      className="inline-flex items-center gap-1 px-2 py-1.5 text-xs font-black border-2 border-black bg-white hover:bg-blue-400 hover:shadow-[2px_2px_0_#000] transition-all">
      <Edit3 size={12} /> Edit
    </button>
  );

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white border-4 border-black w-full max-w-md" style={{ boxShadow: "8px 8px 0 #000" }}>
        <div className="border-b-2 border-black bg-blue-400 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-black uppercase">Edit User</h2>
            <p className="text-xs font-bold opacity-70">@{user.username}</p>
          </div>
          <button onClick={() => setOpen(false)} className="w-8 h-8 border-2 border-black bg-white hover:bg-red-400 flex items-center justify-center font-black text-lg">×</button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <input type="hidden" name="role" value={role} />
          <input type="hidden" name="isActive" value={String(isActive)} />
          {([
            { name: "email", label: "Email *", type: "email", defaultValue: user.email, required: true },
            { name: "displayName", label: "Display Name", type: "text", defaultValue: user.displayName ?? "", required: false },
            { name: "schoolName", label: "School Name", type: "text", defaultValue: user.schoolName ?? "", required: false },
            { name: "province", label: "Province", type: "text", defaultValue: user.province ?? "", required: false },
            { name: "gradeLevel", label: "Grade Level", type: "text", defaultValue: user.gradeLevel ?? "", required: false },
            { name: "section", label: "Section", type: "text", defaultValue: user.section ?? "", required: false },
            { name: "password", label: "New Password", type: "password", defaultValue: "", required: false, placeholder: "Leave blank to keep" },
          ] as Array<{ name: string; label: string; type: string; defaultValue: string; required: boolean; placeholder?: string }>).map(f => (
            <div key={f.name} className="space-y-1">
              <label className="text-xs font-black uppercase tracking-widest">{f.label}</label>
              <input name={f.name} type={f.type} required={f.required} defaultValue={f.defaultValue}
                placeholder={f.placeholder}
                className="w-full p-2.5 border-2 border-black font-medium focus:outline-none focus:shadow-[2px_2px_0_#000]" />
            </div>
          ))}
          <div className="space-y-1">
            <label className="text-xs font-black uppercase tracking-widest">Role</label>
            <RolePicker value={role} onChange={setRole} />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-black uppercase tracking-widest">Account Status</label>
            <div className="grid grid-cols-2 gap-2">
              {[{ v: true, label: "Active", bg: "bg-green-400" }, { v: false, label: "Inactive", bg: "bg-red-400" }].map(opt => (
                <button key={String(opt.v)} type="button" onClick={() => setIsActive(opt.v)}
                  className={cn("py-2 border-2 border-black font-black text-xs uppercase transition-all",
                    isActive === opt.v ? `${opt.bg} shadow-[2px_2px_0_#000]` : "bg-white hover:bg-zinc-100")}>
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
          {error && <div className="p-3 border-2 border-black bg-red-400 text-sm font-bold">{error}</div>}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setOpen(false)}
              className="flex-1 py-2.5 border-2 border-black font-black text-sm hover:bg-zinc-100">Cancel</button>
            <button type="submit" disabled={pending}
              className="flex-1 py-2.5 bg-blue-400 border-2 border-black font-black text-sm hover:shadow-[3px_3px_0_#000] disabled:opacity-50">
              {pending ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── User Detail Modal ─────────────────────────────────────────────────────────
function UserDetailModal({ user, onClose }: { user: UserRow; onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-white border-4 border-black w-full max-w-lg max-h-[90vh] overflow-y-auto" style={{ boxShadow: "8px 8px 0 #000" }}>
        {/* Header */}
        <div className="border-b-2 border-black bg-yellow-400 px-5 py-4 flex items-center justify-between sticky top-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 border-2 border-black bg-black text-yellow-400 flex items-center justify-center font-black text-lg">
              {(user.displayName || user.username).charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="font-black text-base leading-none">{user.displayName || user.username}</p>
              <p className="text-xs font-bold opacity-70">@{user.username}</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 border-2 border-black bg-white hover:bg-red-400 flex items-center justify-center font-black text-lg">×</button>
        </div>

        <div className="p-5 space-y-5">
          {/* Online status */}
          <div className="flex items-center gap-2">
            {user.isOnline
              ? <><span className="w-3 h-3 rounded-full bg-green-500 border border-black animate-pulse" /><span className="text-xs font-black text-green-700 uppercase">Online now</span></>
              : <><span className="w-3 h-3 rounded-full bg-zinc-400 border border-black" /><span className="text-xs font-bold text-zinc-500">Last seen {timeAgo(user.lastActivityAt) ?? "never"}</span></>
            }
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "Sessions", value: String(user.totalSessions ?? 0), bg: "bg-blue-100", icon: Activity },
              { label: "Time Spent", value: fmtTime(user.timeSpent ?? 0), bg: "bg-orange-100", icon: Clock },
              { label: "Games", value: String(user.totalGamesPlayed ?? 0), bg: "bg-purple-100", icon: Crown },
            ].map(({ label, value, bg, icon: Icon }) => (
              <div key={label} className={`${bg} border-2 border-black p-3 text-center`}>
                <Icon size={16} className="mx-auto mb-1 text-zinc-600" />
                <p className="text-xl font-black">{value}</p>
                <p className="text-[10px] font-black uppercase text-zinc-500">{label}</p>
              </div>
            ))}
          </div>

          {/* Info rows */}
          <div className="space-y-2 text-sm">
            {[
              { label: "Email", value: user.email },
              { label: "Role", value: ROLE_CONFIG[user.role]?.label ?? user.role },
              { label: "School", value: user.schoolName ?? "—" },
              { label: "Province", value: user.province ?? "—" },
              { label: "Grade", value: user.gradeLevel ?? "—" },
              { label: "Section", value: user.section ?? "—" },
              { label: "Plan", value: PLAN_CONFIG[user.plan ?? "free"]?.label ?? "Free" },
              { label: "Status", value: user.isActive ? "Active" : "Inactive" },
              { label: "Joined", value: fmtDate(user.createdAt) },
              { label: "Last Login", value: fmtDate(user.lastLoginAt) },
              { label: "Last Active", value: timeAgo(user.lastActivityAt) ?? "—" },
              { label: "Failed Logins", value: String(user.loginAttempts) },
              { label: "Points", value: String(user.lifetimePoints ?? 0) },
            ].map(({ label, value }) => (
              <div key={label} className="flex items-center justify-between border-b border-zinc-100 pb-1.5">
                <span className="text-xs font-black uppercase text-zinc-400">{label}</span>
                <span className="font-bold text-zinc-800">{value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main UsersTable ───────────────────────────────────────────────────────────
export function UsersTable({ initialUsers }: { initialUsers: UserRow[] }) {
  const [users, setUsers] = useState<UserRow[]>(initialUsers);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [onlineFilter, setOnlineFilter] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserRow | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  const [, startTransition] = useTransition();

  // Real-time polling every 15 seconds
  const fetchUsers = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const res = await fetch("/api/admin/users", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users || []);
      }
    } catch (e) { console.error(e); }
    finally { if (!silent) setLoading(false); }
  }, []);

  useEffect(() => {
    // Initial load from API for fresh data
    fetchUsers(true);
    // Poll every 15s for online status updates
    const interval = setInterval(() => fetchUsers(true), 15000);
    return () => clearInterval(interval);
  }, [fetchUsers]);

  function handleToggleActive(id: number, current: boolean) {
    startTransition(async () => {
      await toggleUserActive(id, !current);
      setUsers(prev => prev.map(u => u.id === id ? { ...u, isActive: !current } : u));
      toast.success(current ? "User deactivated" : "User activated");
    });
  }

  function handleDelete(id: number) {
    startTransition(async () => {
      const res = await deleteUser(id);
      if (res?.error) { toast.error(res.error); }
      else { setUsers(prev => prev.filter(u => u.id !== id)); toast.success("User deleted"); setDeleteConfirm(null); }
    });
  }

  const filtered = users.filter(u => {
    const q = search.toLowerCase();
    const matchSearch = !q || u.username.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || (u.displayName ?? "").toLowerCase().includes(q);
    const matchRole = roleFilter === "all" || u.role === roleFilter;
    const matchStatus = statusFilter === "all" || (statusFilter === "active" && u.isActive) || (statusFilter === "inactive" && !u.isActive);
    const matchOnline = !onlineFilter || u.isOnline;
    return matchSearch && matchRole && matchStatus && matchOnline;
  });

  const onlineCount = users.filter(u => u.isOnline).length;

  return (
    <div className="space-y-4">

      {/* ── Online pulse bar ── */}
      <div className="flex items-center gap-3 px-4 py-2.5 bg-black border-2 border-black">
        <span className="w-2.5 h-2.5 rounded-full bg-green-400 animate-pulse" />
        <span className="text-xs font-black text-white uppercase tracking-widest">
          {onlineCount} user{onlineCount !== 1 ? "s" : ""} online right now
        </span>
        <span className="ml-auto text-[10px] text-zinc-400 font-bold">Auto-refreshes every 15s</span>
        <button onClick={() => fetchUsers()} disabled={loading}
          className="inline-flex items-center gap-1 px-2 py-1 border border-zinc-600 text-zinc-300 hover:text-white hover:border-white text-xs font-bold transition-all">
          <RefreshCw size={11} className={loading ? "animate-spin" : ""} /> Refresh
        </button>
      </div>

      {/* ── Toolbar ── */}
      <div className="border-2 border-black bg-white p-4" style={{ boxShadow: "3px 3px 0 #000" }}>
        <div className="flex flex-wrap items-center gap-3">
          {/* Search */}
          <div className="relative flex-1 min-w-52">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={16} />
            <input placeholder="Search by name, email, username..."
              className="w-full pl-9 pr-4 py-2.5 border-2 border-black font-medium focus:outline-none focus:shadow-[2px_2px_0_#000] text-sm"
              value={search} onChange={e => setSearch(e.target.value)} />
          </div>

          {/* Filters */}
          <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)}
            className="px-3 py-2.5 border-2 border-black font-bold text-sm bg-white focus:outline-none">
            <option value="all">All Roles</option>
            <option value="admin">Admin</option>
            <option value="staff">Staff</option>
            <option value="teacher">Teacher</option>
            <option value="student">Student</option>
          </select>

          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
            className="px-3 py-2.5 border-2 border-black font-bold text-sm bg-white focus:outline-none">
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>

          {/* Online only toggle */}
          <button onClick={() => setOnlineFilter(v => !v)}
            className={cn("inline-flex items-center gap-1.5 px-3 py-2.5 border-2 border-black font-black text-xs uppercase transition-all",
              onlineFilter ? "bg-green-400 shadow-[2px_2px_0_#000]" : "bg-white hover:bg-green-50")}>
            <Wifi size={13} /> Online Only
          </button>

          <div className="flex gap-2 ml-auto">
            <CreateUserDialog onSuccess={() => fetchUsers()} />
          </div>
        </div>

        {/* Count */}
        <div className="flex items-center gap-2 mt-3 pt-3 border-t border-zinc-200">
          <span className="text-xs font-black text-zinc-500 uppercase">
            Showing <span className="text-black">{filtered.length}</span> of {users.length} users
          </span>
          {(roleFilter !== "all" || statusFilter !== "all" || search || onlineFilter) && (
            <button onClick={() => { setRoleFilter("all"); setStatusFilter("all"); setSearch(""); setOnlineFilter(false); }}
              className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-black border border-black bg-yellow-400 hover:bg-red-400 transition-colors">
              <X size={10} /> Clear
            </button>
          )}
        </div>
      </div>

      {/* ── Table ── */}
      <div className="border-2 border-black bg-white overflow-hidden" style={{ boxShadow: "4px 4px 0 #000" }}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b-2 border-black bg-zinc-100">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-black uppercase tracking-widest">User</th>
                <th className="px-4 py-3 text-left text-xs font-black uppercase tracking-widest">Role / Plan</th>
                <th className="px-4 py-3 text-left text-xs font-black uppercase tracking-widest">Status</th>
                <th className="px-4 py-3 text-left text-xs font-black uppercase tracking-widest hidden md:table-cell">Sessions / Time</th>
                <th className="px-4 py-3 text-left text-xs font-black uppercase tracking-widest hidden lg:table-cell">Last Active</th>
                <th className="px-4 py-3 text-left text-xs font-black uppercase tracking-widest hidden lg:table-cell">Joined</th>
                <th className="px-4 py-3 text-right text-xs font-black uppercase tracking-widest">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(u => {
                const roleConf = ROLE_CONFIG[u.role] ?? ROLE_CONFIG.student;
                const planConf = PLAN_CONFIG[u.plan ?? "free"] ?? PLAN_CONFIG.free;
                return (
                  <tr key={u.id} className={cn("border-b border-zinc-100 hover:bg-yellow-50 transition-colors", u.isOnline && "bg-green-50/40")}>

                    {/* User */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {/* Avatar + online dot */}
                        <div className="relative shrink-0">
                          <div className="w-9 h-9 border-2 border-black bg-zinc-200 flex items-center justify-center font-black text-sm">
                            {(u.displayName || u.username).charAt(0).toUpperCase()}
                          </div>
                          <span className={cn("absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white",
                            u.isOnline ? "bg-green-500" : "bg-zinc-400")} />
                        </div>
                        <div className="min-w-0">
                          <p className="font-black text-sm truncate">{u.displayName || u.username}</p>
                          <p className="text-xs text-zinc-500 truncate">{u.email}</p>
                          {(u.schoolName || u.province || u.gradeLevel) && (
                            <p className="text-[10px] font-bold uppercase tracking-wide text-zinc-400 truncate">
                              {[u.schoolName, u.province, u.gradeLevel].filter(Boolean).join(" · ")}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Role / Plan */}
                    <td className="px-4 py-3">
                      <div className="space-y-1">
                        <span className={cn("inline-block px-2 py-0.5 text-[10px] font-black uppercase border-2 border-black", roleConf.bg)}>
                          {roleConf.label}
                        </span>
                        {u.plan && u.plan !== "free" && (
                          <span className={cn("inline-block px-2 py-0.5 text-[10px] font-black uppercase border border-black ml-1", planConf.bg)}>
                            {planConf.label}{u.isTrial ? " Trial" : ""}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <span className={cn("w-2 h-2 rounded-full border border-black", u.isActive ? "bg-green-400" : "bg-red-400")} />
                        <span className={cn("text-xs font-black uppercase", u.isActive ? "text-green-700" : "text-red-700")}>
                          {u.isActive ? "Active" : "Inactive"}
                        </span>
                      </div>
                      {u.loginAttempts > 3 && (
                        <span className="text-[10px] font-bold text-red-600 block mt-0.5">⚠ {u.loginAttempts} failed logins</span>
                      )}
                    </td>

                    {/* Sessions / Time */}
                    <td className="px-4 py-3 hidden md:table-cell">
                      <p className="text-xs font-bold">{u.totalSessions ?? 0} sessions</p>
                      <p className="text-xs text-zinc-500">{fmtTime(u.timeSpent ?? 0)} spent</p>
                    </td>

                    {/* Last Active */}
                    <td className="px-4 py-3 hidden lg:table-cell">
                      {u.isOnline
                        ? <span className="inline-flex items-center gap-1 text-xs font-black text-green-700"><Wifi size={11} /> Online</span>
                        : <span className="text-xs text-zinc-500">{timeAgo(u.lastActivityAt) ?? "—"}</span>
                      }
                    </td>

                    {/* Joined */}
                    <td className="px-4 py-3 hidden lg:table-cell">
                      <span className="text-xs text-zinc-600 font-bold">{fmtDate(u.createdAt)}</span>
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1 flex-wrap">
                        {/* View */}
                        <button onClick={() => setSelectedUser(u)}
                          className="inline-flex items-center gap-1 px-2 py-1.5 text-xs font-black border-2 border-black bg-white hover:bg-cyan-400 hover:shadow-[2px_2px_0_#000] transition-all">
                          <Eye size={12} />
                        </button>

                        {/* Edit */}
                        <EditUserDialog user={u} onSuccess={() => fetchUsers(true)} />

                        {/* Toggle active */}
                        <button onClick={() => handleToggleActive(u.id, u.isActive)}
                          className={cn("inline-flex items-center gap-1 px-2 py-1.5 text-xs font-black border-2 border-black hover:shadow-[2px_2px_0_#000] transition-all",
                            u.isActive ? "bg-white hover:bg-red-400" : "bg-white hover:bg-green-400")}>
                          {u.isActive ? <UserX size={12} /> : <UserCheck size={12} />}
                        </button>

                        {/* Delete */}
                        {deleteConfirm === u.id ? (
                          <div className="flex gap-1">
                            <button onClick={() => handleDelete(u.id)}
                              className="px-2 py-1.5 text-[10px] font-black bg-red-500 text-white border-2 border-black">Yes</button>
                            <button onClick={() => setDeleteConfirm(null)}
                              className="px-2 py-1.5 text-[10px] font-black bg-white border-2 border-black">No</button>
                          </div>
                        ) : (
                          <button onClick={() => setDeleteConfirm(u.id)}
                            className="inline-flex items-center px-2 py-1.5 text-xs font-black border-2 border-black bg-white hover:bg-red-400 hover:shadow-[2px_2px_0_#000] transition-all">
                            <Trash2 size={12} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-sm font-bold text-zinc-400 uppercase">
                    {search || roleFilter !== "all" || statusFilter !== "all" || onlineFilter ? "No users match your filters" : "No users found"}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail modal */}
      {selectedUser && <UserDetailModal user={selectedUser} onClose={() => setSelectedUser(null)} />}
    </div>
  );
}
