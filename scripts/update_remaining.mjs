/**
 * 残り13商品を代替キーワードで再検索 → Notion更新
 * 見つからなかったものは「販売終了」ステータスにする
 */
import { Client } from '@notionhq/client'
import { config } from 'dotenv'
config({ path: '.env.local' })

const notion = new Client({ auth: process.env.NOTION_TOKEN })
const APP_ID = process.env.RAKUTEN_APP_ID
const ACCESS_KEY = process.env.RAKUTEN_ACCESS_KEY
const PRODUCTS_DB = process.env.NOTION_PRODUCTS_DB_ID || 'c0f456c33c5740bc8d90025630236014'

// 商品名 → 代替検索キーワード（複数候補）
const OVERRIDES = {
  // キーワードエラー組
  'Genki ShadowCast 2': ['Genki ShadowCast'],
  'Elgato 4K X':        ['Elgato Game Capture 4K', 'Elgato 4K Capture'],
  'Elgato HD60 X':      ['Elgato HD60'],
  // 販売終了候補組
  'GVM 800D-RGB LEDパネルライト':            ['GVM 800D-RGB', 'GVM 800D RGB LED'],
  'LaCie Rugged SSD Pro（1TB）':            ['LaCie Rugged SSD Pro 1TB', 'LaCie Rugged Pro'],
  'Anker 777 Thunderbolt ドッキングステーション': ['Anker A8392', 'Anker Thunderbolt 4 ドック'],
  'OWC Envoy Pro FX（1TB）':                ['OWC Envoy Pro FX 1TB'],
  'Lume Cube Panel Mini Pro':              ['Lume Cube Panel Mini', 'Lume Cube パネル'],
  'Anker 563 USB-Cハブ（10-in-1）':         ['Anker 563 USB-C', 'Anker A8385'],
  'CalDigit TS4 Thunderbolt 4ドック':       ['CalDigit TS4'],
  'Elgato Key Light Air':                  ['Elgato Key Light Air'],
  "AVerMedia X'TRA GO GC515":              ['AVerMedia GC515', 'AVerMedia X TRA GO'],
  'AVerMedia ELITE GO GC313Pro':           ['AVerMedia GC313Pro', 'AVerMedia ELITE GO'],
}

const USED_KEYWORDS = ['中古', 'used', 'リサイクル', 'リファビッシュ', '訳あり']
const isUsed = (it) => USED_KEYWORDS.some(k => `${it.itemName} ${it.shopName}`.toLowerCase().includes(k.toLowerCase()))

const TRUSTED_SHOPS = ['公式', 'official', 'biccamera', 'edion', 'joshin', 'yamada', 'kojima', 'soundhouse', 'rakuten24', 'ec-current', 'logitec', 'logicool']
const shopScore = (s) => {
  const l = s.toLowerCase()
  return TRUSTED_SHOPS.some(k => l.includes(k)) ? 2 : 1
}

async function searchRakuten(keyword, withAvailability = true) {
  const url = new URL('https://openapi.rakuten.co.jp/ichibams/api/IchibaItem/Search/20260401')
  url.searchParams.set('applicationId', APP_ID)
  url.searchParams.set('accessKey', ACCESS_KEY)
  url.searchParams.set('keyword', keyword)
  url.searchParams.set('hits', '15')
  if (withAvailability) url.searchParams.set('availability', '1')
  url.searchParams.set('formatVersion', '2')

  const res = await fetch(url.toString())
  const json = await res.json()
  if (json.errors) throw new Error(json.errors.errorMessage || 'API error')
  return json.Items || []
}

function pickBest(items, productName) {
  const newOnly = items.filter(it => !isUsed(it))
  if (!newOnly.length) return null
  const targetWords = productName.toLowerCase().replace(/[（）()]/g, ' ').split(/\s+/).filter(w => w.length >= 2)
  const scored = newOnly.map(it => {
    const name = (it.itemName || '').toLowerCase()
    const matches = targetWords.filter(w => name.includes(w)).length
    return { item: it, score: matches * 10 + shopScore(it.shopName || '') }
  })
  scored.sort((a, b) => b.score - a.score)
  return scored[0]?.item || null
}

const sleep = (ms) => new Promise(r => setTimeout(r, ms))

// Notion商品DBから対象商品を取得
async function getProducts() {
  const all = []
  let cursor = undefined
  do {
    const r = await notion.databases.query({ database_id: PRODUCTS_DB, start_cursor: cursor, page_size: 100 })
    all.push(...r.results)
    cursor = r.has_more ? r.next_cursor : undefined
  } while (cursor)
  return all
}

const all = await getProducts()
const targets = all.map(p => ({
  id: p.id,
  name: p.properties['商品名']?.title?.[0]?.plain_text || '',
})).filter(p => OVERRIDES[p.name])

console.log(`🎯 対象: ${targets.length}件\n`)

const results = { updated: [], discontinued: [] }

for (const t of targets) {
  console.log(`🔍 ${t.name}`)
  const keywords = OVERRIDES[t.name]
  let best = null

  for (const kw of keywords) {
    try {
      const items = await searchRakuten(kw)
      const found = pickBest(items, t.name)
      if (found) {
        best = found
        console.log(`   候補発見 (kw=${kw})`)
        break
      }
      console.log(`   ヒットなし (kw=${kw})`)
    } catch (e) {
      console.log(`   エラー (kw=${kw}): ${e.message}`)
    }
    await sleep(1100)
  }

  if (best) {
    const data = {
      url: best.itemUrl,
      imageUrl: best.mediumImageUrls?.[0]?.replace(/\?_ex=.*$/, '') || '',
      price: best.itemPrice,
    }
    console.log(`   ✅ ${best.shopName} / ${data.price.toLocaleString()}円`)
    await notion.pages.update({
      page_id: t.id,
      properties: {
        '楽天URL': { url: data.url },
        '画像URL': { url: data.imageUrl },
        '価格': { rich_text: [{ text: { content: `約${data.price.toLocaleString('ja-JP')}円` } }] },
        'ステータス': { status: { name: '現行品' } },
      },
    })
    results.updated.push({ name: t.name, ...data, shop: best.shopName })
  } else {
    console.log(`   ⚠️  全候補で見つからず → 販売終了`)
    await notion.pages.update({
      page_id: t.id,
      properties: { 'ステータス': { status: { name: '販売終了' } } },
    })
    results.discontinued.push(t.name)
  }
  await sleep(1100)
}

console.log('\n══════════ 結果 ══════════')
console.log(`✅ 更新: ${results.updated.length}件`)
console.log(`⚠️  販売終了: ${results.discontinued.length}件`)
if (results.discontinued.length) {
  console.log('\n販売終了:')
  results.discontinued.forEach(n => console.log(`  - ${n}`))
}
