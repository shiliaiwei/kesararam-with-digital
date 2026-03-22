import { google } from 'googleapis';

// Initialize Google Drive client with service account
function getDriveClient() {
  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_DRIVE_SERVICE_ACCOUNT_EMAIL,
      private_key: process.env.GOOGLE_DRIVE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    },
    scopes: ['https://www.googleapis.com/auth/drive.readonly'],
  });

  return google.drive({ version: 'v3', auth });
}

export interface GoogleDriveFile {
  id: string;
  name: string;
  mimeType: string;
  size?: string;
  thumbnailLink?: string;
  webViewLink?: string;
  webContentLink?: string;
  createdTime?: string;
  modifiedTime?: string;
}

/**
 * List files in a specific folder
 */
export async function listFiles(folderId?: string): Promise<GoogleDriveFile[]> {
  try {
    const drive = getDriveClient();
    
    const query = folderId 
      ? `'${folderId}' in parents and trashed=false`
      : 'trashed=false';

    const response = await drive.files.list({
      q: query,
      fields: 'files(id, name, mimeType, size, thumbnailLink, webViewLink, webContentLink, createdTime, modifiedTime)',
      orderBy: 'name',
      pageSize: 100,
    });

    return (response.data.files || []) as GoogleDriveFile[];
  } catch (error) {
    console.error('Error listing Google Drive files:', error);
    throw new Error('Failed to list files from Google Drive');
  }
}

/**
 * Get file metadata by ID
 */
export async function getFileMetadata(fileId: string): Promise<GoogleDriveFile> {
  try {
    const drive = getDriveClient();
    
    const response = await drive.files.get({
      fileId,
      fields: 'id, name, mimeType, size, thumbnailLink, webViewLink, webContentLink, createdTime, modifiedTime',
    });

    return response.data as GoogleDriveFile;
  } catch (error) {
    console.error('Error getting file metadata:', error);
    throw new Error('Failed to get file metadata');
  }
}

/**
 * Search files by name or query
 */
export async function searchFiles(query: string, folderId?: string): Promise<GoogleDriveFile[]> {
  try {
    const drive = getDriveClient();
    
    const folderQuery = folderId ? `'${folderId}' in parents and ` : '';
    const searchQuery = `${folderQuery}name contains '${query}' and trashed=false`;

    const response = await drive.files.list({
      q: searchQuery,
      fields: 'files(id, name, mimeType, size, thumbnailLink, webViewLink, webContentLink)',
      orderBy: 'name',
      pageSize: 50,
    });

    return (response.data.files || []) as GoogleDriveFile[];
  } catch (error) {
    console.error('Error searching files:', error);
    throw new Error('Failed to search files');
  }
}

/**
 * Get direct download URL for a file
 */
export function getDownloadUrl(fileId: string): string {
  return `https://drive.google.com/uc?export=download&id=${fileId}`;
}

/**
 * Get viewable URL for images/videos
 */
export function getViewUrl(fileId: string): string {
  return `https://drive.google.com/uc?export=view&id=${fileId}`;
}

/**
 * Get embed URL for PDFs, videos
 */
export function getEmbedUrl(fileId: string): string {
  return `https://drive.google.com/file/d/${fileId}/preview`;
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
 * Get appropriate URL based on file type
 */
export function getAppropriateUrl(file: GoogleDriveFile): string {
  if (isImage(file.mimeType) || isAudio(file.mimeType)) {
    return getViewUrl(file.id);
  }
  if (isPDF(file.mimeType) || isVideo(file.mimeType)) {
    return getEmbedUrl(file.id);
  }
  return getDownloadUrl(file.id);
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
