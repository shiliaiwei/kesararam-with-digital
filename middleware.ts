import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";

const MAIN_HOST    = "kesararamwithdigital.tech";
const LOGIN_URL    = `https://${MAIN_HOST}/login`;

// ── Rate limit store ──────────────────────────────────────────────────────────
const ipMap = new Map<string, { count: number; resetAt: number }>();

const API_LIMITS: Record<string, { max: number; window: number }> = {
  "/api/auth":  { max: 10,  window: 60_000 },
  "/api/ai":    { max: 20,  window: 60_000 },
  "/api/game":  { max: 60,  window: 60_000 },
  "/api/":      { max: 100, window: 60_000 },
};

const LOGIN_RATE = { max: 5, window: 60_000 };

function rateCheck(key: string, max: number, window: number) {
  const now = Date.now();
  const e = ipMap.get(key);
  if (!e || now > e.resetAt) { ipMap.set(key, { count: 1, resetAt: now + window }); return true; }
  if (e.count >= max) return false;
  e.count++;
  return true;
}

function getIp(req: NextRequest) {
  return req.headers.get("x-forwarded-for")?.split(",")[0].trim()
    ?? req.headers.get("x-real-ip")
    ?? "unknown";
}

function tooMany(window: number) {
  return new NextResponse(
    JSON.stringify({ error: "Too many requests. Please slow down." }),
    { status: 429, headers: { "Content-Type": "application/json", "Retry-After": String(Math.ceil(window / 1000)) } }
  );
}

// ── Role config ───────────────────────────────────────────────────────────────
const ROLE_PATHS: Record<string, string[]> = {
  admin:   ["/admin", "/api/admin", "/api/staff", "/api/teacher", "/api/public", "/api/user", "/api/cloudinary"],
  staff:   ["/staff", "/api/staff", "/api/public", "/api/user", "/api/cloudinary"],
  teacher: ["/teacher", "/api/teacher", "/api/public", "/api/user"],
  student: ["/profile", "/api/public", "/api/user"],
};

const ROLE_HOME: Record<string, string> = {
  admin:   "/admin",
  staff:   "/staff/content",
  teacher: "/teacher/classes",
  student: "/profile/student",
};

const AUTH_REQUIRED = ["/admin", "/staff", "/teacher", "/profile", "/api/admin", "/api/staff", "/api/teacher"];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const ip = getIp(req);

  // ── 1. API rate limiting ──────────────────────────────────────────────────
  if (pathname.startsWith("/api/")) {
    for (const [prefix, limit] of Object.entries(API_LIMITS)) {
      if (pathname.startsWith(prefix)) {
        if (!rateCheck(`${ip}:${prefix}`, limit.max, limit.window)) return tooMany(limit.window);
        break;
      }
    }
    return NextResponse.next();
  }

  // ── 2. Login rate limit ───────────────────────────────────────────────────
  if (req.method === "POST" && pathname === "/login") {
    if (!rateCheck(`login:${ip}`, LOGIN_RATE.max, LOGIN_RATE.window)) return tooMany(LOGIN_RATE.window);
  }

  // ── 3. Root → /home ───────────────────────────────────────────────────────
  if (pathname === "/") {
    return NextResponse.redirect(new URL("/home", req.url));
  }

  // ── 4. Verify JWT ─────────────────────────────────────────────────────────
  const token = req.cookies.get("kwd_token")?.value;
  const payload = token ? await verifyToken(token) : null;

  // ── 5. Session DB validation skipped in middleware (done in API routes) ──
  // DB imports are not safe in Edge middleware — validation happens per-request in API layer.

  // ── 6. Auth-required paths ────────────────────────────────────────────────
  const needsAuth = AUTH_REQUIRED.some((p) => pathname.startsWith(p));
  if (needsAuth && !payload) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("redirect", pathname);
    return NextResponse.redirect(url);
  }

  // ── 7. Role-based path enforcement ───────────────────────────────────────
  if (payload?.role && needsAuth) {
    const allowed = ROLE_PATHS[payload.role] ?? [];
    const ok = allowed.some((p) => pathname.startsWith(p))
      || pathname.startsWith("/_next")
      || pathname.startsWith("/api/public");
    if (!ok) return NextResponse.redirect(new URL(ROLE_HOME[payload.role] ?? "/home", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|svg|webp|ico|woff2?|ttf)).*)",
  ],
};
