import { Client } from '@notionhq/client'
import { config } from 'dotenv'
config({ path: '.env.local' })

const notion = new Client({ auth: process.env.NOTION_TOKEN })
const PRODUCTS_DB = process.env.NOTION_PRODUCTS_DB_ID || 'c0f456c33c5740bc8d90025630236014'

const r = await notion.databases.query({
  database_id: PRODUCTS_DB,
  filter: { property: 'ステータス', status: { equals: '販売終了' } },
})
for (const p of r.results) {
  const name = p.properties['商品名']?.title?.[0]?.plain_text
  console.log(`${name}: ${p.id}`)
}
