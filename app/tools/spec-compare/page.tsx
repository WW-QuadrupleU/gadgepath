import type { Metadata } from 'next'
import SpecCompareTool from '@/components/SpecCompareTool'

export const metadata: Metadata = {
  title: 'CPU・GPU性能比較ツール | ガジェパス',
  description:
    'CPUとGPUを選んで、ベンチマーク、ゲーム性能、制作性能、消費電力、コスパを比較できる無料ツール。CPU+GPUの組み合わせ評価にも対応。',
}

export default function SpecComparePage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-5xl px-4 py-10">
        <header className="mb-8">
          <p className="mb-2 text-xs font-black uppercase tracking-wider text-brand-green">PC Performance Tool</p>
          <h1 className="text-2xl font-extrabold tracking-tight text-brand-text sm:text-3xl">
            CPU・GPU性能比較ツール
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-gray-500">
            CPU同士、GPU同士、CPU+GPU構成を選んで、ベンチマーク、ゲーム性能、画像処理・AI向け指標、消費電力、コスパを比較できます。
            旧世代を含めて、買い替えやBTO構成選びの目安に使えるようにしています。
          </p>
        </header>

        <SpecCompareTool />
      </div>
    </main>
  )
}

