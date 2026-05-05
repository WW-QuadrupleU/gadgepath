'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  CATEGORY_LABELS,
  DESK_PRESETS,
  ITEM_LIBRARY,
  effectiveSize,
  findItem,
  type DeskItem,
  type DeskPreset,
  type ItemCategory,
  type PlacedItem,
} from '@/lib/desk-items'

/* ───────── ピクセル⇄cm 換算 ───────── */
const PX_PER_CM = 5 // 1cm = 5px

/* ───────── レイアウト永続化（URLハッシュ） ───────── */
type Snapshot = {
  desk: string
  items: PlacedItem[]
}

function encodeSnapshot(snap: Snapshot): string {
  try {
    const json = JSON.stringify(snap)
    if (typeof window === 'undefined') return ''
    return btoa(unescape(encodeURIComponent(json)))
  } catch {
    return ''
  }
}

function decodeSnapshot(hash: string): Snapshot | null {
  try {
    if (typeof window === 'undefined') return null
    const json = decodeURIComponent(escape(atob(hash)))
    return JSON.parse(json) as Snapshot
  } catch {
    return null
  }
}

/* ───────── メインコンポーネント ───────── */
export default function DeskSimulator() {
  const [deskId, setDeskId] = useState<string>(DESK_PRESETS[1].id)
  const [items, setItems] = useState<PlacedItem[]>([])
  const [selectedInstanceId, setSelectedInstanceId] = useState<string | null>(null)
  const [activeCategory, setActiveCategory] = useState<ItemCategory>('monitor')
  const [shareMessage, setShareMessage] = useState<string>('')
  const canvasRef = useRef<HTMLDivElement>(null)
  const dragRef = useRef<{
    instanceId: string
    startX: number
    startY: number
    itemX: number
    itemY: number
  } | null>(null)

  const desk = DESK_PRESETS.find((d) => d.id === deskId) ?? DESK_PRESETS[1]

  /* 初期化：URLハッシュから復元 */
  useEffect(() => {
    if (typeof window === 'undefined') return
    const hash = window.location.hash.replace(/^#/, '')
    if (!hash) return
    const snap = decodeSnapshot(hash)
    if (!snap) return
    setDeskId(snap.desk)
    setItems(snap.items)
  }, [])

  /* アイテム追加：デスク中央に配置 */
  const addItem = useCallback(
    (item: DeskItem) => {
      const x = Math.max(0, (desk.width - item.width) / 2)
      const y = Math.max(0, (desk.depth - item.depth) / 2)
      const newItem: PlacedItem = {
        instanceId: `${item.id}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        itemId: item.id,
        x,
        y,
        rotation: 0,
      }
      setItems((prev) => [...prev, newItem])
      setSelectedInstanceId(newItem.instanceId)
    },
    [desk],
  )

  /* アイテム削除 */
  const deleteItem = useCallback((instanceId: string) => {
    setItems((prev) => prev.filter((i) => i.instanceId !== instanceId))
    setSelectedInstanceId(null)
  }, [])

  /* アイテム回転 */
  const rotateItem = useCallback((instanceId: string) => {
    setItems((prev) =>
      prev.map((i) => {
        if (i.instanceId !== instanceId) return i
        const next = ((i.rotation + 90) % 360) as PlacedItem['rotation']
        return { ...i, rotation: next }
      }),
    )
  }, [])

  /* 全削除 */
  const clearAll = useCallback(() => {
    if (items.length === 0) return
    if (window.confirm('全てのアイテムを削除しますか？')) {
      setItems([])
      setSelectedInstanceId(null)
    }
  }, [items.length])

  /* シェアURL生成 */
  const handleShare = useCallback(async () => {
    const snap: Snapshot = { desk: deskId, items }
    const hash = encodeSnapshot(snap)
    const url = `${window.location.origin}${window.location.pathname}#${hash}`
    try {
      await navigator.clipboard.writeText(url)
      setShareMessage('レイアウトURLをコピーしました')
    } catch {
      setShareMessage(url)
    }
    window.history.replaceState(null, '', `#${hash}`)
    setTimeout(() => setShareMessage(''), 3000)
  }, [deskId, items])

  /* ドラッグ開始 */
  const handlePointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>, instanceId: string) => {
      e.stopPropagation()
      const item = items.find((i) => i.instanceId === instanceId)
      if (!item) return
      setSelectedInstanceId(instanceId)
      dragRef.current = {
        instanceId,
        startX: e.clientX,
        startY: e.clientY,
        itemX: item.x,
        itemY: item.y,
      }
      ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
    },
    [items],
  )

  /* ドラッグ中 */
  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!dragRef.current) return
      const drag = dragRef.current
      const deltaXcm = (e.clientX - drag.startX) / PX_PER_CM
      const deltaYcm = (e.clientY - drag.startY) / PX_PER_CM
      setItems((prev) =>
        prev.map((i) => {
          if (i.instanceId !== drag.instanceId) return i
          const baseItem = findItem(i.itemId)
          if (!baseItem) return i
          const eff = effectiveSize(baseItem, i.rotation)
          const x = clamp(drag.itemX + deltaXcm, 0, desk.width - eff.w)
          const y = clamp(drag.itemY + deltaYcm, 0, desk.depth - eff.d)
          return { ...i, x, y }
        }),
      )
    },
    [desk],
  )

  /* ドラッグ終了 */
  const handlePointerUp = useCallback(() => {
    dragRef.current = null
  }, [])

  /* カテゴリ別アイテム */
  const itemsByCategory = useMemo(() => {
    return ITEM_LIBRARY.filter((i) => i.category === activeCategory)
  }, [activeCategory])

  const selected = items.find((i) => i.instanceId === selectedInstanceId)
  const selectedItem = selected ? findItem(selected.itemId) : null

  return (
    <div className="space-y-6">
      {/* デスクサイズ選択＋操作ボタン */}
      <div className="flex flex-wrap items-center gap-3 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <label className="flex items-center gap-2 text-sm font-bold text-brand-text">
          デスクサイズ
          <select
            value={deskId}
            onChange={(e) => setDeskId(e.target.value)}
            className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium text-brand-text focus:border-brand-green focus:outline-none"
          >
            {DESK_PRESETS.map((d: DeskPreset) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
        </label>
        <div className="flex-1" />
        <button
          onClick={handleShare}
          className="rounded-full bg-brand-green px-4 py-1.5 text-xs font-bold text-white transition-colors hover:bg-brand-green/80"
        >
          🔗 URLで共有
        </button>
        <button
          onClick={clearAll}
          className="rounded-full border border-gray-300 px-4 py-1.5 text-xs font-bold text-gray-600 transition-colors hover:border-red-400 hover:bg-red-50 hover:text-red-600"
        >
          🗑️ 全削除
        </button>
      </div>

      {shareMessage && (
        <div className="rounded-lg border border-brand-green/30 bg-brand-green/10 px-4 py-2 text-xs font-bold text-brand-green">
          {shareMessage}
        </div>
      )}

      {/* キャンバス */}
      <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <p className="mb-2 text-xs text-gray-400">
          実寸スケール表示（{desk.width} × {desk.depth} cm）　アイテムをドラッグで配置できます
        </p>
        <div
          className="relative mx-auto overflow-hidden rounded-lg border-2 border-dashed border-amber-300 bg-amber-50/50"
          style={{
            width: desk.width * PX_PER_CM,
            height: desk.depth * PX_PER_CM,
            maxWidth: '100%',
          }}
          ref={canvasRef}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          onClick={() => setSelectedInstanceId(null)}
        >
          {/* グリッド（10cmごと） */}
          <GridOverlay deskWidth={desk.width} deskDepth={desk.depth} />

          {/* 配置されたアイテム */}
          {items.map((placed) => {
            const baseItem = findItem(placed.itemId)
            if (!baseItem) return null
            return (
              <PlacedItemView
                key={placed.instanceId}
                placed={placed}
                base={baseItem}
                isSelected={placed.instanceId === selectedInstanceId}
                onPointerDown={handlePointerDown}
              />
            )
          })}
        </div>
      </div>

      {/* 選択中アイテムの操作 */}
      {selected && selectedItem && (
        <div className="flex flex-wrap items-center gap-3 rounded-xl border-2 border-brand-green bg-brand-green/5 p-4">
          <div>
            <p className="text-xs font-bold text-brand-green">選択中</p>
            <p className="text-base font-bold text-brand-text">{selectedItem.name}</p>
            <p className="text-xs text-gray-500">
              {selectedItem.width} × {selectedItem.depth} cm　位置: ({selected.x.toFixed(0)}, {selected.y.toFixed(0)})
            </p>
          </div>
          <div className="flex-1" />
          <button
            onClick={() => rotateItem(selected.instanceId)}
            className="rounded-full bg-white px-4 py-1.5 text-xs font-bold text-brand-text shadow-sm transition-colors hover:bg-brand-green hover:text-white"
          >
            🔄 90°回転
          </button>
          <button
            onClick={() => deleteItem(selected.instanceId)}
            className="rounded-full bg-red-500 px-4 py-1.5 text-xs font-bold text-white transition-colors hover:bg-red-600"
          >
            🗑️ 削除
          </button>
        </div>
      )}

      {/* アイテムライブラリ */}
      <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <p className="mb-3 text-sm font-bold text-brand-text">アイテムを追加</p>

        {/* カテゴリタブ */}
        <div className="mb-4 flex flex-wrap gap-2">
          {(Object.keys(CATEGORY_LABELS) as ItemCategory[]).map((cat) => {
            const meta = CATEGORY_LABELS[cat]
            const isActive = activeCategory === cat
            return (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`rounded-full px-3 py-1.5 text-xs font-bold transition-colors ${
                  isActive
                    ? 'bg-brand-green text-white'
                    : 'border border-gray-200 bg-gray-50 text-gray-600 hover:border-brand-green hover:bg-brand-green/10 hover:text-brand-green'
                }`}
              >
                {meta.emoji} {meta.label}
              </button>
            )
          })}
        </div>

        {/* アイテム一覧 */}
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
          {itemsByCategory.map((item) => (
            <button
              key={item.id}
              onClick={() => addItem(item)}
              className="rounded-lg border border-gray-200 bg-gray-50 p-3 text-left transition-colors hover:border-brand-green hover:bg-brand-green/5"
            >
              <div
                className="mb-2 flex h-8 w-full items-center justify-center rounded text-[10px] font-bold text-white"
                style={{ backgroundColor: item.color }}
              >
                {item.width} × {item.depth}
              </div>
              <p className="text-xs font-bold text-brand-text leading-tight">{item.name}</p>
              {item.hint && <p className="mt-0.5 text-[10px] text-gray-500">{item.hint}</p>}
            </button>
          ))}
        </div>
      </div>

      {/* 配置済みリスト */}
      {items.length > 0 && (
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <p className="mb-3 text-sm font-bold text-brand-text">配置中のアイテム ({items.length})</p>
          <div className="flex flex-wrap gap-2">
            {items.map((placed) => {
              const baseItem = findItem(placed.itemId)
              if (!baseItem) return null
              const isSel = placed.instanceId === selectedInstanceId
              return (
                <button
                  key={placed.instanceId}
                  onClick={() => setSelectedInstanceId(placed.instanceId)}
                  className={`rounded-full border px-3 py-1 text-xs font-bold transition-colors ${
                    isSel
                      ? 'border-brand-green bg-brand-green text-white'
                      : 'border-gray-200 bg-gray-50 text-gray-600 hover:border-brand-green'
                  }`}
                >
                  {baseItem.name}
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

/* ───────── 配置されたアイテムのビュー ───────── */
function PlacedItemView({
  placed,
  base,
  isSelected,
  onPointerDown,
}: {
  placed: PlacedItem
  base: DeskItem
  isSelected: boolean
  onPointerDown: (e: React.PointerEvent<HTMLDivElement>, instanceId: string) => void
}) {
  const eff = effectiveSize(base, placed.rotation)
  return (
    <div
      onPointerDown={(e) => onPointerDown(e, placed.instanceId)}
      className={`absolute flex select-none items-center justify-center text-center text-white shadow-md transition-shadow ${
        isSelected ? 'shadow-lg ring-2 ring-offset-2 ring-brand-green' : ''
      }`}
      style={{
        left: placed.x * PX_PER_CM,
        top: placed.y * PX_PER_CM,
        width: eff.w * PX_PER_CM,
        height: eff.d * PX_PER_CM,
        backgroundColor: base.color,
        cursor: 'move',
        touchAction: 'none',
        borderRadius: 4,
      }}
      onClick={(e) => e.stopPropagation()}
    >
      <span
        className="px-1 text-center font-bold leading-tight"
        style={{ fontSize: Math.min(11, Math.max(8, eff.w * PX_PER_CM / 18)) }}
      >
        {base.name}
      </span>
    </div>
  )
}

/* ───────── グリッド ───────── */
function GridOverlay({ deskWidth, deskDepth }: { deskWidth: number; deskDepth: number }) {
  const verticalLines = []
  for (let x = 10; x < deskWidth; x += 10) {
    verticalLines.push(
      <line
        key={`v-${x}`}
        x1={x * PX_PER_CM}
        y1={0}
        x2={x * PX_PER_CM}
        y2={deskDepth * PX_PER_CM}
        stroke="#fbbf24"
        strokeWidth={x % 50 === 0 ? 1 : 0.5}
        strokeOpacity={x % 50 === 0 ? 0.4 : 0.2}
      />,
    )
  }
  const horizontalLines = []
  for (let y = 10; y < deskDepth; y += 10) {
    horizontalLines.push(
      <line
        key={`h-${y}`}
        x1={0}
        y1={y * PX_PER_CM}
        x2={deskWidth * PX_PER_CM}
        y2={y * PX_PER_CM}
        stroke="#fbbf24"
        strokeWidth={y % 50 === 0 ? 1 : 0.5}
        strokeOpacity={y % 50 === 0 ? 0.4 : 0.2}
      />,
    )
  }
  return (
    <svg
      className="pointer-events-none absolute inset-0"
      width={deskWidth * PX_PER_CM}
      height={deskDepth * PX_PER_CM}
    >
      {verticalLines}
      {horizontalLines}
    </svg>
  )
}

/* ───────── ヘルパー ───────── */
function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v))
}
