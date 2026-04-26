import Link from 'next/link'
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
  'その他': 'bg-gray-100 text-gray-700',
}

type Props = { article: Article }

export default function ArticleCard({ article }: Props) {
  const colorClass = CATEGORY_COLORS[article.category] || 'bg-gray-100 text-gray-700'

  return (
    <Link href={`/articles/${article.slug}`} className="block group">
      <div className="bg-white rounded-xl border border-gray-200 p-5 h-full hover:shadow-md hover:border-brand-green transition-all duration-200">
        {article.category && (
          <span className={`inline-block text-xs font-semibold px-2 py-0.5 rounded-full mb-3 ${colorClass}`}>
            {article.category}
          </span>
        )}
        <h2 className="text-sm font-bold text-brand-text leading-snug group-hover:text-brand-dark line-clamp-3 mb-2">
          {article.title}
        </h2>
        {article.metaDescription && (
          <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
            {article.metaDescription}
          </p>
        )}
        {article.publishedDate && (
          <p className="text-xs text-gray-400 mt-3">
            {new Date(article.publishedDate).toLocaleDateString('ja-JP')}
          </p>
        )}
      </div>
    </Link>
  )
}
