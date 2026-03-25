import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function GET() {
  try {
    const session = await getSession();
    if (!session?.id || (session.role !== "staff" && session.role !== "admin")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log("Fetching folders from Cloudinary...");

    // Check environment variables
    if (!process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 
        !process.env.CLOUDINARY_API_KEY || 
        !process.env.CLOUDINARY_API_SECRET) {
      return NextResponse.json(
        { error: "Cloudinary credentials not configured", folders: [] },
        { status: 500 }
      );
    }

    // Try to get folders
    let folders: FolderItem[] = [];

    try {
      // First, try to get root folders
      const result = await cloudinary.api.root_folders();
      console.log("Root folders found:", result.folders.map((f: any) => f.name));
      
      // For each root folder, get its subfolders
      for (const folder of result.folders) {
        try {
          const subResult = await cloudinary.api.sub_folders(folder.path);
          console.log(`Subfolders in ${folder.path}:`, subResult.folders.map((f: any) => f.name));
          
          // Add subfolders with proper paths
          for (const subfolder of subResult.folders) {
            folders.push({
              name: subfolder.name.toUpperCase(),
              path: subfolder.path,
            });
          }
        } catch (subErr) {
          console.log(`No subfolders in ${folder.path}`);
        }
      }
    } catch (error: any) {
      console.error("Error fetching folders:", error.message);
    }

    // If no folders found, return empty array (will show "All Images" only)
    console.log(`Returning ${folders.length} folders`);

    return NextResponse.json({
      folders,
      total: folders.length,
    });
  } catch (error: any) {
    console.error("Error in folders API:", error);
    return NextResponse.json(
      { 
        error: error.message || "Failed to fetch folders",
        folders: [] 
      },
      { status: 500 }
    );
  }
}
