import dotenv from 'dotenv'
import { resolve } from 'path'
dotenv.config({ path: resolve(process.cwd(), '.env.local') })

const RAKUTEN_ENDPOINT = 'https://openapi.rakuten.co.jp/ichibams/api/IchibaItem/Search/20260401'

const OFFICIAL_HINTS = ['公式', 'official', 'オフィシャル', '直営', 'fifine', 'shure']
const TRUSTED_HINTS = ['biccamera', 'ビックカメラ', 'edion', 'エディオン', 'joshin', 'yodobashi', 'ヨドバシ',
  'shimamura', '島村楽器', 'soundhouse', 'サウンドハウス', 'rakuten24', 'ヒビノ', 'hibino', 'ikebe', 'イケベ', 'rockon', 'fullten']
const ACCESSORY_KEYWORDS = ['ケース', 'case', 'カバー', 'フィルム', '保護', 'ウィンドスクリーン', 'ウインドスクリーン',
  'スクリーン', 'ポップフィルター', 'スポンジ', '風防', 'ケーブル', 'cable', '互換', '交換用', '収納']

async function search(keyword) {
  const url = new URL(RAKUTEN_ENDPOINT)
  url.searchParams.set('applicationId', process.env.RAKUTEN_APP_ID)
  url.searchParams.set('accessKey', process.env.RAKUTEN_ACCESS_KEY)
  url.searchParams.set('keyword', keyword)
  url.searchParams.set('hits', '30')
  url.searchParams.set('availability', '1')
  url.searchParams.set('sort', 'standard') // 関連度順
  url.searchParams.set('formatVersion', '2')
  const r = await fetch(url)
  if (!r.ok) throw new Error(`${r.status}: ${await r.text()}`)
  const data = await r.json()
  return data.Items || []
}

const sleep = ms => new Promise(r => setTimeout(r, ms))

function isAccessory(item) {
  const blob = `${item.itemName || ''}`.toLowerCase()
  return ACCESSORY_KEYWORDS.some(k => blob.includes(k.toLowerCase()))
}

function shopRank(shopName = '') {
  const lower = shopName.toLowerCase()
  if (OFFICIAL_HINTS.some(h => lower.includes(h.toLowerCase()))) return 'official'
  if (TRUSTED_HINTS.some(h => lower.includes(h.toLowerCase()))) return 'trusted'
  return 'other'
}

async function find(productName, mustInclude = []) {
  console.log(`\n========== ${productName} ==========`)
  const items = await search(productName)
  // 全トークン含むこと
  const tokens = productName.toLowerCase().split(/\s+/).filter(t => t.length >= 2)
  const strict = items.filter(i => {
    const name = (i.itemName || '').toLowerCase()
    return tokens.every(t => name.includes(t)) && mustInclude.every(m => name.includes(m.toLowerCase()))
  })

  // アクセサリでない & 中古でない
  const standalone = strict.filter(i => !isAccessory(i)).filter(i => {
    const blob = (i.itemName + (i.itemCaption || '')).toLowerCase()
    return !/中古|used|リファービッシュ|訳あり|アウトレット/.test(blob)
  })

  console.log(`Strict matches: ${strict.length} / Non-accessory new: ${standalone.length}`)

  // 公式 → 信頼 → その他 の順で表示
  const sorted = [...standalone].sort((a, b) => {
    const order = { official: 0, trusted: 1, other: 2 }
    return order[shopRank(a.shopName)] - order[shopRank(b.shopName)]
  })

  console.log('\nTop 8 candidates:')
  sorted.slice(0, 8).forEach(i => {
    console.log(`  [${shopRank(i.shopName).toUpperCase()}] [${i.shopName}] ¥${i.itemPrice}`)
    console.log(`    ${(i.itemName || '').slice(0, 100)}`)
    console.log(`    ${i.itemUrl}`)
    console.log(`    img: ${(i.mediumImageUrls?.[0] || '').slice(0, 100)}`)
  })

  return sorted[0]
}

const results = {}
results['FIFINE K669B'] = await find('FIFINE K669B')
await sleep(1500)
results['Shure MV6'] = await find('Shure MV6', ['mv6'])
await sleep(1500)
results['YAMAHA AG03MK2'] = await find('YAMAHA AG03MK2', ['ag03mk2'])

console.log('\n\n========== FINAL PICKS ==========')
for (const [name, item] of Object.entries(results)) {
  if (!item) { console.log(`${name}: NO STANDALONE FOUND`); continue }
  console.log(`\n${name}:`)
  console.log(`  shop : ${item.shopName} (${shopRank(item.shopName)})`)
  console.log(`  name : ${item.itemName}`)
  console.log(`  price: ¥${item.itemPrice}`)
  console.log(`  url  : ${item.itemUrl}`)
  console.log(`  image: ${item.mediumImageUrls?.[0] || ''}`)
}
