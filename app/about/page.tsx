import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '運営者情報 | ガジェパス',
  description: 'ガジェパスの運営者情報、編集方針、商品選定基準、情報更新と修正受付の方針を掲載しています。',
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
                ['開設', '2026年4月'],
                ['運営者', 'QU'],
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
            ガジェパスは、配信・動画制作・在宅ワーク・PCゲーム環境を整えたい人が、機材選びや設定で迷う時間を減らすために運営している情報サイトです。
          </p>
          <p className="mt-2">
            マイク・Webカメラ・照明・ヘッドセットなどのガジェット比較に加えて、OBS設定、USB接続の注意点、無料ゲーム情報など、デジタル環境づくりに役立つ情報を用途別に整理しています。
          </p>
        </section>

        <section>
          <h2 className="font-bold text-base text-brand-text mb-2">運営者について</h2>
          <p>
            配信・動画制作・PC周辺機器・AIツールに関する公開情報を継続的に確認し、初心者でも判断しやすい形に整理しています。
            実機レビューではない記事では、公式仕様、販売ページ、公開レビュー、口コミ傾向、価格・在庫情報を分けて扱い、未確認の情報を体験談のように書かないことを重視しています。
          </p>
        </section>

        <section>
          <h2 className="font-bold text-base text-brand-text mb-2">編集方針・商品選定基準</h2>
          <p>
            商品紹介記事では、用途との相性、価格帯、国内での入手性、販売状況、仕様のわかりやすさ、公開レビューで指摘されている強みと弱みを確認します。
            価格の安さだけで順位を決めるのではなく、初心者が失敗しにくいか、代替候補と比べて選ぶ理由があるかを重視します。
          </p>
          <p className="mt-2">
            中古品、整備済み品、販売終了品、リンク先の商品名が一致しない商品は、原則としておすすめから外す方針です。
            商品DBや販売ページの情報と記事本文に差がある場合は、確認できる最新の販売情報を優先して修正します。
          </p>
        </section>

        <section>
          <h2 className="font-bold text-base text-brand-text mb-2">ゲーム情報の扱い</h2>
          <p>
            無料ゲームやPCゲーム関連の記事は、配信・制作環境と相性のよいデジタル情報として掲載しています。
            配布期間、対応プラットフォーム、必要スペック、注意点などを確認し、読者が安全に判断できる形で整理することを目指します。
          </p>
        </section>

        <section>
          <h2 className="font-bold text-base text-brand-text mb-2">情報更新・修正方針</h2>
          <p>
            ガジェットの価格、在庫、仕様、対応アプリ、配信サービスの仕様は変動します。
            重要な記事は定期的に見直し、古い情報や誤りが見つかった場合は更新します。
          </p>
          <p className="mt-2">
            掲載内容に誤りや古い情報がある場合は、お問い合わせページまたはメールにてご連絡ください。
            確認できた内容から順次修正します。
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
