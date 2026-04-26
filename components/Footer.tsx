import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-brand-dark text-gray-400 mt-16">
      <div className="max-w-5xl mx-auto px-4 py-10">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-8 mb-8">
          <div>
            <p className="text-white font-bold mb-3">
              <span className="text-brand-green">ガジェ</span>パス
            </p>
            <p className="text-xs leading-relaxed">
              クリエイター・在宅ワーカー向けガジェット比較サイト。用途・予算別に最適な機材選びをサポートします。
            </p>
          </div>
          <div>
            <p className="text-white font-semibold mb-3 text-sm">カテゴリ</p>
            <ul className="space-y-1 text-xs">
              <li><Link href="/articles?category=mic" className="hover:text-brand-green transition-colors">🎙️ マイク</Link></li>
              <li><Link href="/articles?category=camera" className="hover:text-brand-green transition-colors">📷 カメラ</Link></li>
              <li><Link href="/articles?category=light" className="hover:text-brand-green transition-colors">💡 照明</Link></li>
              <li><Link href="/articles?category=headset" className="hover:text-brand-green transition-colors">🎧 ヘッドセット</Link></li>
              <li><Link href="/articles?category=set" className="hover:text-brand-green transition-colors">📦 機材セット</Link></li>
            </ul>
          </div>
          <div>
            <p className="text-white font-semibold mb-3 text-sm">サイト情報</p>
            <ul className="space-y-1 text-xs">
              <li><Link href="/about" className="hover:text-brand-green transition-colors">運営者情報</Link></li>
              <li><Link href="/privacy" className="hover:text-brand-green transition-colors">プライバシーポリシー</Link></li>
              <li><Link href="/disclosure" className="hover:text-brand-green transition-colors">アフィリエイト開示</Link></li>
              <li><Link href="/contact" className="hover:text-brand-green transition-colors">お問い合わせ</Link></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-700 pt-6 text-xs text-center">
          <p className="mb-1">当サイトはAmazonアソシエイト・楽天アフィリエイトプログラムに参加しています。</p>
          <p>© 2026 ガジェパス(gadgepath.com) All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
