/**
 * Simple in-memory rate limiter for API routes
 * Works with Vercel serverless functions
 */

interface RateLimitEntry {
    count: number;
    resetAt: number;
}

// In-memory store (resets on cold starts, which is fine for basic protection)
const store = new Map<string, RateLimitEntry>();

export function rateLimit(
    identifier: string,
    maxRequests: number = 100,
    windowMs: number = 60000 // 1 minute
): { success: boolean; remaining: number; resetTime: number } {
    const now = Date.now();
    const entry = store.get(identifier);

    // Clean up expired entries periodically
    if (Math.random() < 0.01) { // 1% chance to cleanup
        for (const [key, value] of store.entries()) {
            if (now > value.resetAt) {
                store.delete(key);
            }
        }
    }

    // Check if window has expired
    if (!entry || now > entry.resetAt) {
        store.set(identifier, {
            count: 1,
            resetAt: now + windowMs,
        });
        return {
            success: true,
            remaining: maxRequests - 1,
            resetTime: now + windowMs,
        };
    }

    // Check if limit exceeded
    if (entry.count >= maxRequests) {
        return {
            success: false,
            remaining: 0,
            resetTime: entry.resetAt,
        };
    }

    // Increment count
    entry.count++;
    return {
        success: true,
        remaining: maxRequests - entry.count,
        resetTime: entry.resetAt,
    };
}

/**
 * Get client IP from request headers
 */
export function getClientIP(request: Request): string {
    // Check various headers for IP (Vercel, Cloudflare, etc.)
    const headers = request.headers;

    return (
        headers.get("x-real-ip") ||
        headers.get("x-forwarded-for")?.split(",")[0].trim() ||
        headers.get("cf-connecting-ip") ||
        headers.get("x-vercel-forwarded-for") ||
        "unknown"
    );
}

/**
 * Create rate limit response
 */
export function createRateLimitResponse(resetTime: number) {
    const retryAfter = Math.ceil((resetTime - Date.now()) / 1000);

    return new Response(
        JSON.stringify({
            error: "Too many requests",
            message: "Rate limit exceeded. Please try again later.",
            retryAfter,
        }),
        {
            status: 429,
            headers: {
                "Content-Type": "application/json",
                "Retry-After": String(retryAfter),
                "X-RateLimit-Reset": String(Math.ceil(resetTime / 1000)),
            },
        }
    );
}