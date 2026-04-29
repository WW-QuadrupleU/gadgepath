import Link from 'next/link'
import Image from 'next/image'
import { getPublishedArticles } from '@/lib/notion'
import { CATEGORIES } from '@/lib/notion'
import ArticleCard from '@/components/ArticleCard'

export const revalidate = 3600

export default async function HomePage() {
  const articles = await getPublishedArticles().catch(() => [])
  const recent = articles.slice(0, 6)

  return (
    <>
      {/* Hero */}
      <section className="relative bg-brand-dark text-white py-12 px-4 overflow-hidden">
        {/* Pattern D: green glow */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse 70% 60% at 50% 130%, rgba(132,204,22,0.22) 0%, transparent 70%)' }}
        />
        <div className="relative max-w-5xl mx-auto text-center">
          <h1 className="text-2xl sm:text-3xl font-bold mb-3 leading-snug">
            クリエイター・在宅ワーカーのための<br className="hidden sm:block" />
            <span className="text-brand-green">ガジェット比較</span>サイト
          </h1>
          <p className="text-sm text-gray-300 mb-6 max-w-xl mx-auto leading-relaxed">
            マイク・カメラ・照明・ヘッドセットなど、配信・動画制作に必要な機材を<br className="hidden sm:block" />
            用途・予算別に徹底比較。最適な一台を見つけよう。
          </p>
          <Link
            href="/articles"
            className="inline-block bg-brand-green text-brand-dark font-bold px-6 py-2.5 rounded-lg hover:opacity-90 transition-opacity text-sm"
          >
            記事を読む
          </Link>
        </div>
      </section>

      {/* Categories */}
      <section className="max-w-5xl mx-auto px-4 py-10">
        <h2 className="text-base font-bold text-brand-text mb-5">カテゴリから探す</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.slug}
              href={`/articles?category=${cat.slug}`}
              className="flex items-center gap-3 bg-white border border-gray-200 rounded-xl px-4 py-3 hover:border-brand-green hover:shadow-sm transition-all text-sm font-medium text-brand-text"
            >
              <Image src={cat.icon} alt={cat.name} width={28} height={28} className="shrink-0" />
              <span>{cat.name}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Recent Articles */}
      {recent.length > 0 && (
        <section className="max-w-5xl mx-auto px-4 pb-12">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-base font-bold text-brand-text">新着記事</h2>
            <Link href="/articles" className="text-xs text-brand-green hover:underline">
              すべて見る →
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {recent.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        </section>
      )}

      {/* Value proposition */}
      <section className="bg-white border-t border-gray-100 py-10 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-base font-bold text-brand-text text-center mb-7">ガジェパスが選ばれる理由</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
            <div>
              <div className="flex justify-center mb-3">
                <Image src="/icons/reason-target.png" alt="用途別に比較" width={56} height={56} />
              </div>
              <h3 className="font-bold text-sm mb-1">用途別に比較</h3>
              <p className="text-xs text-gray-500 leading-relaxed">配信・動画・テレワークなど用途に合わせた機材選びをサポート</p>
            </div>
            <div>
              <div className="flex justify-center mb-3">
                <Image src="/icons/reason-creator.png" alt="現役クリエイターが執筆" width={56} height={56} />
              </div>
              <h3 className="font-bold text-sm mb-1">現役クリエイターが執筆</h3>
              <p className="text-xs text-gray-500 leading-relaxed">YouTube・TikTokで実際に使用した経験をもとに解説</p>
            </div>
            <div>
              <div className="flex justify-center mb-3">
                <Image src="/icons/reason-budget.png" alt="予算別に提案" width={56} height={56} />
              </div>
              <h3 className="font-bold text-sm mb-1">予算別に提案</h3>
              <p className="text-xs text-gray-500 leading-relaxed">入門〜プロまで、各予算帯に最適なコスパ重視の選び方を紹介</p>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
