"use client";

import { useState, useEffect, useRef } from "react";
import { 
  User, 
  Bell, 
  Globe, 
  Shield, 
  Palette,
  Volume2,
  Save,
  Loader2,
  Trophy,
  Zap,
  Target,
  Clock,
  Lock,
  Info,
  ShieldCheck
} from "lucide-react";
import { AvatarDisplay } from "@/components/shared/avatar-display";
import { FACES, HEADS } from "../profile/profile-editor";
import { TwoFactorSetup } from "@/components/account/two-factor-setup";
import { ChangePassword } from "@/components/account/change-password";

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

interface UserSettings {
  displayName: string;
  username: string;
  email: string;
  role?: string;
  avatar: string;
  audioMuted: boolean;
  language: string;
  theme: string;
  schoolName?: string;
  province?: string;
  gradeLevel?: string;
  section?: string;
  isProfilePublic?: boolean;
  isNamePublic?: boolean;
  isUsernamePublic?: boolean;
  isSchoolPublic?: boolean;
  isProvincePublic?: boolean;
  isGradePublic?: boolean;
  isSectionPublic?: boolean;
  isStatsPublic?: boolean;
  createdAt?: string; // Account creation timestamp
  canChangeNameOnce?: boolean; // one-time full-name + username change available
  notifications: {
    email: boolean;
    push: boolean;
    contentApproved: boolean;
    contentRejected: boolean;
    newAssignments: boolean;
  };
}

interface GameStats {
  highestScore: number;
  totalGamesPlayed: number;
  lifetimePoints: number;
  currentStreak: number;
  longestStreak: number;
  currentRank: number | null;
  recentGames: {
    id: number;
    gameMode: string;
    score: number;
    correctAnswers: number;
    totalQuestions: number;
    createdAt: string;
  }[];
}

export function SettingsContent() {
  const [settings, setSettings] = useState<UserSettings>({
    displayName: "",
    username: "",
    email: "",
    role: "student",
    avatar: "",
    audioMuted: false,
    language: "en",
    theme: "light",
    schoolName: "",
    province: "",
    gradeLevel: "",
    section: "",
    isProfilePublic: true,
    isNamePublic: true,
    isUsernamePublic: true,
    isSchoolPublic: true,
    isProvincePublic: true,
    isGradePublic: true,
    isSectionPublic: true,
    isStatsPublic: true,
    createdAt: "",
    notifications: {
      email: true,
      push: true,
      contentApproved: true,
      contentRejected: true,
      newAssignments: true,
    },
  });
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");
  const [gameStats, setGameStats] = useState<GameStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(false);

  // 60-day cooldown timer state
  const [daysLeft, setDaysLeft] = useState(0);
  // Identity values as loaded, to detect a name/username change on save.
  const initialIdentity = useRef({ displayName: "", username: "" });
  const [activeAvatarTab, setActiveAvatarTab] = useState<"head" | "face">("head");

  useEffect(() => {
    fetchSettings();
  }, []);

  useEffect(() => {
    if (activeTab === "stats" && !gameStats) {
      fetchGameStats();
    }
  }, [activeTab]);

  // Handle cooldown ticking
  useEffect(() => {
    if (!settings.createdAt) return;

    const checkCooldown = () => {
      // A one-time name/username change is allowed even within the 60-day window.
      if (settings.canChangeNameOnce) { setDaysLeft(0); return; }
      const ageMs = Date.now() - new Date(settings.createdAt!).getTime();
      const SIXTY_DAYS = 60 * 24 * 60 * 60 * 1000;
      if (ageMs < SIXTY_DAYS) {
        setDaysLeft(Math.ceil((SIXTY_DAYS - ageMs) / (24 * 60 * 60 * 1000)));
      } else {
        setDaysLeft(0);
      }
    };

    checkCooldown();
    // Hourly check is perfectly fine for day calculations
    const interval = setInterval(checkCooldown, 3600000);
    return () => clearInterval(interval);
  }, [settings.createdAt, settings.canChangeNameOnce]);

  const fetchSettings = async () => {
    try {
      const response = await fetch("/api/user/settings");
      const data = await response.json();
      if (data.settings) {
        setSettings(data.settings);
        initialIdentity.current = {
          displayName: data.settings.displayName || "",
          username: data.settings.username || "",
        };
      }
    } catch (error) {
      console.error("Error fetching settings:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchGameStats = async () => {
    setStatsLoading(true);
    try {
      const response = await fetch("/api/user/stats");
      const data = await response.json();
      if (data.stats) {
        setGameStats(data.stats);
      }
    } catch (error) {
      console.error("Error fetching game stats:", error);
    } finally {
      setStatsLoading(false);
    }
  };

  const handleSave = async () => {
    if (daysLeft > 0) {
      alert(`Please wait another ${daysLeft} days before saving changes. For any trouble, contact support team at kesararamwithdigital@gmail.com. / សូមរង់ចាំ ${daysLeft} ថ្ងៃទៀត មុនពេលរក្សាទុកការផ្លាស់ប្តូរ។ បើមានបញ្ហាសូមទាក់ទងក្រុមការងារគាំទ្រតាមរយៈ kesararamwithdigital@gmail.com ។`);
      return;
    }

    // One-time-change warning. If the user is changing their full name and/or
    // username while they still hold the one-time allowance, confirm first —
    // after this save the normal cooldowns resume (name: 60 days, username: 1 year).
    const nameChanged = (settings.displayName || "") !== initialIdentity.current.displayName;
    const usernameChanged = (settings.username || "") !== initialIdentity.current.username;
    if (settings.canChangeNameOnce && (nameChanged || usernameChanged)) {
      const ok = confirm(
        "This is your ONE-TIME change for your full name and username.\n" +
        "After you save, you will NOT be able to change them again for a while " +
        "(name: 60 days, username: 1 year). Continue?\n\n" +
        "នេះជាការផ្លាស់ប្តូរតែម្តងគត់ សម្រាប់ឈ្មោះពេញ និងឈ្មោះគណនីរបស់អ្នក។\n" +
        "បន្ទាប់ពីរក្សាទុក អ្នកនឹងមិនអាចផ្លាស់ប្តូរវាម្តងទៀតបានទេ ក្នុងរយៈពេលមួយ " +
        "(ឈ្មោះ៖ ៦០ ថ្ងៃ, ឈ្មោះគណនី៖ ១ ឆ្នាំ)។ តើបន្តដែរឬទេ?"
      );
      if (!ok) return;
    }

    setSaving(true);
    try {
      const response = await fetch("/api/user/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });

      const data = await response.json();
      if (response.ok) {
        alert("Settings saved successfully! / រក្សាទុកព័ត៌មានគណនីដោយជោគជ័យ!");
        // Refresh values
        if (data.user) {
          const consumed = settings.canChangeNameOnce && (nameChanged || usernameChanged);
          setSettings(prev => ({
            ...prev,
            ...data.user,
            // The one-time allowance is consumed server-side on a name/username change.
            canChangeNameOnce: consumed ? false : prev.canChangeNameOnce,
          }));
          initialIdentity.current = {
            displayName: data.user.displayName || "",
            username: data.user.username || "",
          };
        }
      } else {
        alert(data.error || "Failed to save settings");
      }
    } catch (error: any) {
      console.error("Error saving settings:", error);
      alert(error.message || "Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  // Student specific Face & Head parse helpers
  const parsedAvatar = (() => {
    try {
      return settings.avatar
        ? (JSON.parse(settings.avatar) as { face?: string; head?: string })
        : {};
    } catch {
      return {};
    }
  })();

  const studentFace = parsedAvatar.face ?? "Smile.svg";
  const studentHead = parsedAvatar.head ?? "Short 1.svg";

  const handleStudentAvatarChange = (key: "face" | "head", val: string) => {
    const newAvatar = {
      ...parsedAvatar,
      [key]: val
    };
    setSettings(prev => ({
      ...prev,
      avatar: JSON.stringify(newAvatar)
    }));
  };

  const handleSchoolNameBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (!val) return;
    const cleaned = val.replace(/[^a-zA-Z0-9\s.,'()&-]/g, "");
    const formatted = cleaned
      .split(/\s+/)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
    setSettings(prev => ({
      ...prev,
      schoolName: formatted
    }));
  };

  // Check if student has completed onboarding (making school fields locked)
  const isStudentAndOnboarded = settings.role === "student" && !!settings.schoolName;

  const tabs = [
    { id: "profile", label: "Profile", icon: User },
    ...(settings.role === "student" ? [{ id: "stats", label: "Game Stats", icon: Trophy }] : []),
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "preferences", label: "Preferences", icon: Palette },
    { id: "privacy", label: "Privacy", icon: Shield },
    { id: "security", label: "Security", icon: Lock },
  ];

  const avatarItems = activeAvatarTab === "face" ? FACES : HEADS;
  const selectedAvatarItem = activeAvatarTab === "face" ? studentFace : studentHead;
  const avatarCategory = activeAvatarTab === "face" ? "face" : "head";

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6 select-none">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black text-black mb-2">Settings</h1>
        <p className="text-zinc-600">Manage your account settings and preferences</p>
      </div>

      {/* 60-Day Cooldown Warning Banner */}
      {daysLeft > 0 && (
        <div className="bg-yellow-50 border-4 border-[#eab308] p-4 shadow-[4px_4px_0_#000] flex items-center gap-3 animate-pulse">
          <Lock className="text-[#eab308] flex-shrink-0" size={24} />
          <div className="font-bold text-sm text-black leading-relaxed">
            For security, you must wait <span className="text-orange-600 font-black">{daysLeft} days</span> after signing up before you can modify your profile settings or email. For any trouble, contact support team at <a href="mailto:kesararamwithdigital@gmail.com" className="underline font-black hover:text-blue-700 font-mono">kesararamwithdigital@gmail.com</a>. / ដើម្បីសុវត្ថិភាព អ្នកត្រូវរង់ចាំយ៉ាងហោចណាស់ <span className="text-orange-600 font-black">{daysLeft} ថ្ងៃ</span> បន្ទាប់ពីចុះឈ្មោះ មុននឹងកែប្រែព័ត៌មានគណនី ឬអ៊ីមែល។ បើមានបញ្ហាសូមទាក់ទងក្រុមការងារគាំទ្រ <a href="mailto:kesararamwithdigital@gmail.com" className="underline font-black hover:text-blue-700 font-mono">kesararamwithdigital@gmail.com</a> ៕
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 border-b-2 border-black overflow-x-auto pb-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 font-bold text-sm border-2 border-black transition-all ${
                activeTab === tab.id
                  ? "bg-yellow-400 -mb-0.5"
                  : "bg-white hover:bg-gray-100"
              }`}
              style={{ borderRadius: "0" }}
            >
              <Icon size={16} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Content */}
      <div
        className="bg-white border-2 border-black p-6"
        style={{ boxShadow: "4px 4px 0 #000", borderRadius: "0" }}
      >
        {/* Profile Tab */}
        {activeTab === "profile" && (
          <div className="space-y-6">
            <h2 className="text-xl font-black text-black border-b-2 border-black pb-2">Profile Information</h2>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              
              {/* Left Side: Inputs Form (7 Cols) */}
              <div className="lg:col-span-7 space-y-5">
                
                {/* Display Name */}
                <div>
                  <label className="block text-sm font-bold text-black mb-2">
                    Display Name
                  </label>
                  <input
                    type="text"
                    value={settings.displayName}
                    onChange={(e) =>
                      setSettings({ ...settings, displayName: e.target.value })
                    }
                    className="w-full p-3 border-2 border-black font-medium focus:outline-none focus:shadow-[2px_2px_0_#000]"
                    placeholder="Your display name"
                    style={{ borderRadius: "0" }}
                  />
                </div>

                {/* Username (Editable, subject to 1-year cooldown limit) */}
                <div>
                  <label className="block text-sm font-bold text-black mb-2">
                    Username / ឈ្មោះគណនី
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-3 text-zinc-400 font-mono font-bold">@</span>
                    <input
                      type="text"
                      value={settings.username || ""}
                      onChange={(e) =>
                        setSettings({ ...settings, username: e.target.value })
                      }
                      className="w-full p-3 pl-7 border-2 border-black font-medium focus:outline-none focus:shadow-[2px_2px_0_#000] font-mono"
                      placeholder="username"
                      style={{ borderRadius: "0" }}
                    />
                  </div>
                  <p className="text-xs text-zinc-500 mt-1">
                    * System username. You can change this only once every 1 year. / ឈ្មោះគណនីក្នុងប្រព័ន្ធ។ អ្នកអាចផ្លាស់ប្តូរវាបានតែម្តងគត់ក្នុងរយៈពេល ១ ឆ្នាំ។
                  </p>
                </div>

                {/* Email Address (Fully Editable!) */}
                <div>
                  <label className="block text-sm font-bold text-black mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={settings.email}
                    onChange={(e) =>
                      setSettings({ ...settings, email: e.target.value })
                    }
                    className="w-full p-3 border-2 border-black font-medium focus:outline-none focus:shadow-[2px_2px_0_#000]"
                    placeholder="Your email address"
                    style={{ borderRadius: "0" }}
                  />
                  <p className="text-xs text-zinc-500 mt-1">
                    * You can update your email address. It must be unique and valid.
                  </p>
                </div>

                {/* Admin/Teacher Avatar URL (Hidden for Students) */}
                {settings.role !== "student" && (
                  <div>
                    <label className="block text-sm font-bold text-black mb-2">
                      Avatar URL
                    </label>
                    <input
                      type="url"
                      value={settings.avatar}
                      onChange={(e) =>
                        setSettings({ ...settings, avatar: e.target.value })
                      }
                      className="w-full p-3 border-2 border-black font-medium focus:outline-none focus:shadow-[2px_2px_0_#000]"
                      placeholder="https://example.com/avatar.jpg"
                      style={{ borderRadius: "0" }}
                    />
                  </div>
                )}

                {/* Locked Fields Advisory Notice */}
                {isStudentAndOnboarded && (
                  <div className="bg-blue-50 border-2 border-[#0284c7] p-3 text-xs text-black font-bold flex items-center gap-2">
                    <Info className="text-[#0284c7] flex-shrink-0" size={16} />
                    <span>
                      School and Grade information is locked. Contact Support Staff to make changes. / ព័ត៌មានសាលារៀន និងកម្រិតថ្នាក់ត្រូវបានចាក់សោ។ សូមទាក់ទងក្រុមការងារគាំទ្រដើម្បីកែប្រែ។
                    </span>
                  </div>
                )}

                {/* School Name */}
                <div>
                  <label className="block text-sm font-bold text-black mb-2">
                    School Name / ឈ្មោះសាលារៀន
                  </label>
                  <input
                    type="text"
                    value={settings.schoolName || ""}
                    disabled={isStudentAndOnboarded}
                    onChange={(e) =>
                      setSettings({ ...settings, schoolName: e.target.value })
                    }
                    onBlur={handleSchoolNameBlur}
                    className={`w-full p-3 border-2 border-black font-medium focus:outline-none focus:shadow-[2px_2px_0_#000] ${
                      isStudentAndOnboarded ? "bg-zinc-50 cursor-not-allowed text-zinc-400" : ""
                    }`}
                    placeholder="e.g. Kesararam With Digital"
                    style={{ borderRadius: "0" }}
                  />
                  <span className="text-[10px] text-zinc-400 font-bold leading-normal block mt-1">
                    * Please write in English, starting each word with a capital letter (e.g., Kesararam Primary School) / សូមសរសេរជាភាសាអង់គ្លេស និងចាប់ផ្តើមពាក្យនីមួយៗដោយអក្សរធំ (ឧ. Kesararam Primary School)
                  </span>
                </div>

                {/* Province */}
                <div>
                  <label className="block text-sm font-bold text-black mb-2">
                    Province / ខេត្ត-ក្រុង
                  </label>
                  <select
                    value={settings.province || ""}
                    disabled={isStudentAndOnboarded}
                    onChange={(e) =>
                      setSettings({ ...settings, province: e.target.value })
                    }
                    className={`w-full p-3 border-2 border-black font-bold bg-white focus:outline-none focus:shadow-[2px_2px_0_#000] ${
                      isStudentAndOnboarded ? "bg-zinc-50 cursor-not-allowed text-zinc-400" : ""
                    }`}
                    style={{ borderRadius: "0" }}
                  >
                    <option value="" disabled>Select Province / ជ្រើសរើសខេត្ត</option>
                    {CAMBODIA_PROVINCES.map((prov) => (
                      <option key={prov.en} value={prov.en}>
                        {prov.en} / {prov.kh}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Grade Level (Student only) */}
                {settings.role === "student" && (
                  <div>
                    <label className="block text-sm font-bold text-black mb-2">
                      Grade Level / ថ្នាក់ទី
                    </label>
                    <select
                      value={settings.gradeLevel || ""}
                      disabled={isStudentAndOnboarded}
                      onChange={(e) =>
                        setSettings({ ...settings, gradeLevel: e.target.value })
                      }
                      className={`w-full p-3 border-2 border-black font-bold bg-white focus:outline-none focus:shadow-[2px_2px_0_#000] ${
                        isStudentAndOnboarded ? "bg-zinc-50 cursor-not-allowed text-zinc-400" : ""
                      }`}
                      style={{ borderRadius: "0" }}
                    >
                      <option value="" disabled>Select Grade / ជ្រើសរើសថ្នាក់</option>
                      {GRADES.map((gr) => (
                        <option key={gr.en} value={gr.en}>
                          {gr.en} / {gr.kh}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Section (Student only) */}
                {settings.role === "student" && (
                  <div>
                    <label className="block text-sm font-bold text-black mb-2">
                      Section / វេន
                    </label>
                    <input
                      type="text"
                      value={settings.section || ""}
                      disabled={isStudentAndOnboarded}
                      onChange={(e) =>
                        setSettings({ ...settings, section: e.target.value })
                      }
                      className={`w-full p-3 border-2 border-black font-medium focus:outline-none focus:shadow-[2px_2px_0_#000] ${
                        isStudentAndOnboarded ? "bg-zinc-50 cursor-not-allowed text-zinc-400" : ""
                      }`}
                      placeholder="e.g. Morning A / ព្រឹក A"
                      style={{ borderRadius: "0" }}
                    />
                  </div>
                )}
              </div>

              {/* Right Side: Interactive Character Builder (5 Cols - Student Only) */}
              {settings.role === "student" && (
                <div className="lg:col-span-5 flex flex-col gap-4 border-2 border-black p-4 bg-zinc-50 shadow-[3px_3px_0_#000]">
                  <div className="flex items-center gap-2 border-b border-zinc-200 pb-2">
                    <Palette className="w-5 h-5 text-[#0284c7]" />
                    <h3 className="font-black text-black text-sm uppercase">Avatar Customizer</h3>
                  </div>

                  <div className="flex flex-col items-center justify-center p-4 bg-white border-2 border-black shadow-[2px_2px_0_#000]">
                    <AvatarDisplay
                      avatar={settings.avatar}
                      name={settings.displayName || "KWD Student"}
                      size={120}
                      radius={0}
                    />
                  </div>

                  {/* Tabs */}
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setActiveAvatarTab("head")}
                      className={`flex-1 py-1.5 font-black text-[10px] uppercase border-2 border-black transition-all ${
                        activeAvatarTab === "head" ? "bg-yellow-400" : "bg-white hover:bg-gray-50"
                      }`}
                      style={{ borderRadius: "0" }}
                    >
                      Hair / Head
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveAvatarTab("face")}
                      className={`flex-1 py-1.5 font-black text-[10px] uppercase border-2 border-black transition-all ${
                        activeAvatarTab === "face" ? "bg-yellow-400" : "bg-white hover:bg-gray-50"
                      }`}
                      style={{ borderRadius: "0" }}
                    >
                      Face Expression
                    </button>
                  </div>

                  {/* Asset Selector */}
                  <div className="border-2 border-black bg-white p-2 overflow-y-auto max-h-[160px]">
                    <div className="grid grid-cols-4 gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleStudentAvatarChange(avatarCategory, "")}
                        className={`w-full aspect-square border-2 font-black text-[8px] uppercase transition-all flex items-center justify-center ${
                          selectedAvatarItem === "" ? "border-[#eab308] bg-yellow-100/50" : "border-zinc-200 bg-white"
                        }`}
                        style={{ borderRadius: "0" }}
                      >
                        None
                      </button>

                      {avatarItems.map((item) => (
                        <button
                          key={item}
                          type="button"
                          onClick={() => handleStudentAvatarChange(avatarCategory, item)}
                          className={`w-full aspect-square p-1 border-2 transition-all flex items-center justify-center bg-white ${
                            selectedAvatarItem === item ? "border-[#eab308] bg-yellow-50" : "border-zinc-200 hover:border-black"
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
              )}
            </div>
          </div>
        )}

        {/* Game Stats Tab */}
        {activeTab === "stats" && (
          <div className="space-y-6">
            <h2 className="text-xl font-black text-black border-b-2 border-black pb-2">Game Statistics</h2>

            {statsLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
              </div>
            ) : gameStats ? (
              <>
                {/* Key Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="border-2 border-black p-4 bg-yellow-50" style={{ boxShadow: "3px 3px 0 #000", borderRadius: "0" }}>
                    <div className="flex items-center gap-2 mb-2">
                      <Trophy className="text-yellow-600" size={20} />
                      <span className="text-xs font-black uppercase text-zinc-500">Highest Score</span>
                    </div>
                    <div className="text-3xl font-black text-black tabular-nums">
                      {gameStats.highestScore.toLocaleString()}
                    </div>
                  </div>

                  <div className="border-2 border-black p-4 bg-blue-50" style={{ boxShadow: "3px 3px 0 #000", borderRadius: "0" }}>
                    <div className="flex items-center gap-2 mb-2">
                      <Zap className="text-blue-600" size={20} />
                      <span className="text-xs font-black uppercase text-zinc-500">Lifetime Points</span>
                    </div>
                    <div className="text-3xl font-black text-black tabular-nums">
                      {gameStats.lifetimePoints.toLocaleString()}
                    </div>
                  </div>

                  <div className="border-2 border-black p-4 bg-green-50" style={{ boxShadow: "3px 3px 0 #000", borderRadius: "0" }}>
                    <div className="flex items-center gap-2 mb-2">
                      <Target className="text-green-600" size={20} />
                      <span className="text-xs font-black uppercase text-zinc-500">Games Played</span>
                    </div>
                    <div className="text-3xl font-black text-black tabular-nums">
                      {gameStats.totalGamesPlayed}
                    </div>
                  </div>

                  <div className="border-2 border-black p-4 bg-purple-50" style={{ boxShadow: "3px 3px 0 #000", borderRadius: "0" }}>
                    <div className="flex items-center gap-2 mb-2">
                      <Trophy className="text-purple-600" size={20} />
                      <span className="text-xs font-black uppercase text-zinc-500">Current Rank</span>
                    </div>
                    <div className="text-3xl font-black text-black tabular-nums">
                      {gameStats.currentRank ? `#${gameStats.currentRank}` : "—"}
                    </div>
                  </div>
                </div>

                {/* Streaks */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="border-2 border-black p-4" style={{ borderRadius: "0" }}>
                    <div className="text-xs font-black uppercase text-zinc-500 mb-2">Current Streak</div>
                    <div className="text-2xl font-black text-orange-600 tabular-nums">
                      {gameStats.currentStreak} {gameStats.currentStreak === 1 ? "day" : "days"}
                    </div>
                  </div>

                  <div className="border-2 border-black p-4" style={{ borderRadius: "0" }}>
                    <div className="text-xs font-black uppercase text-zinc-500 mb-2">Longest Streak</div>
                    <div className="text-2xl font-black text-purple-600 tabular-nums">
                      {gameStats.longestStreak} {gameStats.longestStreak === 1 ? "day" : "days"}
                    </div>
                  </div>
                </div>

                {/* Recent Games */}
                <div>
                  <h3 className="text-lg font-black text-black mb-3">Recent Games</h3>
                  <div className="space-y-2">
                    {gameStats.recentGames.length > 0 ? (
                      gameStats.recentGames.map((game) => (
                        <div
                          key={game.id}
                          className="flex items-center justify-between p-3 border-2 border-black bg-white"
                          style={{ borderRadius: "0" }}
                        >
                          <div className="flex items-center gap-3">
                            <Clock size={16} className="text-zinc-400" />
                            <div>
                              <div className="font-bold text-sm text-black">
                                {game.gameMode.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                              </div>
                              <div className="text-xs text-zinc-500">
                                {new Date(game.createdAt).toLocaleDateString()} at{" "}
                                {new Date(game.createdAt).toLocaleTimeString()}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-black text-lg text-black tabular-nums">
                              {game.score.toLocaleString()}
                            </div>
                            <div className="text-xs text-zinc-500">
                              {game.correctAnswers}/{game.totalQuestions} correct
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8 text-zinc-500">
                        No games played yet. Start playing to see your history!
                      </div>
                    )}
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-12 text-zinc-500">
                Failed to load game statistics. Please try again later.
              </div>
            )}
          </div>
        )}

        {/* Notifications Tab */}
        {activeTab === "notifications" && (
          <div className="space-y-6">
            <h2 className="text-xl font-black text-black border-b-2 border-black pb-2">Notification Preferences</h2>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border-2 border-black" style={{ borderRadius: "0" }}>
                <div>
                  <h3 className="font-bold text-black">Email Notifications</h3>
                  <p className="text-sm text-zinc-600">
                    Receive notifications via email
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.notifications.email}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        notifications: {
                          ...settings.notifications,
                          email: e.target.checked,
                        },
                      })
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between p-4 border-2 border-black" style={{ borderRadius: "0" }}>
                <div>
                  <h3 className="font-bold text-black">Content Approved</h3>
                  <p className="text-sm text-zinc-600">
                    Notify when your content is approved
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.notifications.contentApproved}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        notifications: {
                          ...settings.notifications,
                          contentApproved: e.target.checked,
                        },
                      })
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between p-4 border-2 border-black" style={{ borderRadius: "0" }}>
                <div>
                  <h3 className="font-bold text-black">Content Rejected</h3>
                  <p className="text-sm text-zinc-600">
                    Notify when your content is rejected
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.notifications.contentRejected}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        notifications: {
                          ...settings.notifications,
                          contentRejected: e.target.checked,
                        },
                      })
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between p-4 border-2 border-black" style={{ borderRadius: "0" }}>
                <div>
                  <h3 className="font-bold text-black">New Assignments</h3>
                  <p className="text-sm text-zinc-600">
                    Notify about new assignments (Teachers/Students)
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.notifications.newAssignments}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        notifications: {
                          ...settings.notifications,
                          newAssignments: e.target.checked,
                        },
                      })
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>
          </div>
        )}

        {/* Preferences Tab */}
        {activeTab === "preferences" && (
          <div className="space-y-6">
            <h2 className="text-xl font-black text-black border-b-2 border-black pb-2">Preferences</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-black mb-2">
                  <Globe className="inline mr-2" size={16} />
                  Language
                </label>
                <select
                  value={settings.language}
                  onChange={(e) =>
                    setSettings({ ...settings, language: e.target.value })
                  }
                  className="w-full p-3 border-2 border-black font-medium focus:outline-none"
                  style={{ borderRadius: "0" }}
                >
                  <option value="en">English</option>
                  <option value="kh">ខ្មែរ (Khmer)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-black mb-2">
                  <Palette className="inline mr-2" size={16} />
                  Theme
                </label>
                <select
                  value={settings.theme}
                  onChange={(e) =>
                    setSettings({ ...settings, theme: e.target.value })
                  }
                  className="w-full p-3 border-2 border-black font-medium focus:outline-none"
                  style={{ borderRadius: "0" }}
                >
                  <option value="light">Light</option>
                  <option value="dark">Dark</option>
                  <option value="auto">Auto</option>
                </select>
              </div>

              <div className="flex items-center justify-between p-4 border-2 border-black" style={{ borderRadius: "0" }}>
                <div>
                  <h3 className="font-bold text-black">
                    <Volume2 className="inline mr-2" size={16} />
                    Audio Muted
                  </h3>
                  <p className="text-sm text-zinc-600">
                    Mute all audio by default
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.audioMuted}
                    onChange={(e) =>
                      setSettings({ ...settings, audioMuted: e.target.checked })
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>
          </div>
        )}

        {/* Privacy Tab */}
        {activeTab === "privacy" && (
          <div className="space-y-6">
            <h2 className="text-xl font-black text-black border-b-2 border-black pb-2">Privacy & Security</h2>

            <div className="space-y-4">
              <div className="p-4 border-2 border-black bg-zinc-50" style={{ borderRadius: "0" }}>
                <h3 className="font-black text-black mb-1">Information Visibility / ការកំណត់បង្ហាញព័ត៌មាន</h3>
                <p className="text-xs text-zinc-500 mb-4">
                  Configure what information is visible to other students on the public leaderboard and search. / កំណត់ថាតើព័ត៌មានអ្វីខ្លះដែលអាចមើលឃើញដោយសិស្សដទៃទៀត។
                </p>

                <div className="space-y-3">
                  {/* Name Visibility */}
                  <div className="flex items-center justify-between p-3 border-2 border-black bg-white" style={{ borderRadius: "0" }}>
                    <div>
                      <h4 className="font-bold text-xs md:text-sm text-black">Display Name / ឈ្មោះបង្ហាញ</h4>
                      <p className="text-[10px] md:text-xs text-zinc-500">Show display name on public pages. / បង្ហាញឈ្មោះនៅលើទំព័រសាធារណៈ។</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                      <input
                        type="checkbox"
                        checked={settings.isNamePublic ?? true}
                        onChange={(e) => setSettings({ ...settings, isNamePublic: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-zinc-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  {/* Username Visibility */}
                  <div className="flex items-center justify-between p-3 border-2 border-black bg-white" style={{ borderRadius: "0" }}>
                    <div>
                      <h4 className="font-bold text-xs md:text-sm text-black">Username / ឈ្មោះគណនី</h4>
                      <p className="text-[10px] md:text-xs text-zinc-500">Show username on public pages. / បង្ហាញឈ្មោះគណនីនៅលើទំព័រសា情ណៈ។</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                      <input
                        type="checkbox"
                        checked={settings.isUsernamePublic ?? true}
                        onChange={(e) => setSettings({ ...settings, isUsernamePublic: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-zinc-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  {/* School Visibility */}
                  {settings.role === "student" && (
                    <div className="flex items-center justify-between p-3 border-2 border-black bg-white" style={{ borderRadius: "0" }}>
                      <div>
                        <h4 className="font-bold text-xs md:text-sm text-black">School Name / ឈ្មោះសាលារៀន</h4>
                        <p className="text-[10px] md:text-xs text-zinc-500">Show school name on public pages. / បង្ហាញឈ្មោះសាលារៀននៅលើទំព័រសាធារណៈ។</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                        <input
                          type="checkbox"
                          checked={settings.isSchoolPublic ?? true}
                          onChange={(e) => setSettings({ ...settings, isSchoolPublic: e.target.checked })}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-zinc-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                  )}

                  {/* Province Visibility */}
                  {settings.role === "student" && (
                    <div className="flex items-center justify-between p-3 border-2 border-black bg-white" style={{ borderRadius: "0" }}>
                      <div>
                        <h4 className="font-bold text-xs md:text-sm text-black">Province / ខេត្ត-ក្រុង</h4>
                        <p className="text-[10px] md:text-xs text-zinc-500">Show province on public pages. / បង្ហាញខេត្ត-ក្រុងនៅលើទំព័រសាធារណៈ។</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                        <input
                          type="checkbox"
                          checked={settings.isProvincePublic ?? true}
                          onChange={(e) => setSettings({ ...settings, isProvincePublic: e.target.checked })}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-zinc-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                  )}

                  {/* Grade Visibility */}
                  {settings.role === "student" && (
                    <div className="flex items-center justify-between p-3 border-2 border-black bg-white" style={{ borderRadius: "0" }}>
                      <div>
                        <h4 className="font-bold text-xs md:text-sm text-black">Grade Level / កម្រិតថ្នាក់</h4>
                        <p className="text-[10px] md:text-xs text-zinc-500">Show grade level on public pages. / បង្ហាញកម្រិតថ្នាក់នៅលើទំព័រសាធារណៈ។</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                        <input
                          type="checkbox"
                          checked={settings.isGradePublic ?? true}
                          onChange={(e) => setSettings({ ...settings, isGradePublic: e.target.checked })}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-zinc-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                  )}

                  {/* Section Visibility */}
                  {settings.role === "student" && (
                    <div className="flex items-center justify-between p-3 border-2 border-black bg-white" style={{ borderRadius: "0" }}>
                      <div>
                        <h4 className="font-bold text-xs md:text-sm text-black">Section (Room) / វេនសិក្សា</h4>
                        <p className="text-[10px] md:text-xs text-zinc-500">Show class section on public pages. / បង្ហាញវេនសិក្សានៅលើទំព័រសាធារណៈ។</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                        <input
                          type="checkbox"
                          checked={settings.isSectionPublic ?? true}
                          onChange={(e) => setSettings({ ...settings, isSectionPublic: e.target.checked })}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-zinc-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                  )}

                  {/* Stats Visibility */}
                  <div className="flex items-center justify-between p-3 border-2 border-black bg-white" style={{ borderRadius: "0" }}>
                    <div>
                      <h4 className="font-bold text-xs md:text-sm text-black">Game Stats & Leaderboard / ស្ថិតិហ្គេម និងតារាងពិន្ទុ</h4>
                      <p className="text-[10px] md:text-xs text-zinc-500">Show quiz scores, rank, and claimed rewards. / បង្ហាញពិន្ទុ ចំណាត់ថ្នាក់ និងរង្វាន់ដែលទទួលបាន។</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                      <input
                        type="checkbox"
                        checked={settings.isStatsPublic ?? true}
                        onChange={(e) => setSettings({ ...settings, isStatsPublic: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-zinc-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                </div>
              </div>

              <div className="p-4 border-2 border-black bg-yellow-50" style={{ borderRadius: "0" }}>
                <h3 className="font-bold text-black mb-2">Change Password</h3>
                <p className="text-sm text-zinc-600 mb-4">
                  For security reasons, password changes must be done through your email.
                </p>
                <button className="px-4 py-2 bg-blue-400 border-2 border-black font-bold text-sm hover:bg-blue-300" style={{ borderRadius: "0" }}>
                  Request Password Reset
                </button>
              </div>

              <div className="p-4 border-2 border-black" style={{ borderRadius: "0" }}>
                <h3 className="font-bold text-black mb-2">Account Activity</h3>
                <p className="text-sm text-zinc-600 mb-4">
                  View your recent account activity and login history.
                </p>
                <button className="px-4 py-2 bg-gray-200 border-2 border-black font-bold text-sm hover:bg-gray-300" style={{ borderRadius: "0" }}>
                  View Activity Log
                </button>
              </div>

              {settings.role === "student" ? (
                <div className="p-4 border-2 border-black bg-zinc-50" style={{ borderRadius: "0" }}>
                  <h3 className="font-bold text-black mb-2">Account Removal · ការលុបគណនី</h3>
                  <p className="text-sm text-zinc-600">
                    For your safety, students can&apos;t delete their own account. Ask your teacher or an
                    admin if it needs to be removed.
                    <br />
                    ដើម្បីសុវត្ថិភាព សិស្សមិនអាចលុបគណនីខ្លួនឯងបានទេ។ សូមស្នើគ្រូ ឬអ្នកគ្រប់គ្រង
                    ប្រសិនបើចង់លុបគណនី។
                  </p>
                </div>
              ) : (
                <div className="p-4 border-2 border-red-600 bg-red-50" style={{ borderRadius: "0" }}>
                  <h3 className="font-bold text-red-600 mb-2">Danger Zone</h3>
                  <p className="text-sm text-zinc-600 mb-4">
                    Permanently delete your account and all associated data.
                  </p>
                  <button className="px-4 py-2 bg-red-400 border-2 border-black font-bold text-sm hover:bg-red-500" style={{ borderRadius: "0" }}>
                    Delete Account
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Security Tab */}
        {activeTab === "security" && (
          <div className="space-y-6">
            <h2 className="text-xl font-black text-black border-b-2 border-black pb-2">
              Security / សុវត្ថិភាព
            </h2>

            <ChangePassword />

            <div
              className="flex items-start gap-3 p-4 border-2 border-black bg-yellow-50"
              style={{ borderRadius: "0" }}
            >
              <ShieldCheck size={20} className="text-[#0284c7] shrink-0 mt-0.5" />
              <div>
                <h3 className="font-black text-black">
                  Enhanced access protected by Two-Factor Authentication (2FA/TOTP).
                </h3>
                <p className="text-sm text-zinc-600 mt-1">
                  ការការពារបន្ថែមដោយការផ្ទៀងផ្ទាត់ ២ ជាន់ (2FA/TOTP)។ បើកវាដើម្បីបន្ថែម
                  ជំហានសុវត្ថិភាពមួយទៀតពេលចូលគណនី។
                </p>
                <p className="text-xs font-bold text-zinc-500 mt-2">
                  Optional for every account · ស្រេចចិត្តសម្រាប់គ្រប់គណនី
                </p>
              </div>
            </div>

            <TwoFactorSetup />
          </div>
        )}
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving || daysLeft > 0}
          className="flex items-center gap-2 px-6 py-3 bg-green-400 border-2 border-black font-bold text-sm hover:bg-green-300 hover:shadow-[4px_4px_0_#000] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ borderRadius: "0" }}
        >
          {saving ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Saving...
            </>
          ) : daysLeft > 0 ? (
            <>
              <Lock size={16} />
              Locked ({daysLeft}d)
            </>
          ) : (
            <>
              <Save size={16} />
              Save Changes
            </>
          )}
        </button>
      </div>
    </div>
  );
}
