"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Trophy, Zap, Target, TrendingUp, Award, Calendar, Flame, Star } from "lucide-react";
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
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProfile();
    
    // Refresh every 30 seconds for real-time updates
    const interval = setInterval(fetchProfile, 30000);
    return () => clearInterval(interval);
  }, []);

  async function fetchProfile() {
    try {
      setError(null);
      
      // Check authentication
      const authRes = await fetch("/api/auth/me");
      if (!authRes.ok) {
        router.push("/login");
        return;
      }
      const authData = await authRes.json();

      // Get user stats with error handling
      let statsData = {
        stats: {
          highestScore: 0,
          totalGamesPlayed: 0,
          lifetimePoints: 0,
          currentRank: null,
          currentStreak: 0,
          longestStreak: 0,
        }
      };

      try {
        const statsRes = await fetch("/api/user/stats");
        if (statsRes.ok) {
          statsData = await statsRes.json();
        }
      } catch (err) {
        console.log("Stats not available yet:", err);
      }

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
      setError("Unable to load profile data");
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-lg font-bold text-zinc-600">Loading your profile...</p>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-6">
          <div className="w-20 h-20 bg-red-100 border-2 border-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-4xl">⚠️</span>
          </div>
          <h2 className="text-2xl font-black text-zinc-800 mb-2">Unable to Load Profile</h2>
          <p className="text-zinc-600 mb-6">{error || "Please try again later"}</p>
          <button
            onClick={() => router.push("/login")}
            className="px-6 py-3 bg-yellow-400 border-2 border-black font-bold text-black hover:bg-yellow-300 transition-colors"
            style={{ boxShadow: "4px 4px 0 #000" }}
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  const name = profile.displayName || profile.username;

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-blue-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Header Section */}
        <div className="bg-white border-2 border-black rounded-lg overflow-hidden mb-6" style={{ boxShadow: "6px 6px 0 #000" }}>
          {/* Yellow stripe */}
          <div className="h-2 bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-400" />
          
          <div className="p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
              {/* Avatar */}
              <div className="relative">
                <div className="w-24 h-24 sm:w-32 sm:h-32 border-4 border-black rounded-lg overflow-hidden" style={{ boxShadow: "4px 4px 0 #000" }}>
                  <AvatarDisplay
                    avatar={profile.avatar}
                    name={name}
                    size={128}
                    radius={0}
                  />
                </div>
                {profile.currentRank && profile.currentRank <= 3 && (
                  <div className="absolute -top-2 -right-2 w-10 h-10 bg-yellow-400 border-2 border-black rounded-full flex items-center justify-center" style={{ boxShadow: "2px 2px 0 #000" }}>
                    <Trophy size={20} className="text-black" />
                  </div>
                )}
              </div>

              {/* User Info */}
              <div className="flex-1 text-center sm:text-left">
                <h1 className="text-3xl sm:text-4xl font-black text-black mb-2">{name}</h1>
                <p className="text-zinc-600 mb-3">{profile.email}</p>
                
                <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-500 text-white text-xs font-bold uppercase tracking-wider border-2 border-black" style={{ boxShadow: "2px 2px 0 #000" }}>
                    <Star size={12} />
                    Student
                  </span>
                  
                  {profile.currentRank && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-yellow-400 text-black text-xs font-bold uppercase tracking-wider border-2 border-black" style={{ boxShadow: "2px 2px 0 #000" }}>
                      <Trophy size={12} />
                      Rank #{profile.currentRank}
                    </span>
                  )}
                  
                  {profile.currentStreak > 0 && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-orange-500 text-white text-xs font-bold uppercase tracking-wider border-2 border-black" style={{ boxShadow: "2px 2px 0 #000" }}>
                      <Flame size={12} />
                      {profile.currentStreak} Day Streak
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {/* Total Points */}
          <div className="bg-gradient-to-br from-yellow-400 to-yellow-500 border-2 border-black rounded-lg p-6" style={{ boxShadow: "4px 4px 0 #000" }}>
            <div className="flex items-center justify-between mb-3">
              <Zap size={24} className="text-black" />
              <TrendingUp size={16} className="text-black/60" />
            </div>
            <div className="text-3xl font-black text-black mb-1 tabular-nums">
              {profile.lifetimePoints.toLocaleString()}
            </div>
            <div className="text-xs font-bold text-black/70 uppercase tracking-wider">
              Total Points
            </div>
          </div>

          {/* Games Played */}
          <div className="bg-gradient-to-br from-green-400 to-green-500 border-2 border-black rounded-lg p-6" style={{ boxShadow: "4px 4px 0 #000" }}>
            <div className="flex items-center justify-between mb-3">
              <Target size={24} className="text-white" />
              <Calendar size={16} className="text-white/60" />
            </div>
            <div className="text-3xl font-black text-white mb-1 tabular-nums">
              {profile.totalGamesPlayed}
            </div>
            <div className="text-xs font-bold text-white/80 uppercase tracking-wider">
              Games Played
            </div>
          </div>

          {/* Highest Score */}
          <div className="bg-gradient-to-br from-purple-400 to-purple-500 border-2 border-black rounded-lg p-6" style={{ boxShadow: "4px 4px 0 #000" }}>
            <div className="flex items-center justify-between mb-3">
              <Award size={24} className="text-white" />
              <Star size={16} className="text-white/60" />
            </div>
            <div className="text-3xl font-black text-white mb-1 tabular-nums">
              {profile.highestScore.toLocaleString()}
            </div>
            <div className="text-xs font-bold text-white/80 uppercase tracking-wider">
              Best Score
            </div>
          </div>

          {/* Current Rank */}
          <div className="bg-gradient-to-br from-blue-400 to-blue-500 border-2 border-black rounded-lg p-6" style={{ boxShadow: "4px 4px 0 #000" }}>
            <div className="flex items-center justify-between mb-3">
              <Trophy size={24} className="text-white" />
              <TrendingUp size={16} className="text-white/60" />
            </div>
            <div className="text-3xl font-black text-white mb-1 tabular-nums">
              {profile.currentRank ? `#${profile.currentRank}` : "—"}
            </div>
            <div className="text-xs font-bold text-white/80 uppercase tracking-wider">
              Global Rank
            </div>
          </div>
        </div>

        {/* Streak Section */}
        {(profile.currentStreak > 0 || profile.longestStreak > 0) && (
          <div className="bg-white border-2 border-black rounded-lg p-6 mb-6" style={{ boxShadow: "4px 4px 0 #000" }}>
            <h2 className="text-xl font-black text-black mb-4 flex items-center gap-2">
              <Flame className="text-orange-500" size={24} />
              Streak Stats
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-orange-50 border-2 border-orange-200 rounded-lg">
                <div className="text-3xl font-black text-orange-600 mb-1">{profile.currentStreak}</div>
                <div className="text-xs font-bold text-orange-800 uppercase">Current Streak</div>
              </div>
              <div className="text-center p-4 bg-purple-50 border-2 border-purple-200 rounded-lg">
                <div className="text-3xl font-black text-purple-600 mb-1">{profile.longestStreak}</div>
                <div className="text-xs font-bold text-purple-800 uppercase">Longest Streak</div>
              </div>
            </div>
          </div>
        )}

        {/* Edit Profile Section */}
        <div className="bg-white border-2 border-black rounded-lg overflow-hidden" style={{ boxShadow: "4px 4px 0 #000" }}>
          <div className="bg-black px-6 py-3 flex items-center gap-2">
            <div className="w-1 h-6 bg-yellow-400" />
            <h2 className="text-sm font-black text-yellow-400 uppercase tracking-wider">
              Edit Profile
            </h2>
          </div>
          <div className="p-6">
            <ProfileEditor
              initialName={name}
              initialAvatar={profile.avatar}
              initialAvatarChangedAt={profile.avatarChangedAt}
              role="student"
              dark={false}
            />
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-6 flex flex-wrap gap-3 justify-center">
          <button
            onClick={() => router.push("/leaderboard")}
            className="px-6 py-3 bg-yellow-400 border-2 border-black font-bold text-black hover:bg-yellow-300 transition-colors flex items-center gap-2"
            style={{ boxShadow: "4px 4px 0 #000" }}
          >
            <Trophy size={18} />
            View Leaderboard
          </button>
          <button
            onClick={() => router.push("/play")}
            className="px-6 py-3 bg-blue-500 border-2 border-black font-bold text-white hover:bg-blue-400 transition-colors flex items-center gap-2"
            style={{ boxShadow: "4px 4px 0 #000" }}
          >
            <Zap size={18} />
            Play Now
          </button>
        </div>
      </div>
    </div>
  );
}
