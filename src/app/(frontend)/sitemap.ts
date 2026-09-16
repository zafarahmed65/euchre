import type { MetadataRoute } from 'next'
import { getArticles, getCategories, getHands } from '@/lib/data'

// Built per request — the database is not reachable during a Railway build.
export const dynamic = 'force-dynamic'

const base = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [hands, articles, categories] = await Promise.all([
    getHands({ limit: 500 }),
    getArticles({ limit: 500 }),
    getCategories(),
  ])

  return [
    { url: base, changeFrequency: 'weekly', priority: 1 },
    { url: `${base}/hands`, changeFrequency: 'weekly', priority: 0.8 },
    ...hands.map((hand) => ({
      url: `${base}/hand/${hand.slug}`,
      lastModified: hand.updatedAt,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    })),
    ...articles.map((article) => ({
      url: `${base}/articles/${article.slug}`,
      lastModified: article.updatedAt,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    })),
    ...categories.map((category) => ({
      url: `${base}/category/${category.slug}`,
      changeFrequency: 'weekly' as const,
      priority: 0.5,
    })),
  ]
}
