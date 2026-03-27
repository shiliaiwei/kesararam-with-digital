"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Trophy, Zap, Target, BookOpen } from "lucide-react";
import { AvatarDisplay } from "@/components/shared/avatar-display";
import { ProfileEditor } from "@/components/profile/profile-editor";

interface UserProfile {
  displayName: string | null;
  username: string;
  email: string;
  avatar: string | null;
  avatarChangedAt: string | null;
  highestScore: number;
  totalGamesPlayed: number;
  lifetimePoints: number;
  currentRank: number | null;
  currentStreak: number;
  longestStreak: number;
}

export default function StudentProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
    
    // Refresh every 10 seconds for real-time updates
    const interval = setInterval(fetchProfile, 10000);
    return () => clearInterval(interval);
  }, []);

  async function fetchProfile() {
    try {
      // Check authentication
      const authRes = await fetch("/api/auth/me");
      if (!authRes.ok) {
        router.push("/login");
        return;
      }
      const authData = await authRes.json();

      // Get user stats
      const statsRes = await fetch("/api/user/stats");
      if (!statsRes.ok) {
        const errorData = await statsRes.json();
        console.error("Stats API error:", errorData);
        throw new Error(errorData.error || "Failed to fetch stats");
      }
      const statsData = await statsRes.json();

      setProfile({
        displayName: authData.displayName,
        username: authData.username,
        email: authData.email,
        avatar: authData.avatar,
        avatarChangedAt: null,
        highestScore: statsData.stats?.highestScore || 0,
        totalGamesPlayed: statsData.stats?.totalGamesPlayed || 0,
        lifetimePoints: statsData.stats?.lifetimePoints || 0,
        currentRank: statsData.stats?.currentRank || null,
        currentStreak: statsData.stats?.currentStreak || 0,
        longestStreak: statsData.stats?.longestStreak || 0,
      });
    } catch (error) {
      console.error("Error fetching profile:", error);
      // Don't set profile to null on error - keep trying
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen dot-bg py-10 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen dot-bg py-10 flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg font-bold text-zinc-600">Failed to load profile</p>
          <button
            onClick={() => router.push("/login")}
            className="mt-4 px-6 py-2 bg-yellow-400 border-2 border-black font-bold"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  const name = profile.displayName || profile.username;

  return (
    <div className="min-h-screen dot-bg py-10">
      <div className="max-w-2xl mx-auto px-5 flex flex-col gap-6">
        {/* ── Profile header ── */}
        <div
          style={{
            background: "#ffffff",
            border: "2px solid #000",
            boxShadow: "6px 6px 0 #000",
            overflow: "hidden",
          }}
        >
          {/* Road curb stripe */}
          <div
            style={{
              height: "6px",
              background:
                "repeating-linear-gradient(90deg,#eab308 0,#eab308 20px,#000 20px,#000 40px)",
            }}
          />
          <div
            style={{
              padding: "24px",
              display: "flex",
              alignItems: "center",
              gap: "20px",
            }}
          >
            <AvatarDisplay
              avatar={profile.avatar}
              name={name}
              size={80}
              radius={0}
            />
            <div>
              <h1
                style={{
                  fontSize: "22px",
                  fontWeight: 900,
                  lineHeight: 1.2,
                  margin: 0,
                }}
              >
                {name}
              </h1>
              <p
                style={{ fontSize: "13px", color: "#52525b", marginTop: "4px" }}
              >
                {profile.email}
              </p>
              <span
                style={{
                  display: "inline-block",
                  marginTop: "8px",
                  padding: "2px 10px",
                  fontSize: "11px",
                  fontWeight: 900,
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                  background: "#3b82f6",
                  color: "#fff",
                  border: "2px solid #000",
                  boxShadow: "2px 2px 0 #000",
                }}
              >
                Student
              </span>
            </div>
          </div>
        </div>

        {/* ── Stats ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div
            style={{
              background: "#ffffff",
              border: "2px solid #000",
              boxShadow: "3px 3px 0 #000",
              padding: "16px",
            }}
          >
            <div className="flex items-center gap-2 mb-1">
              <Zap size={16} className="text-yellow-600" />
            </div>
            <span style={{ fontSize: "24px", fontWeight: 900, color: "#eab308" }}>
              {profile.lifetimePoints.toLocaleString()}
            </span>
            <p
              style={{
                fontSize: "12px",
                color: "#71717a",
                fontWeight: 600,
                marginTop: "4px",
              }}
            >
              Total Score
            </p>
          </div>

          <div
            style={{
              background: "#ffffff",
              border: "2px solid #000",
              boxShadow: "3px 3px 0 #000",
              padding: "16px",
            }}
          >
            <div className="flex items-center gap-2 mb-1">
              <Target size={16} className="text-green-600" />
            </div>
            <span style={{ fontSize: "24px", fontWeight: 900, color: "#22c55e" }}>
              {profile.totalGamesPlayed}
            </span>
            <p
              style={{
                fontSize: "12px",
                color: "#71717a",
                fontWeight: 600,
                marginTop: "4px",
              }}
            >
              Games Played
            </p>
          </div>

          <div
            style={{
              background: "#ffffff",
              border: "2px solid #000",
              boxShadow: "3px 3px 0 #000",
              padding: "16px",
            }}
          >
            <div className="flex items-center gap-2 mb-1">
              <Trophy size={16} className="text-blue-600" />
            </div>
            <span style={{ fontSize: "24px", fontWeight: 900, color: "#3b82f6" }}>
              {profile.currentRank ? `#${profile.currentRank}` : "—"}
            </span>
            <p
              style={{
                fontSize: "12px",
                color: "#71717a",
                fontWeight: 600,
                marginTop: "4px",
              }}
            >
              Current Rank
            </p>
          </div>

          <div
            style={{
              background: "#ffffff",
              border: "2px solid #000",
              boxShadow: "3px 3px 0 #000",
              padding: "16px",
            }}
          >
            <div className="flex items-center gap-2 mb-1">
              <BookOpen size={16} className="text-purple-600" />
            </div>
            <span style={{ fontSize: "24px", fontWeight: 900, color: "#a855f7" }}>
              {profile.highestScore.toLocaleString()}
            </span>
            <p
              style={{
                fontSize: "12px",
                color: "#71717a",
                fontWeight: 600,
                marginTop: "4px",
              }}
            >
              Highest Score
            </p>
          </div>
        </div>

        {/* ── Edit profile ── */}
        <div>
          {/* Section label with curb marker */}
          <div
            style={{
              display: "flex",
              alignItems: "stretch",
              marginBottom: "12px",
            }}
          >
            <div
              style={{
                width: "6px",
                background:
                  "repeating-linear-gradient(180deg,#eab308 0,#eab308 6px,#000 6px,#000 12px)",
              }}
            />
            <div
              style={{
                background: "#000",
                padding: "5px 14px",
                display: "flex",
                alignItems: "center",
              }}
            >
              <span
                style={{
                  fontSize: "11px",
                  fontWeight: 900,
                  color: "#eab308",
                  textTransform: "uppercase",
                  letterSpacing: "0.12em",
                }}
              >
                Edit Profile
              </span>
            </div>
          </div>
          <ProfileEditor
            initialName={name}
            initialAvatar={profile.avatar}
            initialAvatarChangedAt={profile.avatarChangedAt}
            role="student"
            dark={false}
          />
        </div>
      </div>
    </div>
  );
}
