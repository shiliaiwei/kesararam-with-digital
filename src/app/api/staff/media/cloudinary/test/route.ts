import { NextRequest, NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";

export async function GET(request: NextRequest) {
  try {
    // Check environment variables
    const config = {
      cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET ? "SET" : "MISSING",
    };

    cloudinary.config({
      cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });

    // Try to fetch resources
    const result = await cloudinary.api.resources({
      type: "upload",
      max_results: 10,
    });

    return NextResponse.json({
      config,
      success: true,
      resourceCount: result.resources?.length || 0,
      resources: result.resources || [],
    });
  } catch (error: unknown) {
    console.error("Cloudinary test error:", error);
    const maybeErr = typeof error === 'object' && error !== null ? error as { message?: unknown; stack?: unknown } : undefined;
    return NextResponse.json(
      {
        config: {
          cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
          api_key: process.env.CLOUDINARY_API_KEY,
          api_secret: process.env.CLOUDINARY_API_SECRET ? "SET" : "MISSING",
        },
        error: typeof maybeErr?.message === 'string' ? maybeErr.message : String(error),
        stack: typeof maybeErr?.stack === 'string' ? maybeErr.stack : undefined,
      },
      { status: 500 }
    );
  }
}
