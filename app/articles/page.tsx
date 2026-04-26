import type { Metadata } from 'next'
import { getPublishedArticles, CATEGORIES } from '@/lib/notion'
import ArticleCard from '@/components/ArticleCard'
import Link from 'next/link'

export const revalidate = 3600

export const metadata: Metadata = {
  title: '記事一覧',
  description: 'クリエイター・在宅ワーカー向けガジェット比較記事の一覧。マイク・カメラ・照明・ヘッドセットなど機材選びに役立つ情報を掲載。',
}

const CATEGORY_SLUG_TO_NAME: Record<string, string> = Object.fromEntries(
  CATEGORIES.map((c) => [c.slug, c.name])
)

type Props = {
  searchParams: { category?: string }
}

export default async function ArticlesPage({ searchParams }: Props) {
  const allArticles = await getPublishedArticles().catch(() => [])
  const selectedSlug = searchParams.category
  const selectedName = selectedSlug ? CATEGORY_SLUG_TO_NAME[selectedSlug] : null

  const articles = selectedName
    ? allArticles.filter((a) => a.category === selectedName)
    : allArticles

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-lg font-bold text-brand-text mb-5">
        {selectedName ? `${selectedName}の記事一覧` : '記事一覧'}
      </h1>

      {/* Category filter */}
      <div className="flex gap-2 flex-wrap mb-6">
        <Link
          href="/articles"
          className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
            !selectedSlug
              ? 'bg-brand-dark text-white border-brand-dark'
              : 'border-gray-300 text-gray-600 hover:border-brand-green hover:text-brand-green'
          }`}
        >
          すべて
        </Link>
        {CATEGORIES.map((cat) => (
          <Link
            key={cat.slug}
            href={`/articles?category=${cat.slug}`}
            className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
              selectedSlug === cat.slug
                ? 'bg-brand-dark text-white border-brand-dark'
                : 'border-gray-300 text-gray-600 hover:border-brand-green hover:text-brand-green'
            }`}
          >
            {cat.emoji} {cat.name}
          </Link>
        ))}
      </div>

      {articles.length === 0 ? (
        <p className="text-sm text-gray-500 py-12 text-center">
          {selectedName ? `${selectedName}の記事はまだありません。` : '記事がありません。'}
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {articles.map((article) => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </div>
      )}
    </div>
  )
}
