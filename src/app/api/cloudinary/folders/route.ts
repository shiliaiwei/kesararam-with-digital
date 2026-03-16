import { NextResponse } from "next/server";
import { v2 as cloudinary } from 'cloudinary';

// Define interfaces for better type safety
interface CloudinaryFolder {
  name: string;
  path: string;
}

// Configure Cloudinary with environment variables
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function GET() {
  try {
    // Check if environment variables are set
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;
    
    if (!cloudName || !apiKey || !apiSecret) {
      return NextResponse.json({
        folders: [
          { name: "Root (All Images)", path: "root" },
          { name: "Traffic Signs", path: "traffic-signs" },
          { name: "Road Markings", path: "road-markings" },
          { name: "Vehicles", path: "vehicles" },
          { name: "Emergency", path: "emergency" },
          { name: "General", path: "general" },
        ],
        total_count: 6,
        error: 'Using default folders - missing environment variables',
        details: `Missing: ${!cloudName ? 'CLOUD_NAME ' : ''}${!apiKey ? 'API_KEY ' : ''}${!apiSecret ? 'API_SECRET' : ''}`
      });
    }

    console.log('Fetching folders from Cloudinary...');

    // Try to get folders from Cloudinary
    let folders: CloudinaryFolder[] = [];
    try {
      const folderResult = await cloudinary.api.root_folders();
      folders = (folderResult.folders || []).map((folder: any) => ({
        name: folder.name,
        path: folder.path || folder.name
      }));
    } catch (folderError) {
      console.log('No folders found or folder API error:', folderError);
    }

    // Always include root folder for images without folders
    const rootFolder: CloudinaryFolder = { name: "Root (All Images)", path: "root" };
    const allFolders: CloudinaryFolder[] = [rootFolder, ...folders];

    console.log('Folders found:', allFolders.length);

    return NextResponse.json({
      folders: allFolders,
      total_count: allFolders.length
    });

  } catch (error: any) {
    console.error('Cloudinary folders API error:', error);
    
    // Return default folders if API fails
    const defaultFolders: CloudinaryFolder[] = [
      { name: "Root (All Images)", path: "root" },
      { name: "Traffic Signs", path: "traffic-signs" },
      { name: "Road Markings", path: "road-markings" },
      { name: "Vehicles", path: "vehicles" },
      { name: "Emergency", path: "emergency" },
      { name: "General", path: "general" },
    ];

    return NextResponse.json({
      folders: defaultFolders,
      total_count: defaultFolders.length,
      error: 'Using default folders due to API error',
      details: error.message || 'Unknown error'
    });
  }
}