import { Client } from '@notionhq/client'
import { NotionToMarkdown } from 'notion-to-md'
import dotenv from 'dotenv'
import { resolve } from 'path'

dotenv.config({ path: resolve(process.cwd(), '.env.local') })

const notion = new Client({ auth: process.env.NOTION_TOKEN })
const ARTICLES_DB = process.env.NOTION_ARTICLES_DB_ID
const PRODUCTS_DB = process.env.NOTION_PRODUCTS_DB_ID

async function main() {
  const articleRes = await notion.databases.query({
    database_id: ARTICLES_DB,
    filter: { property: 'スラッグ', rich_text: { equals: 'webcam-comparison-2026' } },
  })
  
  const productsRes = await notion.databases.query({
    database_id: PRODUCTS_DB,
    filter: { property: '記事スラッグ', multi_select: { contains: 'webcam-comparison-2026' } },
  })
  
  console.log("=== DB上の価格 ===")
  productsRes.results.forEach(p => {
    console.log(p.properties['商品名']?.title?.[0]?.plain_text, p.properties['価格']?.number)
  })

  console.log("\n=== 記事本文 ===")
  const blocks = await notion.blocks.children.list({ block_id: articleRes.results[0].id })
  blocks.results.forEach(b => {
    if (b.type === 'paragraph') {
      const text = b.paragraph.rich_text.map(rt => rt.plain_text).join('')
      if (text.includes('円')) console.log(`[P] ${text}`)
    }
    if (b.type === 'heading_2') {
      const text = b.heading_2.rich_text.map(rt => rt.plain_text).join('')
      if (text.includes('円')) console.log(`[H2] ${text}`)
    }
    if (b.type === 'heading_3') {
      const text = b.heading_3.rich_text.map(rt => rt.plain_text).join('')
      if (text.includes('円')) console.log(`[H3] ${text}`)
    }
  })
}

main().catch(console.error)
