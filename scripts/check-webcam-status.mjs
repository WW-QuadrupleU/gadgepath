/**
 * Webcam記事の現状確認スクリプト（読み取りのみ、変更なし）
 */
import { Client } from '@notionhq/client'
import dotenv from 'dotenv'
import { resolve } from 'path'

dotenv.config({ path: resolve(process.cwd(), '.env.local') })

const notion = new Client({ auth: process.env.NOTION_TOKEN })
const ARTICLES_DB = process.env.NOTION_ARTICLES_DB_ID
const PRODUCTS_DB = process.env.NOTION_PRODUCTS_DB_ID || 'c0f456c33c5740bc8d90025630236014'

const ARTICLE_SLUG = 'webcam-comparison-2026'

async function main() {
  console.log('--- API接続テスト ---')
  
  console.log('\n=== 1. 記事ページの特定 ===')
  const articleRes = await notion.databases.query({
    database_id: ARTICLES_DB,
    filter: {
      property: 'スラッグ',
      rich_text: { equals: ARTICLE_SLUG },
    },
  })

  if (!articleRes.results.length) {
    console.error('記事が見つかりません:', ARTICLE_SLUG)
    process.exit(1)
  }

  const articlePage = articleRes.results[0]
  const title = articlePage.properties['タイトル']?.title?.[0]?.plain_text
  console.log('記事ID:', articlePage.id)
  console.log('タイトル:', title)

  console.log('\n=== 2. 商品データの確認 ===')
  const productsRes = await notion.databases.query({
    database_id: PRODUCTS_DB,
    filter: {
      property: '記事スラッグ',
      multi_select: { contains: ARTICLE_SLUG },
    },
    sorts: [{ property: '表示順', direction: 'ascending' }],
  })

  console.log(`商品数: ${productsRes.results.length}`)
  for (const p of productsRes.results) {
    const props = p.properties
    const name = props['商品名']?.title?.[0]?.plain_text || '(無題)'
    const imageUrl = props['画像URL']?.url || null
    const rakutenUrl = props['楽天URL']?.url || null
    const order = props['表示順']?.number ?? '?'
    const isDeleteTarget = name.includes('StreamCam') || name.includes('PowerConf')
    console.log(`  [${order}] ${isDeleteTarget ? '🗑️ ' : '✅ '}${name}`)
    console.log(`       画像: ${imageUrl ? '✅' : '❌ なし'}  楽天: ${rakutenUrl ? '✅' : '❌ なし'}`)
  }

  console.log('\n=== 3. 記事本文ブロック確認 ===')
  const blocks = []
  let cursor = undefined
  do {
    const res = await notion.blocks.children.list({
      block_id: articlePage.id,
      start_cursor: cursor,
      page_size: 100,
    })
    blocks.push(...res.results)
    cursor = res.has_more ? res.next_cursor : undefined
  } while (cursor)

  console.log(`総ブロック数: ${blocks.length}`)
  
  // StreamCam / PowerConf を含むブロックを表示
  console.log('\n--- StreamCam / PowerConf 関連ブロック ---')
  let found = false
  for (let i = 0; i < blocks.length; i++) {
    const block = blocks[i]
    const text = getPlainText(block)
    if (text && (text.includes('StreamCam') || text.includes('PowerConf'))) {
      found = true
      console.log(`  ブロック[${i}] type=${block.type} id=${block.id}`)
      console.log(`    "${text.substring(0, 80)}..."`)
    }
  }
  if (!found) {
    console.log('  ✅ 該当ブロックなし')
  }
}

function getPlainText(block) {
  const type = block.type
  const content = block[type]
  if (!content?.rich_text) return null
  return content.rich_text.map(t => t.plain_text).join('')
}

main().catch(err => {
  console.error('エラー:', err.message)
  process.exit(1)
})
