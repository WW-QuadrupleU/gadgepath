import { Client } from '@notionhq/client'
import dotenv from 'dotenv'
import { resolve } from 'path'

dotenv.config({ path: resolve(process.cwd(), '.env.local') })

const notion = new Client({ auth: process.env.NOTION_TOKEN })
const ARTICLES_DB = process.env.NOTION_ARTICLES_DB_ID
const PRODUCTS_DB = process.env.NOTION_PRODUCTS_DB_ID

const ARTICLE_SLUG = 'headset-comparison-2026'

async function main() {
  const articleRes = await notion.databases.query({
    database_id: ARTICLES_DB,
    filter: { property: 'スラッグ', rich_text: { equals: ARTICLE_SLUG } },
  })
  
  if (articleRes.results.length === 0) {
    console.error(`Article ${ARTICLE_SLUG} not found.`)
    return
  }

  const productsRes = await notion.databases.query({
    database_id: PRODUCTS_DB,
    filter: { property: '記事スラッグ', multi_select: { contains: ARTICLE_SLUG } },
    sorts: [{ property: '表示順', direction: 'ascending' }],
  })
  
  console.log("=== DB上の商品価格 ===")
  productsRes.results.forEach(p => {
    const name = p.properties['商品名']?.title?.[0]?.plain_text || ''
    const priceText = p.properties['価格']?.rich_text?.[0]?.plain_text || 'なし'
    console.log(`${name}: ${priceText}`)
  })

  console.log("\n=== 記事本文の該当ブロック ===")
  const pageId = articleRes.results[0].id
  let hasMore = true
  let startCursor = undefined
  const blocks = []
  
  while (hasMore) {
    const res = await notion.blocks.children.list({ block_id: pageId, start_cursor: startCursor, page_size: 100 })
    blocks.push(...res.results)
    hasMore = res.has_more
    startCursor = res.next_cursor
  }

  blocks.forEach((b, i) => {
    const type = b.type
    if (type === 'heading_2' || type === 'heading_3' || type === 'heading_4' || type === 'numbered_list_item') {
      const text = b[type].rich_text.map(rt => rt.plain_text).join('')
      console.log(`[${i}] ${type}: ${text}`)
    }
  })
}

main().catch(console.error)
