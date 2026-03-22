import { google } from 'googleapis';

// Initialize Google Photos client with service account
function getPhotosClient() {
  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_PHOTOS_SERVICE_ACCOUNT_EMAIL,
      private_key: process.env.GOOGLE_PHOTOS_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    },
    scopes: [
      'https://www.googleapis.com/auth/photoslibrary.readonly',
      'https://www.googleapis.com/auth/photoslibrary',
    ],
  });

  // Note: Google Photos Library API doesn't have a direct googleapis client
  // We'll use the REST API directly
  return auth;
}

export interface GooglePhotosItem {
  id: string;
  productUrl: string;
  baseUrl: string;
  mimeType: string;
  filename: string;
  mediaMetadata?: {
    width?: string;
    height?: string;
    creationTime?: string;
    photo?: any;
    video?: any;
  };
}

/**
 * Make authenticated request to Google Photos API
 */
async function makePhotosRequest(endpoint: string, method: string = 'GET', body?: any) {
  try {
    const auth = getPhotosClient();
    const client = await auth.getClient();
    const accessToken = await client.getAccessToken();
    
    if (!accessToken.token) {
      throw new Error('Failed to get access token from service account');
    }
    
    const url = `https://photoslibrary.googleapis.com/v1/${endpoint}`;
    const options: RequestInit = {
      method,
      headers: {
        'Authorization': `Bearer ${accessToken.token}`,
        'Content-Type': 'application/json',
      },
    };
    
    if (body) {
      options.body = JSON.stringify(body);
    }
    
    console.log('Making request to:', url);
    const response = await fetch(url, options);
    
    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = `Google Photos API error: ${response.status}`;
      
      try {
        const errorJson = JSON.parse(errorText);
        errorMessage += ` - ${errorJson.error?.message || errorText}`;
      } catch {
        errorMessage += ` - ${errorText}`;
      }
      
      throw new Error(errorMessage);
    }
    
    return response.json();
  } catch (error) {
    console.error('Google Photos API request failed:', error);
    throw error;
  }
}

/**
 * List media items from Google Photos
 * @param albumId - Optional album ID to filter by
 * @param pageSize - Number of items to return (max 100)
 */
export async function listMediaItems(albumId?: string, pageSize: number = 100): Promise<GooglePhotosItem[]> {
  try {
    const body: any = {
      pageSize: Math.min(pageSize, 100),
    };

    if (albumId) {
      body.albumId = albumId;
    }

    const data = await makePhotosRequest('mediaItems:search', 'POST', body);
    
    return (data.mediaItems || []) as GooglePhotosItem[];
  } catch (error) {
    console.error('Error listing Google Photos media items:', error);
    throw new Error('Failed to list media items from Google Photos');
  }
}

/**
 * Search media items by filters
 */
export async function searchMediaItems(filters: {
  albumId?: string;
  mediaTypes?: ('PHOTO' | 'VIDEO')[];
  pageSize?: number;
}): Promise<GooglePhotosItem[]> {
  try {
    const body: any = {
      pageSize: Math.min(filters.pageSize || 100, 100),
    };
    
    if (filters.albumId) {
      body.albumId = filters.albumId;
    }
    
    if (filters.mediaTypes && filters.mediaTypes.length > 0) {
      body.filters = {
        mediaTypeFilter: {
          mediaTypes: filters.mediaTypes,
        },
      };
    }

    const data = await makePhotosRequest('mediaItems:search', 'POST', body);

    return (data.mediaItems || []) as GooglePhotosItem[];
  } catch (error) {
    console.error('Error searching Google Photos:', error);
    throw new Error('Failed to search media items');
  }
}

/**
 * List all albums
 */
export async function listAlbums(): Promise<Array<{ id: string; title: string; mediaItemsCount?: string }>> {
  try {
    const data = await makePhotosRequest('albums?pageSize=50', 'GET');

    return (data.albums || []).map((album: any) => ({
      id: album.id,
      title: album.title,
      mediaItemsCount: album.mediaItemsCount,
    }));
  } catch (error) {
    console.error('Error listing albums:', error);
    throw new Error('Failed to list albums');
  }
}

/**
 * Get a single media item by ID
 */
export async function getMediaItem(mediaItemId: string): Promise<GooglePhotosItem> {
  try {
    const data = await makePhotosRequest(`mediaItems/${mediaItemId}`, 'GET');

    return data as GooglePhotosItem;
  } catch (error) {
    console.error('Error getting media item:', error);
    throw new Error('Failed to get media item');
  }
}

/**
 * Get download URL for a media item
 * Google Photos baseUrl expires after 60 minutes, so we need to refresh it
 */
export function getDownloadUrl(baseUrl: string, width?: number, height?: number): string {
  // Add download parameter to baseUrl
  let url = `${baseUrl}=d`;
  
  // Optionally add size parameters
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
 * Get thumbnail URL
 */
export function getThumbnailUrl(baseUrl: string, size: number = 200): string {
  return `${baseUrl}=w${size}-h${size}-c`;
}

/**
 * Check if media item is a photo
 */
export function isPhoto(item: GooglePhotosItem): boolean {
  return item.mimeType.startsWith('image/');
}

/**
 * Check if media item is a video
 */
export function isVideo(item: GooglePhotosItem): boolean {
  return item.mimeType.startsWith('video/');
}

/**
 * Format file size (Google Photos doesn't provide size, so this is estimated)
 */
export function formatFileSize(bytes: string | number): string {
  const size = typeof bytes === 'string' ? parseInt(bytes) : bytes;
  if (size < 1024) return size + ' B';
  if (size < 1024 * 1024) return (size / 1024).toFixed(2) + ' KB';
  if (size < 1024 * 1024 * 1024) return (size / (1024 * 1024)).toFixed(2) + ' MB';
  return (size / (1024 * 1024 * 1024)).toFixed(2) + ' GB';
}
