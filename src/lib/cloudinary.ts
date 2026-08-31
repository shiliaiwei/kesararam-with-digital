/**
 * Cloudinary URL optimizer and media URL sanitizer.
 *
 * Inserts on-the-fly transformations into a Cloudinary delivery URL so the
 * browser downloads small, modern-format images instead of full-resolution
 * originals. Safe no-op for non-Cloudinary URLs.
 *
 *  - f_auto   → best format per browser (AVIF/WebP/…)
 *  - q_auto   → automatic quality
 *  - w_<n>    → resize to target display width
 *  - c_limit  → never upscale beyond the original
 *
 * @param url   Original Cloudinary image URL.
 * @param width Target display width in px (request ~2x the CSS size for retina).
 */
export function sanitizeSafeUrl(url?: string | null): string {
    if (!url || typeof url !== "string") return "";
    const trimmed = url.trim();
    if (trimmed.startsWith("/")) {
        return encodeURI(trimmed);
    }
    try {
        const parsed = new URL(trimmed);
        if (parsed.protocol === "https:" || parsed.protocol === "http:") {
            return parsed.href;
        }
    } catch {
        return "";
    }
    return "";
}

export function cloudinaryOptimize(url: string, width = 600): string {
    if (!url || typeof url !== "string") {
        return "";
    }
    const safeUrl = sanitizeSafeUrl(url);
    if (!safeUrl) return "";
    try {
        const parsed = new URL(safeUrl);
        if (
            parsed.protocol === "https:" &&
            parsed.hostname === "res.cloudinary.com" &&
            parsed.pathname.includes("/upload/")
        ) {
            return safeUrl.replace("/upload/", `/upload/f_auto,q_auto:good,w_${width},c_limit/`);
        }
    } catch {
        // Safe fallback if not a full valid URL
    }
    return safeUrl;
}

