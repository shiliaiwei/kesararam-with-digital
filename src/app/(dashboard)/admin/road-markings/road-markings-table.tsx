"use client";

import { useState, useTransition } from "react";
import type { RoadMarking } from "@/db/schema";
import {
  createRoadMarking,
  updateRoadMarking,
  deleteRoadMarking,
  toggleRoadMarkingActive,
} from "@/app/actions/road-markings";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { MoreHorizontal, Plus, Search } from "lucide-react";
import { toast } from "sonner";

// ── types ────────────────────────────────────────────────────────────────────

type Row = Pick<
  RoadMarking,
  | "id"
  | "category"
  | "nameEn"
  | "nameKm"
  | "descriptionEn"
  | "descriptionKm"
  | "imageUrl"
  | "colorCode"
  | "isActive"
  | "sortOrder"
  | "createdAt"
>;

const CATEGORIES = [
  { value: "curbs", label: "Curbs Markings" },
  { value: "signals", label: "Signals Markings" },
  { value: "longitudinal", label: "Longitudinal Markings" },
] as const;

const CATEGORY_STYLE: Record<
  string,
  { border: string; bg: string; text: string; accent: string }
> = {
  curbs: {
    border: "border-[#006747]",
    bg: "bg-[#ffffff]",
    text: "text-[#006747]",
    accent: "#006747",
  },
  signals: {
    border: "border-[#3b82f6]",
    bg: "bg-white",
    text: "text-[#3b82f6]",
    accent: "#3b82f6",
  },
  longitudinal: {
    border: "border-[#f97316]",
    bg: "bg-white",
    text: "text-[#f97316]",
    accent: "#f97316",
  },
};

// ── shared form fields ────────────────────────────────────────────────────────

function MarkingFormFields({
  defaultValues,
}: {
  defaultValues?: Partial<Row>;
}) {
  return (
    <>
      <div className="grid gap-1.5">
        <Label className="font-bold uppercase text-xs tracking-widest">
          Category
        </Label>
        <Select
          name="category"
          defaultValue={defaultValues?.category ?? "curbs"}
          required
        >
          <SelectTrigger className="border-2 border-[#a8a8a8] shadow-[2px_2px_0_#000] rounded-none">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="border-2 border-[#a8a8a8] rounded-none">
            {CATEGORIES.map((c) => (
              <SelectItem
                key={c.value}
                value={c.value}
                className="rounded-none"
              >
                {c.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="grid gap-1.5">
          <Label className="font-bold uppercase text-xs tracking-widest">
            Name (EN)
          </Label>
          <Input
            name="nameEn"
            required
            defaultValue={defaultValues?.nameEn ?? ""}
            placeholder="e.g. White Edge Line"
            className="border-2 border-[#a8a8a8] shadow-[2px_2px_0_#000] rounded-none"
          />
        </div>
        <div className="grid gap-1.5">
          <Label className="font-bold uppercase text-xs tracking-widest">
            Name (KM)
          </Label>
          <Input
            name="nameKm"
            defaultValue={defaultValues?.nameKm ?? ""}
            placeholder="ភាសាខ្មែរ"
            className="border-2 border-[#a8a8a8] shadow-[2px_2px_0_#000] rounded-none"
          />
        </div>
      </div>

      <div className="grid gap-1.5">
        <Label className="font-bold uppercase text-xs tracking-widest">
          Description (EN)
        </Label>
        <Textarea
          name="descriptionEn"
          defaultValue={defaultValues?.descriptionEn ?? ""}
          rows={2}
          placeholder="Describe the road marking..."
          className="border-2 border-[#a8a8a8] shadow-[2px_2px_0_#000] rounded-none resize-none"
        />
      </div>

      <div className="grid gap-1.5">
        <Label className="font-bold uppercase text-xs tracking-widest">
          Description (KM)
        </Label>
        <Textarea
          name="descriptionKm"
          defaultValue={defaultValues?.descriptionKm ?? ""}
          rows={2}
          placeholder="ពិពណ៌នា..."
          className="border-2 border-[#a8a8a8] shadow-[2px_2px_0_#000] rounded-none resize-none"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="grid gap-1.5">
          <Label className="font-bold uppercase text-xs tracking-widest">
            Image URL
          </Label>
          <Input
            name="imageUrl"
            defaultValue={defaultValues?.imageUrl ?? ""}
            placeholder="https://..."
            className="border-2 border-[#a8a8a8] shadow-[2px_2px_0_#000] rounded-none"
          />
        </div>
        <div className="grid gap-1.5">
          <Label className="font-bold uppercase text-xs tracking-widest">
            Color Code
          </Label>
          <Input
            name="colorCode"
            defaultValue={defaultValues?.colorCode ?? ""}
            placeholder="#ffffff"
            className="border-2 border-[#a8a8a8] shadow-[2px_2px_0_#000] rounded-none"
          />
        </div>
      </div>

      <div className="grid gap-1.5">
        <Label className="font-bold uppercase text-xs tracking-widest">
          Sort Order
        </Label>
        <Input
          name="sortOrder"
          type="number"
          min={0}
          defaultValue={defaultValues?.sortOrder ?? 0}
          className="border-2 border-[#a8a8a8] shadow-[2px_2px_0_#000] rounded-none w-24"
        />
      </div>
    </>
  );
}

// ── Create dialog ─────────────────────────────────────────────────────────────

function CreateDialog({ onSuccess }: { onSuccess: () => void }) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState("");

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      const res = await createRoadMarking(fd);
      if (res?.error) {
        setError(res.error);
      } else {
        setOpen(false);
        setError("");
        toast.success("Road marking created.");
        onSuccess();
      }
    });
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-4 py-2 font-bold text-sm uppercase tracking-widest border-2 border-[#a8a8a8] bg-[#eab308] shadow-[4px_4px_0_#000] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0_#000] transition-all"
      >
        <Plus className="size-4" />
        New Marking
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white border-2 border-[#a8a8a8] shadow-[8px_8px_0_#000] w-full max-w-xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b-2 border-[#a8a8a8] bg-[#eab308]">
          <h2 className="font-black text-lg uppercase tracking-widest">
            New Road Marking
          </h2>
          <button
            onClick={() => setOpen(false)}
            className="font-black text-xl w-8 h-8 flex items-center justify-center border-2 border-[#a8a8a8] bg-white hover:bg-[#ef4444] hover:text-white transition-colors"
          >
            X
          </button>
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 p-5">
          <MarkingFormFields />
          {error && (
            <p className="border-2 border-[#ef4444] bg-[#fda4af] px-3 py-2 text-sm font-bold">
              {error}
            </p>
          )}
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="px-4 py-2 font-bold text-sm uppercase tracking-widest border-2 border-[#a8a8a8] bg-white shadow-[2px_2px_0_#000] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={pending}
              className="px-4 py-2 font-bold text-sm uppercase tracking-widest border-2 border-[#a8a8a8] bg-[#22c55e] shadow-[4px_4px_0_#000] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0_#000] transition-all disabled:opacity-60"
            >
              {pending ? "Creating..." : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Edit dialog ───────────────────────────────────────────────────────────────

function EditDialog({ row, onSuccess }: { row: Row; onSuccess: () => void }) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState("");

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      const res = await updateRoadMarking(row.id, fd);
      if (res?.error) {
        setError(res.error);
      } else {
        setOpen(false);
        setError("");
        toast.success("Road marking updated.");
        onSuccess();
      }
    });
  }

  return (
    <>
      <DropdownMenuItem onClick={() => setOpen(true)}>Edit</DropdownMenuItem>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white border-2 border-[#a8a8a8] shadow-[8px_8px_0_#000] w-full max-w-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b-2 border-[#a8a8a8] bg-[#3b82f6]">
              <h2 className="font-black text-lg uppercase tracking-widest text-white">
                Edit Marking
              </h2>
              <button
                onClick={() => setOpen(false)}
                className="font-black text-xl w-8 h-8 flex items-center justify-center border-2 border-[#a8a8a8] bg-white hover:bg-[#ef4444] hover:text-white transition-colors"
              >
                X
              </button>
            </div>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4 p-5">
              <MarkingFormFields defaultValues={row} />
              <div className="grid gap-1.5">
                <Label className="font-bold uppercase text-xs tracking-widest">
                  Status
                </Label>
                <Select
                  name="isActive"
                  defaultValue={row.isActive ? "true" : "false"}
                >
                  <SelectTrigger className="border-2 border-[#a8a8a8] shadow-[2px_2px_0_#000] rounded-none">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="border-2 border-[#a8a8a8] rounded-none">
                    <SelectItem value="true" className="rounded-none">
                      Active
                    </SelectItem>
                    <SelectItem value="false" className="rounded-none">
                      Inactive
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {error && (
                <p className="border-2 border-[#ef4444] bg-[#fda4af] px-3 py-2 text-sm font-bold">
                  {error}
                </p>
              )}
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="px-4 py-2 font-bold text-sm uppercase tracking-widest border-2 border-[#a8a8a8] bg-white shadow-[2px_2px_0_#000] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={pending}
                  className="px-4 py-2 font-bold text-sm uppercase tracking-widest border-2 border-[#a8a8a8] bg-[#22c55e] shadow-[4px_4px_0_#000] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0_#000] transition-all disabled:opacity-60"
                >
                  {pending ? "Saving..." : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

// ── Delete confirm ────────────────────────────────────────────────────────────

function DeleteMenuItem({
  id,
  name,
  onSuccess,
}: {
  id: number;
  name: string;
  onSuccess: () => void;
}) {
  const [pending, startTransition] = useTransition();

  function handleDelete() {
    if (!window.confirm(`Delete "${name}"? This cannot be undone.`)) return;
    startTransition(async () => {
      const res = await deleteRoadMarking(id);
      if (res?.error) {
        toast.error(res.error);
      } else {
        toast.success("Road marking deleted.");
        onSuccess();
      }
    });
  }

  return (
    <DropdownMenuItem
      onClick={handleDelete}
      disabled={pending}
      className="text-[#ef4444] focus:text-[#ef4444]"
    >
      {pending ? "Deleting..." : "Delete"}
    </DropdownMenuItem>
  );
}

// ── Category badge ────────────────────────────────────────────────────────────

function CategoryBadge({ category }: { category: string }) {
  const style = CATEGORY_STYLE[category] ?? CATEGORY_STYLE.curbs;
  const label = CATEGORIES.find((c) => c.value === category)?.label ?? category;
  return (
    <span
      className={`inline-block px-2 py-0.5 text-xs font-bold uppercase tracking-widest border-2 ${style.border} ${style.bg} ${style.text}`}
    >
      {label}
    </span>
  );
}

// ── Main table ────────────────────────────────────────────────────────────────

export function RoadMarkingsTable({ initialRows }: { initialRows: Row[] }) {
  const [rows, setRows] = useState(initialRows);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [, startTransition] = useTransition();

  function refresh() {
    window.location.reload();
  }

  function handleToggleActive(id: number, current: boolean) {
    startTransition(async () => {
      await toggleRoadMarkingActive(id, !current);
      setRows((prev) =>
        prev.map((r) => (r.id === id ? { ...r, isActive: !current } : r)),
      );
    });
  }

  const filtered = rows.filter((r) => {
    const matchCat = categoryFilter === "all" || r.category === categoryFilter;
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      r.nameEn.toLowerCase().includes(q) ||
      r.nameKm.toLowerCase().includes(q) ||
      r.descriptionEn.toLowerCase().includes(q);
    return matchCat && matchSearch;
  });

  // Group counts per category for summary cards
  const counts = {
    curbs: rows.filter((r) => r.category === "curbs").length,
    signals: rows.filter((r) => r.category === "signals").length,
    longitudinal: rows.filter((r) => r.category === "longitudinal").length,
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="border-2 border-[#a8a8a8] bg-[#ffffff] shadow-[4px_4px_0_#000] p-4">
          <p className="text-xs font-bold uppercase tracking-widest text-[#a8a8a8]">
            Curbs Markings
          </p>
          <p className="text-3xl font-black mt-1" style={{ color: "#006747" }}>
            {counts.curbs}
          </p>
        </div>
        <div className="border-2 border-[#a8a8a8] bg-white shadow-[4px_4px_0_#000] p-4">
          <p className="text-xs font-bold uppercase tracking-widest text-[#a8a8a8]">
            Signals Markings
          </p>
          <p className="text-3xl font-black mt-1 text-[#3b82f6]">
            {counts.signals}
          </p>
        </div>
        <div className="border-2 border-[#a8a8a8] bg-white shadow-[4px_4px_0_#000] p-4">
          <p className="text-xs font-bold uppercase tracking-widest text-[#a8a8a8]">
            Longitudinal
          </p>
          <p className="text-3xl font-black mt-1 text-[#f97316]">
            {counts.longitudinal}
          </p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="flex gap-2 flex-1 max-w-md">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-[#a8a8a8]" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search markings..."
              className="w-full pl-9 pr-3 py-2 border-2 border-[#a8a8a8] shadow-[2px_2px_0_#000] text-sm font-medium focus:outline-none focus:shadow-[4px_4px_0_#000] transition-all"
            />
          </div>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="border-2 border-[#a8a8a8] shadow-[2px_2px_0_#000] px-3 py-2 text-sm font-bold uppercase tracking-widest focus:outline-none bg-white"
          >
            <option value="all">All</option>
            {CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </div>
        <CreateDialog onSuccess={refresh} />
      </div>

      {/* Table */}
      <div className="border-2 border-[#a8a8a8] shadow-[4px_4px_0_#000] overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-b-2 border-[#a8a8a8] bg-black hover:bg-black">
              <TableHead className="text-white font-black uppercase tracking-widest text-xs py-3">
                Name
              </TableHead>
              <TableHead className="text-white font-black uppercase tracking-widest text-xs">
                Category
              </TableHead>
              <TableHead className="text-white font-black uppercase tracking-widest text-xs hidden md:table-cell">
                Description
              </TableHead>
              <TableHead className="text-white font-black uppercase tracking-widest text-xs">
                Color
              </TableHead>
              <TableHead className="text-white font-black uppercase tracking-widest text-xs">
                Status
              </TableHead>
              <TableHead className="text-white font-black uppercase tracking-widest text-xs text-right">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((row) => (
              <TableRow
                key={row.id}
                className="border-b-2 border-[#a8a8a8] hover:bg-zinc-50"
              >
                <TableCell className="font-bold">
                  <span>{row.nameEn}</span>
                  {row.nameKm && (
                    <span className="block text-xs text-[#a8a8a8] mt-0.5">
                      {row.nameKm}
                    </span>
                  )}
                </TableCell>
                <TableCell>
                  <CategoryBadge category={row.category} />
                </TableCell>
                <TableCell className="hidden md:table-cell text-sm text-zinc-600 max-w-xs truncate">
                  {row.descriptionEn || "-"}
                </TableCell>
                <TableCell>
                  {row.colorCode ? (
                    <div className="flex items-center gap-2">
                      <span
                        className="inline-block w-5 h-5 border-2 border-[#a8a8a8]"
                        style={{ background: row.colorCode }}
                      />
                      <span className="text-xs font-mono">{row.colorCode}</span>
                    </div>
                  ) : (
                    <span className="text-[#a8a8a8]">-</span>
                  )}
                </TableCell>
                <TableCell>
                  <button
                    onClick={() => handleToggleActive(row.id, row.isActive)}
                    className={`px-2 py-0.5 text-xs font-black uppercase tracking-widest border-2 border-[#a8a8a8] transition-colors ${
                      row.isActive
                        ? "bg-[#22c55e] text-black"
                        : "bg-[#a8a8a8] text-white"
                    }`}
                  >
                    {row.isActive ? "Active" : "Inactive"}
                  </button>
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger className="p-1 border-2 border-[#a8a8a8] hover:border-[#a8a8a8] hover:shadow-[2px_2px_0_#000] transition-all">
                      <MoreHorizontal className="size-4" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="end"
                      className="border-2 border-[#a8a8a8] rounded-none shadow-[4px_4px_0_#000]"
                    >
                      <EditDialog row={row} onSuccess={refresh} />
                      <DropdownMenuSeparator className="bg-black" />
                      <DeleteMenuItem
                        id={row.id}
                        name={row.nameEn}
                        onSuccess={refresh}
                      />
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
            {filtered.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-center py-16 text-sm font-bold uppercase tracking-widest text-[#a8a8a8]"
                >
                  No road markings found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <p className="text-xs text-[#a8a8a8] font-medium">
        {filtered.length} of {rows.length} marking{rows.length !== 1 ? "s" : ""}
      </p>
    </div>
  );
}
