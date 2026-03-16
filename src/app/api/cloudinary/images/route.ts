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
    const { searchParams } = new URL(request.url);
    const folder = searchParams.get('folder');
    const search = searchParams.get('search');

    // Build Cloudinary search options
    const options: any = {
      resource_type: 'image',
      max_results: 50,
      sort_by: [['created_at', 'desc']],
    };

    // Add folder filter if specified
    if (folder && folder !== 'all') {
      options.prefix = folder + '/';
    }

    // Fetch images from Cloudinary
    const result = await cloudinary.search
      .expression(search ? `filename:*${search}*` : 'resource_type:image')
      .sort_by('created_at', 'desc')
      .max_results(50)
      .execute();

    // Transform the response to match our interface
    const resources = result.resources.map((resource: any) => ({
      public_id: resource.public_id,
      secure_url: resource.secure_url,
      format: resource.format,
      width: resource.width,
      height: resource.height,
      bytes: resource.bytes,
      created_at: resource.created_at,
      folder: resource.public_id.includes('/') ? resource.public_id.split('/')[0] : 'root'
    }));

    // Filter by folder if specified (additional client-side filtering)
    let filteredResources = resources;
    if (folder && folder !== 'all') {
      filteredResources = resources.filter((resource: any) => 
        resource.folder === folder
      );
    }

    return NextResponse.json({
      resources: filteredResources,
      next_cursor: result.next_cursor || null,
      total_count: result.total_count || filteredResources.length
    });

  } catch (error) {
    console.error('Cloudinary API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch images from Cloudinary' },
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

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Upload to Cloudinary
    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          folder: folder,
          resource_type: 'auto',
          upload_preset: 'default_preset'
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      ).end(buffer);
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Failed to upload image to Cloudinary' },
      { status: 500 }
    );
  }
}