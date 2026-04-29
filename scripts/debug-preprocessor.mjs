/**
 * preprocessContent の出力を確認するデバッグスクリプト
 */
import { Client } from '@notionhq/client'
import { NotionToMarkdown } from 'notion-to-md'
import dotenv from 'dotenv'
import { resolve } from 'path'

dotenv.config({ path: resolve(process.cwd(), '.env.local') })

const notion = new Client({ auth: process.env.NOTION_TOKEN })
const n2m = new NotionToMarkdown({ notionClient: notion })
const ARTICLES_DB = process.env.NOTION_ARTICLES_DB_ID
const PRODUCTS_DB = process.env.NOTION_PRODUCTS_DB_ID || 'c0f456c33c5740bc8d90025630236014'

async function main() {
  // 記事取得
  const articleRes = await notion.databases.query({
    database_id: ARTICLES_DB,
    filter: { property: 'スラッグ', rich_text: { equals: 'webcam-comparison-2026' } },
  })
  const articlePage = articleRes.results[0]

  // 商品取得
  const productsRes = await notion.databases.query({
    database_id: PRODUCTS_DB,
    filter: { property: '記事スラッグ', multi_select: { contains: 'webcam-comparison-2026' } },
    sorts: [{ property: '表示順', direction: 'ascending' }],
  })
  const products = productsRes.results.map(p => ({
    id: p.id,
    name: p.properties['商品名']?.title?.[0]?.plain_text || '',
    slug: p.properties['スラッグ']?.rich_text?.[0]?.plain_text || '',
    imageUrl: p.properties['画像URL']?.url || null,
    rakutenUrl: p.properties['楽天URL']?.url || null,
    price: p.properties['価格']?.number || null,
  }))

  // Markdown取得
  const mdBlocks = await n2m.pageToMarkdown(articlePage.id)
  const content = n2m.toMarkdownString(mdBlocks).parent

  // preprocessContent の簡易版を実行してマーカー行を確認
  const lines = content.replace(/\r\n/g, '\n').split('\n')
  console.log('=== 番号付きリスト項目の確認 ===')
  for (const line of lines) {
    if (/^\d+\.\s+/.test(line)) {
      console.log(`  ${line.substring(0, 80)}`)
    }
  }

  // GADGE_CARD_NAME マーカーが正しい形式になっているか確認
  // （lib/article-preprocessorはTSなので直接importできないためシミュレート）
  console.log('\n=== マーカーフォーマット確認 ===')
  const marker = `!!GADGE_CARD_NAME!!:${encodeURIComponent('Logicool C270n')}`
  console.log('期待するマーカー形式:', marker)
  console.log('先頭チェック:', marker.startsWith('!!GADGE_CARD_NAME!!:'))
  const decoded = decodeURIComponent(marker.slice('!!GADGE_CARD_NAME!!:'.length))
  console.log('デコード結果:', decoded)
}

main().catch(e => console.error(e.message))
