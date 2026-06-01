"use client";

import { useState, useTransition } from "react";
import { Key, Copy, CheckCircle2, XCircle, Plus, RefreshCw } from "lucide-react";
import { generateInviteCode } from "@/app/actions/invites";
import { toast } from "sonner";

interface InviteCodeRow {
  id: number;
  code: string;
  isUsed: boolean;
  usedAt: Date | string | null;
  createdAt: Date | string;
  usedByUsername: string | null;
  usedByDisplayName: string | null;
}

interface InvitesClientProps {
  initialCodes: InviteCodeRow[];
}

export function InvitesClient({ initialCodes }: InvitesClientProps) {
  const [codes, setCodes] = useState<InviteCodeRow[]>(initialCodes);
  const [pending, startTransition] = useTransition();

  const handleGenerate = () => {
    startTransition(async () => {
      const res = await generateInviteCode();
      if (res.error) {
        toast.error(res.error);
      } else if (res.code) {
        const newCodeRow: InviteCodeRow = {
          id: res.code.id,
          code: res.code.code,
          isUsed: res.code.isUsed,
          usedAt: res.code.usedAt,
          createdAt: res.code.createdAt,
          usedByUsername: null,
          usedByDisplayName: null,
        };
        setCodes((prev) => [newCodeRow, ...prev]);
        toast.success("Single-use invite code generated!");
      }
    });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`Copied invite code: ${text}`);
  };

  const totalCodes = codes.length;
  const usedCodes = codes.filter((c) => c.isUsed).length;
  const unusedCodes = totalCodes - usedCodes;

  const stats = [
    { label: "Total Codes", value: totalCodes.toString(), icon: Key, color: "#3b82f6" },
    { label: "Unused / Active", value: unusedCodes.toString(), icon: CheckCircle2, color: "#22c55e" },
    { label: "Used Codes", value: usedCodes.toString(), icon: XCircle, color: "#ef4444" },
  ];

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-fade-in">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="border-2 border-black bg-white p-5 shadow-[4px_4px_0_#000] flex flex-col gap-3"
            style={{ borderRadius: "0px" }}
          >
            <div className="flex items-center justify-between">
              <div
                className="w-10 h-10 border-2 border-black flex items-center justify-center shadow-[2px_2px_0_#000]"
                style={{ backgroundColor: stat.color, borderRadius: "0px" }}
              >
                <stat.icon size={20} className="text-black" />
              </div>
              <span className="text-3xl font-black text-black">
                {stat.value}
              </span>
            </div>
            <span className="text-xs font-black uppercase tracking-widest text-zinc-500">
              {stat.label}
            </span>
          </div>
        ))}
      </div>

      {/* Main card */}
      <div className="border-2 border-black bg-white shadow-[4px_4px_0_#000] animate-fade-in" style={{ borderRadius: "0px" }}>
        {/* Card Header */}
        <div className="border-b-2 border-black bg-amber-400 p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-xl font-black uppercase tracking-tighter text-black">
              Student Registration Invites
            </h2>
            <p className="text-sm font-bold text-black/70 uppercase tracking-wide">
              Create and manage secure, single-use invite codes for new student Google registration.
            </p>
          </div>
          
          <button
            onClick={handleGenerate}
            disabled={pending}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-yellow-300 hover:bg-yellow-400 disabled:opacity-60 border-2 border-black shadow-[3px_3px_0_#000] hover:shadow-[4px_4px_0_#000] active:shadow-none hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0 active:translate-y-0 transition-all font-black text-xs uppercase tracking-wider text-black"
          >
            {pending ? (
              <RefreshCw size={16} className="animate-spin" />
            ) : (
              <Plus size={16} />
            )}
            {pending ? "Generating..." : "Generate Code"}
          </button>
        </div>

        {/* Card Content */}
        <div className="p-6">
          {codes.length === 0 ? (
            <div className="text-center py-16 border border-dashed border-zinc-300 bg-zinc-50 text-zinc-400 font-bold uppercase text-sm">
              No invite codes generated yet. Click "Generate Code" above!
            </div>
          ) : (
            <div className="overflow-x-auto border-2 border-black">
              <table className="w-full text-sm text-left">
                <thead className="bg-zinc-100 border-b-2 border-black">
                  <tr>
                    <th className="px-4 py-3 text-xs font-black uppercase tracking-widest text-black">Code</th>
                    <th className="px-4 py-3 text-xs font-black uppercase tracking-widest text-black">Status</th>
                    <th className="px-4 py-3 text-xs font-black uppercase tracking-widest text-black hidden sm:table-cell">Created At</th>
                    <th className="px-4 py-3 text-xs font-black uppercase tracking-widest text-black">Recipient</th>
                    <th className="px-4 py-3 text-right text-xs font-black uppercase tracking-widest text-black">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {codes.map((c) => (
                    <tr
                      key={c.id}
                      className={`border-b border-zinc-200 transition-colors hover:bg-zinc-50 ${
                        c.isUsed ? "bg-zinc-50/50 opacity-75" : ""
                      }`}
                    >
                      {/* Code string with copy shortcut */}
                      <td className="px-4 py-3 font-mono font-black text-sm text-zinc-900">
                        <span
                          onClick={() => !c.isUsed && copyToClipboard(c.code)}
                          className={`cursor-pointer inline-flex items-center gap-1.5 p-1 border-2 border-transparent hover:border-black transition-all ${
                            c.isUsed ? "cursor-default text-zinc-400" : "text-blue-600 hover:bg-blue-50"
                          }`}
                        >
                          {c.code}
                          {!c.isUsed && <Copy size={12} className="text-zinc-500" />}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 border text-[10px] font-black uppercase tracking-widest ${
                            c.isUsed
                              ? "bg-red-50 text-red-700 border-red-200"
                              : "bg-green-50 text-green-700 border-green-200"
                          }`}
                        >
                          {c.isUsed ? (
                            <>
                              <XCircle size={10} /> Used
                            </>
                          ) : (
                            <>
                              <CheckCircle2 size={10} /> Active
                            </>
                          )}
                        </span>
                      </td>

                      {/* Date Created */}
                      <td className="px-4 py-3 text-xs font-bold text-zinc-500 hidden sm:table-cell">
                        {new Date(c.createdAt).toLocaleDateString("en-GB", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>

                      {/* Used By Student */}
                      <td className="px-4 py-3 font-bold text-zinc-800">
                        {c.isUsed ? (
                          c.usedByDisplayName || `@${c.usedByUsername}`
                        ) : (
                          <span className="text-zinc-400 font-medium">—</span>
                        )}
                      </td>

                      {/* Action */}
                      <td className="px-4 py-3 text-right">
                        {!c.isUsed && (
                          <button
                            onClick={() => copyToClipboard(c.code)}
                            className="inline-flex items-center justify-center gap-1 px-3 py-1.5 bg-white border-2 border-black hover:bg-zinc-100 shadow-[2px_2px_0_#000] hover:shadow-[3px_3px_0_#000] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all text-xs font-black uppercase tracking-wider text-black"
                          >
                            Copy
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
