import { NextRequest, NextResponse } from "next/server";
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary with environment variables or fallback to your credentials
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'dpgivqzrl',
  api_key: process.env.CLOUDINARY_API_KEY || '855448365679894',
  api_secret: process.env.CLOUDINARY_API_SECRET || 'tKuGg8SWpRbz_6GXYo8vrAemFkA',
});

export async function GET(request: NextRequest) {
  try {
    console.log('Fetching folders from Cloudinary...');
    
    // Get all folders from Cloudinary
    const result = await cloudinary.api.root_folders();
    
    console.log('Cloudinary folders result:', {
      folders_count: result.folders?.length || 0
    });
    
    // Transform the response to match our interface
    const folders = (result.folders || []).map((folder: any) => ({
      name: folder.name,
      path: folder.path || folder.name
    }));

    return NextResponse.json({
      folders: folders
    });

  } catch (error: any) {
    console.error('Cloudinary folders API error:', error);
    
    // Return default folders if API fails
    const defaultFolders = [
      { name: "traffic-signs", path: "traffic-signs" },
      { name: "road-markings", path: "road-markings" },
      { name: "vehicles", path: "vehicles" },
      { name: "emergency", path: "emergency" },
      { name: "general", path: "general" },
      { name: "uploads", path: "uploads" },
    ];

    console.log('Using default folders due to API error');

    return NextResponse.json({
      folders: defaultFolders,
      error: 'Could not fetch folders from Cloudinary, using defaults',
      details: error.message || 'Unknown error'
    });
  }
}