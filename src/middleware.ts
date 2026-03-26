import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";

const DASHBOARD_HOSTNAME = "dashboard.kesararamwithdigital.tech";

// In-memory rate limiter (per IP, resets on cold start — good enough for Edge)
// For production scale, replace with Redis/Upstash
const loginAttempts = new Map<string, { count: number; resetAt: number }>();

const RATE_LIMIT = 5;        // max attempts
const RATE_WINDOW = 60_000;  // 1 minute window

function getRateLimit(ip: string): { allowed: boolean; remaining: number; resetIn: number } {
  const now = Date.now();
  const entry = loginAttempts.get(ip);

  if (!entry || now > entry.resetAt) {
    loginAttempts.set(ip, { count: 1, resetAt: now + RATE_WINDOW });
    return { allowed: true, remaining: RATE_LIMIT - 1, resetIn: RATE_WINDOW };
  }

  if (entry.count >= RATE_LIMIT) {
    return { allowed: false, remaining: 0, resetIn: entry.resetAt - now };
  }

  entry.count++;
  return { allowed: true, remaining: RATE_LIMIT - entry.count, resetIn: entry.resetAt - now };
}

const PROTECTED_ROUTES: Record<string, string[]> = {
  student: ["/profile"],
  teacher: ["/teacher"],
  admin: ["/admin"],
};

export async function middleware(req: NextRequest) {
  const { pathname, hostname } = req.nextUrl;

  // ── Rate limit login endpoint ──────────────────────────────────────────────
  if (pathname === "/api/auth/login" || pathname.startsWith("/_next") === false && pathname === "/login") {
    if (req.method === "POST") {
      const ip =
        req.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
        req.headers.get("x-real-ip") ||
        "unknown";

      const { allowed, remaining, resetIn } = getRateLimit(ip);

      if (!allowed) {
        return new NextResponse(
          JSON.stringify({ error: "Too many login attempts. Please wait before trying again." }),
          {
            status: 429,
            headers: {
              "Content-Type": "application/json",
              "X-RateLimit-Limit": String(RATE_LIMIT),
              "X-RateLimit-Remaining": "0",
              "X-RateLimit-Reset": String(Math.ceil(resetIn / 1000)),
              "Retry-After": String(Math.ceil(resetIn / 1000)),
            },
          }
        );
      }

      const res = NextResponse.next();
      res.headers.set("X-RateLimit-Limit", String(RATE_LIMIT));
      res.headers.set("X-RateLimit-Remaining", String(remaining));
      res.headers.set("X-RateLimit-Reset", String(Math.ceil(resetIn / 1000)));
      return res;
    }
  }

  // ── Auth & routing ─────────────────────────────────────────────────────────
  const token = req.cookies.get("kwd_token")?.value;
  const payload = token ? await verifyToken(token) : null;

  // Session DB check (production only — skip on dev/build)
  if (token && payload && process.env.NODE_ENV === "production") {
    try {
      const { db } = await import("@/lib/db");
      const { sessions } = await import("@/db/schema/sessions");
      const { eq, and } = await import("drizzle-orm");

      const [sessionRecord] = await db
        .select()
        .from(sessions)
        .where(and(eq(sessions.token, token), eq(sessions.isActive, true)));

      if (!sessionRecord) {
        const response = NextResponse.redirect(
          new URL("/login", "https://kesararamwithdigital.tech")
        );
        response.cookies.set("kwd_token", "", { httpOnly: true, maxAge: 0, path: "/" });
        return response;
      }

      // Update last activity (non-blocking)
      db.update(sessions)
        .set({ lastActivityAt: new Date() })
        .where(eq(sessions.id, sessionRecord.id))
        .catch(() => {});
    } catch {
      // non-fatal — continue
    }
  }

  // Dashboard routing
  if (hostname === DASHBOARD_HOSTNAME || hostname.startsWith("dashboard.")) {
    if (!payload) {
      const loginUrl = new URL("/login", "https://kesararamwithdigital.tech");
      loginUrl.searchParams.set("redirect", req.url);
      return NextResponse.redirect(loginUrl);
    }
    if (payload.role === "student") {
      return NextResponse.redirect(
        new URL("/profile/student", "https://kesararamwithdigital.tech")
      );
    }
    if (pathname === "/") {
      return NextResponse.redirect(
        new URL(payload.role === "admin" ? "/admin" : "/teacher/classes",
          `https://${DASHBOARD_HOSTNAME}`)
      );
    }
  }

  // Protected route guards
  for (const [role, prefixes] of Object.entries(PROTECTED_ROUTES)) {
    if (prefixes.some((p) => pathname.startsWith(p))) {
      if (!payload) {
        const url = req.nextUrl.clone();
        url.pathname = "/login";
        url.searchParams.set("redirect", pathname);
        return NextResponse.redirect(url);
      }
      if (role !== "student" && payload.role !== role && payload.role !== "admin") {
        return NextResponse.redirect(new URL("/", req.url));
      }
    }
  }

  // Root redirect
  if (pathname === "/" && hostname !== DASHBOARD_HOSTNAME && !hostname.startsWith("dashboard.")) {
    return NextResponse.redirect(new URL("/home", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|svg|webp|ico)).*)",
  ],
};
