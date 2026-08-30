/**
 * Cloudinary URL optimizer.
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
export function cloudinaryOptimize(url: string, width = 600): string {
    if (!url || typeof url !== "string") {
        return url;
    }
    try {
        const parsed = new URL(url);
        if (
            (parsed.hostname === "res.cloudinary.com" || parsed.hostname.endsWith(".res.cloudinary.com")) &&
            parsed.pathname.includes("/upload/")
        ) {
            return url.replace("/upload/", `/upload/f_auto,q_auto:good,w_${width},c_limit/`);
        }
    } catch {
        // Safe fallback if not a full valid URL
    }
    return url;
}
