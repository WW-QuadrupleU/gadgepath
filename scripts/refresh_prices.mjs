import { Client } from '@notionhq/client'
import { config } from 'dotenv'

config({ path: '.env.local' })

const RAKUTEN_ENDPOINT = 'https://openapi.rakuten.co.jp/ichibams/api/IchibaItem/Search/20260401'
const PRODUCTS_DB = process.env.NOTION_PRODUCTS_DB_ID
const MAX_NOTION_RETRIES = 3
const RAKUTEN_DELAY_MS = 1100

const args = process.argv.slice(2)
const DRY_RUN = args.includes('--dry')

const requiredEnv = ['NOTION_TOKEN', 'NOTION_PRODUCTS_DB_ID', 'RAKUTEN_APP_ID', 'RAKUTEN_ACCESS_KEY']
const missingEnv = requiredEnv.filter((key) => !process.env[key])

if (missingEnv.length > 0) {
  console.error(`Missing required environment variables: ${missingEnv.join(', ')}`)
  process.exit(1)
}

async function fetchWithRetry(url, init) {
  let retries = 0

  while (true) {
    try {
      const response = await fetch(url, init)

      if (response.status >= 500 && response.status <= 599 && retries < MAX_NOTION_RETRIES) {
        retries += 1
        await sleep(1000 * retries)
        continue
      }

      return response
    } catch (error) {
      if (retries < MAX_NOTION_RETRIES) {
        retries += 1
        await sleep(1000 * retries)
        continue
      }

      throw error
    }
  }
}

const notion = new Client({
  auth: process.env.NOTION_TOKEN,
  fetch: fetchWithRetry,
})

const PROPS = {
  name: '商品名',
  category: 'カテゴリ',
  slug: 'スラッグ',
  rakutenUrl: '楽天URL',
  imageUrl: '画像URL',
  price: '価格',
  status: 'ステータス',
  lastChecked: '最終確認日',
  notFoundCount: '連続未発見回数',
}

const ACTIVE_STATUSES = ['現行品', '旧モデル']
const USED_KEYWORDS = [
  '中古',
  'used',
  'リユース',
  'リサイクル',
  'リファービッシュ',
  '整備済',
  '訳あり',
  'ジャンク',
  'アウトレット',
]
const ACCESSORY_KEYWORDS = ['ケース', 'case', 'カバー', 'フィルム', '保護', '収納', 'ポーチ', 'ケーブル', 'cable']
const OFFICIAL_SHOP_HINTS = ['公式', 'official', 'オフィシャル', 'direct', '直営']
const TRUSTED_SHOP_HINTS = [
  'biccamera',
  'ビックカメラ',
  'edion',
  'エディオン',
  'joshin',
  'yamada',
  'ヤマダ',
  'kojima',
  'コジマ',
  'rakuten24',
  'ツクモ',
  'tsukumo',
  'dospara',
  'ドスパラ',
  'pc-koubou',
  'パソコン工房',
  'anker',
  'logicool',
  'logitech',
  'sony',
  'elgato',
  'razer',
]
const GENERIC_TOKENS = new Set([
  'usb',
  'usb-c',
  'type-c',
  'ssd',
  'pro',
  'mini',
  'wireless',
  'light',
  'hub',
  'ドック',
  'ハブ',
])

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function getTitle(page, propertyName) {
  return page.properties[propertyName]?.title?.[0]?.plain_text || ''
}

function getRichText(page, propertyName) {
  return page.properties[propertyName]?.rich_text?.[0]?.plain_text || ''
}

function getNumber(page, propertyName) {
  return page.properties[propertyName]?.number ?? 0
}

function parsePrice(raw) {
  if (!raw) return 0
  const stripped = String(raw).replace(/[^\d]/g, '')
  return stripped ? Number(stripped) : 0
}

function formatPrice(price) {
  return `約${Number(price).toLocaleString('ja-JP')}円`
}

function cleanImageUrl(url) {
  return (url || '').replace(/\?_ex=.*$/, '')
}

function isUsedItem(item) {
  const blob = `${item.itemName || ''} ${item.shopName || ''} ${item.itemCaption || ''}`.toLowerCase()
  return USED_KEYWORDS.some((keyword) => blob.includes(keyword.toLowerCase()))
}

function isAccessoryItem(item) {
  const blob = `${item.itemName || ''} ${item.itemCaption || ''}`.toLowerCase()
  return ACCESSORY_KEYWORDS.some((keyword) => blob.includes(keyword.toLowerCase()))
}

function shopScore(shopName = '') {
  const lower = shopName.toLowerCase()

  if (OFFICIAL_SHOP_HINTS.some((hint) => lower.includes(hint.toLowerCase()))) return 30
  if (TRUSTED_SHOP_HINTS.some((hint) => lower.includes(hint.toLowerCase()))) return 15

  return 0
}

function tokenizeProductName(name) {
  return name
    .toLowerCase()
    .replace(/[（）()[\]【】,，・/／|｜]/g, ' ')
    .split(/\s+/)
    .map((token) => token.trim())
    .filter((token) => token.length >= 2)
}

function buildSearchKeyword(name) {
  const tokens = tokenizeProductName(name)
    .filter((token) => !/^\d+$/.test(token))
    .filter((token) => token.length > 1)

  return tokens.join(' ') || name
}

function hasReliableNameMatch(item, productName) {
  const itemName = (item.itemName || '').toLowerCase()
  const tokens = tokenizeProductName(productName).filter((token) => !GENERIC_TOKENS.has(token))
  const meaningfulTokens = tokens.filter((token) => !/^\d+$/.test(token))

  if (meaningfulTokens.length === 0) return false

  const firstToken = meaningfulTokens[0]
  const matched = meaningfulTokens.filter((token) => itemName.includes(token))
  const matchedRatio = matched.length / meaningfulTokens.length

  return itemName.includes(firstToken) && (matched.length >= 2 || matchedRatio >= 0.5)
}

function pickBestItem(items, productName) {
  const newItems = items
    .filter((item) => !isUsedItem(item))
    .filter((item) => !isAccessoryItem(item))
    .filter((item) => hasReliableNameMatch(item, productName))
  if (newItems.length === 0) return null

  const tokens = tokenizeProductName(productName)

  const scored = newItems.map((item) => {
    const itemName = (item.itemName || '').toLowerCase()
    const matches = tokens.filter((token) => itemName.includes(token)).length
    const price = Number(item.itemPrice || 0)

    return {
      item,
      score: matches * 10 + shopScore(item.shopName) + (price > 0 ? 1 : 0),
    }
  })

  scored.sort((a, b) => b.score - a.score)
  return scored[0]?.item || null
}

async function searchRakuten(keyword) {
  const url = new URL(RAKUTEN_ENDPOINT)
  const normalizedKeyword = buildSearchKeyword(keyword)

  url.searchParams.set('applicationId', process.env.RAKUTEN_APP_ID)
  url.searchParams.set('accessKey', process.env.RAKUTEN_ACCESS_KEY)
  url.searchParams.set('keyword', normalizedKeyword)
  url.searchParams.set('hits', '20')
  url.searchParams.set('availability', '1')
  url.searchParams.set('sort', 'standard')
  url.searchParams.set('formatVersion', '2')

  const response = await fetch(url)

  if (!response.ok) {
    const body = await response.text()
    throw new Error(`Rakuten API ${response.status}: ${body.slice(0, 300)}`)
  }

  const data = await response.json()
  return data.Items || []
}

async function ensureTrackingProperties() {
  const db = await notion.databases.retrieve({ database_id: PRODUCTS_DB })
  const updates = {}

  if (!db.properties[PROPS.lastChecked]) {
    updates[PROPS.lastChecked] = { date: {} }
  }

  if (!db.properties[PROPS.notFoundCount]) {
    updates[PROPS.notFoundCount] = { number: { format: 'number' } }
  }

  if (Object.keys(updates).length === 0) return

  if (DRY_RUN) {
    console.warn(
      `[dry-run] Missing Notion properties: ${Object.keys(updates).join(', ')}. They will be created during a real run.`,
    )
    return
  }

  await notion.databases.update({
    database_id: PRODUCTS_DB,
    properties: updates,
  })

  console.log(`Created missing Notion properties: ${Object.keys(updates).join(', ')}`)
}

async function getTargetProducts() {
  const products = []
  let cursor

  do {
    const response = await notion.databases.query({
      database_id: PRODUCTS_DB,
      page_size: 100,
      start_cursor: cursor,
      filter: {
        or: ACTIVE_STATUSES.map((status) => ({
          property: PROPS.status,
          status: { equals: status },
        })),
      },
    })

    products.push(...response.results)
    cursor = response.has_more ? response.next_cursor : undefined
  } while (cursor)

  return products
}

async function updateFoundProduct(product, item) {
  const oldPrice = parsePrice(getRichText(product, PROPS.price))
  const newPrice = Number(item.itemPrice || 0)
  const priceChangeRate = oldPrice > 0 && newPrice > 0 ? (newPrice - oldPrice) / oldPrice : 0
  const significantPriceChange = Math.abs(priceChangeRate) >= 0.1
  const suspiciousPriceChange = oldPrice > 0 && newPrice > 0 && (newPrice < oldPrice * 0.4 || newPrice > oldPrice * 2.5)

  if (suspiciousPriceChange) {
    return {
      oldPrice,
      newPrice,
      priceChangeRate,
      significantPriceChange,
      suspiciousPriceChange,
      skipped: true,
    }
  }

  if (!DRY_RUN) {
    await notion.pages.update({
      page_id: product.id,
      properties: {
        [PROPS.rakutenUrl]: { url: item.itemUrl || null },
        [PROPS.imageUrl]: { url: cleanImageUrl(item.mediumImageUrls?.[0] || item.smallImageUrls?.[0]) || null },
        [PROPS.price]: { rich_text: [{ text: { content: formatPrice(newPrice) } }] },
        [PROPS.lastChecked]: { date: { start: new Date().toISOString() } },
        [PROPS.notFoundCount]: { number: 0 },
      },
    })
  }

  return {
    oldPrice,
    newPrice,
    priceChangeRate,
    significantPriceChange,
    suspiciousPriceChange,
    skipped: false,
  }
}

async function updateNotFoundProduct(product) {
  const currentCount = getNumber(product, PROPS.notFoundCount)
  const nextCount = currentCount + 1
  const shouldDiscontinue = nextCount >= 2

  if (!DRY_RUN) {
    await notion.pages.update({
      page_id: product.id,
      properties: {
        [PROPS.lastChecked]: { date: { start: new Date().toISOString() } },
        [PROPS.notFoundCount]: { number: nextCount },
        ...(shouldDiscontinue
          ? {
              [PROPS.status]: { status: { name: '販売終了' } },
            }
          : {}),
      },
    })
  }

  return {
    nextCount,
    shouldDiscontinue,
  }
}

async function main() {
  console.log(`楽天商品データ更新を開始します${DRY_RUN ? ' (dry-run)' : ''}`)
  console.log(`対象DB: ${PRODUCTS_DB}`)

  await ensureTrackingProperties()

  const products = await getTargetProducts()
  console.log(`対象商品: ${products.length}件`)

  const summary = {
    updated: 0,
    priceChanged: 0,
    suspicious: 0,
    unreliable: 0,
    notFoundWarnings: 0,
    discontinued: 0,
    skipped: 0,
    failed: 0,
    priceChanges: [],
    suspiciousPriceChanges: [],
    unreliableMatches: [],
    discontinuedProducts: [],
    failures: [],
  }

  for (const [index, product] of products.entries()) {
    const name = getTitle(product, PROPS.name)

    if (!name) {
      summary.skipped += 1
      console.warn(`[${index + 1}/${products.length}] 商品名なしのためスキップ: ${product.id}`)
      continue
    }

    try {
      console.log(`[${index + 1}/${products.length}] 楽天検索: ${name}`)
      const items = await searchRakuten(name)
      const best = pickBestItem(items, name)

      if (!best) {
        if (items.length > 0) {
          summary.unreliable += 1
          summary.unreliableMatches.push(name)
          console.warn(`  楽天検索結果はありますが、商品一致の確度が低いため更新スキップ: ${name}`)
          await sleep(RAKUTEN_DELAY_MS)
          continue
        }

        const result = await updateNotFoundProduct(product)

        if (result.shouldDiscontinue) {
          summary.discontinued += 1
          summary.discontinuedProducts.push(name)
          console.warn(`  販売終了に変更: ${name} (連続未発見${result.nextCount}回)`)
        } else {
          summary.notFoundWarnings += 1
          console.warn(`  新品が見つかりませんでした: ${name} (連続未発見${result.nextCount}回)`)
        }

        await sleep(RAKUTEN_DELAY_MS)
        continue
      }

      const result = await updateFoundProduct(product, best)

      if (result.skipped) {
        summary.suspicious += 1
        summary.suspiciousPriceChanges.push({
          name,
          oldPrice: result.oldPrice,
          newPrice: result.newPrice,
          rate: result.priceChangeRate,
          shop: best.shopName || '',
        })
        console.warn(
          `  要確認のため更新スキップ: ${formatPrice(result.oldPrice)} -> ${formatPrice(result.newPrice)} (${Math.round(result.priceChangeRate * 100)}%) / ${best.shopName || 'shop unknown'}`,
        )
        await sleep(RAKUTEN_DELAY_MS)
        continue
      }

      summary.updated += 1

      if (result.significantPriceChange) {
        summary.priceChanged += 1
        summary.priceChanges.push({
          name,
          oldPrice: result.oldPrice,
          newPrice: result.newPrice,
          rate: result.priceChangeRate,
        })
        console.log(
          `  価格変動: ${formatPrice(result.oldPrice)} -> ${formatPrice(result.newPrice)} (${Math.round(result.priceChangeRate * 100)}%)`,
        )
      } else {
        console.log(`  更新: ${best.shopName || 'shop unknown'} / ${formatPrice(result.newPrice)}`)
      }
    } catch (error) {
      summary.failed += 1
      summary.failures.push({ name, error: error.message })
      console.error(`  エラーのためスキップ: ${name}: ${error.message}`)
    }

    await sleep(RAKUTEN_DELAY_MS)
  }

  console.log('\n=== Summary ===')
  console.log(`更新件数: ${summary.updated}`)
  console.log(`価格変動件数(±10%以上): ${summary.priceChanged}`)
  console.log(`要確認スキップ件数: ${summary.suspicious}`)
  console.log(`一致不確実スキップ件数: ${summary.unreliable}`)
  console.log(`新品未発見(警告): ${summary.notFoundWarnings}`)
  console.log(`販売終了件数: ${summary.discontinued}`)
  console.log(`スキップ件数: ${summary.skipped}`)
  console.log(`失敗件数: ${summary.failed}`)

  if (summary.priceChanges.length > 0) {
    console.log('\n価格変動:')
    for (const change of summary.priceChanges) {
      console.log(
        `- ${change.name}: ${formatPrice(change.oldPrice)} -> ${formatPrice(change.newPrice)} (${Math.round(change.rate * 100)}%)`,
      )
    }
  }

  if (summary.suspiciousPriceChanges.length > 0) {
    console.log('\n要確認スキップ:')
    for (const change of summary.suspiciousPriceChanges) {
      console.log(
        `- ${change.name}: ${formatPrice(change.oldPrice)} -> ${formatPrice(change.newPrice)} (${Math.round(change.rate * 100)}%) / ${change.shop}`,
      )
    }
  }

  if (summary.unreliableMatches.length > 0) {
    console.log('\n一致不確実スキップ:')
    for (const name of summary.unreliableMatches) {
      console.log(`- ${name}`)
    }
  }

  if (summary.discontinuedProducts.length > 0) {
    console.log('\n販売終了に変更:')
    for (const name of summary.discontinuedProducts) {
      console.log(`- ${name}`)
    }
  }

  if (summary.failures.length > 0) {
    console.log('\n失敗:')
    for (const failure of summary.failures) {
      console.log(`- ${failure.name}: ${failure.error}`)
    }
  }

  console.log('\n楽天商品データ更新が完了しました')
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
