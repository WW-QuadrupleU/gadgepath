import { NextResponse } from 'next/server'
import { Client } from '@notionhq/client'
import { getProductsByArticleSlug } from '@/lib/notion'

const notion = new Client({ auth: process.env.NOTION_TOKEN })
const ARTICLES_DB = process.env.NOTION_ARTICLES_DB_ID!

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET
  if (secret) {
    const auth = request.headers.get('authorization')
    if (auth !== `Bearer ${secret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
  }

  try {
    const res = await notion.databases.query({
      database_id: ARTICLES_DB,
      filter: { property: 'ステータス', select: { equals: '公開済み' } },
    })

    const results: { slug: string; status: string; count: number }[] = []

    for (const page of res.results) {
      const p = page as any
      const slug: string = p.properties['スラッグ']?.rich_text[0]?.plain_text || ''
      if (!slug) continue

      const products = await getProductsByArticleSlug(slug)
      let status: string

      if (products.length === 0) {
        status = '未着手'
      } else if (products.every((p) => p.imageUrl && p.rakutenUrl && p.price)) {
        status = '完了'
      } else {
        status = '進行中'
      }

      await notion.pages.update({
        page_id: page.id,
        properties: {
          商品データ登録: { status: { name: status } },
        },
      })

      results.push({ slug, status, count: products.length })
    }

    return NextResponse.json({ ok: true, updated: results.length, results })
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error('[sync-status]', msg)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
