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
    const res = await notion.blocks.children.list({ block_id: pageId, start_cursor: startCursor, page_size: 100 })
    blocks.push(...res.results)
    hasMore = res.has_more
    startCursor = res.next_cursor
  }

  // Categories
  const c270n = blocks.slice(19, 24)
  const c920n = blocks.slice(27, 32)
  const c922n = blocks.slice(32, 37)
  const facecam = blocks.slice(37, 42)
  const brio500 = blocks.slice(42, 47)
  const mxBrio = blocks.slice(49, 54)
  const insta360 = blocks.slice(54, 60)
  const mirrorless = blocks.slice(60, 66)

  // Update numbers
  const updateNumber = (blockGroup, num, title) => {
    blockGroup[0].heading_4.rich_text[0].text.content = `${num}. ${title}`
    blockGroup[0].heading_4.rich_text[0].plain_text = `${num}. ${title}`
  }
  
  updateNumber(c270n, 1, 'Logicool C270n')
  updateNumber(c920n, 2, 'Logicool C920n')
  updateNumber(c922n, 3, 'Logicool C922n')
  updateNumber(facecam, 4, 'Elgato Facecam / Facecam Neo')
  updateNumber(brio500, 5, 'Logicool Brio 500')
  updateNumber(insta360, 6, 'Insta360 Link 2 / Link 2 Pro')
  updateNumber(mxBrio, 7, 'Logicool MX Brio（旧Brio 4K）')
  updateNumber(mirrorless, 8, 'ミラーレス一眼カメラ ＋ キャプチャーボード｜5万円〜')

  // Clean up object for append
  const cleanBlock = (b) => {
    const type = b.type
    const content = b[type]
    const cleaned = {
      type: type,
      [type]: {
        rich_text: content.rich_text.map(rt => {
          const newRt = {
            type: 'text',
            text: { content: rt.text.content, link: rt.text.link },
            annotations: rt.annotations,
          }
          return newRt
        })
      }
    }
    if (content.color) cleaned[type].color = content.color
    // Copy is_toggleable if it exists
    if (content.is_toggleable !== undefined) cleaned[type].is_toggleable = content.is_toggleable
    return cleaned
  }

  const newBlocks = [
    cleanBlock(blocks[18]), // H3: 1万円以下
    ...c270n.map(cleanBlock),
    ...c920n.map(cleanBlock),
    
    cleanBlock(blocks[25]), // H3: 1〜3万円
    cleanBlock(blocks[26]), // paragraph about ミドルレンジ
    ...c922n.map(cleanBlock),
    ...facecam.map(cleanBlock),
    ...brio500.map(cleanBlock),
    ...insta360.map(cleanBlock),
    
    cleanBlock(blocks[48]), // H3: 3万円以上
    ...mxBrio.map(cleanBlock),
    ...mirrorless.map(cleanBlock)
  ]

  console.log("Deleting old blocks...")
  for (let i = 18; i <= 65; i++) {
    await notion.blocks.delete({ block_id: blocks[i].id })
    // sleep to avoid rate limit
    await new Promise(r => setTimeout(r, 100))
  }

  console.log("Appending new blocks... (Total:", newBlocks.length, ")")
  
  try {
    let currentAfter = blocks[17].id
    // Append in chunks of 100
    for (let i = 0; i < newBlocks.length; i += 100) {
      const chunk = newBlocks.slice(i, i + 100)
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
