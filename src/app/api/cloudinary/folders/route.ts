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

    // Get all folders from Cloudinary
    const result = await cloudinary.api.root_folders();
    
    const folders = result.folders.map((folder: any) => ({
      name: folder.name,
      path: folder.path,
    }));

    return NextResponse.json({
      folders,
    });
  } catch (error: any) {
    console.error("Error fetching Cloudinary folders:", error);
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
