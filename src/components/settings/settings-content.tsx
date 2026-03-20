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
  Loader2
} from "lucide-react";

interface UserSettings {
  displayName: string;
  email: string;
  avatar: string;
  audioMuted: boolean;
  language: string;
  theme: string;
  notifications: {
    email: boolean;
    push: boolean;
    contentApproved: boolean;
    contentRejected: boolean;
    newAssignments: boolean;
  };
}

export function SettingsContent() {
  const [settings, setSettings] = useState<UserSettings>({
    displayName: "",
    email: "",
    avatar: "",
    audioMuted: false,
    language: "en",
    theme: "light",
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

  useEffect(() => {
    fetchSettings();
  }, []);

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
            </div>
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
