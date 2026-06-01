"use client";

import { useState, useEffect } from "react";
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
  Clock
} from "lucide-react";

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

  useEffect(() => {
    fetchSettings();
  }, []);

  useEffect(() => {
    if (activeTab === "stats" && !gameStats) {
      fetchGameStats();
    }
  }, [activeTab]);

  const fetchSettings = async () => {
    try {
      const response = await fetch("/api/user/settings");
      const data = await response.json();
      if (data.settings) {
        setSettings(data.settings);
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
    setSaving(true);
    try {
      const response = await fetch("/api/user/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });

      if (response.ok) {
        alert("Settings saved successfully!");
      }
    } catch (error) {
      console.error("Error saving settings:", error);
      alert("Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  const tabs = [
    { id: "profile", label: "Profile", icon: User },
    { id: "stats", label: "Game Stats", icon: Trophy },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "preferences", label: "Preferences", icon: Palette },
    { id: "privacy", label: "Privacy", icon: Shield },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black text-black mb-2">Settings</h1>
        <p className="text-zinc-600">Manage your account settings and preferences</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b-2 border-black">
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
        style={{ boxShadow: "4px 4px 0 #000" }}
      >
        {/* Profile Tab */}
        {activeTab === "profile" && (
          <div className="space-y-6">
            <h2 className="text-xl font-black text-black">Profile Information</h2>

            <div className="space-y-4">
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
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-black mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={settings.email}
                  disabled
                  className="w-full p-3 border-2 border-black font-medium bg-gray-100 cursor-not-allowed"
                />
                <p className="text-xs text-zinc-500 mt-1">
                  Email cannot be changed. Contact admin if needed.
                </p>
              </div>

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
                />
              </div>

              {/* School Name */}
              <div>
                <label className="block text-sm font-bold text-black mb-2">
                  School Name / ឈ្មោះសាលារៀន
                </label>
                <input
                  type="text"
                  value={settings.schoolName || ""}
                  onChange={(e) =>
                    setSettings({ ...settings, schoolName: e.target.value })
                  }
                  className="w-full p-3 border-2 border-black font-medium focus:outline-none focus:shadow-[2px_2px_0_#000]"
                  placeholder="e.g. Wat Bo Primary School / សាលាបឋមសិក្សាវត្តបូ"
                />
              </div>

              {/* Province */}
              <div>
                <label className="block text-sm font-bold text-black mb-2">
                  Province / ខេត្ត-ក្រុង
                </label>
                <select
                  value={settings.province || ""}
                  onChange={(e) =>
                    setSettings({ ...settings, province: e.target.value })
                  }
                  className="w-full p-3 border-2 border-black font-bold bg-white focus:outline-none focus:shadow-[2px_2px_0_#000]"
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
                    onChange={(e) =>
                      setSettings({ ...settings, gradeLevel: e.target.value })
                    }
                    className="w-full p-3 border-2 border-black font-bold bg-white focus:outline-none focus:shadow-[2px_2px_0_#000]"
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
                    onChange={(e) =>
                      setSettings({ ...settings, section: e.target.value })
                    }
                    className="w-full p-3 border-2 border-black font-medium focus:outline-none focus:shadow-[2px_2px_0_#000]"
                    placeholder="e.g. Morning A / ព្រឹក A"
                  />
                </div>
              )}
            </div>
          </div>
        )}

        {/* Game Stats Tab */}
        {activeTab === "stats" && (
          <div className="space-y-6">
            <h2 className="text-xl font-black text-black">Game Statistics</h2>

            {statsLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
              </div>
            ) : gameStats ? (
              <>
                {/* Key Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="border-2 border-black p-4 bg-yellow-50" style={{ boxShadow: "3px 3px 0 #000" }}>
                    <div className="flex items-center gap-2 mb-2">
                      <Trophy className="text-yellow-600" size={20} />
                      <span className="text-xs font-black uppercase text-zinc-500">Highest Score</span>
                    </div>
                    <div className="text-3xl font-black text-black tabular-nums">
                      {gameStats.highestScore.toLocaleString()}
                    </div>
                  </div>

                  <div className="border-2 border-black p-4 bg-blue-50" style={{ boxShadow: "3px 3px 0 #000" }}>
                    <div className="flex items-center gap-2 mb-2">
                      <Zap className="text-blue-600" size={20} />
                      <span className="text-xs font-black uppercase text-zinc-500">Lifetime Points</span>
                    </div>
                    <div className="text-3xl font-black text-black tabular-nums">
                      {gameStats.lifetimePoints.toLocaleString()}
                    </div>
                  </div>

                  <div className="border-2 border-black p-4 bg-green-50" style={{ boxShadow: "3px 3px 0 #000" }}>
                    <div className="flex items-center gap-2 mb-2">
                      <Target className="text-green-600" size={20} />
                      <span className="text-xs font-black uppercase text-zinc-500">Games Played</span>
                    </div>
                    <div className="text-3xl font-black text-black tabular-nums">
                      {gameStats.totalGamesPlayed}
                    </div>
                  </div>

                  <div className="border-2 border-black p-4 bg-purple-50" style={{ boxShadow: "3px 3px 0 #000" }}>
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
                  <div className="border-2 border-black p-4">
                    <div className="text-xs font-black uppercase text-zinc-500 mb-2">Current Streak</div>
                    <div className="text-2xl font-black text-orange-600 tabular-nums">
                      {gameStats.currentStreak} {gameStats.currentStreak === 1 ? "day" : "days"}
                    </div>
                  </div>

                  <div className="border-2 border-black p-4">
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
            <h2 className="text-xl font-black text-black">Notification Preferences</h2>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border-2 border-black">
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

              <div className="flex items-center justify-between p-4 border-2 border-black">
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

              <div className="flex items-center justify-between p-4 border-2 border-black">
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

              <div className="flex items-center justify-between p-4 border-2 border-black">
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
            <h2 className="text-xl font-black text-black">Preferences</h2>

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
                >
                  <option value="light">Light</option>
                  <option value="dark">Dark</option>
                  <option value="auto">Auto</option>
                </select>
              </div>

              <div className="flex items-center justify-between p-4 border-2 border-black">
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
            <h2 className="text-xl font-black text-black">Privacy & Security</h2>

            <div className="space-y-4">
              <div className="p-4 border-2 border-black bg-yellow-50">
                <h3 className="font-bold text-black mb-2">Change Password</h3>
                <p className="text-sm text-zinc-600 mb-4">
                  For security reasons, password changes must be done through your email.
                </p>
                <button className="px-4 py-2 bg-blue-400 border-2 border-black font-bold text-sm hover:bg-blue-300">
                  Request Password Reset
                </button>
              </div>

              <div className="p-4 border-2 border-black">
                <h3 className="font-bold text-black mb-2">Account Activity</h3>
                <p className="text-sm text-zinc-600 mb-4">
                  View your recent account activity and login history.
                </p>
                <button className="px-4 py-2 bg-gray-200 border-2 border-black font-bold text-sm hover:bg-gray-300">
                  View Activity Log
                </button>
              </div>

              <div className="p-4 border-2 border-red-600 bg-red-50">
                <h3 className="font-bold text-red-600 mb-2">Danger Zone</h3>
                <p className="text-sm text-zinc-600 mb-4">
                  Permanently delete your account and all associated data.
                </p>
                <button className="px-4 py-2 bg-red-400 border-2 border-black font-bold text-sm hover:bg-red-500">
                  Delete Account
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-6 py-3 bg-green-400 border-2 border-black font-bold text-sm hover:bg-green-300 hover:shadow-[4px_4px_0_#000] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Saving...
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
