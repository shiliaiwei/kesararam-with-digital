import { NextResponse } from 'next/server';
import { getAuthUrl } from '@/lib/google-photos-oauth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Initiate Google OAuth flow
 */
export async function GET() {
  try {
    const authUrl = getAuthUrl();
    return NextResponse.redirect(authUrl);
  } catch (error) {
    console.error('Error generating auth URL:', error);
    return NextResponse.json(
      { error: 'Failed to generate auth URL' },
      { status: 500 }
    );
  }
}
