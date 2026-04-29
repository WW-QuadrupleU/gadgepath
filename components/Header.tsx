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
          <nav className="flex items-center gap-4 text-sm">
            <Link href="/articles" className="hover:text-brand-green transition-colors">
              記事一覧
            </Link>
          </nav>
        </div>
      </div>
    </header>
  )
}
