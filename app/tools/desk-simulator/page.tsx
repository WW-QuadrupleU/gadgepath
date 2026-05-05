import type { Metadata } from 'next'
import DeskSimulator from '@/components/DeskSimulator'

export const metadata: Metadata = {
  title: 'デスクレイアウトシミュレーター',
  description:
    'モニター・PC・マイク・スピーカー・ゲーム機などをドラッグ＆ドロップでデスク上に配置できる無料シミュレーター。実寸スケールで配置感を事前にチェックできます。',
}

export const revalidate = 604800

export default function DeskSimulatorPage() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <header className="mb-8">
        <p className="mb-2 text-xs font-black uppercase tracking-wider text-brand-green">Desk Simulator</p>
        <h1 className="text-2xl font-extrabold text-brand-text">
          🪑 デスクレイアウトシミュレーター
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-relaxed text-gray-500">
          デスクサイズを選び、モニター・PC・マイク・スピーカー・ゲーム機などをドラッグで配置。
          実寸スケールで「これ置ける？」を事前にチェックできます。
          作成したレイアウトはURLでシェア可能です。
        </p>
      </header>

      <DeskSimulator />

      <section className="mt-10 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <h2 className="mb-3 text-base font-bold text-brand-text">使い方</h2>
        <ol className="list-decimal space-y-1 pl-6 text-sm leading-relaxed text-gray-600">
          <li>「デスクサイズ」プルダウンから自分のデスク幅・奥行きに近いものを選択</li>
          <li>「アイテムを追加」で必要なものをクリックして追加</li>
          <li>追加されたアイテムをドラッグで好きな位置に配置</li>
          <li>選択中のアイテムは「90°回転」「削除」が可能</li>
          <li>「URLで共有」で現在のレイアウトをURLでシェア</li>
        </ol>
        <p className="mt-3 text-xs text-gray-400">
          ※ 寸法は一般的なモデルの参考値です。実際の購入前は商品ページの正確なサイズをご確認ください。
        </p>
      </section>
    </main>
  )
}
