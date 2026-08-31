import { NextRequest, NextResponse } from "next/server";

const CLOUDINARY_HOST = "res.cloudinary.com";
const ALLOWED_PATH_PREFIX = "/dpgivqzrl/";

function getValidatedCloudinaryUrl(urlStr: string | null | undefined): string | null {
  if (!urlStr || typeof urlStr !== "string") return null;
  try {
    const parsed = new URL(urlStr);
    if (
      parsed.protocol === "https:" &&
      parsed.hostname === CLOUDINARY_HOST &&
      parsed.pathname.startsWith(ALLOWED_PATH_PREFIX)
    ) {
      const safeSearch = parsed.search ? `?${new URLSearchParams(parsed.searchParams).toString()}` : "";
      return `https://${CLOUDINARY_HOST}${encodeURI(parsed.pathname)}${safeSearch}`;
    }
  } catch {
    return null;
  }
  return null;
}

export async function GET(req: NextRequest) {
  const imageUrl = req.nextUrl.searchParams.get("imageUrl");
  const safeUrl = getValidatedCloudinaryUrl(imageUrl);

  if (!safeUrl) {
    return NextResponse.json({ error: "Forbidden or invalid image source" }, { status: 403 });
  }

  // Redirect to verified Cloudinary CDN URL — eliminates server-side fetch (SSRF) and streams efficiently
  return NextResponse.redirect(safeUrl, {
    status: 307,
    headers: {
      "Cache-Control": "public, max-age=86400, s-maxage=86400, stale-while-revalidate=604800",
      "X-Content-Type-Options": "nosniff",
    },
  });
}

