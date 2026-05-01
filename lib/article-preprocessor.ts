import type { Product } from './notion'
import { formatPrice } from './notion'

/**
 * 文字列を正規化（小文字化＋記号除去）して商品名マッチングに使う
 */
export function normalize(s: string): string {
  return s.toLowerCase().replace(/[\s\-_+・/／,、（）()【】「」『』]/g, '')
}

/**
 * 記事Markdownを前処理：
 * ① Amazon検索URLを含む行 → 実売価格置換＋カードマーカー挿入
 * ② 番号付きリスト項目 → 商品名マッチングでカードマーカー挿入
 */
function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function articlePrice(product: Product): string {
  const price = formatPrice(product.price)
  if (!price) return ''
  return price.startsWith('約') ? price : `約${price}`
}

function productAliases(product: Product): string[] {
  const names = new Set<string>()
  names.add(product.name)
  names.add(product.name.replace(/[（(].*?[）)]/g, '').trim())
  names.add(product.name.replace(/（1TB）|\(1TB\)/g, '').trim())
  names.add(product.slug)

  return [...names].filter((name) => name.length >= 4)
}

function syncBudgetHeading(line: string): string {
  if (!/^#{2,6}\s/.test(line) || !line.includes('円')) return line

  return line
    .replace(/【[^】]*円[^】]*】\s*/g, '')
    .replace(/(【[^】]+】)\s*[〜～~]?[0-9０-９][0-9０-９,.]*(?:万)?円[^：:]*[：:]/g, '$1：')
}

function syncPriceMentions(content: string, products: Product[]): string {
  const pricePattern = /約?[0-9０-９][0-9０-９,.]*(?:万)?(?:\s*[〜～~-]\s*約?[0-9０-９][0-9０-９,.]*(?:万)?)?円(?:台)?/g
  const productsWithPrice = products
    .filter((product) => product.price)
    .map((product) => ({
      price: articlePrice(product),
      aliases: productAliases(product),
    }))
    .sort((a, b) => Math.max(...b.aliases.map((alias) => alias.length)) - Math.max(...a.aliases.map((alias) => alias.length)))

  return content
    .split('\n')
    .map((line) => {
      const budgetSyncedLine = syncBudgetHeading(line)
      const matches = productsWithPrice.filter(({ aliases }) =>
        aliases.some((alias) => alias && new RegExp(escapeRegExp(alias), 'i').test(budgetSyncedLine))
      )

      if (matches.length !== 1 || !pricePattern.test(budgetSyncedLine)) {
        pricePattern.lastIndex = 0
        return budgetSyncedLine
      }

      pricePattern.lastIndex = 0
      return budgetSyncedLine.replace(pricePattern, matches[0].price)
    })
    .join('\n')
}

export function preprocessContent(content: string, products: Product[]): string {
  const normalized = syncPriceMentions(content.replace(/\r\n/g, '\n').replace(/\r/g, '\n'), products)
  const lines = normalized.split('\n')
  const result: string[] = []
  const cardInsertedFor = new Set<string>()

  // ── Pass 1: Amazon検索URL処理（既存ロジック） ──
  for (const line of lines) {
    const urlMatch = line.match(/\]\((https?:\/\/(?:www\.)?amazon\.co\.jp\/s[^)]+)\)/)
    if (!urlMatch) {
      result.push(line)
      continue
    }

    let processedLine = line
    let insertCard = false
    let matchedName = ''

    try {
      const url = new URL(urlMatch[1])
      const keyword = url.searchParams.get('k') || ''
      const nk = normalize(keyword)
      const matched = products.find(p => {
        const n = normalize(p.name), s = normalize(p.slug)
        return nk.includes(n) || n.includes(nk) || nk.includes(s) || s.includes(nk)
      })

      if (matched) {
        if (matched.price) {
          const actual = formatPrice(matched.price)
          processedLine = processedLine.replace(/実売価格[：:].*$/, `実売価格：${actual}`)
        }
        if (matched.rakutenUrl && matched.imageUrl) {
          insertCard = true
          matchedName = matched.name
        }
      }
    } catch {}

    result.push(processedLine)
    if (insertCard) {
      cardInsertedFor.add(matchedName)
      result.push('')
      result.push(`!!GADGE_CARD_URL!!:${encodeURIComponent(urlMatch[1])}`)
      result.push('')
    }
  }

  // ── Pass 2: 番号付きリスト項目から商品名を検出し、リスト終了後にカード挿入 ──
  // リスト項目内にカードを入れると ol>li>div の無効HTMLになるため
  // 「商品名行を検出 → リストが終わったタイミングでカードを出力」する
  const finalResult: string[] = []
  const pendingCards: string[] = [] // リスト終了後に出力するカードマーカー

  for (let i = 0; i < result.length; i++) {
    const line = result[i]

    // 現在行が番号付きリスト項目または見出し番号付きかチェック
    const listMatch = line.match(/^(?:#+\s*)?\d+\.\s+([^\[｜|]+)/)
    if (listMatch) {
      const itemText = listMatch[1].trim()
      const tokens = itemText.split(/\s*[/／]\s*/)
      let matched = null

      const nFull = normalize(itemText)
      matched = products.find(p => {
        const n = normalize(p.name)
        return nFull.includes(n) || n.includes(nFull)
      }) ?? null

      if (!matched) {
        for (let ti = 0; ti < tokens.length; ti++) {
          const candidate = normalize(tokens[0] + tokens.slice(ti).join(''))
          matched = products.find(p => {
            const n = normalize(p.name)
            return candidate.includes(n) || n.includes(candidate)
          }) ?? null
          if (matched) break

          const single = normalize(tokens[ti])
          if (single.length >= 5) {
            matched = products.find(p => {
              const n = normalize(p.name)
              return n.includes(single) && single.length / n.length > 0.6
            }) ?? null
            if (matched) break
          }
        }
      }

      if (matched && matched.rakutenUrl && matched.imageUrl && !cardInsertedFor.has(matched.name)) {
        cardInsertedFor.add(matched.name)
        pendingCards.push(`!!GADGE_CARD_NAME!!:${encodeURIComponent(matched.name)}`)
      }

      finalResult.push(line)
      continue
    }

    // リスト項目以外の行に来たとき、pendingCards があれば先に出力
    if (pendingCards.length > 0) {
      // 空行はスキップして次の実コンテンツ行の直前に挿入
      const isBlank = line.trim() === ''
      if (!isBlank) {
        for (const card of pendingCards) {
          finalResult.push('')
          finalResult.push(card)
          finalResult.push('')
        }
        pendingCards.length = 0
      }
    }

    finalResult.push(line)
  }

  // 末尾に残ったカードがあれば追加
  for (const card of pendingCards) {
    finalResult.push('')
    finalResult.push(card)
    finalResult.push('')
  }

  return finalResult.join('\n')
}
