import { NextResponse } from 'next/server';
import { getMediaItem } from '@/lib/google-photos';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  { params }: { params: { mediaId: string } }
) {
  try {
    const mediaItem = await getMediaItem(params.mediaId);

    return NextResponse.json({ 
      success: true,
      item: mediaItem 
    });
  } catch (error) {
    console.error('Error getting media item:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to get media item',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
