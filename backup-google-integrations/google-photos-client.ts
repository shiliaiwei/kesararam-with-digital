/**
 * Client-safe Google Photos utilities
 * These functions don't require googleapis and can be used in client components
 */

/**
 * Get download URL for a Google Photos media item
 * @param baseUrl - The base URL from Google Photos API
 * @param width - Optional width
 * @param height - Optional height
 */
export function getDownloadUrl(baseUrl: string, width?: number, height?: number): string {
  let url = `${baseUrl}=d`;
  
  if (width && height) {
    url = `${baseUrl}=w${width}-h${height}`;
  } else if (width) {
    url = `${baseUrl}=w${width}`;
  } else if (height) {
    url = `${baseUrl}=h${height}`;
  }
  
  return url;
}

/**
 * Get view URL for embedding (no download)
 */
export function getViewUrl(baseUrl: string, width?: number, height?: number): string {
  if (width && height) {
    return `${baseUrl}=w${width}-h${height}`;
  } else if (width) {
    return `${baseUrl}=w${width}`;
  } else if (height) {
    return `${baseUrl}=h${height}`;
  }
  
  // Default: original size
  return `${baseUrl}=d`;
}

/**
 * Get thumbnail URL
 */
export function getThumbnailUrl(baseUrl: string, size: number = 200): string {
  return `${baseUrl}=w${size}-h${size}-c`;
}

/**
 * Extract media ID from Google Photos URL
 */
export function extractMediaIdFromUrl(url: string): string | null {
  // Handle various Google Photos URL formats
  const patterns = [
    /\/photo\/([^\/\?]+)/,           // /photo/MEDIA_ID
    /mediaId=([^&]+)/,                // ?mediaId=MEDIA_ID
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
 * Check if URL is a Google Photos URL
 */
export function isGooglePhotosUrl(url: string): boolean {
  return url.includes('googleusercontent.com') || 
         url.includes('photos.google.com') ||
         url.includes('lh3.googleusercontent.com');
}

/**
 * Check if file is an image
 */
export function isImage(mimeType: string): boolean {
  return mimeType.startsWith('image/');
}

/**
 * Check if media item is a photo
 */
export function isPhoto(item: { mimeType: string }): boolean {
  return item.mimeType.startsWith('image/');
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
export function isVideo(item: { mimeType: string }): boolean {
  return item.mimeType.startsWith('video/');
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
