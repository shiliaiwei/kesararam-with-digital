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

    console.log("Fetching Cloudinary folders...");
    console.log("Cloudinary config:", {
      cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY ? "SET" : "MISSING",
      api_secret: process.env.CLOUDINARY_API_SECRET ? "SET" : "MISSING",
    });

    // Get all folders from Cloudinary
    const result = await cloudinary.api.root_folders();
    
    console.log("Folders result:", result.folders?.length || 0, "folders found");
    
    const folders = result.folders.map((folder: any) => ({
      name: folder.name,
      path: folder.path,
    }));

    return NextResponse.json({
      folders,
    });
  } catch (error: any) {
    console.error("Error fetching Cloudinary folders:", error);
    console.error("Error details:", {
      message: error.message,
      http_code: error.http_code,
      error: error.error,
    });
    return NextResponse.json(
      { 
        error: error.message || "Failed to fetch folders",
        details: error.error?.message || "",
        folders: [] 
      },
      { status: 500 }
    );
  }
}
