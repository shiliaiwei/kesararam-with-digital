"use client";

import { useState, useTransition } from "react";
import { useLang } from "@/context/lang-context";
import Link from "next/link";
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
import { MoreHorizontal, Plus, Trash2, Eye, ShieldAlert } from "lucide-react";
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
  gradeLevel: string | null;
  schoolName: string | null;
  province: string | null;
  section: string | null;
  status: string | null;
}

const CAMBODIA_PROVINCES = [
  { en: "Siem Reap", kh: "សៀមរាប" },
  { en: "Phnom Penh", kh: "ភ្នំពេញ" },
  { en: "Battambang", kh: "បាត់ដំបង" },
  { en: "Banteay Meanchey", kh: "បន្ទាយមានជ័យ" },
  { en: "Kampong Cham", kh: "កំពង់ចាម" },
  { en: "Kampong Chhnang", kh: "កំពង់ឆ្នាំង" },
  { en: "Kampong Speu", kh: "កំពង់ស្ពឺ" },
  { en: "Kampong Thom", kh: "កំពង់ធំ" },
  { en: "Kampot", kh: "កំពត" },
  { en: "Kandal", kh: "កណ្តាល" },
  { en: "Kep", kh: "កែប" },
  { en: "Koh Kong", kh: "កោះកុង" },
  { en: "Kratie", kh: "ក្រចេះ" },
  { en: "Mondulkiri", kh: "មណ្ឌលគីរី" },
  { en: "Oudar Meanchey", kh: "ឧត្តរមានជ័យ" },
  { en: "Pailin", kh: "ប៉ៃលិន" },
  { en: "Preah Sihanouk", kh: "ព្រះសីហនុ" },
  { en: "Preah Vihear", kh: "ព្រះវិហារ" },
  { en: "Prey Veng", kh: "ព្រៃវែង" },
  { en: "Pursat", kh: "ពោធិ៍សាត់" },
  { en: "Ratanakiri", kh: "រតនគីរី" },
  { en: "Stung Treng", kh: "ស្ទឹងត្រែង" },
  { en: "Svay Rieng", kh: "ស្វាយរៀង" },
  { en: "Takeo", kh: "តាកែវ" },
  { en: "Tboung Khmum", kh: "ត្បូងឃ្មុំ" },
];

const GRADES = [
  { en: "Grade 6", kh: "ថ្នាក់ទី ៦" },
  { en: "Grade 7", kh: "ថ្នាក់ទី ៧" },
  { en: "Grade 8", kh: "ថ្នាក់ទី ៨" },
  { en: "Grade 9", kh: "ថ្នាក់ទី ៩" },
  { en: "Grade 10", kh: "ថ្នាក់ទី ១០" },
  { en: "Grade 11", kh: "ថ្នាក់ទី ១១" },
  { en: "Grade 12", kh: "ថ្នាក់ទី ១២" },
];

function CreateClassDialog({
  onSuccess,
}: {
  onSuccess: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const { lang } = useLang();
  const kh = lang === "kh";

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
        toast.success(kh ? `បានបង្កើតថ្នាក់រៀន "${name}"។ លេខកូដចូលរួម៖ ${res.code}` : `Class "${name}" created. Join code: ${res.code}`);
        onSuccess();
      }
    });
  }

  return (
    <>
      <Button size="sm" onClick={() => setOpen(true)} className="bg-yellow-400 text-black border-2 border-black hover:bg-yellow-500 shadow-[3px_3px_0_#000]">
        <Plus className="size-4 mr-1 text-black" />
        <span className="font-black text-black">{kh ? "ថ្នាក់ថ្មី" : "New Class"}</span>
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md bg-white border-4 border-black rounded-none" style={{ boxShadow: "8px 8px 0 #000" }}>
          <DialogHeader>
            <DialogTitle className="text-2xl font-black uppercase tracking-tight font-google-sans">{kh ? "បង្កើតថ្នាក់រៀន" : "Create Class"}</DialogTitle>
            <DialogDescription className="text-sm font-bold text-zinc-500">
              {kh ? "សិស្សត្រូវតែផ្ទៀងផ្ទាត់សាលា ខេត្ត និងកម្រិតថ្នាក់ ដើម្បីចូលរួមដោយស្វ័យប្រវត្តិ។" : "Students must match the school, province, and grade details to auto-join."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4 pt-2">
            <div className="grid gap-1.5">
              <Label htmlFor="class-name" className="text-xs font-black uppercase tracking-widest">Class Name / ឈ្មោះថ្នាក់ *</Label>
              <Input
                id="class-name"
                name="name"
                required
                placeholder="e.g. Grade 6 Morning"
                className="border-2 border-black rounded-none focus:outline-none focus:ring-0 focus:shadow-[2px_2px_0_#000]"
              />
            </div>

            <div className="grid gap-1.5">
              <Label htmlFor="school-name" className="text-xs font-black uppercase tracking-widest">School Name / ឈ្មោះសាលា *</Label>
              <Input
                id="school-name"
                name="schoolName"
                required
                placeholder="e.g. Kesararam Primary School"
                className="border-2 border-black rounded-none focus:outline-none focus:ring-0 focus:shadow-[2px_2px_0_#000]"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <Label htmlFor="province" className="text-xs font-black uppercase tracking-widest">Province / ខេត្ត *</Label>
                <select
                  id="province"
                  name="province"
                  required
                  defaultValue=""
                  className="w-full px-3 py-2 border-2 border-black rounded-none text-sm font-bold bg-white focus:outline-none"
                >
                  <option value="" disabled>{kh ? "ជ្រើសរើសខេត្ត" : "Select Province"}</option>
                  {CAMBODIA_PROVINCES.map((prov) => (
                    <option key={prov.en} value={prov.en}>
                      {kh ? prov.kh : prov.en}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid gap-1.5">
                <Label htmlFor="grade" className="text-xs font-black uppercase tracking-widest">Grade / ថ្នាក់ *</Label>
                <select
                  id="grade"
                  name="gradeLevel"
                  required
                  defaultValue=""
                  className="w-full px-3 py-2 border-2 border-black rounded-none text-sm font-bold bg-white focus:outline-none"
                >
                  <option value="" disabled>{kh ? "ជ្រើសរើសកម្រិតថ្នាក់" : "Select Grade"}</option>
                  {GRADES.map((gr) => (
                    <option key={gr.en} value={gr.en}>
                      {kh ? gr.kh : gr.en}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid gap-1.5">
              <Label htmlFor="section" className="text-xs font-black uppercase tracking-widest">Section / វេន (Optional)</Label>
              <Input
                id="section"
                name="section"
                placeholder="e.g. Morning A / Group 1"
                className="border-2 border-black rounded-none focus:outline-none focus:ring-0 focus:shadow-[2px_2px_0_#000]"
              />
            </div>

            {error && <p className="text-sm font-bold text-destructive">{error}</p>}
            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                className="border-2 border-black rounded-none font-bold hover:bg-zinc-100"
              >
                {kh ? "បោះបង់" : "Cancel"}
              </Button>
              <Button type="submit" disabled={pending} className="bg-yellow-400 border-2 border-black rounded-none hover:bg-yellow-500 text-black font-black shadow-[3px_3px_0_#000]">
                {pending ? (kh ? "កំពុងបង្កើត..." : "Creating…") : (kh ? "បង្កើតថ្នាក់រៀន" : "Create Class")}
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
  const { lang } = useLang();
  const kh = lang === "kh";

  function handleCreateSuccess() {
    // Reload page to fetch up-to-date database columns and list order
    window.location.reload();
  }

  function handleDelete(id: number) {
    if (!confirm(kh ? "លុបថ្នាក់នេះ? វានឹងលុបសិស្សទាំងអស់ចេញពីថ្នាក់។ វាមិនអាចត្រឡប់វិញបានទេ។" : "Delete this class? This will disenroll all students. This cannot be undone.")) return;
    startTransition(async () => {
      const res = await deleteClass(id);
      if (res?.error) {
        toast.error(res.error);
      } else {
        setClasses((prev) => prev.filter((c) => c.id !== id));
        toast.success(kh ? "បានលុបថ្នាក់រៀន។" : "Class deleted.");
      }
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <p className="text-sm font-bold text-zinc-500 uppercase tracking-wider font-google-sans">
          {kh 
            ? `${classes.length} ថ្នាក់ត្រូវបានរកឃើញ` 
            : `${classes.length} class${classes.length !== 1 ? "es" : ""} found`}
        </p>
        <CreateClassDialog onSuccess={handleCreateSuccess} />
      </div>

      <div className="rounded-none border-2 border-black overflow-hidden bg-white shadow-[4px_4px_0_#000]">
        <Table>
          <TableHeader className="bg-zinc-100 border-b-2 border-black">
            <TableRow>
              <TableHead className="font-black text-black text-xs uppercase tracking-widest font-google-sans">{kh ? "ព័ត៌មានលម្អិតថ្នាក់" : "Class Details"}</TableHead>
              <TableHead className="font-black text-black text-xs uppercase tracking-widest hidden md:table-cell font-google-sans">{kh ? "សាលារៀន / ទីតាំង" : "School / Location"}</TableHead>
              <TableHead className="font-black text-black text-xs uppercase tracking-widest hidden sm:table-cell font-google-sans">{kh ? "ថ្នាក់" : "Grade"}</TableHead>
              <TableHead className="font-black text-black text-xs uppercase tracking-widest font-google-sans">{kh ? "លេខកូដចូលរួម" : "Join Code"}</TableHead>
              <TableHead className="font-black text-black text-xs uppercase tracking-widest font-google-sans">{kh ? "ស្ថានភាព" : "Status"}</TableHead>
              {showTeacher && (
                <TableHead className="hidden md:table-cell font-black text-black text-xs uppercase tracking-widest font-google-sans">{kh ? "គ្រូបង្រៀន" : "Teacher"}</TableHead>
              )}
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {classes.map((c) => {
              const displayProvince = kh 
                ? (CAMBODIA_PROVINCES.find(p => p.en === c.province)?.kh || c.province)
                : c.province;
              const displayGrade = kh 
                ? (GRADES.find(g => g.en === c.gradeLevel)?.kh || c.gradeLevel)
                : c.gradeLevel;
              const displayStatus = c.status === "locked"
                ? (kh ? "បានចាក់សោ" : "locked")
                : c.status === "archived"
                  ? (kh ? "បានរក្សាទុក" : "archived")
                  : (kh ? "សកម្ម" : "active");

              return (
                <TableRow key={c.id} className="border-b border-zinc-100 hover:bg-zinc-50/50">
                  <TableCell>
                    <Link href={`/teacher/classes/${c.id}`} className="font-black text-sm text-blue-600 hover:underline">
                      {c.name}
                    </Link>
                    {c.section && (
                      <span className="block text-[11px] font-bold text-zinc-400 uppercase mt-0.5">
                        {kh ? "វេន" : "Section"}: {c.section}
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="hidden md:table-cell font-bold text-zinc-700">
                    {c.schoolName ? (
                      <>
                        <div>{c.schoolName}</div>
                        <div className="text-xs text-zinc-400 font-bold uppercase">{displayProvince}</div>
                      </>
                    ) : (
                      <span className="text-zinc-300">—</span>
                    )}
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    {c.gradeLevel ? (
                      <span className="inline-block px-2.5 py-0.5 text-xs font-black bg-purple-100 text-purple-700 border border-purple-300">
                        {displayGrade}
                      </span>
                    ) : (
                      <span className="text-zinc-300">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <code className="bg-zinc-100 border border-zinc-300 px-2.5 py-1 text-sm font-mono tracking-widest font-black text-black">
                      {c.code}
                    </code>
                  </TableCell>
                  <TableCell>
                    <span className={`inline-block px-2.5 py-0.5 text-[10px] font-black uppercase border-2 border-black ${
                      c.status === "locked" 
                        ? "bg-red-400 text-black" 
                        : c.status === "archived" 
                          ? "bg-zinc-400 text-black"
                          : "bg-green-400 text-black"
                    }`}>
                      {displayStatus}
                    </span>
                  </TableCell>
                  {showTeacher && (
                    <TableCell className="hidden md:table-cell text-sm font-bold text-zinc-500">
                      {c.teacherName ?? c.teacherEmail ?? "—"}
                    </TableCell>
                  )}
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        className={buttonVariants({
                          variant: "ghost",
                          size: "icon",
                        })}
                      >
                        <MoreHorizontal className="size-4" />
                        <span className="sr-only">{kh ? "សកម្មភាព" : "Actions"}</span>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="border-2 border-black rounded-none">
                        <DropdownMenuItem asChild>
                          <Link href={`/teacher/classes/${c.id}`} className="cursor-pointer font-bold">
                            <Eye className="size-4 mr-2" />
                            {kh ? "មើលបញ្ជីឈ្មោះ" : "View Roster"}
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive font-bold cursor-pointer hover:!bg-red-50"
                          onClick={() => handleDelete(c.id)}
                        >
                          <Trash2 className="size-4 mr-2" />
                          {kh ? "លុប" : "Delete"}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              );
            })}
            {classes.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={showTeacher ? 7 : 6}
                  className="text-center text-zinc-400 py-12 text-sm font-bold uppercase tracking-wider font-google-sans"
                >
                  {kh ? "មិនទាន់មានថ្នាក់នៅឡើយទេ។ បង្កើតមួយដើម្បីចាប់ផ្តើម។" : "No classes yet. Create one to get started."}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
