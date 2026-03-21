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
    if (!session?.id || session.role !== "staff") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type") || "image";
    const search = searchParams.get("search") || "";

    const resourceType = type === "video" ? "video" : type === "audio" ? "video" : "image";

    const result = await cloudinary.search
      .expression(
        search
          ? `resource_type:${resourceType} AND ${search}`
          : `resource_type:${resourceType}`
      )
      .sort_by("created_at", "desc")
      .max_results(50)
      .execute();

    return NextResponse.json({
      assets: result.resources || [],
      total: result.total_count || 0,
    });
  } catch (error) {
    console.error("Error fetching Cloudinary assets:", error);
    return NextResponse.json(
      { error: "Failed to fetch assets", assets: [] },
      { status: 500 }
    );
  }
}
