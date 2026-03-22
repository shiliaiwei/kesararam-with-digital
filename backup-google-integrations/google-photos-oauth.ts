import { google } from 'googleapis';

/**
 * Google Photos OAuth 2.0 Client
 * This uses OAuth instead of service accounts
 */

export function getOAuthClient() {
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_OAUTH_CLIENT_ID,
    process.env.GOOGLE_OAUTH_CLIENT_SECRET,
    process.env.GOOGLE_OAUTH_REDIRECT_URI || 'http://localhost:3000/api/auth/google/callback'
  );

  return oauth2Client;
}

/**
 * Generate OAuth URL for user to sign in
 */
export function getAuthUrl() {
  const oauth2Client = getOAuthClient();
  
  const scopes = [
    'https://www.googleapis.com/auth/photoslibrary.readonly',
  ];

  const url = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: scopes,
    prompt: 'consent',
  });

  return url;
}

/**
 * Exchange authorization code for tokens
 */
export async function getTokensFromCode(code: string) {
  const oauth2Client = getOAuthClient();
  const { tokens } = await oauth2Client.getToken(code);
  return tokens;
}

/**
 * Make authenticated request with user's access token
 */
export async function makeAuthenticatedRequest(
  accessToken: string,
  endpoint: string,
  method: string = 'GET',
  body?: any
) {
  const url = `https://photoslibrary.googleapis.com/v1/${endpoint}`;
  
  const options: RequestInit = {
    method,
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  };
  
  if (body) {
    options.body = JSON.stringify(body);
  }
  
  const response = await fetch(url, options);
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Google Photos API error: ${response.status} - ${errorText}`);
  }
  
  return response.json();
}

/**
 * List albums with OAuth
 */
export async function listAlbumsOAuth(accessToken: string) {
  const data = await makeAuthenticatedRequest(accessToken, 'albums?pageSize=50', 'GET');
  return data.albums || [];
}

/**
 * Search media items with OAuth
 */
export async function searchMediaItemsOAuth(accessToken: string, albumId?: string) {
  const body: any = {
    pageSize: 100,
  };
  
  if (albumId) {
    body.albumId = albumId;
  }
  
  const data = await makeAuthenticatedRequest(accessToken, 'mediaItems:search', 'POST', body);
  return data.mediaItems || [];
}
