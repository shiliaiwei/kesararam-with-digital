"use client";

import { useState, useTransition } from "react";
import type { User } from "@/db/schema";
import {
  createUser,
  updateUser,
  deleteUser,
  toggleUserActive,
} from "@/app/actions/users";
import { 
  MoreHorizontal, 
  Plus, 
  Search, 
  UserCheck, 
  UserX, 
  Edit3, 
  Trash2, 
  Eye, 
  Clock, 
  Shield, 
  Mail, 
  Key,
  Activity,
  Calendar,
  Filter,
  Download,
  RefreshCw
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type UserRow = Pick<
  User,
  | "id"
  | "username"
  | "email"
  | "displayName"
  | "role"
  | "isActive"
  | "loginAttempts"
  | "createdAt"
> & {
  lastLoginAt?: Date | null;
  totalSessions?: number;
  timeSpent?: number; // in minutes
};

type Role = "student" | "teacher" | "admin" | "staff";

const ROLE_CONFIG: Record<Role, { label: string; color: string; bgColor: string }> = {
  student: { label: "Student", color: "#3b82f6", bgColor: "bg-blue-400" },
  teacher: { label: "Teacher", color: "#22c55e", bgColor: "bg-green-400" },
  admin:   { label: "Admin",   color: "#ef4444", bgColor: "bg-red-400" },
  staff:   { label: "Staff",   color: "#f59e0b", bgColor: "bg-yellow-400" },
};

// User Activity Modal Component
function UserActivityModal({ 
  user, 
  isOpen, 
  onClose 
}: { 
  user: UserRow; 
  isOpen: boolean; 
  onClose: () => void; 
}) {
  if (!isOpen) return null;

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white border-4 border-black shadow-[8px_8px_0_#000] max-w-2xl w-full max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="border-b-2 border-black bg-blue-400 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-black uppercase tracking-tighter text-black">
                User Activity
              </h2>
              <p className="text-sm font-bold text-black/70 uppercase tracking-wide">
                {user.displayName || user.username} - {user.email}
              </p>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 border-2 border-black bg-white hover:bg-red-400 flex items-center justify-center shadow-[2px_2px_0_#000] hover:shadow-[1px_1px_0_#000] hover:translate-x-[1px] hover:translate-y-[1px] transition-all"
            >
              <span className="text-lg font-black">×</span>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 overflow-y-auto max-h-[60vh]">
          {/* Activity Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="border-2 border-black bg-white p-4 shadow-[3px_3px_0_#000]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 border-2 border-black bg-green-400 flex items-center justify-center shadow-[2px_2px_0_#000]">
                  <Activity size={20} className="text-black" />
                </div>
                <div>
                  <span className="text-2xl font-black text-black">
                    {user.totalSessions || 0}
                  </span>
                  <p className="text-xs font-black uppercase tracking-widest text-zinc-500">
                    Total Sessions
                  </p>
                </div>
              </div>
            </div>

            <div className="border-2 border-black bg-white p-4 shadow-[3px_3px_0_#000]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 border-2 border-black bg-orange-400 flex items-center justify-center shadow-[2px_2px_0_#000]">
                  <Clock size={20} className="text-black" />
                </div>
                <div>
                  <span className="text-2xl font-black text-black">
                    {formatTime(user.timeSpent || 0)}
                  </span>
                  <p className="text-xs font-black uppercase tracking-widest text-zinc-500">
                    Time Spent
                  </p>
                </div>
              </div>
            </div>

            <div className="border-2 border-black bg-white p-4 shadow-[3px_3px_0_#000]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 border-2 border-black bg-purple-400 flex items-center justify-center shadow-[2px_2px_0_#000]">
                  <Calendar size={20} className="text-black" />
                </div>
                <div>
                  <span className="text-sm font-black text-black">
                    {user.lastLoginAt 
                      ? new Date(user.lastLoginAt).toLocaleDateString()
                      : "Never"
                    }
                  </span>
                  <p className="text-xs font-black uppercase tracking-widest text-zinc-500">
                    Last Login
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="border-2 border-black bg-white shadow-[3px_3px_0_#000]">
            <div className="border-b-2 border-black bg-cyan-400 p-4">
              <h3 className="text-lg font-black uppercase tracking-tighter text-black">
                Recent Activity
              </h3>
            </div>
            <div className="p-4">
              <div className="space-y-3">
                {/* Mock activity data - replace with real data */}
                <div className="flex items-center gap-3 p-3 border border-zinc-200">
                  <div className="w-2 h-2 bg-green-400 border border-black"></div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-black">Completed Quiz: Road Signs</p>
                    <p className="text-xs font-medium text-zinc-500">2 hours ago</p>
                  </div>
                  <span className="text-xs font-black uppercase px-2 py-1 border border-black bg-green-400">
                    85%
                  </span>
                </div>
                <div className="flex items-center gap-3 p-3 border border-zinc-200">
                  <div className="w-2 h-2 bg-blue-400 border border-black"></div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-black">Started Learning Session</p>
                    <p className="text-xs font-medium text-zinc-500">1 day ago</p>
                  </div>
                  <span className="text-xs font-black uppercase px-2 py-1 border border-black bg-blue-400">
                    Active
                  </span>
                </div>
                <div className="flex items-center gap-3 p-3 border border-zinc-200">
                  <div className="w-2 h-2 bg-yellow-400 border border-black"></div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-black">Account Created</p>
                    <p className="text-xs font-medium text-zinc-500">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <span className="text-xs font-black uppercase px-2 py-1 border border-black bg-yellow-400">
                    New
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Role Picker Component
function RolePicker({
  value,
  onChange,
}: {
  value: Role;
  onChange: (v: Role) => void;
}) {
  return (
    <div className="grid grid-cols-4 gap-2">
      {(Object.keys(ROLE_CONFIG) as Role[]).map((r) => (
        <button
          key={r}
          type="button"
          onClick={() => onChange(r)}
          className={cn(
            "py-3 px-2 font-black uppercase text-xs tracking-widest border-2 border-black transition-all duration-100",
            value === r
              ? `${ROLE_CONFIG[r].bgColor} text-black shadow-[3px_3px_0_#000] -translate-x-0.5 -translate-y-0.5`
              : "bg-white text-black hover:shadow-[2px_2px_0_#000] hover:-translate-x-0.5 hover:-translate-y-0.5",
          )}
          style={{ borderRadius: "0px" }}
        >
          {ROLE_CONFIG[r].label}
        </button>
      ))}
    </div>
  );
}

// Create User Dialog Component
function CreateUserDialog({ onSuccess }: { onSuccess: () => void }) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const [role, setRole] = useState<Role>("student");

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      const res = await createUser(formData);
      if (res?.error) {
        setError(res.error);
      } else {
        setOpen(false);
        setError("");
        setRole("student");
        toast.success("User created successfully!");
        onSuccess();
      }
    });
  }

  if (!open) return (
    <button
      type="button"
      onClick={() => setOpen(true)}
      className="flex items-center gap-2 px-4 py-3 bg-green-400 text-black font-black uppercase text-sm border-2 border-black shadow-[3px_3px_0_#000] hover:shadow-[4px_4px_0_#000] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all duration-100"
      style={{ borderRadius: "0px" }}
    >
      <Plus size={16} />
      New User
    </button>
  );

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white border-4 border-black shadow-[8px_8px_0_#000] max-w-md w-full">
        {/* Header */}
        <div className="border-b-2 border-black bg-green-400 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-black uppercase tracking-tighter text-black">
                Create New User
              </h2>
              <p className="text-sm font-bold text-black/70 uppercase tracking-wide">
                Add a new user to the platform
              </p>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="w-8 h-8 border-2 border-black bg-white hover:bg-red-400 flex items-center justify-center shadow-[2px_2px_0_#000] hover:shadow-[1px_1px_0_#000] hover:translate-x-[1px] hover:translate-y-[1px] transition-all"
            >
              <span className="text-lg font-black">×</span>
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <input type="hidden" name="role" value={role} />

          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-widest text-black">
              Username *
            </label>
            <input
              name="username"
              required
              placeholder="e.g. sopheak01"
              className="w-full p-3 border-2 border-black bg-white font-bold text-black placeholder:text-zinc-400 focus:outline-none focus:shadow-[2px_2px_0_#000]"
              style={{ borderRadius: "0px" }}
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-widest text-black">
              Email *
            </label>
            <input
              name="email"
              type="email"
              required
              placeholder="user@kwd.tech"
              className="w-full p-3 border-2 border-black bg-white font-bold text-black placeholder:text-zinc-400 focus:outline-none focus:shadow-[2px_2px_0_#000]"
              style={{ borderRadius: "0px" }}
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-widest text-black">
              Display Name
            </label>
            <input
              name="displayName"
              placeholder="Sopheak Chan"
              className="w-full p-3 border-2 border-black bg-white font-bold text-black placeholder:text-zinc-400 focus:outline-none focus:shadow-[2px_2px_0_#000]"
              style={{ borderRadius: "0px" }}
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-widest text-black">
              Role *
            </label>
            <RolePicker value={role} onChange={setRole} />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-widest text-black">
              Password *
            </label>
            <input
              name="password"
              type="password"
              required
              placeholder="••••••••"
              className="w-full p-3 border-2 border-black bg-white font-bold text-black placeholder:text-zinc-400 focus:outline-none focus:shadow-[2px_2px_0_#000]"
              style={{ borderRadius: "0px" }}
            />
          </div>

          {error && (
            <div className="p-3 border-2 border-black bg-red-400 shadow-[2px_2px_0_#000]">
              <p className="text-sm font-bold text-black">{error}</p>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="flex-1 py-3 font-black uppercase text-sm border-2 border-black bg-white text-black shadow-[3px_3px_0_#000] hover:shadow-[1px_1px_0_#000] hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
              style={{ borderRadius: "0px" }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={pending}
              className="flex-1 py-3 bg-green-400 text-black font-black uppercase text-sm border-2 border-black shadow-[3px_3px_0_#000] hover:shadow-[1px_1px_0_#000] hover:translate-x-[2px] hover:translate-y-[2px] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ borderRadius: "0px" }}
            >
              {pending ? "Creating..." : "Create User"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Edit User Dialog Component
function EditUserDialog({
  user,
  onSuccess,
}: {
  user: UserRow;
  onSuccess: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const [role, setRole] = useState<Role>(user.role as Role);
  const [isActive, setIsActive] = useState(user.isActive);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      const res = await updateUser(user.id, formData);
      if (res?.error) {
        setError(res.error);
      } else {
        setOpen(false);
        setError("");
        toast.success("User updated successfully!");
        onSuccess();
      }
    });
  }

  if (!open) return (
    <button
      onClick={() => setOpen(true)}
      className="flex items-center gap-2 px-3 py-2 text-xs font-black uppercase tracking-widest border-2 border-black bg-white hover:bg-blue-400 hover:shadow-[2px_2px_0_#000] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all duration-100"
      style={{ borderRadius: "0px" }}
    >
      <Edit3 size={12} />
      Edit
    </button>
  );

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white border-4 border-black shadow-[8px_8px_0_#000] max-w-md w-full">
        {/* Header */}
        <div className="border-b-2 border-black bg-blue-400 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-black uppercase tracking-tighter text-black">
                Edit User
              </h2>
              <p className="text-sm font-bold text-black/70 uppercase tracking-wide">
                Update account details for {user.username}
              </p>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="w-8 h-8 border-2 border-black bg-white hover:bg-red-400 flex items-center justify-center shadow-[2px_2px_0_#000] hover:shadow-[1px_1px_0_#000] hover:translate-x-[1px] hover:translate-y-[1px] transition-all"
            >
              <span className="text-lg font-black">×</span>
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <input type="hidden" name="role" value={role} />
          <input type="hidden" name="isActive" value={String(isActive)} />

          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-widest text-black">
              Email *
            </label>
            <input
              name="email"
              type="email"
              required
              defaultValue={user.email}
              className="w-full p-3 border-2 border-black bg-white font-bold text-black focus:outline-none focus:shadow-[2px_2px_0_#000]"
              style={{ borderRadius: "0px" }}
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-widest text-black">
              Display Name
            </label>
            <input
              name="displayName"
              defaultValue={user.displayName ?? ""}
              className="w-full p-3 border-2 border-black bg-white font-bold text-black focus:outline-none focus:shadow-[2px_2px_0_#000]"
              style={{ borderRadius: "0px" }}
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-widest text-black">
              Role
            </label>
            <RolePicker value={role} onChange={setRole} />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-widest text-black">
              Status
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setIsActive(true)}
                className={cn(
                  "py-3 px-2 font-black uppercase text-xs tracking-widest border-2 border-black transition-all duration-100",
                  isActive
                    ? "bg-green-400 text-black shadow-[3px_3px_0_#000] -translate-x-0.5 -translate-y-0.5"
                    : "bg-white text-black hover:shadow-[2px_2px_0_#000] hover:-translate-x-0.5 hover:-translate-y-0.5",
                )}
                style={{ borderRadius: "0px" }}
              >
                Active
              </button>
              <button
                type="button"
                onClick={() => setIsActive(false)}
                className={cn(
                  "py-3 px-2 font-black uppercase text-xs tracking-widest border-2 border-black transition-all duration-100",
                  !isActive
                    ? "bg-red-400 text-black shadow-[3px_3px_0_#000] -translate-x-0.5 -translate-y-0.5"
                    : "bg-white text-black hover:shadow-[2px_2px_0_#000] hover:-translate-x-0.5 hover:-translate-y-0.5",
                )}
                style={{ borderRadius: "0px" }}
              >
                Inactive
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-widest text-black">
              New Password
              <span className="text-zinc-500 font-medium normal-case ml-1">
                (leave blank to keep current)
              </span>
            </label>
            <input
              name="password"
              type="password"
              placeholder="••••••••"
              className="w-full p-3 border-2 border-black bg-white font-bold text-black placeholder:text-zinc-400 focus:outline-none focus:shadow-[2px_2px_0_#000]"
              style={{ borderRadius: "0px" }}
            />
          </div>

          {error && (
            <div className="p-3 border-2 border-black bg-red-400 shadow-[2px_2px_0_#000]">
              <p className="text-sm font-bold text-black">{error}</p>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="flex-1 py-3 font-black uppercase text-sm border-2 border-black bg-white text-black shadow-[3px_3px_0_#000] hover:shadow-[1px_1px_0_#000] hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
              style={{ borderRadius: "0px" }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={pending}
              className="flex-1 py-3 bg-blue-400 text-black font-black uppercase text-sm border-2 border-black shadow-[3px_3px_0_#000] hover:shadow-[1px_1px_0_#000] hover:translate-x-[2px] hover:translate-y-[2px] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ borderRadius: "0px" }}
            >
              {pending ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Main Users Table Component
export function UsersTable({ initialUsers }: { initialUsers: UserRow[] }) {
  const [users, setUsers] = useState(initialUsers);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedUser, setSelectedUser] = useState<UserRow | null>(null);
  const [showActivityModal, setShowActivityModal] = useState(false);
  const [, startTransition] = useTransition();

  function refresh() {
    window.location.reload();
  }

  function handleToggleActive(id: number, current: boolean) {
    startTransition(async () => {
      await toggleUserActive(id, !current);
      setUsers((prev) =>
        prev.map((u) => (u.id === id ? { ...u, isActive: !current } : u)),
      );
      toast.success(current ? "User deactivated." : "User activated.");
    });
  }

  function handleDelete(id: number) {
    if (!confirm("Are you sure you want to delete this user? This action cannot be undone.")) return;
    startTransition(async () => {
      const res = await deleteUser(id);
      if (res?.error) {
        toast.error(res.error);
      } else {
        setUsers((prev) => prev.filter((u) => u.id !== id));
        toast.success("User deleted successfully.");
      }
    });
  }

  function handleViewActivity(user: UserRow) {
    setSelectedUser(user);
    setShowActivityModal(true);
  }

  const filtered = users.filter((u) => {
    const q = search.toLowerCase();
    const matchesSearch =
      !q ||
      u.username.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      (u.displayName ?? "").toLowerCase().includes(q);
    const matchesRole = roleFilter === "all" || u.role === roleFilter;
    const matchesStatus = statusFilter === "all" || 
      (statusFilter === "active" && u.isActive) ||
      (statusFilter === "inactive" && !u.isActive);
    return matchesSearch && matchesRole && matchesStatus;
  });

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  return (
    <div className="space-y-6">
      {/* Enhanced Toolbar */}
      <div className="border-2 border-black bg-white p-4 shadow-[3px_3px_0_#000]" style={{ borderRadius: "0px" }}>
        <div className="flex flex-wrap items-center gap-4">
          {/* Search */}
          <div className="relative flex-1 min-w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-zinc-400" />
            <input
              placeholder="Search users by name, email, or username..."
              className="w-full pl-10 pr-4 py-3 border-2 border-black bg-white font-bold text-black placeholder:text-zinc-400 focus:outline-none focus:shadow-[2px_2px_0_#000]"
              style={{ borderRadius: "0px" }}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Filters */}
          <div className="flex gap-2">
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-3 py-3 border-2 border-black bg-white font-bold text-black focus:outline-none focus:shadow-[2px_2px_0_#000]"
              style={{ borderRadius: "0px" }}
            >
              <option value="all">All Roles</option>
              <option value="admin">Admin</option>
              <option value="staff">Staff</option>
              <option value="teacher">Teacher</option>
              <option value="student">Student</option>
              <option value="student">Student</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-3 border-2 border-black bg-white font-bold text-black focus:outline-none focus:shadow-[2px_2px_0_#000]"
              style={{ borderRadius: "0px" }}
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <button
              onClick={refresh}
              className="flex items-center gap-2 px-3 py-3 border-2 border-black bg-white hover:bg-cyan-400 hover:shadow-[2px_2px_0_#000] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all duration-100"
              style={{ borderRadius: "0px" }}
            >
              <RefreshCw size={16} />
              <span className="font-black text-xs uppercase tracking-widest">Refresh</span>
            </button>

            <button
              className="flex items-center gap-2 px-3 py-3 border-2 border-black bg-white hover:bg-purple-400 hover:shadow-[2px_2px_0_#000] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all duration-100"
              style={{ borderRadius: "0px" }}
            >
              <Download size={16} />
              <span className="font-black text-xs uppercase tracking-widest">Export</span>
            </button>

            <CreateUserDialog onSuccess={refresh} />
          </div>
        </div>

        {/* Filter Summary */}
        <div className="flex items-center gap-2 mt-4 pt-4 border-t-2 border-black">
          <span className="text-xs font-black uppercase tracking-widest text-zinc-500">
            Showing {filtered.length} of {users.length} users
          </span>
          {(roleFilter !== "all" || statusFilter !== "all" || search) && (
            <button
              onClick={() => {
                setRoleFilter("all");
                setStatusFilter("all");
                setSearch("");
              }}
              className="px-2 py-1 text-xs font-black uppercase border border-black bg-yellow-400 hover:bg-red-400 transition-colors"
              style={{ borderRadius: "0px" }}
            >
              Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* Enhanced Table */}
      <div className="border-2 border-black bg-white shadow-[4px_4px_0_#000]" style={{ borderRadius: "0px" }}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b-2 border-black bg-zinc-100">
                <th className="text-left py-4 px-4 text-xs font-black uppercase tracking-widest text-black">
                  User
                </th>
                <th className="text-left py-4 px-4 text-xs font-black uppercase tracking-widest text-black">
                  Role
                </th>
                <th className="text-left py-4 px-4 text-xs font-black uppercase tracking-widest text-black">
                  Status
                </th>
                <th className="text-left py-4 px-4 text-xs font-black uppercase tracking-widest text-black hidden md:table-cell">
                  Activity
                </th>
                <th className="text-left py-4 px-4 text-xs font-black uppercase tracking-widest text-black hidden lg:table-cell">
                  Failed Logins
                </th>
                <th className="text-left py-4 px-4 text-xs font-black uppercase tracking-widest text-black hidden lg:table-cell">
                  Joined
                </th>
                <th className="text-left py-4 px-4 text-xs font-black uppercase tracking-widest text-black">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u) => (
                <tr key={u.id} className="border-b border-zinc-200 hover:bg-yellow-50">
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 border-2 border-black bg-zinc-200 flex items-center justify-center font-black text-sm">
                        {(u.displayName || u.username).charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-black text-sm text-black">
                          {u.displayName || u.username}
                        </div>
                        <div className="text-xs font-medium text-zinc-500">
                          {u.email}
                        </div>
                        <div className="text-xs font-medium text-zinc-400">
                          @{u.username}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <span
                      className="inline-flex items-center px-2 py-1 text-xs font-black uppercase tracking-widest border-2 border-black text-black"
                      style={{ 
                        backgroundColor: ROLE_CONFIG[u.role as Role].color,
                        borderRadius: "0px"
                      }}
                    >
                      {ROLE_CONFIG[u.role as Role].label}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2">
                      <div 
                        className={`w-3 h-3 border border-black ${u.isActive ? 'bg-green-400' : 'bg-red-400'}`}
                        style={{ borderRadius: "0px" }}
                      />
                      <span
                        className={`px-2 py-1 text-xs font-black uppercase border border-black ${
                          u.isActive ? 'bg-green-400' : 'bg-red-400'
                        } text-black`}
                        style={{ borderRadius: "0px" }}
                      >
                        {u.isActive ? "Active" : "Inactive"}
                      </span>
                    </div>
                  </td>
                  <td className="py-4 px-4 hidden md:table-cell">
                    <div className="space-y-1">
                      <div className="text-xs font-bold text-black">
                        {u.totalSessions || 0} sessions
                      </div>
                      <div className="text-xs font-medium text-zinc-500">
                        {formatTime(u.timeSpent || 0)} spent
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4 hidden lg:table-cell">
                    <span className={`px-2 py-1 text-xs font-black border border-black ${
                      u.loginAttempts > 3 ? 'bg-red-400' : u.loginAttempts > 0 ? 'bg-yellow-400' : 'bg-green-400'
                    } text-black`}>
                      {u.loginAttempts}
                    </span>
                  </td>
                  <td className="py-4 px-4 hidden lg:table-cell">
                    <div className="text-xs font-bold text-zinc-600">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleViewActivity(u)}
                        className="flex items-center gap-1 px-2 py-2 text-xs font-black uppercase tracking-widest border-2 border-black bg-white hover:bg-cyan-400 hover:shadow-[2px_2px_0_#000] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all duration-100"
                        style={{ borderRadius: "0px" }}
                      >
                        <Eye size={12} />
                        <span className="hidden sm:inline">View</span>
                      </button>

                      <EditUserDialog user={u} onSuccess={refresh} />

                      <button
                        onClick={() => handleToggleActive(u.id, u.isActive)}
                        className={`flex items-center gap-1 px-2 py-2 text-xs font-black uppercase tracking-widest border-2 border-black hover:shadow-[2px_2px_0_#000] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all duration-100 ${
                          u.isActive ? 'bg-white hover:bg-red-400' : 'bg-white hover:bg-green-400'
                        }`}
                        style={{ borderRadius: "0px" }}
                      >
                        {u.isActive ? <UserX size={12} /> : <UserCheck size={12} />}
                        <span className="hidden sm:inline">
                          {u.isActive ? "Disable" : "Enable"}
                        </span>
                      </button>

                      <button
                        onClick={() => handleDelete(u.id)}
                        className="flex items-center gap-1 px-2 py-2 text-xs font-black uppercase tracking-widest border-2 border-black bg-white hover:bg-red-400 hover:shadow-[2px_2px_0_#000] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all duration-100"
                        style={{ borderRadius: "0px" }}
                      >
                        <Trash2 size={12} />
                        <span className="hidden sm:inline">Delete</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td
                    colSpan={7}
                    className="text-center py-12 text-sm font-bold text-zinc-500 uppercase tracking-wide"
                  >
                    {search || roleFilter !== "all" || statusFilter !== "all" 
                      ? "No users match your filters" 
                      : "No users found"
                    }
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Activity Modal */}
      {selectedUser && (
        <UserActivityModal
          user={selectedUser}
          isOpen={showActivityModal}
          onClose={() => {
            setShowActivityModal(false);
            setSelectedUser(null);
          }}
        />
      )}
    </div>
  );
}
