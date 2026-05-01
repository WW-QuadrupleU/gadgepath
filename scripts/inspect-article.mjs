import { Client } from '@notionhq/client'
import dotenv from 'dotenv'
import { resolve } from 'path'

dotenv.config({ path: resolve(process.cwd(), '.env.local') })
const notion = new Client({ auth: process.env.NOTION_TOKEN })
const ARTICLES_DB = process.env.NOTION_ARTICLES_DB_ID
const ARTICLE_SLUG = 'youtube-tiktok-equipment-guide'

async function getChildren(blockId) {
  const blocks = []
  let hasMore = true
  let startCursor = undefined
  while (hasMore) {
    const res = await notion.blocks.children.list({ block_id: blockId, start_cursor: startCursor, page_size: 100 })
    blocks.push(...res.results)
    hasMore = res.has_more
    startCursor = res.next_cursor
  }
  return blocks
}

async function main() {
  const articleRes = await notion.databases.query({
    database_id: ARTICLES_DB,
    filter: { property: 'スラッグ', rich_text: { equals: ARTICLE_SLUG } },
  })
  
  if (articleRes.results.length === 0) return
  const pageId = articleRes.results[0].id
  const blocks = await getChildren(pageId)

  for (let i = 0; i < blocks.length; i++) {
    const b = blocks[i]
    if (b.type.startsWith('heading_')) {
      const text = b[b.type].rich_text.map(rt => rt.plain_text).join('')
      console.log(`[${i}] ${b.type} (${b.id}): ${text}`)
    } else if (b.type === 'paragraph') {
      const text = b.paragraph.rich_text.map(rt => rt.plain_text).join('')
      if (text) console.log(`[${i}] p (${b.id}): ${text.slice(0, 30)}...`)
    }
  }
}

main().catch(console.error)
