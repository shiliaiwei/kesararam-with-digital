"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { assignStudentAction, removeStudentAction, updateClassControlAction, updateClassDetailsAction } from "@/app/actions/enrollment";
import { toast } from "sonner";
import {
  ArrowLeft, Users, School, Calendar, Lock, Unlock,
  RefreshCw, Trash2, ShieldCheck, ShieldAlert, CheckCircle2, XCircle,
  Pencil, Copy, Check, Save, X
} from "lucide-react";

interface StudentRoster {
  id: number;
  username: string;
  displayName: string;
  email: string;
  schoolName: string;
  province: string;
  gradeLevel: string;
  section: string;
  lifetimePoints: number;
  enrolledAt: Date;
}

interface ClassDetails {
  id: number;
  name: string;
  code: string;
  schoolName: string;
  province: string;
  gradeLevel: string;
  section: string;
  status: string;
  createdAt: Date;
}

interface VerificationErrorDetails {
  school: { student: string; class: string; match: boolean };
  province: { student: string; class: string; match: boolean };
  grade: { student: string; class: string; match: boolean };
}

export function ClassRosterClient({
  classDetails,
  initialRoster,
}: {
  classDetails: ClassDetails;
  initialRoster: StudentRoster[];
}) {
  const [cls, setCls] = useState<ClassDetails>(classDetails);
  const [roster, setRoster] = useState<StudentRoster[]>(initialRoster);
  const [searchUsername, setSearchUsername] = useState("");
  const [verificationError, setVerificationError] = useState<VerificationErrorDetails | null>(null);
  const [generalError, setGeneralError] = useState("");

  const [pendingAdd, startAddTransition] = useTransition();
  const [pendingControl, startControlTransition] = useTransition();

  // Edit class name + grade
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState(cls.name);
  const [editGrade, setEditGrade] = useState(cls.gradeLevel);
  const [editSchool, setEditSchool] = useState(cls.schoolName);
  const [editProvince, setEditProvince] = useState(cls.province);
  const [editSection, setEditSection] = useState(cls.section);
  const [pendingEdit, startEditTransition] = useTransition();
  const [copied, setCopied] = useState(false);

  function copyCode() {
    navigator.clipboard
      .writeText(cls.code)
      .then(() => {
        setCopied(true);
        toast.success("Join code copied!");
        setTimeout(() => setCopied(false), 1500);
      })
      .catch(() => toast.error("Could not copy."));
  }

  function startEdit() {
    setEditName(cls.name);
    setEditGrade(cls.gradeLevel);
    setEditSchool(cls.schoolName);
    setEditProvince(cls.province);
    setEditSection(cls.section);
    setEditing(true);
  }

  function saveEdit() {
    const name = editName.trim();
    const gradeLevel = editGrade.trim();
    const schoolName = editSchool.trim();
    const province = editProvince.trim();
    const section = editSection.trim();
    if (!name) {
      toast.error("Class name cannot be empty.");
      return;
    }
    startEditTransition(async () => {
      const res = await updateClassDetailsAction(cls.id, { name, gradeLevel, schoolName, province, section });
      if (res?.error) {
        toast.error(res.error);
      } else if (res?.success) {
        setCls((prev) => ({ ...prev, name, gradeLevel, schoolName, province, section }));
        setEditing(false);
        toast.success("Class details updated.");
      }
    });
  }

  // Control action (lock, unlock, regenerate code)
  function handleControl(action: "status" | "code", value: string) {
    if (action === "status" && value === "archived") {
      if (!confirm("Are you sure you want to archive this class?")) return;
    }
    if (action === "code") {
      if (!confirm("Are you sure you want to regenerate the join code? Existing student links will change.")) return;
    }

    startControlTransition(async () => {
      const res = await updateClassControlAction(cls.id, action, value);
      if (res?.error) {
        toast.error(res.error);
      } else if (res?.success && res.updates) {
        setCls((prev) => ({
          ...prev,
          status: res.updates.status ?? prev.status,
          code: res.updates.code ?? prev.code,
        }));
        toast.success("Class controls updated successfully.");
      }
    });
  }

  // Remove student
  function handleRemove(studentId: number, name: string) {
    if (!confirm(`Are you sure you want to remove "${name}" from this class?`)) return;

    startControlTransition(async () => {
      const res = await removeStudentAction(cls.id, studentId);
      if (res?.error) {
        toast.error(res.error);
      } else {
        setRoster((prev) => prev.filter((s) => s.id !== studentId));
        toast.success(`Removed "${name}" from roster.`);
      }
    });
  }

  // Add student
  function handleAddStudent(e: React.FormEvent) {
    e.preventDefault();
    setVerificationError(null);
    setGeneralError("");

    if (!searchUsername.trim()) return;

    startAddTransition(async () => {
      const res = await assignStudentAction(cls.id, searchUsername);
      if (res?.error) {
        if (res.details) {
          setVerificationError(res.details);
          toast.error("Auto-join blocked: Credentials mismatch!");
        } else {
          setGeneralError(res.error);
          toast.error(res.error);
        }
      } else if (res?.success) {
        toast.success(`Student "${res.name}" successfully added to roster!`);
        setSearchUsername("");
        // Reload page to get fresh roster with points and timestamps
        window.location.reload();
      }
    });
  }

  return (
    <div className="space-y-6">
      {/* Back button & Header */}
      <div className="border-b-4 border-black pb-6">
        <Link
          href="/teacher/classes"
          className="inline-flex items-center gap-1 text-xs font-black uppercase tracking-wider text-zinc-500 hover:text-black mb-3 transition-colors"
        >
          <ArrowLeft size={14} /> Back to Classes / ត្រឡប់ទៅបញ្ជីថ្នាក់
        </Link>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {editing ? (
            <div className="flex-1 space-y-2">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Class Name / ឈ្មោះថ្នាក់</label>
                <input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  maxLength={80}
                  disabled={pendingEdit}
                  className="w-full max-w-md px-3 py-2 border-2 border-black rounded-none text-2xl font-black uppercase focus:outline-none focus:shadow-[2px_2px_0_#000] disabled:bg-zinc-100"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Grade Level / កម្រិតថ្នាក់</label>
                <input
                  value={editGrade}
                  onChange={(e) => setEditGrade(e.target.value)}
                  maxLength={40}
                  placeholder="e.g. Grade 12"
                  disabled={pendingEdit}
                  className="w-full max-w-xs px-3 py-2 border-2 border-black rounded-none text-sm font-bold focus:outline-none focus:shadow-[2px_2px_0_#000] disabled:bg-zinc-100"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-2xl">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">School Name / ឈ្មោះសាលា</label>
                  <input
                    value={editSchool}
                    onChange={(e) => setEditSchool(e.target.value)}
                    maxLength={120}
                    placeholder="e.g. Kesararam Primary School"
                    disabled={pendingEdit}
                    className="w-full px-3 py-2 border-2 border-black rounded-none text-sm font-bold focus:outline-none focus:shadow-[2px_2px_0_#000] disabled:bg-zinc-100"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Location / ទីតាំង (ខេត្ត)</label>
                  <input
                    value={editProvince}
                    onChange={(e) => setEditProvince(e.target.value)}
                    maxLength={80}
                    placeholder="e.g. Siem Reap"
                    disabled={pendingEdit}
                    className="w-full px-3 py-2 border-2 border-black rounded-none text-sm font-bold focus:outline-none focus:shadow-[2px_2px_0_#000] disabled:bg-zinc-100"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Section / ផ្នែក</label>
                  <input
                    value={editSection}
                    onChange={(e) => setEditSection(e.target.value)}
                    maxLength={40}
                    placeholder="e.g. A"
                    disabled={pendingEdit}
                    className="w-full px-3 py-2 border-2 border-black rounded-none text-sm font-bold focus:outline-none focus:shadow-[2px_2px_0_#000] disabled:bg-zinc-100"
                  />
                </div>
              </div>
              <div className="flex items-center gap-2 pt-1">
                <button
                  onClick={saveEdit}
                  disabled={pendingEdit}
                  className="inline-flex items-center gap-1.5 px-4 py-2 border-2 border-black bg-green-400 text-black font-black text-xs uppercase shadow-[2px_2px_0_#000] hover:shadow-[3px_3px_0_#000] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all disabled:opacity-50"
                >
                  <Save size={14} /> {pendingEdit ? "Saving..." : "Save / រក្សាទុក"}
                </button>
                <button
                  onClick={() => setEditing(false)}
                  disabled={pendingEdit}
                  className="inline-flex items-center gap-1.5 px-4 py-2 border-2 border-black bg-white text-black font-black text-xs uppercase shadow-[2px_2px_0_#000] hover:shadow-[3px_3px_0_#000] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all disabled:opacity-50"
                >
                  <X size={14} /> Cancel
                </button>
              </div>
            </div>
          ) : (
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-4xl font-black uppercase tracking-tighter text-black">
                  {cls.name}
                </h1>
                <button
                  onClick={startEdit}
                  className="p-2 border-2 border-black bg-white hover:bg-zinc-100 shadow-[2px_2px_0_#000] hover:shadow-[3px_3px_0_#000] transition-all"
                  title="Edit class name & grade / កែឈ្មោះ និងថ្នាក់"
                >
                  <Pencil size={16} />
                </button>
              </div>
              <p className="text-sm font-bold text-zinc-500 uppercase mt-1">
                {cls.schoolName} · {cls.province} · {cls.gradeLevel} {cls.section ? `(${cls.section})` : ""}
              </p>
            </div>
          )}

          {/* Quick controls */}
          <div className="flex items-center gap-3">
            {/* Status indicators */}
            <span className={`px-3 py-1.5 border-2 border-black font-black uppercase text-xs ${cls.status === "locked" ? "bg-red-400" : "bg-green-400"
              }`}>
              {cls.status === "locked" ? "Locked / ថ្នាក់ជាប់សោ" : "Active / បើកចំហ"}
            </span>

            {/* Lock / Unlock button */}
            <button
              onClick={() => handleControl("status", cls.status === "locked" ? "active" : "locked")}
              disabled={pendingControl}
              className="p-2 border-2 border-black bg-white hover:bg-zinc-100 shadow-[2px_2px_0_#000] hover:shadow-[3px_3px_0_#000] transition-all disabled:opacity-50"
              title={cls.status === "locked" ? "Unlock Class" : "Lock Class"}
            >
              {cls.status === "locked" ? <Unlock size={18} /> : <Lock size={18} />}
            </button>

            {/* Regenerate Code */}
            <button
              onClick={() => handleControl("code", "")}
              disabled={pendingControl}
              className="p-2 border-2 border-black bg-white hover:bg-zinc-100 shadow-[2px_2px_0_#000] hover:shadow-[3px_3px_0_#000] transition-all disabled:opacity-50"
              title="Regenerate Join Code"
            >
              <RefreshCw size={18} className={pendingControl ? "animate-spin" : ""} />
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="border-2 border-black bg-white p-5 shadow-[4px_4px_0_#000] flex items-center justify-between">
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Total Enrolled / សិស្សសរុប</span>
            <h2 className="text-3xl font-black text-black mt-1">{roster.length}</h2>
          </div>
          <div className="w-10 h-10 border-2 border-black bg-blue-400 flex items-center justify-center shadow-[2px_2px_0_#000]">
            <Users size={20} className="text-black" />
          </div>
        </div>

        <div className="border-2 border-black bg-white p-5 shadow-[4px_4px_0_#000] flex items-center justify-between">
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Grade Level / កម្រិតថ្នាក់</span>
            <h2 className="text-2xl font-black text-black mt-1 uppercase">{cls.gradeLevel || "N/A"}</h2>
          </div>
          <div className="w-10 h-10 border-2 border-black bg-purple-400 flex items-center justify-center shadow-[2px_2px_0_#000]">
            <Calendar size={20} className="text-black" />
          </div>
        </div>

        <div className="border-2 border-black bg-white p-5 shadow-[4px_4px_0_#000] flex items-center justify-between">
          <div className="min-w-0">
            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Join Code / លេខកូដថ្នាក់</span>
            <div className="flex items-center gap-2 mt-1">
              <h2 className="text-2xl font-mono font-black text-black tracking-widest">{cls.code}</h2>
              <button
                onClick={copyCode}
                className={`p-1.5 border-2 border-black shadow-[2px_2px_0_#000] hover:shadow-[3px_3px_0_#000] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all ${copied ? "bg-green-400" : "bg-white hover:bg-zinc-100"}`}
                title="Copy join code / ចម្លងលេខកូដ"
              >
                {copied ? <Check size={14} /> : <Copy size={14} />}
              </button>
            </div>
          </div>
          <div className="w-10 h-10 border-2 border-black bg-yellow-400 flex items-center justify-center shadow-[2px_2px_0_#000] flex-shrink-0">
            <School size={20} className="text-black" />
          </div>
        </div>
      </div>

      {/* Main Grid split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Roster list */}
        <div className="lg:col-span-2 space-y-4">
          <div className="border-2 border-black bg-white shadow-[4px_4px_0_#000]">
            <div className="bg-yellow-400 border-b-2 border-black px-4 py-3 flex items-center justify-between">
              <h3 className="font-black uppercase tracking-tight text-black">Student Roster / បញ្ជីឈ្មោះសិស្ស</h3>
              <span className="text-xs font-black uppercase tracking-wide bg-white px-2 py-0.5 border border-black">{roster.length} Active</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-zinc-50 border-b border-black">
                  <tr>
                    <th className="px-4 py-3 font-black text-xs uppercase tracking-wider text-black">Student Name</th>
                    <th className="px-4 py-3 font-black text-xs uppercase tracking-wider text-black hidden sm:table-cell">School / Location</th>
                    <th className="px-4 py-3 font-black text-xs uppercase tracking-wider text-black text-center">Score</th>
                    <th className="px-4 py-3 font-black text-xs uppercase tracking-wider text-black text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {roster.map((student) => (
                    <tr key={student.id} className="border-b border-zinc-100 hover:bg-zinc-50/50">
                      <td className="px-4 py-3">
                        <div className="font-black text-sm">{student.displayName}</div>
                        <div className="text-xs text-zinc-400 font-bold uppercase mt-0.5">@{student.username}</div>
                      </td>
                      <td className="px-4 py-3 hidden sm:table-cell font-bold text-zinc-500 text-xs">
                        <div>{student.schoolName}</div>
                        <div className="text-[10px] text-zinc-400 font-black uppercase">{student.province} · {student.gradeLevel}</div>
                      </td>
                      <td className="px-4 py-3 text-center font-black font-mono">
                        {student.lifetimePoints ?? 0}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => handleRemove(student.id, student.displayName)}
                          className="p-1.5 border border-black hover:bg-red-50 text-red-600 hover:border-red-600 transition-colors"
                          title="Disenroll Student"
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {roster.length === 0 && (
                    <tr>
                      <td colSpan={4} className="py-12 text-center text-zinc-400 uppercase font-black tracking-widest text-xs">
                        Class roster is empty.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Add Student Form */}
        <div className="space-y-4">
          <div className="border-2 border-black bg-white shadow-[4px_4px_0_#000]">
            <div className="bg-blue-400 border-b-2 border-black px-4 py-3">
              <h3 className="font-black uppercase tracking-tight text-black">Enroll Student / បញ្ចូលសិស្ស</h3>
            </div>
            <div className="p-5 space-y-4">
              <form onSubmit={handleAddStudent} className="space-y-3">
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="search-username" className="text-xs font-black uppercase tracking-widest">
                    Student Username / ឈ្មោះគណនី
                  </label>
                  <input
                    type="text"
                    id="search-username"
                    value={searchUsername}
                    onChange={(e) => setSearchUsername(e.target.value)}
                    placeholder="e.g. sopheak01"
                    disabled={cls.status === "locked" || pendingAdd}
                    className="w-full px-4 py-2 border-2 border-black rounded-none text-sm font-bold focus:outline-none focus:shadow-[2px_2px_0_#000] disabled:bg-zinc-100 disabled:cursor-not-allowed"
                  />
                </div>
                <button
                  type="submit"
                  disabled={cls.status === "locked" || pendingAdd || !searchUsername.trim()}
                  className="w-full py-2.5 bg-yellow-400 text-black border-2 border-black font-black text-sm uppercase shadow-[3px_3px_0_#000] hover:shadow-[4px_4px_0_#000] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all duration-100 disabled:opacity-50 disabled:shadow-none disabled:-translate-x-0 disabled:-translate-y-0"
                >
                  {pendingAdd ? "Verifying..." : "Add to Class / បញ្ចូលថ្នាក់"}
                </button>
              </form>

              {cls.status === "locked" && (
                <div className="p-3 border-2 border-red-500 bg-red-50 text-xs font-bold text-red-700 flex gap-2 items-center">
                  <Lock size={14} className="shrink-0" />
                  <span>Class is locked. Unlock it at the top to add students.</span>
                </div>
              )}

              {generalError && (
                <div className="p-3 border-2 border-red-500 bg-red-100 text-xs font-bold text-black flex gap-2 items-center">
                  <XCircle size={14} className="shrink-0 text-red-600" />
                  <span>{generalError}</span>
                </div>
              )}

              {/* Match Verification Matrix report */}
              {verificationError && (
                <div className="border-2 border-red-500 rounded-none overflow-hidden bg-white mt-4">
                  <div className="bg-red-500 text-white font-black text-xs uppercase px-3 py-2 flex items-center gap-1.5">
                    <ShieldAlert size={14} /> Rule Verification Failed
                  </div>
                  <div className="p-3 space-y-3">
                    <p className="text-[11px] font-bold text-zinc-500 uppercase">
                      Student profile does not match classroom parameters:
                    </p>
                    <div className="space-y-2 text-xs">
                      {/* School Verification */}
                      <div className="flex items-center justify-between border-b pb-1.5">
                        <div>
                          <div className="font-black text-zinc-400 uppercase text-[9px] tracking-wider">School / សាលា</div>
                          <div className="font-bold text-zinc-700 mt-0.5">{verificationError.school.student}</div>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="text-[10px] text-zinc-400 font-mono font-bold mr-1">vs {verificationError.school.class}</span>
                          {verificationError.school.match ? (
                            <CheckCircle2 size={16} className="text-green-500 shrink-0" />
                          ) : (
                            <XCircle size={16} className="text-red-500 shrink-0" />
                          )}
                        </div>
                      </div>

                      {/* Province Verification */}
                      <div className="flex items-center justify-between border-b pb-1.5">
                        <div>
                          <div className="font-black text-zinc-400 uppercase text-[9px] tracking-wider">Province / ខេត្ត</div>
                          <div className="font-bold text-zinc-700 mt-0.5">{verificationError.province.student}</div>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="text-[10px] text-zinc-400 font-mono font-bold mr-1">vs {verificationError.province.class}</span>
                          {verificationError.province.match ? (
                            <CheckCircle2 size={16} className="text-green-500 shrink-0" />
                          ) : (
                            <XCircle size={16} className="text-red-500 shrink-0" />
                          )}
                        </div>
                      </div>

                      {/* Grade Verification */}
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-black text-zinc-400 uppercase text-[9px] tracking-wider">Grade / ថ្នាក់</div>
                          <div className="font-bold text-zinc-700 mt-0.5">{verificationError.grade.student}</div>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="text-[10px] text-zinc-400 font-mono font-bold mr-1">vs {verificationError.grade.class}</span>
                          {verificationError.grade.match ? (
                            <CheckCircle2 size={16} className="text-green-500 shrink-0" />
                          ) : (
                            <XCircle size={16} className="text-red-500 shrink-0" />
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
