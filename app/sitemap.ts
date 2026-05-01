import { MetadataRoute } from 'next'
import { getAllSlugs } from '@/lib/notion'

export const revalidate = 3600

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://gadgepath.com'

  // 静的ページ
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/articles`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.4,
    },
    {
      url: `${baseUrl}/disclosure`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.3,
    },
  ]

  // 記事ページ（Notionから動的に取得）
  // lastModified = max(公開日, last_edited_time) で実際の更新日を反映
  const slugs = await getAllSlugs().catch(() => [])
  const articlePages: MetadataRoute.Sitemap = slugs
    .filter((s) => s.slug)
    .map((s) => {
      const published = s.publishedDate ? new Date(s.publishedDate) : null
      const edited = s.lastEdited ? new Date(s.lastEdited) : null
      const lastModified =
        published && edited
          ? new Date(Math.max(published.getTime(), edited.getTime()))
          : edited ?? published ?? new Date()
      return {
        url: `${baseUrl}/articles/${s.slug}`,
        lastModified,
        changeFrequency: 'weekly' as const,
        priority: 0.8,
      }
    })

  return [...staticPages, ...articlePages]
}
