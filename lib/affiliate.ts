import { MOSHIMO_BASE } from './constants'

/**
 * 楽天URLをもしもアフィリエイト経由のURLに変換する
 * 他社アフィリエイトパラメータ (scid, sc2id) は除去する
 */
export function buildAffiliateUrl(rakutenUrl: string): string {
  try {
    const url = new URL(rakutenUrl)
    url.searchParams.delete('scid')
    url.searchParams.delete('sc2id')
    const cleanUrl = url.toString()
    return `${MOSHIMO_BASE}${encodeURIComponent(cleanUrl)}`
  } catch {
    return `${MOSHIMO_BASE}${encodeURIComponent(rakutenUrl)}`
  }
}
