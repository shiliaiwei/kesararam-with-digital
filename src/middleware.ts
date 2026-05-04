import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Simple Rate Limiter - Emergency DDoS Protection
 * Lightweight version that can be deployed immediately
 */

const requestCounts = new Map<string, { count: number; resetAt: number }>();

function getClientIp(request: NextRequest): string {
    return (
        request.headers.get("x-real-ip") ||
        request.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
        "unknown"
    );
}

function checkRateLimit(ip: string, maxRequests: number, windowMs: number) {
    const now = Date.now();
    const entry = requestCounts.get(ip);

    if (!entry || now > entry.resetAt) {
        requestCounts.set(ip, { count: 1, resetAt: now + windowMs });
        return { allowed: true, remaining: maxRequests - 1 };
    }

    if (entry.count >= maxRequests) {
        return { allowed: false, remaining: 0 };
    }

    entry.count++;
    return { allowed: true, remaining: maxRequests - entry.count };
}

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;
    const ip = getClientIp(request);

    // Block common attack paths immediately (WordPress, PHP, etc.)
    const maliciousPaths = [
        "/wp-admin",
        "/wp-login",
        "/wp-content",
        "/wp-includes",
        "/xmlrpc.php",
        "/.env",
        "/phpmyadmin",
        "/.git",
        "/config",
        "/backup",
        ".php",
        ".asp",
        ".aspx",
    ];

    if (maliciousPaths.some((path) => pathname.toLowerCase().includes(path))) {
        console.warn(`[SECURITY] Blocked malicious path: ${pathname} from ${ip}`);
        return new Response("Not Found", { status: 404 });
    }

    // Skip static files
    if (
        pathname.startsWith("/_next") ||
        pathname.startsWith("/favicon") ||
        pathname.startsWith("/public")
    ) {
        return NextResponse.next();
    }

    // Rate limit login attempts - STRICT
    if (pathname === "/login" || pathname.startsWith("/api/auth/login")) {
        const result = checkRateLimit(ip, 5, 60000); // 5 per minute
        if (!result.allowed) {
            return new Response(JSON.stringify({ error: "Too many login attempts" }), {
                status: 429,
                headers: { "Content-Type": "application/json", "Retry-After": "60" },
            });
        }
    }

    // Rate limit API calls
    if (pathname.startsWith("/api")) {
        const result = checkRateLimit(ip, 100, 60000); // 100 per minute
        if (!result.allowed) {
            return new Response(JSON.stringify({ error: "Too many requests" }), {
                status: 429,
                headers: { "Content-Type": "application/json", "Retry-After": "60" },
            });
        }
    }

    // Rate limit all other requests
    const result = checkRateLimit(ip, 200, 60000); // 200 per minute
    if (!result.allowed) {
        return new Response(JSON.stringify({ error: "Too many requests" }), {
            status: 429,
            headers: { "Content-Type": "application/json", "Retry-After": "60" },
        });
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/((?!_next/static|_next/image|favicon.ico|public/).*)"],
};
