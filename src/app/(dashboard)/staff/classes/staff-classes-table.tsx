"use client";

import { useState, useCallback } from "react";
import { Search, UserPlus, Copy, Check, X, Users, RefreshCw, ChevronDown, ChevronUp } from "lucide-react";

interface ClassRow {
  id: number;
  name: string;
  code: string;
  createdAt: Date;
  teacherName: string | null;
  teacherEmail: string | null;
}

interface EnrolledStudent {
  enrollmentId: number;
  enrolledAt: string;
  studentId: number;
  username: string;
  email: string;
  displayName: string | null;
}

function AssignModal({ cls, onClose }: { cls: ClassRow; onClose: () => void }) {
  const [identifier, setIdentifier] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ success?: boolean; error?: string; student?: { displayName: string | null; username: string; email: string } } | null>(null);
  const [enrolled, setEnrolled] = useState<EnrolledStudent[]>([]);
  const [loadingEnrolled, setLoadingEnrolled] = useState(false);
  const [showEnrolled, setShowEnrolled] = useState(false);

  const fetchEnrolled = useCallback(async () => {
    setLoadingEnrolled(true);
    try {
      const res = await fetch(`/api/staff/classes/${cls.id}/assign`);
      const data = await res.json();
      setEnrolled(data.students ?? []);
    } catch {
      setEnrolled([]);
    } finally {
      setLoadingEnrolled(false);
    }
  }, [cls.id]);

  const handleAssign = async () => {
    if (!identifier.trim()) return;
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch(`/api/staff/classes/${cls.id}/assign`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier: identifier.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setResult({ error: data.error });
      } else {
        setResult({ success: true, student: data.student });
        setIdentifier("");
        if (showEnrolled) fetchEnrolled();
      }
    } catch {
      setResult({ error: "Network error" });
    } finally {
      setLoading(false);
    }
  };

  const toggleEnrolled = () => {
    if (!showEnrolled) fetchEnrolled();
    setShowEnrolled((v) => !v);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="bg-white w-full max-w-md" style={{ border: "3px solid #000", boxShadow: "8px 8px 0 #000" }}>
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3" style={{ background: "#000", borderBottom: "3px solid #000" }}>
          <div>
            <span className="font-black text-sm uppercase tracking-widest" style={{ color: "#FFEE00" }}>ASSIGN STUDENT</span>
            <p className="text-[10px] font-bold mt-0.5" style={{ color: "#FFEE00", opacity: 0.7 }}>{cls.name}</p>
          </div>
          <button onClick={onClose} style={{ color: "#FFEE00" }}><X className="w-5 h-5" /></button>
        </div>

        <div className="p-4 space-y-4">
          {/* Join code info */}
          <div className="flex items-center gap-2 px-3 py-2" style={{ background: "#FFEE00", border: "2px solid #000" }}>
            <span className="text-[10px] font-black uppercase">Join Code:</span>
            <code className="font-mono font-black text-sm">{cls.code}</code>
          </div>

          {/* Search input */}
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase">Student Email or Username</label>
            <div className="flex gap-2">
              <input
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAssign()}
                placeholder="student@email.com or username"
                className="flex-1 px-3 py-2 text-sm font-bold focus:outline-none"
                style={{ border: "2px solid #000" }}
              />
              <button
                onClick={handleAssign}
                disabled={loading || !identifier.trim()}
                className="flex items-center gap-1 px-3 py-2 font-black text-xs uppercase disabled:opacity-50"
                style={{ background: "#000", color: "#FFEE00", border: "2px solid #000" }}
              >
                {loading ? <RefreshCw className="w-3 h-3 animate-spin" /> : <UserPlus className="w-3 h-3" />}
                ASSIGN
              </button>
            </div>
          </div>

          {/* Result feedback */}
          {result && (
            <div
              className="px-3 py-2 text-sm font-bold"
              style={{
                background: result.success ? "#bbf7d0" : "#fecaca",
                border: `2px solid ${result.success ? "#16a34a" : "#dc2626"}`,
              }}
            >
              {result.success
                ? `✓ ${result.student?.displayName ?? result.student?.username ?? "Student"} assigned to ${cls.name}`
                : `✗ ${result.error}`}
            </div>
          )}

          {/* Enrolled students toggle */}
          <button
            onClick={toggleEnrolled}
            className="w-full flex items-center justify-between px-3 py-2 text-xs font-black uppercase"
            style={{ border: "2px solid #000", background: showEnrolled ? "#000" : "#fff", color: showEnrolled ? "#FFEE00" : "#000" }}
          >
            <span className="flex items-center gap-1">
              <Users className="w-3 h-3" /> Enrolled Students {enrolled.length > 0 && `(${enrolled.length})`}
            </span>
            {showEnrolled ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>

          {showEnrolled && (
            <div style={{ border: "2px solid #000", maxHeight: 200, overflowY: "auto" }}>
              {loadingEnrolled ? (
                <div className="flex items-center justify-center py-6">
                  <RefreshCw className="w-4 h-4 animate-spin text-gray-400" />
                </div>
              ) : enrolled.length === 0 ? (
                <p className="text-center text-xs font-bold text-gray-400 py-4">No students enrolled yet</p>
              ) : (
                enrolled.map((s) => (
                  <div key={s.enrollmentId} className="flex items-center justify-between px-3 py-2 text-xs font-bold" style={{ borderBottom: "1px solid #e5e7eb" }}>
                    <div>
                      <p className="font-black">{s.displayName ?? s.username}</p>
                      <p className="text-gray-500">{s.email}</p>
                    </div>
                    <span className="text-[10px] text-gray-400">{new Date(s.enrolledAt).toLocaleDateString()}</span>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function StaffClassesTable({ classes }: { classes: ClassRow[] }) {
  const [search, setSearch] = useState("");
  const [copied, setCopied] = useState<string | null>(null);
  const [assignClass, setAssignClass] = useState<ClassRow | null>(null);

  const filtered = classes.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.code.toLowerCase().includes(search.toLowerCase()) ||
      (c.teacherName ?? "").toLowerCase().includes(search.toLowerCase())
  );

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code).catch(() => {});
    setCopied(code);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <>
      <div className="space-y-4">
        <div className="relative max-w-xs">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search classes..."
            className="w-full pl-9 pr-3 py-2 border-2 border-black text-sm font-bold focus:outline-none"
          />
        </div>

        <div className="border-2 border-black overflow-hidden">
          <table className="w-full text-sm" style={{ borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#000", color: "#fff" }}>
                <th className="px-4 py-2 text-left font-black uppercase text-xs">Class Name</th>
                <th className="px-4 py-2 text-left font-black uppercase text-xs">Join Code</th>
                <th className="px-4 py-2 text-left font-black uppercase text-xs">Teacher</th>
                <th className="px-4 py-2 text-left font-black uppercase text-xs">Created</th>
                <th className="px-4 py-2 text-left font-black uppercase text-xs">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-sm font-bold text-zinc-400">
                    No classes found
                  </td>
                </tr>
              ) : (
                filtered.map((c, i) => (
                  <tr key={c.id} style={{ borderBottom: "1px solid #000", background: i % 2 === 0 ? "#fff" : "#fafafa" }}>
                    <td className="px-4 py-3 font-black uppercase">{c.name}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <code className="font-mono font-bold text-xs px-2 py-0.5" style={{ background: "#FFEE00", border: "1px solid #000" }}>
                          {c.code}
                        </code>
                        <button onClick={() => copyCode(c.code)} className="p-1" style={{ border: "1px solid #000" }}>
                          {copied === c.code ? <Check size={12} /> : <Copy size={12} />}
                        </button>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs font-bold text-zinc-600">
                      {c.teacherName ?? c.teacherEmail ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-xs font-bold text-zinc-500">
                      {new Date(c.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => setAssignClass(c)}
                        className="flex items-center gap-1 px-3 py-1 text-xs font-black uppercase"
                        style={{ background: "#FFEE00", border: "2px solid #000" }}
                      >
                        <UserPlus size={12} />
                        ASSIGN
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {assignClass && <AssignModal cls={assignClass} onClose={() => setAssignClass(null)} />}
    </>
  );
}
