import { NextRequest, NextResponse } from "next/server";

// Mock Cloudinary API response
const mockCloudinaryResponse = {
  resources: [
    {
      public_id: "traffic-signs/stop-sign",
      secure_url: "https://res.cloudinary.com/dpgivqzrl/image/upload/f_auto,q_auto/700_xjoehu",
      format: "jpg",
      width: 400,
      height: 400,
      bytes: 25600,
      created_at: "2024-03-15T10:00:00Z",
      folder: "traffic-signs"
    },
    {
      public_id: "traffic-signs/yield-sign",
      secure_url: "https://res.cloudinary.com/dpgivqzrl/image/upload/e_background_removal/f_auto,q_auto/photo_5_2026-03-15_13-28-33_iyd1g0",
      format: "png",
      width: 400,
      height: 400,
      bytes: 28800,
      created_at: "2024-03-15T10:05:00Z",
      folder: "traffic-signs"
    },
    {
      public_id: "traffic-signs/speed-limit",
      secure_url: "https://res.cloudinary.com/dpgivqzrl/image/upload/e_background_removal/f_auto,q_auto/photo_4_2026-03-15_13-28-33_dudy3h",
      format: "png",
      width: 400,
      height: 400,
      bytes: 22400,
      created_at: "2024-03-15T10:10:00Z",
      folder: "traffic-signs"
    },
    {
      public_id: "traffic-signs/warning-sign",
      secure_url: "https://res.cloudinary.com/dpgivqzrl/image/upload/e_background_removal/f_auto,q_auto/photo_1_2026-03-15_13-28-33_ftfpbi",
      format: "png",
      width: 400,
      height: 400,
      bytes: 24200,
      created_at: "2024-03-15T10:12:00Z",
      folder: "traffic-signs"
    },
    {
      public_id: "traffic-signs/no-entry",
      secure_url: "https://res.cloudinary.com/dpgivqzrl/image/upload/e_background_removal/f_auto,q_auto/photo_2_2026-03-15_13-28-33_eashrw",
      format: "png",
      width: 400,
      height: 400,
      bytes: 26800,
      created_at: "2024-03-15T10:15:00Z",
      folder: "traffic-signs"
    },
    {
      public_id: "road-markings/yellow-line",
      secure_url: "https://res.cloudinary.com/dpgivqzrl/image/upload/f_auto,q_auto/mdnmr2mxadowugm30czhnwyte2y3qtlmzwnw0so_p89tbs",
      format: "jpg",
      width: 600,
      height: 300,
      bytes: 35200,
      created_at: "2024-03-15T10:20:00Z",
      folder: "road-markings"
    }
  ],
  next_cursor: null
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const folder = searchParams.get('folder');
    const search = searchParams.get('search');

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));

    let filteredResources = mockCloudinaryResponse.resources;

    // Filter by folder if specified
    if (folder && folder !== 'all') {
      filteredResources = filteredResources.filter(resource => 
        resource.folder === folder
      );
    }

    // Filter by search term if specified
    if (search) {
      filteredResources = filteredResources.filter(resource =>
        resource.public_id.toLowerCase().includes(search.toLowerCase())
      );
    }

    return NextResponse.json({
      resources: filteredResources,
      next_cursor: null
    });

  } catch (error) {
    console.error('Cloudinary API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch images' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // This would handle image uploads to Cloudinary
    // For now, return a mock response
    return NextResponse.json({
      public_id: "uploads/new-image",
      secure_url: "https://res.cloudinary.com/dpgivqzrl/image/upload/f_auto,q_auto/700_xjoehu",
      format: "jpg",
      width: 400,
      height: 400,
      bytes: 25600,
      created_at: new Date().toISOString()
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Failed to upload image' },
      { status: 500 }
    );
  }
}