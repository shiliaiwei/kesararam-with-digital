import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const dynamic = "force-dynamic";
export const revalidate = 3600;

export async function GET() {
  try {
    console.log("Fetching Category images from Cloudinary...");

    // Check if environment variables are set
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

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

    // Fetch from kwd prefix - return up to 200 and pick 8 random
    const result = await cloudinary.api.resources({ type: 'upload', prefix: 'kwd', max_results: 200 });
    const resources = Array.isArray(result?.resources) ? result.resources as Record<string, unknown>[] : [];
    const shuffled = [...resources].sort(() => 0.5 - Math.random());
    const selectedImages = shuffled.slice(0, 8);

    const imageUrls = selectedImages.map((resource: Record<string, unknown>) => String(resource.secure_url ?? ""));

    console.log(`Returning ${imageUrls.length} category images from kwd folder`);

    return NextResponse.json({
      images: imageUrls,
      total: imageUrls.length,
      source: "kwd folder (8 random images)",
    });
  } catch (error: unknown) {
    console.error("Error fetching Category images:", error);
    const maybeErr = typeof error === 'object' && error !== null ? error as { message?: unknown } : undefined;
    return NextResponse.json(
      {
        error: typeof maybeErr?.message === 'string' ? maybeErr.message : String(error) || "Failed to fetch images",
        details: '',
        images: [],
      },
      { status: 500 }
    );
  }
}
