import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const dynamic = "force-dynamic";
export const revalidate = 0;

// Allowed formats by type
const ALLOWED_FORMATS: Record<string, string[]> = {
  image: ["jpg", "jpeg", "png", "gif", "webp", "svg", "bmp", "tiff"],
  audio: ["mp3", "wav", "m4a", "aac", "ogg", "flac", "wma"],
  video: ["mp4", "webm", "mov", "avi", "mkv", "flv", "wmv"],
};

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.id || (session.role !== "staff" && session.role !== "admin")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type") || "image";
    const search = searchParams.get("search") || "";

    // Determine resource type for Cloudinary API
    const resourceType = type === "video" ? "video" : type === "audio" ? "video" : "image";
    const allowedFormats = ALLOWED_FORMATS[type] || ALLOWED_FORMATS.image;

    console.log(`Fetching ${type} assets - search: "${search}"`);

    try {
      const options: any = {
        type: "upload",
        resource_type: resourceType,
        max_results: 500,
      };

      // Add search query if provided
      if (search) {
        options.expression = `filename:${search}* OR public_id:${search}*`;
      }

      console.log(`Fetching resources with options:`, options);
      const result = await cloudinary.api.resources(options);

      if (!result || !result.resources) {
        return NextResponse.json({
          assets: [],
          total: 0,
        });
      }

      // Filter by allowed formats and transform
      const assets = result.resources
        .filter((resource: any) => {
          const format = (resource.format || "").toLowerCase();
          return allowedFormats.includes(format);
        })
        .map((resource: any) => ({
          public_id: resource.public_id,
          secure_url: resource.secure_url,
          format: resource.format,
          resource_type: resource.resource_type,
          width: resource.width,
          height: resource.height,
          duration: resource.duration,
          bytes: resource.bytes,
          created_at: resource.created_at,
          filename: resource.public_id.split("/").pop() || resource.public_id,
        }));

      console.log(`Found ${assets.length} ${type} assets (filtered from ${result.resources.length})`);

      // Set no-cache headers
      const response = NextResponse.json({
        assets,
        total: assets.length,
      });

      response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0");
      response.headers.set("Pragma", "no-cache");
      response.headers.set("Expires", "0");

      return response;
    } catch (err: any) {
      console.error("Failed to fetch resources:", err.message);
      return NextResponse.json(
        { 
          error: err.message || "Failed to fetch assets",
          assets: [] 
        },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error("Error in staff media cloudinary API:", error);
    return NextResponse.json(
      { 
        error: error.message || "Failed to fetch assets", 
        assets: [] 
      },
      { status: 500 }
    );
  }
}
