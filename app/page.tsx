import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { getPublishedArticles } from '@/lib/notion'
import { SITE_TOOLS } from '@/lib/tools'
import ArticleCard from '@/components/ArticleCard'
import ToolCard from '@/components/ToolCard'

export const revalidate = 3600

export const metadata: Metadata = {
  title: 'ガジェパス | PC・配信環境を整理する無料ツール集',
  description:
    'CPU/GPU性能比較、機材・ガジェット検索、無料ゲーム情報など、PC・配信・動画制作環境づくりに役立つ無料ツールと記事をまとめています。',
}

export default async function HomePage() {
  const articles = await getPublishedArticles().catch(() => [])
  const recent = articles.slice(0, 9)
  const featuredTools = SITE_TOOLS.slice(0, 3)

  return (
    <>
      <section className="relative overflow-hidden bg-brand-dark px-4 py-14 text-white sm:py-18">
        <Image
          src="/images/tools/future-desk-diagnosis/quiet-optimizer.jpeg"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover opacity-30"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-brand-dark via-brand-dark/88 to-brand-dark/55" />
        <div className="relative mx-auto max-w-5xl">
          <p className="mb-3 text-xs font-black uppercase tracking-wider text-brand-green">
            Gadgepath Tools & Guides
          </p>
          <h1 className="max-w-3xl text-3xl font-extrabold leading-tight tracking-tight sm:text-5xl">
            目的に合うガジェットを、ツールで整理する。
          </h1>
          <p className="mt-5 max-w-2xl text-sm leading-relaxed text-gray-200 sm:text-base">
            PC、スマホ、配信機材、AIツールまで。スペック・価格・用途を横断して、選ぶ前に見ておきたい情報をまとめています。
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link
              href="/tools"
              className="rounded-lg bg-brand-green px-5 py-3 text-sm font-black text-brand-dark shadow-lg shadow-brand-green/20 transition hover:bg-lime-300"
            >
              ツール一覧を見る
            </Link>
            <Link
              href="/articles"
              className="rounded-lg border border-white/30 bg-white/10 px-5 py-3 text-sm font-black text-white backdrop-blur transition hover:border-brand-green hover:text-brand-green"
            >
              記事を読む
            </Link>
          </div>
          <div className="mt-10 flex max-w-3xl flex-wrap gap-2 border-t border-white/15 pt-5 text-xs font-bold text-gray-200">
            <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1.5">性能比較</span>
            <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1.5">価格チェック</span>
            <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1.5">機材検索</span>
            <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1.5">用途別ガイド</span>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-10">
        <div className="mb-6 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs font-black uppercase tracking-wider text-brand-green">Start Here</p>
            <h2 className="mt-1 text-2xl font-extrabold text-brand-text">まず使いたいツール</h2>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-gray-500">
              迷いがちな買い物や環境づくりを、診断・比較・用途別チェックで短く整理します。
            </p>
          </div>
          <Link href="/tools" className="text-sm font-black text-brand-green hover:underline">
            すべてのツール
          </Link>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {featuredTools.map((tool, index) => (
            <ToolCard key={tool.href} tool={tool} featured={index === 0} />
          ))}
        </div>
      </section>

      {recent.length > 0 && (
        <section className="mx-auto max-w-5xl px-4 pb-14">
          <div className="mb-6 flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-black uppercase tracking-wider text-brand-green">Articles</p>
              <h2 className="mt-1 text-2xl font-extrabold text-brand-text">最新のガイド</h2>
            </div>
            <Link href="/articles" className="shrink-0 text-sm font-black text-brand-green hover:underline">
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
