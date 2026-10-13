import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";

export async function GET() {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const config = {
    cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "MISSING",
    api_key: process.env.CLOUDINARY_API_KEY ? "SET (hidden)" : "MISSING",
    api_secret: process.env.CLOUDINARY_API_SECRET ? "SET (hidden)" : "MISSING",
  };

  try {
    cloudinary.config({
      cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });

    // Try to fetch a few resources
    const result = await cloudinary.api.resources({
      type: "upload",
      max_results: 5,
    });

    return NextResponse.json({
      status: "success",
      config,
      resourceCount: result.resources?.length || 0,
      sampleResources: (result.resources?.slice(0, 2) || []).map((r: Record<string, unknown>) => ({
          public_id: String(r.public_id ?? ""),
          url: String(r.secure_url ?? ""),
        })),
    });
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      const errObj = error && typeof error === 'object' ? error as Record<string, unknown> : {};
      return NextResponse.json({
        status: "error",
        config,
        error: msg,
        errorDetails: String(errObj.error ?? ""),
        httpCode: errObj.http_code ?? null,
      });
    }
}
