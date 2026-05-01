import Image from 'next/image'
import type { Product } from '@/lib/notion'
import { formatPrice } from '@/lib/notion'

type Props = {
  product: Product
  affiliateUrl: string
}

/** 記事本文中・見出し直後に表示する商品カード（画像付き） */
export default function InlineProductCard({ product, affiliateUrl }: Props) {
  return (
    <div data-product-card="true" className="not-prose my-3 flex gap-3 bg-white border border-gray-200 rounded-xl p-3 hover:border-brand-green hover:shadow-sm transition-all duration-200">
      <div className="relative flex-shrink-0 w-20 h-20 bg-gray-50 rounded-lg overflow-hidden">
        <Image
          src={product.imageUrl}
          alt={product.name}
          fill
          sizes="80px"
          className="object-contain p-1"
        />
      </div>
      <div className="flex flex-col justify-between flex-1 min-w-0">
        <p className="text-base font-bold text-brand-text leading-snug line-clamp-2">{product.name}</p>
        {product.price && <p className="text-xs text-gray-500 mt-1">{formatPrice(product.price)}</p>}
        <div className="mt-2">
          <a
            href={affiliateUrl}
            target="_blank"
            rel="noopener noreferrer nofollow"
            className="btn-rakuten inline-flex items-center gap-1.5 text-xs font-bold text-white bg-[#BF0000] hover:bg-[#a30000] transition-all duration-150 px-4 py-2 rounded-xl shadow-sm"
          >
            楽天市場で見る
          </a>
        </div>
      </div>
    </div>
  )
}
