import { Client } from '@notionhq/client'
import dotenv from 'dotenv'
import { resolve } from 'path'

dotenv.config({ path: resolve(process.cwd(), '.env.local') })
const notion = new Client({ auth: process.env.NOTION_TOKEN })

const DRY = process.argv.includes('--dry')

// 削除対象ブロックID（事前検証済み）
const BLOCKS_TO_DELETE = [
  // Blue Snowball iCE（中古のみ、新品は実質ケーブル類）
  { product: 'Blue Snowball iCE', id: '8113c9c7-2ccb-4b60-be96-b2af4467e371', desc: 'リンク段落' },
  { product: 'Blue Snowball iCE', id: 'd9934d09-ed7f-4d45-9c3e-c7ce702b5fb0', desc: '箇条書き1' },
  { product: 'Blue Snowball iCE', id: 'b8730854-f4ea-4123-8964-ae98333467eb', desc: '箇条書き2' },
  { product: 'Blue Snowball iCE', id: '33676d7f-7be7-4e17-969c-5f7c99e79339', desc: '箇条書き3' },

  // HyperX QuadCast S（後継 QuadCast 2 に置換、楽天で実質流通なし）
  { product: 'HyperX QuadCast S', id: 'fd5385f1-2f79-46e1-ac8a-3fe7283429bf', desc: 'リンク段落' },
  { product: 'HyperX QuadCast S', id: '4b18049b-6a8f-4312-a9cf-7d87ac8dbba4', desc: '箇条書き1' },
  { product: 'HyperX QuadCast S', id: 'b6717689-b002-4bf0-95ba-abf65bfd10bd', desc: '箇条書き2' },
  { product: 'HyperX QuadCast S', id: '95a3a097-6820-401d-afa1-29ff07dfb7c2', desc: '箇条書き3' },

  // Universal Audio Volt 1（楽天で Volt 176/276 のみ、Volt 1 単体なし）
  { product: 'Universal Audio Volt 1', id: 'ca8490cb-94c5-4181-b13b-5b1a29b048a0', desc: 'リンク段落' },
  { product: 'Universal Audio Volt 1', id: '65fb738d-01b1-42b4-bb55-076cf788f102', desc: '箇条書き1' },
  { product: 'Universal Audio Volt 1', id: 'ac806fda-b375-4b81-b24b-a57eb630d068', desc: '箇条書き2' },
  { product: 'Universal Audio Volt 1', id: '794176a8-4ef7-46a3-98b0-dc5e49ec7964', desc: '箇条書き3' },
]

const sleep = ms => new Promise(r => setTimeout(r, ms))

async function main() {
  console.log(`削除対象: ${BLOCKS_TO_DELETE.length}ブロック ${DRY ? '(dry-run)' : ''}\n`)

  // まず各ブロックの実際の内容を取得して安全確認
  for (const target of BLOCKS_TO_DELETE) {
    try {
      const block = await notion.blocks.retrieve({ block_id: target.id })
      const t = block.type
      const rt = block[t]?.rich_text
      const text = rt ? rt.map(r => r.plain_text).join('') : ''
      console.log(`✓ ${target.product} | ${target.desc} | ${t}`)
      console.log(`  "${text.slice(0, 80)}"`)
    } catch (e) {
      console.error(`✗ ${target.product} | ${target.id}: ${e.message}`)
      throw new Error('安全確認失敗。実行を中止します。')
    }
    await sleep(150)
  }

  if (DRY) {
    console.log('\n--dry-run--: 実際の削除はスキップします')
    return
  }

  console.log('\n実削除を開始します...\n')
  let deleted = 0
  for (const target of BLOCKS_TO_DELETE) {
    try {
      await notion.blocks.delete({ block_id: target.id })
      deleted++
      console.log(`削除 ${deleted}/${BLOCKS_TO_DELETE.length}: ${target.product} | ${target.desc}`)
      await sleep(200)
    } catch (e) {
      console.error(`削除失敗: ${target.id}: ${e.message}`)
    }
  }
  console.log(`\n完了: ${deleted}ブロック削除`)
}

main().catch(e => { console.error(e); process.exit(1) })
