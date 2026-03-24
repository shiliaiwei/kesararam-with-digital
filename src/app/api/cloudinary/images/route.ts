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
    const folder = searchParams.get("folder") || "root";
    const search = searchParams.get("search") || "";

    // Build options for fetching resources
    const options: any = {
      type: "upload",
      resource_type: "image",
      max_results: 500,
    };

    // If not root, fetch from specific folder
    if (folder !== "root") {
      options.prefix = folder;
    }

    const result = await cloudinary.api.resources(options);

    // Transform the response
    const resources = result.resources.map((resource: any) => ({
      public_id: resource.public_id,
      secure_url: resource.secure_url,
      format: resource.format,
      width: resource.width,
      height: resource.height,
      bytes: resource.bytes,
      created_at: resource.created_at,
      folder: resource.folder || "",
    }));

    return NextResponse.json({
      resources,
      total: result.resources.length,
    });
  } catch (error: any) {
    console.error("Error fetching Cloudinary images:", error);
    return NextResponse.json(
      { 
        error: error.message || "Failed to fetch images",
        details: error.error?.message || "",
        resources: [] 
      },
      { status: 500 }
    );
  }
}
