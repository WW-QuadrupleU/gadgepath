import type { Metadata } from 'next'
import { getAllActiveProducts } from '@/lib/notion'
import StreamingChecker from '@/components/StreamingChecker'

export const metadata: Metadata = {
  title: '配信・動画環境チェッカー | ガジェパス',
  description: '用途・悩み・予算を選ぶだけで、あなたに最適な配信・動画撮影機材を診断します。YouTuber・配信者・テレワーカー向け。',
}

export const revalidate = 604800

export default async function StreamingCheckerPage() {
  const products = await getAllActiveProducts()

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="container mx-auto px-4 py-12 max-w-3xl">
        {/* ヘッダー */}
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-extrabold text-brand-text mb-4 tracking-tight">
            <span className="text-[#09c071]">🎙️</span> 配信・動画環境チェッカー
          </h1>
          <p className="text-gray-500 max-w-xl mx-auto leading-relaxed">
            3つの質問に答えるだけで、今のあなたに<strong className="text-brand-text">最優先で揃えるべき機材</strong>を診断します。
          </p>
        </div>

        {/* 診断コンポーネント */}
        <StreamingChecker products={products} />
      </div>
    </div>
  )
}
