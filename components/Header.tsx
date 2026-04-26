import Link from 'next/link'
import Image from 'next/image'
import { CATEGORIES } from '@/lib/notion'

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
      <div className="border-t border-gray-700">
        <div className="max-w-5xl mx-auto px-4">
          <div className="flex gap-4 overflow-x-auto py-2 text-xs text-gray-300 scrollbar-hide">
            {CATEGORIES.map((cat) => (
              <Link
                key={cat.slug}
                href={`/articles?category=${cat.slug}`}
                className="flex items-center gap-1.5 whitespace-nowrap hover:text-brand-green transition-colors"
              >
                <Image src={cat.icon} alt={cat.name} width={16} height={16} className="opacity-80" />
                <span>{cat.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </header>
  )
}
