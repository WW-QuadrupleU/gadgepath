/**
 * デスクシミュレーター用のアイテムライブラリ
 * すべての寸法は cm 単位（実寸ベース）
 */

export type ItemCategory =
  | 'monitor'
  | 'pc'
  | 'keyboard'
  | 'mouse'
  | 'mic'
  | 'speaker'
  | 'console'
  | 'other'

export type DeskItem = {
  id: string
  name: string
  category: ItemCategory
  /** 横幅 (cm) */
  width: number
  /** 奥行き (cm) */
  depth: number
  /** 表示色 */
  color: string
  /** 短い説明 */
  hint?: string
}

export type DeskPreset = {
  id: string
  name: string
  width: number
  depth: number
}

export type PlacedItem = {
  /** 配置インスタンスごとの一意ID */
  instanceId: string
  /** ItemLibraryのID参照 */
  itemId: string
  /** デスク左端からの位置 (cm) */
  x: number
  /** デスク上端からの位置 (cm) */
  y: number
  /** 0/90/180/270 度回転 */
  rotation: 0 | 90 | 180 | 270
}

/* ───────────── デスクサイズプリセット ───────────── */

export const DESK_PRESETS: DeskPreset[] = [
  { id: 'small',  name: '小型 100×60cm',    width: 100, depth: 60 },
  { id: 'std',    name: '標準 120×60cm',    width: 120, depth: 60 },
  { id: 'medium', name: '中型 140×70cm',    width: 140, depth: 70 },
  { id: 'wide',   name: 'ワイド 160×70cm',  width: 160, depth: 70 },
  { id: 'large',  name: '大型 180×80cm',    width: 180, depth: 80 },
  { id: 'xl',     name: '特大 200×80cm',    width: 200, depth: 80 },
]

/* ───────────── アイテムライブラリ ───────────── */

export const ITEM_LIBRARY: DeskItem[] = [
  /* モニター（スタンド込みのフットプリント） */
  { id: 'monitor-24',    name: 'モニター 24"',         category: 'monitor', width: 54,  depth: 22, color: '#0f172a', hint: 'フルHD/WQHD' },
  { id: 'monitor-27',    name: 'モニター 27"',         category: 'monitor', width: 61,  depth: 22, color: '#0f172a', hint: 'WQHD/4K' },
  { id: 'monitor-32',    name: 'モニター 32"',         category: 'monitor', width: 71,  depth: 24, color: '#0f172a', hint: '4K' },
  { id: 'monitor-34uw',  name: 'ウルトラワイド 34"',    category: 'monitor', width: 82,  depth: 24, color: '#0f172a', hint: '21:9' },
  { id: 'monitor-49uw',  name: 'スーパーウルトラワイド 49"', category: 'monitor', width: 120, depth: 26, color: '#0f172a', hint: '32:9' },

  /* PC */
  { id: 'pc-tower',      name: 'デスクトップPC',        category: 'pc', width: 22, depth: 50, color: '#1e293b', hint: 'ATX タワー' },
  { id: 'pc-mini',       name: 'ミニタワー / SFF',      category: 'pc', width: 18, depth: 38, color: '#1e293b', hint: 'Micro/MiniITX' },
  { id: 'pc-mini-pc',    name: 'ミニPC',               category: 'pc', width: 13, depth: 13, color: '#1e293b', hint: 'NUC等' },
  { id: 'laptop-13',     name: 'ノートPC 13"',         category: 'pc', width: 30, depth: 21, color: '#475569', hint: 'MacBook Air等' },
  { id: 'laptop-15',     name: 'ノートPC 15"',         category: 'pc', width: 35, depth: 24, color: '#475569' },
  { id: 'laptop-17',     name: 'ゲーミングノート 17"',  category: 'pc', width: 40, depth: 28, color: '#475569' },

  /* キーボード */
  { id: 'kb-60',         name: 'キーボード 60%',       category: 'keyboard', width: 29, depth: 10, color: '#334155' },
  { id: 'kb-tkl',        name: 'キーボード TKL',       category: 'keyboard', width: 36, depth: 13, color: '#334155' },
  { id: 'kb-full',       name: 'キーボード フルサイズ',  category: 'keyboard', width: 45, depth: 14, color: '#334155' },
  { id: 'kb-jp-full',    name: '日本語フルキーボード',   category: 'keyboard', width: 45, depth: 14, color: '#334155' },

  /* マウスパッド */
  { id: 'pad-s',         name: 'マウスパッド 小',       category: 'mouse', width: 25, depth: 21, color: '#7c3aed', hint: 'S' },
  { id: 'pad-m',         name: 'マウスパッド 中',       category: 'mouse', width: 36, depth: 30, color: '#7c3aed', hint: 'M' },
  { id: 'pad-l',         name: 'マウスパッド 大',       category: 'mouse', width: 45, depth: 40, color: '#7c3aed', hint: 'L' },
  { id: 'pad-xl',        name: 'マウスパッド XL（広面）', category: 'mouse', width: 90, depth: 40, color: '#7c3aed', hint: 'XL' },
  { id: 'mouse',         name: 'マウス',               category: 'mouse', width: 7,  depth: 12, color: '#a855f7' },

  /* マイク・アーム */
  { id: 'mic-usb',       name: 'USBマイク（卓上）',    category: 'mic', width: 11, depth: 11, color: '#dc2626', hint: 'Yeti等' },
  { id: 'mic-condenser', name: 'コンデンサーマイク',    category: 'mic', width: 14, depth: 14, color: '#dc2626', hint: 'スタンド込' },
  { id: 'mic-arm',       name: 'マイクアーム（クランプ）', category: 'mic', width: 8,  depth: 8,  color: '#b91c1c', hint: 'デスク端固定' },
  { id: 'mic-stand',     name: 'マイクスタンド（卓上）', category: 'mic', width: 18, depth: 18, color: '#b91c1c', hint: '据え置き式' },

  /* スピーカー */
  { id: 'sp-small',      name: 'デスクトップスピーカー（小）', category: 'speaker', width: 12, depth: 14, color: '#0891b2', hint: '2.0ch' },
  { id: 'sp-medium',     name: 'スタジオモニター（中）',     category: 'speaker', width: 18, depth: 24, color: '#0891b2', hint: '5インチ' },
  { id: 'sp-large',      name: 'スタジオモニター（大）',     category: 'speaker', width: 22, depth: 28, color: '#0891b2', hint: '8インチ' },
  { id: 'sp-bar',        name: 'サウンドバー',             category: 'speaker', width: 60, depth: 10, color: '#0891b2' },
  { id: 'sp-sub',        name: 'サブウーファー',           category: 'speaker', width: 28, depth: 28, color: '#0e7490', hint: '床置き想定' },

  /* コンソール */
  { id: 'ps5',           name: 'PS5（縦置き）',         category: 'console', width: 10, depth: 26, color: '#0ea5e9' },
  { id: 'ps5-h',         name: 'PS5（横置き）',         category: 'console', width: 39, depth: 26, color: '#0ea5e9' },
  { id: 'xbox-x',        name: 'Xbox Series X',        category: 'console', width: 15, depth: 15, color: '#16a34a' },
  { id: 'xbox-s',        name: 'Xbox Series S',        category: 'console', width: 15, depth: 27, color: '#16a34a' },
  { id: 'switch',        name: 'Switch ドック',         category: 'console', width: 17, depth: 5,  color: '#dc2626', hint: 'ドック単体' },
  { id: 'switch2',       name: 'Switch 2 ドック',       category: 'console', width: 19, depth: 6,  color: '#dc2626' },

  /* その他 */
  { id: 'webcam',        name: 'Webカメラ',            category: 'other', width: 9,  depth: 5,  color: '#64748b' },
  { id: 'headphones',    name: 'ヘッドホンスタンド',    category: 'other', width: 12, depth: 12, color: '#64748b' },
  { id: 'usb-hub',       name: 'USBハブ / ドック',      category: 'other', width: 12, depth: 8,  color: '#64748b' },
  { id: 'capture',       name: 'キャプチャーボード',    category: 'other', width: 11, depth: 7,  color: '#64748b' },
  { id: 'mug',           name: 'マグカップ',           category: 'other', width: 9,  depth: 9,  color: '#92400e', hint: '直径9cm想定' },
  { id: 'notebook',      name: 'ノート / 手帳',         category: 'other', width: 21, depth: 30, color: '#92400e', hint: 'A4' },
  { id: 'phone-stand',   name: 'スマホスタンド',        category: 'other', width: 8,  depth: 10, color: '#64748b' },
  { id: 'tablet',        name: 'タブレット 11"',        category: 'other', width: 25, depth: 18, color: '#475569' },
]

/* ───────────── カテゴリ表示用ラベル ───────────── */

export const CATEGORY_LABELS: Record<ItemCategory, { label: string; emoji: string }> = {
  monitor:  { label: 'モニター',     emoji: '🖥️' },
  pc:       { label: 'PC',          emoji: '💻' },
  keyboard: { label: 'キーボード',   emoji: '⌨️' },
  mouse:    { label: 'マウス・パッド', emoji: '🖱️' },
  mic:      { label: 'マイク',       emoji: '🎤' },
  speaker:  { label: 'スピーカー',   emoji: '🔊' },
  console:  { label: 'コンソール',   emoji: '🎮' },
  other:    { label: 'その他',       emoji: '📦' },
}

/* ───────────── ヘルパー ───────────── */

export function findItem(itemId: string): DeskItem | undefined {
  return ITEM_LIBRARY.find((i) => i.id === itemId)
}

/** 矩形が交差しているか（回転考慮した実効サイズで判定） */
export function isOverlapping(
  a: { x: number; y: number; w: number; d: number },
  b: { x: number; y: number; w: number; d: number },
): boolean {
  return !(a.x + a.w <= b.x || b.x + b.w <= a.x || a.y + a.d <= b.y || b.y + b.d <= a.y)
}

/** 回転を考慮した実効サイズを返す */
export function effectiveSize(item: DeskItem, rotation: number): { w: number; d: number } {
  const isRotated = rotation === 90 || rotation === 270
  return isRotated
    ? { w: item.depth, d: item.width }
    : { w: item.width, d: item.depth }
}
