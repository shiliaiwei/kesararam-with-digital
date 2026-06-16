"use client";

import { useMemo } from "react";

export function PublicProfileLink({ username }: { username: string }) {
  const url = useMemo(() => {
    if (typeof window !== "undefined") {
      return `${window.location.origin}/u/${username}`;
    }
    return `https://kesararamwithdigital.tech/u/${username}`;
  }, [username]);

  const handleCopy = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(url);
      alert("Profile link copied! / បានចម្លងតំណភ្ជាប់!");
    }
  };

  return (
    <div
      style={{
        background: "#ffffff",
        border: "2px solid #000",
        boxShadow: "4px 4px 0 #000",
        padding: "16px",
        display: "flex",
        flexDirection: "column",
        gap: "8px",
      }}
    >
      <span
        style={{
          fontSize: "10px",
          fontWeight: 900,
          textTransform: "uppercase",
          letterSpacing: "0.1em",
          color: "#71717a",
        }}
      >
        My Public Profile URL / តំណភ្ជាប់គណនីសាធារណៈ
      </span>
      <div style={{ display: "flex", gap: "8px", alignItems: "stretch" }}>
        <input
          type="text"
          readOnly
          value={url}
          style={{
            flex: 1,
            padding: "8px 12px",
            border: "2px solid #000",
            fontSize: "12px",
            fontFamily: "var(--font-en)",
            background: "#f4f4f5",
            color: "#27272a",
            outline: "none",
          }}
        />
        <button
          onClick={handleCopy}
          type="button"
          style={{
            padding: "8px 16px",
            background: "#3b82f6",
            color: "#fff",
            border: "2px solid #000",
            fontWeight: 900,
            fontSize: "11px",
            textTransform: "uppercase",
            cursor: "pointer",
          }}
          className="hover:bg-blue-600 active:translate-x-0.5 active:translate-y-0.5"
        >
          Copy
        </button>
        <a
          href={`/u/${username}`}
          target="_blank"
          rel="noreferrer"
          style={{
            padding: "8px 16px",
            background: "#eab308",
            color: "#000",
            border: "2px solid #000",
            fontWeight: 900,
            fontSize: "11px",
            textTransform: "uppercase",
            textDecoration: "none",
            textAlign: "center",
            display: "flex",
            alignItems: "center",
          }}
          className="hover:bg-yellow-400 active:translate-x-0.5 active:translate-y-0.5"
        >
          View
        </a>
      </div>
    </div>
  );
}
