import { NextRequest, NextResponse } from 'next/server'
import { Client } from '@notionhq/client'
import { getProductsByArticleSlug } from '@/lib/notion'

const notion = new Client({ auth: process.env.NOTION_TOKEN })
const ARTICLES_DB = process.env.NOTION_ARTICLES_DB_ID!
const PROP_NAME = '商品ステータス'

// 「商品ステータス」selectプロパティをDBに追加（初回のみ・冪等）
async function ensureProperty() {
  await notion.databases.update({
    database_id: ARTICLES_DB,
    properties: {
      [PROP_NAME]: {
        select: {
          options: [
            { name: '✅ 完了',    color: 'green'  },
            { name: '⚠️ 一部不足', color: 'yellow' },
            { name: '❌ 未登録',  color: 'red'    },
          ],
        },
      },
    },
  })
}

// 商品データの充足度を判定
function judgeStatus(products: Awaited<ReturnType<typeof getProductsByArticleSlug>>): string {
  if (products.length === 0) return '❌ 未登録'
  const allComplete = products.every(p => p.imageUrl && p.rakutenUrl && p.price)
  return allComplete ? '✅ 完了' : '⚠️ 一部不足'
}

export async function GET(req: NextRequest) {
  // Vercel CronまたはCRON_SECRETを持つリクエストのみ許可
  const auth = req.headers.get('authorization')
  const secret = process.env.CRON_SECRET
  if (secret && auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    await ensureProperty()

    // 全記事を取得（公開済み）
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
      const status = judgeStatus(products)

      await notion.pages.update({
        page_id: page.id,
        properties: {
          [PROP_NAME]: { select: { name: status } },
        },
      })

      results.push({ slug, status, count: products.length })
    }

    return NextResponse.json({ ok: true, updated: results.length, results })
  } catch (err: any) {
    console.error('[sync-status]', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
