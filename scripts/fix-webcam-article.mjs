/**
 * Webcam記事の修正スクリプト
 * 1. StreamCam と PowerConf C300 の商品データを削除（アーカイブ）
 * 2. 記事本文から該当セクションを削除＋リナンバリング
 */
import { Client } from '@notionhq/client'
import dotenv from 'dotenv'
import { resolve } from 'path'

// .env.local を読み込み
dotenv.config({ path: resolve(process.cwd(), '.env.local') })

const notion = new Client({ auth: process.env.NOTION_TOKEN })
const ARTICLES_DB = process.env.NOTION_ARTICLES_DB_ID
const PRODUCTS_DB = process.env.NOTION_PRODUCTS_DB_ID || 'c0f456c33c5740bc8d90025630236014'

const ARTICLE_SLUG = 'webcam-comparison-2026'

async function main() {
  console.log('=== 1. 記事ページの特定 ===')
  const articleRes = await notion.databases.query({
    database_id: ARTICLES_DB,
    filter: {
      property: 'スラッグ',
      rich_text: { equals: ARTICLE_SLUG },
    },
  })

  if (!articleRes.results.length) {
    console.error('記事が見つかりません:', ARTICLE_SLUG)
    process.exit(1)
  }

  const articlePage = articleRes.results[0]
  console.log('記事ID:', articlePage.id)
  console.log('タイトル:', articlePage.properties['タイトル']?.title?.[0]?.plain_text)

  console.log('\n=== 2. 商品データの確認 ===')
  const productsRes = await notion.databases.query({
    database_id: PRODUCTS_DB,
    filter: {
      property: '記事スラッグ',
      multi_select: { contains: ARTICLE_SLUG },
    },
    sorts: [{ property: '表示順', direction: 'ascending' }],
  })

  console.log(`商品数: ${productsRes.results.length}`)
  for (const p of productsRes.results) {
    const props = p.properties
    const name = props['商品名']?.title?.[0]?.plain_text || '(無題)'
    const imageUrl = props['画像URL']?.url || '(なし)'
    const rakutenUrl = props['楽天URL']?.url || '(なし)'
    const order = props['表示順']?.number ?? '(なし)'
    console.log(`  [${order}] ${name}`)
    console.log(`       画像: ${imageUrl === '(なし)' ? '❌ なし' : '✅ あり'}`)
    console.log(`       楽天: ${rakutenUrl === '(なし)' ? '❌ なし' : '✅ あり'}`)
    console.log(`       ID: ${p.id}`)
  }

  // 削除対象の特定
  const toDelete = productsRes.results.filter(p => {
    const name = p.properties['商品名']?.title?.[0]?.plain_text || ''
    return name.includes('StreamCam') || name.includes('PowerConf')
  })

  if (toDelete.length === 0) {
    console.log('\n✅ 削除対象の商品は見つかりませんでした（既に削除済み？）')
  } else {
    console.log(`\n=== 3. 商品の削除（アーカイブ） ===`)
    for (const p of toDelete) {
      const name = p.properties['商品名']?.title?.[0]?.plain_text
      console.log(`  アーカイブ中: ${name} (${p.id})`)
      await notion.pages.update({
        page_id: p.id,
        archived: true,
      })
      console.log(`  ✅ アーカイブ完了: ${name}`)
    }
  }

  console.log('\n=== 4. 記事本文のブロック取得 ===')
  const blocks = await getAllBlocks(articlePage.id)
  console.log(`ブロック数: ${blocks.length}`)

  // StreamCam と PowerConf のセクションを特定
  // 番号付きリスト項目を探す
  const deleteTargets = []
  for (let i = 0; i < blocks.length; i++) {
    const block = blocks[i]
    const text = getPlainText(block)
    if (text && (text.includes('StreamCam') || text.includes('PowerConf C300'))) {
      // この見出しとそれに続くリスト項目を収集
      deleteTargets.push({ index: i, id: block.id, text: text.substring(0, 60) })
      // 後続のブロック（次の見出しまで）も削除対象
      for (let j = i + 1; j < blocks.length; j++) {
        const nextBlock = blocks[j]
        const nextType = nextBlock.type
        // 次の numbered_list_item (新しい商品) や heading が来たら止まる
        if (nextType === 'heading_2' || nextType === 'heading_3' ||
            (nextType === 'numbered_list_item' && !isSubItem(blocks, j, i))) {
          break
        }
        deleteTargets.push({ index: j, id: nextBlock.id, text: getPlainText(nextBlock)?.substring(0, 60) || nextBlock.type })
      }
    }
  }

  if (deleteTargets.length === 0) {
    console.log('✅ 記事本文に削除対象のセクションが見つかりませんでした')
  } else {
    console.log(`\n=== 5. 記事本文から ${deleteTargets.length} ブロックを削除 ===`)
    for (const target of deleteTargets) {
      console.log(`  削除中: [${target.index}] ${target.text}`)
      await notion.blocks.delete({ block_id: target.id })
    }
    console.log('✅ ブロック削除完了')
  }

  console.log('\n=== 完了 ===')
}

// 全ブロックを取得（ページネーション対応）
async function getAllBlocks(pageId) {
  const blocks = []
  let cursor = undefined
  do {
    const res = await notion.blocks.children.list({
      block_id: pageId,
      start_cursor: cursor,
      page_size: 100,
    })
    blocks.push(...res.results)
    cursor = res.has_more ? res.next_cursor : undefined
  } while (cursor)
  return blocks
}

// ブロックのプレーンテキストを取得
function getPlainText(block) {
  const type = block.type
  const content = block[type]
  if (!content?.rich_text) return null
  return content.rich_text.map(t => t.plain_text).join('')
}

// サブ項目（bulleted_list_item等）かどうかの簡易判定
function isSubItem(blocks, currentIdx, parentIdx) {
  // 同じnumbered_list_itemが続く場合、それは新しい商品
  return false
}

main().catch(err => {
  console.error('エラー:', err.message)
  process.exit(1)
})
