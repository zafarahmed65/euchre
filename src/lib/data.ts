import { getPayload, type Where } from 'payload'
import configPromise from '@payload-config'
import type { Article, Category, Hand, Homepage, Navigation } from '@/payload-types'

export const payloadClient = async () => getPayload({ config: configPromise })

/** Only hands that are published AND whose date has arrived count as live. */
const liveHandWhere = (): Where => ({
  and: [
    { _status: { equals: 'published' } },
    { publishDate: { less_than_equal: new Date().toISOString() } },
  ],
})

/**
 * "Today's Hand" is the newest live hand — nothing more.
 *
 * That single definition is what makes archiving automatic: publishing next week's
 * scenario demotes this week's without a cron job, a scheduled task, or anything
 * for the owner to remember.
 */
export async function getCurrentHand(): Promise<Hand | null> {
  const payload = await payloadClient()
  const { docs } = await payload.find({
    collection: 'hands',
    where: liveHandWhere(),
    sort: ['-publishDate', '-createdAt'],
    limit: 1,
    depth: 1,
  })
  return docs[0] ?? null
}

export async function getHandBySlug(slug: string): Promise<Hand | null> {
  const payload = await payloadClient()
  const { docs } = await payload.find({
    collection: 'hands',
    where: { slug: { equals: slug } },
    limit: 1,
    depth: 2,
  })
  return docs[0] ?? null
}

/** The Past Hands & Decisions archive, optionally narrowed by decision type. */
export async function getHands({
  decision,
  limit = 60,
  excludeId,
}: { decision?: string; limit?: number; excludeId?: number | string } = {}): Promise<Hand[]> {
  const payload = await payloadClient()
  const and: Where[] = [liveHandWhere()]
  if (decision) and.push({ decisionType: { equals: decision } })
  if (excludeId !== undefined) and.push({ id: { not_equals: excludeId } })

  const { docs } = await payload.find({
    collection: 'hands',
    where: { and },
    sort: ['-publishDate', '-createdAt'],
    limit,
    depth: 1,
  })
  return docs
}

export async function getArticles({
  limit = 4,
  categorySlug,
  excludeId,
}: { limit?: number; categorySlug?: string; excludeId?: number | string } = {}): Promise<Article[]> {
  const payload = await payloadClient()
  const and: Where[] = [{ _status: { equals: 'published' } }]
  if (categorySlug) and.push({ 'category.slug': { equals: categorySlug } })
  if (excludeId !== undefined) and.push({ id: { not_equals: excludeId } })

  const { docs } = await payload.find({
    collection: 'articles',
    where: { and },
    sort: '-publishedAt',
    limit,
    depth: 1,
  })
  return docs
}

export async function getArticleBySlug(slug: string): Promise<Article | null> {
  const payload = await payloadClient()
  const { docs } = await payload.find({
    collection: 'articles',
    where: { slug: { equals: slug } },
    limit: 1,
    depth: 2,
  })
  return docs[0] ?? null
}

export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  const payload = await payloadClient()
  const { docs } = await payload.find({
    collection: 'categories',
    where: { slug: { equals: slug } },
    limit: 1,
  })
  return docs[0] ?? null
}

export async function getCategories(): Promise<Category[]> {
  const payload = await payloadClient()
  const { docs } = await payload.find({ collection: 'categories', limit: 20, sort: 'title' })
  return docs
}

/**
 * Globals are read by the shared layout, so a failure here would take down every
 * page — including the 404. They fall back to the same defaults declared on the
 * global itself, which also lets the app build when the database is unreachable
 * (Railway's private network does not exist during a build).
 */
const HOMEPAGE_FALLBACK = {
  heroHeading: 'Everything Euchre.\nAll in One Place.',
  heroSubheading:
    'Learn the game, sharpen your strategy, and join the next generation of euchre.',
  heroCtaLabel: 'Explore Euchre',
  heroCtaHref: '/hands',
  featuredArticle: null,
  appBannerEnabled: true,
  appBannerHeading: 'Meet Euchre Next',
  appBannerSubheading: 'A smarter way to play, learn, and compete.',
  appBannerCtaLabel: 'Coming Soon',
  appBannerCtaHref: '#',
} as unknown as Homepage

const NAVIGATION_FALLBACK = {
  headerLinks: [
    { id: '1', label: "Today's Hand", href: '/hands' },
    { id: '2', label: 'Strategy', href: '/category/strategy' },
    { id: '3', label: 'Learn', href: '/category/learn' },
  ],
  headerCta: { label: 'Euchre Next', href: '#euchre-next' },
  footerLinks: [{ id: '1', label: 'Past Hands', href: '/hands' }],
  socialLinks: [],
} as unknown as Navigation

export async function getHomepage(): Promise<Homepage> {
  try {
    const payload = await payloadClient()
    return (await payload.findGlobal({ slug: 'homepage', depth: 2 })) as Homepage
  } catch {
    return HOMEPAGE_FALLBACK
  }
}

export async function getNavigation(): Promise<Navigation> {
  try {
    const payload = await payloadClient()
    return (await payload.findGlobal({ slug: 'navigation', depth: 0 })) as Navigation
  } catch {
    return NAVIGATION_FALLBACK
  }
}

/** Vote tallies for one hand, counted straight from the votes collection. */
export async function getTallies(handId: number | string, choiceCount: number) {
  const payload = await payloadClient()
  const { docs, totalDocs } = await payload.find({
    collection: 'votes',
    where: { hand: { equals: handId } },
    limit: 10000,
    depth: 0,
    overrideAccess: true,
  })

  const counts = new Array(choiceCount).fill(0)
  for (const vote of docs) {
    const i = (vote as { choiceIndex: number }).choiceIndex
    if (i >= 0 && i < choiceCount) counts[i] += 1
  }
  return { counts, total: totalDocs }
}
