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

// Allowed file formats (no PDFs)
const ALLOWED_FORMATS = ["jpg", "jpeg", "png", "gif", "webp", "svg", "bmp", "tiff", "mp4", "webm", "mov", "avi", "mkv"];

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.id || (session.role !== "staff" && session.role !== "admin")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const resourceType = searchParams.get("type") || "image";
    const maxResults = parseInt(searchParams.get("limit") || "500");

    console.log(`Fetching resources - type: ${resourceType}, search: ${search}`);

    // Check environment variables
    if (!process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 
        !process.env.CLOUDINARY_API_KEY || 
        !process.env.CLOUDINARY_API_SECRET) {
      return NextResponse.json(
        { error: "Cloudinary credentials not configured", resources: [] },
        { status: 500 }
      );
    }

    try {
      const options: Record<string, unknown> = {
        type: "upload",
        resource_type: resourceType,
        max_results: maxResults,
      };

      // Add search query if provided
      if (search) {
        options.expression = `filename:${search}* OR public_id:${search}*`;
      }

      console.log(`Fetching all resources with options:`, options);
      const result = await cloudinary.api.resources(options);

      if (!result || !result.resources) {
        return NextResponse.json({ resources: [], total: 0 });
      }

      // Transform and filter resources - exclude PDFs and broken/empty assets
      const resources = (result.resources || [])
        .filter((resource: Record<string, unknown>) => {
          const format = String(resource.format ?? "").toLowerCase();
          if (!ALLOWED_FORMATS.includes(format)) return false;
          // Skip 0-byte assets (broken/corrupted)
          if (Number(resource.bytes ?? 0) === 0) return false;
          return true;
        })
        .map((resource: Record<string, unknown>) => {
          const public_id = String(resource.public_id ?? "");
          return {
            public_id,
            secure_url: String(resource.secure_url ?? ""),
            format: String(resource.format ?? ""),
            width: Number(resource.width ?? 0),
            height: Number(resource.height ?? 0),
            bytes: Number(resource.bytes ?? 0),
            created_at: String(resource.created_at ?? ""),
            resource_type: String(resource.resource_type ?? ""),
            type: String(resource.type ?? ""),
            folder: public_id.includes("/") ? public_id.substring(0, public_id.lastIndexOf("/")) : "root",
            filename: public_id.split("/").pop() || public_id,
          };
        });

      console.log(`Found ${resources.length} resources (filtered from ${result.resources.length})`);

      // Set no-cache headers
      const response = NextResponse.json({
        resources,
        total: resources.length,
      });

      response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0");
      response.headers.set("Pragma", "no-cache");
      response.headers.set("Expires", "0");

      return response;
    } catch (err: any) {
      console.error("Failed to fetch resources:", err.message);
      return NextResponse.json(
        { 
          error: err.message || "Failed to fetch resources",
          resources: [] 
        },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error("Error in images API:", error);
    return NextResponse.json(
      { 
        error: error.message || "Failed to fetch images",
        resources: [] 
      },
      { status: 500 }
    );
  }
}
