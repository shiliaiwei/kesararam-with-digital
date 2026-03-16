import { NextResponse } from "next/server";
import { v2 as cloudinary } from 'cloudinary';

// Define interfaces for better type safety
interface CloudinaryStats {
  folders_count: number;
  sample_images_found: number;
  total_count: number;
}

interface SampleImage {
  public_id: string;
  secure_url: string;
  format: string;
}

// Configure Cloudinary with environment variables
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function GET() {
  try {
    console.log('Testing Cloudinary connection...');
    
    // Check if environment variables are set
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;
    
    if (!cloudName || !apiKey || !apiSecret) {
      return NextResponse.json({
        success: false,
        error: 'Missing Cloudinary environment variables',
        details: `Missing: ${!cloudName ? 'CLOUD_NAME ' : ''}${!apiKey ? 'API_KEY ' : ''}${!apiSecret ? 'API_SECRET' : ''}`,
        cloud_name: cloudName || 'NOT_SET',
        api_key: apiKey ? 'Set' : 'Not set',
        suggestion: 'Check your environment variables in production'
      }, { status: 500 });
    }
    
    // Test basic connection by searching for images (simpler than usage API)
    const images = await cloudinary.search
      .expression('resource_type:image')
      .sort_by('created_at', 'desc')
      .max_results(5)
      .execute();
    
    // Try to get folders (might be empty)
    let folders: any[] = [];
    try {
      const folderResult = await cloudinary.api.root_folders();
      folders = folderResult.folders || [];
    } catch (folderError) {
      console.log('No folders found or folder API error:', folderError);
    }

    console.log('Cloudinary connection successful:', {
      cloud_name: cloudinary.config().cloud_name,
      sample_images: images.resources?.length || 0,
      folders_count: folders.length
    });

    const stats: CloudinaryStats = {
      folders_count: folders.length,
      sample_images_found: images.resources?.length || 0,
      total_count: images.total_count || 0
    };

    const sampleImages: SampleImage[] = images.resources?.slice(0, 3).map((img: any) => ({
      public_id: img.public_id,
      secure_url: img.secure_url,
      format: img.format
    })) || [];

    return NextResponse.json({
      success: true,
      cloud_name: cloudinary.config().cloud_name,
      api_key: cloudinary.config().api_key,
      connection: 'OK',
      stats: stats,
      sample_images: sampleImages,
      folders: folders.map((f: any) => f.name),
      message: 'Cloudinary connection successful'
    });

  } catch (error: any) {
    console.error('Cloudinary connection test failed:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to connect to Cloudinary',
      details: error.message || 'Unknown error',
      http_code: error.http_code || 500,
      cloud_name: cloudinary.config().cloud_name,
      api_key: cloudinary.config().api_key ? 'Set' : 'Not set',
      suggestion: 'Check your API credentials and network connection'
    }, { status: 500 });
  }
}