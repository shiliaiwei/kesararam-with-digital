import { NextResponse } from 'next/server';
import { listFilesRecursive } from '@/lib/google-drive';
import { isImage, isAudio, isPDF, isVideo } from '@/lib/google-drive-client';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const folderId = searchParams.get('folderId');

    if (!folderId) {
      return NextResponse.json(
        { success: false, error: 'Folder ID is required' },
        { status: 400 }
      );
    }

    // Get all files recursively from the folder
    const files = await listFilesRecursive(folderId);

    // Calculate statistics
    const stats = {
      total: files.length,
      images: files.filter(f => isImage(f.mimeType)).length,
      audio: files.filter(f => isAudio(f.mimeType)).length,
      pdfs: files.filter(f => isPDF(f.mimeType)).length,
      videos: files.filter(f => isVideo(f.mimeType)).length,
      totalSize: files.reduce((sum, f) => sum + (f.size ? parseInt(f.size) : 0), 0),
      
      // File type breakdown
      fileTypes: {} as Record<string, number>,
    };

    // Count file extensions
    files.forEach(file => {
      const ext = file.name.split('.').pop()?.toLowerCase() || 'unknown';
      stats.fileTypes[ext] = (stats.fileTypes[ext] || 0) + 1;
    });

    return NextResponse.json({ 
      success: true,
      stats,
      folderId
    });
  } catch (error) {
    console.error('Error getting folder stats:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to get folder statistics',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
