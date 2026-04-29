import type { Metadata } from 'next'
import Script from 'next/script'
import './globals.css'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import NetworkBackground from '@/components/NetworkBackground'

const GA_ID = process.env.NEXT_PUBLIC_GA_ID

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
  verification: {
    google: 'JOarUW8UJe0EovzSD2P8B1dzYcoWJH2akScWqepSGvc',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body className="relative min-h-screen flex flex-col">
        <NetworkBackground />
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
        <div className="relative z-10 flex flex-col flex-1">
          <Header />
          <main className="flex-1">
            {children}
          </main>
          <Footer />
        </div>
      </body>
    </html>
  )
}
