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
  initialAvatarChangedAt?: string | null;
  role: "admin" | "teacher" | "student";
  /** dark = dashboard styling, light = public/student styling */
  dark?: boolean;
}

export function ProfileEditor({
  initialName,
  initialAvatar,
  initialAvatarChangedAt,
  role,
  dark = true,
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

  // admin/teacher → Face Expression picker
  // student        → Hair / Head picker
  const isStaff = role === "admin" || role === "teacher";

  const [face, setFace] = useState<string>(parsed.face ?? "");
  const [head, setHead] = useState<string>(parsed.head ?? "");
  const [displayName, setDisplayName] = useState(initialName);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();
  const [showWarning, setShowWarning] = useState(false);
  const router = useRouter();

  // 60-day cooldown
  const changedAt = initialAvatarChangedAt
    ? new Date(initialAvatarChangedAt)
    : null;
  const SIXTY_DAYS = 60 * 24 * 60 * 60 * 1000;
  const canChange = !changedAt || Date.now() - changedAt.getTime() > SIXTY_DAYS;
  const daysLeft =
    changedAt && !canChange
      ? Math.ceil((SIXTY_DAYS - (Date.now() - changedAt.getTime())) / 86400000)
      : 0;

  const items = isStaff ? FACES : HEADS;
  const selected = isStaff ? face : head;
  const setItem = isStaff ? setFace : setHead;
  const category = isStaff ? "face" : "head";
  const tabLabel = isStaff ? "Face Expression" : "Hair / Head";

  const avatarChanged =
    (isStaff && face !== (parsed.face ?? "")) ||
    (!isStaff && head !== (parsed.head ?? ""));

  function handleSaveClick() {
    if (avatarChanged) {
      setShowWarning(true);
      return;
    }
    doSave();
  }

  function doSave() {
    setShowWarning(false);
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
        setTimeout(() => setSaved(false), 3500);
        router.refresh();
      }
    });
  }

  // Theme tokens — NO border-radius anywhere
  const cardBg = dark ? "#111827" : "#ffffff";
  const border = dark ? "2px solid #ffffff" : "2px solid #000000";
  const shadow = dark ? "4px 4px 0 #ffffff" : "4px 4px 0 #000000";
  const labelClr = dark ? "#9ca3af" : "#000000";
  const textClr = dark ? "#f0f2f5" : "#000000";
  const inputBg = dark ? "#0d1117" : "#ffffff";
  const inputBdr = dark ? "2px solid #ffffff" : "2px solid #000000";
  const itemBg = dark ? "#0d1117" : "#f5f5f0";
  const stripeClr = "#eab308";
  const stripeBg = dark ? "#111827" : "#000000";
  const dimBdr = dark ? "rgba(255,255,255,0.15)" : "#000000";

  return (
    <>
      {/* Warning / Cooldown Modal */}
      {showWarning && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.82)",
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "16px",
          }}
        >
          <div
            style={{
              background: "#0d1117",
              border: "3px solid #eab308",
              boxShadow: "6px 6px 0 #eab308",
              padding: "28px",
              maxWidth: "400px",
              width: "100%",
            }}
          >
            {/* Caution stripe */}
            <div
              style={{
                height: "5px",
                background:
                  "repeating-linear-gradient(90deg,#eab308 0,#eab308 18px,#000 18px,#000 36px)",
                marginBottom: "20px",
              }}
            />
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                marginBottom: "14px",
              }}
            >
              <div
                style={{
                  width: "10px",
                  height: "10px",
                  background: "#eab308",
                  border: "2px solid #000",
                  flexShrink: 0,
                }}
              />
              <span
                style={{
                  fontSize: "12px",
                  fontWeight: 900,
                  color: "#eab308",
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                }}
              >
                Profile Picture Warning
              </span>
            </div>
            {!canChange ? (
              <p
                style={{
                  fontSize: "14px",
                  color: "#f0f2f5",
                  lineHeight: 1.7,
                  marginBottom: "20px",
                }}
              >
                Last changed{" "}
                <strong style={{ color: "#eab308" }}>
                  {changedAt!.toLocaleDateString()}
                </strong>
                . Wait{" "}
                <strong style={{ color: "#ef4444" }}>
                  {daysLeft} more days
                </strong>{" "}
                (60-day limit).
              </p>
            ) : (
              <p
                style={{
                  fontSize: "14px",
                  color: "#f0f2f5",
                  lineHeight: 1.7,
                  marginBottom: "20px",
                }}
              >
                You can only change your profile picture{" "}
                <strong style={{ color: "#eab308" }}>once every 60 days</strong>
                . After saving you cannot change it again for 60 days. Continue?
              </p>
            )}
            <div style={{ display: "flex", gap: "10px" }}>
              {canChange && (
                <button
                  onClick={doSave}
                  disabled={isPending}
                  style={{
                    flex: 1,
                    padding: "10px 0",
                    background: "#eab308",
                    color: "#000",
                    border: "2px solid #000",
                    boxShadow: "3px 3px 0 #000",
                    fontWeight: 900,
                    fontSize: "12px",
                    cursor: "pointer",
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                  }}
                >
                  {isPending ? "Saving..." : "Confirm"}
                </button>
              )}
              <button
                onClick={() => setShowWarning(false)}
                style={{
                  flex: 1,
                  padding: "10px 0",
                  background: "#0d1117",
                  color: "#9ca3af",
                  border: "2px solid #9ca3af",
                  boxShadow: "3px 3px 0 #9ca3af",
                  fontWeight: 700,
                  fontSize: "12px",
                  cursor: "pointer",
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                }}
              >
                {canChange ? "Cancel" : "Close"}
              </button>
            </div>
          </div>
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {/* Cooldown banner */}
        {!canChange && (
          <div
            style={{
              background: "rgba(234,179,8,0.06)",
              border: "2px solid #eab308",
              boxShadow: "3px 3px 0 #eab308",
              padding: "10px 14px",
              display: "flex",
              alignItems: "center",
              gap: "10px",
            }}
          >
            <div
              style={{
                width: "8px",
                height: "8px",
                background: "#eab308",
                flexShrink: 0,
              }}
            />
            <span
              style={{ fontSize: "13px", color: "#eab308", fontWeight: 700 }}
            >
              Avatar locked — {daysLeft} days until next change (60-day limit)
            </span>
          </div>
        )}

        {/* Preview + Display Name */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "14px",
            padding: "16px",
            background: cardBg,
            border,
            boxShadow: shadow,
          }}
        >
          <AvatarDisplay
            avatar={JSON.stringify({ face, head })}
            name={displayName || initialName}
            size={80}
            radius={0}
          />
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "6px",
              flex: 1,
            }}
          >
            <label
              style={{
                fontSize: "10px",
                fontWeight: 900,
                color: labelClr,
                textTransform: "uppercase",
                letterSpacing: "0.12em",
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
                border: inputBdr,
                padding: "8px 12px",
                fontSize: "14px",
                fontWeight: 600,
                color: textClr,
                outline: "none",
                width: "100%",
                borderRadius: 0,
              }}
            />
          </div>
        </div>

        {/* Curb marking tab label */}
        <div style={{ display: "flex", alignItems: "stretch" }}>
          <div
            style={{
              width: "6px",
              background: `repeating-linear-gradient(180deg,${stripeClr} 0,${stripeClr} 6px,${stripeBg} 6px,${stripeBg} 12px)`,
            }}
          />
          <div
            style={{
              background: stripeClr,
              border: "2px solid #000",
              borderLeft: "none",
              padding: "5px 14px",
              display: "flex",
              alignItems: "center",
            }}
          >
            <span
              style={{
                fontSize: "10px",
                fontWeight: 900,
                color: "#000",
                textTransform: "uppercase",
                letterSpacing: "0.12em",
              }}
            >
              {tabLabel}
            </span>
          </div>
        </div>

        {/* Avatar grid */}
        <div
          style={{
            background: cardBg,
            border,
            boxShadow: shadow,
            overflow: "hidden",
          }}
        >
          {/* Longitudinal road marking */}
          <div
            style={{
              height: "3px",
              background: `repeating-linear-gradient(90deg,${stripeClr} 0,${stripeClr} 20px,${cardBg} 20px,${cardBg} 40px)`,
            }}
          />
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill,minmax(64px,1fr))",
              gap: "4px",
              padding: "10px",
              maxHeight: "280px",
              overflowY: "auto",
            }}
          >
            {/* None option */}
            <button
              onClick={() => setItem("")}
              title="None"
              style={{
                width: "64px",
                height: "64px",
                border:
                  selected === ""
                    ? `2px solid ${stripeClr}`
                    : `2px solid ${dimBdr}`,
                background: selected === "" ? "rgba(234,179,8,0.15)" : itemBg,
                cursor: "pointer",
                fontSize: "10px",
                fontWeight: 700,
                color: labelClr,
                borderRadius: 0,
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
                  border:
                    selected === item
                      ? `2px solid ${stripeClr}`
                      : `2px solid ${dimBdr}`,
                  background:
                    selected === item ? "rgba(234,179,8,0.12)" : itemBg,
                  cursor: "pointer",
                  padding: "4px",
                  overflow: "hidden",
                  borderRadius: 0,
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`/avatar/${category}/${encodeURIComponent(item)}`}
                  alt={item.replace(".svg", "")}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "contain",
                  }}
                />
              </button>
            ))}
          </div>
        </div>

        {/* Save row */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            flexWrap: "wrap",
          }}
        >
          <button
            onClick={handleSaveClick}
            disabled={isPending}
            style={{
              padding: "10px 28px",
              background: "#eab308",
              color: "#000",
              border: "2px solid #000",
              boxShadow: "4px 4px 0 #000",
              fontWeight: 900,
              fontSize: "12px",
              cursor: isPending ? "not-allowed" : "pointer",
              opacity: isPending ? 0.7 : 1,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              borderRadius: 0,
            }}
          >
            {isPending ? "Saving..." : "Save Profile"}
          </button>
          {saved && (
            <span
              style={{ fontSize: "13px", fontWeight: 700, color: "#22c55e" }}
            >
              Saved!
            </span>
          )}
          {error && (
            <span
              style={{ fontSize: "13px", fontWeight: 700, color: "#ef4444" }}
            >
              {error}
            </span>
          )}
        </div>
      </div>
    </>
  );
}
