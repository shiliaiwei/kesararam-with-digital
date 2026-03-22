import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { listAlbumsOAuth, searchMediaItemsOAuth } from '@/lib/google-photos-oauth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    // Get access token from cookies
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('google_access_token')?.value;

    if (!accessToken) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Not authenticated',
          message: 'Please sign in with Google first',
          needsAuth: true,
        },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const albumId = searchParams.get('albumId');
    const type = searchParams.get('type');

    if (type === 'albums') {
      const albums = await listAlbumsOAuth(accessToken);
      return NextResponse.json({ 
        success: true,
        albums,
        count: albums.length 
      });
    }

    // Fetch media items
    const mediaItems = await searchMediaItemsOAuth(accessToken, albumId || undefined);

    return NextResponse.json({ 
      success: true,
      items: mediaItems,
      count: mediaItems.length 
    });
  } catch (error) {
    console.error('Error listing Google Photos:', error);
    
    // Check if it's an auth error
    if (error instanceof Error && error.message.includes('401')) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Authentication expired',
          message: 'Please sign in with Google again',
          needsAuth: true,
        },
        { status: 401 }
      );
    }
    
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to list items from Google Photos',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
