import { Client } from '@notionhq/client'
import { CPU_DATA, GPU_DATA, type CpuSpec, type GpuSpec } from '@/lib/spec-compare-data'

const CPU_DB_ID = process.env.NOTION_CPU_BENCHMARKS_DB_ID || '3577d352-ad06-81f8-b365-e7c5c254efdf'
const GPU_DB_ID = process.env.NOTION_GPU_BENCHMARKS_DB_ID || '3577d352-ad06-81d2-8541-e0c82c8fd81a'

const notion = new Client({ auth: process.env.NOTION_TOKEN })

function title(page: any, property: string): string {
  return page.properties[property]?.title?.map((item: any) => item.plain_text).join('') || ''
}

function text(page: any, property: string): string {
  return page.properties[property]?.rich_text?.map((item: any) => item.plain_text).join('') || ''
}

function select(page: any, property: string): string {
  return page.properties[property]?.select?.name || ''
}

function number(page: any, property: string): number {
  return page.properties[property]?.number ?? 0
}

async function queryAll(databaseId: string) {
  const results: any[] = []
  let startCursor: string | undefined

  do {
    const response = await notion.databases.query({
      database_id: databaseId,
      page_size: 100,
      start_cursor: startCursor,
    })
    results.push(...response.results)
    startCursor = response.has_more ? response.next_cursor || undefined : undefined
  } while (startCursor)

  return results
}

function pageToCpu(page: any): CpuSpec | null {
  const id = text(page, 'ID')
  const name = title(page, '名前')
  const brand = select(page, 'メーカー') as CpuSpec['brand']
  if (!id || !name || (brand !== 'Intel' && brand !== 'AMD')) return null

  return {
    id,
    name,
    brand,
    generation: select(page, '世代'),
    year: number(page, '発売年'),
    socket: select(page, 'ソケット'),
    cores: number(page, 'コア'),
    threads: number(page, 'スレッド'),
    baseClockGhz: number(page, 'ベースGHz'),
    boostClockGhz: number(page, '最大GHz'),
    tdpW: number(page, 'TDP W'),
    passmarkMulti: number(page, 'PassMark Multi'),
    passmarkSingle: number(page, 'PassMark Single'),
    cinebenchR23Multi: number(page, 'Cinebench R23 Multi'),
    gamingIndex: number(page, 'ゲーム指数'),
    creatorIndex: number(page, '制作指数'),
    marketPriceYen: number(page, '価格目安'),
    note: text(page, 'メモ'),
  }
}

function pageToGpu(page: any): GpuSpec | null {
  const id = text(page, 'ID')
  const name = title(page, '名前')
  const brand = select(page, 'メーカー') as GpuSpec['brand']
  if (!id || !name || (brand !== 'NVIDIA' && brand !== 'AMD' && brand !== 'Intel')) return null

  return {
    id,
    name,
    brand,
    generation: select(page, '世代'),
    year: number(page, '発売年'),
    vramGb: number(page, 'VRAM GB'),
    memoryType: select(page, 'メモリ種類'),
    busWidthBit: number(page, 'バス幅 bit'),
    tdpW: number(page, 'TDP W'),
    passmarkG3D: number(page, 'PassMark G3D'),
    timeSpyGraphics: number(page, 'Time Spy Graphics'),
    fp32Tflops: number(page, 'FP32 TFLOPS'),
    rtIndex: number(page, 'レイトレ指数'),
    aiIndex: number(page, 'AI指数'),
    gaming1080p: number(page, '1080p指数'),
    gaming1440p: number(page, '1440p指数'),
    gaming4k: number(page, '4K指数'),
    marketPriceYen: number(page, '価格目安'),
    note: text(page, 'メモ'),
  }
}

export async function getSpecCompareData(): Promise<{ cpuData: CpuSpec[]; gpuData: GpuSpec[] }> {
  if (!process.env.NOTION_TOKEN) {
    return { cpuData: CPU_DATA, gpuData: GPU_DATA }
  }

  try {
    const [cpuPages, gpuPages] = await Promise.all([
      queryAll(CPU_DB_ID),
      queryAll(GPU_DB_ID),
    ])

    const cpuData = cpuPages.map(pageToCpu).filter(Boolean) as CpuSpec[]
    const gpuData = gpuPages.map(pageToGpu).filter(Boolean) as GpuSpec[]

    return {
      cpuData: cpuData.length ? cpuData : CPU_DATA,
      gpuData: gpuData.length ? gpuData : GPU_DATA,
    }
  } catch (error) {
    console.error('[spec-compare] failed to load Notion benchmark DB', error)
    return { cpuData: CPU_DATA, gpuData: GPU_DATA }
  }
}

