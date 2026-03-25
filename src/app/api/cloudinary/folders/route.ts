import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const session = await getSession();
    if (!session?.id || (session.role !== "staff" && session.role !== "admin")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log("Fetching all folders from Cloudinary...");

    // Check environment variables
    if (!process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 
        !process.env.CLOUDINARY_API_KEY || 
        !process.env.CLOUDINARY_API_SECRET) {
      return NextResponse.json(
        { error: "Cloudinary credentials not configured", folders: [] },
        { status: 500 }
      );
    }

    // Get all root folders
    let folders: Array<{ name: string; path: string }> = [];

    try {
      const result = await cloudinary.api.root_folders();
      console.log("Root folders found:", result.folders.map((f: any) => f.name));
      
      // Add root folders
      for (const folder of result.folders) {
        folders.push({
          name: folder.name.toUpperCase(),
          path: folder.path,
        });

        // Get subfolders for each root folder
        try {
          const subResult = await cloudinary.api.sub_folders(folder.path);
          console.log(`Subfolders in ${folder.path}:`, subResult.folders.map((f: any) => f.name));
          
          for (const subfolder of subResult.folders) {
            folders.push({
              name: `${folder.name}/${subfolder.name}`.toUpperCase(),
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

    console.log(`Returning ${folders.length} folders`);

    const response = NextResponse.json({
      folders,
      total: folders.length,
    });

    // Set no-cache headers
    response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0");
    response.headers.set("Pragma", "no-cache");
    response.headers.set("Expires", "0");

    return response;
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
