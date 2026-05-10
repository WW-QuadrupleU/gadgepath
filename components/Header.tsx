import Link from 'next/link'
import Image from 'next/image'

export default function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-brand-dark/95 text-white shadow-md backdrop-blur">
      <div className="mx-auto max-w-5xl px-4">
        <div className="flex h-16 items-center justify-between gap-3">
          <Link href="/" className="flex shrink-0 items-center">
            <Image
              src="/logo.png"
              alt="ガジェパス"
              width={160}
              height={40}
              className="h-9 w-auto sm:h-10"
              priority
            />
          </Link>
          <nav className="flex min-w-0 items-center gap-1.5 text-xs font-bold sm:gap-2">
            <Link href="/tools" className="rounded-full bg-brand-green px-3 py-1.5 text-white transition-all duration-200 hover:bg-brand-green/80 sm:px-4">
              ツール一覧
            </Link>
            <Link href="/articles" className="rounded-full border border-white/20 px-3 py-1.5 transition-all duration-200 hover:border-brand-green hover:bg-brand-green/10 hover:text-brand-green sm:px-4">
              記事一覧
            </Link>
          </nav>
        </div>
      </div>
    </header>
  )
}
