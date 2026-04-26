import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'このサイトについて',
  description: 'ガジェパスの運営者情報・サイト概要',
}

export default function AboutPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <h1 className="text-xl font-bold text-brand-text mb-6">このサイトについて</h1>
      <div className="space-y-6 text-sm text-gray-700 leading-relaxed">
        <section>
          <h2 className="font-bold text-base text-brand-text mb-2">サイト概要</h2>
          <p>
            ガジェパス（gadgepath.com）は、YouTuber・TikToker・在宅ワーカーなどのクリエイターを対象とした、ガジェット・PC周辺機器の比較情報サイトです。
            マイク・カメラ・照明・ヘッドセットなど、配信・動画制作に必要な機材を用途・予算別に徹底比較し、最適な機材選びをサポートします。
          </p>
        </section>
        <section>
          <h2 className="font-bold text-base text-brand-text mb-2">運営者</h2>
          <p>
            本サイトはYouTubeおよびTikTokで活動するクリエイターが運営しています。
            実際の配信・動画制作の経験をもとに、リアルな使用感や選び方のポイントをお伝えします。
          </p>
        </section>
        <section>
          <h2 className="font-bold text-base text-brand-text mb-2">免責事項</h2>
          <p>
            本サイトの情報は執筆時点のものであり、価格・仕様・在庫状況は変動します。
            購入の際は各販売ページにて最新情報をご確認ください。
            本サイトの情報を参考にした結果について、運営者は一切の責任を負いません。
          </p>
        </section>
      </div>
    </div>
  )
}
