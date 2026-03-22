import { NextResponse } from 'next/server';
import { searchFiles } from '@/lib/google-drive';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    const folderId = searchParams.get('folderId') || process.env.GOOGLE_DRIVE_MEDIA_FOLDER_ID;

    if (!query) {
      return NextResponse.json(
        { success: false, error: 'Search query is required' },
        { status: 400 }
      );
    }

    const files = await searchFiles(query, folderId || undefined);

    return NextResponse.json({ 
      success: true,
      files,
      count: files.length,
      query 
    });
  } catch (error) {
    console.error('Error searching Google Drive files:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to search files',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
