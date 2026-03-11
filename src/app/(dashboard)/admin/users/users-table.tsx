"use client";

import { useState, useTransition } from "react";
import type { User } from "@/db/schema";
import {
  createUser,
  updateUser,
  deleteUser,
  toggleUserActive,
} from "@/app/actions/users";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Plus, Search, UserCheck, UserX } from "lucide-react";
import { toast } from "sonner";

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

function CreateUserDialog({ onSuccess }: { onSuccess: () => void }) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState("");

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
        toast.success("User created successfully.");
        onSuccess();
      }
    });
  }

  return (
    <>
      <Button size="sm" onClick={() => setOpen(true)}>
        <Plus className="size-4 mr-1" />
        New User
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create User</DialogTitle>
          <DialogDescription>Add a new user to the platform.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 pt-2">
          <div className="grid gap-1.5">
            <Label htmlFor="create-username">Username</Label>
            <Input
              id="create-username"
              name="username"
              required
              placeholder="e.g. sopheak01"
            />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="create-email">Email</Label>
            <Input
              id="create-email"
              name="email"
              type="email"
              required
              placeholder="user@kwd.tech"
            />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="create-displayName">Display Name</Label>
            <Input
              id="create-displayName"
              name="displayName"
              placeholder="Sopheak Chan"
            />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="create-role">Role</Label>
            <Select name="role" defaultValue="student" required>
              <SelectTrigger id="create-role">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="student">Student</SelectItem>
                <SelectItem value="teacher">Teacher</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="create-password">Password</Label>
            <Input
              id="create-password"
              name="password"
              type="password"
              required
              placeholder="••••••••"
            />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={pending}>
              {pending ? "Creating…" : "Create"}
            </Button>
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
      <DropdownMenuItem onClick={() => setOpen(true)}>
        Edit
      </DropdownMenuItem>
      <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit User</DialogTitle>
          <DialogDescription>
            Update account details for {user.username}.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 pt-2">
          <div className="grid gap-1.5">
            <Label htmlFor="edit-email">Email</Label>
            <Input
              id="edit-email"
              name="email"
              type="email"
              required
              defaultValue={user.email}
            />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="edit-displayName">Display Name</Label>
            <Input
              id="edit-displayName"
              name="displayName"
              defaultValue={user.displayName ?? ""}
            />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="edit-role">Role</Label>
            <Select name="role" defaultValue={user.role}>
              <SelectTrigger id="edit-role">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="student">Student</SelectItem>
                <SelectItem value="teacher">Teacher</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-1.5">
            <Label>Status</Label>
            <Select
              name="isActive"
              defaultValue={user.isActive ? "true" : "false"}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="true">Active</SelectItem>
                <SelectItem value="false">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="edit-password">
              New Password{" "}
              <span className="text-muted-foreground font-normal">
                (leave blank to keep)
              </span>
            </Label>
            <Input
              id="edit-password"
              name="password"
              type="password"
              placeholder="••••••••"
            />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={pending}>
              {pending ? "Saving…" : "Save"}
            </Button>
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
    admin: "bg-purple-100 text-purple-700 border-purple-200",
    teacher: "bg-blue-100 text-blue-700 border-blue-200",
    student: "bg-green-100 text-green-700 border-green-200",
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
        <Select value={roleFilter} onValueChange={(v) => setRoleFilter(v ?? "all")}>
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
                    className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium capitalize ${roleColors[u.role]}`}
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
                    <DropdownMenuTrigger className={buttonVariants({ variant: "ghost", size: "icon" })}>
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
