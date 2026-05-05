import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { getPublishedArticles, CATEGORIES } from '@/lib/notion'
import ArticleCard from '@/components/ArticleCard'

export const revalidate = 3600

export const metadata: Metadata = {
  title: 'ガジェパス | PC・配信環境を診断できる無料ツール集',
  description:
    'CPU/GPU性能比較、配信環境チェッカー、機材検索、無料ゲーム情報など、PC・配信・動画制作環境づくりに役立つ無料ツールと比較記事をまとめています。',
}

const primaryTools = [
  {
    title: 'CPU・GPU性能比較',
    description: 'CPU、GPU、CPU+GPU構成を選んで、ゲーム性能、制作性能、AI処理、コスパを比較できます。',
    href: '/tools/spec-compare',
    icon: '/icons/pc.png',
    badge: '新着',
    accent: 'border-brand-green',
  },
  {
    title: '配信・動画環境チェッカー',
    description: '用途、悩み、予算を選ぶだけで、今の環境に足すべき機材を整理できます。',
    href: '/tools/streaming-checker',
    icon: '/icons/set.png',
    badge: '診断',
    accent: 'border-sky-400',
  },
  {
    title: '機材・ガジェット検索',
    description: 'マイク、カメラ、USBハブ、照明などをカテゴリや価格帯から探せます。',
    href: '/tools/gear-finder',
    icon: '/icons/capture.png',
    badge: '検索',
    accent: 'border-amber-400',
  },
  {
    title: '無料ゲーム情報',
    description: '期間限定で配布されているPCゲームやDLCをまとめて確認できます。',
    href: '/tools/free-games',
    icon: '/icons/ai.png',
    badge: '毎時更新',
    accent: 'border-violet-400',
  },
]

const plannedTools = [
  {
    title: 'USB帯域計算ツール',
    description: 'カメラ、キャプチャーボード、SSDを同時接続したときの帯域不足を判定。',
  },
  {
    title: '電源容量チェック',
    description: 'CPUとGPUの組み合わせから、推奨電源容量と余裕度を計算。',
  },
  {
    title: 'ゲームFPS目安チェッカー',
    description: 'GPU、解像度、画質設定から、狙いやすいフレームレートを整理。',
  },
]

const useCases = [
  { label: 'ゲームPC', href: '/tools/spec-compare', icon: '/icons/pc.png' },
  { label: '配信環境', href: '/tools/streaming-checker', icon: '/icons/mic.png' },
  { label: '動画制作', href: '/articles?category=pc', icon: '/icons/camera.png' },
  { label: '周辺機器', href: '/tools/gear-finder', icon: '/icons/hub.png' },
]

export default async function HomePage() {
  const articles = await getPublishedArticles().catch(() => [])
  const recent = articles.slice(0, 6)

  return (
    <>
      <section className="bg-brand-dark px-4 py-12 text-white">
        <div className="mx-auto grid max-w-5xl gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div>
            <p className="mb-3 text-xs font-black uppercase tracking-wider text-brand-green">
              Gadgepath Tools
            </p>
            <h1 className="text-2xl font-extrabold leading-tight tracking-tight sm:text-4xl">
              PC・配信環境を
              <br />
              ツールで比べて決める
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-gray-300">
              CPU/GPU性能、配信機材、周辺機器、無料ゲーム情報まで、購入前や環境づくりで迷いやすいポイントを無料ツールで整理できます。
              記事だけで読むのではなく、条件を入れて自分の構成に近い答えを探せるサイトへ移行中です。
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/tools/spec-compare"
                className="rounded-lg bg-brand-green px-5 py-3 text-sm font-black text-brand-dark transition-opacity hover:opacity-90"
              >
                性能比較ツールを使う
              </Link>
              <Link
                href="/tools/streaming-checker"
                className="rounded-lg border border-white/25 px-5 py-3 text-sm font-bold text-white transition-colors hover:border-brand-green hover:text-brand-green"
              >
                配信環境を診断する
              </Link>
            </div>
          </div>

          <div className="rounded-lg border border-white/10 bg-white/5 p-4">
            <div className="grid gap-3">
              {primaryTools.slice(0, 3).map((tool) => (
                <Link
                  key={tool.href}
                  href={tool.href}
                  className="group flex items-center gap-3 rounded-lg border border-white/10 bg-white px-3 py-3 text-brand-text transition-transform hover:-translate-y-0.5"
                >
                  <Image src={tool.icon} alt="" width={36} height={36} className="shrink-0" />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-black">{tool.title}</p>
                    <p className="truncate text-xs text-gray-500">{tool.description}</p>
                  </div>
                  <span className="ml-auto text-brand-green transition-transform group-hover:translate-x-1">→</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-10">
        <div className="mb-5 flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-wider text-brand-green">Tools</p>
            <h2 className="mt-1 text-xl font-extrabold text-brand-text">今すぐ使えるツール</h2>
          </div>
          <Link href="/articles" className="text-xs font-bold text-brand-green hover:underline">
            記事一覧も見る
          </Link>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {primaryTools.map((tool) => (
            <Link
              key={tool.href}
              href={tool.href}
              className={`group rounded-lg border-l-4 ${tool.accent} border-y border-r border-gray-200 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md`}
            >
              <div className="mb-4 flex items-start justify-between gap-4">
                <Image src={tool.icon} alt="" width={44} height={44} className="shrink-0" />
                <span className="rounded-full bg-brand-green/10 px-2.5 py-1 text-[11px] font-black text-brand-dark">
                  {tool.badge}
                </span>
              </div>
              <h3 className="text-lg font-extrabold text-brand-text">{tool.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-gray-500">{tool.description}</p>
              <p className="mt-4 text-xs font-black text-brand-green">
                ツールを開く <span className="transition-transform group-hover:translate-x-1">→</span>
              </p>
            </Link>
          ))}
        </div>
      </section>

      <section className="border-y border-gray-100 bg-white px-4 py-8">
        <div className="mx-auto grid max-w-5xl gap-6 md:grid-cols-[1fr_1fr] md:items-center">
          <div>
            <p className="text-xs font-black uppercase tracking-wider text-brand-green">Use Case</p>
            <h2 className="mt-1 text-lg font-extrabold text-brand-text">目的から選ぶ</h2>
            <p className="mt-2 text-sm leading-relaxed text-gray-500">
              ツールでざっくり絞り、必要なところだけ記事で深掘りする流れにしています。
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {useCases.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="flex items-center gap-3 rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-bold text-brand-text transition-colors hover:border-brand-green hover:bg-brand-green/5"
              >
                <Image src={item.icon} alt="" width={28} height={28} />
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-10">
        <div className="mb-5">
          <p className="text-xs font-black uppercase tracking-wider text-brand-green">Next</p>
          <h2 className="mt-1 text-lg font-extrabold text-brand-text">追加予定のツール</h2>
        </div>
        <div className="grid gap-3 md:grid-cols-3">
          {plannedTools.map((tool) => (
            <div key={tool.title} className="rounded-lg border border-dashed border-gray-300 bg-white/70 p-4">
              <p className="mb-2 text-xs font-black text-gray-400">準備中</p>
              <h3 className="text-sm font-extrabold text-brand-text">{tool.title}</h3>
              <p className="mt-2 text-xs leading-relaxed text-gray-500">{tool.description}</p>
            </div>
          ))}
        </div>
      </section>

      {recent.length > 0 && (
        <section className="mx-auto max-w-5xl px-4 pb-12">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-wider text-brand-green">Articles</p>
              <h2 className="mt-1 text-lg font-extrabold text-brand-text">最新記事</h2>
            </div>
            <Link href="/articles" className="text-xs font-bold text-brand-green hover:underline">
              すべて見る
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {recent.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        </section>
      )}

      <section className="bg-white px-4 py-10">
        <div className="mx-auto max-w-5xl">
          <h2 className="mb-5 text-lg font-extrabold text-brand-text">カテゴリから記事を探す</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {CATEGORIES.map((cat) => (
              <Link
                key={cat.slug}
                href={`/articles?category=${cat.slug}`}
                className="flex items-center gap-3 rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-bold text-brand-text transition-colors hover:border-brand-green hover:bg-brand-green/5"
              >
                <Image src={cat.icon} alt="" width={28} height={28} className="shrink-0" />
                <span>{cat.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
