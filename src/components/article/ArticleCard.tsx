import Image from 'next/image'
import Link from 'next/link'
import type { Article, Category, Media } from '@/payload-types'
import { CardArt, cardsForSlug } from './CardArt'

const categoryOf = (article: Article): Category | null =>
  typeof article.category === 'object' ? (article.category as Category) : null

const heroOf = (article: Article): Media | null =>
  article.heroImage && typeof article.heroImage === 'object' ? (article.heroImage as Media) : null

export function ArticleCard({ article, showMeta = true }: { article: Article; showMeta?: boolean }) {
  const hero = heroOf(article)
  const category = categoryOf(article)

  return (
    <article className="group">
      <Link href={`/articles/${article.slug}`} className="block">
        <div className="relative aspect-[3/2] w-full overflow-hidden rounded-md">
          {hero?.url ? (
            <Image
              src={hero.url}
              alt={hero.alt || ''}
              fill
              sizes="(max-width: 768px) 100vw, 25vw"
              className="object-cover"
            />
          ) : (
            <CardArt cards={cardsForSlug(article.slug || String(article.id))} className="h-full w-full" />
          )}
        </div>

        {showMeta && category && (
          <p className="mt-3 text-[11px] font-bold tracking-[0.12em] text-gold-deep uppercase">
            {category.title}
          </p>
        )}

        <h3 className="mt-1.5 flex items-start justify-between gap-2 font-serif text-lg leading-snug font-bold text-navy group-hover:text-gold-deep">
          <span>{article.title}</span>
          <span aria-hidden="true" className="mt-0.5 shrink-0 text-gold-deep">
            ›
          </span>
        </h3>

        <p className="mt-1 text-[15px] leading-snug text-ink-muted">{article.excerpt}</p>

        {showMeta && article.readingTime ? (
          <p className="mt-1.5 text-[13px] text-ink-muted/80">{article.readingTime} min read</p>
        ) : null}
      </Link>
    </article>
  )
}
