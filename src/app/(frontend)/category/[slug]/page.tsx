import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { ArticleCard } from '@/components/article/ArticleCard'
import { getArticles, getCategories, getCategoryBySlug } from '@/lib/data'

export const revalidate = 60

type Params = { params: Promise<{ slug: string }> }

export async function generateStaticParams() {
  const categories = await getCategories()
  return categories.map((c) => ({ slug: c.slug as string }))
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const category = await getCategoryBySlug((await params).slug)
  if (!category) return {}

  return {
    title: category.title,
    description: category.description || `${category.title} articles from Midwest Euchre Company.`,
    alternates: { canonical: `/category/${category.slug}` },
  }
}

export default async function CategoryPage({ params }: Params) {
  const { slug } = await params
  const category = await getCategoryBySlug(slug)
  if (!category) notFound()

  const articles = await getArticles({ limit: 30, categorySlug: slug })

  return (
    <div className="wrap py-8 md:py-12">
      <h1 className="text-4xl md:text-5xl">{category.title}</h1>
      {category.description && (
        <p className="mt-3 max-w-[60ch] text-lg text-ink-muted">{category.description}</p>
      )}

      {articles.length === 0 ? (
        <p className="mt-8 rounded-md border border-rule bg-cream-deep/50 p-8 text-center text-ink-muted">
          Nothing published in this category yet.
        </p>
      ) : (
        <div className="mt-8 grid gap-x-6 gap-y-9 sm:grid-cols-2 lg:grid-cols-3">
          {articles.map((article) => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </div>
      )}
    </div>
  )
}
