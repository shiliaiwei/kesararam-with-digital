import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
    const pathname = request.nextUrl.pathname;

    // Block WordPress and malicious paths
    if (
        pathname.includes("/wp-") ||
        pathname.includes(".php") ||
        pathname.includes("/.env") ||
        pathname.includes("/phpmyadmin") ||
        pathname.includes("/.git")
    ) {
        return new Response("Not Found", { status: 404 });
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};