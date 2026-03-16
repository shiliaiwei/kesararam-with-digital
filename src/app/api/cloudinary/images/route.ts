import { NextRequest, NextResponse } from "next/server";
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary with environment variables
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const folder = searchParams.get('folder');
    const search = searchParams.get('search');

    console.log('Fetching images from Cloudinary...', { folder, search });

    let searchExpression = 'resource_type:image';
    
    // Handle folder filtering - if folder is specified and not 'all' or 'root'
    if (folder && folder !== 'all' && folder !== 'root') {
      searchExpression += ` AND folder:${folder}`;
    }
    
    // Add search term to search expression
    if (search) {
      searchExpression += ` AND public_id:*${search}*`;
    }

    console.log('Search expression:', searchExpression);

    // Fetch images from Cloudinary using the search API
    const result = await cloudinary.search
      .expression(searchExpression)
      .sort_by('created_at', 'desc')
      .max_results(50)
      .with_field('context')
      .with_field('tags')
      .execute();

    console.log('Cloudinary result:', {
      total_count: result.total_count,
      resources_count: result.resources?.length || 0
    });

    // Transform the response to match our interface
    let resources = (result.resources || []).map((resource: any) => ({
      public_id: resource.public_id,
      secure_url: resource.secure_url,
      format: resource.format,
      width: resource.width,
      height: resource.height,
      bytes: resource.bytes,
      created_at: resource.created_at,
      folder: resource.public_id.includes('/') ? resource.public_id.split('/')[0] : 'root'
    }));

    // Filter for root folder on the server side if needed
    if (folder === 'root') {
      resources = resources.filter(resource => !resource.public_id.includes('/'));
    }

    return NextResponse.json({
      resources: resources,
      next_cursor: result.next_cursor || null,
      total_count: result.total_count || resources.length
    });

  } catch (error: any) {
    console.error('Cloudinary API error:', error);
    
    // Return more detailed error information
    return NextResponse.json(
      { 
        error: 'Failed to fetch images from Cloudinary',
        details: error.message || 'Unknown error',
        code: error.http_code || 500
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const folder = formData.get('folder') as string || 'uploads';

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    console.log('Uploading file to Cloudinary...', { 
      filename: file.name, 
      size: file.size, 
      folder 
    });

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Upload to Cloudinary
    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          folder: folder,
          resource_type: 'auto',
          upload_preset: 'default_preset',
          use_filename: true,
          unique_filename: false
        },
        (error, result) => {
          if (error) {
            console.error('Cloudinary upload error:', error);
            reject(error);
          } else {
            console.log('Upload successful:', result?.public_id);
            resolve(result);
          }
        }
      ).end(buffer);
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to upload image to Cloudinary',
        details: error.message || 'Unknown error'
      },
      { status: 500 }
    );
  }
}