"use client";

import { useState, useEffect } from "react";
import { useLang } from "@/context/lang-context";
import { Lock, Unlock, AlertTriangle, ShieldAlert, Maximize2, Minimize2 } from "lucide-react";
import { CautionTape } from "@/components/brand/brand-kit";

const ACCESS_CODE = "50777";
const SESSION_KEY = "kwd_pitch_authenticated";

export function PitchClient() {
  const { lang } = useLang();
  const kh = lang === "kh";

  const [code, setCode] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // Check session storage on mount to see if already authenticated
  useEffect(() => {
    const authStatus = sessionStorage.getItem(SESSION_KEY);
    if (authStatus === "true") {
      setIsAuthenticated(true);
    }
    setIsLoading(false);
  }, []);

  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((err) => {
        console.error("Error attempting to enable fullscreen:", err);
      });
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (code.trim() === ACCESS_CODE) {
      sessionStorage.setItem(SESSION_KEY, "true");
      setIsAuthenticated(true);
      setError("");
    } else {
      setError(
        kh
          ? "លេខកូដចូលមិនត្រឹមត្រូវទេ។ សូមព្យាយាមម្តងទៀត។"
          : "Invalid access code. Please try again."
      );
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem(SESSION_KEY);
    setIsAuthenticated(false);
    setCode("");
  };

  const t = (en: string, khmer: string) => (kh ? khmer : en);

  if (isLoading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center dot-bg">
        <div className="text-lg font-black uppercase tracking-wider animate-pulse">
          {t("Loading...", "កំពុងទាញយក...")}
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-[80vh] dot-bg flex flex-col items-center justify-center px-4 py-16">
        <div className="w-full max-w-md animate-fade-in space-y-6">
          
          {/* Header Card / Logo Section */}
          <div className="flex flex-col items-center justify-center gap-3">
            <img src="/brand/logo.png" alt="KWD Logo" className="h-16 w-auto object-contain" />
            <span className="font-google-sans text-md lg:text-lg font-black tracking-tight text-black uppercase text-center">
              {t("Kesararam With Digital", "សាលាកេសារារាម ជាមួយបច្ចេកវិទ្យា")}
            </span>
          </div>

          {/* Form Box */}
          <div className="bg-white border-[3px] border-black rounded-[15px] shadow-[6px_6px_0_#000] overflow-hidden">
            {/* Top Caution Tape Decoration */}
            <CautionTape variant="caution" height={16} />

            <div className="px-6 py-6 space-y-5">
              <div className="text-center space-y-2">
                <h1 className="text-2xl font-black uppercase tracking-tight text-black">
                  {t("Regional Pitch Event", "ការបង្ហាញគម្រោងថ្នាក់តំបន់")}
                </h1>
                <p className="text-xs font-bold text-zinc-600">
                  {t(
                    "This presentation is private. Enter access code to view.",
                    "ការបង្ហាញគម្រោងនេះជាលក្ខណៈឯកជន។ សូមបញ្ចូលលេខកូដដើម្បីមើល។"
                  )}
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="flex flex-col gap-1.5 text-left">
                  <label
                    htmlFor="accessCode"
                    className="text-xs font-black uppercase tracking-wider text-black flex items-center gap-1.5"
                  >
                    <Lock className="size-3.5 text-zinc-700" />
                    {t("5-Digit Access Code", "លេខកូដសម្ងាត់ ៥ ខ្ទង់")}
                  </label>
                  <input
                    type="text"
                    id="accessCode"
                    value={code}
                    onChange={(e) => {
                      setCode(e.target.value);
                      if (error) setError("");
                    }}
                    maxLength={10}
                    required
                    autoFocus
                    className="w-full px-4 py-3 border-2 border-black rounded-lg text-center text-xl font-black tracking-[0.4em] font-mono focus:outline-none focus:border-black focus:shadow-[3px_3px_0_#eab308] transition-all bg-zinc-50"
                    placeholder="•••••"
                  />
                </div>

                {error && (
                  <div className="p-3 bg-[#fda4af] border-2 border-[#ef4444] rounded-lg text-xs font-bold text-black shadow-[2px_2px_0_#000] flex items-start gap-2 text-left animate-shake">
                    <ShieldAlert className="size-4.5 text-[#ef4444] shrink-0 mt-0.5" />
                    <div>
                      <p className="font-black uppercase tracking-wider text-red-950">
                        {t("Access Denied", "ការចូលត្រូវបានបដិសេធ")}
                      </p>
                      <p className="text-zinc-800 leading-normal mt-0.5">{error}</p>
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full nb-btn bg-[#eab308] hover:bg-yellow-500 text-black py-3 text-xs font-black uppercase tracking-wider border-2 border-black shadow-[3px_3px_0_#000] active:translate-x-0 active:translate-y-0 active:shadow-none transition-all flex items-center justify-center gap-2"
                >
                  {t("Unlock Presentation", "បើកមើលការបង្ហាញ")}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[100] bg-zinc-950 flex flex-col w-screen h-screen select-none overflow-hidden font-system">
      {/* Premium Top Bar */}
      <div className="bg-black border-b-[3px] border-zinc-800 px-4 py-3 flex items-center justify-between text-white shrink-0">
        <div className="flex items-center gap-3">
          <img src="/brand/logo.png" alt="KWD Logo" className="h-8 w-auto object-contain" />
          <div>
            <h1 className="text-sm font-black uppercase tracking-wider text-white leading-tight">
              {t("Regional Pitch Event", "ការបង្ហាញគម្រោងថ្នាក់តំបន់")}
            </h1>
            <p className="text-[9px] font-bold text-zinc-500 hidden sm:block">
              {t("PUBLIC ACCESS · PASSWORD SECURED", "ការចូលជាសាធារណៈ · ត្រូវបានការពារដោយកូដសម្ងាត់")}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* Full Screen Toggle Button */}
          <button
            onClick={toggleFullscreen}
            className="px-3 py-1.5 text-[10px] font-black uppercase tracking-wider border-2 border-black bg-white hover:bg-zinc-100 text-black rounded-lg shadow-[2px_2px_0_#000] active:translate-x-0 active:translate-y-0 active:shadow-none transition-all flex items-center gap-1.5 cursor-pointer"
          >
            {isFullscreen ? (
              <>
                <Minimize2 className="size-3.5" />
                <span>{t("Exit", "ចាកចេញ")}</span>
              </>
            ) : (
              <>
                <Maximize2 className="size-3.5" />
                <span>{t("Full Screen", "ពេញអេក្រង់")}</span>
              </>
            )}
          </button>
          
          {/* Lock Button */}
          <button
            onClick={handleLogout}
            className="px-3 py-1.5 text-[10px] font-black uppercase tracking-wider border-2 border-black bg-[#ef4444] hover:bg-red-500 text-white rounded-lg shadow-[2px_2px_0_#000] active:translate-x-0 active:translate-y-0 active:shadow-none transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Lock className="size-3.5" />
            <span>{t("Lock", "ចាក់សោ")}</span>
          </button>
        </div>
      </div>

      {/* Caution Tape separator */}
      <CautionTape variant="caution" height={12} className="shrink-0" />

      {/* Slide Presentation Iframe */}
      <div className="flex-1 bg-zinc-900 relative w-full h-full">
        <iframe
          src="https://docs.google.com/presentation/d/e/2PACX-1vTOIdKKaMrW6BztH8vUwR3khxBSTcSPEfIBCGpimg5DlqktccfN7VQyzsbNePoDgP8Ym1bQTMMvA4Ph/pubembed?start=false&loop=false&delayms=3000"
          frameBorder="0"
          width="100%"
          height="100%"
          allowFullScreen={true}
          className="absolute inset-0 w-full h-full border-0"
        />
      </div>

      {/* Footer Info Stripe */}
      <div className="bg-black border-t-2 border-zinc-900 px-4 py-2 flex items-center justify-between text-[10px] text-zinc-500 shrink-0">
        <div className="flex items-center gap-1.5">
          <AlertTriangle className="size-3.5 text-[#f97316]" />
          <span>
            {t("Internal presentation - do not share access code publicly.", "ការបង្ហាញគម្រោងផ្ទៃក្នុងក្រុម - សូមកុំចែករំលែកលេខកូដជាសាធារណៈ។")}
          </span>
        </div>
        <span className="font-mono hidden sm:inline">
          {t("TEAM #50777", "ក្រុមការងារ #៥០៧៧៧")}
        </span>
      </div>
    </div>
  );
}
