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

    // Determine resource type for Cloudinary API
    const resourceType = type === "video" ? "video" : type === "audio" ? "video" : "image";
    const allowedFormats = ALLOWED_FORMATS[type] || ALLOWED_FORMATS.image;

    try {
      // Fetch ALL resources using pagination (Cloudinary max_results cap is 500 per page)
      let allResources: any[] = [];
      let nextCursor: string | undefined = undefined;

      do {
        const params: any = {
          type: "upload",
          resource_type: resourceType,
          max_results: 500,
        };
        if (nextCursor) params.next_cursor = nextCursor;

        const result = await cloudinary.api.resources(params);

        if (!result || !result.resources) break;
        allResources = allResources.concat(result.resources);
        nextCursor = result.next_cursor;
      } while (nextCursor);

      if (allResources.length === 0) {
        return NextResponse.json({
          assets: [],
          total: 0,
        });
      }

      // Filter by allowed formats and transform — skip 0-byte broken assets
      const assets = allResources
        .filter((resource: any) => {
          const format = (resource.format || "").toLowerCase();
          if (!allowedFormats.includes(format)) return false;
          if ((resource.bytes || 0) === 0) return false;
          return true;
        })
        .map((resource: any) => {
          const pathParts = resource.public_id.split("/");
          const filename = pathParts.pop() || resource.public_id;
          const folder = pathParts.length > 0 ? pathParts.join("/") : "root";

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
            folder,
          };
        });

      console.log(`Found ${assets.length} ${type} assets (fetched ${allResources.length} total from Cloudinary)`);

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
