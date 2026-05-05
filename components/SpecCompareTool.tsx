'use client'

import { useMemo, useState } from 'react'
import { CPU_DATA, DATA_NOTE, GPU_DATA, type CpuSpec, type GpuSpec } from '@/lib/spec-compare-data'

type Tab = 'cpu' | 'gpu' | 'build'

type Metric = {
  label: string
  a: number
  b: number
  unit?: string
  higherIsBetter?: boolean
}

function formatNumber(value: number): string {
  return value.toLocaleString('ja-JP')
}

function formatYen(value: number): string {
  return `約${value.toLocaleString('ja-JP')}円`
}

function percent(value: number, max: number): number {
  if (!max) return 0
  return Math.max(3, Math.min(100, Math.round((value / max) * 100)))
}

function cpuOverall(cpu: CpuSpec): number {
  return Math.round(cpu.passmarkSingle * 0.18 + cpu.passmarkMulti * 0.0009 + cpu.gamingIndex * 0.28 + cpu.creatorIndex * 0.28)
}

function gpuOverall(gpu: GpuSpec): number {
  return Math.round(gpu.timeSpyGraphics * 0.002 + gpu.passmarkG3D * 0.0012 + gpu.gaming1440p * 0.25 + gpu.rtIndex * 0.16 + gpu.aiIndex * 0.14)
}

function costIndex(score: number, price: number): number {
  return Math.round((score / Math.max(price, 1)) * 100000)
}

function winnerLabel(aName: string, bName: string, a: number, b: number, lowerIsBetter = false): string {
  const av = lowerIsBetter ? -a : a
  const bv = lowerIsBetter ? -b : b
  if (Math.abs(av - bv) < Math.max(Math.abs(av), Math.abs(bv)) * 0.03) return 'ほぼ同等'
  return av > bv ? aName : bName
}

function SegmentedTabs({ tab, setTab }: { tab: Tab; setTab: (tab: Tab) => void }) {
  const tabs: { id: Tab; label: string }[] = [
    { id: 'cpu', label: 'CPU比較' },
    { id: 'gpu', label: 'GPU比較' },
    { id: 'build', label: 'CPU+GPU評価' },
  ]

  return (
    <div className="grid grid-cols-3 gap-1 rounded-lg border border-gray-200 bg-white p-1">
      {tabs.map((item) => (
        <button
          key={item.id}
          type="button"
          onClick={() => setTab(item.id)}
          className={`rounded-md px-3 py-2 text-xs font-bold transition-colors ${
            tab === item.id ? 'bg-brand-green text-white' : 'text-gray-500 hover:bg-gray-50 hover:text-brand-text'
          }`}
        >
          {item.label}
        </button>
      ))}
    </div>
  )
}

function generationRank(generation: string): number {
  if (generation.includes('RTX 50') || generation.includes('RX 9000') || generation.includes('9000 X3D') || generation.includes('Arrow Lake')) return 900
  if (generation.includes('Ryzen 9000')) return 890
  if (generation.includes('RTX 40') || generation.includes('RX 7000') || generation.includes('Ryzen 7000') || generation.includes('14th Gen')) return 800
  if (generation.includes('RTX 30') || generation.includes('RX 6000') || generation.includes('13th Gen') || generation.includes('12th Gen')) return 700
  if (generation.includes('Ryzen 5000')) return 650
  if (generation.includes('GTX 16') || generation.includes('10th Gen')) return 500
  return 0
}

function groupedOptions<T extends { id: string; name: string; generation: string; year: number }>(items: T[]) {
  const sorted = [...items].sort((a, b) => {
    const generationDiff = generationRank(b.generation) - generationRank(a.generation)
    if (generationDiff) return generationDiff
    const yearDiff = b.year - a.year
    if (yearDiff) return yearDiff
    return a.name.localeCompare(b.name, 'ja')
  })

  return sorted.reduce<{ label: string; items: T[] }[]>((groups, item) => {
    const group = groups.find((entry) => entry.label === item.generation)
    if (group) {
      group.items.push(item)
    } else {
      groups.push({ label: item.generation, items: [item] })
    }
    return groups
  }, [])
}

function SelectBox<T extends { id: string; name: string; generation: string; year: number }>({
  label,
  value,
  items,
  onChange,
}: {
  label: string
  value: string
  items: T[]
  onChange: (id: string) => void
}) {
  const groups = groupedOptions(items)

  return (
    <label className="block">
      <span className="mb-1 block text-xs font-bold text-gray-500">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-bold text-brand-text outline-none transition-colors focus:border-brand-green"
      >
        {groups.map((group) => (
          <optgroup key={group.label} label={group.label}>
            {group.items.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </optgroup>
        ))}
      </select>
    </label>
  )
}

function MetricBars({ metrics, aName, bName }: { metrics: Metric[]; aName: string; bName: string }) {
  return (
    <div className="space-y-4">
      {metrics.map((metric) => {
        const max = Math.max(metric.a, metric.b)
        return (
          <div key={metric.label}>
            <div className="mb-2 flex items-center justify-between gap-3">
              <p className="text-sm font-bold text-brand-text">{metric.label}</p>
              <p className="text-xs text-gray-400">
                優位: {winnerLabel(aName, bName, metric.a, metric.b, metric.higherIsBetter === false)}
              </p>
            </div>
            <div className="space-y-2">
              <BarRow label={aName} value={metric.a} max={max} unit={metric.unit} tone="green" />
              <BarRow label={bName} value={metric.b} max={max} unit={metric.unit} tone="blue" />
            </div>
          </div>
        )
      })}
    </div>
  )
}

function BarRow({
  label,
  value,
  max,
  unit,
  tone,
}: {
  label: string
  value: number
  max: number
  unit?: string
  tone: 'green' | 'blue' | 'amber'
}) {
  const color = tone === 'green' ? 'bg-brand-green' : tone === 'blue' ? 'bg-sky-500' : 'bg-amber-500'

  return (
    <div className="grid grid-cols-[minmax(84px,150px)_1fr_auto] items-center gap-2 text-xs">
      <span className="truncate font-medium text-gray-500">{label}</span>
      <div className="h-3 overflow-hidden rounded-full bg-gray-100">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${percent(value, max)}%` }} />
      </div>
      <span className="min-w-16 text-right font-bold text-brand-text">
        {formatNumber(value)}
        {unit ? ` ${unit}` : ''}
      </span>
    </div>
  )
}

function CpuSummary({ cpu }: { cpu: CpuSpec }) {
  const overall = cpuOverall(cpu)
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-bold text-brand-green">{cpu.brand} / {cpu.generation}</p>
          <h3 className="text-base font-extrabold text-brand-text">{cpu.name}</h3>
        </div>
        <div className="rounded-lg bg-brand-dark px-3 py-2 text-center text-white">
          <p className="text-[10px] font-bold text-gray-300">総合</p>
          <p className="text-lg font-black">{overall}</p>
        </div>
      </div>
      <dl className="grid grid-cols-2 gap-2 text-xs">
        <SpecItem label="コア/スレッド" value={`${cpu.cores}C / ${cpu.threads}T`} />
        <SpecItem label="最大クロック" value={`${cpu.boostClockGhz.toFixed(1)} GHz`} />
        <SpecItem label="TDP" value={`${cpu.tdpW}W`} />
        <SpecItem label="価格目安" value={formatYen(cpu.marketPriceYen)} />
      </dl>
      <p className="mt-3 text-xs leading-relaxed text-gray-500">{cpu.note}</p>
    </div>
  )
}

function GpuSummary({ gpu }: { gpu: GpuSpec }) {
  const overall = gpuOverall(gpu)
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-bold text-brand-green">{gpu.brand} / {gpu.generation}</p>
          <h3 className="text-base font-extrabold text-brand-text">{gpu.name}</h3>
        </div>
        <div className="rounded-lg bg-brand-dark px-3 py-2 text-center text-white">
          <p className="text-[10px] font-bold text-gray-300">総合</p>
          <p className="text-lg font-black">{overall}</p>
        </div>
      </div>
      <dl className="grid grid-cols-2 gap-2 text-xs">
        <SpecItem label="VRAM" value={`${gpu.vramGb}GB ${gpu.memoryType}`} />
        <SpecItem label="FP32" value={`${gpu.fp32Tflops.toFixed(1)} TFLOPS`} />
        <SpecItem label="TDP" value={`${gpu.tdpW}W`} />
        <SpecItem label="価格目安" value={formatYen(gpu.marketPriceYen)} />
      </dl>
      <p className="mt-3 text-xs leading-relaxed text-gray-500">{gpu.note}</p>
    </div>
  )
}

function SpecItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md bg-gray-50 px-3 py-2">
      <dt className="text-[10px] font-bold text-gray-400">{label}</dt>
      <dd className="mt-0.5 font-bold text-brand-text">{value}</dd>
    </div>
  )
}

function RankingTable<T extends { id: string; name: string; marketPriceYen: number; tdpW: number }>({
  title,
  items,
  score,
}: {
  title: string
  items: T[]
  score: (item: T) => number
}) {
  const ranked = [...items].sort((a, b) => score(b) - score(a)).slice(0, 8)
  const max = Math.max(...ranked.map(score))

  return (
    <section className="rounded-lg border border-gray-200 bg-white p-4">
      <h2 className="mb-3 text-base font-extrabold text-brand-text">{title}</h2>
      <div className="space-y-3">
        {ranked.map((item, index) => {
          const itemScore = score(item)
          return (
            <div key={item.id} className="grid grid-cols-[28px_1fr_auto] items-center gap-2 text-xs">
              <span className="font-black text-brand-green">{index + 1}</span>
              <div className="min-w-0">
                <p className="truncate font-bold text-brand-text">{item.name}</p>
                <div className="mt-1 h-2 overflow-hidden rounded-full bg-gray-100">
                  <div className="h-full rounded-full bg-brand-green" style={{ width: `${percent(itemScore, max)}%` }} />
                </div>
              </div>
              <div className="text-right">
                <p className="font-black text-brand-text">{itemScore}</p>
                <p className="text-[10px] text-gray-400">指数</p>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}

function RadarChart({ values }: { values: { label: string; value: number }[] }) {
  const size = 240
  const center = size / 2
  const radius = 82
  const angleStep = (Math.PI * 2) / values.length
  const points = values.map((item, index) => {
    const angle = -Math.PI / 2 + index * angleStep
    const r = radius * Math.max(0, Math.min(100, item.value)) / 100
    return `${center + Math.cos(angle) * r},${center + Math.sin(angle) * r}`
  }).join(' ')

  return (
    <svg viewBox={`0 0 ${size} ${size}`} className="mx-auto h-64 w-full max-w-xs">
      {[0.25, 0.5, 0.75, 1].map((scale) => {
        const ring = values.map((_, index) => {
          const angle = -Math.PI / 2 + index * angleStep
          const r = radius * scale
          return `${center + Math.cos(angle) * r},${center + Math.sin(angle) * r}`
        }).join(' ')
        return <polygon key={scale} points={ring} fill="none" stroke="#E5E7EB" strokeWidth="1" />
      })}
      {values.map((item, index) => {
        const angle = -Math.PI / 2 + index * angleStep
        const x = center + Math.cos(angle) * (radius + 28)
        const y = center + Math.sin(angle) * (radius + 28)
        return (
          <g key={item.label}>
            <line x1={center} y1={center} x2={center + Math.cos(angle) * radius} y2={center + Math.sin(angle) * radius} stroke="#E5E7EB" />
            <text x={x} y={y} textAnchor="middle" dominantBaseline="middle" className="fill-gray-500 text-[10px] font-bold">
              {item.label}
            </text>
          </g>
        )
      })}
      <polygon points={points} fill="rgba(9,192,113,0.22)" stroke="#09c071" strokeWidth="3" />
    </svg>
  )
}

function CpuCompare({ cpuData }: { cpuData: CpuSpec[] }) {
  const [leftId, setLeftId] = useState('core-i7-14700k')
  const [rightId, setRightId] = useState('ryzen-7-7800x3d')
  const left = cpuData.find((cpu) => cpu.id === leftId) ?? cpuData[0] ?? CPU_DATA[0]
  const right = cpuData.find((cpu) => cpu.id === rightId) ?? cpuData[1] ?? CPU_DATA[1]
  const metrics: Metric[] = [
    { label: 'PassMark CPU Mark', a: left.passmarkMulti, b: right.passmarkMulti },
    { label: 'シングルスレッド', a: left.passmarkSingle, b: right.passmarkSingle },
    { label: 'Cinebench R23 Multi', a: left.cinebenchR23Multi, b: right.cinebenchR23Multi },
    { label: 'ゲーミング指数', a: left.gamingIndex, b: right.gamingIndex },
    { label: '制作処理指数', a: left.creatorIndex, b: right.creatorIndex },
    { label: 'コスパ指数', a: costIndex(cpuOverall(left), left.marketPriceYen), b: costIndex(cpuOverall(right), right.marketPriceYen) },
    { label: '消費電力', a: left.tdpW, b: right.tdpW, unit: 'W', higherIsBetter: false },
  ]

  return (
    <div className="space-y-5">
      <div className="grid gap-3 sm:grid-cols-2">
        <SelectBox label="CPU 1" value={left.id} items={cpuData} onChange={setLeftId} />
        <SelectBox label="CPU 2" value={right.id} items={cpuData} onChange={setRightId} />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <CpuSummary cpu={left} />
        <CpuSummary cpu={right} />
      </div>
      <section className="rounded-lg border border-gray-200 bg-white p-4">
        <h2 className="mb-4 text-base font-extrabold text-brand-text">性能グラフ</h2>
        <MetricBars metrics={metrics} aName={left.name} bName={right.name} />
      </section>
      <div className="grid gap-4 md:grid-cols-2">
        <RankingTable title="CPU総合ランキング" items={cpuData} score={cpuOverall} />
        <RankingTable title="CPUコスパランキング" items={cpuData} score={(item) => costIndex(cpuOverall(item), item.marketPriceYen)} />
      </div>
    </div>
  )
}

function GpuCompare({ gpuData }: { gpuData: GpuSpec[] }) {
  const [leftId, setLeftId] = useState('rtx-4070-super')
  const [rightId, setRightId] = useState('rx-7800-xt')
  const left = gpuData.find((gpu) => gpu.id === leftId) ?? gpuData[0] ?? GPU_DATA[0]
  const right = gpuData.find((gpu) => gpu.id === rightId) ?? gpuData[1] ?? GPU_DATA[1]
  const metrics: Metric[] = [
    { label: '3DMark Time Spy Graphics', a: left.timeSpyGraphics, b: right.timeSpyGraphics },
    { label: 'PassMark G3D Mark', a: left.passmarkG3D, b: right.passmarkG3D },
    { label: 'FP32演算性能', a: Math.round(left.fp32Tflops * 10) / 10, b: Math.round(right.fp32Tflops * 10) / 10, unit: 'TFLOPS' },
    { label: 'レイトレ指数', a: left.rtIndex, b: right.rtIndex },
    { label: 'AI/生成系指数', a: left.aiIndex, b: right.aiIndex },
    { label: '1440pゲーム指数', a: left.gaming1440p, b: right.gaming1440p },
    { label: 'コスパ指数', a: costIndex(gpuOverall(left), left.marketPriceYen), b: costIndex(gpuOverall(right), right.marketPriceYen) },
    { label: '消費電力', a: left.tdpW, b: right.tdpW, unit: 'W', higherIsBetter: false },
  ]

  return (
    <div className="space-y-5">
      <div className="grid gap-3 sm:grid-cols-2">
        <SelectBox label="GPU 1" value={left.id} items={gpuData} onChange={setLeftId} />
        <SelectBox label="GPU 2" value={right.id} items={gpuData} onChange={setRightId} />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <GpuSummary gpu={left} />
        <GpuSummary gpu={right} />
      </div>
      <section className="rounded-lg border border-gray-200 bg-white p-4">
        <h2 className="mb-4 text-base font-extrabold text-brand-text">性能グラフ</h2>
        <MetricBars metrics={metrics} aName={left.name} bName={right.name} />
      </section>
      <div className="grid gap-4 md:grid-cols-2">
        <RankingTable title="GPU総合ランキング" items={gpuData} score={gpuOverall} />
        <RankingTable title="GPUコスパランキング" items={gpuData} score={(item) => costIndex(gpuOverall(item), item.marketPriceYen)} />
      </div>
    </div>
  )
}

function buildScore(cpu: CpuSpec, gpu: GpuSpec) {
  const cpuGame = cpu.gamingIndex
  const cpuCreate = cpu.creatorIndex
  const gpuGame = gpu.gaming1440p
  const gpu4k = gpu.gaming4k
  const gpuCreate = Math.min(100, Math.round(gpu.aiIndex * 0.35 + gpu.vramGb * 2 + gpu.fp32Tflops * 0.45))
  const gaming = Math.round(cpuGame * 0.34 + gpuGame * 0.48 + gpu4k * 0.18)
  const streaming = Math.round(cpu.passmarkMulti / 900 + gpu.aiIndex * 0.28 + gpuGame * 0.26)
  const editing = Math.round(cpuCreate * 0.42 + gpuCreate * 0.38 + Math.min(100, gpu.vramGb * 4) * 0.2)
  const ai = Math.round(gpu.aiIndex * 0.58 + Math.min(100, gpu.vramGb * 4) * 0.25 + cpuCreate * 0.17)
  const efficiency = Math.round(((cpuOverall(cpu) + gpuOverall(gpu)) / (cpu.tdpW + gpu.tdpW)) * 3.2)
  const value = costIndex(cpuOverall(cpu) + gpuOverall(gpu), cpu.marketPriceYen + gpu.marketPriceYen)
  const total = Math.round(gaming * 0.3 + streaming * 0.18 + editing * 0.22 + ai * 0.16 + Math.min(100, value) * 0.14)
  return {
    total: Math.min(100, total),
    gaming: Math.min(100, gaming),
    streaming: Math.min(100, streaming),
    editing: Math.min(100, editing),
    ai: Math.min(100, ai),
    efficiency: Math.min(100, efficiency),
    value: Math.min(100, value),
  }
}

function bottleneckMessage(cpu: CpuSpec, gpu: GpuSpec): string {
  const cpuSide = cpu.gamingIndex
  const gpuSide = gpu.gaming1440p
  const diff = cpuSide - gpuSide
  if (diff < -18) return 'CPU側がやや弱めです。1080p高fpsや競技FPSではCPUアップグレードの効果が出やすい構成です。'
  if (diff > 24) return 'GPU側が控えめです。画質設定、4K、レイトレを重視するならGPUを上げるほうが効果的です。'
  return 'CPUとGPUのバランスはおおむね良好です。用途に合わせてメモリ容量、冷却、電源も確認してください。'
}

function BuildCompare({ cpuData, gpuData }: { cpuData: CpuSpec[]; gpuData: GpuSpec[] }) {
  const [cpuId, setCpuId] = useState('ryzen-7-7800x3d')
  const [gpuId, setGpuId] = useState('rtx-4070-super')
  const cpu = cpuData.find((item) => item.id === cpuId) ?? cpuData[0] ?? CPU_DATA[0]
  const gpu = gpuData.find((item) => item.id === gpuId) ?? gpuData[0] ?? GPU_DATA[0]
  const score = useMemo(() => buildScore(cpu, gpu), [cpu, gpu])
  const radar = [
    { label: 'ゲーム', value: score.gaming },
    { label: '配信', value: score.streaming },
    { label: '編集', value: score.editing },
    { label: 'AI', value: score.ai },
    { label: '効率', value: score.efficiency },
    { label: 'コスパ', value: score.value },
  ]

  return (
    <div className="space-y-5">
      <div className="grid gap-3 sm:grid-cols-2">
        <SelectBox label="CPU" value={cpu.id} items={cpuData} onChange={setCpuId} />
        <SelectBox label="GPU" value={gpu.id} items={gpuData} onChange={setGpuId} />
      </div>
      <section className="rounded-lg border border-brand-green/30 bg-white p-5">
        <div className="grid gap-5 md:grid-cols-[240px_1fr] md:items-center">
          <div className="text-center">
            <p className="text-xs font-bold text-gray-400">構成総合スコア</p>
            <p className="text-5xl font-black text-brand-green">{score.total}</p>
            <p className="text-xs font-bold text-gray-500">/ 100</p>
            <RadarChart values={radar} />
          </div>
          <div>
            <h2 className="mb-2 text-lg font-extrabold text-brand-text">{cpu.name} + {gpu.name}</h2>
            <p className="mb-4 rounded-lg bg-gray-50 p-3 text-sm leading-relaxed text-gray-600">{bottleneckMessage(cpu, gpu)}</p>
            <div className="space-y-2">
              <BarRow label="ゲーム" value={score.gaming} max={100} tone="green" />
              <BarRow label="配信" value={score.streaming} max={100} tone="blue" />
              <BarRow label="動画編集/制作" value={score.editing} max={100} tone="green" />
              <BarRow label="AI/画像処理" value={score.ai} max={100} tone="blue" />
              <BarRow label="消費電力効率" value={score.efficiency} max={100} tone="amber" />
              <BarRow label="コスパ" value={score.value} max={100} tone="amber" />
            </div>
          </div>
        </div>
      </section>
      <div className="grid gap-4 md:grid-cols-2">
        <CpuSummary cpu={cpu} />
        <GpuSummary gpu={gpu} />
      </div>
    </div>
  )
}

export default function SpecCompareTool({
  cpuData = CPU_DATA,
  gpuData = GPU_DATA,
}: {
  cpuData?: CpuSpec[]
  gpuData?: GpuSpec[]
}) {
  const [tab, setTab] = useState<Tab>('build')

  return (
    <div className="space-y-6">
      <SegmentedTabs tab={tab} setTab={setTab} />
      <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-xs leading-relaxed text-amber-900">
        {DATA_NOTE} 価格は相場感をつかむための目安で、特定ショップ名やセール条件には依存させていません。
      </div>
      {tab === 'cpu' && <CpuCompare cpuData={cpuData} />}
      {tab === 'gpu' && <GpuCompare gpuData={gpuData} />}
      {tab === 'build' && <BuildCompare cpuData={cpuData} gpuData={gpuData} />}
    </div>
  )
}
