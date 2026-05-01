import Image from 'next/image'
import type { Product } from '@/lib/notion'
import { formatPrice } from '@/lib/notion'
import { buildAffiliateUrl } from '@/lib/affiliate'

type Props = {
  products: Product[]
  title?: string
  maxItems?: number
  className?: string
}

function displayText(value: string | undefined, fallback = '-'): string {
  return value && value.trim() ? value : fallback
}

function specSummary(product: Product): string {
  if (product.features.length > 0) {
    return product.features.slice(0, 3).join(' / ')
  }

  return displayText(product.category)
}

export default function ProductComparisonTable({
  products,
  title = '商品比較テーブル',
  maxItems,
  className = '',
}: Props) {
  const sortedProducts = [...products].sort((a, b) => {
    if (a.numericPrice && b.numericPrice) return a.numericPrice - b.numericPrice
    if (a.numericPrice) return -1
    if (b.numericPrice) return 1
    return a.displayOrder - b.displayOrder
  })
  const visibleProducts = maxItems ? sortedProducts.slice(0, maxItems) : sortedProducts

  if (visibleProducts.length === 0) return null

  return (
    <section className={`not-prose my-6 ${className}`}>
      <div className="mb-3 flex items-end justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-brand-text">{title}</h2>
          <p className="mt-1 text-xs text-gray-500">
            価格やリンク先は変動するため、購入前に販売ページで最新情報を確認してください。
          </p>
        </div>
        <span className="shrink-0 text-xs font-semibold text-gray-400">{visibleProducts.length}件</span>
      </div>

      <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-sm">
        <table className="product-comparison-table min-w-[820px] w-full border-collapse text-left text-sm">
          <thead className="bg-brand-dark text-white">
            <tr>
              <th className="w-[260px] px-3 py-3 font-semibold">商品</th>
              <th className="w-[120px] px-3 py-3 font-semibold">メーカー</th>
              <th className="w-[120px] px-3 py-3 font-semibold">価格</th>
              <th className="w-[220px] px-3 py-3 font-semibold">主な仕様</th>
              <th className="w-[220px] px-3 py-3 font-semibold">特徴</th>
              <th className="w-[120px] px-3 py-3 font-semibold">購入</th>
            </tr>
          </thead>
          <tbody>
            {visibleProducts.map((product) => {
              const affiliateUrl = product.rakutenUrl ? buildAffiliateUrl(product.rakutenUrl) : ''

              return (
                <tr key={product.id} className="border-t border-gray-100 align-top odd:bg-white even:bg-gray-50/60">
                  <td className="px-3 py-3">
                    <div className="flex gap-3">
                      <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-md bg-gray-100">
                        {product.imageUrl ? (
                          <Image
                            src={product.imageUrl}
                            alt={product.name}
                            fill
                            sizes="56px"
                            className="object-contain p-1"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center text-[10px] text-gray-300">No Image</div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold leading-snug text-brand-text">{product.name}</p>
                        {product.status && <p className="mt-1 text-xs text-gray-400">{product.status}</p>}
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-3 text-gray-700">{displayText(product.maker)}</td>
                  <td className="px-3 py-3 font-semibold text-brand-text">{formatPrice(product.price) || '-'}</td>
                  <td className="px-3 py-3 text-gray-700">{specSummary(product)}</td>
                  <td className="px-3 py-3">
                    {product.features.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5">
                        {product.features.slice(0, 5).map((feature) => (
                          <span
                            key={feature}
                            className="rounded-full bg-brand-green/10 px-2 py-0.5 text-xs font-medium text-brand-dark"
                          >
                            {feature}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                  <td className="px-3 py-3">
                    {affiliateUrl ? (
                      <a
                        href={affiliateUrl}
                        target="_blank"
                        rel="noopener noreferrer nofollow"
                        className="inline-flex items-center justify-center rounded-md bg-[#BF0000] px-3 py-2 text-xs font-bold text-white transition-colors hover:bg-[#a30000]"
                      >
                        楽天で見る
                      </a>
                    ) : (
                      <span className="text-xs text-gray-400">未登録</span>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </section>
  )
}
