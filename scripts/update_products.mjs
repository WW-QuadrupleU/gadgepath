/**
 * 商品DBの全商品について、楽天IchibaItemSearch APIから
 * 楽天URL・画像URL・価格を取得してNotionを更新する
 *
 * 使い方:
 *   node scripts/update_products.mjs           # 不足項目のある商品のみ更新
 *   node scripts/update_products.mjs --all     # 全件強制更新
 *   node scripts/update_products.mjs --cat=マイク  # カテゴリ指定
 *   node scripts/update_products.mjs --dry     # Notion更新せず結果プレビューのみ
 */
import { Client } from '@notionhq/client'
import { config } from 'dotenv'
config({ path: '.env.local' })

const APP_ID     = process.env.RAKUTEN_APP_ID
const ACCESS_KEY = process.env.RAKUTEN_ACCESS_KEY
if (!APP_ID || !ACCESS_KEY) {
  console.error('❌ RAKUTEN_APP_ID と RAKUTEN_ACCESS_KEY を .env.local に設定してください')
  process.exit(1)
}

const notion = new Client({ auth: process.env.NOTION_TOKEN })
const PRODUCTS_DB = process.env.NOTION_PRODUCTS_DB_ID || 'c0f456c33c5740bc8d90025630236014'

// CLI フラグ
const args = process.argv.slice(2)
const FORCE_ALL  = args.includes('--all')
const DRY_RUN    = args.includes('--dry')
const UPDATE_ONLY = args.includes('--update-only') // 見つかったもののみ更新・販売終了マークしない
const CAT_FLAG   = args.find(a => a.startsWith('--cat='))?.split('=')[1]

// ── 楽天API：商品検索 ─────────────────────────────────────
async function searchRakuten(keyword) {
  const url = new URL('https://openapi.rakuten.co.jp/ichibams/api/IchibaItem/Search/20260401')
  url.searchParams.set('applicationId', APP_ID)
  url.searchParams.set('accessKey', ACCESS_KEY)
  url.searchParams.set('keyword', keyword)
  url.searchParams.set('hits', '20')
  url.searchParams.set('availability', '1') // 在庫ありのみ
  url.searchParams.set('sort', 'standard')
  url.searchParams.set('formatVersion', '2')

  const res = await fetch(url.toString())
  if (!res.ok) {
    const txt = await res.text()
    throw new Error(`楽天API ${res.status}: ${txt.slice(0, 200)}`)
  }
  const json = await res.json()
  return json.Items || []
}

// ── 公式ショップ判定 ──────────────────────────────────────
const OFFICIAL_KEYWORDS = [
  '公式', 'official', 'オフィシャル',
  'anker direct', 'logicool直営', 'sony公式', 'sony store',
  'razer 公式', 'elgato 公式', 'corsair公式', 'logitech公式',
]
const TRUSTED_SHOPS = [
  'biccamera', 'edion', 'joshin', 'yamada-denki', 'kojima',
  'soundhouse', 'anker', 'rakuten24', 'ec-current', 'pc-koubou',
  'tsukumo', 'dospara',
]

// 中古ショップ判定
const USED_KEYWORDS = ['中古', 'used', 'リサイクル', 'リファビッシュ', 'ジャンク', '訳あり']

function isUsedItem(item) {
  const blob = `${item.itemName} ${item.shopName} ${item.itemCaption || ''}`.toLowerCase()
  return USED_KEYWORDS.some(k => blob.toLowerCase().includes(k.toLowerCase()))
}

function shopScore(shopName) {
  const lower = shopName.toLowerCase()
  if (OFFICIAL_KEYWORDS.some(k => lower.includes(k.toLowerCase()))) return 3
  if (TRUSTED_SHOPS.some(k => lower.includes(k))) return 2
  return 1
}

// ── 最適な商品を選ぶ ─────────────────────────────────────
function pickBestItem(items, productName) {
  if (!items.length) return null

  // 中古を除外
  const newItems = items.filter(it => !isUsedItem(it))
  if (!newItems.length) return null // 新品なし → 販売終了扱い

  // 商品名の単語マッチ度をスコア化
  const targetWords = productName.toLowerCase().split(/[\s\-_／]+/).filter(w => w.length >= 2)
  const scored = newItems.map(it => {
    const name = (it.itemName || '').toLowerCase()
    const matches = targetWords.filter(w => name.includes(w)).length
    const ss = shopScore(it.shopName || '')
    return {
      item: it,
      score: matches * 10 + ss,
    }
  })

  scored.sort((a, b) => b.score - a.score)
  return scored[0].item
}

// ── Notion更新 ────────────────────────────────────────
async function updatePage(pageId, data) {
  if (DRY_RUN) return
  await notion.pages.update({
    page_id: pageId,
    properties: {
      '楽天URL': { url: data.url },
      '画像URL': { url: data.imageUrl },
      '価格':   { rich_text: [{ text: { content: `約${data.price.toLocaleString('ja-JP')}円` } }] },
      'ステータス': { status: { name: data.status } },
    },
  })
}

// ── メイン処理 ────────────────────────────────────────
async function main() {
  console.log('📚 商品DBから取得中...')
  const all = []
  let cursor = undefined
  do {
    const r = await notion.databases.query({ database_id: PRODUCTS_DB, start_cursor: cursor, page_size: 100 })
    all.push(...r.results)
    cursor = r.has_more ? r.next_cursor : undefined
  } while (cursor)

  let targets = all.map(p => ({
    id: p.id,
    name: p.properties['商品名']?.title?.[0]?.plain_text || '',
    category: p.properties['カテゴリ']?.select?.name || '',
    hasImg: !!p.properties['画像URL']?.url,
    hasUrl: !!p.properties['楽天URL']?.url,
    hasPrice: !!p.properties['価格']?.rich_text?.[0]?.plain_text,
  })).filter(p => p.name)

  if (CAT_FLAG) targets = targets.filter(t => t.category === CAT_FLAG)
  if (!FORCE_ALL) targets = targets.filter(t => !t.hasImg || !t.hasUrl || !t.hasPrice)

  console.log(`🎯 対象商品: ${targets.length}件 ${DRY_RUN ? '(DRY RUN)' : ''}\n`)

  const results = { updated: [], notFound: [], failed: [] }

  for (const t of targets) {
    try {
      console.log(`🔍 検索中: ${t.name}`)
      const items = await searchRakuten(t.name)
      const best  = pickBestItem(items, t.name)

      if (!best) {
        const action = UPDATE_ONLY ? '⏭️  スキップ（要手動確認）' : '⚠️  新品見つからず → 販売終了'
        console.log(`   ${action}`)
        if (!DRY_RUN && !UPDATE_ONLY) {
          await notion.pages.update({
            page_id: t.id,
            properties: { 'ステータス': { status: { name: '販売終了' } } },
          })
        }
        results.notFound.push(t.name)
        await sleep(1100)
        continue
      }

      const data = {
        url: best.itemUrl,
        imageUrl: best.mediumImageUrls?.[0]?.replace(/\?_ex=.*$/, '') || best.smallImageUrls?.[0] || '',
        price: best.itemPrice,
        status: '現行品',
      }

      console.log(`   ✅ ${best.shopName} / ${data.price.toLocaleString()}円`)
      await updatePage(t.id, data)
      results.updated.push({ name: t.name, ...data, shop: best.shopName })

      await sleep(1100) // 楽天API: 1req/sec
    } catch (e) {
      console.error(`   ❌ ${t.name}: ${e.message}`)
      results.failed.push({ name: t.name, error: e.message })
      await sleep(1100)
    }
  }

  // サマリー
  console.log('\n══════════ 結果 ══════════')
  console.log(`✅ 更新: ${results.updated.length}件`)
  console.log(`⚠️  販売終了: ${results.notFound.length}件`)
  console.log(`❌ 失敗: ${results.failed.length}件`)

  if (results.notFound.length) {
    console.log('\n販売終了:')
    results.notFound.forEach(n => console.log(`  - ${n}`))
  }
  if (results.failed.length) {
    console.log('\n失敗:')
    results.failed.forEach(f => console.log(`  - ${f.name}: ${f.error}`))
  }
}

const sleep = (ms) => new Promise(r => setTimeout(r, ms))

main().catch(e => { console.error(e); process.exit(1) })
