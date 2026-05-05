import { Client } from '@notionhq/client'
import dotenv from 'dotenv'
import { resolve } from 'path'

dotenv.config({ path: resolve(process.cwd(), '.env.local') })
const notion = new Client({ auth: process.env.NOTION_TOKEN })
const ARTICLES_DB = process.env.NOTION_ARTICLES_DB_ID
const SLUG = 'microphone-guide-2026'

async function getChildren(blockId) {
  const blocks = []
  let hasMore = true, startCursor = undefined
  while (hasMore) {
    const res = await notion.blocks.children.list({ block_id: blockId, start_cursor: startCursor, page_size: 100 })
    blocks.push(...res.results)
    hasMore = res.has_more
    startCursor = res.next_cursor
  }
  return blocks
}

const TARGET_PRODUCTS = ['Blue Snowball iCE', 'HyperX QuadCast S', 'Universal Audio Volt 1']

async function main() {
  const articleRes = await notion.databases.query({
    database_id: ARTICLES_DB,
    filter: { property: 'スラッグ', rich_text: { equals: SLUG } },
  })
  const pageId = articleRes.results[0].id
  const blocks = await getChildren(pageId)

  // Print all blocks at top level with index, type, and short text
  console.log('=== TOP LEVEL BLOCKS ===')
  for (let i = 0; i < blocks.length; i++) {
    const b = blocks[i]
    const t = b.type
    const rt = b[t]?.rich_text
    const text = rt ? rt.map(r => r.plain_text).join('') : ''
    const short = text.slice(0, 80)
    console.log(`[${i}] ${t} ${b.id} | has_children=${b.has_children} | "${short}"`)
  }

  // For each target product, find the surrounding blocks
  console.log('\n=== TARGET BLOCK CONTEXT ===')
  for (const target of TARGET_PRODUCTS) {
    console.log(`\n--- ${target} ---`)
    const idx = blocks.findIndex(b => {
      const t = b.type
      const rt = b[t]?.rich_text
      if (!rt) return false
      const text = rt.map(r => r.plain_text).join('')
      return text.includes(target)
    })
    if (idx === -1) { console.log('  NOT FOUND'); continue }
    // Print context: the block + 5 following blocks
    for (let i = idx; i < Math.min(idx + 6, blocks.length); i++) {
      const b = blocks[i]
      const t = b.type
      const rt = b[t]?.rich_text
      const text = rt ? rt.map(r => r.plain_text).join('') : ''
      console.log(`  [${i}] ${t} ${b.id} "${text.slice(0, 80)}"`)
    }
  }
}

main().catch(e => { console.error(e); process.exit(1) })
