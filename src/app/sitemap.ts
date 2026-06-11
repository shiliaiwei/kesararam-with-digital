import { MetadataRoute } from 'next'

const baseUrl = "https://www.kesararamwithdigital.tech";

// Bilingual road-safety learning categories (mirrors /learn).
const learnCategories = [
  "road-traffic",
  "road-sign",
  "priority",
  "driving",
  "technical",
  "emergency",
  "loading-people-goods",
  "general-knowledge",
];

// Interactive games (mirrors /play).
const games = [
  "solo",
  "daily",
  "catch-sign",
  "sign-match",
  "category-quiz",
  "priority-puzzle",
  "light-hero",
  "safety-adventure",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const entry = (
    path: string,
    priority: number,
    changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"],
  ): MetadataRoute.Sitemap[number] => ({
    url: `${baseUrl}${path}`,
    lastModified: now,
    changeFrequency,
    priority,
  });

  return [
    // Primary entry points
    entry("", 1, "weekly"),
    entry("/home", 0.9, "weekly"),
    entry("/learn", 0.9, "weekly"),
    entry("/play", 0.9, "weekly"),

    // Learning categories — the SEO core (traffic signs, road rules, etc.)
    ...learnCategories.map((slug) => entry(`/learn/${slug}`, 0.8, "weekly")),

    // Games
    ...games.map((slug) => entry(`/play/${slug}`, 0.6, "weekly")),

    // Community & conversion
    entry("/leaderboard", 0.7, "daily"),
    entry("/pricing", 0.7, "monthly"),
    entry("/register", 0.6, "monthly"),
    entry("/register/teacher", 0.5, "monthly"),
    entry("/login", 0.4, "yearly"),

    // Brand & info
    entry("/about", 0.6, "monthly"),
    entry("/brand", 0.4, "monthly"),
    entry("/built-with", 0.4, "monthly"),
    entry("/suar/ai", 0.5, "monthly"),

    // Legal
    entry("/terms", 0.3, "yearly"),
    entry("/privacy", 0.3, "yearly"),

    // Human-readable sitemap page
    entry("/sitemap", 0.3, "monthly"),
  ];
}
