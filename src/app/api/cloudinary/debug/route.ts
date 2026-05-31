import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";

export async function GET() {
  const config = {
    cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "MISSING",
    api_key: process.env.CLOUDINARY_API_KEY || "MISSING",
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
      sampleResources: result.resources?.slice(0, 2).map((r: any) => ({
        public_id: r.public_id,
        url: r.secure_url,
      })) || [],
    });
  } catch (error: any) {
    return NextResponse.json({
      status: "error",
      config,
      error: error.message,
      errorDetails: error.error,
      httpCode: error.http_code,
    });
  }
}
