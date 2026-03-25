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

    // Try multiple folder paths to find the correct one
    const possiblePrefixes = [
      "KWD Media/",
      "KWD%20Media/",
      "kwd/",
      "", // Try fetching all if specific folder doesn't work
    ];

    let result: any = null;
    let usedPrefix = "";

    // Try each prefix until we find one that works
    for (const prefix of possiblePrefixes) {
      try {
        console.log(`Trying prefix: "${prefix}"`);
        const options: any = {
          type: "upload",
          resource_type: resourceType,
          max_results: 500,
        };

        if (prefix) {
          options.prefix = prefix;
        }

        const testResult = await cloudinary.api.resources(options);
        
        if (testResult.resources && testResult.resources.length > 0) {
          result = testResult;
          usedPrefix = prefix;
          console.log(`Success with prefix: "${prefix}", found ${testResult.resources.length} resources`);
          break;
        }
      } catch (err) {
        console.log(`Failed with prefix: "${prefix}"`, err);
        continue;
      }
    }

    // If still no result, try search API
    if (!result && search) {
      try {
        result = await cloudinary.search
          .expression(`resource_type:${resourceType} AND (filename:*${search}* OR public_id:*${search}*)`)
          .max_results(500)
          .execute();
        usedPrefix = "search";
      } catch (searchError) {
        console.error("Search API also failed:", searchError);
      }
    }

    if (!result || !result.resources) {
      return NextResponse.json({
        assets: [],
        total: 0,
        error: "No resources found. Please check your Cloudinary folder structure.",
      });
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

    console.log(`Returning ${filteredAssets.length} assets using prefix: "${usedPrefix}"`);

    return NextResponse.json({
      assets: filteredAssets,
      total: filteredAssets.length,
      prefix_used: usedPrefix,
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
