'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  CATEGORY_LABELS,
  DESK_PRESETS,
  ITEM_LIBRARY,
  effectiveSize,
  findItem,
  type DeskItem,
  type ItemCategory,
  type PlacedItem,
} from '@/lib/desk-items'

/* ───────── スケール（1cm = Npx）───────── */
const PX_PER_CM = 5

/* ───────── アイソメトリック角度 ───────── */
const TILT_DEG = 55                  // X軸回転（前傾）
const ROT_DEG  = -35                 // Z軸回転（横回転）
const COS_TILT = Math.cos((TILT_DEG * Math.PI) / 180)
const SIN_ROT  = Math.sin((ROT_DEG  * Math.PI) / 180)
const COS_ROT  = Math.cos((ROT_DEG  * Math.PI) / 180)

/* スクリーン上のドラッグ移動量を desk-plane の cm 移動量に変換 */
function screenDeltaToWorld(dx: number, dy: number) {
  // step1: X軸回転 (TILT_DEG) を逆変換 → desk平面上の座標
  const planeDxPx = dx
  const planeDyPx = dy / COS_TILT
  // step2: Z軸回転 (ROT_DEG) を逆変換 → 元の世界座標
  const worldDxPx =  planeDxPx * COS_ROT + planeDyPx * SIN_ROT
  const worldDyPx = -planeDxPx * SIN_ROT + planeDyPx * COS_ROT
  return {
    dxCm: worldDxPx / PX_PER_CM,
    dyCm: worldDyPx / PX_PER_CM,
  }
}

/* ───────── ライティングプリセット ───────── */
type LightingId = 'natural' | 'warm' | 'cool' | 'rgb' | 'night'

const LIGHTING_PRESETS: Record<
  LightingId,
  { label: string; emoji: string; sceneFilter: string; overlayBg: string; deskTone: string }
> = {
  natural: {
    label: '自然光（昼）',
    emoji: '☀️',
    sceneFilter: 'brightness(1.05) saturate(1.05)',
    overlayBg: 'transparent',
    deskTone: 'linear-gradient(135deg, #d4a373 0%, #c08552 100%)',
  },
  warm: {
    label: '暖色（電球色）',
    emoji: '🔥',
    sceneFilter: 'brightness(1) saturate(0.95) sepia(0.18)',
    overlayBg: 'radial-gradient(ellipse at 50% 30%, rgba(255, 180, 80, 0.18), transparent 70%)',
    deskTone: 'linear-gradient(135deg, #c9925b 0%, #a86b3c 100%)',
  },
  cool: {
    label: '寒色（オフィス）',
    emoji: '❄️',
    sceneFilter: 'brightness(1.02) saturate(0.9) hue-rotate(-8deg)',
    overlayBg: 'radial-gradient(ellipse at 50% 30%, rgba(180, 220, 255, 0.16), transparent 70%)',
    deskTone: 'linear-gradient(135deg, #aab8c5 0%, #7d8a99 100%)',
  },
  rgb: {
    label: 'ゲーミング（RGB）',
    emoji: '🌈',
    sceneFilter: 'brightness(0.95) saturate(1.25)',
    overlayBg:
      'radial-gradient(ellipse at 20% 80%, rgba(168, 85, 247, 0.32), transparent 55%), radial-gradient(ellipse at 80% 80%, rgba(34, 211, 238, 0.32), transparent 55%), radial-gradient(ellipse at 50% 0%, rgba(244, 63, 94, 0.18), transparent 60%)',
    deskTone: 'linear-gradient(135deg, #1f2937 0%, #0f172a 100%)',
  },
  night: {
    label: '夜間（暗め）',
    emoji: '🌙',
    sceneFilter: 'brightness(0.6) saturate(0.85)',
    overlayBg: 'radial-gradient(ellipse at 50% 0%, rgba(255, 220, 150, 0.15), transparent 60%)',
    deskTone: 'linear-gradient(135deg, #374151 0%, #1f2937 100%)',
  },
}

/* ───────── レイアウト永続化（URLハッシュ）───────── */
type Snapshot = {
  desk: string
  items: PlacedItem[]
  light?: LightingId
}

function encodeSnapshot(snap: Snapshot): string {
  try {
    if (typeof window === 'undefined') return ''
    return btoa(unescape(encodeURIComponent(JSON.stringify(snap))))
  } catch {
    return ''
  }
}

function decodeSnapshot(hash: string): Snapshot | null {
  try {
    if (typeof window === 'undefined') return null
    return JSON.parse(decodeURIComponent(escape(atob(hash)))) as Snapshot
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
  const [lighting, setLighting] = useState<LightingId>('natural')
  const [shareMessage, setShareMessage] = useState<string>('')
  const dragRef = useRef<{
    instanceId: string
    startX: number
    startY: number
    itemX: number
    itemY: number
  } | null>(null)

  const desk = DESK_PRESETS.find((d) => d.id === deskId) ?? DESK_PRESETS[1]
  const lightCfg = LIGHTING_PRESETS[lighting]

  /* 初期化：URLハッシュから復元 */
  useEffect(() => {
    if (typeof window === 'undefined') return
    const hash = window.location.hash.replace(/^#/, '')
    if (!hash) return
    const snap = decodeSnapshot(hash)
    if (!snap) return
    setDeskId(snap.desk)
    setItems(snap.items)
    if (snap.light) setLighting(snap.light)
  }, [])

  /* アイテム追加：デスク中央へ配置 */
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

  const deleteItem = useCallback((instanceId: string) => {
    setItems((prev) => prev.filter((i) => i.instanceId !== instanceId))
    setSelectedInstanceId(null)
  }, [])

  const rotateItem = useCallback((instanceId: string) => {
    setItems((prev) =>
      prev.map((i) =>
        i.instanceId === instanceId
          ? { ...i, rotation: (((i.rotation + 90) % 360) as PlacedItem['rotation']) }
          : i,
      ),
    )
  }, [])

  const clearAll = useCallback(() => {
    if (items.length === 0) return
    if (window.confirm('全てのアイテムを削除しますか？')) {
      setItems([])
      setSelectedInstanceId(null)
    }
  }, [items.length])

  const handleShare = useCallback(async () => {
    const snap: Snapshot = { desk: deskId, items, light: lighting }
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
  }, [deskId, items, lighting])

  /* ── ドラッグ処理 ── */
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

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!dragRef.current) return
      const drag = dragRef.current
      const { dxCm, dyCm } = screenDeltaToWorld(e.clientX - drag.startX, e.clientY - drag.startY)
      setItems((prev) =>
        prev.map((i) => {
          if (i.instanceId !== drag.instanceId) return i
          const baseItem = findItem(i.itemId)
          if (!baseItem) return i
          const eff = effectiveSize(baseItem, i.rotation)
          const x = clamp(drag.itemX + dxCm, 0, desk.width - eff.w)
          const y = clamp(drag.itemY + dyCm, 0, desk.depth - eff.d)
          return { ...i, x, y }
        }),
      )
    },
    [desk],
  )

  const handlePointerUp = useCallback(() => {
    dragRef.current = null
  }, [])

  const itemsByCategory = useMemo(
    () => ITEM_LIBRARY.filter((i) => i.category === activeCategory),
    [activeCategory],
  )

  const selected = items.find((i) => i.instanceId === selectedInstanceId)
  const selectedItem = selected ? findItem(selected.itemId) : null

  /* シーンの寸法（パディングを取って余裕を持たせる） */
  const sceneWidth = desk.width * PX_PER_CM
  const sceneDepth = desk.depth * PX_PER_CM
  // アイソメトリック表示時は対角線方向の余裕を確保
  const sceneBoxSize = Math.ceil(Math.sqrt(sceneWidth * sceneWidth + sceneDepth * sceneDepth)) + 80

  /* z-index の決定：奥（小さなy + 大きなx）ほど後ろに描画 */
  const sortedItems = useMemo(() => {
    return [...items].sort((a, b) => a.y - b.y || a.x - b.x)
  }, [items])

  return (
    <div className="space-y-6">
      {/* コントロールバー */}
      <div className="flex flex-wrap items-center gap-3 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <label className="flex items-center gap-2 text-sm font-bold text-brand-text">
          デスクサイズ
          <select
            value={deskId}
            onChange={(e) => setDeskId(e.target.value)}
            className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium text-brand-text focus:border-brand-green focus:outline-none"
          >
            {DESK_PRESETS.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
        </label>
        <label className="flex items-center gap-2 text-sm font-bold text-brand-text">
          ライティング
          <select
            value={lighting}
            onChange={(e) => setLighting(e.target.value as LightingId)}
            className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium text-brand-text focus:border-brand-green focus:outline-none"
          >
            {(Object.keys(LIGHTING_PRESETS) as LightingId[]).map((k) => (
              <option key={k} value={k}>
                {LIGHTING_PRESETS[k].emoji} {LIGHTING_PRESETS[k].label}
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

      {/* シーン */}
      <div
        className="relative overflow-hidden rounded-2xl border border-gray-200 shadow-inner"
        style={{
          background: lighting === 'night' ? '#0f172a' : lighting === 'rgb' ? '#0b1220' : '#f8fafc',
          minHeight: 480,
        }}
      >
        {/* ライティングオーバーレイ */}
        <div
          className="pointer-events-none absolute inset-0 z-30"
          style={{ background: lightCfg.overlayBg }}
        />

        {/* シーンステージ（パースペクティブ） */}
        <div
          className="relative mx-auto"
          style={{
            width: sceneBoxSize,
            height: sceneBoxSize,
            perspective: '1500px',
            perspectiveOrigin: '50% 35%',
            filter: lightCfg.sceneFilter,
          }}
        >
          {/* デスクと配置物（アイソメトリック変換） */}
          <div
            className="absolute left-1/2 top-1/2"
            style={{
              width: sceneWidth,
              height: sceneDepth,
              transform: `translate(-50%, -50%) rotateX(${TILT_DEG}deg) rotateZ(${ROT_DEG}deg)`,
              transformStyle: 'preserve-3d',
            }}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            onClick={() => setSelectedInstanceId(null)}
          >
            {/* デスク表面 */}
            <div
              className="absolute inset-0 rounded-md"
              style={{
                background: lightCfg.deskTone,
                boxShadow: '0 12px 30px rgba(0, 0, 0, 0.35)',
                transform: 'translateZ(0)',
              }}
            />
            {/* デスクの厚み（前面） */}
            <div
              className="absolute left-0 right-0"
              style={{
                bottom: 0,
                height: 18,
                background: 'rgba(0, 0, 0, 0.25)',
                transform: 'rotateX(-90deg)',
                transformOrigin: 'bottom',
              }}
            />

            {/* 配置されたアイテム */}
            {sortedItems.map((placed, idx) => {
              const baseItem = findItem(placed.itemId)
              if (!baseItem) return null
              return (
                <IsoItem
                  key={placed.instanceId}
                  placed={placed}
                  base={baseItem}
                  isSelected={placed.instanceId === selectedInstanceId}
                  onPointerDown={handlePointerDown}
                  zIndexBase={idx}
                />
              )
            })}
          </div>
        </div>

        {/* シーン下部のキャプション */}
        <p className="absolute bottom-2 left-3 z-30 text-[10px] font-medium text-gray-500">
          {desk.width} × {desk.depth} cm　/　アイテムをドラッグで移動できます
        </p>
      </div>

      {/* 選択中アイテムの操作 */}
      {selected && selectedItem && (
        <div className="flex flex-wrap items-center gap-3 rounded-xl border-2 border-brand-green bg-brand-green/5 p-4">
          <div>
            <p className="text-xs font-bold text-brand-green">選択中</p>
            <p className="text-base font-bold text-brand-text">{selectedItem.name}</p>
            <p className="text-xs text-gray-500">
              {selectedItem.width} × {selectedItem.depth} × {selectedItem.height} cm　位置: ({selected.x.toFixed(0)}, {selected.y.toFixed(0)})
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
                {item.width} × {item.depth} × {item.height} cm
              </div>
              <p className="text-xs font-bold leading-tight text-brand-text">{item.name}</p>
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

/* ═══════════════════════════════════════════════════════
 * IsoItem ── アイテムを 3D 立体として描画
 * ═══════════════════════════════════════════════════════ */

function IsoItem({
  placed,
  base,
  isSelected,
  onPointerDown,
  zIndexBase,
}: {
  placed: PlacedItem
  base: DeskItem
  isSelected: boolean
  onPointerDown: (e: React.PointerEvent<HTMLDivElement>, instanceId: string) => void
  zIndexBase: number
}) {
  const eff = effectiveSize(base, placed.rotation)
  const wPx = eff.w * PX_PER_CM
  const dPx = eff.d * PX_PER_CM
  const hPx = base.height * PX_PER_CM

  return (
    <div
      onPointerDown={(e) => onPointerDown(e, placed.instanceId)}
      onClick={(e) => e.stopPropagation()}
      className="absolute"
      style={{
        left: placed.x * PX_PER_CM,
        top: placed.y * PX_PER_CM,
        width: wPx,
        height: dPx,
        cursor: 'move',
        touchAction: 'none',
        transformStyle: 'preserve-3d',
        zIndex: zIndexBase + 1,
      }}
    >
      {/* 形状別レンダリング */}
      <ShapeRenderer base={base} wPx={wPx} dPx={dPx} hPx={hPx} rotation={placed.rotation} isSelected={isSelected} />
    </div>
  )
}

/* ═══════════════════════════════════════════════════════
 * ShapeRenderer ── 形状ごとに違うレンダリング
 * ═══════════════════════════════════════════════════════ */

function ShapeRenderer({
  base,
  wPx,
  dPx,
  hPx,
  rotation,
  isSelected,
}: {
  base: DeskItem
  wPx: number
  dPx: number
  hPx: number
  rotation: number
  isSelected: boolean
}) {
  const ringStyle: React.CSSProperties = isSelected
    ? { outline: '2px solid #09c071', outlineOffset: 2 }
    : {}

  if (base.shape === 'monitor') {
    return <MonitorShape base={base} wPx={wPx} dPx={dPx} hPx={hPx} rotation={rotation} ring={ringStyle} />
  }
  if (base.shape === 'laptop') {
    return <LaptopShape base={base} wPx={wPx} dPx={dPx} hPx={hPx} rotation={rotation} ring={ringStyle} />
  }
  if (base.shape === 'mic') {
    return <MicShape base={base} wPx={wPx} dPx={dPx} hPx={hPx} ring={ringStyle} />
  }
  if (base.shape === 'cylinder') {
    return <CylinderShape base={base} wPx={wPx} dPx={dPx} hPx={hPx} ring={ringStyle} />
  }
  if (base.shape === 'flat') {
    return <FlatShape base={base} wPx={wPx} dPx={dPx} hPx={hPx} ring={ringStyle} />
  }
  return <BoxShape base={base} wPx={wPx} dPx={dPx} hPx={hPx} rotation={rotation} ring={ringStyle} />
}

/* ── 形状: BOX（直方体） ── */
function BoxShape({ base, wPx, dPx, hPx, rotation, ring }: { base: DeskItem; wPx: number; dPx: number; hPx: number; rotation: number; ring: React.CSSProperties }) {
  return (
    <div className="relative h-full w-full" style={{ transformStyle: 'preserve-3d', ...ring }}>
      {/* 上面 */}
      <div
        className="absolute inset-0 rounded-sm"
        style={{
          background: `linear-gradient(135deg, ${lighten(base.color, 0.12)}, ${base.color})`,
          transform: `translateZ(${hPx}px)`,
          boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.15)',
        }}
      >
        {base.accent && (
          <div
            className="absolute"
            style={{
              left: '15%',
              right: '15%',
              top: '25%',
              bottom: '25%',
              background: base.accent,
              opacity: 0.3,
              borderRadius: 2,
            }}
          />
        )}
      </div>
      {/* 前面 */}
      <div
        className="absolute left-0 right-0"
        style={{
          bottom: 0,
          height: hPx,
          background: `linear-gradient(${darken(base.color, 0.15)}, ${darken(base.color, 0.3)})`,
          transform: 'rotateX(-90deg)',
          transformOrigin: 'bottom',
        }}
      />
      {/* 右側面 */}
      <div
        className="absolute top-0 bottom-0"
        style={{
          right: 0,
          width: hPx,
          background: `linear-gradient(to right, ${darken(base.color, 0.05)}, ${darken(base.color, 0.2)})`,
          transform: 'rotateY(90deg)',
          transformOrigin: 'right',
        }}
      />
    </div>
  )
}

/* ── 形状: FLAT（薄板：マウスパッド・ノート） ── */
function FlatShape({ base, wPx, dPx, hPx, ring }: { base: DeskItem; wPx: number; dPx: number; hPx: number; ring: React.CSSProperties }) {
  return (
    <div className="relative h-full w-full" style={{ transformStyle: 'preserve-3d', ...ring }}>
      <div
        className="absolute inset-0 rounded"
        style={{
          background: `linear-gradient(135deg, ${lighten(base.color, 0.1)}, ${base.color})`,
          transform: `translateZ(${Math.max(hPx, 1)}px)`,
          boxShadow: '0 1px 4px rgba(0,0,0,0.2)',
        }}
      />
    </div>
  )
}

/* ── 形状: MONITOR（ベース＋立てられた画面） ── */
function MonitorShape({ base, wPx, dPx, hPx, rotation, ring }: { base: DeskItem; wPx: number; dPx: number; hPx: number; rotation: number; ring: React.CSSProperties }) {
  // ベース（小さい台）の寸法
  const baseW = Math.min(wPx * 0.45, 90)
  const baseD = Math.min(dPx * 0.7, 60)
  const baseH = 12 // 画面より十分低いベース
  // 画面アスペクト
  const screenH = hPx - baseH
  const screenThickness = 8

  return (
    <div className="relative h-full w-full" style={{ transformStyle: 'preserve-3d', ...ring }}>
      {/* スタンドの台 */}
      <div
        className="absolute rounded"
        style={{
          left: (wPx - baseW) / 2,
          top: (dPx - baseD) / 2,
          width: baseW,
          height: baseD,
          background: `linear-gradient(135deg, ${lighten(base.color, 0.15)}, ${base.color})`,
          transform: `translateZ(${baseH}px)`,
          boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.2)',
        }}
      />
      {/* スタンド支柱 */}
      <div
        className="absolute"
        style={{
          left: (wPx - 14) / 2,
          top: dPx - 14,
          width: 14,
          height: baseH,
          background: darken(base.color, 0.2),
          transform: `rotateX(-90deg)`,
          transformOrigin: 'bottom',
        }}
      />
      {/* 画面（背面） */}
      <div
        className="absolute"
        style={{
          left: 0,
          width: wPx,
          height: screenH,
          top: dPx - screenThickness,
          background: `linear-gradient(${darken(base.color, 0.05)}, ${darken(base.color, 0.25)})`,
          transform: `rotateX(-90deg) translateZ(0)`,
          transformOrigin: 'bottom',
        }}
      />
      {/* 画面（前面：表示部） */}
      <div
        className="absolute"
        style={{
          left: 0,
          width: wPx,
          height: screenH,
          top: dPx - screenThickness,
          background: `linear-gradient(135deg, ${base.accent ?? '#0ea5e9'}, ${darken(base.accent ?? '#0ea5e9', 0.4)})`,
          transform: `rotateX(-90deg) translateZ(${screenThickness}px)`,
          transformOrigin: 'bottom',
          boxShadow: 'inset 0 0 0 4px ' + base.color,
        }}
      >
        <div
          className="absolute"
          style={{
            inset: 6,
            background:
              'linear-gradient(135deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0) 60%), linear-gradient(135deg, #1e3a8a, #06b6d4)',
            borderRadius: 2,
          }}
        />
      </div>
    </div>
  )
}

/* ── 形状: LAPTOP（底面 + 斜めヒンジ画面） ── */
function LaptopShape({ base, wPx, dPx, hPx, rotation, ring }: { base: DeskItem; wPx: number; dPx: number; hPx: number; rotation: number; ring: React.CSSProperties }) {
  const screenH = dPx * 0.95
  return (
    <div className="relative h-full w-full" style={{ transformStyle: 'preserve-3d', ...ring }}>
      {/* 底面（キーボード側） */}
      <div
        className="absolute inset-0 rounded"
        style={{
          background: `linear-gradient(135deg, ${lighten(base.color, 0.1)}, ${base.color})`,
          transform: `translateZ(${Math.max(hPx, 6)}px)`,
          boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.15)',
        }}
      >
        {/* キーボード模様 */}
        <div
          className="absolute"
          style={{
            left: '10%',
            right: '10%',
            top: '15%',
            bottom: '40%',
            background: 'rgba(0,0,0,0.45)',
            borderRadius: 3,
          }}
        />
        {/* タッチパッド */}
        <div
          className="absolute"
          style={{
            left: '35%',
            right: '35%',
            bottom: '8%',
            top: '70%',
            background: 'rgba(0,0,0,0.25)',
            borderRadius: 3,
          }}
        />
      </div>
      {/* 画面（ヒンジから110°程度に開いた状態） */}
      <div
        className="absolute"
        style={{
          left: 0,
          width: wPx,
          height: screenH,
          top: dPx - 4,
          background: `linear-gradient(135deg, ${base.accent ?? '#0ea5e9'}, ${darken(base.accent ?? '#0ea5e9', 0.4)})`,
          transform: `rotateX(-110deg) translateZ(${Math.max(hPx, 6)}px)`,
          transformOrigin: 'bottom',
          boxShadow: 'inset 0 0 0 3px ' + base.color,
        }}
      >
        <div
          className="absolute"
          style={{
            inset: 4,
            background: 'linear-gradient(135deg, #1e3a8a, #06b6d4)',
            borderRadius: 2,
          }}
        />
      </div>
    </div>
  )
}

/* ── 形状: MIC（マイク・ヘッドホンスタンド：ベース + 縦支柱 + ヘッド） ── */
function MicShape({ base, wPx, dPx, hPx, ring }: { base: DeskItem; wPx: number; dPx: number; hPx: number; ring: React.CSSProperties }) {
  const baseSize = Math.min(wPx, dPx) * 0.85
  const baseH = 6
  const stemH = hPx - 18
  const headSize = Math.min(wPx, dPx) * 0.7

  return (
    <div className="relative h-full w-full" style={{ transformStyle: 'preserve-3d', ...ring }}>
      {/* ベース（円形台） */}
      <div
        className="absolute"
        style={{
          left: (wPx - baseSize) / 2,
          top: (dPx - baseSize) / 2,
          width: baseSize,
          height: baseSize,
          background: `radial-gradient(circle, ${lighten(base.color, 0.1)}, ${darken(base.color, 0.2)})`,
          borderRadius: '50%',
          transform: `translateZ(${baseH}px)`,
          boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
        }}
      />
      {/* 支柱（縦の細い棒） */}
      <div
        className="absolute"
        style={{
          left: (wPx - 4) / 2,
          top: dPx / 2 - 2,
          width: 4,
          height: stemH,
          background: `linear-gradient(${darken(base.color, 0.1)}, ${darken(base.color, 0.3)})`,
          transform: `rotateX(-90deg) translateY(${baseH}px)`,
          transformOrigin: 'top',
        }}
      />
      {/* ヘッド（マイク本体・上部） */}
      <div
        className="absolute"
        style={{
          left: (wPx - headSize) / 2,
          top: (dPx - headSize) / 2,
          width: headSize,
          height: headSize,
          background: `radial-gradient(circle, ${base.accent ?? base.color}, ${darken(base.color, 0.3)})`,
          borderRadius: '40%',
          transform: `translateZ(${baseH + stemH}px)`,
          boxShadow: '0 4px 8px rgba(0,0,0,0.4)',
        }}
      />
    </div>
  )
}

/* ── 形状: CYLINDER（マグカップ等） ── */
function CylinderShape({ base, wPx, dPx, hPx, ring }: { base: DeskItem; wPx: number; dPx: number; hPx: number; ring: React.CSSProperties }) {
  return (
    <div className="relative h-full w-full" style={{ transformStyle: 'preserve-3d', ...ring }}>
      {/* 上面 */}
      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(circle, ${lighten(base.color, 0.15)}, ${base.color})`,
          borderRadius: '50%',
          transform: `translateZ(${hPx}px)`,
          boxShadow: 'inset 0 0 0 2px ' + darken(base.color, 0.2),
        }}
      >
        {base.accent && (
          <div
            className="absolute"
            style={{
              inset: 4,
              background: base.accent,
              borderRadius: '50%',
              opacity: 0.6,
            }}
          />
        )}
      </div>
      {/* 側面（前から見た円柱の影） */}
      <div
        className="absolute left-0 right-0"
        style={{
          bottom: 0,
          height: hPx,
          background: `linear-gradient(to right, ${darken(base.color, 0.3)}, ${base.color}, ${darken(base.color, 0.3)})`,
          transform: 'rotateX(-90deg)',
          transformOrigin: 'bottom',
          borderRadius: '50% 50% 0 0 / 20% 20% 0 0',
        }}
      />
    </div>
  )
}

/* ───────── 色操作ヘルパー ───────── */
function lighten(hex: string, amount: number): string {
  return shade(hex, amount)
}
function darken(hex: string, amount: number): string {
  return shade(hex, -amount)
}
function shade(hex: string, amount: number): string {
  const c = hex.replace('#', '')
  const num = parseInt(c.length === 3 ? c.split('').map((x) => x + x).join('') : c, 16)
  const r = (num >> 16) & 0xff
  const g = (num >> 8) & 0xff
  const b = num & 0xff
  const adj = (v: number) => Math.max(0, Math.min(255, Math.round(v + 255 * amount)))
  return `rgb(${adj(r)}, ${adj(g)}, ${adj(b)})`
}

function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v))
}
