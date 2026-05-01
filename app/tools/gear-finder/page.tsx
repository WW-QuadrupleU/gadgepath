import { getAllActiveProducts } from '@/lib/notion'
import GearFilter from '@/components/GearFilter'

export const metadata = {
  title: '機材・ガジェット検索ツール | ガジェパス',
  description: 'カテゴリ、価格帯、メーカー、特徴からあなたにぴったりの配信機材やクリエイター向けガジェットを検索できます。',
}

export const revalidate = 3600 // 1時間に1回再検証

export default async function GearFinderPage() {
  const products = await getAllActiveProducts()

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-extrabold text-brand-text mb-4">
          機材・ガジェット検索ツール
        </h1>
        <p className="text-gray-500 max-w-2xl mx-auto">
          カテゴリ、予算、メーカー、詳細な特徴から、あなたに最適な機材を見つけましょう。
        </p>
      </div>

      <GearFilter initialProducts={products} />
    </div>
  )
}
