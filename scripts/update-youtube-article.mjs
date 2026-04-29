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
  const pageId = articleRes.results[0].id
  const blocks = await getChildren(pageId)

  const tables = []
  for (let i = 0; i < blocks.length; i++) {
    if (blocks[i].type === 'table') tables.push({ i, block: blocks[i] })
  }

  // Define the new lists
  const set30k = [
    'HyperX SoloCast（マイク）',
    'Logicool C920n（ウェブカメラ）',
    'Neewer 10インチ リングライト（照明）',
    'KTSOUL マイクアーム（マイクアーム）'
  ]

  const set50k = [
    'Elgato Wave:3（マイク）',
    'Logicool C922n（ウェブカメラ）',
    'Anker PowerConf C302（ウェブカメラ）',
    'Elgato Key Light Mini（照明）',
    'Elgato Wave Mic Arm LP（マイクアーム）'
  ]

  const set100k = [
    'Shure MV7+（マイク）',
    'Sony ZV-1 II（カメラ）',
    'Elgato Key Light（照明）',
    'Elgato Multi Mount（マウント）'
  ]

  const createListBlocks = (items) => {
    return items.map(item => ({
      type: 'numbered_list_item',
      numbered_list_item: {
        rich_text: [ { type: 'text', text: { content: item } } ]
      }
    }))
  }

  // Replace Table 1 (3万円)
  if (tables[0]) {
    await notion.blocks.children.append({
      block_id: pageId,
      children: createListBlocks(set30k),
      after: blocks[tables[0].i - 1].id
    })
    await notion.blocks.delete({ block_id: tables[0].block.id })
    console.log("Replaced 3万円 table")
  }

  // Replace Table 2 (5万円)
  if (tables[1]) {
    await notion.blocks.children.append({
      block_id: pageId,
      children: createListBlocks(set50k),
      after: blocks[tables[1].i - 1].id
    })
    await notion.blocks.delete({ block_id: tables[1].block.id })
    console.log("Replaced 5万円 table")
  }

  // Replace Table 3 (10万円)
  if (tables[2]) {
    await notion.blocks.children.append({
      block_id: pageId,
      children: createListBlocks(set100k),
      after: blocks[tables[2].i - 1].id
    })
    await notion.blocks.delete({ block_id: tables[2].block.id })
    console.log("Replaced 10万円 table")
  }

  console.log("Done updating article blocks.")
}

main().catch(console.error)
