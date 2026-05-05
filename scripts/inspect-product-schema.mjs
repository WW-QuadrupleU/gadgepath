import { Client } from '@notionhq/client'
import dotenv from 'dotenv'
import { resolve } from 'path'

dotenv.config({ path: resolve(process.cwd(), '.env.local') })
const notion = new Client({ auth: process.env.NOTION_TOKEN })
const PRODUCTS_DB = process.env.NOTION_PRODUCTS_DB_ID

// DB全体のスキーマを確認
const db = await notion.databases.retrieve({ database_id: PRODUCTS_DB })
console.log('=== Properties ===')
for (const [name, prop] of Object.entries(db.properties)) {
  console.log(`  ${name} : ${prop.type}`)
  if (prop.type === 'select' || prop.type === 'multi_select') {
    const opts = prop[prop.type].options.map(o => o.name)
    console.log(`    options: ${opts.join(', ')}`)
  }
  if (prop.type === 'status') {
    const opts = prop.status.options.map(o => o.name)
    console.log(`    options: ${opts.join(', ')}`)
  }
}

// 既存のマイク商品の例を見る
console.log('\n=== Sample existing mic product (Shure MV7+) ===')
const sample = await notion.databases.query({
  database_id: PRODUCTS_DB,
  filter: { property: '商品名', title: { contains: 'Shure MV7+' } },
  page_size: 1,
})
if (sample.results.length) {
  const p = sample.results[0]
  console.log(JSON.stringify(p.properties, null, 2))
}
