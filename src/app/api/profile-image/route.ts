import { NextRequest, NextResponse } from "next/server";
import { verifyProfileToken } from "@/lib/signed-profile-url";

function isSafeCloudinaryUrl(urlStr: string): boolean {
  if (!urlStr || typeof urlStr !== "string") return false;
  try {
    const parsed = new URL(urlStr);
    return (
      parsed.protocol === "https:" &&
      parsed.hostname === "res.cloudinary.com" &&
      parsed.pathname.startsWith("/dpgivqzrl/")
    );
  } catch {
    return false;
  }
}

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");
  const directImageUrl = req.nextUrl.searchParams.get("imageUrl");

  let imageUrl: string;

  if (token) {
    // Token-based access (dashboard protected images)
    const payload = await verifyProfileToken(token);
    if (!payload || !isSafeCloudinaryUrl(payload.imageUrl)) {
      return NextResponse.json({ error: "Invalid, expired, or untrusted image token" }, { status: 403 });
    }
    imageUrl = payload.imageUrl;
  } else if (directImageUrl) {
    // Direct proxy for public profile page — only allow our Cloudinary domain
    if (!isSafeCloudinaryUrl(directImageUrl)) {
      return NextResponse.json({ error: "Forbidden image source" }, { status: 403 });
    }
    imageUrl = directImageUrl;
  } else {
    return NextResponse.json({ error: "Missing token or imageUrl" }, { status: 401 });
  }

  // Proxy the image — prevents direct URL exposure / download
  const imageRes = await fetch(imageUrl);
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
