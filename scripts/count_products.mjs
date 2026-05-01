import { Client } from '@notionhq/client'
import { config } from 'dotenv'
config({ path: '.env.local' })

const notion = new Client({ auth: process.env.NOTION_TOKEN })
const PRODUCTS_DB = process.env.NOTION_PRODUCTS_DB_ID || 'c0f456c33c5740bc8d90025630236014'

const all = []
let cursor = undefined
do {
  const r = await notion.databases.query({ database_id: PRODUCTS_DB, start_cursor: cursor, page_size: 100 })
  all.push(...r.results)
  cursor = r.has_more ? r.next_cursor : undefined
} while (cursor)

const byCat = {}
const byStatus = {}
const missingImage = []
const missingUrl = []
const missingPrice = []

for (const p of all) {
  const name = p.properties['商品名']?.title?.[0]?.plain_text || '(無名)'
  const cat = p.properties['カテゴリ']?.select?.name || '(未設定)'
  const status = p.properties['ステータス']?.status?.name || '(未設定)'
  const img = p.properties['画像URL']?.url
  const url = p.properties['楽天URL']?.url
  const price = p.properties['価格']?.rich_text?.[0]?.plain_text

  byCat[cat] = (byCat[cat] || 0) + 1
  byStatus[status] = (byStatus[status] || 0) + 1
  if (!img) missingImage.push(name)
  if (!url) missingUrl.push(name)
  if (!price) missingPrice.push(name)
}
console.log('======== 商品DB集計 ========')
console.log('総数:', all.length)
console.log('\nカテゴリ別:')
for (const [k, v] of Object.entries(byCat).sort((a, b) => b[1] - a[1])) console.log(`  ${k}: ${v}`)
console.log('\nステータス別:')
for (const [k, v] of Object.entries(byStatus)) console.log(`  ${k}: ${v}`)
console.log('\n不足項目:')
console.log(`  画像URL未設定: ${missingImage.length}件`)
console.log(`  楽天URL未設定: ${missingUrl.length}件`)
console.log(`  価格未設定: ${missingPrice.length}件`)
