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
  const data = await r.json()
  return data.Items || []
}

const productName = 'Universal Audio Volt 1'
console.log(`Searching: ${productName}\n`)
let items = []
try {
  items = await search(productName)
} catch (e) {
  console.log('Try 1 failed, fallback...')
  items = await search('Universal Audio Volt')
}

const tokens = productName.toLowerCase().split(/\s+/).filter(t => t.length >= 2)
console.log(`tokens: ${tokens.join(', ')}\n`)

const strictMatches = items.filter(i => {
  const name = (i.itemName || '').toLowerCase()
  return tokens.every(t => name.includes(t))
})

console.log(`Total items: ${items.length}`)
console.log(`Strict matches (all tokens): ${strictMatches.length}\n`)

console.log('--- Strict matches (Volt 1 specifically) ---')
strictMatches.slice(0, 10).forEach(i => {
  console.log(`[${i.shopName}] ¥${i.itemPrice}`)
  console.log(`  ${i.itemName}`)
  console.log(`  ${i.itemUrl}`)
  console.log('')
})

console.log('--- All items (top 10) ---')
items.slice(0, 10).forEach(i => {
  console.log(`[${i.shopName}] ¥${i.itemPrice}`)
  console.log(`  ${i.itemName.slice(0, 80)}`)
  console.log('')
})
