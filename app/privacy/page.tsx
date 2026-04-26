import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'プライバシーポリシー',
}

export default function PrivacyPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <h1 className="text-xl font-bold text-brand-text mb-6">プライバシーポリシー</h1>
      <div className="space-y-6 text-sm text-gray-700 leading-relaxed">
        <section>
          <h2 className="font-bold text-base text-brand-text mb-2">個人情報の収集</h2>
          <p>当サイトでは、お問い合わせフォームなどを通じて個人情報を収集することがあります。収集した情報はお問い合わせへの返信のみに使用し、第三者への提供は行いません。</p>
        </section>
        <section>
          <h2 className="font-bold text-base text-brand-text mb-2">アクセス解析</h2>
          <p>当サイトではGoogleアナリティクス等のアクセス解析ツールを使用することがあります。これらのツールはCookieを使用してデータを収集しますが、個人を特定する情報は含みません。</p>
        </section>
        <section>
          <h2 className="font-bold text-base text-brand-text mb-2">Cookieの使用</h2>
          <p>当サイトおよび掲載しているアフィリエイトリンクはCookieを使用する場合があります。ブラウザの設定によりCookieを無効にすることができますが、一部機能が制限される場合があります。</p>
        </section>
        <section>
          <h2 className="font-bold text-base text-brand-text mb-2">改訂</h2>
          <p>本プライバシーポリシーは予告なく変更する場合があります。最新の内容をご確認ください。</p>
        </section>
      </div>
    </div>
  )
}
