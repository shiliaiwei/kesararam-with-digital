"use client";

import { useState, useTransition } from "react";
import type { User } from "@/db/schema";
import {
  createUser,
  updateUser,
  deleteUser,
  toggleUserActive,
} from "@/app/actions/users";
import { buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MoreHorizontal, Plus, Search, UserCheck, UserX } from "lucide-react";
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
>;

type Role = "student" | "teacher" | "admin";

const ROLE_CONFIG: Record<Role, { label: string; active: string }> = {
  student: { label: "Student", active: "bg-[#3b82f6] text-white" },
  teacher: { label: "Teacher", active: "bg-[#22c55e] text-white" },
  admin: { label: "Admin", active: "bg-[#a855f7] text-white" },
};

function RolePicker({
  value,
  onChange,
}: {
  value: Role;
  onChange: (v: Role) => void;
}) {
  return (
    <div className="flex gap-2">
      {(Object.keys(ROLE_CONFIG) as Role[]).map((r) => (
        <button
          key={r}
          type="button"
          onClick={() => onChange(r)}
          className={cn(
            "flex-1 py-2 font-black uppercase text-xs tracking-widest border-2 border-black transition-all",
            value === r
              ? cn(ROLE_CONFIG[r].active, "shadow-[3px_3px_0_#000]")
              : "bg-white text-black hover:shadow-[2px_2px_0_#000]",
          )}
        >
          {ROLE_CONFIG[r].label}
        </button>
      ))}
    </div>
  );
}

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
        toast.success("User created.");
        onSuccess();
      }
    });
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 px-4 py-2 bg-[#006747] text-white font-black uppercase text-sm border-2 border-black shadow-[4px_4px_0_#000] hover:shadow-[2px_2px_0_#000] hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
      >
        <Plus className="size-4" />
        New User
      </button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md p-0 border-2 border-black shadow-[6px_6px_0_#000] !rounded-none overflow-hidden">
          <div className="bg-[#eab308] px-6 py-4 border-b-2 border-black">
            <DialogTitle className="font-black uppercase text-xl tracking-tight">
              Create New User
            </DialogTitle>
            <p className="text-sm font-medium mt-0.5">
              Add a new user to the platform.
            </p>
          </div>
          <form onSubmit={handleSubmit} className="flex flex-col gap-5 p-6">
            {/* hidden role — @base-ui/react Select does not write to FormData */}
            <input type="hidden" name="role" value={role} />

            <div className="grid gap-1.5">
              <label
                htmlFor="create-username"
                className="font-black uppercase text-xs tracking-widest"
              >
                Username *
              </label>
              <Input
                id="create-username"
                name="username"
                required
                placeholder="e.g. sopheak01"
                className="border-2 border-black !rounded-none focus-visible:border-black focus-visible:ring-0 font-medium"
              />
            </div>

            <div className="grid gap-1.5">
              <label
                htmlFor="create-email"
                className="font-black uppercase text-xs tracking-widest"
              >
                Email *
              </label>
              <Input
                id="create-email"
                name="email"
                type="email"
                required
                placeholder="user@kwd.tech"
                className="border-2 border-black !rounded-none focus-visible:border-black focus-visible:ring-0 font-medium"
              />
            </div>

            <div className="grid gap-1.5">
              <label
                htmlFor="create-display"
                className="font-black uppercase text-xs tracking-widest"
              >
                Display Name
              </label>
              <Input
                id="create-display"
                name="displayName"
                placeholder="Sopheak Chan"
                className="border-2 border-black !rounded-none focus-visible:border-black focus-visible:ring-0 font-medium"
              />
            </div>

            <div className="grid gap-1.5">
              <span className="font-black uppercase text-xs tracking-widest">
                Role *
              </span>
              <RolePicker value={role} onChange={setRole} />
            </div>

            <div className="grid gap-1.5">
              <label
                htmlFor="create-password"
                className="font-black uppercase text-xs tracking-widest"
              >
                Password *
              </label>
              <Input
                id="create-password"
                name="password"
                type="password"
                required
                placeholder="••••••••"
                className="border-2 border-black !rounded-none focus-visible:border-black focus-visible:ring-0 font-medium"
              />
            </div>

            {error && (
              <p className="text-sm font-bold text-white bg-[#ef4444] border-2 border-black px-3 py-2 shadow-[2px_2px_0_#000]">
                {error}
              </p>
            )}

            <div className="flex justify-end gap-3 pt-1">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="px-4 py-2 font-black uppercase text-sm border-2 border-black shadow-[3px_3px_0_#000] hover:shadow-[1px_1px_0_#000] hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={pending}
                className="px-4 py-2 bg-[#006747] text-white font-black uppercase text-sm border-2 border-black shadow-[3px_3px_0_#000] hover:shadow-[1px_1px_0_#000] hover:translate-x-[2px] hover:translate-y-[2px] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {pending ? "Creating..." : "Create User"}
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}

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
        toast.success("User updated.");
        onSuccess();
      }
    });
  }

  return (
    <>
      <DropdownMenuItem onClick={() => setOpen(true)}>Edit</DropdownMenuItem>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md p-0 border-2 border-black shadow-[6px_6px_0_#000] !rounded-none overflow-hidden">
          <div className="bg-[#3b82f6] px-6 py-4 border-b-2 border-black">
            <DialogTitle className="font-black uppercase text-xl tracking-tight text-white">
              Edit User
            </DialogTitle>
            <p className="text-sm font-medium mt-0.5 text-white/90">
              Update account details for {user.username}.
            </p>
          </div>
          <form onSubmit={handleSubmit} className="flex flex-col gap-5 p-6">
            {/* hidden fields — @base-ui/react Select does not write to FormData */}
            <input type="hidden" name="role" value={role} />
            <input type="hidden" name="isActive" value={String(isActive)} />

            <div className="grid gap-1.5">
              <label
                htmlFor="edit-email"
                className="font-black uppercase text-xs tracking-widest"
              >
                Email *
              </label>
              <Input
                id="edit-email"
                name="email"
                type="email"
                required
                defaultValue={user.email}
                className="border-2 border-black !rounded-none focus-visible:border-black focus-visible:ring-0 font-medium"
              />
            </div>

            <div className="grid gap-1.5">
              <label
                htmlFor="edit-display"
                className="font-black uppercase text-xs tracking-widest"
              >
                Display Name
              </label>
              <Input
                id="edit-display"
                name="displayName"
                defaultValue={user.displayName ?? ""}
                className="border-2 border-black !rounded-none focus-visible:border-black focus-visible:ring-0 font-medium"
              />
            </div>

            <div className="grid gap-1.5">
              <span className="font-black uppercase text-xs tracking-widest">
                Role
              </span>
              <RolePicker value={role} onChange={setRole} />
            </div>

            <div className="grid gap-1.5">
              <span className="font-black uppercase text-xs tracking-widest">
                Status
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsActive(true)}
                  className={cn(
                    "flex-1 py-2 font-black uppercase text-xs tracking-widest border-2 border-black transition-all",
                    isActive
                      ? "bg-[#22c55e] text-white shadow-[3px_3px_0_#000]"
                      : "bg-white text-black hover:shadow-[2px_2px_0_#000]",
                  )}
                >
                  Active
                </button>
                <button
                  type="button"
                  onClick={() => setIsActive(false)}
                  className={cn(
                    "flex-1 py-2 font-black uppercase text-xs tracking-widest border-2 border-black transition-all",
                    !isActive
                      ? "bg-[#ef4444] text-white shadow-[3px_3px_0_#000]"
                      : "bg-white text-black hover:shadow-[2px_2px_0_#000]",
                  )}
                >
                  Inactive
                </button>
              </div>
            </div>

            <div className="grid gap-1.5">
              <label
                htmlFor="edit-password"
                className="font-black uppercase text-xs tracking-widest"
              >
                New Password{" "}
                <span className="text-zinc-500 font-medium normal-case">
                  (leave blank to keep)
                </span>
              </label>
              <Input
                id="edit-password"
                name="password"
                type="password"
                placeholder="••••••••"
                className="border-2 border-black !rounded-none focus-visible:border-black focus-visible:ring-0 font-medium"
              />
            </div>

            {error && (
              <p className="text-sm font-bold text-white bg-[#ef4444] border-2 border-black px-3 py-2 shadow-[2px_2px_0_#000]">
                {error}
              </p>
            )}

            <div className="flex justify-end gap-3 pt-1">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="px-4 py-2 font-black uppercase text-sm border-2 border-black shadow-[3px_3px_0_#000] hover:shadow-[1px_1px_0_#000] hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={pending}
                className="px-4 py-2 bg-[#3b82f6] text-white font-black uppercase text-sm border-2 border-black shadow-[3px_3px_0_#000] hover:shadow-[1px_1px_0_#000] hover:translate-x-[2px] hover:translate-y-[2px] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {pending ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}

export function UsersTable({ initialUsers }: { initialUsers: UserRow[] }) {
  const [users, setUsers] = useState(initialUsers);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [, startTransition] = useTransition();

  function refresh() {
    // Re-trigger SSR via router refresh would be ideal; for now reload
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
    if (!confirm("Deactivate this user?")) return;
    startTransition(async () => {
      const res = await deleteUser(id);
      if (res?.error) {
        toast.error(res.error);
      } else {
        setUsers((prev) =>
          prev.map((u) => (u.id === id ? { ...u, isActive: false } : u)),
        );
        toast.success("User deactivated.");
      }
    });
  }

  const filtered = users.filter((u) => {
    const q = search.toLowerCase();
    const matchesSearch =
      !q ||
      u.username.includes(q) ||
      u.email.includes(q) ||
      (u.displayName ?? "").toLowerCase().includes(q);
    const matchesRole = roleFilter === "all" || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const roleColors: Record<string, string> = {
    admin: "bg-[#a855f7] text-white border-[#a855f7]",
    teacher: "bg-[#22c55e] text-white border-[#22c55e]",
    student: "bg-[#3b82f6] text-white border-[#3b82f6]",
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Toolbar */}
      <div className="flex items-center gap-2 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
          <Input
            placeholder="Search users…"
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select
          value={roleFilter}
          onValueChange={(v) => setRoleFilter(v ?? "all")}
        >
          <SelectTrigger className="w-36">
            <SelectValue placeholder="All roles" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All roles</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
            <SelectItem value="teacher">Teacher</SelectItem>
            <SelectItem value="student">Student</SelectItem>
          </SelectContent>
        </Select>
        <CreateUserDialog onSuccess={refresh} />
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="hidden md:table-cell">
                Failed Logins
              </TableHead>
              <TableHead className="hidden lg:table-cell">Joined</TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((u) => (
              <TableRow key={u.id}>
                <TableCell>
                  <div className="font-medium">
                    {u.displayName ?? u.username}
                  </div>
                  <div className="text-xs text-muted-foreground">{u.email}</div>
                </TableCell>
                <TableCell>
                  <span
                    className={`inline-flex items-center border-2 px-2 py-0.5 text-xs font-black uppercase tracking-widest ${roleColors[u.role]}`}
                  >
                    {u.role}
                  </span>
                </TableCell>
                <TableCell>
                  <Badge variant={u.isActive ? "default" : "secondary"}>
                    {u.isActive ? "Active" : "Inactive"}
                  </Badge>
                </TableCell>
                <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                  {u.loginAttempts}
                </TableCell>
                <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">
                  {new Date(u.createdAt).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      className={buttonVariants({
                        variant: "ghost",
                        size: "icon",
                      })}
                    >
                      <MoreHorizontal className="size-4" />
                      <span className="sr-only">Actions</span>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <EditUserDialog user={u} onSuccess={refresh} />
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => handleToggleActive(u.id, u.isActive)}
                      >
                        {u.isActive ? (
                          <>
                            <UserX className="size-4 mr-2" />
                            Deactivate
                          </>
                        ) : (
                          <>
                            <UserCheck className="size-4 mr-2" />
                            Activate
                          </>
                        )}
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-destructive"
                        onClick={() => handleDelete(u.id)}
                      >
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
            {filtered.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-center text-muted-foreground py-10"
                >
                  No users found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <p className="text-xs text-muted-foreground">
        {filtered.length} user{filtered.length !== 1 ? "s" : ""} shown
      </p>
    </div>
  );
}
