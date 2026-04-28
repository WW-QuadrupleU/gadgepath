import Image from 'next/image'
import type { Product } from '@/lib/notion'

const MOSHIMO_A_ID = '5519982'

function buildAffiliateUrl(rakutenUrl: string): string {
  return `https://af.moshimo.com/af/c/click?a_id=${MOSHIMO_A_ID}&p_id=54&pc_id=54&pl_id=27059&url=${encodeURIComponent(rakutenUrl)}`
}

type Props = { product: Product }

export default function ProductCard({ product }: Props) {
  const affiliateUrl = buildAffiliateUrl(product.rakutenUrl)

  return (
    <div className="flex gap-4 bg-white border border-gray-200 rounded-xl p-4 hover:border-brand-green hover:shadow-sm transition-all duration-200">
      {/* 商品画像 */}
      <div className="relative w-24 h-24 flex-shrink-0 bg-gray-50 rounded-lg overflow-hidden">
        {product.imageUrl ? (
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            sizes="96px"
            className="object-contain p-1"
            unoptimized
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs">
            No Image
          </div>
        )}
      </div>

      {/* 商品情報 */}
      <div className="flex flex-col justify-between flex-1 min-w-0">
        <p className="text-sm font-semibold text-brand-text leading-snug line-clamp-2">
          {product.name}
        </p>
        {product.price && (
          <p className="text-xs text-gray-500 mt-1">{product.price}</p>
        )}
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
