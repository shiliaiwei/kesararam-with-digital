export function GET() {
  return new Response('google-site-verification: googlecc9cdf629d5a0aca.html', {
    status: 200,
    headers: { 'Content-Type': 'text/plain' },
  });
}
