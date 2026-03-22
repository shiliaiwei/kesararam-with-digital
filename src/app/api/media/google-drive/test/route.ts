import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  const diagnostics = {
    hasServiceAccountEmail: !!process.env.GOOGLE_DRIVE_SERVICE_ACCOUNT_EMAIL,
    hasPrivateKey: !!process.env.GOOGLE_DRIVE_PRIVATE_KEY,
    hasFolderId: !!process.env.GOOGLE_DRIVE_MEDIA_FOLDER_ID,
    serviceAccountEmailLength: process.env.GOOGLE_DRIVE_SERVICE_ACCOUNT_EMAIL?.length || 0,
    privateKeyLength: process.env.GOOGLE_DRIVE_PRIVATE_KEY?.length || 0,
    folderIdLength: process.env.GOOGLE_DRIVE_MEDIA_FOLDER_ID?.length || 0,
    // Show first/last few characters for verification (not full values for security)
    serviceAccountEmailPreview: process.env.GOOGLE_DRIVE_SERVICE_ACCOUNT_EMAIL 
      ? `${process.env.GOOGLE_DRIVE_SERVICE_ACCOUNT_EMAIL.substring(0, 10)}...${process.env.GOOGLE_DRIVE_SERVICE_ACCOUNT_EMAIL.substring(process.env.GOOGLE_DRIVE_SERVICE_ACCOUNT_EMAIL.length - 10)}`
      : 'NOT SET',
    privateKeyPreview: process.env.GOOGLE_DRIVE_PRIVATE_KEY
      ? `${process.env.GOOGLE_DRIVE_PRIVATE_KEY.substring(0, 20)}...`
      : 'NOT SET',
    folderIdPreview: process.env.GOOGLE_DRIVE_MEDIA_FOLDER_ID || 'NOT SET',
  };

  return NextResponse.json(diagnostics);
}
