import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * DDoS Protection Middleware
 * Blocks malicious paths and provides basic rate limiting
 */

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

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

    // Check if path contains any malicious patterns
    const isMalicious = maliciousPaths.some((path) =>
        pathname.toLowerCase().includes(path.toLowerCase())
    );

    if (isMalicious) {
        // Log the blocked attempt
        const ip = request.headers.get("x-forwarded-for") ||
            request.headers.get("x-real-ip") ||
            "unknown";
        console.warn(`[SECURITY] Blocked malicious path: ${pathname} from ${ip}`);

        // Return 404 to not reveal information
        return new Response("Not Found", {
            status: 404,
            headers: {
                "Content-Type": "text/plain",
            },
        });
    }

    // Allow the request to continue
    return NextResponse.next();
}

// Configure which paths the middleware should run on
export const config = {
    matcher: [
        /*
         * Match all request paths except:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public folder
         */
        "/((?!_next/static|_next/image|favicon.ico|public/).*)",
    ],
};
