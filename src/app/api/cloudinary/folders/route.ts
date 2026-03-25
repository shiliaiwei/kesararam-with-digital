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
    let folders: any[] = [];

    try {
      const result = await cloudinary.api.root_folders();
      console.log("Root folders:", result.folders);
      
      // Get subfolders for each root folder
      for (const folder of result.folders) {
        try {
          const subResult = await cloudinary.api.sub_folders(folder.path);
          console.log(`Subfolders for ${folder.path}:`, subResult.folders);
          
          folders.push({
            name: folder.name,
            path: folder.path,
          });

          // Add subfolders
          for (const subfolder of subResult.folders) {
            folders.push({
              name: `${folder.name}/${subfolder.name}`,
              path: subfolder.path,
            });
          }
        } catch (subErr) {
          console.log(`No subfolders for ${folder.path}`);
          folders.push({
            name: folder.name,
            path: folder.path,
          });
        }
      }
    } catch (error) {
      console.error("Error fetching folders:", error);
      // Return default folders if API fails
      folders = [
        { name: "KWD MEDIA/1. ROAD SIGNS", path: "KWD Media/1. Road Signs" },
        { name: "KWD MEDIA/2. ROAD TRAFFIC", path: "KWD Media/2. Road Traffic" },
        { name: "KWD MEDIA/3. PRIORITY (RIGHT OF WAY)", path: "KWD Media/3. Priority (Right of Way)" },
        { name: "KWD MEDIA/7. GENERAL KNOWLEDGE", path: "KWD Media/7. General Knowledge" },
        { name: "KWD MEDIA/8. EMERGENCY SITUATIONS", path: "KWD Media/8. Emergency Situations" },
        { name: "KWD MEDIA/PUZZLE", path: "KWD Media/puzzle" },
        { name: "KWD MEDIA/SLIDE", path: "KWD Media/slide" },
        { name: "HOMEPAGE", path: "homepage" },
        { name: "LOGO", path: "logo" },
        { name: "SECTION", path: "section" },
      ];
    }

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
