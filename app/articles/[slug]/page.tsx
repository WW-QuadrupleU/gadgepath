import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getArticleBySlug, getAllSlugs, getProductsByArticleSlug, formatPrice } from '@/lib/notion'
import type { Product } from '@/lib/notion'
import ProductCard from '@/components/ProductCard'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import Link from 'next/link'
import Image from 'next/image'

const MOSHIMO_BASE = 'https://af.moshimo.com/af/c/click?a_id=5519982&p_id=54&pc_id=54&pl_id=27059&url='
const normalize = (s: string) => s.toLowerCase().replace(/[\s\-_+・（）()【】「」『』]/g, '')

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

const BASE_URL = 'https://gadgepath.com'

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const article = await getArticleBySlug(slug)
  if (!article) return {}
  const ogImage = `${BASE_URL}/images/articles/${slug}.jpg`
  return {
    title: article.title,
    description: article.metaDescription || undefined,
    openGraph: {
      title: article.title,
      description: article.metaDescription || undefined,
      type: 'article',
      publishedTime: article.publishedDate || undefined,
      images: [{ url: ogImage, width: 1200, height: 630, alt: article.title }],
    },
    twitter: {
      card: 'summary_large_image',
      title: article.title,
      description: article.metaDescription || undefined,
      images: [ogImage],
    },
  }
}

// 記事本文中・見出し直後に表示する商品カード（画像付き）
function InlineProductCard({ product, affiliateUrl }: { product: Product; affiliateUrl: string }) {
  return (
    <div className="not-prose my-3 flex gap-3 bg-white border border-gray-200 rounded-xl p-3 hover:border-brand-green hover:shadow-sm transition-all duration-200">
      <div className="relative flex-shrink-0 w-20 h-20 bg-gray-50 rounded-lg overflow-hidden">
        <Image
          src={product.imageUrl}
          alt={product.name}
          fill
          sizes="80px"
          className="object-contain p-1"
          unoptimized
        />
      </div>
      <div className="flex flex-col justify-between flex-1 min-w-0">
        <p className="text-sm font-semibold text-brand-text leading-snug line-clamp-2">{product.name}</p>
        {product.price && <p className="text-xs text-gray-500 mt-1">{formatPrice(product.price)}</p>}
        <div className="mt-2">
          <a
            href={affiliateUrl}
            target="_blank"
            rel="noopener noreferrer nofollow"
            className="inline-block text-xs font-bold text-white bg-[#BF0000] hover:opacity-90 transition-opacity px-4 py-1.5 rounded-full"
          >
            楽天市場で見る
          </a>
        </div>
      </div>
    </div>
  )
}

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params
  const [article, products] = await Promise.all([
    getArticleBySlug(slug),
    getProductsByArticleSlug(slug),
  ])
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

        {/* Hero image */}
        <div className="relative w-full h-52 sm:h-72 mt-6 rounded-xl overflow-hidden bg-gray-100">
          <Image
            src={`/images/articles/${article.slug}.jpg`}
            alt={article.title}
            fill
            priority
            sizes="(max-width: 768px) 100vw, 768px"
            className="object-cover"
          />
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
            // h4見出し（####）の直後に商品カードを挿入
            h4: ({ node, children, ...props }) => {
              // hast ASTからAmazon検索URLを探す
              const findAmazonHref = (nodes: any[]): string | null => {
                for (const n of nodes || []) {
                  if (n.type === 'element' && n.tagName === 'a') {
                    const href: string = n.properties?.href || ''
                    if (href.includes('amazon.co.jp/s')) return href
                  }
                  const found = findAmazonHref(n.children || [])
                  if (found) return found
                }
                return null
              }

              let imageCard: React.ReactNode = null
              const amazonHref = findAmazonHref((node as any)?.children || [])
              if (amazonHref) {
                try {
                  const url = new URL(amazonHref)
                  const keyword = url.searchParams.get('k') || ''
                  const normalizedKeyword = normalize(keyword)
                  const matched = products.find(p => {
                    const n = normalize(p.name)
                    const s = normalize(p.slug)
                    return normalizedKeyword.includes(n) || n.includes(normalizedKeyword) ||
                           normalizedKeyword.includes(s) || s.includes(normalizedKeyword)
                  })
                  if (matched?.rakutenUrl && matched?.imageUrl) {
                    const affiliateUrl = `${MOSHIMO_BASE}${encodeURIComponent(matched.rakutenUrl)}`
                    imageCard = <InlineProductCard product={matched} affiliateUrl={affiliateUrl} />
                  }
                } catch {}
              }

              return (
                <>
                  <h4 {...props}>{children}</h4>
                  {imageCard}
                </>
              )
            },

            a: ({ href, children }) => {
              const isExternal = href?.startsWith('http')
              const isAmazonSearch = href?.includes('amazon.co.jp/s?k=') || href?.includes('amazon.co.jp/s/?k=')
              const isAmazon = href && (href.includes('amazon.co.jp') || href.includes('amzn.to') || href.includes('amzn.asia'))
              const isRakutenDirect = href && href.includes('rakuten.co.jp') && !href.includes('af.moshimo.com')
              const isMoshimo = href && href.includes('moshimo')

              // Amazon検索URL → 商品名テキストを維持したまま楽天アフィリエイトリンクに変換
              if (isAmazonSearch && href) {
                try {
                  const url = new URL(href)
                  const keyword = url.searchParams.get('k') || ''
                  const normalizedKeyword = normalize(keyword)
                  const matched = products.find(p => {
                    const n = normalize(p.name)
                    const s = normalize(p.slug)
                    return normalizedKeyword.includes(n) || n.includes(normalizedKeyword) ||
                           normalizedKeyword.includes(s) || s.includes(normalizedKeyword)
                  })
                  if (matched?.rakutenUrl) {
                    const affiliateUrl = `${MOSHIMO_BASE}${encodeURIComponent(matched.rakutenUrl)}`
                    return <a href={affiliateUrl} target="_blank" rel="noopener noreferrer nofollow">{children}</a>
                  }
                  // 未登録の場合は楽天検索にフォールバック
                  const rakutenUrl = `https://search.rakuten.co.jp/search/mall/${encodeURIComponent(keyword)}/`
                  const affiliateUrl = `${MOSHIMO_BASE}${encodeURIComponent(rakutenUrl)}`
                  return <a href={affiliateUrl} target="_blank" rel="noopener noreferrer nofollow">{children}</a>
                } catch {}
              }

              // 楽天URLを全てもしもアフィリエイト経由に変換（他社パラメータも除去）
              if (isRakutenDirect && href) {
                try {
                  const url = new URL(href)
                  url.searchParams.delete('scid')
                  url.searchParams.delete('sc2id')
                  const cleanUrl = url.toString()
                  const affiliateUrl = `${MOSHIMO_BASE}${encodeURIComponent(cleanUrl)}`
                  return <a href={affiliateUrl} className="btn-rakuten" target="_blank" rel="noopener noreferrer nofollow">{children}</a>
                } catch {}
              }

              const className = isAmazon ? 'btn-amazon' : isMoshimo ? 'btn-rakuten' : undefined
              return (
                <a href={href} className={className} {...(isExternal ? { target: '_blank', rel: 'noopener noreferrer nofollow' } : {})}>
                  {children}
                </a>
              )
            },
          }}
        >
          {article.content}
        </ReactMarkdown>
      </article>

      {/* 商品一覧（全商品を表示・楽天URLなしはボタン非表示） */}
      {products.length > 0 && (
        <section className="mt-12 pt-8 border-t border-gray-200">
          <h2 className="text-base font-bold text-brand-text mb-4">
            この記事で紹介した商品
          </h2>
          <div className="space-y-3">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}

      {/* Back link */}
      <div className="mt-12 pt-6 border-t border-gray-200">
        <Link href="/articles" className="text-sm text-brand-green hover:underline">
          ← 記事一覧に戻る
        </Link>
      </div>
    </div>
  )
}
