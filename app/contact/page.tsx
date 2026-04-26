import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'お問い合わせ | ガジェパス',
  description: 'ガジェパスへのお問い合わせページです。',
}

export default function ContactPage() {
  return (
    <div className="max-w-xl mx-auto px-4 py-10">
      <h1 className="text-xl font-bold text-brand-text mb-2">お問い合わせ</h1>
      <p className="text-sm text-gray-500 mb-8">
        ご意見・ご質問・掲載内容に関するご指摘などは、以下のメールアドレスよりお気軽にご連絡ください。
        通常2〜3営業日以内にご返信いたします。
      </p>

      <div className="bg-white border border-gray-200 rounded-xl px-6 py-5 text-sm">
        <p className="text-gray-500 mb-1">メールアドレス</p>
        <a
          href="mailto:gadgepath@gmail.com"
          className="text-brand-green font-medium text-base underline hover:opacity-80"
        >
          gadgepath@gmail.com
        </a>
      </div>

      <div className="mt-8 text-xs text-gray-400 space-y-1">
        <p>※ スパムメール防止のため、返信までにお時間をいただく場合があります。</p>
        <p>※ 営利目的のご連絡・リンク掲載依頼等にはお応えできない場合があります。</p>
      </div>
    </div>
  )
}
