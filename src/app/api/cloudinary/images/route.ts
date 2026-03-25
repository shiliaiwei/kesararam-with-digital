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

    console.log(`Fetching images - folder: ${folder}, search: ${search}`);

    // Check environment variables
    if (!process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 
        !process.env.CLOUDINARY_API_KEY || 
        !process.env.CLOUDINARY_API_SECRET) {
      return NextResponse.json(
        { error: "Cloudinary credentials not configured", resources: [] },
        { status: 500 }
      );
    }

    let result;

    // Try different folder paths - prioritize kwd/ based on actual structure
    const folderPaths = folder === "root" 
      ? ["kwd/"]  // Only fetch from kwd/ folder for root
      : [folder.startsWith("kwd/") ? folder : `kwd/${folder}`];

    for (const path of folderPaths) {
      try {
        const options: any = {
          type: "upload",
          resource_type: "image",
          max_results: 500,
          prefix: path,
        };

        console.log(`Fetching images from path: "${path}"`);
        result = await cloudinary.api.resources(options);

        if (result.resources && result.resources.length > 0) {
          console.log(`Success! Found ${result.resources.length} images in "${path}"`);
          break;
        }
      } catch (err: any) {
        console.log(`Failed to fetch from "${path}":`, err.message);
        continue;
      }
    }

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
      folder: resource.public_id.includes("/") 
        ? resource.public_id.substring(0, resource.public_id.lastIndexOf("/"))
        : "",
    }));

    // Filter by search if provided
    const filteredResources = search
      ? resources.filter((r: any) =>
          r.public_id.toLowerCase().includes(search.toLowerCase())
        )
      : resources;

    return NextResponse.json({
      resources: filteredResources,
      total: filteredResources.length,
    });
  } catch (error: any) {
    console.error("Error fetching images:", error);
    return NextResponse.json(
      { 
        error: error.message || "Failed to fetch images",
        resources: [] 
      },
      { status: 500 }
    );
  }
}
