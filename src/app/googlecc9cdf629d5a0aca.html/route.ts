import { NextResponse } from 'next/server';

export async function GET() {
  return new NextResponse('google-site-verification: googlecc9cdf629d5a0aca.html', {
    headers: {
      'Content-Type': 'text/html',
    },
  });
}
