import { Client } from '@notionhq/client'
import { NotionToMarkdown } from 'notion-to-md'

const notion = new Client({ auth: process.env.NOTION_TOKEN })
const n2m = new NotionToMarkdown({ notionClient: notion })

const ARTICLES_DB = process.env.NOTION_ARTICLES_DB_ID!

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

export const CATEGORIES = [
  { name: 'マイク', slug: 'mic', emoji: '🎙️' },
  { name: 'カメラ', slug: 'camera', emoji: '📷' },
  { name: '照明', slug: 'light', emoji: '💡' },
  { name: 'ヘッドセット', slug: 'headset', emoji: '🎧' },
  { name: 'SSD・ストレージ', slug: 'storage', emoji: '💾' },
  { name: 'USBハブ', slug: 'hub', emoji: '🔌' },
  { name: '機材セット', slug: 'set', emoji: '📦' },
  { name: 'キャプチャーボード', slug: 'capture', emoji: '🎮' },
]
