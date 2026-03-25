import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function GET() {
  try {
    console.log("Fetching Category images from Cloudinary...");
    
    // Check if environment variables are set
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;
    
    console.log("Config:", {
      cloud_name: cloudName || "MISSING",
      api_key: apiKey ? "SET" : "MISSING",
      api_secret: apiSecret ? "SET" : "MISSING",
    });

    if (!cloudName || !apiKey || !apiSecret) {
      console.error("Missing Cloudinary credentials");
      return NextResponse.json(
        { 
          error: "Cloudinary credentials not configured",
          details: "Please set CLOUDINARY environment variables",
          images: [],
        },
        { status: 500 }
      );
    }

    // Fetch from kwd folder - get 8 random images for categories
    console.log("Fetching category images from kwd/ folder...");
    const result = await cloudinary.api.resources({
      type: "upload",
      resource_type: "image",
      prefix: "kwd/",
      max_results: 100,
    });

    // Get 8 random images
    const shuffled = [...result.resources].sort(() => 0.5 - Math.random());
    const selectedImages = shuffled.slice(0, 8);
    
    const imageUrls = selectedImages.map((resource: any) => resource.secure_url);

    console.log(`Returning ${imageUrls.length} category images from kwd folder`);

    return NextResponse.json({
      images: imageUrls,
      total: imageUrls.length,
      source: "kwd folder (8 random images)",
    });
  } catch (error: any) {
    console.error("Error fetching Category images:", error);
    console.error("Error details:", {
      message: error.message,
      http_code: error.http_code,
      error: error.error,
    });
    return NextResponse.json(
      { 
        error: error.message || "Failed to fetch images",
        details: error.error?.message || "",
        images: [],
      },
      { status: 500 }
    );
  }
}

// Enable caching for 1 hour
export const revalidate = 3600;
