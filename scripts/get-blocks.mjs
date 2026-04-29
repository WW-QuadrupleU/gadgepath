import { Client } from '@notionhq/client'
import dotenv from 'dotenv'
import { resolve } from 'path'

dotenv.config({ path: resolve(process.cwd(), '.env.local') })
const notion = new Client({ auth: process.env.NOTION_TOKEN })
const ARTICLES_DB = process.env.NOTION_ARTICLES_DB_ID

async function main() {
  const articleRes = await notion.databases.query({
    database_id: ARTICLES_DB,
    filter: { property: 'スラッグ', rich_text: { equals: 'webcam-comparison-2026' } },
  })
  const pageId = articleRes.results[0].id

  let hasMore = true
  let startCursor = undefined
  const blocks = []
  
  while (hasMore) {
    const res = await notion.blocks.children.list({ block_id: pageId, start_cursor: startCursor })
    blocks.push(...res.results)
    hasMore = res.has_more
    startCursor = res.next_cursor
  }

  blocks.forEach((b, i) => {
    let text = ''
    if (b.type === 'paragraph') text = b.paragraph.rich_text.map(rt => rt.plain_text).join('')
    if (b.type === 'heading_2') text = b.heading_2.rich_text.map(rt => rt.plain_text).join('')
    if (b.type === 'heading_3') text = b.heading_3.rich_text.map(rt => rt.plain_text).join('')
    if (b.type === 'bulleted_list_item') text = '- ' + b.bulleted_list_item.rich_text.map(rt => rt.plain_text).join('')
    if (b.type === 'numbered_list_item') text = '1. ' + b.numbered_list_item.rich_text.map(rt => rt.plain_text).join('')
    if (text) {
      console.log(`[${i}] ${b.type}: ${text.substring(0, 80)}...`)
    }
  })
}

main().catch(console.error)
