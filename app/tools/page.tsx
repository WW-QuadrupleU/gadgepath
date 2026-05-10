import type { Metadata } from 'next'
import { SITE_TOOLS } from '@/lib/tools'
import ToolCard from '@/components/ToolCard'

export const metadata: Metadata = {
  title: 'ツール一覧',
  description: 'ガジェパスで提供しているCPU・GPU性能比較、機材検索、無料ゲーム情報などの無料ツール一覧です。',
}

export default function ToolsPage() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-10 sm:py-12">
      <header className="mb-8 rounded-lg border border-gray-200 bg-white/90 p-6 shadow-sm">
        <p className="mb-2 text-xs font-black uppercase tracking-wider text-brand-green">Tools</p>
        <h1 className="text-3xl font-extrabold tracking-tight text-brand-text">ツール一覧</h1>
        <p className="mt-3 max-w-3xl text-sm leading-relaxed text-gray-500">
          PC・スマホ・配信・動画制作・AI活用まで、選ぶ前に確認したい情報を用途別の無料ツールとしてまとめています。
        </p>
        <div className="mt-5 flex flex-wrap gap-2 text-xs font-bold text-gray-500">
          <span className="rounded-full bg-brand-green/10 px-3 py-1.5 text-brand-dark">診断</span>
          <span className="rounded-full bg-gray-100 px-3 py-1.5">性能比較</span>
          <span className="rounded-full bg-gray-100 px-3 py-1.5">価格チェック</span>
          <span className="rounded-full bg-gray-100 px-3 py-1.5">機材検索</span>
        </div>
      </header>

      <div className="grid gap-4 md:grid-cols-3">
        {SITE_TOOLS.map((tool, index) => (
          <ToolCard key={tool.href} tool={tool} featured={index === 0} />
        ))}
      </div>
    </main>
  )
}
