import { Client } from '@notionhq/client'
import dotenv from 'dotenv'
import { resolve } from 'path'

dotenv.config({ path: resolve(process.cwd(), '.env.local') })
const notion = new Client({ auth: process.env.NOTION_TOKEN })

async function main() {
  const res = await notion.databases.query({
    database_id: process.env.NOTION_PRODUCTS_DB_ID
  })
  const products = res.results.map(p => p.properties['商品名'].title[0]?.plain_text || '')
  console.log('Total products:', products.length)
  const search = ['SoloCast', 'C920', 'C922', 'C302', 'Wave', 'Key Light', 'Shure', 'ZV-1', 'Multi Mount', 'リングライト', 'マイクアーム', 'KTSOUL']
  search.forEach(s => {
    const matches = products.filter(p => p.toLowerCase().includes(s.toLowerCase()))
    console.log(`Search '${s}':`, matches)
  })
}

main().catch(console.error)
