'use client'

import { useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { SMARTPHONE_DATA, SMARTPHONE_DATA_NOTE, type SmartphoneOs, type SmartphoneSpec } from '@/lib/smartphone-compare-data'

type Priority = 'balanced' | 'camera' | 'battery' | 'performance' | 'value' | 'light'

type Metric = {
  label: string
  left: number
  right: number
  unit?: string
  lowerIsBetter?: boolean
}

const priorities: { id: Priority; label: string; hint: string }[] = [
  { id: 'balanced', label: '総合', hint: '性能・カメラ・価格を均等に見る' },
  { id: 'camera', label: 'カメラ', hint: '写真・動画・望遠を重視' },
  { id: 'battery', label: '電池', hint: '電池持ちと軽さのバランス' },
  { id: 'performance', label: '性能', hint: 'ゲーム・AI・長期利用を重視' },
  { id: 'value', label: 'コスパ', hint: '価格あたりの満足度を重視' },
  { id: 'light', label: '軽さ', hint: '片手操作・持ち歩きやすさを重視' },
]

function yen(value: number) {
  return `${value.toLocaleString('ja-JP')}円`
}

function scorePhone(phone: SmartphoneSpec, priority: Priority) {
  const valueScore = Math.min(100, Math.round((120000 / phone.priceYen) * ((phone.performanceScore + phone.cameraScore + phone.batteryScore) / 3)))
  const lightScore = Math.max(40, Math.min(100, Math.round(130 - phone.weightG * 0.22)))
  const updateScore = Math.min(100, phone.updateYears * 14)

  const base = {
    balanced: phone.performanceScore * 0.22 + phone.cameraScore * 0.22 + phone.batteryScore * 0.18 + phone.aiScore * 0.14 + valueScore * 0.16 + updateScore * 0.08,
    camera: phone.cameraScore * 0.48 + phone.videoScore * 0.24 + phone.performanceScore * 0.1 + phone.batteryScore * 0.08 + valueScore * 0.1,
    battery: phone.batteryScore * 0.48 + lightScore * 0.22 + phone.performanceScore * 0.1 + valueScore * 0.14 + updateScore * 0.06,
    performance: phone.performanceScore * 0.46 + phone.aiScore * 0.24 + phone.videoScore * 0.1 + updateScore * 0.1 + valueScore * 0.1,
    value: valueScore * 0.52 + phone.performanceScore * 0.16 + phone.cameraScore * 0.12 + phone.batteryScore * 0.12 + updateScore * 0.08,
    light: lightScore * 0.42 + phone.batteryScore * 0.18 + phone.performanceScore * 0.14 + phone.cameraScore * 0.1 + valueScore * 0.16,
  }[priority]

  return Math.round(base)
}

function percent(value: number, max: number) {
  return `${Math.max(4, Math.min(100, Math.round((value / Math.max(max, 1)) * 100)))}%`
}

function compareWinner(left: number, right: number, lowerIsBetter = false) {
  const l = lowerIsBetter ? -left : left
  const r = lowerIsBetter ? -right : right
  if (Math.abs(l - r) <= Math.max(Math.abs(l), Math.abs(r)) * 0.04) return 'ほぼ同等'
  return l > r ? '左' : '右'
}

function SelectPhone({
  label,
  value,
  phones,
  onChange,
}: {
  label: string
  value: string
  phones: SmartphoneSpec[]
  onChange: (id: string) => void
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-bold text-gray-500">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-bold text-brand-text outline-none transition-colors focus:border-brand-green"
      >
        {phones.map((phone) => (
          <option key={phone.id} value={phone.id}>
            {phone.name} / {yen(phone.priceYen)}
          </option>
        ))}
      </select>
    </label>
  )
}

function StatTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md bg-gray-50 px-3 py-2">
      <dt className="text-[10px] font-bold text-gray-400">{label}</dt>
      <dd className="mt-0.5 break-words text-xs font-black text-brand-text">{value}</dd>
    </div>
  )
}

function PhoneSummary({ phone, priority }: { phone: SmartphoneSpec; priority: Priority }) {
  const score = scorePhone(phone, priority)

  return (
    <section className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-black text-brand-green">{phone.maker} / {phone.os}</p>
          <h2 className="text-lg font-extrabold text-brand-text">{phone.name}</h2>
          <p className="mt-1 text-xs text-gray-500">{phone.bestFor}</p>
        </div>
        <div className="shrink-0 rounded-lg bg-brand-dark px-3 py-2 text-center text-white">
          <p className="text-[10px] font-bold text-gray-300">スコア</p>
          <p className="text-xl font-black">{score}</p>
        </div>
      </div>
      <dl className="grid grid-cols-2 gap-2">
        <StatTile label="価格目安" value={yen(phone.priceYen)} />
        <StatTile label="容量" value={`${phone.storageGb}GB`} />
        <StatTile label="画面" value={`${phone.displayInch}型 / ${phone.refreshRateHz}Hz`} />
        <StatTile label="重量" value={`${phone.weightG}g`} />
        <StatTile label="チップ" value={phone.chip} />
        <StatTile label="カメラ" value={`${phone.mainCameraMp}MP / ${phone.opticalZoomLabel}`} />
      </dl>
      <div className="mt-4 space-y-2">
        {phone.strengths.slice(0, 2).map((item) => (
          <p key={item} className="rounded-md bg-emerald-50 px-3 py-2 text-xs font-medium leading-relaxed text-emerald-900">
            {item}
          </p>
        ))}
        {phone.cautions.slice(0, 1).map((item) => (
          <p key={item} className="rounded-md bg-amber-50 px-3 py-2 text-xs font-medium leading-relaxed text-amber-900">
            注意: {item}
          </p>
        ))}
      </div>
    </section>
  )
}

function BarRow({
  label,
  leftName,
  rightName,
  left,
  right,
  unit,
  lowerIsBetter,
}: Metric & { leftName: string; rightName: string }) {
  const max = Math.max(left, right)
  const min = Math.min(left, right)
  const winner = compareWinner(left, right, lowerIsBetter)
  const leftWidth = lowerIsBetter ? Math.round((min / Math.max(left, 1)) * 100) : Math.round((left / Math.max(max, 1)) * 100)
  const rightWidth = lowerIsBetter ? Math.round((min / Math.max(right, 1)) * 100) : Math.round((right / Math.max(max, 1)) * 100)

  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-3">
        <p className="text-sm font-bold text-brand-text">{label}</p>
        <p className="text-xs font-bold text-gray-400">優位: {winner}</p>
      </div>
      <div className="space-y-2 text-xs">
        <div className="grid grid-cols-[minmax(72px,150px)_1fr_auto] items-center gap-2">
          <span className="truncate text-gray-500">{leftName}</span>
          <div className="h-3 overflow-hidden rounded-full bg-gray-100">
            <div className="h-full rounded-full bg-brand-green" style={{ width: `${Math.max(4, Math.min(100, leftWidth))}%` }} />
          </div>
          <span className="min-w-14 text-right font-black text-brand-text">{left.toLocaleString('ja-JP')}{unit ?? ''}</span>
        </div>
        <div className="grid grid-cols-[minmax(72px,150px)_1fr_auto] items-center gap-2">
          <span className="truncate text-gray-500">{rightName}</span>
          <div className="h-3 overflow-hidden rounded-full bg-gray-100">
            <div className="h-full rounded-full bg-sky-500" style={{ width: `${Math.max(4, Math.min(100, rightWidth))}%` }} />
          </div>
          <span className="min-w-14 text-right font-black text-brand-text">{right.toLocaleString('ja-JP')}{unit ?? ''}</span>
        </div>
      </div>
    </div>
  )
}

function CompareBars({ left, right, priority }: { left: SmartphoneSpec; right: SmartphoneSpec; priority: Priority }) {
  const metrics: Metric[] = [
    { label: '選択中の総合スコア', left: scorePhone(left, priority), right: scorePhone(right, priority) },
    { label: '価格', left: left.priceYen, right: right.priceYen, unit: '円', lowerIsBetter: true },
    { label: '性能', left: left.performanceScore, right: right.performanceScore },
    { label: 'カメラ', left: left.cameraScore, right: right.cameraScore },
    { label: '動画', left: left.videoScore, right: right.videoScore },
    { label: '電池', left: left.batteryScore, right: right.batteryScore },
    { label: '軽さ', left: left.weightG, right: right.weightG, unit: 'g', lowerIsBetter: true },
    { label: 'アップデート年数', left: left.updateYears, right: right.updateYears, unit: '年' },
  ]

  return (
    <section className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
      <h2 className="mb-4 text-base font-extrabold text-brand-text">比較グラフ</h2>
      <div className="space-y-4">
        {metrics.map((metric) => (
          <BarRow key={metric.label} {...metric} leftName={left.name} rightName={right.name} />
        ))}
      </div>
    </section>
  )
}

function FilterButton({
  active,
  children,
  onClick,
}: {
  active: boolean
  children: ReactNode
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-md px-3 py-2 text-xs font-black transition-colors ${
        active ? 'bg-brand-green text-white' : 'bg-white text-gray-500 ring-1 ring-gray-200 hover:text-brand-text'
      }`}
    >
      {children}
    </button>
  )
}

function RankingList({ phones, priority }: { phones: SmartphoneSpec[]; priority: Priority }) {
  const ranked = [...phones].sort((a, b) => scorePhone(b, priority) - scorePhone(a, priority))
  const max = Math.max(...ranked.map((phone) => scorePhone(phone, priority)))

  return (
    <section className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-base font-extrabold text-brand-text">ランキング</h2>
        <p className="text-xs font-bold text-gray-400">{ranked.length}機種</p>
      </div>
      <div className="space-y-3">
        {ranked.map((phone, index) => {
          const score = scorePhone(phone, priority)
          return (
            <div key={phone.id} className="grid grid-cols-[28px_1fr_auto] items-center gap-3">
              <span className="text-sm font-black text-brand-green">{index + 1}</span>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                  <p className="font-bold text-brand-text">{phone.name}</p>
                  <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-bold text-gray-500">{phone.os}</span>
                </div>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-gray-100">
                  <div className="h-full rounded-full bg-brand-green" style={{ width: percent(score, max) }} />
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-black text-brand-text">{score}</p>
                <p className="text-[10px] font-bold text-gray-400">{yen(phone.priceYen)}</p>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}

function Sources({ phones }: { phones: SmartphoneSpec[] }) {
  const sources = Array.from(new Map(phones.map((phone) => [phone.sourceUrl, phone])).values())

  return (
    <section className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
      <h2 className="mb-3 text-base font-extrabold text-brand-text">データ確認元</h2>
      <div className="space-y-2">
        {sources.map((phone) => (
          <a
            key={phone.sourceUrl}
            href={phone.sourceUrl}
            className="block rounded-md bg-gray-50 px-3 py-2 text-xs font-bold text-gray-600 transition-colors hover:bg-emerald-50 hover:text-brand-dark"
            target="_blank"
            rel="noreferrer"
          >
            {phone.maker} / {phone.generation} / 確認日 {phone.checkedDate}
          </a>
        ))}
      </div>
    </section>
  )
}

export default function SmartphoneCompareTool({ phones = SMARTPHONE_DATA }: { phones?: SmartphoneSpec[] }) {
  const [priority, setPriority] = useState<Priority>('balanced')
  const [os, setOs] = useState<SmartphoneOs | 'all'>('all')
  const [maker, setMaker] = useState('all')
  const [maxPrice, setMaxPrice] = useState(350000)
  const [needsTelephoto, setNeedsTelephoto] = useState(false)
  const [compactOnly, setCompactOnly] = useState(false)
  const [leftId, setLeftId] = useState('iphone-17-256')
  const [rightId, setRightId] = useState('pixel-10-pro-128')

  const filtered = useMemo(() => {
    return phones.filter((phone) => {
      if (os !== 'all' && phone.os !== os) return false
      if (maker !== 'all' && phone.maker !== maker) return false
      if (phone.priceYen > maxPrice) return false
      if (needsTelephoto && !phone.telephotoMp) return false
      if (compactOnly && (phone.displayInch > 6.35 || phone.weightG > 190)) return false
      return true
    })
  }, [compactOnly, maker, maxPrice, needsTelephoto, os, phones])

  const makers = useMemo(() => ['all', ...Array.from(new Set(phones.map((phone) => phone.maker))).sort((a, b) => a.localeCompare(b, 'ja'))], [phones])

  const selectable = filtered.length >= 2 ? filtered : phones
  const left = selectable.find((phone) => phone.id === leftId) ?? selectable[0]
  const right = selectable.find((phone) => phone.id === rightId && phone.id !== left.id) ?? selectable.find((phone) => phone.id !== left.id) ?? selectable[0]
  const activePriority = priorities.find((item) => item.id === priority) ?? priorities[0]

  return (
    <div className="space-y-6">
      <section className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
        <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-base font-extrabold text-brand-text">比較条件</h2>
            <p className="mt-1 text-xs leading-relaxed text-gray-500">{activePriority.hint}</p>
          </div>
          <p className="text-xs font-bold text-gray-400">予算上限: {yen(maxPrice)}</p>
        </div>
        <div className="grid gap-4">
          <div className="flex flex-wrap gap-2">
            {priorities.map((item) => (
              <FilterButton key={item.id} active={priority === item.id} onClick={() => setPriority(item.id)}>
                {item.label}
              </FilterButton>
            ))}
          </div>
          <div className="grid gap-4 md:grid-cols-[1fr_220px] md:items-center">
            <input
              type="range"
              min="90000"
              max="350000"
              step="10000"
              value={maxPrice}
              onChange={(event) => setMaxPrice(Number(event.target.value))}
              className="w-full accent-brand-green"
              aria-label="予算上限"
            />
            <div className="grid grid-cols-3 gap-1 rounded-lg border border-gray-200 bg-gray-50 p-1">
              {(['all', 'iOS', 'Android'] as const).map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setOs(item)}
                  className={`rounded-md px-2 py-2 text-xs font-black transition-colors ${os === item ? 'bg-brand-dark text-white' : 'text-gray-500 hover:bg-white'}`}
                >
                  {item === 'all' ? '全OS' : item}
                </button>
              ))}
            </div>
          </div>
          <div className="flex flex-wrap gap-3 text-xs font-bold text-gray-600">
            <label className="flex min-w-44 items-center gap-2">
              <span className="shrink-0 text-gray-500">メーカー</span>
              <select
                value={maker}
                onChange={(event) => setMaker(event.target.value)}
                className="min-w-0 flex-1 rounded-md border border-gray-200 bg-white px-2 py-1.5 text-xs font-bold text-brand-text outline-none focus:border-brand-green"
              >
                {makers.map((item) => (
                  <option key={item} value={item}>
                    {item === 'all' ? 'すべて' : item}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={needsTelephoto} onChange={(event) => setNeedsTelephoto(event.target.checked)} className="size-4 accent-brand-green" />
              望遠カメラあり
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={compactOnly} onChange={(event) => setCompactOnly(event.target.checked)} className="size-4 accent-brand-green" />
              小さめ・軽め
            </label>
          </div>
        </div>
      </section>

      <div className="grid gap-3 sm:grid-cols-2">
        <SelectPhone label="スマホ 1" value={left.id} phones={selectable} onChange={setLeftId} />
        <SelectPhone label="スマホ 2" value={right.id} phones={selectable} onChange={setRightId} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <PhoneSummary phone={left} priority={priority} />
        <PhoneSummary phone={right} priority={priority} />
      </div>

      <CompareBars left={left} right={right} priority={priority} />

      <div className="grid gap-4 lg:grid-cols-[1fr_360px]">
        <RankingList phones={filtered.length ? filtered : phones} priority={priority} />
        <Sources phones={filtered.length ? filtered : phones} />
      </div>

      <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-xs leading-relaxed text-amber-900">
        {SMARTPHONE_DATA_NOTE}
      </div>
    </div>
  )
}
