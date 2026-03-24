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

    // Get all folders from Cloudinary (including subfolders)
    const rootResult = await cloudinary.api.root_folders();
    
    console.log("Root folders result:", rootResult.folders?.length || 0, "folders found");
    
    const allFolders: any[] = [];
    
    // Add root folders
    for (const folder of rootResult.folders) {
      allFolders.push({
        name: folder.name,
        path: folder.path,
      });
      
      // Try to get subfolders
      try {
        const subResult = await cloudinary.api.sub_folders(folder.path);
        if (subResult.folders && subResult.folders.length > 0) {
          for (const subfolder of subResult.folders) {
            allFolders.push({
              name: `${folder.name}/${subfolder.name}`,
              path: subfolder.path,
            });
          }
        }
      } catch (subError) {
        console.log(`No subfolders in ${folder.path}`);
      }
    }

    return NextResponse.json({
      folders: allFolders,
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
