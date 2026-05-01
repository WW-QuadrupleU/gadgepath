import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getArticleBySlug, getAllSlugs, getProductsByArticleSlug, getPublishedArticles } from '@/lib/notion'
import type { Product } from '@/lib/notion'
import ArticleCard from '@/components/ArticleCard'
import { BASE_URL, MOSHIMO_BASE } from '@/lib/constants'
import { buildAffiliateUrl } from '@/lib/affiliate'
import { normalize, preprocessContent } from '@/lib/article-preprocessor'
import ProductCard from '@/components/ProductCard'
import InlineProductCard from '@/components/InlineProductCard'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import Link from 'next/link'
import Image from 'next/image'

export const revalidate = 604800

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

/**
 * Amazon検索URLのキーワードから商品DBの商品をマッチングする
 */
function findProductByKeyword(keyword: string, products: Product[]): Product | undefined {
  const nk = normalize(keyword)
  return products.find(p => {
    const n = normalize(p.name), s = normalize(p.slug)
    return nk.includes(n) || n.includes(nk) || nk.includes(s) || s.includes(nk)
  })
}

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params
  const [article, products, allArticles] = await Promise.all([
    getArticleBySlug(slug),
    getProductsByArticleSlug(slug),
    getPublishedArticles(),
  ])
  if (!article) notFound()

  // 同カテゴリ・自記事除外・最大4件
  const relatedArticles = allArticles
    .filter((a) => a.category === article.category && a.slug !== slug)
    .slice(0, 4)

  // 更新日は公開日より後の場合のみ表示
  const showLastEdited =
    article.lastEdited &&
    article.publishedDate &&
    new Date(article.lastEdited).getTime() > new Date(article.publishedDate).getTime()

  const productsByPrice = [...products].sort((a, b) => {
    if (a.numericPrice && b.numericPrice) return a.numericPrice - b.numericPrice
    if (a.numericPrice) return -1
    if (b.numericPrice) return 1
    return a.displayOrder - b.displayOrder
  })

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 bg-[#F7FAFC]">
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
          {showLastEdited && (
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
            unoptimized
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
            // 商品カードが入った <p> は <p> を取り除いてそのまま返す（div-in-p の無効HTML回避）
            p: ({ children }) => {
              const arr = Array.isArray(children) ? children : [children]

              // ① 直接 data-product-card を持つ子（!!GADGE_CARD!! Amazon URL 経由）
              if (
                arr.length === 1 &&
                typeof arr[0] === 'object' &&
                arr[0] !== null &&
                'props' in (arr[0] as object) &&
                (arr[0] as React.ReactElement).props?.['data-product-card']
              ) {
                return <>{arr[0]}</>
              }

              // ② プレーンテキストマーカー「!!GADGE_CARD_NAME!!:EncodedName」または「!!GADGE_CARD_URL!!:Url」を検出
              const text = arr.length === 1 && typeof arr[0] === 'string' ? arr[0] : null
              if (text?.startsWith('!!GADGE_CARD_NAME!!:')) {
                try {
                  const encoded = text.slice('!!GADGE_CARD_NAME!!:'.length)
                  const productName = decodeURIComponent(encoded)
                  const matched = products.find(p => p.name === productName)
                  if (matched?.rakutenUrl && matched?.imageUrl) {
                    const affiliateUrl = buildAffiliateUrl(matched.rakutenUrl)
                    return <InlineProductCard product={matched} affiliateUrl={affiliateUrl} />
                  }
                } catch {}
                return null
              }
              if (text?.startsWith('!!GADGE_CARD_URL!!:')) {
                try {
                  const urlText = decodeURIComponent(text.slice('!!GADGE_CARD_URL!!:'.length))
                  const url = new URL(urlText)
                  const keyword = url.searchParams.get('k') || ''
                  const matched = findProductByKeyword(keyword, products)
                  if (matched?.rakutenUrl && matched?.imageUrl) {
                    const affiliateUrl = buildAffiliateUrl(matched.rakutenUrl)
                    return <InlineProductCard product={matched} affiliateUrl={affiliateUrl} />
                  }
                } catch {}
                return null
              }
              return <p>{children}</p>
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
                  const matched = findProductByKeyword(keyword, products)
                  if (matched?.rakutenUrl) {
                    const affiliateUrl = buildAffiliateUrl(matched.rakutenUrl)
                    return <a href={affiliateUrl} target="_blank" rel="noopener noreferrer nofollow">{children}</a>
                  }
                  // 未登録の場合は楽天検索にフォールバック
                  const rakutenUrl = `https://search.rakuten.co.jp/search/mall/${encodeURIComponent(keyword)}/`
                  const affiliateUrl = buildAffiliateUrl(rakutenUrl)
                  return <a href={affiliateUrl} target="_blank" rel="noopener noreferrer nofollow">{children}</a>
                } catch {}
              }

              // 楽天URLを全てもしもアフィリエイト経由に変換（他社パラメータも除去）
              if (isRakutenDirect && href) {
                try {
                  const affiliateUrl = buildAffiliateUrl(href)
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
          {preprocessContent(article.content, productsByPrice)}
        </ReactMarkdown>
      </article>

      {/* 商品一覧（全商品を表示・楽天URLなしはボタン非表示） */}
      {products.length > 0 && (
        <section className="mt-12 pt-8 border-t border-gray-200">
          <h2 className="text-base font-bold text-brand-text mb-4">
            この記事で紹介した商品
          </h2>
          <div className="space-y-3">
            {productsByPrice.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}

      {/* 同カテゴリの関連記事 */}
      {relatedArticles.length > 0 && (
        <section className="mt-12 pt-8 border-t border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-brand-text">
              {article.category} の関連記事
            </h2>
            <Link
              href={`/articles?category=${encodeURIComponent(article.category)}`}
              className="text-xs text-brand-green hover:underline"
            >
              もっと見る →
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {relatedArticles.map((related) => (
              <ArticleCard key={related.id} article={related} />
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
