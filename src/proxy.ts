import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";

const DASHBOARD_HOSTNAME = "dashboard.kesararamwithdigital.tech";

const PROTECTED_ROUTES: Record<string, string[]> = {
  student: ["/profile"],
  teacher: ["/teacher"],
  admin: ["/admin"],
};

export async function proxy(req: NextRequest) {
  const { pathname, hostname } = req.nextUrl;
  const token = req.cookies.get("kwd_token")?.value;
  const payload = token ? await verifyToken(token) : null;

  // Skip database session check during build time
  if (token && payload && process.env.NODE_ENV !== "development") {
    try {
      const { db } = await import("@/lib/db");
      const { sessions } = await import("@/db/schema");
      const { eq, and } = await import("drizzle-orm");

      const [sessionRecord] = await db
        .select()
        .from(sessions)
        .where(
          and(
            eq(sessions.token, token),
            eq(sessions.isActive, true)
          )
        );

      // If session is not found or inactive, clear the cookie and redirect to login
      if (!sessionRecord || !sessionRecord.isActive) {
        const response = NextResponse.redirect(
          new URL("/login", "https://kesararamwithdigital.tech")
        );
        response.cookies.set("kwd_token", "", {
          httpOnly: true,
          maxAge: 0,
          path: "/",
        });
        return response;
      }

      // Update last activity
      try {
        await db
          .update(sessions)
          .set({ lastActivityAt: new Date() })
          .where(eq(sessions.id, sessionRecord.id));
      } catch (err) {
        // non-fatal
      }
    } catch (error) {
      console.error("Session validation error:", error);
      // Continue with request even if session check fails
    }
  }

  if (hostname === DASHBOARD_HOSTNAME || hostname.startsWith("dashboard.")) {
    if (!payload) {
      const loginUrl = new URL("/login", "https://kesararamwithdigital.tech");
      loginUrl.searchParams.set("redirect", req.url);
      return NextResponse.redirect(loginUrl);
    }
    if (payload.role === "student") {
      return NextResponse.redirect(
        new URL("/profile/student", "https://kesararamwithdigital.tech"),
      );
    }
    // Redirect authenticated users from dashboard root to their role default page
    if (pathname === "/") {
      const defaultPage =
        payload.role === "admin" ? "/admin" : "/teacher/classes";
      return NextResponse.redirect(
        new URL(defaultPage, `https://${DASHBOARD_HOSTNAME}`),
      );
    }
  }

  for (const [role, prefixes] of Object.entries(PROTECTED_ROUTES)) {
    if (prefixes.some((p) => pathname.startsWith(p))) {
      if (!payload) {
        const url = req.nextUrl.clone();
        url.pathname = "/login";
        url.searchParams.set("redirect", pathname);
        return NextResponse.redirect(url);
      }
      if (
        role !== "student" &&
        payload.role !== role &&
        payload.role !== "admin"
      ) {
        return NextResponse.redirect(new URL("/", req.url));
      }
    }
  }

  // Redirect the main-domain root to /home
  if (
    pathname === "/" &&
    hostname !== DASHBOARD_HOSTNAME &&
    !hostname.startsWith("dashboard.")
  ) {
    return NextResponse.redirect(new URL("/home", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|api/|.*\\.(?:png|jpg|jpeg|svg|webp|ico)).*)",
  ],
};
