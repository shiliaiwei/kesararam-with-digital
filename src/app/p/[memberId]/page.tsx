"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { TEAM_MEMBERS } from "@/lib/team-data";
import { RefreshCw } from "lucide-react";

function ProfileImage({ imageUrl, name }: { imageUrl: string; name: string }) {
  return (
    <div className="relative select-none" style={{ userSelect: "none", WebkitUserSelect: "none" } as React.CSSProperties}>
      <div className="absolute inset-0 z-10" style={{ pointerEvents: "none" }} aria-hidden />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={`/api/profile-image?imageUrl=${encodeURIComponent(imageUrl)}`}
        alt={name}
        className="w-32 h-32 object-cover block pointer-events-none"
        draggable={false}
        style={{ userSelect: "none", WebkitUserSelect: "none", display: "block" } as React.CSSProperties}
        onContextMenu={(e) => e.preventDefault()}
      />
    </div>
  );
}

function ExpiredScreen({ name, vsid }: { name?: string; vsid?: string }) {
  return (
    <div
      className="min-h-screen flex items-center justify-center p-6"
      style={{ background: "#000", fontFamily: "'Arial Black', Arial, sans-serif" }}
    >
      <div
        className="text-center"
        style={{ border: "3px solid #FFEE00", boxShadow: "6px 6px 0 #FFEE00", background: "#000", padding: 40, maxWidth: 360, width: "100%" }}
      >
        <RefreshCw className="w-12 h-12 mx-auto mb-4" style={{ color: "#FFEE00" }} />
        <p className="font-black text-2xl uppercase mb-2" style={{ color: "#FFEE00" }}>
          SESSION EXPIRED
        </p>
        <p className="font-bold text-sm mb-6" style={{ color: "#fff" }}>
          This profile link has expired. Please scan the QR code again.
        </p>
        <div
          className="font-black text-sm uppercase px-4 py-3 text-center"
          style={{ background: "#FFEE00", color: "#000", border: "2px solid #FFEE00" }}
        >
          SCAN THE QR CODE AGAIN TO VIEW
        </div>
        {name && (
          <p className="font-bold text-[11px] mt-4" style={{ color: "#666" }}>
            {name} · {vsid}
          </p>
        )}
      </div>
    </div>
  );
}

function PublicMemberContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const memberId = params?.memberId as string;
  const token = searchParams?.get("token");

  const member = TEAM_MEMBERS.find((m) => m.id === memberId);

  const [status, setStatus] = useState<"loading" | "valid" | "expired" | "invalid">("loading");
  const [countdown, setCountdown] = useState(3600);

  // Verify token on mount
  useEffect(() => {
    if (!token) {
      setStatus("invalid");
      return;
    }

    fetch(`/api/verify-token?token=${encodeURIComponent(token)}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.valid) {
          setStatus("valid");
          setCountdown(3600);
        } else {
          setStatus("invalid");
        }
      })
      .catch(() => setStatus("invalid"));
  }, [token]);

  // Countdown once valid
  useEffect(() => {
    if (status !== "valid") return;
    const interval = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          setStatus("expired");
          clearInterval(interval);
          return 0;
        }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [status]);

  if (!member) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: "#FFEE00", fontFamily: "'Arial Black', Arial, sans-serif" }}
      >
        <div style={{ border: "3px solid #000", boxShadow: "6px 6px 0 #000", background: "#fff", padding: 32 }}>
          <p className="font-black text-2xl uppercase">MEMBER NOT FOUND</p>
        </div>
      </div>
    );
  }

  if (status === "loading") {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: "#000", fontFamily: "'Arial Black', Arial, sans-serif" }}
      >
        <p className="font-black text-lg uppercase animate-pulse" style={{ color: "#FFEE00" }}>
          VERIFYING...
        </p>
      </div>
    );
  }

  if (status === "invalid" || status === "expired") {
    return <ExpiredScreen name={member.name} vsid={member.vsid} />;
  }

  const isStudent = member.role === "student";
  const mins = Math.floor(countdown / 60);
  const secs = countdown % 60;
  const timeLabel = `${mins}:${String(secs).padStart(2, "0")}`;

  return (
    <div className="min-h-screen" style={{ background: "#f5f5f5", fontFamily: "'Arial Black', Arial, sans-serif" }}>
      {/* Top bar */}
      <div
        className="flex items-center justify-between px-4 py-3"
        style={{ background: "#000", borderBottom: "3px solid #FFEE00" }}
      >
        <span className="font-black text-sm uppercase" style={{ color: "#FFEE00" }}>
          TECHNOVATION GIRLS 2026
        </span>
        <div
          className="flex items-center gap-2 px-3 py-1"
          style={{ background: countdown <= 300 ? "#ff4444" : "#FFEE00", border: "2px solid #FFEE00" }}
        >
          <RefreshCw className={`w-3 h-3 ${countdown <= 60 ? "animate-spin" : ""}`} style={{ color: "#000" }} />
          <span className="font-black text-[11px]" style={{ color: "#000" }}>{timeLabel}</span>
        </div>
      </div>

      <div className="max-w-md mx-auto p-5">
        {/* VSID Card */}
        <div className="mb-5" style={{ border: "3px solid #000", boxShadow: "6px 6px 0 #000", background: "#FFEE00" }}>
          <div className="px-4 py-2 flex justify-between items-center" style={{ background: "#000" }}>
            <span className="font-black text-sm uppercase" style={{ color: "#FFEE00" }}>
              KESARARAM WITH DIGITAL
            </span>
            <span className="font-black text-[10px] px-2 py-0.5 uppercase" style={{ background: "#FFEE00", color: "#000" }}>
              {isStudent ? "STUDENT ID" : "MENTOR ID"}
            </span>
          </div>

          <div className="p-4 flex gap-4">
            <div style={{ border: "3px solid #000", flexShrink: 0 }}>
              <ProfileImage imageUrl={member.imageUrl} name={member.name} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-black text-xl uppercase leading-tight" style={{ letterSpacing: "-0.5px" }}>
                {member.name}
              </p>
              <div style={{ height: 3, background: "#000", margin: "6px 0" }} />
              <p className="font-black text-xs uppercase">{member.school}</p>
              <p className="font-bold text-[11px] opacity-70">
                {isStudent ? "JUNIOR DIVISION" : member.specialty?.toUpperCase()}
              </p>
              {isStudent && <p className="font-bold text-[11px] mt-1">AGE {member.age}</p>}
              <div className="mt-3 inline-block px-2 py-1" style={{ background: "#000", color: "#FFEE00" }}>
                <span className="font-black text-xs tracking-widest">{member.vsid}</span>
              </div>
              <div className="mt-2 flex gap-[2px] items-end">
                {member.vsid.replace(/-/g, "").split("").map((_, i) => (
                  <div key={i} style={{ width: i % 3 === 0 ? 3 : 2, height: i % 2 === 0 ? 18 : 12, background: "#000" }} />
                ))}
              </div>
            </div>
          </div>

          <div
            className="px-4 py-2 flex justify-between text-[9px] font-black uppercase"
            style={{ background: "#000", color: "#FFEE00", borderTop: "3px solid #000" }}
          >
            <span>ENROLLED: {member.enrolled}</span>
            <span>EXP: {member.expiry}</span>
            <span>#{member.cardNo}</span>
          </div>
        </div>

        {/* Bio */}
        <div className="mb-4" style={{ border: "3px solid #000", boxShadow: "4px 4px 0 #000", background: "#fff" }}>
          <div className="px-4 py-2" style={{ background: "#000" }}>
            <span className="font-black text-[11px] uppercase" style={{ color: "#FFEE00" }}>BIO</span>
          </div>
          <p className="px-4 py-3 font-bold text-sm leading-relaxed text-gray-800">{member.bio}</p>
        </div>

        {/* Access privileges */}
        <div style={{ border: "3px solid #000", boxShadow: "4px 4px 0 #000", background: "#fff" }}>
          <div className="px-4 py-2" style={{ background: "#000" }}>
            <span className="font-black text-[11px] uppercase" style={{ color: "#FFEE00" }}>ACCESS PRIVILEGES</span>
          </div>
          <div className="px-4 py-3 flex flex-wrap gap-2">
            {member.accessPrivileges.map((p) => (
              <span key={p} className="font-black text-[10px] uppercase px-2 py-1" style={{ background: "#FFEE00", border: "2px solid #000" }}>
                {p}
              </span>
            ))}
          </div>
        </div>

        <p className="text-center font-bold text-[11px] mt-5 text-gray-500">
          This view expires in {timeLabel} · Scan QR code again to re-access
        </p>
      </div>
    </div>
  );
}

export default function PublicMemberPage() {
  return (
    <Suspense
      fallback={
        <div
          className="min-h-screen flex items-center justify-center"
          style={{ background: "#000", fontFamily: "'Arial Black', Arial, sans-serif" }}
        >
          <p className="font-black text-lg uppercase animate-pulse" style={{ color: "#FFEE00" }}>
            LOADING...
          </p>
        </div>
      }
    >
      <PublicMemberContent />
    </Suspense>
  );
}
