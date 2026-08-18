import { MetadataRoute } from 'next'

const SITE_URL = 'https://www.kesararamwithdigital.tech'

// Private/authenticated/non-content routes kept out of every crawler.
const DISALLOW = [
  '/api/',
  '/profile/',
  '/account/',
  '/dashboard',
  '/admin/',
  '/staff/',
  '/u/', // personal user profiles
  '/team/', // tokenized team-scan links
  '/Regional-Pitch-Event',
]

// AI / LLM search crawlers we explicitly welcome, so Kesararam With Digital can be discovered and
// cited inside ChatGPT, Claude, Perplexity, Gemini, and Google AI Overviews.
// (See /llms.txt for the structured summary these assistants read.)
const AI_CRAWLERS = [
  'GPTBot', 'OAI-SearchBot', 'ChatGPT-User', // OpenAI
  'ClaudeBot', 'Claude-Web', 'anthropic-ai', // Anthropic
  'PerplexityBot', 'Perplexity-User', // Perplexity
  'Google-Extended', // Google Gemini / AI Overviews
  'Applebot-Extended', // Apple Intelligence
  'CCBot', // Common Crawl (feeds many models)
]

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: DISALLOW,
      },
      {
        userAgent: AI_CRAWLERS,
        allow: '/',
        disallow: DISALLOW,
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  }
}
