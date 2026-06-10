import { MetadataRoute } from 'next'

const SITE_URL = 'https://www.kesararamwithdigital.tech'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        // Keep private, authenticated, and non-content routes out of search.
        disallow: [
          '/api/',
          '/profile/',
          '/account/',
          '/dashboard',
          '/admin/',
          '/staff/',
          '/u/', // personal user profiles
          '/team/', // tokenized team-scan links
        ],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  }
}
