import dotenv from 'dotenv'
import { resolve } from 'path'
dotenv.config({ path: resolve(process.cwd(), '.env.local') })

const RAKUTEN_ENDPOINT = 'https://openapi.rakuten.co.jp/ichibams/api/IchibaItem/Search/20260401'

async function search(keyword) {
  const url = new URL(RAKUTEN_ENDPOINT)
  url.searchParams.set('applicationId', process.env.RAKUTEN_APP_ID)
  url.searchParams.set('accessKey', process.env.RAKUTEN_ACCESS_KEY)
  url.searchParams.set('keyword', keyword)
  url.searchParams.set('hits', '20')
  url.searchParams.set('availability', '1')
  url.searchParams.set('sort', 'standard')
  url.searchParams.set('formatVersion', '2')
  const r = await fetch(url)
  if (!r.ok) {
    return { error: await r.text() }
  }
  const data = await r.json()
  return { items: data.Items || [] }
}

const sleep = ms => new Promise(r => setTimeout(r, ms))

async function tryKeywords(label, keywords, includeMust = []) {
  console.log(`\n========== ${label} ==========`)
  for (const k of keywords) {
    try {
      const { items, error } = await search(k)
      if (error) {
        console.log(`  [${k}] ERROR: ${error.slice(0, 100)}`)
        await sleep(1500)
        continue
      }
      const filtered = includeMust.length
        ? items.filter(i => includeMust.every(m => (i.itemName || '').toLowerCase().includes(m.toLowerCase())))
        : items
      console.log(`\n  Keyword: "${k}" (${items.length}件 / フィルタ後 ${filtered.length}件)`)
      filtered.slice(0, 5).forEach(i => {
        const isUsed = /中古|used|リユース|リファービッシュ|訳あり|ジャンク|アウトレット/i.test(i.itemName + i.shopName + (i.itemCaption || ''))
        console.log(`    ${isUsed ? '🔸USED' : '🔹NEW '} [${i.shopName}] ¥${i.itemPrice}`)
        console.log(`         ${(i.itemName || '').slice(0, 80)}`)
      })
    } catch (e) {
      console.log(`  [${k}] EXCEPTION: ${e.message}`)
    }
    await sleep(1500)
  }
}

// HyperX QuadCast S 専用検索
await tryKeywords('HyperX QuadCast S（"S"が付く具体モデル）', [
  'QuadCast S',
  'HyperX QuadCast S RGB',
], ['quadcast', 's'])

// Universal Audio Volt 1 専用検索
await tryKeywords('Universal Audio Volt 1（"1"が付く具体モデル）', [
  'UA Volt 1',
  'Volt 1 オーディオインターフェース',
  'Universal Audio Volt',
], ['volt'])

// Blue Snowball iCE 専用検索（中古・アクセサリ除外）
await tryKeywords('Blue Snowball iCE', [
  'Blue Snowball iCE',
  'Snowball iCE マイク',
], ['snowball'])
