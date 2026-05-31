/**
 * Renders a composite avatar (head layer + face layer) from a JSON avatar string.
 * Falls back to initials on a yellow background if no avatar is set.
 * Safe to use in both server and client components (no hooks).
 */

interface AvatarDisplayProps {
  /** Serialised JSON: { face: string; head: string } */
  avatar?: string | null;
  name: string;
  size?: number;
  /** Border radius in px (default 15) */
  radius?: number;
}

export function AvatarDisplay({
  avatar,
  name,
  size = 36,
  radius = 0,
}: AvatarDisplayProps) {
  const parsed = (() => {
    try {
      return avatar
        ? (JSON.parse(avatar) as { face?: string; head?: string })
        : null;
    } catch {
      return null;
    }
  })();

  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  if (parsed?.face || parsed?.head) {
    return (
      <div
        style={{
          width: size,
          height: size,
          borderRadius: radius,
          background: "#FFD700",
          position: "relative",
          overflow: "hidden",
          flexShrink: 0,
        }}
      >
        {parsed.head && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={`/avatar/head/${encodeURIComponent(parsed.head)}`}
            alt=""
            aria-hidden
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              objectFit: "contain",
            }}
          />
        )}
        {parsed.face && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={`/avatar/face/${encodeURIComponent(parsed.face)}`}
            alt=""
            aria-hidden
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              objectFit: "contain",
            }}
          />
        )}
      </div>
    );
  }

  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: radius,
        background: "#FFD700",
        color: "#1a1a1a",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: Math.round(size * 0.38),
        fontWeight: 800,
        flexShrink: 0,
        userSelect: "none",
      }}
    >
      {initials}
    </div>
  );
}
