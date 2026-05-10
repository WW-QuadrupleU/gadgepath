import type { Metadata } from 'next'
import FutureDeskDiagnosisTool from '@/components/FutureDeskDiagnosisTool'

export const metadata: Metadata = {
  title: '未来デスク・ガジェット性格診断 | ガジェパス',
  description:
    '8問でガジェット性格タイプ、理想の未来デスク、買う順番、避けるべき買い物がわかる無料診断ツールです。',
}

export default function FutureDeskDiagnosisPage() {
  return (
    <main className="min-h-screen bg-[#fffaf3]">
      <div className="mx-auto max-w-6xl px-4 py-10">
        <header className="mb-8">
          <p className="mb-2 text-xs font-black uppercase tracking-wider text-brand-green">Future Desk Diagnosis</p>
          <h1 className="max-w-4xl text-3xl font-black leading-tight tracking-tight text-brand-text sm:text-5xl">
            未来デスク・ガジェット性格診断
          </h1>
          <p className="mt-4 max-w-3xl text-sm font-bold leading-relaxed text-gray-600">
            あなたの買い物傾向、理想の雰囲気、いまの不満から、ぴったりの未来デスクタイプを診断します。
            かわいい結果カードで、最初に買うべきものまで整理できます。
          </p>
        </header>

        <FutureDeskDiagnosisTool />
      </div>
    </main>
  )
}

