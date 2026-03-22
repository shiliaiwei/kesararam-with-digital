import { NextResponse } from 'next/server';
import { listFilesRecursive } from '@/lib/google-drive';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    // Check if environment variables are set
    if (!process.env.GOOGLE_DRIVE_SERVICE_ACCOUNT_EMAIL) {
      console.error('Missing GOOGLE_DRIVE_SERVICE_ACCOUNT_EMAIL');
      return NextResponse.json(
        { 
          success: false,
          error: 'Google Drive not configured',
          message: 'Service account email is missing'
        },
        { status: 500 }
      );
    }

    if (!process.env.GOOGLE_DRIVE_PRIVATE_KEY) {
      console.error('Missing GOOGLE_DRIVE_PRIVATE_KEY');
      return NextResponse.json(
        { 
          success: false,
          error: 'Google Drive not configured',
          message: 'Private key is missing'
        },
        { status: 500 }
      );
    }

    const { searchParams } = new URL(request.url);
    const folderId = searchParams.get('folderId') || process.env.GOOGLE_DRIVE_MEDIA_FOLDER_ID;

    console.log('Fetching files recursively from folder:', folderId || 'root');

    const files = await listFilesRecursive(folderId || undefined);

    console.log('Successfully fetched', files.length, 'files recursively');

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
        message: error instanceof Error ? error.message : 'Unknown error',
        details: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}
