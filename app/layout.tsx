import type { Metadata } from 'next'
import './globals.css'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

export const metadata: Metadata = {
  title: {
    default: 'ガジェパス | クリエイター・在宅ワーカー向けガジェット比較',
    template: '%s | ガジェパス',
  },
  description: 'YouTuber・TikToker・在宅ワーカー向けに、マイク・カメラ・照明・ヘッドセットなどの機材を徹底比較。用途・予算別に最適なガジェット選びをサポートします。',
  metadataBase: new URL('https://gadgepath.com'),
  openGraph: {
    siteName: 'ガジェパス',
    locale: 'ja_JP',
    type: 'website',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  )
}
