import { Client } from '@notionhq/client'
import dotenv from 'dotenv'
import { resolve } from 'path'

dotenv.config({ path: resolve(process.cwd(), '.env.local') })
const notion = new Client({ auth: process.env.NOTION_TOKEN })
const ARTICLES_DB = process.env.NOTION_ARTICLES_DB_ID
const ARTICLE_SLUG = 'headset-comparison-2026'

async function main() {
  const articleRes = await notion.databases.query({
    database_id: ARTICLES_DB,
    filter: { property: 'スラッグ', rich_text: { equals: ARTICLE_SLUG } },
  })
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

  const headingIndices = [31, 37, 43, 50, 56, 62, 68, 74, 80, 87, 94]

  for (const idx of headingIndices) {
    const block = blocks[idx]
    if (block.type !== 'heading_4') continue

    const texts = block.heading_4.rich_text
    if (texts.length > 1) {
      console.log(`Fixing block ${idx}: ${texts.map(t => t.plain_text).join('')}`)
      const correctText = texts[0].plain_text
      
      const newBlock = {
        heading_4: {
          rich_text: [ { type: 'text', text: { content: correctText } } ]
        }
      }
      
      // We append the new block AFTER the block before it
      const prevBlockId = blocks[idx - 1].id
      
      await notion.blocks.children.append({
        block_id: pageId,
        children: [newBlock],
        after: prevBlockId
      })
      
      // Delete the old block
      await notion.blocks.delete({ block_id: block.id })
    }
  }

  console.log("Done fixing headings.")
}

main().catch(console.error)
