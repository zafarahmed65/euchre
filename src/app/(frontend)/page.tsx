import Image from 'next/image'
import Link from 'next/link'
import type { Article, Media } from '@/payload-types'
import { HandBlock } from '@/components/hand/HandBlock'
import { ArticleCard } from '@/components/article/ArticleCard'
import { CardArt, cardsForSlug } from '@/components/article/CardArt'
import { AppBanner } from '@/components/layout/AppBanner'
import { getArticles, getCurrentHand, getHomepage } from '@/lib/data'
import { PlayingCard } from '@/components/cards/PlayingCard'

// Rendered per request rather than prerendered: the database is not reachable
// during a Railway build, and a build-time prerender would otherwise bake in an
// empty homepage. The queries are three small reads over the private network.
// Vote counts still come from the uncached /api/vote, never from this render.
export const dynamic = 'force-dynamic'

export default async function HomePage() {
  const [home, hand, latest] = await Promise.all([
    getHomepage(),
    getCurrentHand(),
    getArticles({ limit: 5 }),
  ])

  const featured =
    home.featuredArticle && typeof home.featuredArticle === 'object'
      ? (home.featuredArticle as Article)
      : (latest[0] ?? null)

  const featuredHero =
    featured?.heroImage && typeof featured.heroImage === 'object'
      ? (featured.heroImage as Media)
      : null

  const latestFour = latest.filter((a) => a.id !== featured?.id).slice(0, 4)

  return (
    <>
      {/* ── Hero ──────────────────────────────────────────────────────── */}
      <section className="bg-sky">
        <div className="wrap grid items-center gap-6 py-10 md:grid-cols-[1.1fr_1fr] md:gap-10 md:py-14">
          <div>
            <h1 className="font-serif text-[2.1rem] leading-[1.05] font-bold text-navy sm:text-5xl lg:text-6xl">
              {home.heroHeading?.split('\n').map((line, i) => (
                <span key={i} className="block">
                  {line}
                </span>
              ))}
            </h1>
            <p className="mt-4 max-w-md text-lg leading-snug text-navy/80">{home.heroSubheading}</p>
            {home.heroCtaLabel && (
              <Link
                href={home.heroCtaHref || '/hands'}
                className="tap-target mt-6 inline-flex items-center gap-2 rounded-full bg-gold px-7 text-lg font-bold text-navy shadow-sm hover:bg-gold-deep"
              >
                {home.heroCtaLabel}
                <span aria-hidden="true">›</span>
              </Link>
            )}
          </div>

          {/* Editorial card image, drawn rather than photographed */}
          <div className="hidden justify-end gap-3 md:flex" aria-hidden="true">
            <span className="rotate-[-8deg]">
              <PlayingCard rank="J" suit="hearts" size="lg" />
            </span>
            <span className="rotate-[6deg]">
              <PlayingCard rank="A" suit="hearts" size="lg" />
            </span>
          </div>
        </div>
      </section>

      {/* ── Today's Hand ──────────────────────────────────────────────── */}
      <div className="wrap -mt-1 py-8 md:py-10">
        {hand ? (
          <HandBlock hand={hand} variant="home" />
        ) : (
          <p className="rounded-lg bg-navy px-6 py-10 text-center text-cream">
            This week&rsquo;s hand is on its way. Check back soon.
          </p>
        )}
      </div>

      {/* ── Featured + Latest ─────────────────────────────────────────── */}
      <div className="wrap grid gap-10 pb-4 md:grid-cols-[0.78fr_1.22fr] md:gap-12">
        <section aria-labelledby="featured-heading">
          <h2 id="featured-heading" className="font-serif text-2xl font-bold">
            Featured
          </h2>
          {featured && (
            <Link
              href={`/articles/${featured.slug}`}
              className="group mt-4 flex flex-col gap-4 rounded-md bg-cream-deep/70 p-3 sm:flex-row sm:items-center"
            >
              <div className="relative aspect-[3/2] w-full shrink-0 overflow-hidden rounded sm:w-44">
                {featuredHero?.url ? (
                  <Image
                    src={featuredHero.url}
                    alt={featuredHero.alt || ''}
                    fill
                    sizes="(max-width: 640px) 100vw, 176px"
                    className="object-cover"
                  />
                ) : (
                  <CardArt
                    cards={cardsForSlug(featured.slug || 'featured', 5)}
                    className="h-full w-full"
                  />
                )}
              </div>
              <div className="min-w-0">
                <h3 className="font-serif text-xl leading-snug font-bold text-navy group-hover:text-gold-deep">
                  {featured.title}
                </h3>
                <p className="mt-1 text-[15px] leading-snug text-ink-muted">{featured.excerpt}</p>
              </div>
              <span aria-hidden="true" className="hidden shrink-0 text-2xl text-gold-deep sm:block">
                ›
              </span>
            </Link>
          )}
        </section>

        <section aria-labelledby="latest-heading">
          <h2 id="latest-heading" className="font-serif text-2xl font-bold">
            Latest from the Table
          </h2>
          <div className="mt-4 grid grid-cols-2 gap-x-5 gap-y-7 lg:grid-cols-4">
            {latestFour.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        </section>
      </div>

      <div className="wrap pb-10 text-center">
        <Link
          href="/hands"
          className="tap-target inline-flex items-center gap-2 px-2 font-bold text-navy underline underline-offset-4 hover:text-gold-deep"
        >
          Explore past hands &amp; decisions <span aria-hidden="true">→</span>
        </Link>
      </div>

      {/* ── Euchre Next ───────────────────────────────────────────────── */}
      {home.appBannerEnabled && (
        <div className="wrap pb-12">
          <AppBanner
            heading={home.appBannerHeading}
            subheading={home.appBannerSubheading}
            ctaLabel={home.appBannerCtaLabel}
            ctaHref={home.appBannerCtaHref}
          />
        </div>
      )}
    </>
  )
}
