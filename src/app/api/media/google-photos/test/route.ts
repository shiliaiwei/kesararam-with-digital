import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  const diagnostics = {
    timestamp: new Date().toISOString(),
    environment: {
      serviceAccountEmail: process.env.GOOGLE_PHOTOS_SERVICE_ACCOUNT_EMAIL ? 'Set ✓' : 'Missing ✗',
      privateKey: process.env.GOOGLE_PHOTOS_PRIVATE_KEY ? 'Set ✓' : 'Missing ✗',
      privateKeyLength: process.env.GOOGLE_PHOTOS_PRIVATE_KEY?.length || 0,
    },
    values: {
      serviceAccountEmail: process.env.GOOGLE_PHOTOS_SERVICE_ACCOUNT_EMAIL || 'NOT SET',
      privateKeyPreview: process.env.GOOGLE_PHOTOS_PRIVATE_KEY 
        ? `${process.env.GOOGLE_PHOTOS_PRIVATE_KEY.substring(0, 50)}...` 
        : 'NOT SET',
    },
  };

  return NextResponse.json(diagnostics);
}
