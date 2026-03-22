import { NextResponse } from 'next/server';
import { searchMediaItems } from '@/lib/google-photos';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const albumId = searchParams.get('albumId');

    if (!albumId) {
      return NextResponse.json(
        { success: false, error: 'Album ID required' },
        { status: 400 }
      );
    }

    const items = await searchMediaItems({
      albumId,
      pageSize: 100,
    });

    // Calculate statistics
    const stats = {
      total: items.length,
      images: items.filter(item => item.mimeType.startsWith('image/')).length,
      videos: items.filter(item => item.mimeType.startsWith('video/')).length,
      audio: 0, // Google Photos doesn't support audio
      pdfs: 0,  // Google Photos doesn't support PDFs
      totalSize: 0, // Google Photos API doesn't provide file sizes
      fileTypes: {} as Record<string, number>,
    };

    // Count file types
    items.forEach(item => {
      const ext = item.filename.split('.').pop()?.toLowerCase() || 'unknown';
      stats.fileTypes[ext] = (stats.fileTypes[ext] || 0) + 1;
    });

    return NextResponse.json({ 
      success: true,
      stats 
    });
  } catch (error) {
    console.error('Error getting album stats:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to get album statistics',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
