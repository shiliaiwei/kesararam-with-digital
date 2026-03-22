/**
 * Client-safe Google Drive utilities
 * These functions don't require googleapis and can be used in client components
 */

/**
 * Get embed URL for PDFs, videos
 */
export function getEmbedUrl(fileId: string): string {
  return `https://drive.google.com/file/d/${fileId}/preview`;
}

/**
 * Get direct download URL for a file
 */
export function getDownloadUrl(fileId: string): string {
  return `https://drive.google.com/uc?export=download&id=${fileId}`;
}

/**
 * Get proxied URL for embedding Google Drive files (images, audio, video)
 * This bypasses CORS issues by routing through our API
 */
export function getProxiedUrl(fileId: string): string {
  return `/api/media/google-drive/proxy?id=${fileId}`;
}

/**
 * Extract file ID from Google Drive URL
 */
export function extractFileIdFromUrl(url: string): string | null {
  // Handle various Google Drive URL formats
  const patterns = [
    /\/file\/d\/([^\/]+)/,           // /file/d/FILE_ID
    /id=([^&]+)/,                     // ?id=FILE_ID
    /\/d\/([^\/\?]+)/,               // /d/FILE_ID
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }

  return null;
}

/**
 * Convert any Google Drive URL to proxied URL for embedding
 */
export function convertToProxiedUrl(url: string): string {
  // If it's already a proxied URL, return as is
  if (url.startsWith('/api/media/google-drive/proxy')) {
    return url;
  }

  // If it's a Google Drive URL, extract ID and convert to proxied URL
  if (url.includes('drive.google.com')) {
    const fileId = extractFileIdFromUrl(url);
    if (fileId) {
      return getProxiedUrl(fileId);
    }
  }

  // If it's not a Google Drive URL, return as is (Cloudinary, external URL, etc.)
  return url;
}

/**
 * Get viewable URL for images/videos
 */
export function getViewUrl(fileId: string): string {
  return `https://drive.google.com/uc?export=view&id=${fileId}`;
}

/**
 * Get thumbnail URL (for images)
 */
export function getThumbnailUrl(fileId: string, size: number = 200): string {
  return `https://drive.google.com/thumbnail?id=${fileId}&sz=w${size}`;
}

/**
 * Check if file is an image
 */
export function isImage(mimeType: string): boolean {
  return mimeType.startsWith('image/');
}

/**
 * Check if file is audio
 */
export function isAudio(mimeType: string): boolean {
  return mimeType.startsWith('audio/');
}

/**
 * Check if file is a PDF
 */
export function isPDF(mimeType: string): boolean {
  return mimeType === 'application/pdf';
}

/**
 * Check if file is a video
 */
export function isVideo(mimeType: string): boolean {
  return mimeType.startsWith('video/');
}

/**
 * Format file size to human readable
 */
export function formatFileSize(bytes: string | number): string {
  const size = typeof bytes === 'string' ? parseInt(bytes) : bytes;
  if (size < 1024) return size + ' B';
  if (size < 1024 * 1024) return (size / 1024).toFixed(2) + ' KB';
  if (size < 1024 * 1024 * 1024) return (size / (1024 * 1024)).toFixed(2) + ' MB';
  return (size / (1024 * 1024 * 1024)).toFixed(2) + ' GB';
}
