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
    const folder = searchParams.get("folder") || "";
    const maxResults = parseInt(searchParams.get("max_results") || "100", 10); // Reduced from 500

    // Determine resource type for Cloudinary API
    const resourceType = type === "video" ? "video" : type === "audio" ? "video" : "image";
    const allowedFormats = ALLOWED_FORMATS[type] || ALLOWED_FORMATS.image;

    try {
      // Build optimized query parameters
      const params: any = {
        type: "upload",
        resource_type: resourceType,
        max_results: Math.min(maxResults, 100), // Cap at 100 for faster response
        prefix: folder || undefined, // Filter by folder if provided
      };

      // Add search expression if provided
      if (search) {
        params.search = search;
      }

      // Single optimized fetch (no pagination loop for faster initial load)
      const result = await cloudinary.api.resources(params);

      if (!result || !result.resources || result.resources.length === 0) {
        return NextResponse.json({
          assets: [],
          total: 0,
          has_more: false,
        });
      }

      // Filter by allowed formats and transform — skip 0-byte broken assets
      const assets = result.resources
        .filter((resource: any) => {
          const format = (resource.format || "").toLowerCase();
          if (!allowedFormats.includes(format)) return false;
          if ((resource.bytes || 0) === 0) return false;
          // Client-side search filter if Cloudinary search didn't work
          if (search && !resource.public_id.toLowerCase().includes(search.toLowerCase())) {
            return false;
          }
          return true;
        })
        .map((resource: any) => {
          const pathParts = resource.public_id.split("/");
          const filename = pathParts.pop() || resource.public_id;
          const folderPath = pathParts.length > 0 ? pathParts.join("/") : "root";

          return {
            public_id: resource.public_id,
            secure_url: resource.secure_url,
            format: resource.format,
            resource_type: resource.resource_type,
            width: resource.width,
            height: resource.height,
            duration: resource.duration,
            bytes: resource.bytes,
            created_at: resource.created_at,
            filename,
            folder: folderPath,
          };
        });

      console.log(`Found ${assets.length} ${type} assets (search: "${search}", folder: "${folder}")`);

      // Set cache headers for 5 minutes (faster subsequent loads)
      const response = NextResponse.json({
        assets,
        total: assets.length,
        has_more: !!result.next_cursor,
      });

      response.headers.set("Cache-Control", "public, s-maxage=300, stale-while-revalidate=600");

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
