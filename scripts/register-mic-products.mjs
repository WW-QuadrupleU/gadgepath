import { Client } from '@notionhq/client'
import dotenv from 'dotenv'
import { resolve } from 'path'

dotenv.config({ path: resolve(process.cwd(), '.env.local') })
const notion = new Client({ auth: process.env.NOTION_TOKEN })
const PRODUCTS_DB = process.env.NOTION_PRODUCTS_DB_ID

const DRY = process.argv.includes('--dry')

function formatPrice(price) {
  return `約${Number(price).toLocaleString('ja-JP')}円`
}

const PRODUCTS = [
  {
    name: 'FIFINE K669B',
    slug: 'fifine-k669b',
    rakutenUrl: 'https://item.rakuten.co.jp/fifine/k669b/',
    imageUrl: 'https://thumbnail.image.rakuten.co.jp/@0_mall/fifine/cabinet/11105359/imgrc0331102129.jpg?_ex=500x500',
    price: 3825,
    category: 'マイク',
    articleSlugs: ['microphone-guide-2026'],
    displayOrder: 100,
    status: '現行品',
  },
  {
    name: 'Shure MV6',
    slug: 'shure-mv6',
    rakutenUrl: 'https://item.rakuten.co.jp/fullten/20225549/',
    imageUrl: 'https://thumbnail.image.rakuten.co.jp/@0_mall/fullten/cabinet/10430176/20225549_001.jpg?_ex=500x500',
    price: 19800,
    category: 'マイク',
    articleSlugs: ['microphone-guide-2026'],
    displayOrder: 101,
    status: '現行品',
  },
  {
    name: 'YAMAHA AG03MK2',
    slug: 'yamaha-ag03mk2',
    rakutenUrl: 'https://item.rakuten.co.jp/biccamera/4957812677332/',
    imageUrl: 'https://thumbnail.image.rakuten.co.jp/@0_mall/biccamera/cabinet/product/7003/00000010054765_a01.jpg?_ex=500x500',
    price: 16860,
    category: 'マイク', // オーディオインターフェースだが既存カテゴリ最適マッチ
    articleSlugs: ['microphone-guide-2026'],
    displayOrder: 102,
    status: '現行品',
  },
]

async function existsByName(name) {
  const res = await notion.databases.query({
    database_id: PRODUCTS_DB,
    filter: { property: '商品名', title: { equals: name } },
    page_size: 1,
  })
  return res.results[0] || null
}

async function createProduct(p) {
  const properties = {
    '商品名': { title: [{ text: { content: p.name } }] },
    'スラッグ': { rich_text: [{ text: { content: p.slug } }] },
    '楽天URL': { url: p.rakutenUrl },
    '画像URL': { url: p.imageUrl },
    '価格': { rich_text: [{ text: { content: formatPrice(p.price) } }] },
    'カテゴリ': { select: { name: p.category } },
    '記事スラッグ': { multi_select: p.articleSlugs.map(s => ({ name: s })) },
    '表示順': { number: p.displayOrder },
    'ステータス': { status: { name: p.status } },
  }

  if (DRY) {
    console.log('  [dry-run] would create:', JSON.stringify(properties, null, 2))
    return
  }

  const created = await notion.pages.create({
    parent: { database_id: PRODUCTS_DB },
    properties,
  })
  return created
}

async function main() {
  console.log(`商品登録 ${DRY ? '(dry-run)' : ''}\n`)

  for (const p of PRODUCTS) {
    console.log(`■ ${p.name}`)
    const existing = await existsByName(p.name)
    if (existing) {
      console.log(`  ⚠️ 既存（スキップ）: ${existing.id}`)
      continue
    }
    try {
      const created = await createProduct(p)
      if (created) {
        console.log(`  ✅ 登録完了: ${created.id}`)
      }
    } catch (e) {
      console.error(`  ❌ 失敗: ${e.message}`)
      throw e
    }
    await new Promise(r => setTimeout(r, 300))
  }
}

main().catch(e => { console.error(e); process.exit(1) })
