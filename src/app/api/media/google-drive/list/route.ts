import { NextResponse } from 'next/server';
import { listFiles } from '@/lib/google-drive';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const folderId = searchParams.get('folderId') || process.env.GOOGLE_DRIVE_MEDIA_FOLDER_ID;

    const files = await listFiles(folderId || undefined);

    return NextResponse.json({ 
      success: true,
      files,
      count: files.length 
    });
  } catch (error) {
    console.error('Error listing Google Drive files:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to list files from Google Drive',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
