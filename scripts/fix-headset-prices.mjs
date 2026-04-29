import { Client } from '@notionhq/client'
import dotenv from 'dotenv'
import { resolve } from 'path'

dotenv.config({ path: resolve(process.cwd(), '.env.local') })
const notion = new Client({ auth: process.env.NOTION_TOKEN })
const ARTICLES_DB = process.env.NOTION_ARTICLES_DB_ID
const ARTICLE_SLUG = 'headset-comparison-2026'

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

  // Headset blocks
  const h111 = blocks.slice(31, 37)
  const stinger2 = blocks.slice(37, 43)
  const gdl3 = blocks.slice(43, 49)
  const blackshark = blocks.slice(50, 56)
  const zoneVibe = blocks.slice(56, 62)
  const inzoneH6 = blocks.slice(62, 68)
  const gpro2 = blocks.slice(68, 74)
  const inzoneH9 = blocks.slice(74, 80)
  const nova7 = blocks.slice(80, 86)
  const cloud3 = blocks.slice(87, 93)
  const novaElite = blocks.slice(94, 100)

  // Update numbers
  const updateNumber = (blockGroup, num, title) => {
    blockGroup[0].heading_4.rich_text[0].text.content = `${num}. ${title}`
    blockGroup[0].heading_4.rich_text[0].plain_text = `${num}. ${title}`
  }
  
  updateNumber(h111, 1, 'ロジクール H111')
  updateNumber(stinger2, 2, 'HyperX Cloud Stinger 2')
  updateNumber(gdl3, 3, 'Audio-Technica ATH-GDL3（開放型）')
  updateNumber(blackshark, 4, 'Razer BlackShark V3 X HyperSpeed')
  updateNumber(zoneVibe, 5, 'Logicool Zone Vibe 100')
  updateNumber(cloud3, 6, 'HyperX Cloud III Wireless')
  updateNumber(inzoneH6, 7, 'Sony INZONE H6 Air')
  updateNumber(gpro2, 8, 'Logicool G PRO X 2 LIGHTSPEED')
  updateNumber(nova7, 9, 'SteelSeries Arctis Nova 7 Gen 2')
  updateNumber(inzoneH9, 10, 'Sony INZONE H9 II')
  
  novaElite[0].heading_4.rich_text[0].text.content = 'SteelSeries Arctis Nova Elite'
  novaElite[0].heading_4.rich_text[0].plain_text = 'SteelSeries Arctis Nova Elite'

  // Fetch children for tables
  console.log("Fetching children for tables...")
  for (let i = 30; i <= 99; i++) {
    if (blocks[i].has_children) {
      blocks[i].fetched_children = await getChildren(blocks[i].id)
    }
  }

  // Clean up object for append
  const cleanBlock = (b) => {
    const type = b.type
    const content = b[type]
    const cleaned = { type: type }
    
    if (type === 'divider') {
      cleaned[type] = {}
      return cleaned
    }

    if (type === 'table') {
      cleaned[type] = {
        table_width: content.table_width,
        has_column_header: content.has_column_header,
        has_row_header: content.has_row_header
      }
      if (b.fetched_children) {
        cleaned[type].children = b.fetched_children.map(cleanBlock)
      }
      return cleaned
    }

    if (type === 'table_row') {
      cleaned[type] = {
        cells: content.cells.map(cell => cell.map(rt => ({
          type: 'text',
          text: { content: rt.text.content, link: rt.text.link },
          annotations: rt.annotations
        })))
      }
      return cleaned
    }

    if (content.rich_text) {
      cleaned[type] = {
        rich_text: content.rich_text.map(rt => ({
          type: 'text',
          text: { content: rt.text.content, link: rt.text.link },
          annotations: rt.annotations,
        }))
      }
      if (content.color) cleaned[type].color = content.color
      if (content.is_toggleable !== undefined) cleaned[type].is_toggleable = content.is_toggleable
    }
    
    return cleaned
  }

  const newBlocks = [
    cleanBlock(blocks[30]), // H3: 〜1.5万円
    ...h111.map(cleanBlock),
    ...stinger2.map(cleanBlock),
    ...gdl3.map(cleanBlock),
    
    cleanBlock(blocks[49]), // H3: 1.5万〜3.5万円
    ...blackshark.map(cleanBlock),
    ...zoneVibe.map(cleanBlock),
    ...cloud3.map(cleanBlock),
    ...inzoneH6.map(cleanBlock),
    ...gpro2.map(cleanBlock),
    ...nova7.map(cleanBlock),
    
    cleanBlock(blocks[86]), // H3: 3.5万円以上
    ...inzoneH9.map(cleanBlock),
    
    cleanBlock(blocks[93]), // H3: 特別枠
    ...novaElite.map(cleanBlock),
  ]

  console.log("Deleting old blocks...")
  for (let i = 30; i <= 99; i++) {
    await notion.blocks.delete({ block_id: blocks[i].id })
    await new Promise(r => setTimeout(r, 100))
  }

  console.log("Appending new blocks... (Total:", newBlocks.length, ")")
  
  try {
    let currentAfter = blocks[29].id
    // Wait, adding table with children via `after` might work differently. But let's try.
    // If it fails, we'll see.
    for (let i = 0; i < newBlocks.length; i += 50) {
      const chunk = newBlocks.slice(i, i + 50)
      const res = await notion.blocks.children.append({
        block_id: pageId,
        children: chunk,
        after: currentAfter
      })
      currentAfter = res.results[res.results.length - 1].id
    }
    console.log("Success!")
  } catch (e) {
    console.error("Append failed!", e.body || e)
  }
}

main().catch(console.error)
