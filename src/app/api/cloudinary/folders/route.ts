import { NextRequest, NextResponse } from "next/server";
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: 'dpgivqzrl',
  api_key: '855448365679894',
  api_secret: 'tKuGg8SWpRbz_6GXYo8vrAemFkA',
});

export async function GET(request: NextRequest) {
  try {
    // Get all folders from Cloudinary
    const result = await cloudinary.api.root_folders();
    
    // Transform the response to match our interface
    const folders = result.folders.map((folder: any) => ({
      name: folder.name,
      path: folder.path
    }));

    return NextResponse.json({
      folders: folders
    });

  } catch (error) {
    console.error('Cloudinary folders API error:', error);
    
    // Return default folders if API fails
    const defaultFolders = [
      { name: "traffic-signs", path: "traffic-signs" },
      { name: "road-markings", path: "road-markings" },
      { name: "vehicles", path: "vehicles" },
      { name: "emergency", path: "emergency" },
      { name: "general", path: "general" },
    ];

    return NextResponse.json({
      folders: defaultFolders
    });
  }
}