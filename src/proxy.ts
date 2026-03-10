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

  if (pathname === "/") {
    return NextResponse.redirect(new URL("/home", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|api/|.*\\.(?:png|jpg|jpeg|svg|webp|ico)).*)",
  ],
};
