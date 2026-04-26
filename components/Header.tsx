import Link from 'next/link'
import { CATEGORIES } from '@/lib/notion'

export default function Header() {
  return (
    <header className="bg-brand-dark text-white shadow-md">
      <div className="max-w-5xl mx-auto px-4">
        <div className="flex items-center justify-between h-14">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-xl font-bold tracking-tight">
              <span className="text-brand-green">ガジェ</span>パス
            </span>
            <span className="text-xs text-gray-400 hidden sm:block">gadgepath.com</span>
          </Link>
          <nav className="flex items-center gap-4 text-sm">
            <Link href="/articles" className="hover:text-brand-green transition-colors">
              記事一覧
            </Link>
            <Link
              href="/articles"
              className="bg-brand-green text-brand-dark font-bold px-3 py-1 rounded hover:opacity-90 transition-opacity"
            >
              比較する
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
                className="flex items-center gap-1 whitespace-nowrap hover:text-brand-green transition-colors"
              >
                <span>{cat.emoji}</span>
                <span>{cat.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </header>
  )
}
