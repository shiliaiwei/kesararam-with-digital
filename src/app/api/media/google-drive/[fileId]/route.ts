import { NextResponse } from 'next/server';
import { getFileMetadata, getAppropriateUrl } from '@/lib/google-drive';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  { params }: { params: { fileId: string } }
) {
  try {
    const metadata = await getFileMetadata(params.fileId);
    const url = getAppropriateUrl(metadata);

    return NextResponse.json({
      success: true,
      file: {
        ...metadata,
        url,
      },
    });
  } catch (error) {
    console.error('Error getting file metadata:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to get file metadata',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
