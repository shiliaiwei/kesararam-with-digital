import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

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
      const options: any = {
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

      // Transform resources
      const resources = result.resources.map((resource: any) => ({
        public_id: resource.public_id,
        secure_url: resource.secure_url,
        format: resource.format,
        width: resource.width,
        height: resource.height,
        bytes: resource.bytes,
        created_at: resource.created_at,
        resource_type: resource.resource_type,
        type: resource.type,
        folder: resource.public_id.includes("/") 
          ? resource.public_id.substring(0, resource.public_id.lastIndexOf("/"))
          : "root",
        filename: resource.public_id.split("/").pop() || resource.public_id,
      }));

      console.log(`Found ${resources.length} resources`);

      return NextResponse.json({
        resources,
        total: resources.length,
      });
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
