import Link from 'next/link'
import Image from 'next/image'

export default function Header() {
  return (
    <header className="bg-brand-dark text-white shadow-md">
      <div className="max-w-5xl mx-auto px-4">
        <div className="flex items-center justify-between h-14">
          <Link href="/" className="flex items-center">
            <Image
              src="/logo.png"
              alt="ガジェパス"
              width={160}
              height={40}
              className="h-9 w-auto"
              priority
            />
          </Link>
          <nav className="flex items-center gap-2 text-sm font-bold">
            <Link href="/tools/gear-finder" className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-white/20 hover:border-brand-green hover:text-brand-green hover:bg-brand-green/10 transition-all duration-200">
              <span>🔍</span> 機材検索
            </Link>
            <Link href="/tools/free-games" className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-white/20 hover:border-brand-green hover:text-brand-green hover:bg-brand-green/10 transition-all duration-200">
              <span>🎮</span> 無料ゲーム
            </Link>
            <Link href="/articles" className="px-3 py-1.5 rounded-full bg-brand-green text-white hover:bg-brand-green/80 transition-all duration-200">
              記事一覧
            </Link>
          </nav>
        </div>
      </div>
    </header>
  )
}
