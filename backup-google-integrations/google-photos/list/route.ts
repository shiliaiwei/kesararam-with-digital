import { NextResponse } from 'next/server';
import { listAlbums, searchMediaItems } from '@/lib/google-photos';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    // Check if environment variables are set
    if (!process.env.GOOGLE_PHOTOS_SERVICE_ACCOUNT_EMAIL) {
      console.error('Missing GOOGLE_PHOTOS_SERVICE_ACCOUNT_EMAIL');
      return NextResponse.json(
        { 
          success: false,
          error: 'Google Photos not configured',
          message: 'Service account email is missing'
        },
        { status: 500 }
      );
    }

    if (!process.env.GOOGLE_PHOTOS_PRIVATE_KEY) {
      console.error('Missing GOOGLE_PHOTOS_PRIVATE_KEY');
      return NextResponse.json(
        { 
          success: false,
          error: 'Google Photos not configured',
          message: 'Private key is missing'
        },
        { status: 500 }
      );
    }

    const { searchParams } = new URL(request.url);
    const albumId = searchParams.get('albumId');
    const type = searchParams.get('type'); // 'albums' or 'media'

    console.log('Fetching from Google Photos:', { albumId, type });

    if (type === 'albums') {
      const albums = await listAlbums();
      console.log('Successfully fetched', albums.length, 'albums');
      return NextResponse.json({ 
        success: true,
        albums,
        count: albums.length 
      });
    }

    // Fetch media items
    const mediaItems = await searchMediaItems({
      albumId: albumId || undefined,
      pageSize: 100,
    });

    console.log('Successfully fetched', mediaItems.length, 'media items');

    return NextResponse.json({ 
      success: true,
      items: mediaItems,
      count: mediaItems.length 
    });
  } catch (error) {
    console.error('Error listing Google Photos:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to list items from Google Photos',
        message: error instanceof Error ? error.message : 'Unknown error',
        details: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}
