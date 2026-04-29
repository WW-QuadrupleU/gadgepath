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

  const fixHeading = async (block) => {
    if (block.type === 'heading_4') {
      const texts = block.heading_4.rich_text
      if (texts.length > 1) {
        console.log(`Fixing block ${block.id}: ${texts.map(t => t.plain_text).join('')}`)
        const correctText = texts[0].plain_text
        await notion.blocks.update({
          block_id: block.id,
          heading_4: {
            rich_text: [
              {
                type: 'text',
                text: { content: correctText }
              }
            ]
          }
        })
      }
    }
  }

  for (const block of blocks) {
    await fixHeading(block)
  }
  console.log("Done fixing headings.")
}

main().catch(console.error)
