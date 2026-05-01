import { Client } from '@notionhq/client'
import dotenv from 'dotenv'
import { resolve } from 'path'

dotenv.config({ path: resolve(process.cwd(), '.env.local') })
const notion = new Client({ auth: process.env.NOTION_TOKEN })

async function main() {
  const blocksToDelete = [
    'be9ae00d-f8d7-4bed-b18b-620cb13365c2', // h3: Key Light Mini
    'd5050e4a-417b-4fab-b20e-4a3ce3a73754', // p: Key Light Miniは...
    'b090f37b-2a89-4b48-84d6-f3de94a59a4b', // h3: C922xよりAnker C302...
    '9bc25d5d-4a0c-4bf6-9f96-bd6977561575', // p: C922xはC920sと...
    '2cfe9727-be98-42a8-96f4-4396d188f1a0', // p: Anker C302の...
  ]

  // There might be bulleted list items or more paragraphs after 52. Let's fetch the children of page and delete from index 50 up to before 57.
  const ARTICLES_DB = process.env.NOTION_ARTICLES_DB_ID
  const ARTICLE_SLUG = 'youtube-tiktok-equipment-guide'
  const articleRes = await notion.databases.query({
    database_id: ARTICLES_DB,
    filter: { property: 'スラッグ', rich_text: { equals: ARTICLE_SLUG } },
  })
  
  if (articleRes.results.length === 0) return
  const pageId = articleRes.results[0].id
  
  const blocks = []
  let hasMore = true
  let startCursor = undefined
  while (hasMore) {
    const res = await notion.blocks.children.list({ block_id: pageId, start_cursor: startCursor, page_size: 100 })
    blocks.push(...res.results)
    hasMore = res.has_more
    startCursor = res.next_cursor
  }

  // Find index of h3: Key Light Mini
  const keyLightIdx = blocks.findIndex(b => b.id === 'be9ae00d-f8d7-4bed-b18b-620cb13365c2')
  // Find next heading
  let nextHeading1 = keyLightIdx + 1
  while (nextHeading1 < blocks.length && !blocks[nextHeading1].type.startsWith('heading_')) nextHeading1++

  // Find index of h3: C922xよりAnker
  const c302Idx = blocks.findIndex(b => b.id === 'b090f37b-2a89-4b48-84d6-f3de94a59a4b')
  let nextHeading2 = c302Idx + 1
  while (nextHeading2 < blocks.length && !blocks[nextHeading2].type.startsWith('heading_')) nextHeading2++

  const toDelete = []
  if (keyLightIdx !== -1) {
    for (let i = keyLightIdx; i < nextHeading1; i++) toDelete.push(blocks[i].id)
  }
  if (c302Idx !== -1) {
    for (let i = c302Idx; i < nextHeading2; i++) toDelete.push(blocks[i].id)
  }

  console.log(`Deleting ${toDelete.length} blocks...`)
  for (const id of toDelete) {
    console.log(`Deleting ${id}`)
    await notion.blocks.delete({ block_id: id })
  }
}

main().catch(console.error)
