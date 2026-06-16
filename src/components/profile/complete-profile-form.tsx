"use client";

import { useState, useEffect } from "react";
import { useLang } from "@/context/lang-context";
import { Loader2, Save, LogOut, User, Palette } from "lucide-react";
import { AvatarDisplay } from "@/components/shared/avatar-display";
import { FACES, HEADS } from "./profile-editor";

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

export function CompleteProfileForm({ mustRejoin = false }: { mustRejoin?: boolean }) {
  const { lang } = useLang();
  const kh = lang === "kh";

  const [inviteCode, setInviteCode] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [username, setUsername] = useState("");
  const [schoolName, setSchoolName] = useState("");
  const [province, setProvince] = useState("Siem Reap"); // Default to Siem Reap as requested
  const [gradeLevel, setGradeLevel] = useState("");
  const [section, setSection] = useState("");
  const [face, setFace] = useState("Smile.svg");
  const [head, setHead] = useState("Short 1.svg");
  const [isProfilePublic, setIsProfilePublic] = useState(false); // Default to Private (false)
  const [activeAvatarTab, setActiveAvatarTab] = useState<"head" | "face">("head");

  const [loading, setLoading] = useState(false);
  const [prefillLoading, setPrefillLoading] = useState(true);
  const [error, setError] = useState("");

  const [resolvedClass, setResolvedClass] = useState<{
    className: string;
    schoolName: string | null;
    province: string | null;
    gradeLevel: string | null;
    section: string | null;
  } | null>(null);
  const [lookupLoading, setLookupLoading] = useState(false);
  const [lookupError, setLookupError] = useState("");

  // Auto-resolve invite code class details
  useEffect(() => {
    const trimmed = inviteCode.trim();
    if (trimmed.length < 5) {
      setResolvedClass(null);
      setLookupError("");
      return;
    }

    const delayDebounce = setTimeout(async () => {
      setLookupLoading(true);
      setLookupError("");
      try {
        const response = await fetch(`/api/invite/lookup?code=${encodeURIComponent(trimmed)}`);
        const data = await response.json();
        if (data.error) {
          setLookupError(data.error);
          setResolvedClass(null);
        } else if (data.success && data.classInfo) {
          setResolvedClass(data.classInfo);
          setSchoolName(data.classInfo.schoolName || "");
          setProvince(data.classInfo.province || "");
          setGradeLevel(data.classInfo.gradeLevel || "");
          setSection(data.classInfo.section || "");
        }
      } catch (err) {
        console.error("Error looking up code:", err);
      } finally {
        setLookupLoading(false);
      }
    }, 500);

    return () => clearTimeout(delayDebounce);
  }, [inviteCode]);

  // Pre-fill user display name and username from their Google session
  useEffect(() => {
    const fetchCurrent = async () => {
      try {
        const response = await fetch("/api/user/settings");
        const data = await response.json();
        if (data.settings) {
          if (data.settings.displayName) {
            setDisplayName(data.settings.displayName);
          }
          if (data.settings.username) {
            setUsername(data.settings.username);
          }
          if (data.settings.avatar) {
            try {
              const parsed = JSON.parse(data.settings.avatar);
              if (parsed.face) setFace(parsed.face);
              if (parsed.head) setHead(parsed.head);
            } catch (e) {
              // ignore invalid parsing
            }
          }
        }
      } catch (err) {
        console.error("Error pre-filling display name:", err);
      } finally {
        setPrefillLoading(false);
      }
    };
    fetchCurrent();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteCode.trim()) {
      setError(kh ? "សូមបញ្ចូលលេខកូដអញ្ជើញពីគ្រូ" : "Please enter your teacher invite code.");
      return;
    }
    if (!resolvedClass) {
      setError(kh ? "សូមបញ្ចូលលេខកូដអញ្ជើញដែលត្រឹមត្រូវ ដើម្បីទាញយកព័ត៌មានថ្នាក់ និងសាលារៀន" : "Please enter a valid invitation code to resolve class details.");
      return;
    }
    const usernameClean = username.trim().toLowerCase();
    if (!usernameClean || usernameClean.length < 3 || !/^[a-z0-9_]+$/.test(usernameClean)) {
      setError(kh
        ? "ឈ្មោះគណនីត្រូវតែមានយ៉ាងហោចណាស់ ៣ តួអក្សរ និងអាចប្រើបានតែអក្សរតូច លេខ និងសញ្ញាគូសក្រោម (_) ប៉ុណ្ណោះ។"
        : "Username must be at least 3 characters long and contain only lowercase letters, numbers, and underscores (_)."
      );
      return;
    }
    if (!displayName.trim()) {
      setError(kh ? "សូមបញ្ចូលឈ្មោះបង្ហាញរបស់អ្នក" : "Please enter your display name.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/user/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          schoolName: resolvedClass.schoolName || "",
          province: resolvedClass.province || "",
          gradeLevel: resolvedClass.gradeLevel || "",
          section: resolvedClass.section || null,
          inviteCode: inviteCode.trim(),
          displayName: displayName.trim(),
          username: usernameClean,
          avatar: JSON.stringify({ face, head }),
          isProfilePublic,
        }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "Failed to save profile settings");
      }

      // Success - reload the page to release the gate and show dashboard
      window.location.reload();
    } catch (err: any) {
      console.error("Error completing profile:", err);
      setError(err.message || (kh ? "បានកើតកំហុសក្នុងការរក្សាទុកទិន្នន័យ" : "Failed to save profile details. Please try again."));
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      const { logoutAction } = await import("@/app/actions/auth");
      await logoutAction();
      window.location.href = "/login";
    } catch (err) {
      console.error("Failed to logout:", err);
    }
  };

  const avatarItems = activeAvatarTab === "face" ? FACES : HEADS;
  const selectedAvatarItem = activeAvatarTab === "face" ? face : head;
  const setAvatarItem = activeAvatarTab === "face" ? setFace : setHead;
  const avatarCategory = activeAvatarTab === "face" ? "face" : "head";

  if (prefillLoading) {
    return (
      <div className="min-h-screen dot-bg flex items-center justify-center">
        <div className="bg-white border-4 border-black p-8 shadow-[6px_6px_0_#000] flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-[#0284c7]" />
          <p className="font-black text-sm text-black">
            {kh ? "កំពុងទាញយកព័ត៌មាន..." : "Loading account details..."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen dot-bg flex items-center justify-center px-4 py-16 select-none">
      <div className="w-full max-w-4xl animate-fade-in space-y-6">

        {/* Official Header Banner */}
        <div className="bg-[#0284c7] text-white border-4 border-black p-6 shadow-[6px_6px_0_#000]" style={{ borderRadius: "0px" }}>
          <div className="flex items-center gap-4">
            <span className="material-symbols-rounded text-yellow-400 text-3xl font-black">{mustRejoin ? "group_off" : "lock_open"}</span>
            <div className="space-y-0.5">
              <h2 className="text-xl md:text-2xl font-black uppercase font-roboto">
                {mustRejoin
                  ? (kh ? "សូមចូលរួមថ្នាក់រៀនឡើងវិញ" : "Re-join a Classroom to Continue")
                  : (kh ? "បង្កើតព័ត៌មានគណនីសិស្សថ្មី" : "Complete Student Profile Setup")}
              </h2>
              <p className="text-[10px] md:text-xs text-white/80 font-black uppercase tracking-wider font-mono">
                {mustRejoin
                  ? (kh
                    ? "អ្នកមិនមានថ្នាក់រៀននៅឡើយទេ។ សូមបញ្ចូលលេខកូដពីគ្រូ ដើម្បីបន្តប្រើប្រាស់គណនី និងលេងហ្គេម។"
                    : "You are not in a class. Enter your teacher's class code to keep using your account and play.")
                  : (kh ? "សូមបំពេញព័ត៌មាន និងកំណត់រូបតំណាងខាងក្រោមមុននឹងប្រើប្រាស់ប្រព័ន្ធ" : "Please customize your character and complete details before using Kesararam")}
              </p>
            </div>
          </div>
        </div>

        {/* Content Panel Grid */}
        <div className="bg-white border-4 border-black p-6 md:p-8 shadow-[6px_6px_0_#000] grid grid-cols-1 lg:grid-cols-12 gap-8" style={{ borderRadius: "0px" }}>

          {/* Left Column: Avatar Customizer (5 cols) */}
          <div className="lg:col-span-5 flex flex-col gap-5 border-2 lg:border-r-2 lg:border-b-0 lg:border-t-0 lg:border-l-0 border-black pr-0 lg:pr-6 pb-6 lg:pb-0">
            <div className="flex items-center gap-2 border-b-2 border-black pb-2">
              <Palette className="w-5 h-5 text-[#0284c7]" />
              <h3 className="font-black text-black text-sm uppercase">
                {kh ? "១. រៀបចំរូបតំណាងរបស់អ្នក" : "1. Customize Your Avatar"}
              </h3>
            </div>

            {/* Live Character Preview */}
            <div className="flex flex-col items-center justify-center p-6 bg-zinc-50 border-2 border-black shadow-[3px_3px_0_#000] relative">
              <AvatarDisplay
                avatar={JSON.stringify({ face, head })}
                name={displayName || "KWD Student"}
                size={140}
                radius={0}
              />
              <div className="mt-4 bg-[#eab308] border-2 border-black px-4 py-1 text-xs font-black uppercase tracking-wide">
                {kh ? "រូបតំណាងរបស់អ្នក" : "Your Avatar Character"}
              </div>
            </div>

            {/* Tabs for Hair/Head vs Face Expression */}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setActiveAvatarTab("head")}
                className={`flex-1 py-2 font-black text-[11px] uppercase border-2 border-black transition-all ${activeAvatarTab === "head" ? "bg-yellow-400" : "bg-white hover:bg-gray-50"
                  }`}
                style={{ borderRadius: "0" }}
              >
                {kh ? "សក់ / ក្បាល" : "Hair / Head"}
              </button>
              <button
                type="button"
                onClick={() => setActiveAvatarTab("face")}
                className={`flex-1 py-2 font-black text-[11px] uppercase border-2 border-black transition-all ${activeAvatarTab === "face" ? "bg-yellow-400" : "bg-white hover:bg-gray-50"
                  }`}
                style={{ borderRadius: "0" }}
              >
                {kh ? "ទឹកមុខ" : "Face Expression"}
              </button>
            </div>

            {/* Custom Asset Grid */}
            <div className="border-2 border-black bg-zinc-50 p-2 overflow-y-auto max-h-[190px]">
              <div className="grid grid-cols-4 gap-2">
                {/* None Option */}
                <button
                  type="button"
                  onClick={() => setAvatarItem("")}
                  className={`w-full aspect-square border-2 font-black text-[9px] uppercase transition-all flex items-center justify-center ${selectedAvatarItem === "" ? "border-[#eab308] bg-yellow-100/50" : "border-zinc-200 bg-white"
                    }`}
                  style={{ borderRadius: "0" }}
                >
                  {kh ? "គ្មាន" : "None"}
                </button>

                {avatarItems.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setAvatarItem(item)}
                    className={`w-full aspect-square p-1 border-2 transition-all flex items-center justify-center bg-white ${selectedAvatarItem === item ? "border-[#eab308] bg-yellow-50" : "border-zinc-200 hover:border-black"
                      }`}
                    style={{ borderRadius: "0" }}
                  >
                    <img
                      src={`/avatar/${avatarCategory}/${encodeURIComponent(item)}`}
                      alt={item.replace(".svg", "")}
                      className="w-full h-full object-contain"
                    />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Onboarding Fields Form (7 cols) */}
          <div className="lg:col-span-7">
            <form onSubmit={handleSubmit} className="space-y-5" autoComplete="off">

              <div className="flex items-center gap-2 border-b-2 border-black pb-2">
                <User className="w-5 h-5 text-[#0284c7]" />
                <h3 className="font-black text-black text-sm uppercase">
                  {kh ? "២. បំពេញព័ត៌មានផ្ទាល់ខ្លួន" : "2. Complete Profile Details"}
                </h3>
              </div>

              {/* Error Banner */}
              {error && (
                <div className="p-3 bg-rose-100 border-2 border-rose-500 font-bold text-sm text-black shadow-[3px_3px_0_#000]" style={{ borderRadius: "0px" }}>
                  {error}
                </div>
              )}

              {/* Teacher Invite Code */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="inviteCode" className="text-sm font-black text-black">
                  {kh ? "លេខកូដអញ្ជើញពីគ្រូ *" : "Teacher Invite Code *"}
                </label>
                <input
                  type="text"
                  id="inviteCode"
                  value={inviteCode}
                  onChange={(e) => setInviteCode(e.target.value)}
                  required
                  placeholder="KWD-XXXX-YYYY"
                  className="w-full px-4 py-2.5 border-2 border-black text-sm font-black focus:outline-none focus:shadow-[2px_2px_0_#0284c7] placeholder:text-zinc-300"
                  style={{ borderRadius: "0px" }}
                />

                {lookupLoading && (
                  <div className="text-xs font-bold text-zinc-500 flex items-center gap-1.5 animate-pulse mt-1">
                    <Loader2 size={12} className="animate-spin text-[#0284c7]" />
                    <span>{kh ? "កំពុងស្វែងរកព័ត៌មានថ្នាក់..." : "Verifying invitation code..."}</span>
                  </div>
                )}

                {lookupError && (
                  <div className="text-xs font-bold text-red-500 flex items-center gap-1 mt-1">
                    <span className="material-symbols-rounded text-sm font-black">cancel</span>
                    <span>{lookupError}</span>
                  </div>
                )}

                <p className="text-[10px] text-zinc-400 font-bold leading-normal">
                  {kh
                    ? "* សូមបញ្ចូលលេខកូដអញ្ជើញដែលទទួលបានពីគ្រូបង្រៀនរបស់អ្នកដើម្បីចុះឈ្មោះចូលរៀន។"
                    : "* Please enter the invitation code provided by your teacher."}
                </p>
              </div>

              {/* Inherited Class & School Details */}
              <div className="flex flex-col gap-1.5 pt-1">
                <label className="text-sm font-black text-black">
                  {kh ? "ព័ត៌មានថ្នាក់ និងសាលារៀន (ស្វ័យប្រវត្ត)" : "Class & School Details (Auto-filled)"}
                </label>

                {resolvedClass ? (
                  <div className="border-2 border-black bg-green-50 p-4 space-y-3 shadow-[3px_3px_0_#000]">
                    <div className="flex items-center gap-2 border-b border-green-200/50 pb-1.5 text-xs font-black text-green-800 uppercase">
                      <span className="material-symbols-rounded text-base font-black text-green-700">check_circle</span>
                      <span>Class Found / ថ្នាក់រៀនត្រូវបានរកឃើញ</span>
                    </div>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-2.5 text-xs font-bold text-zinc-800">
                      <div>
                        <span className="text-zinc-400 block uppercase text-[9px] tracking-wider">Class / ថ្នាក់រៀន</span>
                        <span className="font-black text-black text-sm">{resolvedClass.className}</span>
                      </div>
                      <div>
                        <span className="text-zinc-400 block uppercase text-[9px] tracking-wider">School / សាលារៀន</span>
                        <span className="text-black text-sm">{resolvedClass.schoolName || "—"}</span>
                      </div>
                      <div>
                        <span className="text-zinc-400 block uppercase text-[9px] tracking-wider">Province / ខេត្ត-ក្រុង</span>
                        <span className="text-black text-sm">{resolvedClass.province || "—"}</span>
                      </div>
                      <div>
                        <span className="text-zinc-400 block uppercase text-[9px] tracking-wider">Grade / ថ្នាក់ទី</span>
                        <span className="text-black text-sm">{resolvedClass.gradeLevel || "—"}</span>
                      </div>
                      {resolvedClass.section && (
                        <div className="col-span-2 border-t border-green-200/30 pt-2">
                          <span className="text-zinc-400 block uppercase text-[9px] tracking-wider">Section / វេនសិក្សា</span>
                          <span className="text-black text-sm">{resolvedClass.section}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="border-2 border-black border-dashed p-6 text-center bg-zinc-50 text-zinc-400 font-bold text-xs space-y-2">
                    <span className="material-symbols-rounded text-2xl font-black text-zinc-300 block">school</span>
                    <p>
                      {kh
                        ? "សូមបញ្ចូលលេខកូដអញ្ជើញពីគ្រូ ដើម្បីទាញយកព័ត៌មានថ្នាក់ និងសាលារៀនដោយស្វ័យប្រវត្តិ។"
                        : "Enter your Teacher Invite Code to automatically load your class and school details."}
                    </p>
                  </div>
                )}
              </div>

              {/* Username (Editable) */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="username" className="text-sm font-black text-black">
                  {kh ? "ឈ្មោះគណនី *" : "Username *"}
                </label>
                <div className="relative flex items-center">
                  <span className="absolute left-4 text-sm font-black text-zinc-400 font-mono">@</span>
                  <input
                    type="text"
                    id="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""))}
                    required
                    minLength={3}
                    maxLength={30}
                    placeholder="username"
                    className="w-full pl-8 pr-4 py-2.5 border-2 border-black text-sm font-black focus:outline-none focus:shadow-[2px_2px_0_#0284c7] font-mono"
                    style={{ borderRadius: "0px" }}
                  />
                </div>
                <p className="text-[10px] text-zinc-400 font-bold leading-normal">
                  {kh
                    ? "* ឈ្មោះគណនីផ្ទាល់ខ្លួនរបស់អ្នកសម្រាប់ការស្វែងរក។ អាចប្រើប្រាស់បានតែ អក្សរតូច លេខ និង សញ្ញាគូសក្រោម (_) ប៉ុណ្ណោះ។"
                    : "* Your customized account username for lookup. Only lowercase letters, numbers, and underscores (_) are allowed."}
                </p>
              </div>

              {/* Display Name */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="displayName" className="text-sm font-black text-black">
                  {kh ? "ឈ្មោះបង្ហាញលើប្រព័ន្ធ *" : "Display Name *"}
                </label>
                <input
                  type="text"
                  id="displayName"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  required
                  maxLength={40}
                  placeholder={kh ? "ឧ. សុខ ម៉ារ៉ា" : "e.g. Sok Mara"}
                  className="w-full px-4 py-2.5 border-2 border-black text-sm font-black focus:outline-none focus:shadow-[2px_2px_0_#0284c7] placeholder:text-zinc-300"
                  style={{ borderRadius: "0px" }}
                />
                <p className="text-[10px] text-zinc-400 font-bold leading-normal">
                  {kh
                    ? "* ឈ្មោះនេះនឹងបង្ហាញលើតារាងពិន្ទុឆ្នើម និងគណនីរបស់អ្នក។"
                    : "* This name will represent you on the leaderboards and your profile."}
                </p>
              </div>



              {/* Actions Panel */}
              <div className="flex flex-col sm:flex-row gap-3 pt-3">
                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex items-center justify-center gap-2 px-5 py-3 border-2 border-black bg-zinc-100 font-black text-sm hover:bg-zinc-200 active:translate-x-0.5 active:translate-y-0.5 transition-all text-zinc-800"
                  style={{ borderRadius: "0px" }}
                >
                  <LogOut size={16} />
                  {kh ? "ចាកចេញ" : "Logout"}
                </button>

                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3 border-2 border-black bg-green-400 font-black text-sm hover:bg-green-300 shadow-[3px_3px_0_#000] hover:shadow-[4px_4px_0_#000] active:shadow-none hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0 active:translate-y-0 transition-all text-black"
                  style={{ borderRadius: "0px" }}
                >
                  {loading ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      {kh ? "កំពុងរក្សាទុក..." : "Saving..."}
                    </>
                  ) : (
                    <>
                      <Save size={16} />
                      {kh ? "រក្សាទុកព័ត៌មានគណនី" : "Complete Profile Setup"}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
