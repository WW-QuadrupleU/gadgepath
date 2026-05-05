import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { SITE_TOOLS } from '@/lib/tools'

export const metadata: Metadata = {
  title: 'ツール一覧',
  description: 'ガジェパスで提供しているCPU・GPU性能比較、機材検索、無料ゲーム情報などの無料ツール一覧です。',
}

export default function ToolsPage() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <header className="mb-8">
        <p className="mb-2 text-xs font-black uppercase tracking-wider text-brand-green">Tools</p>
        <h1 className="text-2xl font-extrabold text-brand-text">ツール一覧</h1>
        <p className="mt-3 max-w-3xl text-sm leading-relaxed text-gray-500">
          PC・配信・動画制作環境づくりで確認したい情報を、用途別の無料ツールとしてまとめています。
        </p>
      </header>

      <div className="grid gap-4 md:grid-cols-3">
        {SITE_TOOLS.map((tool) => (
          <Link
            key={tool.href}
            href={tool.href}
            className="group rounded-lg border border-gray-200 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-brand-green hover:shadow-md"
          >
            <div className="mb-4 flex items-start justify-between gap-4">
              <Image src={tool.icon} alt="" width={44} height={44} className="shrink-0" />
              <span className="rounded-full bg-brand-green/10 px-2.5 py-1 text-[11px] font-black text-brand-dark">
                {tool.label}
              </span>
            </div>
            <h2 className="text-lg font-extrabold text-brand-text">{tool.title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-gray-500">{tool.description}</p>
            <p className="mt-4 text-xs font-black text-brand-green">
              開く <span className="transition-transform group-hover:translate-x-1">→</span>
            </p>
          </Link>
        ))}
      </div>
    </main>
  )
}

