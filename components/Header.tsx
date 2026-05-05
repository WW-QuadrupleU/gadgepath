import Link from 'next/link'
import Image from 'next/image'

export default function Header() {
  return (
    <header className="bg-brand-dark text-white shadow-md">
      <div className="mx-auto max-w-5xl px-4">
        <div className="flex h-14 items-center justify-between gap-3">
          <Link href="/" className="flex shrink-0 items-center">
            <Image
              src="/logo.png"
              alt="ガジェパス"
              width={160}
              height={40}
              className="h-9 w-auto"
              priority
            />
          </Link>
          <nav className="flex min-w-0 items-center gap-1.5 text-xs font-bold">
            <Link href="/tools/spec-compare" className="flex items-center gap-1 rounded-full border border-white/20 px-2.5 py-1.5 transition-all duration-200 hover:border-brand-green hover:bg-brand-green/10 hover:text-brand-green">
              <span>PC</span><span className="hidden sm:inline">性能比較</span>
            </Link>
            <Link href="/tools/gear-finder" className="flex items-center gap-1 rounded-full border border-white/20 px-2.5 py-1.5 transition-all duration-200 hover:border-brand-green hover:bg-brand-green/10 hover:text-brand-green">
              <span>機材検索</span>
            </Link>
            <Link href="/tools/free-games" className="flex items-center gap-1 rounded-full border border-white/20 px-2.5 py-1.5 transition-all duration-200 hover:border-brand-green hover:bg-brand-green/10 hover:text-brand-green">
              <span>無料ゲーム</span>
            </Link>
            <Link href="/articles" className="rounded-full bg-brand-green px-3 py-1.5 text-white transition-all duration-200 hover:bg-brand-green/80">
              記事一覧
            </Link>
          </nav>
        </div>
      </div>
    </header>
  )
}
