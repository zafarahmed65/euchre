import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { HandBlock } from '@/components/hand/HandBlock'
import { RichText } from '@/components/article/RichText'
import { AppBanner } from '@/components/layout/AppBanner'
import { getHandBySlug, getHands, getHomepage, payloadClient } from '@/lib/data'
import { DECISION_LABEL, DIFFICULTY_LABEL, formatDate } from '@/lib/format'

export const revalidate = 60

type Params = { params: Promise<{ slug: string }> }

// Railway's private network exists only at runtime, so the database is
// unreachable during the build. Returning an empty list lets the build succeed;
// each page is then rendered on first request and cached by `revalidate`.
// Where the database IS reachable at build time (local, Vercel) this still
// prerenders every path as before.
export async function generateStaticParams() {
  try {
    const payload = await payloadClient()
    const { docs } = await payload.find({ collection: 'hands', limit: 200, depth: 0 })
    return docs.map((hand) => ({ slug: hand.slug as string }))
  } catch {
    return []
  }
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const hand = await getHandBySlug((await params).slug)
  if (!hand) return {}

  return {
    title: hand.title,
    description: hand.question,
    // The homepage mirrors this hand, so the permanent URL claims the canonical.
    alternates: { canonical: `/hand/${hand.slug}` },
    openGraph: { title: hand.title, description: hand.question, type: 'article' },
  }
}

export default async function HandPage({ params }: Params) {
  const { slug } = await params
  const hand = await getHandBySlug(slug)
  if (!hand) notFound()

  const [related, home] = await Promise.all([
    getHands({ limit: 3, excludeId: hand.id }),
    getHomepage(),
  ])

  const tags = [
    DECISION_LABEL[hand.decisionType],
    hand.difficulty ? DIFFICULTY_LABEL[hand.difficulty] : null,
    hand.biddingRound === 'second' ? 'Second round' : 'First round',
  ].filter(Boolean) as string[]

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Article',
            headline: hand.title,
            description: hand.question,
            datePublished: hand.publishDate,
            author: { '@type': 'Organization', name: 'Midwest Euchre Company' },
          }),
        }}
      />

      <div className="wrap pt-6">
        <nav aria-label="Breadcrumb" className="text-sm text-ink-muted">
          <Link href="/" className="hover:text-navy">
            Home
          </Link>
          <span aria-hidden="true" className="mx-2">
            /
          </span>
          <Link href="/hands" className="hover:text-navy">
            Past Hands &amp; Decisions
          </Link>
        </nav>
      </div>

      <div className="wrap py-6">
        <HandBlock hand={hand} variant="page" />
      </div>

      <div className="wrap grid gap-10 pb-8 lg:grid-cols-[1fr_260px] lg:gap-14">
        <article>
          <ul className="flex list-none flex-wrap gap-2 p-0">
            {tags.map((tag) => (
              <li
                key={tag}
                className="rounded-full bg-cream-deep px-3 py-1 text-[13px] font-semibold text-navy"
              >
                {tag}
              </li>
            ))}
          </ul>

          <h2 className="mt-7 text-3xl">Expert analysis</h2>
          {hand.expertAnalysis ? (
            <RichText data={hand.expertAnalysis} className="mt-2 max-w-[65ch]" />
          ) : (
            <p className="mt-3 text-ink-muted">
              Analysis for this hand is published later in the week. Cast your vote in the meantime.
            </p>
          )}

          {(hand.expectedValue || hand.methodologyNote) && (
            <aside className="mt-8 max-w-[65ch] rounded-md border border-rule bg-cream-deep/60 p-5">
              <h3 className="text-base tracking-wide uppercase">How this was assessed</h3>
              {hand.expectedValue && (
                <p className="mt-2 text-[15px]">
                  <strong>Expected value:</strong> {hand.expectedValue}
                </p>
              )}
              <p className="mt-2 text-[15px]">
                <strong>Source:</strong>{' '}
                {hand.analysisSource === 'simulator'
                  ? 'Simulator-supported analysis'
                  : 'Expert judgment'}
              </p>
              {hand.methodologyNote && (
                <p className="mt-2 text-[15px] text-ink-muted">{hand.methodologyNote}</p>
              )}
            </aside>
          )}
        </article>

        <aside>
          <h2 className="text-xl">Related hands</h2>
          <ul className="mt-3 list-none space-y-4 p-0">
            {related.map((item) => (
              <li key={item.id} className="border-b border-rule pb-4 last:border-0">
                <Link href={`/hand/${item.slug}`} className="group block">
                  <p className="text-[11px] font-bold tracking-[0.1em] text-gold-deep uppercase">
                    {DECISION_LABEL[item.decisionType]}
                  </p>
                  <p className="mt-1 font-serif font-bold text-navy group-hover:text-gold-deep">
                    {item.title}
                  </p>
                  <p className="mt-0.5 text-[13px] text-ink-muted">{formatDate(item.publishDate)}</p>
                </Link>
              </li>
            ))}
          </ul>

          <Link
            href="/hands"
            className="tap-target mt-2 inline-flex items-center font-bold text-navy underline underline-offset-4 hover:text-gold-deep"
          >
            All past hands →
          </Link>
        </aside>
      </div>

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
