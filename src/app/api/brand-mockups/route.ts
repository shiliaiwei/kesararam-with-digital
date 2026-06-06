import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const ALLOWED_MOCKUPS = [
  "tote_stationery.webp",
  "educational_blocks.webp",
  "mug_bottle.webp",
  "apparel_brand.webp",
  "desktop_app.webp",
  "corporate_stationery.webp",
];

export async function GET(req: NextRequest) {
  const file = req.nextUrl.searchParams.get("file");

  if (!file || !ALLOWED_MOCKUPS.includes(file)) {
    return NextResponse.json({ error: "File not found or forbidden" }, { status: 404 });
  }

  // Restrict download / hotlinking via Referer check
  const referer = req.headers.get("referer");
  const host = req.headers.get("host") || "";
  
  // Allow if referer matches our host, or in local development.
  // Note: we check if referer exists and includes the current host header to dynamically support previews/domains.
  const isAllowed = 
    process.env.NODE_ENV === "development" || 
    (referer && referer.includes(host));

  if (!isAllowed) {
    return NextResponse.json({ error: "Access denied" }, { status: 403 });
  }

  // Load file from server filesystem
  const filePath = path.join(process.cwd(), "brand-mockups", file);
  
  if (!fs.existsSync(filePath)) {
    return NextResponse.json({ error: "File not found on server" }, { status: 404 });
  }

  try {
    const fileBuffer = fs.readFileSync(filePath);
    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        "Content-Type": "image/webp",
        "Cache-Control": "public, max-age=31536000, immutable",
        "Content-Disposition": "inline",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (err) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
