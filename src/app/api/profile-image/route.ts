import { NextRequest, NextResponse } from "next/server";
import { verifyProfileToken } from "@/lib/signed-profile-url";

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");

  if (!token) {
    return NextResponse.json({ error: "Missing token" }, { status: 401 });
  }

  const payload = await verifyProfileToken(token);
  if (!payload) {
    return NextResponse.json({ error: "Invalid or expired token" }, { status: 403 });
  }

  // Proxy the Cloudinary image — prevents direct URL exposure / download
  const imageRes = await fetch(payload.imageUrl);
  if (!imageRes.ok) {
    return NextResponse.json({ error: "Image not found" }, { status: 404 });
  }

  const buffer = await imageRes.arrayBuffer();
  const contentType = imageRes.headers.get("content-type") ?? "image/jpeg";

  return new NextResponse(buffer, {
    status: 200,
    headers: {
      "Content-Type": contentType,
      // Prevent browser caching and downloading
      "Cache-Control": "no-store, no-cache, must-revalidate",
      "Content-Disposition": "inline",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
