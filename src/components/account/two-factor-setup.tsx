"use client";

import { useEffect, useState } from "react";
import QRCode from "react-qr-code";
import { ShieldCheck, ShieldOff, Loader2, Copy, Check, KeyRound, AlertTriangle, Smartphone, LifeBuoy } from "lucide-react";

type Phase = "loading" | "off" | "setup" | "enabled";

// Free TOTP authenticator apps we recommend (all work offline, scan the QR).
const AUTH_APPS = [
    "Google Authenticator",
    "Microsoft Authenticator",
    "Ente Auth",
    "Aegis (Android)",
];

export function TwoFactorSetup() {
    const [phase, setPhase] = useState<Phase>("loading");
    const [otpauthUrl, setOtpauthUrl] = useState("");
    const [secret, setSecret] = useState("");
    const [code, setCode] = useState("");
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState("");
    const [backupCodes, setBackupCodes] = useState<string[] | null>(null);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        fetch("/api/auth/2fa/status")
            .then((r) => (r.ok ? r.json() : null))
            .then((d) => setPhase(d?.enabled ? "enabled" : "off"))
            .catch(() => setPhase("off"));
    }, []);

    async function startSetup() {
        setBusy(true);
        setError("");
        try {
            const r = await fetch("/api/auth/2fa/setup", { method: "POST" });
            const d = await r.json();
            if (!r.ok) throw new Error(d.error || "Could not start setup.");
            setOtpauthUrl(d.otpauthUrl);
            setSecret(d.secret);
            setPhase("setup");
        } catch (e: any) {
            setError(e.message);
        } finally {
            setBusy(false);
        }
    }

    async function confirmEnable() {
        setBusy(true);
        setError("");
        try {
            const r = await fetch("/api/auth/2fa/enable", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ code }),
            });
            const d = await r.json();
            if (!r.ok) throw new Error(d.error || "Could not enable 2FA.");
            setBackupCodes(d.backupCodes);
            setCode("");
            setPhase("enabled");
        } catch (e: any) {
            setError(e.message);
        } finally {
            setBusy(false);
        }
    }

    async function disable() {
        setBusy(true);
        setError("");
        try {
            const r = await fetch("/api/auth/2fa/disable", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ code }),
            });
            const d = await r.json();
            if (!r.ok) throw new Error(d.error || "Could not disable 2FA.");
            setCode("");
            setBackupCodes(null);
            setPhase("off");
        } catch (e: any) {
            setError(e.message);
        } finally {
            setBusy(false);
        }
    }

    const card = "bg-white border-2 border-black p-6";
    const shadow = { boxShadow: "4px 4px 0 #000" } as const;

    if (phase === "loading") {
        return (
            <div className={card} style={shadow}>
                <Loader2 className="animate-spin text-zinc-400" />
            </div>
        );
    }

    return (
        <div className={card} style={shadow}>
            <div className="flex items-center gap-2 border-b-2 border-black pb-3 mb-4">
                <ShieldCheck className="text-[#0284c7]" />
                <h2 className="text-lg font-black uppercase">Two-Factor Authentication</h2>
                <span
                    className="ml-auto text-[10px] font-black uppercase px-2 py-0.5 border-2 border-black"
                    style={{ background: phase === "enabled" ? "#22c55e" : "#e4e4e7" }}
                >
                    {phase === "enabled" ? "On" : "Off"}
                </span>
            </div>

            {error && (
                <div className="mb-4 flex items-start gap-2 p-3 bg-rose-100 border-2 border-rose-500 text-sm font-bold">
                    <AlertTriangle size={16} className="text-rose-600 shrink-0 mt-0.5" />
                    <span>{error}</span>
                </div>
            )}

            {/* OFF — offer to enable */}
            {phase === "off" && (
                <div className="space-y-4">
                    <p className="text-sm font-semibold text-zinc-600">
                        Add a second step at login using a free authenticator app.
                        <br />
                        បន្ថែមជំហានទី ២ ពេលចូលគណនី ដោយប្រើកម្មវិធីផ្ទៀងផ្ទាត់ឥតគិតថ្លៃ។
                    </p>

                    <div className="border-2 border-black bg-zinc-50 p-3">
                        <p className="text-[11px] font-black uppercase tracking-widest text-zinc-500 mb-2">
                            Recommended apps · កម្មវិធីណែនាំ
                        </p>
                        <ul className="grid grid-cols-2 gap-1.5">
                            {AUTH_APPS.map((a) => (
                                <li key={a} className="flex items-center gap-1.5 text-xs font-bold text-zinc-700">
                                    <Smartphone size={13} className="text-zinc-500 shrink-0" /> {a}
                                </li>
                            ))}
                        </ul>
                        <p className="text-[11px] text-zinc-500 mt-2">
                            Free · works offline · you scan a QR code on the next step.
                        </p>
                    </div>

                    <button
                        onClick={startSetup}
                        disabled={busy}
                        className="inline-flex items-center gap-2 px-5 py-3 bg-[#eab308] border-2 border-black font-black text-sm uppercase disabled:opacity-60"
                        style={shadow}
                    >
                        {busy ? <Loader2 size={16} className="animate-spin" /> : <ShieldCheck size={16} />}
                        Enable 2FA · បើក
                    </button>
                </div>
            )}

            {/* SETUP — scan QR, then verify */}
            {phase === "setup" && (
                <div className="space-y-5">
                    <ol className="text-sm font-semibold text-zinc-700 list-decimal pl-5 space-y-1">
                        <li>Open your authenticator app (Google Authenticator, Ente Auth, etc.).</li>
                        <li>Scan this QR code, or enter the key manually.</li>
                        <li>Type the 6-digit code it shows to confirm.</li>
                    </ol>

                    <div className="flex flex-col sm:flex-row gap-5 items-start">
                        <div className="bg-white border-2 border-black p-3" style={shadow}>
                            {otpauthUrl && <QRCode value={otpauthUrl} size={160} />}
                        </div>
                        <div className="flex-1 space-y-2">
                            <p className="text-[11px] font-black uppercase tracking-widest text-zinc-400">Manual entry key</p>
                            <div className="flex items-center gap-2">
                                <code className="flex-1 break-all text-xs font-mono bg-zinc-100 border-2 border-black px-3 py-2">{secret}</code>
                                <button
                                    onClick={() => { navigator.clipboard.writeText(secret); setCopied(true); setTimeout(() => setCopied(false), 1500); }}
                                    className="p-2 border-2 border-black bg-white"
                                    aria-label="Copy key"
                                >
                                    {copied ? <Check size={16} className="text-green-600" /> : <Copy size={16} />}
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col gap-1.5 max-w-xs">
                        <label className="text-xs font-black uppercase tracking-wider flex items-center gap-1.5">
                            <KeyRound size={14} /> 6-digit code
                        </label>
                        <input
                            value={code}
                            onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                            inputMode="numeric"
                            placeholder="000000"
                            className="px-4 py-3 border-2 border-black text-center text-lg font-black tracking-[0.4em] font-mono focus:outline-none"
                        />
                    </div>

                    <div className="flex gap-3">
                        <button
                            onClick={confirmEnable}
                            disabled={busy || code.length !== 6}
                            className="inline-flex items-center gap-2 px-5 py-3 bg-[#22c55e] border-2 border-black font-black text-sm uppercase disabled:opacity-60"
                            style={shadow}
                        >
                            {busy ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
                            Verify & turn on
                        </button>
                        <button
                            onClick={() => { setPhase("off"); setCode(""); setError(""); }}
                            className="px-5 py-3 bg-white border-2 border-black font-black text-sm uppercase"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}

            {/* ENABLED — show backup codes once, or offer disable */}
            {phase === "enabled" && (
                <div className="space-y-5">
                    {backupCodes && (
                        <div className="space-y-2">
                            <p className="text-sm font-black text-rose-700 flex items-center gap-1.5">
                                <AlertTriangle size={15} /> Save these backup codes now — shown only once.
                            </p>
                            <p className="text-xs font-semibold text-zinc-600">
                                Each code works once if you lose access to your authenticator app.
                            </p>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                {backupCodes.map((c) => (
                                    <code key={c} className="text-xs font-mono font-bold bg-zinc-100 border-2 border-black px-2 py-1.5 text-center">{c}</code>
                                ))}
                            </div>
                            <button
                                onClick={() => { navigator.clipboard.writeText(backupCodes.join("\n")); setCopied(true); setTimeout(() => setCopied(false), 1500); }}
                                className="inline-flex items-center gap-1.5 text-xs font-black uppercase mt-1"
                            >
                                {copied ? <Check size={14} className="text-green-600" /> : <Copy size={14} />} Copy all
                            </button>
                        </div>
                    )}

                    <p className="text-sm font-semibold text-zinc-600">
                        2FA is active. You will be asked for a code each time you log in.
                    </p>

                    <div className="border-t-2 border-zinc-200 pt-4 space-y-2">
                        <p className="text-xs font-black uppercase tracking-wider text-zinc-400">Turn off 2FA</p>
                        <div className="flex flex-wrap items-end gap-3">
                            <div className="flex flex-col gap-1.5">
                                <label className="text-[11px] font-bold text-zinc-500">Enter a current code to confirm</label>
                                <input
                                    value={code}
                                    onChange={(e) => setCode(e.target.value.replace(/[^0-9a-fA-F-]/g, "").slice(0, 9))}
                                    placeholder="000000"
                                    className="px-4 py-2.5 border-2 border-black text-center font-mono font-bold focus:outline-none w-40"
                                />
                            </div>
                            <button
                                onClick={disable}
                                disabled={busy || code.length < 6}
                                className="inline-flex items-center gap-2 px-4 py-2.5 bg-rose-500 text-white border-2 border-black font-black text-sm uppercase disabled:opacity-60"
                                style={shadow}
                            >
                                {busy ? <Loader2 size={16} className="animate-spin" /> : <ShieldOff size={16} />}
                                Disable
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Lost-device help — relevant in every phase */}
            <div className="mt-5 border-t-2 border-zinc-200 pt-4">
                <div className="flex items-start gap-2">
                    <LifeBuoy size={16} className="text-[#f97316] shrink-0 mt-0.5" />
                    <div className="text-xs font-semibold text-zinc-600 space-y-1">
                        <p className="font-black text-zinc-800 uppercase tracking-wide text-[11px]">
                            Lost your phone or app? · បាត់ទូរស័ព្ទ ឬកម្មវិធី?
                        </p>
                        <p>
                            1. At login, enter one of your one-time <b>backup codes</b> instead of the app code.
                            <br />
                            <span className="text-zinc-500">
                                ពេលចូលគណនី ប្រើ<b>កូដបម្រុង</b> (backup code) មួយ ជំនួសកូដពីកម្មវិធី។
                            </span>
                        </p>
                        <p>
                            2. No backup codes left? Ask an admin to reset 2FA on your account.
                            <br />
                            <span className="text-zinc-500">
                                អស់កូដបម្រុង? ទាក់ទងអ្នកគ្រប់គ្រង (admin) ដើម្បីកំណត់ 2FA ឡើងវិញ។
                            </span>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
