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
    console.log('Testing Cloudinary connection...');
    
    // Test the connection by getting account usage
    const result = await cloudinary.api.usage();
    
    console.log('Cloudinary connection successful:', {
      cloud_name: cloudinary.config().cloud_name,
      credits_used: result.credits?.used || 0,
      resources: result.resources || 0
    });

    return NextResponse.json({
      success: true,
      cloud_name: cloudinary.config().cloud_name,
      api_key: cloudinary.config().api_key,
      usage: {
        credits_used: result.credits?.used || 0,
        resources: result.resources || 0,
        bandwidth_used: result.bandwidth?.used || 0
      },
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
      api_key: cloudinary.config().api_key ? 'Set' : 'Not set'
    }, { status: 500 });
  }
}