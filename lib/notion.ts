import { Client } from '@notionhq/client'
import { NotionToMarkdown } from 'notion-to-md'

const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 1000;

async function fetchWithRetry(url: string | URL | Request, init?: RequestInit): Promise<Response> {
  let retries = 0;
  while (true) {
    try {
      const response = await fetch(url, init);
      if (response.status >= 500 && response.status <= 599 && retries < MAX_RETRIES) {
        retries++;
        console.warn(`Notion API returned ${response.status}, retrying (${retries}/${MAX_RETRIES})...`);
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY_MS * retries));
        continue;
      }
      return response;
    } catch (error) {
      if (retries < MAX_RETRIES) {
        retries++;
        console.warn(`Notion API fetch failed, retrying (${retries}/${MAX_RETRIES})...`);
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY_MS * retries));
        continue;
      }
      throw error;
    }
  }
}

const notion = new Client({ 
  auth: process.env.NOTION_TOKEN,
  fetch: fetchWithRetry as any
})
const n2m = new NotionToMarkdown({ notionClient: notion })

const ARTICLES_DB = process.env.NOTION_ARTICLES_DB_ID!
const PRODUCTS_DB = process.env.NOTION_PRODUCTS_DB_ID || 'c0f456c33c5740bc8d90025630236014'

export type Article = {
  id: string
  title: string
  slug: string
  category: string
  seoKeyword: string
  metaDescription: string
  publishedDate: string
  lastEdited: string
}

export type ArticleWithContent = Article & { content: string }

function pageToArticle(page: any): Article {
  return {
    id: page.id,
    title: page.properties['タイトル']?.title[0]?.plain_text || '',
    slug: page.properties['スラッグ']?.rich_text[0]?.plain_text || '',
    category: page.properties['カテゴリ']?.select?.name || '',
    seoKeyword: page.properties['SEOキーワード']?.rich_text[0]?.plain_text || '',
    metaDescription: page.properties['メタディスクリプション']?.rich_text[0]?.plain_text || '',
    publishedDate: page.properties['公開日']?.date?.start || '',
    lastEdited: page.last_edited_time,
  }
}

export async function getPublishedArticles(): Promise<Article[]> {
  const response = await notion.databases.query({
    database_id: ARTICLES_DB,
    filter: {
      property: 'ステータス',
      select: { equals: '公開済み' },
    },
    sorts: [{ property: '公開日', direction: 'descending' }],
  })
  return response.results.map(pageToArticle)
}

export async function getArticleBySlug(slug: string): Promise<ArticleWithContent | null> {
  const response = await notion.databases.query({
    database_id: ARTICLES_DB,
    filter: {
      and: [
        { property: 'スラッグ', rich_text: { equals: slug } },
        { property: 'ステータス', select: { equals: '公開済み' } },
      ],
    },
  })

  if (!response.results.length) return null

  const page = response.results[0]
  const mdBlocks = await n2m.pageToMarkdown(page.id)
  const { parent: content } = n2m.toMarkdownString(mdBlocks)

  return { ...pageToArticle(page), content }
}

export async function getAllSlugs(): Promise<{ slug: string }[]> {
  const response = await notion.databases.query({
    database_id: ARTICLES_DB,
    filter: { property: 'ステータス', select: { equals: '公開済み' } },
  })
  return response.results.map((page: any) => ({
    slug: page.properties['スラッグ']?.rich_text[0]?.plain_text || '',
  }))
}

// ────────────────────────────────────────
// 商品データベース
// ────────────────────────────────────────
export type Product = {
  id: string
  name: string
  slug: string
  rakutenUrl: string
  price: string
  imageUrl: string
  category: string
  articleSlugs: string[]
  displayOrder: number
}

function pageToProduct(page: any): Product {
  return {
    id: page.id,
    name: page.properties['商品名']?.title[0]?.plain_text || '',
    slug: page.properties['スラッグ']?.rich_text[0]?.plain_text || '',
    rakutenUrl: page.properties['楽天URL']?.url || '',
    price: page.properties['価格']?.rich_text[0]?.plain_text || '',
    imageUrl: page.properties['画像URL']?.url || '',
    category: page.properties['カテゴリ']?.select?.name || '',
    articleSlugs: page.properties['記事スラッグ']?.multi_select?.map((s: any) => s.name) || [],
    displayOrder: page.properties['表示順']?.number ?? 999,
  }
}

export async function getProductsByArticleSlug(articleSlug: string): Promise<Product[]> {
  try {
    const response = await notion.databases.query({
      database_id: PRODUCTS_DB,
      filter: {
        property: '記事スラッグ',
        multi_select: { contains: articleSlug },
      },
      sorts: [{ property: '表示順', direction: 'ascending' }],
    })
    return response.results.map(pageToProduct)
  } catch {
    return []
  }
}

// ────────────────────────────────────────
// 価格の表示整形：数字のみ入力 → "2,500円" に変換
// すでに「約」「円」「〜」などが含まれる場合はそのまま返す
export function formatPrice(raw: string): string {
  if (!raw) return ''
  const stripped = raw.replace(/[,，\s円]/g, '')
  const num = Number(stripped)
  if (!isNaN(num) && stripped !== '') {
    return num.toLocaleString('ja-JP') + '円'
  }
  return raw
}

// ────────────────────────────────────────
export const CATEGORIES = [
  { name: 'マイク', slug: 'mic', emoji: '🎙️', icon: '/icons/mic.png' },
  { name: 'カメラ', slug: 'camera', emoji: '📷', icon: '/icons/camera.png' },
  { name: '照明', slug: 'light', emoji: '💡', icon: '/icons/light.png' },
  { name: 'ヘッドセット', slug: 'headset', emoji: '🎧', icon: '/icons/headset.png' },
  { name: 'SSD・ストレージ', slug: 'storage', emoji: '💾', icon: '/icons/storage.png' },
  { name: 'USBハブ', slug: 'hub', emoji: '🔌', icon: '/icons/hub.png' },
  { name: '機材セット', slug: 'set', emoji: '📦', icon: '/icons/set.png' },
  { name: 'キャプチャーボード', slug: 'capture', emoji: '🎮', icon: '/icons/capture.png' },
  { name: 'AIツール', slug: 'ai', emoji: '🤖', icon: '/icons/ai.png' },
]
