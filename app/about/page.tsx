import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '運営者情報 | ガジェパス',
  description: 'ガジェパスの運営者情報・サイト概要ページです。',
}

export default function AboutPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <h1 className="text-xl font-bold text-brand-text mb-8">運営者情報</h1>

      <div className="space-y-8 text-sm text-gray-700 leading-relaxed">

        <section>
          <h2 className="font-bold text-base text-brand-text mb-3">サイト概要</h2>
          <table className="w-full text-sm border-collapse">
            <tbody>
              {[
                ['サイト名', 'ガジェパス'],
                ['URL', 'https://gadgepath.com'],
                ['開設', '2025年4月'],
                ['運営者', 'choieigo'],
                ['連絡先', 'contact@gadgepath.com'],
              ].map(([label, value]) => (
                <tr key={label} className="border-b border-gray-100">
                  <td className="py-2.5 pr-4 font-medium text-gray-500 whitespace-nowrap w-28">{label}</td>
                  <td className="py-2.5">{value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section>
          <h2 className="font-bold text-base text-brand-text mb-2">サイトの目的</h2>
          <p>
            ガジェパスは、YouTuber・TikToker・在宅ワーカーなどのクリエイターが「どの機材を選べばいいか分からない」という悩みを解決するために運営しているガジェット比較サイトです。
          </p>
          <p className="mt-2">
            マイク・Webカメラ・照明・ヘッドセットなど、配信・動画制作に必要な機材を用途・予算別に徹底比較し、実際の使用経験をもとにした情報をお届けします。
          </p>
        </section>

        <section>
          <h2 className="font-bold text-base text-brand-text mb-2">運営者について</h2>
          <p>
            YouTubeおよびTikTokで活動するクリエイターとして、日々配信・動画制作に取り組んでいます。
            実際に購入・使用した機材の経験をベースに、スペック表だけでは分からないリアルな情報を発信しています。
          </p>
        </section>

        <section>
          <h2 className="font-bold text-base text-brand-text mb-2">収益について</h2>
          <p>
            当サイトはAmazonアソシエイト・プログラムおよび楽天アフィリエイトプログラムに参加しており、記事内のリンクを経由してご購入いただいた場合に紹介料を受け取ることがあります。
            また、広告サービスを掲載することがあります。
          </p>
          <p className="mt-2">
            収益はサイトの運営・コンテンツ制作に充てています。紹介料の有無が記事の内容・評価に影響することはありません。
          </p>
        </section>

        <section>
          <h2 className="font-bold text-base text-brand-text mb-2">免責事項</h2>
          <p>
            掲載している価格・仕様・在庫状況は執筆時点の情報であり、変動する場合があります。
            購入の際は各販売ページにて最新情報をご確認ください。
            本サイトの情報を参考にした結果について、運営者は一切の責任を負いません。
          </p>
        </section>

        <section>
          <h2 className="font-bold text-base text-brand-text mb-2">お問い合わせ</h2>
          <p>
            ご意見・ご質問・掲載内容に関するご指摘などは、下記メールアドレスまでお気軽にご連絡ください。
          </p>
          <p className="mt-2">
            <a href="mailto:contact@gadgepath.com" className="text-brand-green underline hover:opacity-80">
              contact@gadgepath.com
            </a>
          </p>
        </section>

      </div>
    </div>
  )
}
