import { Client } from '@notionhq/client'
import dotenv from 'dotenv'
import { resolve } from 'path'

dotenv.config({ path: resolve(process.cwd(), '.env.local') })
const notion = new Client({ auth: process.env.NOTION_TOKEN })
const ARTICLES_DB = process.env.NOTION_ARTICLES_DB_ID
const PRODUCTS_DB = process.env.NOTION_PRODUCTS_DB_ID
const ARTICLE_SLUG = 'youtube-tiktok-equipment-guide'

async function main() {
  // 1. Get the article page ID
  const articleRes = await notion.databases.query({
    database_id: ARTICLES_DB,
    filter: { property: 'スラッグ', rich_text: { equals: ARTICLE_SLUG } },
  })
  
  if (articleRes.results.length === 0) {
    console.error(`Article ${ARTICLE_SLUG} not found.`)
    return
  }
  const articlePageId = articleRes.results[0].id

  // 2. Get all products linked to this article
  const productsRes = await notion.databases.query({
    database_id: PRODUCTS_DB,
    filter: { property: '記事スラッグ', multi_select: { contains: ARTICLE_SLUG } },
  })

  const productIds = productsRes.results.map(p => ({ id: p.id }))
  console.log(`Found ${productIds.length} products for this article.`)

  // 3. Update the Article DB relation property
  await notion.pages.update({
    page_id: articlePageId,
    properties: {
      '商品一覧': {
        relation: productIds
      }
    }
  })

  console.log('Successfully linked products to the Article DB.')
}

main().catch(console.error)
