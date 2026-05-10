import type { Metadata } from 'next'
import { getPublishedArticles, CATEGORIES } from '@/lib/notion'
import ArticleCard from '@/components/ArticleCard'
import Link from 'next/link'
import Image from 'next/image'

export const revalidate = 3600

export const metadata: Metadata = {
  title: '記事一覧',
  description: 'クリエイター・在宅ワーカー向けガジェット比較記事の一覧。マイク・カメラ・照明・ヘッドセットなど機材選びに役立つ情報を掲載。',
}

const CATEGORY_SLUG_TO_NAME: Record<string, string> = Object.fromEntries(
  CATEGORIES.map((c) => [c.slug, c.name])
)

type Props = {
  searchParams: Promise<{ category?: string }>
}

export default async function ArticlesPage({ searchParams }: Props) {
  const allArticles = await getPublishedArticles().catch(() => [])
  const { category: selectedSlug } = await searchParams
  const selectedName = selectedSlug ? CATEGORY_SLUG_TO_NAME[selectedSlug] : null

  const articles = selectedName
    ? allArticles.filter((a) => a.category === selectedName)
    : allArticles

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:py-12">
      <header className="mb-7">
        <p className="mb-2 text-xs font-black uppercase tracking-wider text-brand-green">Guides</p>
        <h1 className="text-3xl font-extrabold tracking-tight text-brand-text">
          {selectedName ? `${selectedName}の記事一覧` : '記事一覧'}
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-relaxed text-gray-500">
          価格、スペック、使い勝手、買う順番を整理したガジェット選びのガイドです。
        </p>
        <p className="mt-3 text-xs font-bold text-gray-400">
          {articles.length}件の記事を表示中
        </p>
      </header>

      {/* Category filter */}
      <div className="mb-7 flex flex-wrap gap-2">
        <Link
          href="/articles"
          className={`rounded-full border px-3 py-1.5 text-xs font-bold transition-colors ${
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
            className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-bold transition-colors ${
              selectedSlug === cat.slug
                ? 'bg-brand-dark text-white border-brand-dark'
                : 'border-gray-300 text-gray-600 hover:border-brand-green hover:text-brand-green'
            }`}
          >
            <Image
              src={cat.icon}
              alt={cat.name}
              width={14}
              height={14}
              className={selectedSlug === cat.slug ? '' : 'opacity-70'}
            />
            {cat.name}
          </Link>
        ))}
      </div>

      {articles.length === 0 ? (
        <p className="rounded-lg border border-dashed border-gray-300 bg-white/70 py-12 text-center text-sm text-gray-500">
          {selectedName ? `${selectedName}の記事はまだありません。` : '記事がありません。'}
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {articles.map((article) => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </div>
      )}
    </div>
  )
}
