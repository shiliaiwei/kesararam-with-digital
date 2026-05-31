"use client";

import { useEffect, useState, useTransition } from "react";
import { assignStudentToClass, createClass, deleteClass, getClassStudents, searchStudents } from "@/app/actions/classes";
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
import {
  Check,
  MoreHorizontal,
  Plus,
  Search,
  School,
  Trash2,
  UserPlus,
  Users,
  MapPin,
  GraduationCap,
  Lock,
  Unlock,
} from "lucide-react";
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
  schoolName: string;
  province: string;
  gradeLevel: string;
  section: string | null;
  isLocked: boolean;
  teacherName: string | null;
  teacherEmail: string | null;
}

interface StudentRow {
  enrollmentId?: number;
  studentId: number;
  id?: number;
  username: string;
  email: string;
  displayName: string | null;
  schoolName: string | null;
  province: string | null;
  gradeLevel: string | null;
  section: string | null;
  className?: string | null;
  enrolledAt?: string | Date;
}

function Badge({ children, tone = "neutral" }: { children: React.ReactNode; tone?: "neutral" | "green" | "yellow" | "blue" | "red" }) {
  const toneClass =
    tone === "green"
      ? "bg-green-400"
      : tone === "yellow"
        ? "bg-yellow-400"
        : tone === "blue"
          ? "bg-blue-400"
          : tone === "red"
            ? "bg-red-400"
            : "bg-zinc-200";

  return (
    <span className={`inline-flex items-center gap-1 border-2 border-black px-2 py-0.5 text-[10px] font-black uppercase ${toneClass}`}>
      {children}
    </span>
  );
}

function CreateClassDialog({ onSuccess }: { onSuccess: (row: ClassRow, code: string) => void }) {
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
        return;
      }

      const row: ClassRow = {
        id: Date.now(),
        name: String(formData.get("name") ?? ""),
        code: res.code ?? "",
        createdAt: new Date(),
        schoolName: String(formData.get("schoolName") ?? ""),
        province: String(formData.get("province") ?? ""),
        gradeLevel: String(formData.get("gradeLevel") ?? ""),
        section: String(formData.get("section") ?? "") || null,
        isLocked: false,
        teacherName: null,
        teacherEmail: null,
      };

      setOpen(false);
      setError("");
      toast.success(`Class created. Join code: ${row.code}`);
      onSuccess(row, row.code);
    });
  }

  return (
    <>
      <Button size="sm" onClick={() => setOpen(true)}>
        <Plus className="size-4 mr-1" />
        New Class
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Create Class</DialogTitle>
            <DialogDescription>
              Add the school and grade first. Student matching will use these fields.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="grid gap-4 pt-2">
            <div className="grid gap-1.5">
              <Label htmlFor="class-name">Class Name</Label>
              <Input id="class-name" name="name" required placeholder="Grade 6 Morning A" />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="school-name">School Name</Label>
              <Input id="school-name" name="schoolName" required placeholder="Kesararam Primary School" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <Label htmlFor="province">Province</Label>
                <Input id="province" name="province" required placeholder="Siem Reap" />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="grade-level">Grade Level</Label>
                <Input id="grade-level" name="gradeLevel" required placeholder="Grade 6" />
              </div>
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="section">Section / Group</Label>
              <Input id="section" name="section" placeholder="Morning A" />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
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

function ManageClassDialog({
  cls,
  onClose,
}: {
  cls: ClassRow;
  onClose: () => void;
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<StudentRow[]>([]);
  const [roster, setRoster] = useState<StudentRow[]>([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loadingRoster, setLoadingRoster] = useState(false);
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [loadingAssign, setLoadingAssign] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let active = true;
    setLoadingRoster(true);
    getClassStudents(cls.id)
      .then((rows) => {
        if (active) setRoster(rows as StudentRow[]);
      })
      .finally(() => {
        if (active) setLoadingRoster(false);
      });

    return () => {
      active = false;
    };
  }, [cls.id]);

  async function runSearch() {
    const q = searchQuery.trim();
    if (!q) {
      setSearchResults([]);
      return;
    }

    setLoadingSearch(true);
    setError("");
    try {
      const rows = await searchStudents(q);
      setSearchResults(rows as StudentRow[]);
    } catch {
      setError("Search failed.");
    } finally {
      setLoadingSearch(false);
    }
  }

  async function handleAssign(identifier: string) {
    const value = identifier.trim();
    if (!value) return;

    setLoadingAssign(true);
    setError("");
    setMessage("");

    try {
      const formData = new FormData();
      formData.set("classId", String(cls.id));
      formData.set("identifier", value);
      const res = await assignStudentToClass(formData);

      if (res?.error) {
        setError(res.error);
        return;
      }

      setMessage(`${res.student?.displayName ?? res.student?.username ?? "Student"} assigned.`);
      setSearchQuery("");
      setSearchResults([]);
      const updatedRoster = await getClassStudents(cls.id);
      setRoster(updatedRoster as StudentRow[]);
      toast.success("Student assigned to class");
    } catch {
      setError("Failed to assign student.");
    } finally {
      setLoadingAssign(false);
    }
  }

  async function handleCopyCode() {
    try {
      await navigator.clipboard.writeText(cls.code);
      setCopied(true);
      toast.success("Join code copied");
      setTimeout(() => setCopied(false), 1800);
    } catch {
      toast.error("Copy failed");
    }
  }

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-3xl max-h-[92vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Manage {cls.name}</DialogTitle>
          <DialogDescription>
            Teacher-controlled enrollment. Students must match the school, province, and grade exactly.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4">
          <div className="border-2 border-black bg-white p-4 shadow-[4px_4px_0_#000]">
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <Badge tone="blue"><School className="size-3" /> {cls.schoolName}</Badge>
              <Badge tone="green"><MapPin className="size-3" /> {cls.province}</Badge>
              <Badge tone="yellow"><GraduationCap className="size-3" /> {cls.gradeLevel}</Badge>
              {cls.section && <Badge tone="neutral">{cls.section}</Badge>}
              <Badge tone={cls.isLocked ? "red" : "green"}>{cls.isLocked ? <Lock className="size-3" /> : <Unlock className="size-3" />} {cls.isLocked ? "Locked" : "Open"}</Badge>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <code className="bg-yellow-400 px-2 py-1 border-2 border-black font-mono text-sm font-black tracking-widest">{cls.code}</code>
              <Button type="button" size="sm" variant="outline" onClick={handleCopyCode}>
                {copied ? <Check className="size-4 mr-1" /> : null}
                {copied ? "Copied" : "Copy Join Code"}
              </Button>
            </div>
          </div>

          <div className="grid gap-2 border-2 border-black bg-white p-4 shadow-[4px_4px_0_#000]">
            <Label htmlFor="student-search">Search student by username</Label>
            <div className="flex gap-2">
              <Input
                id="student-search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="@username or email"
              />
              <Button type="button" onClick={runSearch} disabled={loadingSearch || !searchQuery.trim()}>
                <Search className="size-4 mr-1" />
                {loadingSearch ? "Searching…" : "Search"}
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => handleAssign(searchQuery)}
                disabled={loadingAssign || !searchQuery.trim()}
              >
                <UserPlus className="size-4 mr-1" />
                {loadingAssign ? "Adding…" : "Add"}
              </Button>
            </div>
            <p className="text-xs text-zinc-600 font-medium">
              Matching rules: school, province, and grade must be identical.
            </p>
            {error && <p className="text-sm font-bold text-red-600">{error}</p>}
            {message && <p className="text-sm font-bold text-green-700">{message}</p>}
          </div>

          {searchResults.length > 0 && (
            <div className="border-2 border-black bg-white p-4 shadow-[4px_4px_0_#000]">
              <h3 className="text-sm font-black uppercase tracking-widest mb-3">Search Results</h3>
              <div className="grid gap-2">
                {searchResults.map((student) => (
                  <button
                    key={student.id ?? student.studentId ?? student.username}
                    type="button"
                    onClick={() => handleAssign(student.username)}
                    className="flex items-center justify-between gap-3 border-2 border-black px-3 py-2 text-left hover:bg-yellow-50 transition-colors"
                  >
                    <div className="min-w-0">
                      <p className="font-black truncate">{student.displayName ?? student.username}</p>
                      <p className="text-xs text-zinc-500 truncate">@{student.username} · {student.email}</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {student.schoolName && <Badge>{student.schoolName}</Badge>}
                        {student.province && <Badge tone="blue">{student.province}</Badge>}
                        {student.gradeLevel && <Badge tone="green">{student.gradeLevel}</Badge>}
                        {student.className && <Badge tone="yellow">{student.className}</Badge>}
                      </div>
                    </div>
                    <span className="text-xs font-black uppercase">Assign</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="border-2 border-black bg-white shadow-[4px_4px_0_#000]">
            <div className="border-b-2 border-black bg-green-400 px-4 py-3 flex items-center justify-between">
              <h3 className="font-black uppercase tracking-widest text-sm">Class Roster</h3>
              <span className="text-xs font-black uppercase">{loadingRoster ? "Loading…" : `${roster.length} students`}</span>
            </div>
            <div className="max-h-80 overflow-y-auto">
              {loadingRoster ? (
                <div className="p-6 text-sm font-bold text-zinc-500">Loading roster…</div>
              ) : roster.length === 0 ? (
                <div className="p-6 text-sm font-bold text-zinc-500">No students assigned yet.</div>
              ) : (
                roster.map((student) => (
                  <div key={student.enrollmentId ?? student.studentId ?? student.username} className="border-b border-zinc-200 px-4 py-3">
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="font-black truncate">{student.displayName ?? student.username}</p>
                        <p className="text-xs text-zinc-500 truncate">@{student.username} · {student.email}</p>
                      </div>
                      <div className="flex flex-wrap gap-1 justify-end">
                        {student.province && <Badge tone="blue">{student.province}</Badge>}
                        {student.gradeLevel && <Badge tone="green">{student.gradeLevel}</Badge>}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
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
  const [selectedClass, setSelectedClass] = useState<ClassRow | null>(null);
  const [, startTransition] = useTransition();

  function handleCreate(row: ClassRow) {
    setClasses((prev) => [row, ...prev]);
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
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <p className="text-sm text-muted-foreground">
          {classes.length} class{classes.length !== 1 ? "es" : ""}
        </p>
        <CreateClassDialog onSuccess={handleCreate} />
      </div>

      <div className="rounded-md border-2 border-black overflow-hidden bg-white shadow-[4px_4px_0_#000]">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Class</TableHead>
              <TableHead>School / Grade</TableHead>
              <TableHead>Join Code</TableHead>
              {showTeacher && <TableHead className="hidden md:table-cell">Teacher</TableHead>}
              <TableHead className="hidden lg:table-cell">Created</TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {classes.map((c) => (
              <TableRow key={c.id}>
                <TableCell className="font-medium">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <span className="font-black">{c.name}</span>
                      {c.isLocked ? <Badge tone="red"><Lock className="size-3" /> Locked</Badge> : <Badge tone="green"><Unlock className="size-3" /> Open</Badge>}
                    </div>
                    {c.section && <span className="text-xs text-zinc-500">{c.section}</span>}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1.5">
                    <Badge tone="blue"><School className="size-3" /> {c.schoolName}</Badge>
                    <Badge tone="green"><MapPin className="size-3" /> {c.province}</Badge>
                    <Badge tone="yellow"><GraduationCap className="size-3" /> {c.gradeLevel}</Badge>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <code className="bg-yellow-400 px-2 py-0.5 border-2 border-black text-sm font-mono tracking-widest">
                      {c.code}
                    </code>
                  </div>
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
                      <DropdownMenuItem onClick={() => setSelectedClass(c)}>
                        <Users className="size-4 mr-2" />
                        Manage Students
                      </DropdownMenuItem>
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
                  colSpan={showTeacher ? 6 : 5}
                  className="text-center text-muted-foreground py-10 text-sm"
                >
                  No classes yet. Create one to get started.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {selectedClass && (
        <ManageClassDialog cls={selectedClass} onClose={() => setSelectedClass(null)} />
      )}
    </div>
  );
}
