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

    // Fetch all resources from kwd folder
    const options: any = {
      type: "upload",
      resource_type: resourceType,
      max_results: 500,
      prefix: "kwd/", // Always fetch from kwd folder
    };

    let result;
    try {
      // Try using search API first (more powerful)
      if (search) {
        result = await cloudinary.search
          .expression(`resource_type:${resourceType} AND folder:kwd AND (filename:*${search}* OR public_id:*${search}*)`)
          .max_results(500)
          .execute();
      } else {
        // Fetch all from kwd folder
        result = await cloudinary.api.resources(options);
      }
    } catch (searchError) {
      // Fallback to basic API if search fails
      console.log("Search API failed, using basic API");
      result = await cloudinary.api.resources(options);
    }

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
      filename: resource.public_id.split("/").pop(), // Extract filename for display
    }));

    // If search term provided, filter results by filename match
    const filteredAssets = search
      ? assets.filter((asset: any) => 
          asset.filename.toLowerCase().includes(search.toLowerCase()) ||
          asset.public_id.toLowerCase().includes(search.toLowerCase())
        )
      : assets;

    return NextResponse.json({
      assets: filteredAssets,
      total: filteredAssets.length,
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
