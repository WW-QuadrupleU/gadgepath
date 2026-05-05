import type { Metadata } from 'next'
import AiModelCompareTool from '@/components/AiModelCompareTool'

export const revalidate = 3600

export const metadata: Metadata = {
  title: 'AIジャンル別性能比較ツール | ガジェパス',
  description:
    'ChatGPT、Claude、Gemini、Perplexity、Copilotなどを、リサーチ、文章作成、コード、画像生成、議事録、学習などの用途別に比較できる無料ツールです。',
}

export default function AiModelComparePage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-6xl px-4 py-10">
        <header className="mb-8">
          <p className="mb-2 text-xs font-black uppercase tracking-wider text-brand-green">AI Comparison Tool</p>
          <h1 className="text-2xl font-extrabold tracking-tight text-brand-text sm:text-3xl">
            AIジャンル別性能比較ツール
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-gray-500">
            ChatGPT、Claude、Gemini、Perplexity、Copilotなどを、用途別の向き不向きで比較できます。
            リサーチ、文章作成、コード、画像生成、動画生成、議事録、学習など、使いたいジャンルから選んでください。
          </p>
        </header>

        <AiModelCompareTool />
      </div>
    </main>
  )
}
