import { Client } from '@notionhq/client'
import dotenv from 'dotenv'
import { resolve } from 'path'

dotenv.config({ path: resolve(process.cwd(), '.env.local') })
const notion = new Client({ auth: process.env.NOTION_TOKEN })
const ARTICLES_DB = process.env.NOTION_ARTICLES_DB_ID
const SLUG = 'microphone-guide-2026'

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

function extractText(block) {
  const t = block.type
  const rt = block[t]?.rich_text
  if (!rt) return ''
  return rt.map(r => r.plain_text).join('')
}

function extractLinks(block) {
  const t = block.type
  const rt = block[t]?.rich_text
  if (!rt) return []
  const links = []
  for (const r of rt) {
    const href = r.text?.link?.url || r.href
    if (href) links.push({ text: r.plain_text, url: href })
  }
  return links
}

async function walk(blockId, depth, currentHeading, results) {
  const blocks = await getChildren(blockId)
  for (const b of blocks) {
    const text = extractText(b)
    const links = extractLinks(b)

    // Track current heading (h1/h2/h3)
    if (b.type.startsWith('heading_')) {
      currentHeading = text
      console.log(`\n${'  '.repeat(depth)}== ${b.type}: ${text} ==`)
    } else if (text && depth === 0) {
      // top level only briefly
    }

    if (links.length > 0) {
      for (const link of links) {
        results.push({
          heading: currentHeading,
          blockType: b.type,
          blockId: b.id,
          linkText: link.text,
          linkUrl: link.url,
          paragraphText: text,
        })
      }
    }

    if (b.has_children) {
      currentHeading = await walk(b.id, depth + 1, currentHeading, results)
    }
  }
  return currentHeading
}

async function main() {
  const articleRes = await notion.databases.query({
    database_id: ARTICLES_DB,
    filter: { property: 'スラッグ', rich_text: { equals: SLUG } },
  })
  if (articleRes.results.length === 0) {
    console.log('Article not found')
    return
  }
  const pageId = articleRes.results[0].id
  console.log(`Page ID: ${pageId}`)

  const results = []
  await walk(pageId, 0, '(top)', results)

  console.log('\n\n========== ALL LINKS ==========')
  for (const r of results) {
    console.log(`[${r.heading}]`)
    console.log(`  Text: "${r.linkText}"`)
    console.log(`  URL : ${r.linkUrl}`)
    console.log(`  Block: ${r.blockType} (${r.blockId})`)
    console.log('')
  }

  // Categorize URLs
  const byHost = {}
  for (const r of results) {
    let host = 'unknown'
    try { host = new URL(r.linkUrl).hostname } catch {}
    byHost[host] = (byHost[host] || 0) + 1
  }
  console.log('\n========== URL HOSTS ==========')
  for (const [host, count] of Object.entries(byHost).sort((a, b) => b[1] - a[1])) {
    console.log(`${count}\t${host}`)
  }
}

main().catch(e => { console.error(e); process.exit(1) })
