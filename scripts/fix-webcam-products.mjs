/**
 * Webcam記事の商品DBを修正するスクリプト
 * 1. StreamCam と PowerConf C300 をアーカイブ（削除）
 * 2. 残りの商品の表示順をリナンバリング
 */
import { Client } from '@notionhq/client'
import dotenv from 'dotenv'
import { resolve } from 'path'

dotenv.config({ path: resolve(process.cwd(), '.env.local') })

const notion = new Client({ auth: process.env.NOTION_TOKEN })
const PRODUCTS_DB = process.env.NOTION_PRODUCTS_DB_ID || 'c0f456c33c5740bc8d90025630236014'
const ARTICLE_SLUG = 'webcam-comparison-2026'

async function main() {
  // 商品データ取得
  const productsRes = await notion.databases.query({
    database_id: PRODUCTS_DB,
    filter: {
      property: '記事スラッグ',
      multi_select: { contains: ARTICLE_SLUG },
    },
    sorts: [{ property: '表示順', direction: 'ascending' }],
  })

  // 1. StreamCam と PowerConf をアーカイブ
  console.log('=== 商品のアーカイブ ===')
  const toDelete = productsRes.results.filter(p => {
    const name = p.properties['商品名']?.title?.[0]?.plain_text || ''
    return name.includes('StreamCam') || name.includes('PowerConf')
  })

  for (const p of toDelete) {
    const name = p.properties['商品名']?.title?.[0]?.plain_text
    console.log(`  アーカイブ: ${name}`)
    await notion.pages.update({ page_id: p.id, archived: true })
    console.log(`  ✅ 完了`)
  }

  // 2. 残りの商品を1から順にリナンバリング
  console.log('\n=== 表示順のリナンバリング ===')
  const remaining = productsRes.results.filter(p => {
    const name = p.properties['商品名']?.title?.[0]?.plain_text || ''
    return !name.includes('StreamCam') && !name.includes('PowerConf')
  })

  for (let i = 0; i < remaining.length; i++) {
    const p = remaining[i]
    const name = p.properties['商品名']?.title?.[0]?.plain_text
    const newOrder = i + 1
    const currentOrder = p.properties['表示順']?.number
    if (currentOrder !== newOrder) {
      console.log(`  ${name}: ${currentOrder} → ${newOrder}`)
      await notion.pages.update({
        page_id: p.id,
        properties: { '表示順': { number: newOrder } },
      })
    } else {
      console.log(`  ${name}: ${newOrder} (変更なし)`)
    }
  }

  console.log('\n✅ 全て完了！')
  console.log(`  削除: ${toDelete.length}件`)
  console.log(`  残り: ${remaining.length}件`)
}

main().catch(err => {
  console.error('エラー:', err.message)
  process.exit(1)
})
