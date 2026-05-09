import type { Metadata } from 'next'
import SmartphoneCompareTool from '@/components/SmartphoneCompareTool'
import { SMARTPHONE_DATA } from '@/lib/smartphone-compare-data'

export const metadata: Metadata = {
  title: 'スマートフォン スペック・料金比較ツール | ガジェパス',
  description:
    'iPhone、Google Pixel、Galaxyなど主要スマートフォンのスペック、価格、カメラ、電池持ち、重量、アップデート年数を比較できる無料ツールです。',
}

export default function SmartphoneComparePage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-6xl px-4 py-10">
        <header className="mb-8">
          <p className="mb-2 text-xs font-black uppercase tracking-wider text-brand-green">Smartphone Compare</p>
          <h1 className="text-2xl font-extrabold tracking-tight text-brand-text sm:text-3xl">
            スマートフォン スペック・料金比較ツール
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-gray-500">
            iPhone、Pixel、Galaxyなどの主要スマートフォンを、価格、カメラ、電池持ち、性能、重量、アップデート年数で比較できます。
            予算や用途を切り替えながら、買い替え候補を絞り込めます。
          </p>
        </header>

        <SmartphoneCompareTool phones={SMARTPHONE_DATA} />
      </div>
    </main>
  )
}
