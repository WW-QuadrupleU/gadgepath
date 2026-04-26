import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'アフィリエイト開示',
}

export default function DisclosurePage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <h1 className="text-xl font-bold text-brand-text mb-6">アフィリエイト開示</h1>
      <div className="space-y-6 text-sm text-gray-700 leading-relaxed">
        <p>
          ガジェパス（gadgepath.com）は、以下のアフィリエイトプログラムに参加しています。
          記事内のリンクから商品を購入いただいた際に、サイト運営者が一定の報酬を受け取る場合があります。
        </p>
        <section>
          <h2 className="font-bold text-base text-brand-text mb-2">参加プログラム</h2>
          <ul className="list-disc list-inside space-y-1">
            <li>Amazonアソシエイト・プログラム</li>
            <li>楽天アフィリエイト（もしもアフィリエイト経由）</li>
          </ul>
        </section>
        <section>
          <h2 className="font-bold text-base text-brand-text mb-2">収益と記事の関係</h2>
          <p>
            アフィリエイト収益は当サイトの運営・維持に充てています。
            ただし、収益の発生有無にかかわらず、記事の内容は運営者の独自の判断・経験にもとづいており、
            特定製品の購入を強制するものではありません。
          </p>
        </section>
        <section>
          <h2 className="font-bold text-base text-brand-text mb-2">価格・在庫について</h2>
          <p>
            記事内の価格は執筆時点のものです。実際の価格は変動する場合があります。
            購入前に各販売ページにて最新情報をご確認ください。
          </p>
        </section>
      </div>
    </div>
  )
}
