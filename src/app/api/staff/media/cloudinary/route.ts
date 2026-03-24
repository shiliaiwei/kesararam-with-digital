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
    const type = searchParams.get("type") || "image";
    const search = searchParams.get("search") || "";

    const resourceType = type === "video" ? "video" : type === "audio" ? "video" : "image";

    // Fetch all resources including those in folders
    const options: any = {
      type: "upload",
      resource_type: resourceType,
      max_results: 500, // Increased to get more results
    };

    if (search) {
      options.prefix = search;
    }

    const result = await cloudinary.api.resources(options);

    // Transform the response to match the expected format
    const assets = result.resources.map((resource: any) => ({
      public_id: resource.public_id,
      secure_url: resource.secure_url,
      format: resource.format,
      resource_type: resource.resource_type,
      width: resource.width,
      height: resource.height,
      duration: resource.duration,
      created_at: resource.created_at,
    }));

    return NextResponse.json({
      assets,
      total: result.resources.length,
    });
  } catch (error: any) {
    console.error("Error fetching Cloudinary assets:", error);
    return NextResponse.json(
      { 
        error: error.message || "Failed to fetch assets", 
        details: error.error?.message || "",
        assets: [] 
      },
      { status: 500 }
    );
  }
}
