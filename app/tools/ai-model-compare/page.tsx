import type { Metadata } from 'next'
import AiModelCompareTool from '@/components/AiModelCompareTool'

export const revalidate = 3600

export const metadata: Metadata = {
  title: 'AIモデル用途別性能比較ツール | ガジェパス',
  description:
    'GPT、Claude、Gemini、Grok、Perplexity、画像生成、動画生成モデルを、リサーチ、文章作成、コード、分析、画像、動画、コスパの用途別に比較できる無料ツールです。',
}

export default function AiModelComparePage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-6xl px-4 py-10">
        <header className="mb-8">
          <p className="mb-2 text-xs font-black uppercase tracking-wider text-brand-green">AI Comparison Tool</p>
          <h1 className="text-2xl font-extrabold tracking-tight text-brand-text sm:text-3xl">
            AIモデルを用途別に比較
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-gray-500">
            GPT、Claude、Gemini、Grokなどをモデル単位で比較し、リサーチ、文章作成、コード、分析、画像生成、動画生成、コスパのどこに向くかを確認できます。
            バージョンごとの性能差が見えるように、サービス名ではなくモデル名を基準に整理しています。
          </p>
        </header>

        <AiModelCompareTool />
      </div>
    </main>
  )
}
