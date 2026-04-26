import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getArticleBySlug, getAllSlugs } from '@/lib/notion'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import Link from 'next/link'

export const revalidate = 3600

type Props = {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  try {
    const slugs = await getAllSlugs()
    return slugs.filter((s) => s.slug).map((s) => ({ slug: s.slug }))
  } catch {
    return []
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const article = await getArticleBySlug(slug)
  if (!article) return {}
  return {
    title: article.title,
    description: article.metaDescription || undefined,
    openGraph: {
      title: article.title,
      description: article.metaDescription || undefined,
      type: 'article',
      publishedTime: article.publishedDate || undefined,
    },
  }
}

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params
  const article = await getArticleBySlug(slug)
  if (!article) notFound()

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="text-xs text-gray-400 mb-5 flex items-center gap-1.5">
        <Link href="/" className="hover:text-brand-green transition-colors">ホーム</Link>
        <span>/</span>
        <Link href="/articles" className="hover:text-brand-green transition-colors">記事一覧</Link>
        {article.category && (
          <>
            <span>/</span>
            <span>{article.category}</span>
          </>
        )}
      </nav>

      {/* Header */}
      <header className="mb-8">
        {article.category && (
          <span className="inline-block text-xs font-semibold bg-brand-green/10 text-brand-dark px-2 py-0.5 rounded-full mb-3">
            {article.category}
          </span>
        )}
        <h1 className="text-xl sm:text-2xl font-bold text-brand-text leading-snug mb-3">
          {article.title}
        </h1>
        {article.metaDescription && (
          <p className="text-sm text-gray-500 leading-relaxed mb-3">{article.metaDescription}</p>
        )}
        <div className="flex items-center gap-3 text-xs text-gray-400">
          {article.publishedDate && (
            <span>公開: {new Date(article.publishedDate).toLocaleDateString('ja-JP')}</span>
          )}
          {article.lastEdited && (
            <span>更新: {new Date(article.lastEdited).toLocaleDateString('ja-JP')}</span>
          )}
        </div>
      </header>

      {/* Affiliate disclosure */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 mb-8 text-xs text-gray-500">
        本記事はAmazonアソシエイト・楽天アフィリエイトプログラムを通じて収益を得る場合があります。
        <Link href="/disclosure" className="text-brand-green hover:underline ml-1">詳細はこちら</Link>
      </div>

      {/* Article content */}
      <article className="article-content">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            a: ({ href, children }) => {
              const isExternal = href?.startsWith('http')
              const isAmazon = href && (href.includes('amazon.co.jp') || href.includes('amzn.to') || href.includes('amzn.asia'))
              const isRakuten = href && href.includes('rakuten')
              const className = isAmazon ? 'btn-amazon' : isRakuten ? 'btn-rakuten' : undefined
              return (
                <a
                  href={href}
                  className={className}
                  {...(isExternal
                    ? { target: '_blank', rel: 'noopener noreferrer nofollow' }
                    : {})}
                >
                  {children}
                </a>
              )
            },
          }}
        >
          {article.content}
        </ReactMarkdown>
      </article>

      {/* Back link */}
      <div className="mt-12 pt-6 border-t border-gray-200">
        <Link href="/articles" className="text-sm text-brand-green hover:underline">
          ← 記事一覧に戻る
        </Link>
      </div>
    </div>
  )
}
