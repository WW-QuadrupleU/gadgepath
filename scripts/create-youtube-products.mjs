import { Client } from '@notionhq/client'
import dotenv from 'dotenv'
import { resolve } from 'path'

dotenv.config({ path: resolve(process.cwd(), '.env.local') })
const notion = new Client({ auth: process.env.NOTION_TOKEN })
const PRODUCTS_DB = process.env.NOTION_PRODUCTS_DB_ID
const ARTICLE_SLUG = 'youtube-tiktok-equipment-guide'

async function main() {
  const res = await notion.databases.query({ database_id: PRODUCTS_DB })
  const products = res.results

  const targetExisting = [
    'HyperX SoloCast',
    'Logicool C920n',
    'Neewer 10インチ リングライト',
    'Elgato Wave:3',
    'Logicool C922n',
    'Shure MV7+',
    'Elgato Key Light'
  ]

  for (const p of products) {
    const name = p.properties['商品名']?.title[0]?.plain_text
    if (targetExisting.includes(name)) {
      const currentSlugs = p.properties['記事スラッグ']?.multi_select || []
      if (!currentSlugs.find(s => s.name === ARTICLE_SLUG)) {
        await notion.pages.update({
          page_id: p.id,
          properties: {
            '記事スラッグ': {
              multi_select: [...currentSlugs.map(s => ({name: s.name})), { name: ARTICLE_SLUG }]
            }
          }
        })
        console.log(`Updated existing: ${name}`)
      } else {
        console.log(`Already has slug: ${name}`)
      }
    }
  }

  const targetNew = [
    'KTSOUL マイクアーム',
    'Anker PowerConf C302',
    'Elgato Key Light Mini',
    'Elgato Wave Mic Arm LP',
    'Sony ZV-1 II',
    'Elgato Multi Mount'
  ]

  for (let i = 0; i < targetNew.length; i++) {
    const name = targetNew[i]
    const exists = products.find(p => p.properties['商品名']?.title[0]?.plain_text === name)
    if (!exists) {
      await notion.pages.create({
        parent: { database_id: PRODUCTS_DB },
        properties: {
          '商品名': { title: [{ text: { content: name } }] },
          '記事スラッグ': { multi_select: [{ name: ARTICLE_SLUG }] },
          '表示順': { number: 100 + i }
        }
      })
      console.log(`Created new: ${name}`)
    } else {
      console.log(`Already exists: ${name}`)
    }
  }
}
main().catch(console.error)
