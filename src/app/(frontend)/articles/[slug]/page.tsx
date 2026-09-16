import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Category, Media } from '@/payload-types'
import { RichText, headingsOf } from '@/components/article/RichText'
import { ArticleCard } from '@/components/article/ArticleCard'
import { CardArt, cardsForSlug } from '@/components/article/CardArt'
import { AppBanner } from '@/components/layout/AppBanner'
import { getArticleBySlug, getArticles, getHomepage, payloadClient } from '@/lib/data'
import { formatDate } from '@/lib/format'

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
    const { docs } = await payload.find({ collection: 'articles', limit: 200, depth: 0 })
    return docs.map((a) => ({ slug: a.slug as string }))
  } catch {
    return []
  }
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const article = await getArticleBySlug((await params).slug)
  if (!article) return {}

  return {
    title: article.title,
    description: article.excerpt,
    alternates: { canonical: `/articles/${article.slug}` },
    openGraph: {
      title: article.title,
      description: article.excerpt,
      type: 'article',
      publishedTime: article.publishedAt,
    },
  }
}

export default async function ArticlePage({ params }: Params) {
  const { slug } = await params
  const article = await getArticleBySlug(slug)
  if (!article) notFound()

  const category = typeof article.category === 'object' ? (article.category as Category) : null
  const hero = article.heroImage && typeof article.heroImage === 'object' ? (article.heroImage as Media) : null
  const toc = headingsOf(article.body)

  const [related, home] = await Promise.all([
    article.relatedArticles && article.relatedArticles.length > 0
      ? Promise.resolve(article.relatedArticles.filter((r) => typeof r === 'object') as typeof article.relatedArticles)
      : getArticles({ limit: 3, excludeId: article.id }),
    getHomepage(),
  ])

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Article',
            headline: article.title,
            description: article.excerpt,
            datePublished: article.publishedAt,
            author: { '@type': 'Organization', name: article.author || 'Midwest Euchre Company' },
            articleSection: category?.title,
          }),
        }}
      />

      <div className="wrap pt-6">
        <nav aria-label="Breadcrumb" className="text-sm text-ink-muted">
          <Link href="/" className="hover:text-navy">
            Home
          </Link>
          {category && (
            <>
              <span aria-hidden="true" className="mx-2">/</span>
              <Link href={`/category/${category.slug}`} className="hover:text-navy">
                {category.title}
              </Link>
            </>
          )}
        </nav>
      </div>

      <article className="wrap pt-5 pb-8">
        <header className="max-w-[70ch]">
          {category && (
            <p className="text-[11px] font-bold tracking-[0.12em] text-gold-deep uppercase">
              {category.title}
            </p>
          )}
          <h1 className="mt-2 text-4xl md:text-5xl">{article.title}</h1>
          <p className="mt-4 text-lg text-ink-muted">{article.excerpt}</p>
          <p className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 text-[15px] text-ink-muted">
            <span>{article.author}</span>
            <span aria-hidden="true">·</span>
            <time dateTime={article.publishedAt}>{formatDate(article.publishedAt)}</time>
            {article.readingTime ? (
              <>
                <span aria-hidden="true">·</span>
                <span>{article.readingTime} min read</span>
              </>
            ) : null}
          </p>
        </header>

        <div className="relative mt-7 aspect-[16/7] w-full overflow-hidden rounded-lg">
          {hero?.url ? (
            <Image
              src={hero.url}
              alt={hero.alt || ''}
              fill
              priority
              sizes="(max-width: 1200px) 100vw, 1200px"
              className="object-cover"
            />
          ) : (
            <CardArt
              cards={cardsForSlug(article.slug || 'article', 5)}
              size="md"
              className="h-full w-full"
            />
          )}
        </div>

        <div className="mt-9 grid gap-10 lg:grid-cols-[220px_1fr] lg:gap-14">
          {toc.length > 1 && (
            <nav aria-label="On this page" className="lg:sticky lg:top-8 lg:self-start">
              <h2 className="text-sm tracking-[0.1em] uppercase">On this page</h2>
              <ul className="mt-3 list-none space-y-2 border-l-2 border-rule p-0 pl-4">
                {toc.map((heading) => (
                  <li key={heading.id}>
                    <a
                      href={`#${heading.id}`}
                      className="text-[15px] text-ink-muted hover:text-navy hover:underline"
                    >
                      {heading.text}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          )}

          <RichText data={article.body} className="max-w-[68ch] text-[17px]" />
        </div>
      </article>

      {related.length > 0 && (
        <section aria-labelledby="related-heading" className="wrap border-t border-rule pt-8 pb-4">
          <h2 id="related-heading" className="text-2xl">
            Related reading
          </h2>
          <div className="mt-5 grid gap-6 sm:grid-cols-3">
            {(related as { id: number }[]).map((item) => (
              <ArticleCard key={item.id} article={item as never} />
            ))}
          </div>
        </section>
      )}

      {home.appBannerEnabled && (
        <div className="wrap py-10">
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
