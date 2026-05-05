import { NextResponse } from 'next/server'
import {
  FALLBACK_AI_PAYLOAD,
  type AiModel,
  type AiModelComparePayload,
} from '@/lib/ai-model-compare-data'

export const revalidate = 3600

type AaCreator = {
  name?: string
  slug?: string
}

type AaLlmModel = {
  id?: string
  name?: string
  slug?: string
  model_creator?: AaCreator
  evaluations?: {
    artificial_analysis_intelligence_index?: number
    artificial_analysis_coding_index?: number
    artificial_analysis_math_index?: number
  }
  pricing?: {
    price_1m_blended_3_to_1?: number
    price_1m_input_tokens?: number
    price_1m_output_tokens?: number
  }
  median_output_tokens_per_second?: number
  median_time_to_first_token_seconds?: number
  context_window?: number
}

type AaMediaModel = {
  id?: string
  name?: string
  slug?: string
  model_creator?: AaCreator
  elo?: number
  rank?: number
  release_date?: string
}

type AaResponse<T> = {
  status?: number
  data?: T[]
}

const AA_BASE_URL = 'https://artificialanalysis.ai/api/v2'
const SOURCE_URL = 'https://artificialanalysis.ai/'

function clamp(value: number, min = 0, max = 100): number {
  return Math.round(Math.max(min, Math.min(max, value)))
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function costLevel(price?: number): 1 | 2 | 3 | 4 | 5 {
  if (price == null) return 3
  if (price <= 0.1) return 1
  if (price <= 1) return 2
  if (price <= 5) return 3
  if (price <= 12) return 4
  return 5
}

function costScore(price?: number): number {
  if (price == null) return 70
  if (price <= 0.05) return 98
  if (price <= 0.2) return 94
  if (price <= 1) return 88
  if (price <= 3) return 80
  if (price <= 8) return 70
  if (price <= 15) return 60
  return 48
}

function normalizeIntelligence(value?: number): number {
  if (value == null) return 70
  return clamp((value / 60) * 100)
}

function normalizeMedia(elo?: number, min = 1050, max = 1350): number {
  if (elo == null) return 70
  return clamp(50 + ((elo - min) / (max - min)) * 50)
}

function speedScore(tokensPerSecond?: number): number {
  if (tokensPerSecond == null) return 70
  return clamp((tokensPerSecond / 180) * 100)
}

function llmFamily(name: string, creator: string): string {
  if (/gpt|o\d/i.test(name)) return 'GPT'
  if (/claude/i.test(name)) return name.includes('Opus') ? 'Claude Opus' : 'Claude'
  if (/gemini/i.test(name)) return 'Gemini'
  if (/grok/i.test(name)) return 'Grok'
  if (/kimi/i.test(name)) return 'Kimi'
  if (/qwen/i.test(name)) return 'Qwen'
  if (/llama/i.test(name)) return 'Llama'
  if (/deepseek/i.test(name)) return 'DeepSeek'
  return creator || 'LLM'
}

function mapLlmModel(model: AaLlmModel, index: number): AiModel | null {
  if (!model.name) return null

  const creator = model.model_creator?.name || 'Unknown'
  const intelligence = model.evaluations?.artificial_analysis_intelligence_index
  const coding = model.evaluations?.artificial_analysis_coding_index
  const math = model.evaluations?.artificial_analysis_math_index
  const blendedPrice = model.pricing?.price_1m_blended_3_to_1
  const overall = normalizeIntelligence(intelligence)
  const codingScore = coding == null ? clamp(overall - 3) : normalizeIntelligence(coding)
  const analysisScore = math == null ? clamp((overall + codingScore) / 2) : normalizeIntelligence(math)
  const speed = speedScore(model.median_output_tokens_per_second)

  return {
    id: model.id || model.slug || slugify(`${creator}-${model.name}`),
    name: model.name,
    creator,
    family: llmFamily(model.name, creator),
    releaseLabel: 'LLM',
    modality: 'LLM',
    accessType: 'Proprietary',
    costLevel: costLevel(blendedPrice),
    speed,
    japanese: /openai|anthropic|google/i.test(creator) ? 90 : 78,
    context: model.context_window ? clamp(Math.log10(model.context_window) * 22) : 84,
    rank: index + 1,
    metric: intelligence == null ? undefined : `Intelligence Index ${Math.round(intelligence)}`,
    sourceUrl: 'https://artificialanalysis.ai/leaderboards/models',
    scores: {
      overall,
      research: clamp(overall - 2),
      writing: clamp(overall - (/anthropic/i.test(creator) ? -2 : 4)),
      coding: codingScore,
      analysis: analysisScore,
      image: 35,
      video: 20,
      cost: costScore(blendedPrice),
    },
    strengths: ['公開ベンチマークで比較しやすい', '文章、コード、分析の基準モデルとして使いやすい'],
    cautions: ['用途別の体感はUI、プラン、ツール連携でも変わります', '最新情報や商用条件は公式ページで確認してください'],
    bestFor: '文章、調査、コード、分析などの汎用AI作業。',
    avoidFor: '画像生成や動画生成を主目的にする用途。',
    note: 'Artificial AnalysisのLLM指標をもとに自動反映しています。',
  }
}

function mediaFamily(name: string, creator: string): string {
  if (/kling/i.test(name) || /kling/i.test(creator)) return 'Kling'
  if (/veo/i.test(name)) return 'Veo'
  if (/runway/i.test(name) || /runway/i.test(creator)) return 'Runway'
  if (/sora/i.test(name)) return 'Sora'
  if (/gpt image|image/i.test(name) && /openai/i.test(creator)) return 'GPT Image'
  if (/nano banana|gemini/i.test(name)) return 'Gemini Image'
  if (/midjourney/i.test(name) || /midjourney/i.test(creator)) return 'Midjourney'
  return creator || 'Media'
}

function mapMediaModel(model: AaMediaModel, type: 'image' | 'video', fallbackRank: number): AiModel | null {
  if (!model.name) return null

  const creator = model.model_creator?.name || 'Unknown'
  const score = type === 'image' ? normalizeMedia(model.elo, 1050, 1350) : normalizeMedia(model.elo, 1050, 1400)
  const rank = model.rank ?? fallbackRank

  return {
    id: `${type}-${model.id || model.slug || slugify(`${creator}-${model.name}`)}`,
    name: model.name,
    creator,
    family: mediaFamily(model.name, creator),
    releaseLabel: model.release_date ? `Released ${model.release_date}` : type === 'image' ? 'Text to Image' : 'Text to Video',
    modality: type === 'image' ? 'Image' : 'Video',
    accessType: 'Specialized',
    costLevel: 3,
    speed: 55,
    japanese: 45,
    context: 35,
    rank,
    metric: model.elo == null ? undefined : `Elo ${Math.round(model.elo)}`,
    sourceUrl:
      type === 'image'
        ? 'https://artificialanalysis.ai/image/leaderboard/text-to-image'
        : 'https://artificialanalysis.ai/video/leaderboard/text-to-video',
    scores: {
      overall: clamp(score * 0.7),
      research: 8,
      writing: 18,
      coding: 5,
      analysis: 5,
      image: type === 'image' ? score : clamp(score * 0.8),
      video: type === 'video' ? score : clamp(score * 0.45),
      cost: 65,
    },
    strengths: [
      type === 'image' ? '画像生成品質の比較に使いやすい' : '動画生成品質の比較に使いやすい',
      'Eloベースで順位を追いやすい',
    ],
    cautions: ['文章や調査の汎用AIではありません', '商用利用条件と生成物の権利は公式情報を確認してください'],
    bestFor: type === 'image' ? '記事画像、サムネイル、広告素材の生成。' : '短尺動画、Bロール、SNS向け映像素材の生成。',
    avoidFor: '文章作成、調査、コード補助を主目的にする人。',
    note: `Artificial Analysisの${type === 'image' ? 'Text to Image' : 'Text to Video'}指標をもとに自動反映しています。`,
  }
}

async function fetchAa<T>(path: string, key: string): Promise<T[]> {
  const response = await fetch(`${AA_BASE_URL}${path}`, {
    headers: { 'x-api-key': key },
    next: { revalidate },
  })
  if (!response.ok) {
    throw new Error(`Artificial Analysis fetch failed: ${path} ${response.status}`)
  }
  const json = (await response.json()) as AaResponse<T>
  return Array.isArray(json.data) ? json.data : []
}

function uniqueModels(models: AiModel[]): AiModel[] {
  const seen = new Set<string>()
  return models.filter((model) => {
    const key = `${model.modality}:${model.creator}:${model.name}`.toLowerCase()
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

export async function GET() {
  const key = process.env.ARTIFICIAL_ANALYSIS_API_KEY

  if (!key) {
    return NextResponse.json(FALLBACK_AI_PAYLOAD, {
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
      },
    })
  }

  try {
    const [llms, images, textVideos, imageVideos] = await Promise.all([
      fetchAa<AaLlmModel>('/data/llms/models', key),
      fetchAa<AaMediaModel>('/data/media/text-to-image', key),
      fetchAa<AaMediaModel>('/data/media/text-to-video', key),
      fetchAa<AaMediaModel>('/data/media/image-to-video', key),
    ])

    const llmModels = llms
      .filter((model) => model.evaluations?.artificial_analysis_intelligence_index != null)
      .sort(
        (a, b) =>
          (b.evaluations?.artificial_analysis_intelligence_index ?? 0) -
          (a.evaluations?.artificial_analysis_intelligence_index ?? 0)
      )
      .slice(0, 24)
      .map(mapLlmModel)
      .filter((model): model is AiModel => Boolean(model))

    const imageModels = images
      .filter((model) => model.elo != null)
      .sort((a, b) => (a.rank ?? 9999) - (b.rank ?? 9999))
      .slice(0, 16)
      .map((model, index) => mapMediaModel(model, 'image', index + 1))
      .filter((model): model is AiModel => Boolean(model))

    const videoModels = [...textVideos, ...imageVideos]
      .filter((model) => model.elo != null)
      .sort((a, b) => (a.rank ?? 9999) - (b.rank ?? 9999))
      .slice(0, 24)
      .map((model, index) => mapMediaModel(model, 'video', index + 1))
      .filter((model): model is AiModel => Boolean(model))

    const payload: AiModelComparePayload = {
      models: uniqueModels([...llmModels, ...imageModels, ...videoModels]),
      updatedAt: new Date().toISOString(),
      source: 'artificial-analysis',
      sourceLabel: 'Artificial Analysis',
      sourceUrl: SOURCE_URL,
      isLive: true,
      message: 'Artificial Analysisの公開ベンチマークをもとに、1時間ごとに更新します。',
    }

    return NextResponse.json(payload, {
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
      },
    })
  } catch (error) {
    console.warn(error)
    return NextResponse.json(
      {
        ...FALLBACK_AI_PAYLOAD,
        updatedAt: new Date().toISOString(),
        message:
          'Artificial Analysisからの取得に失敗したため、フォールバックデータを表示しています。',
      },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=900, stale-while-revalidate=3600',
        },
      }
    )
  }
}
