import { NextResponse } from 'next/server';
import { searchMediaItems } from '@/lib/google-photos';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    const albumId = searchParams.get('albumId');
    const mediaType = searchParams.get('mediaType'); // 'PHOTO' or 'VIDEO'

    if (!query && !mediaType) {
      return NextResponse.json(
        { success: false, error: 'Search query or media type required' },
        { status: 400 }
      );
    }

    const filters: any = {
      albumId: albumId || undefined,
      pageSize: 100,
    };

    if (mediaType) {
      filters.mediaTypes = [mediaType as 'PHOTO' | 'VIDEO'];
    }

    const items = await searchMediaItems(filters);

    // Filter by filename if query provided
    const filteredItems = query 
      ? items.filter(item => item.filename.toLowerCase().includes(query.toLowerCase()))
      : items;

    return NextResponse.json({ 
      success: true,
      items: filteredItems,
      count: filteredItems.length 
    });
  } catch (error) {
    console.error('Error searching Google Photos:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to search Google Photos',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
