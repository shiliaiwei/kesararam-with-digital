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
      const rootFolders = Array.isArray(result?.folders) ? result.folders as Record<string, unknown>[] : [];
      console.log("Root folders found:", rootFolders.map((f) => String(f.name ?? "")));
      
      // Add root folders
      for (const folder of rootFolders) {
        const folderName = String(folder.name ?? "");
        const folderPath = String(folder.path ?? "");
        folders.push({
          name: folderName.toUpperCase(),
          path: folderPath,
        });

        // Get subfolders for each root folder
        try {
          const subResult = await cloudinary.api.sub_folders(folderPath);
          const subFolders = Array.isArray(subResult?.folders) ? subResult.folders as Record<string, unknown>[] : [];
          console.log(`Subfolders in ${folderPath}:`, subFolders.map((f) => String(f.name ?? "")));
          
          for (const subfolder of subFolders) {
            const subName = String(subfolder.name ?? "");
            const subPath = String(subfolder.path ?? "");
            folders.push({
              name: `${folderName}/${subName}`.toUpperCase(),
              path: subPath,
            });
          }
        } catch (subErr) {
          console.log(`No subfolders in ${folderPath}`);
        }
      }
    } catch (error) {
      console.error("Error fetching folders:", error);
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
  } catch (error: unknown) {
    console.error("Error in folders API:", error);
    const maybeErr = typeof error === 'object' && error !== null ? error as { message?: unknown } : undefined;
    return NextResponse.json(
      { 
        error: typeof maybeErr?.message === 'string' ? maybeErr.message : String(error) || "Failed to fetch folders",
        folders: [] 
      },
      { status: 500 }
    );
  }
}
