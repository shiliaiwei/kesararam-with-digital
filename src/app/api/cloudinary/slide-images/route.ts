import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function GET() {
  try {
    // Fetch all images from the "Slide" folder
    const result = await cloudinary.api.resources({
      type: "upload",
      resource_type: "image",
      prefix: "Slide/",
      max_results: 500,
    });

    // Extract just the URLs
    const imageUrls = result.resources.map((resource: any) => resource.secure_url);

    return NextResponse.json({
      images: imageUrls,
      total: imageUrls.length,
    });
  } catch (error: any) {
    console.error("Error fetching Slide images:", error);
    return NextResponse.json(
      { 
        error: error.message || "Failed to fetch images",
        images: [],
      },
      { status: 500 }
    );
  }
}

// Enable caching for 1 hour
export const revalidate = 3600;
