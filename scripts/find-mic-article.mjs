import { Client } from '@notionhq/client'
import dotenv from 'dotenv'
import { resolve } from 'path'

dotenv.config({ path: resolve(process.cwd(), '.env.local') })
const notion = new Client({ auth: process.env.NOTION_TOKEN })
const ARTICLES_DB = process.env.NOTION_ARTICLES_DB_ID

async function main() {
  const res = await notion.databases.query({
    database_id: ARTICLES_DB,
    page_size: 100,
  })
  const matches = res.results.filter(p => {
    const title = p.properties['タイトル']?.title?.map(t => t.plain_text).join('') || ''
    return title.includes('マイク') && title.includes('選び方')
  })
  for (const m of matches) {
    const title = m.properties['タイトル']?.title?.map(t => t.plain_text).join('') || ''
    const slug = m.properties['スラッグ']?.rich_text?.map(t => t.plain_text).join('') || ''
    console.log(`Title: ${title}`)
    console.log(`Slug: ${slug}`)
    console.log(`ID: ${m.id}`)
    console.log('---')
  }
}
main().catch(e => { console.error(e); process.exit(1) })
