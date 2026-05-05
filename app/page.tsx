import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { getPublishedArticles } from '@/lib/notion'
import ArticleCard from '@/components/ArticleCard'

export const revalidate = 3600

export const metadata: Metadata = {
  title: 'ガジェパス | PC・配信環境を整理する無料ツール集',
  description:
    'CPU/GPU性能比較、機材・ガジェット検索、無料ゲーム情報など、PC・配信・動画制作環境づくりに役立つ無料ツールと記事をまとめています。',
}

const tools = [
  {
    title: 'CPU・GPU性能比較',
    description: 'CPU、GPU、CPU+GPU構成を選び、ゲーム性能、制作性能、AI処理、消費電力、コスパを比較できます。',
    href: '/tools/spec-compare',
    icon: '/icons/pc.png',
    label: '性能比較',
  },
  {
    title: '機材・ガジェット検索',
    description: 'マイク、カメラ、USBハブ、照明、ストレージなどをカテゴリや価格帯から探せます。',
    href: '/tools/gear-finder',
    icon: '/icons/capture.png',
    label: '機材検索',
  },
  {
    title: '無料ゲーム情報',
    description: '期間限定で配布されているPCゲームやDLCをまとめて確認できます。',
    href: '/tools/free-games',
    icon: '/icons/ai.png',
    label: '毎時更新',
  },
]

export default async function HomePage() {
  const articles = await getPublishedArticles().catch(() => [])
  const recent = articles.slice(0, 9)

  return (
    <>
      <section className="bg-brand-dark px-4 py-12 text-white">
        <div className="mx-auto max-w-5xl">
          <p className="mb-3 text-xs font-black uppercase tracking-wider text-brand-green">
            Gadgepath Tools
          </p>
          <h1 className="max-w-3xl text-2xl font-extrabold leading-tight tracking-tight sm:text-4xl">
            PC・配信環境を整理する無料ツール集
          </h1>
          <p className="mt-4 max-w-3xl text-sm leading-relaxed text-gray-300">
            CPU/GPU性能、機材選び、無料ゲーム情報など、PC環境づくりで確認したい情報をツールと記事で整理しています。
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-10">
        <div className="mb-5">
          <p className="text-xs font-black uppercase tracking-wider text-brand-green">Tools</p>
          <h2 className="mt-1 text-xl font-extrabold text-brand-text">ツール一覧</h2>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {tools.map((tool) => (
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
              <h3 className="text-lg font-extrabold text-brand-text">{tool.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-gray-500">{tool.description}</p>
              <p className="mt-4 text-xs font-black text-brand-green">
                開く <span className="transition-transform group-hover:translate-x-1">→</span>
              </p>
            </Link>
          ))}
        </div>
      </section>

      {recent.length > 0 && (
        <section className="mx-auto max-w-5xl px-4 pb-12">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-wider text-brand-green">Articles</p>
              <h2 className="mt-1 text-xl font-extrabold text-brand-text">記事一覧</h2>
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
    </>
  )
}
