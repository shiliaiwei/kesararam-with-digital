import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";

const DASHBOARD_HOST = "dashboard.kesararamwithdigital.tech";
const MAIN_HOST = "kesararamwithdigital.tech";
const LOGIN_URL = `https://${MAIN_HOST}/login`;

// ── Rate limiter (IP-based, in-memory) ────────────────────────────────────────
const ipMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 5;
const RATE_WINDOW = 60_000; // 1 min

function checkRateLimit(ip: string): { allowed: boolean; remaining: number; resetIn: number } {
  const now = Date.now();
  const entry = ipMap.get(ip);
  if (!entry || now > entry.resetAt) {
    ipMap.set(ip, { count: 1, resetAt: now + RATE_WINDOW });
    return { allowed: true, remaining: RATE_LIMIT - 1, resetIn: RATE_WINDOW };
  }
  if (entry.count >= RATE_LIMIT) {
    return { allowed: false, remaining: 0, resetIn: entry.resetAt - now };
  }
  entry.count++;
  return { allowed: true, remaining: RATE_LIMIT - entry.count, resetIn: entry.resetAt - now };
}

// ── Role → allowed path prefixes ─────────────────────────────────────────────
const ROLE_PATHS: Record<string, string[]> = {
  admin:   ["/admin", "/api/admin", "/api/staff", "/api/teacher", "/api/public", "/api/user", "/api/cloudinary"],
  staff:   ["/staff", "/api/staff", "/api/public", "/api/user", "/api/cloudinary"],
  teacher: ["/teacher", "/api/teacher", "/api/public", "/api/user"],
  student: ["/profile", "/api/public", "/api/user"],
};

const AUTH_REQUIRED = ["/admin", "/staff", "/teacher", "/profile", "/api/admin", "/api/staff", "/api/teacher"];

const ROLE_HOME: Record<string, string> = {
  admin:   "/admin",
  staff:   "/staff/content",
  teacher: "/teacher/classes",
  student: "/profile/student",
};

function getIp(req: NextRequest): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
    req.headers.get("x-real-ip") ||
    "unknown"
  );
}

export async function proxy(req: NextRequest) {
  const { pathname, hostname } = req.nextUrl;

  // ── 1. Rate limit login ───────────────────────────────────────────────────
  if (req.method === "POST" && (pathname === "/login" || pathname.startsWith("/api/auth"))) {
    const ip = getIp(req);
    const { allowed, remaining, resetIn } = checkRateLimit(ip);

    if (!allowed) {
      const retryAfter = Math.ceil(resetIn / 1000);
      return new NextResponse(
        JSON.stringify({ error: `Too many login attempts. Try again in ${retryAfter}s.` }),
        {
          status: 429,
          headers: {
            "Content-Type": "application/json",
            "X-RateLimit-Limit": String(RATE_LIMIT),
            "X-RateLimit-Remaining": "0",
            "X-RateLimit-Reset": String(retryAfter),
            "Retry-After": String(retryAfter),
          },
        }
      );
    }
  }

  // ── 2. Verify JWT ─────────────────────────────────────────────────────────
  const token = req.cookies.get("kwd_token")?.value;
  const payload = token ? await verifyToken(token) : null;

  // ── 3. Session DB validation (production only) ────────────────────────────
  if (token && payload && process.env.NODE_ENV !== "development") {
    try {
      const { db } = await import("@/lib/db");
      const { sessions } = await import("@/db/schema/sessions");
      const { eq, and } = await import("drizzle-orm");

      const [session] = await db
        .select({ id: sessions.id, isActive: sessions.isActive })
        .from(sessions)
        .where(and(eq(sessions.token, token), eq(sessions.isActive, true)));

      if (!session) {
        const res = NextResponse.redirect(new URL(LOGIN_URL));
        res.cookies.set("kwd_token", "", { httpOnly: true, maxAge: 0, path: "/" });
        return res;
      }

      // Update last activity (fire-and-forget)
      db.update(sessions)
        .set({ lastActivityAt: new Date() })
        .where(eq(sessions.id, session.id))
        .catch(() => {});
    } catch {
      // DB unreachable — fail open
    }
  }

  const role = payload?.role;
  const isDashboard = hostname === DASHBOARD_HOST || hostname.startsWith("dashboard.");

  // ── 4. Dashboard domain ───────────────────────────────────────────────────
  if (isDashboard) {
    if (!payload) {
      const loginUrl = new URL(LOGIN_URL);
      loginUrl.searchParams.set("redirect", req.url);
      return NextResponse.redirect(loginUrl);
    }

    // Students don't use the dashboard
    if (role === "student") {
      return NextResponse.redirect(new URL("/profile/student", `https://${MAIN_HOST}`));
    }

    // Dashboard root → role home
    if (pathname === "/" && role) {
      return NextResponse.redirect(
        new URL(ROLE_HOME[role] ?? "/", `https://${DASHBOARD_HOST}`)
      );
    }

    // Role-based path enforcement
    if (role) {
      const allowed = ROLE_PATHS[role] ?? [];
      const isAllowed =
        allowed.some((p) => pathname.startsWith(p)) ||
        pathname.startsWith("/_next") ||
        pathname.startsWith("/api/public");

      if (!isAllowed) {
        return NextResponse.redirect(
          new URL(ROLE_HOME[role] ?? "/", `https://${DASHBOARD_HOST}`)
        );
      }
    }

    return NextResponse.next();
  }

  // ── 5. Main domain — protect auth-required paths ─────────────────────────
  const needsAuth = AUTH_REQUIRED.some((p) => pathname.startsWith(p));
  if (needsAuth && !payload) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("redirect", pathname);
    return NextResponse.redirect(url);
  }

  // ── 6. Root → /home ───────────────────────────────────────────────────────
  if (pathname === "/" && !isDashboard) {
    return NextResponse.redirect(new URL("/home", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|api/|.*\\.(?:png|jpg|jpeg|svg|webp|ico)).*)",
  ],
};
