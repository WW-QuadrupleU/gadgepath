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

  const targets = ['Key Light Mini', 'Anker PowerConf C302']
  
  for (const b of blocks) {
    if (b.type === 'numbered_list_item') {
      const text = b.numbered_list_item.rich_text.map(rt => rt.plain_text).join('')
      if (targets.some(t => text.includes(t))) {
        console.log(`Deleting block: ${text}`)
        await notion.blocks.delete({ block_id: b.id })
      }
    }
  }

  console.log("Done removing discontinued products from article.")
}

main().catch(console.error)
