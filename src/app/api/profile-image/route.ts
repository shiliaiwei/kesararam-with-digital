import { NextRequest, NextResponse } from "next/server";
import { verifyProfileToken } from "@/lib/signed-profile-url";

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
      // Reconstruct safe URL with hardcoded origin literal to eliminate SSRF taint
      const safeSearch = parsed.search ? `?${new URLSearchParams(parsed.searchParams).toString()}` : "";
      return `https://${CLOUDINARY_HOST}${encodeURI(parsed.pathname)}${safeSearch}`;
    }
  } catch {
    return null;
  }
  return null;
}

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");
  const directImageUrl = req.nextUrl.searchParams.get("imageUrl");

  let safeUrl: string | null = null;

  if (token) {
    // Token-based access (dashboard protected images)
    const payload = await verifyProfileToken(token);
    if (!payload) {
      return NextResponse.json({ error: "Invalid, expired, or untrusted image token" }, { status: 403 });
    }
    safeUrl = getValidatedCloudinaryUrl(payload.imageUrl);
  } else if (directImageUrl) {
    // Direct proxy for public profile page — only allow our Cloudinary domain
    safeUrl = getValidatedCloudinaryUrl(directImageUrl);
  } else {
    return NextResponse.json({ error: "Missing token or imageUrl" }, { status: 401 });
  }

  if (!safeUrl) {
    return NextResponse.json({ error: "Forbidden image source" }, { status: 403 });
  }

  // Proxy the image — prevents direct URL exposure / download
  const imageRes = await fetch(safeUrl);
  if (!imageRes.ok) {
    return NextResponse.json({ error: "Image not found" }, { status: 404 });
  }

  const buffer = await imageRes.arrayBuffer();
  const contentType = imageRes.headers.get("content-type") ?? "image/jpeg";

  return new NextResponse(buffer, {
    status: 200,
    headers: {
      "Content-Type": contentType,
      "Cache-Control": "no-store, no-cache, must-revalidate",
      "Content-Disposition": "inline",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
