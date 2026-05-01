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

const items = all.map(p => ({
  id: p.id,
  name: p.properties['商品名']?.title?.[0]?.plain_text || '(無名)',
  category: p.properties['カテゴリ']?.select?.name || '(未設定)',
  hasImg: !!p.properties['画像URL']?.url,
  hasUrl: !!p.properties['楽天URL']?.url,
  hasPrice: !!p.properties['価格']?.rich_text?.[0]?.plain_text,
  articleSlugs: p.properties['記事スラッグ']?.multi_select?.map(t => t.name) || [],
}))

// カテゴリ別にソート
items.sort((a, b) => (a.category + a.name).localeCompare(b.category + b.name))

console.log('| カテゴリ | 商品名 | 画像 | URL | 価格 | 記事 |')
console.log('|---|---|---|---|---|---|')
for (const it of items) {
  const flag = (b) => b ? '✅' : '❌'
  console.log(`| ${it.category} | ${it.name} | ${flag(it.hasImg)} | ${flag(it.hasUrl)} | ${flag(it.hasPrice)} | ${it.articleSlugs.join(', ')} |`)
}
