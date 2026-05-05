import { Client } from '@notionhq/client'
import dotenv from 'dotenv'
import { resolve } from 'path'

dotenv.config({ path: resolve(process.cwd(), '.env.local') })

const notion = new Client({ auth: process.env.NOTION_TOKEN })
const ARTICLES_DB = process.env.NOTION_ARTICLES_DB_ID
const PRODUCTS_DB = process.env.NOTION_PRODUCTS_DB_ID
const SLUG = 'microphone-guide-2026'

const RAKUTEN_ENDPOINT = 'https://openapi.rakuten.co.jp/ichibams/api/IchibaItem/Search/20260401'
const RAKUTEN_DELAY_MS = 1100

const USED_KEYWORDS = ['中古', 'used', 'リユース', 'リサイクル', 'リファービッシュ', '整備済', '訳あり', 'ジャンク', 'アウトレット']
const OFFICIAL_SHOP_HINTS = ['公式', 'official', 'オフィシャル', 'direct', '直営']
const TRUSTED_SHOP_HINTS = [
  'biccamera', 'ビックカメラ', 'edion', 'エディオン', 'joshin', 'yamada', 'ヤマダ', 'kojima', 'コジマ',
  'rakuten24', 'soundhouse', 'サウンドハウス', 'shimamura', '島村楽器', 'rocky', 'ロッキー',
  'yodobashi', 'ヨドバシ', 'amazon', 'shure', 'logicool', 'logitech', 'razer', 'hyperx', 'fifine', 'yamaha',
]

function sleep(ms) { return new Promise(r => setTimeout(r, ms)) }

function normalize(s) {
  return s.toLowerCase().replace(/[\s\-_+・/／,、（）()【】「」『』]/g, '')
}

function isUsedItem(item) {
  const blob = `${item.itemName || ''} ${item.shopName || ''} ${item.itemCaption || ''}`.toLowerCase()
  return USED_KEYWORDS.some(k => blob.includes(k.toLowerCase()))
}

function shopType(shopName = '') {
  const lower = shopName.toLowerCase()
  if (OFFICIAL_SHOP_HINTS.some(h => lower.includes(h.toLowerCase()))) return 'official'
  if (TRUSTED_SHOP_HINTS.some(h => lower.includes(h.toLowerCase()))) return 'trusted'
  return 'other'
}

async function getChildren(blockId) {
  const blocks = []
  let hasMore = true, startCursor = undefined
  while (hasMore) {
    const res = await notion.blocks.children.list({ block_id: blockId, start_cursor: startCursor, page_size: 100 })
    blocks.push(...res.results)
    hasMore = res.has_more
    startCursor = res.next_cursor
  }
  return blocks
}

function extractLinks(block) {
  const t = block.type
  const rt = block[t]?.rich_text
  if (!rt) return []
  const links = []
  for (const r of rt) {
    const href = r.text?.link?.url || r.href
    if (href) links.push({ text: r.plain_text, url: href })
  }
  return links
}

async function walk(blockId, currentHeading, results) {
  const blocks = await getChildren(blockId)
  for (const b of blocks) {
    const t = b.type
    const rt = b[t]?.rich_text
    const text = rt ? rt.map(r => r.plain_text).join('') : ''

    if (t.startsWith('heading_')) currentHeading = text

    const links = extractLinks(b)
    for (const link of links) {
      results.push({
        heading: currentHeading,
        blockType: t,
        blockId: b.id,
        linkText: link.text,
        linkUrl: link.url,
      })
    }
    if (b.has_children) currentHeading = await walk(b.id, currentHeading, results)
  }
  return currentHeading
}

function extractKeywordFromAmazonSearch(url) {
  try {
    const u = new URL(url)
    if (!u.hostname.includes('amazon.co.jp')) return null
    if (!u.pathname.startsWith('/s')) return null
    return u.searchParams.get('k')
  } catch { return null }
}

function extractProductNameFromText(linkText) {
  // "FIFINE K669B をAmazonで見る →" → "FIFINE K669B"
  return linkText.replace(/\s*を?Amazonで見る\s*[→]?\s*$/, '').replace(/\s*→\s*$/, '').trim()
}

async function getAllProducts() {
  const products = []
  let cursor = undefined
  while (true) {
    const res = await notion.databases.query({
      database_id: PRODUCTS_DB,
      page_size: 100,
      start_cursor: cursor,
    })
    for (const p of res.results) {
      products.push({
        id: p.id,
        name: p.properties['商品名']?.title?.[0]?.plain_text || '',
        slug: p.properties['スラッグ']?.rich_text?.[0]?.plain_text || '',
        status: p.properties['ステータス']?.status?.name || '',
        articleSlugs: p.properties['記事スラッグ']?.multi_select?.map(s => s.name) || [],
      })
    }
    if (!res.has_more) break
    cursor = res.next_cursor
  }
  return products
}

function findProductByKeyword(keyword, products) {
  const nk = normalize(keyword)
  if (!nk || nk.length < 3) return undefined
  return products.find(p => {
    const n = normalize(p.name)
    const s = normalize(p.slug)
    // 空文字との includes による誤マッチを防ぐため最低3文字を要求
    const nameMatch = n.length >= 3 && (nk.includes(n) || n.includes(nk))
    const slugMatch = s.length >= 3 && (nk.includes(s) || s.includes(nk))
    return nameMatch || slugMatch
  })
}

async function searchRakutenOnce(keyword) {
  const url = new URL(RAKUTEN_ENDPOINT)
  url.searchParams.set('applicationId', process.env.RAKUTEN_APP_ID)
  url.searchParams.set('accessKey', process.env.RAKUTEN_ACCESS_KEY)
  url.searchParams.set('keyword', keyword)
  url.searchParams.set('hits', '20')
  url.searchParams.set('availability', '1')
  url.searchParams.set('sort', 'standard')
  url.searchParams.set('formatVersion', '2')
  const res = await fetch(url)
  if (!res.ok) {
    const body = await res.text()
    throw new Error(`Rakuten API ${res.status}: ${body.slice(0, 200)}`)
  }
  const data = await res.json()
  return data.Items || []
}

// 楽天APIは末尾の単独短い単語（"S", "1"など）でエラーになるため、複数キーワードで段階的に試す
async function searchRakuten(keyword) {
  const tries = [keyword]
  // 末尾の短いトークンを除いたバリエーションを追加
  const tokens = keyword.split(/\s+/)
  if (tokens.length > 1) {
    const last = tokens[tokens.length - 1]
    if (last.length <= 2) {
      tries.push(tokens.slice(0, -1).join(' '))
    }
  }
  // それでもダメなら最初の2語のみ
  if (tokens.length >= 2) {
    tries.push(tokens.slice(0, 2).join(' '))
  }
  let lastErr
  for (const k of tries) {
    try {
      const items = await searchRakutenOnce(k)
      if (k !== keyword) console.log(`   (フォールバック検索: "${k}")`)
      return items
    } catch (err) {
      lastErr = err
      if (!String(err.message).includes('keyword is not valid')) throw err
      await sleep(300)
    }
  }
  throw lastErr
}

// 商品名のトークン全部を含むかチェック（厳密）
function isStrictMatch(itemName, productName) {
  const name = (itemName || '').toLowerCase()
  const tokens = productName.toLowerCase().split(/\s+/).filter(t => t.length >= 2)
  // 全トークンを含むこと（順序は問わない）
  return tokens.every(t => name.includes(t))
}

function classifyRakutenItems(items, productName) {
  const newItems = items.filter(i => !isUsedItem(i))
  const usedItems = items.filter(i => isUsedItem(i))

  // 厳密一致（全トークンを含む新品）
  const strictMatched = newItems.filter(i => isStrictMatch(i.itemName, productName))
  // 緩い一致（少なくとも1トークン）
  const looseMatched = newItems.filter(i => {
    const tokens = productName.toLowerCase().split(/\s+/).filter(t => t.length >= 2)
    const name = (i.itemName || '').toLowerCase()
    return tokens.some(t => name.includes(t))
  })

  const officialShops = strictMatched.filter(i => shopType(i.shopName) === 'official')
  const trustedShops = strictMatched.filter(i => shopType(i.shopName) === 'trusted')
  const otherShops = strictMatched.filter(i => shopType(i.shopName) === 'other')

  return {
    totalItems: items.length,
    usedCount: usedItems.length,
    strictMatchedCount: strictMatched.length,
    looseMatchedCount: looseMatched.length,
    officialShops,
    trustedShops,
    otherShops,
    bestPick: officialShops[0] || trustedShops[0] || otherShops[0] || null,
  }
}

async function main() {
  console.log('=== マイク記事の商品リンク分析 ===\n')

  // 1. Get article
  const articleRes = await notion.databases.query({
    database_id: ARTICLES_DB,
    filter: { property: 'スラッグ', rich_text: { equals: SLUG } },
  })
  if (!articleRes.results.length) { console.log('Article not found'); return }
  const pageId = articleRes.results[0].id

  // 2. Extract all links
  const linkResults = []
  await walk(pageId, '(top)', linkResults)
  const amazonLinks = linkResults.filter(l => extractKeywordFromAmazonSearch(l.linkUrl))
  console.log(`Amazon検索リンク数: ${amazonLinks.length}\n`)

  // 3. Get all products
  console.log('商品DB取得中...')
  const products = await getAllProducts()
  console.log(`商品DB件数: ${products.length}\n`)

  // 4. Match each link
  const inDb = []
  const notInDb = []
  for (const link of amazonLinks) {
    const productName = extractProductNameFromText(link.linkText)
    const keyword = extractKeywordFromAmazonSearch(link.linkUrl)
    const matched = findProductByKeyword(keyword, products)
    const entry = { ...link, productName, keyword, matched }
    if (matched) inDb.push(entry)
    else notInDb.push(entry)
  }

  console.log(`========== 商品DB登録済み (${inDb.length}件) ==========\n`)
  for (const e of inDb) {
    console.log(`✅ ${e.productName}`)
    console.log(`   DB: ${e.matched.name} (status: ${e.matched.status})`)
    console.log(`   articleSlugs: ${JSON.stringify(e.matched.articleSlugs)}`)
    console.log('')
  }

  console.log(`\n========== 商品DB未登録 (${notInDb.length}件) ==========\n`)

  const recommendations = []
  for (const e of notInDb) {
    console.log(`🔍 楽天API検索: ${e.productName}`)
    try {
      const items = await searchRakuten(e.productName)
      const cls = classifyRakutenItems(items, e.productName)
      console.log(`   全 ${cls.totalItems}件 / 中古 ${cls.usedCount}件 / 厳密一致 ${cls.strictMatchedCount}件 / 緩い一致 ${cls.looseMatchedCount}件`)
      console.log(`   厳密一致内訳: 公式 ${cls.officialShops.length} / 信頼 ${cls.trustedShops.length} / その他 ${cls.otherShops.length}`)
      if (cls.bestPick) {
        console.log(`   ベスト: [${cls.bestPick.shopName}] ${cls.bestPick.itemName.slice(0, 70)}...`)
        console.log(`   価格: ¥${cls.bestPick.itemPrice}`)
        console.log(`   URL : ${cls.bestPick.itemUrl}`)
      }

      let action = 'keep'
      let reason = ''
      if (cls.strictMatchedCount === 0) {
        // 厳密一致なし → 商品名そのものが楽天で売られていない → 販売終了の可能性
        action = 'remove'
        reason = `商品名が楽天で見つからない（厳密一致0件、新品候補は別モデルの可能性）`
      } else if (cls.officialShops.length === 0 && cls.trustedShops.length === 0) {
        action = 'review'
        reason = '公式・信頼ショップなし'
      } else if (cls.officialShops.length > 0) {
        action = 'keep'
        reason = `公式ショップ ${cls.officialShops.length}件`
      } else {
        action = 'keep'
        reason = `信頼ショップ ${cls.trustedShops.length}件`
      }
      console.log(`   👉 推奨: ${action.toUpperCase()} (${reason})`)
      recommendations.push({ ...e, action, reason, classification: cls })
    } catch (err) {
      console.error(`   ❌ エラー: ${err.message}`)
      recommendations.push({ ...e, action: 'error', reason: err.message })
    }
    console.log('')
    await sleep(RAKUTEN_DELAY_MS)
  }

  console.log('\n========== サマリー ==========')
  const byAction = {}
  for (const r of recommendations) {
    byAction[r.action] = (byAction[r.action] || 0) + 1
  }
  for (const [action, count] of Object.entries(byAction)) {
    console.log(`${action}: ${count}件`)
  }

  console.log('\n--- 削除推奨 (REMOVE) ---')
  for (const r of recommendations.filter(r => r.action === 'remove')) {
    console.log(`  - ${r.productName} (${r.reason})`)
    console.log(`    Block ID: ${r.blockId}`)
    console.log(`    Heading: ${r.heading}`)
  }

  console.log('\n--- 要確認 (REVIEW) ---')
  for (const r of recommendations.filter(r => r.action === 'review')) {
    console.log(`  - ${r.productName} (${r.reason})`)
  }

  console.log('\n--- 維持 (KEEP) ---')
  for (const r of recommendations.filter(r => r.action === 'keep')) {
    console.log(`  - ${r.productName} (${r.reason})`)
  }
}

main().catch(e => { console.error(e); process.exit(1) })
