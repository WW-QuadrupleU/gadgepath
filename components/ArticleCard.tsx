import Link from 'next/link'
import Image from 'next/image'
import type { Article } from '@/lib/notion'

const CATEGORY_COLORS: Record<string, string> = {
  'マイク': 'bg-blue-100 text-blue-700',
  'カメラ': 'bg-purple-100 text-purple-700',
  '照明': 'bg-yellow-100 text-yellow-700',
  'ヘッドセット': 'bg-green-100 text-green-700',
  'キャプチャーボード': 'bg-orange-100 text-orange-700',
  'SSD・ストレージ': 'bg-brown-100 text-amber-700',
  'USBハブ': 'bg-pink-100 text-pink-700',
  '機材セット': 'bg-red-100 text-red-700',
  'AIツール': 'bg-violet-100 text-violet-700',
  'その他': 'bg-gray-100 text-gray-700',
}

type Props = { article: Article }

export default function ArticleCard({ article }: Props) {
  const colorClass = CATEGORY_COLORS[article.category] || 'bg-gray-100 text-gray-700'
  const imagePath = `/images/articles/${article.slug}.jpg`

  return (
    <Link href={`/articles/${article.slug}`} className="group block h-full">
      <div className="h-full overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-brand-green hover:shadow-md">
        {/* Thumbnail */}
        <div className="relative h-40 w-full overflow-hidden bg-gray-100">
          <Image
            src={imagePath}
            alt={article.title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            unoptimized
          />
        </div>

        {/* Content */}
        <div className="flex min-h-40 flex-col p-4">
          {article.category && (
            <span className={`mb-2 inline-block w-fit rounded-full px-2 py-0.5 text-xs font-semibold ${colorClass}`}>
              {article.category}
            </span>
          )}
          <h2 className="mb-2 line-clamp-3 text-sm font-bold leading-snug text-brand-text group-hover:text-brand-dark">
            {article.title}
          </h2>
          {article.metaDescription && (
            <p className="line-clamp-2 text-xs leading-relaxed text-gray-500">
              {article.metaDescription}
            </p>
          )}
          {article.publishedDate && (
            <p className="mt-auto pt-4 text-xs font-medium text-gray-400">
              {new Date(article.publishedDate).toLocaleDateString('ja-JP')}
            </p>
          )}
        </div>
      </div>
    </Link>
  )
}
