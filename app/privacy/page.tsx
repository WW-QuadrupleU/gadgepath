import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'プライバシーポリシー | ガジェパス',
  description: 'ガジェパスのプライバシーポリシーページです。',
}

export default function PrivacyPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <h1 className="text-xl font-bold text-brand-text mb-2">プライバシーポリシー</h1>
      <p className="text-xs text-gray-400 mb-8">最終更新日：2025年4月26日</p>

      <div className="space-y-8 text-sm text-gray-700 leading-relaxed">

        <section>
          <h2 className="font-bold text-base text-brand-text mb-2">基本方針</h2>
          <p>ガジェパス（gadgepath.com、以下「当サイト」）は、ユーザーの個人情報の取り扱いについて以下のとおりプライバシーポリシーを定めます。</p>
        </section>

        <section>
          <h2 className="font-bold text-base text-brand-text mb-2">個人情報の収集と利用</h2>
          <p>当サイトでは、お問い合わせの際にメールアドレス等の個人情報をご提供いただく場合があります。収集した情報はお問い合わせへの返信のみに使用し、第三者への提供・開示は行いません。</p>
        </section>

        <section>
          <h2 className="font-bold text-base text-brand-text mb-2">アフィリエイトプログラムについて</h2>
          <p>当サイトはAmazonアソシエイト・プログラムおよび楽天アフィリエイトプログラムに参加しています。記事内のリンクを経由してご購入いただいた場合、当サイトは紹介料を受け取ることがあります。ユーザーの購入金額は通常と変わりません。</p>
          <p className="mt-2">これらのプログラムはCookieを使用して、適切なリンク元サイトを特定します。</p>
        </section>

        <section>
          <h2 className="font-bold text-base text-brand-text mb-2">アクセス解析ツールについて</h2>
          <p>当サイトはGoogle Inc.が提供するアクセス解析ツール「Googleアナリティクス（Google Analytics 4）」を使用しています。このツールはCookieを使用してデータを収集しますが、個人を特定する情報は含まれません。収集したデータはサイト改善のために使用します。</p>
          <p className="mt-2">Googleアナリティクスによるデータ収集を無効にするには、<a href="https://tools.google.com/dlpage/gaoptout" target="_blank" rel="noopener noreferrer" className="text-brand-green underline hover:opacity-80">Googleアナリティクス オプトアウトアドオン</a>をブラウザにインストールしてください。</p>
          <p className="mt-2">Googleによるデータの収集・処理の詳細については、<a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-brand-green underline hover:opacity-80">Googleのプライバシーポリシー</a>をご確認ください。</p>
        </section>

        <section>
          <h2 className="font-bold text-base text-brand-text mb-2">広告の配信について</h2>
          <p>当サイトは、Google Inc.が提供する広告配信サービス「Google AdSense（グーグルアドセンス）」を利用しています。Google AdSenseはCookieを使用して、ユーザーがこのサイトや他のサイトに以前アクセスした際の情報に基づいて広告を配信します。</p>
          <p className="mt-2">Googleによる広告のCookieを使用しないようにするには、<a href="https://www.google.com/settings/ads" target="_blank" rel="noopener noreferrer" className="text-brand-green underline hover:opacity-80">Googleの広告設定ページ</a>にアクセスしてオプトアウトしてください。また、<a href="https://www.aboutads.info/choices/" target="_blank" rel="noopener noreferrer" className="text-brand-green underline hover:opacity-80">www.aboutads.info</a>にアクセスすることで、第三者配信事業者のCookieを使用しないようにすることができます。</p>
          <p className="mt-2">詳細はGoogleの<a href="https://policies.google.com/technologies/ads" target="_blank" rel="noopener noreferrer" className="text-brand-green underline hover:opacity-80">広告に関するポリシー</a>をご確認ください。</p>
        </section>

        <section>
          <h2 className="font-bold text-base text-brand-text mb-2">Cookieについて</h2>
          <p>当サイトではCookieを使用しています。Cookieはウェブサイトの利便性向上や、アクセス解析・広告配信のために利用されます。ブラウザの設定によりCookieを無効にすることができますが、一部機能が制限される場合があります。</p>
        </section>

        <section>
          <h2 className="font-bold text-base text-brand-text mb-2">免責事項</h2>
          <p>当サイトの情報は正確性・有用性の確保に努めていますが、内容の完全性・正確性・有用性を保証するものではありません。当サイトの情報を参考にした結果について、運営者は一切の責任を負いません。</p>
          <p className="mt-2">また、当サイトからリンクしている外部サイトについては、当サイトが管理するものではなく、その内容について責任を負いません。</p>
        </section>

        <section>
          <h2 className="font-bold text-base text-brand-text mb-2">プライバシーポリシーの変更</h2>
          <p>本ポリシーは法令の変更やサービス内容の変更等に応じて、予告なく改訂する場合があります。最新の内容は本ページにてご確認ください。</p>
        </section>

        <section>
          <h2 className="font-bold text-base text-brand-text mb-2">お問い合わせ</h2>
          <p>本ポリシーに関するお問い合わせは、下記までご連絡ください。</p>
          <p className="mt-2">メール：<a href="mailto:contact@gadgepath.com" className="text-brand-green underline hover:opacity-80">contact@gadgepath.com</a></p>
        </section>

      </div>
    </div>
  )
}
