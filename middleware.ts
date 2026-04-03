import { NextRequest, NextResponse } from "next/server";

// In-memory rate limit store (resets on cold start — fine for edge/serverless)
const store = new Map<string, { count: number; reset: number }>();

const LIMITS: Record<string, { max: number; window: number }> = {
  "/api/auth":   { max: 10,  window: 60_000 },  // login: 10/min
  "/api/ai":     { max: 20,  window: 60_000 },  // AI chat: 20/min
  "/api/game":   { max: 60,  window: 60_000 },  // game: 60/min
  "/api/":       { max: 100, window: 60_000 },  // all other API: 100/min
};

function getLimit(pathname: string) {
  for (const [prefix, limit] of Object.entries(LIMITS)) {
    if (pathname.startsWith(prefix)) return limit;
  }
  return null;
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (!pathname.startsWith("/api/")) return NextResponse.next();

  const limit = getLimit(pathname);
  if (!limit) return NextResponse.next();

  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    req.headers.get("x-real-ip") ??
    "unknown";

  const key = `${ip}:${pathname.split("/").slice(0, 3).join("/")}`;
  const now = Date.now();
  const entry = store.get(key);

  if (!entry || now > entry.reset) {
    store.set(key, { count: 1, reset: now + limit.window });
    return NextResponse.next();
  }

  entry.count++;

  if (entry.count > limit.max) {
    return new NextResponse(
      JSON.stringify({ error: "Too many requests. Please slow down." }),
      {
        status: 429,
        headers: {
          "Content-Type": "application/json",
          "Retry-After": String(Math.ceil(limit.window / 1000)),
          "X-RateLimit-Limit": String(limit.max),
          "X-RateLimit-Remaining": "0",
          "X-RateLimit-Reset": String(entry.reset),
        },
      }
    );
  }

  const res = NextResponse.next();
  res.headers.set("X-RateLimit-Limit", String(limit.max));
  res.headers.set("X-RateLimit-Remaining", String(limit.max - entry.count));
  return res;
}

export const config = {
  matcher: ["/api/:path*"],
};
