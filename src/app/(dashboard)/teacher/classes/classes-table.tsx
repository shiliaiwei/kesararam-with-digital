"use client";

import { useState, useTransition } from "react";
import { createClass, deleteClass } from "@/app/actions/classes";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { MoreHorizontal, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ClassRow {
  id: number;
  name: string;
  code: string;
  createdAt: Date;
  teacherName: string | null;
  teacherEmail: string | null;
}

function CreateClassDialog({
  onSuccess,
}: {
  onSuccess: (name: string, code: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState("");

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      const res = await createClass(formData);
      if (res?.error) {
        setError(res.error);
      } else if (res?.success && res.code) {
        setOpen(false);
        setError("");
        const name = formData.get("name") as string;
        toast.success(`Class "${name}" created. Join code: ${res.code}`);
        onSuccess(name, res.code);
      }
    });
  }

  return (
    <>
      <Button size="sm" onClick={() => setOpen(true)}>
        <Plus className="size-4 mr-1" />
        New Class
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create Class</DialogTitle>
          <DialogDescription>
            A unique join code will be generated automatically.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 pt-2">
          <div className="grid gap-1.5">
            <Label htmlFor="class-name">Class Name</Label>
            <Input
              id="class-name"
              name="name"
              required
              placeholder="e.g. Morning Driving 2026"
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

export function ClassesTable({
  initialClasses,
  showTeacher,
}: {
  initialClasses: ClassRow[];
  showTeacher?: boolean;
}) {
  const [classes, setClasses] = useState(initialClasses);
  const [, startTransition] = useTransition();

  function handleCreate(name: string, code: string) {
    setClasses((prev) => [
      {
        id: Date.now(),
        name,
        code,
        createdAt: new Date(),
        teacherName: null,
        teacherEmail: null,
      },
      ...prev,
    ]);
  }

  function handleDelete(id: number) {
    if (!confirm("Delete this class? This cannot be undone.")) return;
    startTransition(async () => {
      const res = await deleteClass(id);
      if (res?.error) {
        toast.error(res.error);
      } else {
        setClasses((prev) => prev.filter((c) => c.id !== id));
        toast.success("Class deleted.");
      }
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {classes.length} class{classes.length !== 1 ? "es" : ""}
        </p>
        <CreateClassDialog onSuccess={handleCreate} />
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Class Name</TableHead>
              <TableHead>Join Code</TableHead>
              {showTeacher && (
                <TableHead className="hidden md:table-cell">Teacher</TableHead>
              )}
              <TableHead className="hidden lg:table-cell">Created</TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {classes.map((c) => (
              <TableRow key={c.id}>
                <TableCell className="font-medium">{c.name}</TableCell>
                <TableCell>
                  <code className="bg-muted px-2 py-0.5 rounded text-sm font-mono tracking-widest">
                    {c.code}
                  </code>
                </TableCell>
                {showTeacher && (
                  <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                    {c.teacherName ?? c.teacherEmail ?? "—"}
                  </TableCell>
                )}
                <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">
                  {new Date(c.createdAt).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger className={buttonVariants({ variant: "ghost", size: "icon" })}>
                      <MoreHorizontal className="size-4" />
                      <span className="sr-only">Actions</span>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        className="text-destructive"
                        onClick={() => handleDelete(c.id)}
                      >
                        <Trash2 className="size-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
            {classes.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={showTeacher ? 5 : 4}
                  className="text-center text-muted-foreground py-10 text-sm"
                >
                  No classes yet. Create one to get started.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
