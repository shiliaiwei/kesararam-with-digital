"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateProfileAction } from "@/app/actions/profile";
import { AvatarDisplay } from "@/components/shared/avatar-display";

const FACES = [
  "Angry with Fang.svg",
  "Awe.svg",
  "Blank.svg",
  "Calm.svg",
  "Cheeky.svg",
  "Concerned Fear.svg",
  "Concerned.svg",
  "Contempt.svg",
  "Cute.svg",
  "Cyclops.svg",
  "Driven.svg",
  "Eating Happy.svg",
  "Explaining.svg",
  "Eyes Closed.svg",
  "Fear.svg",
  "Hectic.svg",
  "Loving Grin 1.svg",
  "Loving Grin 2.svg",
  "Monster.svg",
  "Old.svg",
  "Rage.svg",
  "Serious.svg",
  "Smile Big.svg",
  "Smile LOL.svg",
  "Smile Teeth Gap.svg",
  "Smile.svg",
  "Solemn.svg",
  "Suspicious.svg",
  "Tired.svg",
  "Very Angry.svg",
];

const HEADS = [
  "Afro.svg",
  "Bangs 2.svg",
  "Bangs.svg",
  "Bantu Knots.svg",
  "Bear.svg",
  "Bun 2.svg",
  "Bun.svg",
  "Buns.svg",
  "Cornrows 2.svg",
  "Cornrows.svg",
  "Flat Top Long.svg",
  "Flat Top.svg",
  "Gray Bun.svg",
  "Gray Medium.svg",
  "Gray Short.svg",
  "hat-beanie.svg",
  "hat-hip.svg",
  "Hijab.svg",
  "Long Afro.svg",
  "Long Bangs.svg",
  "Long Curly.svg",
  "Long.svg",
  "Medium 1.svg",
  "Medium 2.svg",
  "Medium 3.svg",
  "Medium Bangs 2.svg",
  "Medium Bangs 3.svg",
  "Medium Bangs.svg",
  "Medium Straight.svg",
  "Mohawk 2.svg",
  "Mohawk.svg",
  "No Hair 1.svg",
  "No Hair 2.svg",
  "No Hair 3.svg",
  "Pomp.svg",
  "Shaved 1.svg",
  "Shaved 2.svg",
  "Shaved 3.svg",
  "Short 1.svg",
  "Short 2.svg",
  "Short 3.svg",
  "Short 4.svg",
  "Short 5.svg",
  "Turban.svg",
  "Twists 2.svg",
  "Twists.svg",
];

interface ProfileEditorProps {
  initialName: string;
  initialAvatar: string | null;
  /** Use dark (dashboard) styling instead of neo-brutalism */
  dark?: boolean;
}

export function ProfileEditor({
  initialName,
  initialAvatar,
  dark = false,
}: ProfileEditorProps) {
  const parsed = (() => {
    try {
      return initialAvatar
        ? (JSON.parse(initialAvatar) as { face?: string; head?: string })
        : {};
    } catch {
      return {};
    }
  })();

  const [face, setFace] = useState<string>(parsed.face ?? "");
  const [head, setHead] = useState<string>(parsed.head ?? "");
  const [displayName, setDisplayName] = useState(initialName);
  const [tab, setTab] = useState<"face" | "head">("face");
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleSave() {
    startTransition(async () => {
      setSaved(false);
      setError("");
      const fd = new FormData();
      fd.set("displayName", displayName.trim() || initialName);
      fd.set("avatar", JSON.stringify({ face, head }));
      const result = await updateProfileAction(fd);
      if (result?.error) {
        setError(result.error);
      } else {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
        router.refresh();
      }
    });
  }

  // Theme tokens
  const cardBg = dark ? "#252d3d" : "#ffffff";
  const border = dark ? "1px solid rgba(255,255,255,0.08)" : "2px solid #000";
  const shadow = dark ? "none" : "4px 4px 0 #000";
  const labelClr = dark ? "#8E8E8E" : "#52525b";
  const textClr = dark ? "#f0f2f5" : "#000000";
  const inputBg = dark ? "rgba(255,255,255,0.05)" : "#ffffff";
  const itemBg = dark ? "rgba(255,255,255,0.03)" : "#fafafa";

  const items = tab === "face" ? FACES : HEADS;
  const selected = tab === "face" ? face : head;
  const setItem = tab === "face" ? setFace : setHead;
  const category = tab === "face" ? "face" : "head";

  return (
    <div className="flex flex-col gap-5">
      {/* ── Preview + name ── */}
      <div
        className="flex items-center gap-4 p-5"
        style={{
          background: cardBg,
          border,
          borderRadius: "15px",
          boxShadow: shadow,
        }}
      >
        {/* Live avatar preview */}
        <AvatarDisplay
          avatar={JSON.stringify({ face, head })}
          name={displayName || initialName}
          size={88}
          radius={15}
        />

        <div className="flex flex-col gap-2 flex-1">
          <label
            style={{
              fontSize: "11px",
              fontWeight: 700,
              color: labelClr,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
            }}
          >
            Display Name
          </label>
          <input
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            maxLength={40}
            style={{
              background: inputBg,
              border,
              borderRadius: "15px",
              padding: "8px 14px",
              fontSize: "14px",
              fontWeight: 600,
              color: textClr,
              outline: "none",
              width: "100%",
            }}
          />
        </div>
      </div>

      {/* ── Avatar picker ── */}
      <div
        style={{
          background: cardBg,
          border,
          borderRadius: "15px",
          boxShadow: shadow,
          overflow: "hidden",
        }}
      >
        {/* Tabs */}
        <div
          className="flex"
          style={{
            borderBottom: dark
              ? "1px solid rgba(255,255,255,0.08)"
              : "2px solid #000",
          }}
        >
          {(["face", "head"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              style={{
                flex: 1,
                padding: "10px",
                fontSize: "11px",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                background: tab === t ? "#FFD700" : itemBg,
                color: tab === t ? "#1a1a1a" : labelClr,
                border: "none",
                cursor: "pointer",
                borderRight:
                  t === "face"
                    ? dark
                      ? "1px solid rgba(255,255,255,0.08)"
                      : "2px solid #000"
                    : "none",
                transition: "all 0.1s",
              }}
            >
              {t === "face" ? "Face Expression" : "Hair / Head"}
            </button>
          ))}
        </div>

        {/* Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(64px, 1fr))",
            gap: "6px",
            padding: "12px",
            maxHeight: "300px",
            overflowY: "auto",
          }}
        >
          {/* None */}
          <button
            onClick={() => setItem("")}
            title="No selection"
            style={{
              width: "64px",
              height: "64px",
              borderRadius: "15px",
              border:
                selected === ""
                  ? "2px solid #FFD700"
                  : dark
                    ? "1px solid rgba(255,255,255,0.1)"
                    : "2px solid #000",
              background: selected === "" ? "rgba(255,215,0,0.15)" : itemBg,
              cursor: "pointer",
              fontSize: "10px",
              fontWeight: 700,
              color: labelClr,
            }}
          >
            None
          </button>

          {items.map((item) => (
            <button
              key={item}
              onClick={() => setItem(item)}
              title={item.replace(".svg", "")}
              style={{
                width: "64px",
                height: "64px",
                borderRadius: "15px",
                border:
                  selected === item
                    ? "2px solid #FFD700"
                    : dark
                      ? "1px solid rgba(255,255,255,0.08)"
                      : "2px solid #d4d4d4",
                background: selected === item ? "rgba(255,215,0,0.12)" : itemBg,
                cursor: "pointer",
                padding: "4px",
                overflow: "hidden",
                transition: "border-color 0.1s",
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`/avatar/${category}/${encodeURIComponent(item)}`}
                alt={item.replace(".svg", "")}
                style={{ width: "100%", height: "100%", objectFit: "contain" }}
              />
            </button>
          ))}
        </div>
      </div>

      {/* ── Save ── */}
      <div className="flex items-center gap-3">
        <button
          onClick={handleSave}
          disabled={isPending}
          style={{
            borderRadius: "15px",
            padding: "10px 28px",
            background: "#FFD700",
            color: "#1a1a1a",
            border: "2px solid #000",
            boxShadow: "3px 3px 0 #000",
            fontWeight: 800,
            fontSize: "14px",
            cursor: isPending ? "not-allowed" : "pointer",
            opacity: isPending ? 0.7 : 1,
            transition: "all 0.1s ease",
          }}
        >
          {isPending ? "Saving…" : "Save Profile"}
        </button>
        {saved && (
          <span style={{ fontSize: "13px", fontWeight: 700, color: "#006747" }}>
            Saved!
          </span>
        )}
        {error && (
          <span style={{ fontSize: "13px", color: "#ff0050" }}>{error}</span>
        )}
      </div>
    </div>
  );
}
