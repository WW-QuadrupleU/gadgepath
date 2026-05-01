import { Client } from '@notionhq/client'
import dotenv from 'dotenv'
import { resolve } from 'path'

dotenv.config({ path: resolve(process.cwd(), '.env.local') })
const notion = new Client({ auth: process.env.NOTION_TOKEN })
const PRODUCTS_DB = process.env.NOTION_PRODUCTS_DB_ID

async function main() {
  const res = await notion.databases.query({
    database_id: PRODUCTS_DB,
    filter: { property: '記事スラッグ', multi_select: { contains: 'youtube-tiktok-equipment-guide' } }
  })

  const targets = ['Anker PowerConf C302', 'Elgato Key Light Mini']

  for (const p of res.results) {
    const name = p.properties['商品名']?.title?.[0]?.plain_text || ''
    if (targets.includes(name)) {
      console.log(`Archiving product: ${name}`)
      await notion.pages.update({
        page_id: p.id,
        archived: true
      })
    }
  }
  console.log("Done.")
}

main().catch(console.error)
