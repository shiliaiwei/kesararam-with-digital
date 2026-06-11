"use client";

import { useState } from "react";
import { KeyRound, Eye, EyeOff, Loader2, Check, AlertTriangle } from "lucide-react";

export function ChangePassword() {
    const [current, setCurrent] = useState("");
    const [next, setNext] = useState("");
    const [confirm, setConfirm] = useState("");
    const [show, setShow] = useState(false);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState("");
    const [done, setDone] = useState(false);

    const tooShort = next.length > 0 && next.length < 8;
    const mismatch = confirm.length > 0 && next !== confirm;
    const canSubmit = current.length > 0 && next.length >= 8 && next === confirm && current !== next;

    async function submit() {
        setBusy(true);
        setError("");
        setDone(false);
        try {
            const r = await fetch("/api/user/password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ currentPassword: current, newPassword: next }),
            });
            const d = await r.json();
            if (!r.ok) throw new Error(d.error || "Could not change password.");
            setCurrent(""); setNext(""); setConfirm("");
            setDone(true);
        } catch (e: unknown) {
            setError(e instanceof Error ? e.message : "Could not change password.");
        } finally {
            setBusy(false);
        }
    }

    const card = "bg-white border-2 border-black p-6";
    const shadow = { boxShadow: "4px 4px 0 #000" } as const;
    const field =
        "w-full px-4 py-2.5 border-2 border-black font-medium focus:outline-none focus:shadow-[2px_2px_0_#000]";

    return (
        <div className={card} style={shadow}>
            <div className="flex items-center gap-2 border-b-2 border-black pb-3 mb-4">
                <KeyRound className="text-[#0284c7]" />
                <h2 className="text-lg font-black uppercase">Change Password · ប្តូរពាក្យសម្ងាត់</h2>
            </div>

            {error && (
                <div className="mb-4 flex items-start gap-2 p-3 bg-rose-100 border-2 border-rose-500 text-sm font-bold">
                    <AlertTriangle size={16} className="text-rose-600 shrink-0 mt-0.5" />
                    <span>{error}</span>
                </div>
            )}
            {done && (
                <div className="mb-4 flex items-start gap-2 p-3 bg-green-100 border-2 border-green-600 text-sm font-bold">
                    <Check size={16} className="text-green-700 shrink-0 mt-0.5" />
                    <span>Password updated. · បានប្តូរពាក្យសម្ងាត់រួចរាល់។</span>
                </div>
            )}

            <div className="space-y-4 max-w-sm">
                <div className="space-y-1">
                    <label className="text-xs font-black uppercase tracking-wider">
                        Current password · ពាក្យសម្ងាត់បច្ចុប្បន្ន
                    </label>
                    <input
                        type={show ? "text" : "password"}
                        value={current}
                        onChange={(e) => setCurrent(e.target.value)}
                        className={field}
                        autoComplete="current-password"
                    />
                </div>

                <div className="space-y-1">
                    <label className="text-xs font-black uppercase tracking-wider">
                        New password · ពាក្យសម្ងាត់ថ្មី
                    </label>
                    <input
                        type={show ? "text" : "password"}
                        value={next}
                        onChange={(e) => setNext(e.target.value)}
                        className={field}
                        autoComplete="new-password"
                    />
                    {tooShort && (
                        <p className="text-[11px] font-bold text-rose-600">
                            At least 8 characters · យ៉ាងតិច ៨ តួ
                        </p>
                    )}
                </div>

                <div className="space-y-1">
                    <label className="text-xs font-black uppercase tracking-wider">
                        Confirm new password · បញ្ជាក់ពាក្យសម្ងាត់ថ្មី
                    </label>
                    <input
                        type={show ? "text" : "password"}
                        value={confirm}
                        onChange={(e) => setConfirm(e.target.value)}
                        className={field}
                        autoComplete="new-password"
                    />
                    {mismatch && (
                        <p className="text-[11px] font-bold text-rose-600">
                            Passwords do not match · ពាក្យសម្ងាត់មិនត្រូវគ្នា
                        </p>
                    )}
                </div>

                <label className="flex items-center gap-2 text-xs font-bold text-zinc-600 cursor-pointer select-none">
                    <button
                        type="button"
                        onClick={() => setShow((v) => !v)}
                        className="p-1.5 border-2 border-black bg-white"
                        aria-label={show ? "Hide passwords" : "Show passwords"}
                    >
                        {show ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                    Show passwords · បង្ហាញ
                </label>

                <button
                    onClick={submit}
                    disabled={busy || !canSubmit}
                    className="inline-flex items-center gap-2 px-5 py-3 bg-[#eab308] border-2 border-black font-black text-sm uppercase disabled:opacity-60"
                    style={shadow}
                >
                    {busy ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
                    Update password · ប្តូរ
                </button>
            </div>

            <p className="mt-4 text-[11px] font-semibold text-zinc-500">
                Forgot your password? Ask your teacher or an admin to reset it. ·
                ភ្លេចពាក្យសម្ងាត់? សូមស្នើគ្រូ ឬអ្នកគ្រប់គ្រងកំណត់ឡើងវិញ។
            </p>
        </div>
    );
}
