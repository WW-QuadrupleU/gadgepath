import type { Metadata } from 'next'
import AiModelCompareTool from '@/components/AiModelCompareTool'

export const revalidate = 3600

export const metadata: Metadata = {
  title: 'AIモデル用途別性能比較ツール | ガジェパス',
  description:
    'GPT、Claude、Gemini、Kling、Veo、Runway、画像生成モデルを、リサーチ、文章作成、コード、分析、エージェント、画像、動画のジャンル別に比較できる無料ツールです。',
}

export default function AiModelComparePage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-6xl px-4 py-10">
        <header className="mb-8">
          <p className="mb-2 text-xs font-black uppercase tracking-wider text-brand-green">AI Comparison Tool</p>
          <h1 className="text-2xl font-extrabold tracking-tight text-brand-text sm:text-3xl">
            AIモデルをジャンル別に比較
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-gray-500">
            LLM、画像生成、動画生成モデルをジャンルごとに分け、性能ランキングとコスパランキングを別々に確認できます。
            Artificial Analysisの公開ベンチマークを参考に、リサーチ、文章、コード、分析、エージェント、画像、動画の用途で整理しています。
          </p>
        </header>

        <AiModelCompareTool />
      </div>
    </main>
  )
}
