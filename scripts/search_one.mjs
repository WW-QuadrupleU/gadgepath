/**
 * 単一商品名で楽天検索を試して結果を表示するだけのツール
 * 使い方: node scripts/search_one.mjs "検索キーワード"
 */
import { config } from 'dotenv'
config({ path: '.env.local' })

const APP_ID = process.env.RAKUTEN_APP_ID
const ACCESS_KEY = process.env.RAKUTEN_ACCESS_KEY
const keyword = process.argv.slice(2).join(' ')

if (!keyword) {
  console.error('使用例: node scripts/search_one.mjs "Anker 777"')
  process.exit(1)
}

const url = new URL('https://openapi.rakuten.co.jp/ichibams/api/IchibaItem/Search/20260401')
url.searchParams.set('applicationId', APP_ID)
url.searchParams.set('accessKey', ACCESS_KEY)
url.searchParams.set('keyword', keyword)
url.searchParams.set('hits', '10')
url.searchParams.set('availability', '1')
url.searchParams.set('formatVersion', '2')

const res = await fetch(url.toString())
const json = await res.json()

if (json.errors) {
  console.error('❌', json.errors)
  process.exit(1)
}

console.log(`📦 検索キーワード: "${keyword}"`)
console.log(`📊 ヒット数: ${json.count} 件\n`)

const items = (json.Items || []).slice(0, 10)
for (const [i, it] of items.entries()) {
  const isUsed = /中古|used|リサイクル|訳あり/i.test(`${it.itemName} ${it.shopName} ${it.itemCaption || ''}`)
  console.log(`${i + 1}. ${isUsed ? '🔴中古' : '🟢新品'} ${it.shopName}`)
  console.log(`   ${it.itemName.slice(0, 70)}`)
  console.log(`   価格: ${it.itemPrice.toLocaleString()}円`)
  console.log(`   URL: ${it.itemUrl}`)
  console.log(`   画像: ${it.mediumImageUrls?.[0]?.replace(/\?_ex=.*/, '') || ''}`)
  console.log('')
}
