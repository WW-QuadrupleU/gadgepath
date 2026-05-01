import type { Metadata } from 'next'
import Script from 'next/script'
import './globals.css'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

const GA_ID = process.env.NEXT_PUBLIC_GA_ID

export const metadata: Metadata = {
  title: {
    default: 'ガジェパス | 配信・制作・PC環境の選び方ガイド',
    template: '%s | ガジェパス',
  },
  description: 'ガジェパスは、配信・動画制作・在宅ワーク・PCゲーム環境を整えたい人向けに、ガジェット比較、設定ガイド、トラブル対策、無料ゲーム情報を整理するデジタル環境ナビです。',
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
  verification: {
    google: 'JOarUW8UJe0EovzSD2P8B1dzYcoWJH2akScWqepSGvc',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body className="min-h-screen flex flex-col">
        {GA_ID && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
              strategy="afterInteractive"
            />
            <Script id="google-analytics" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${GA_ID}');
              `}
            </Script>
          </>
        )}
        <Header />
        <main className="flex-1">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  )
}
