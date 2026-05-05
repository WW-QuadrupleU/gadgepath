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

/**
 * 描画用の形状アーキタイプ
 * - box: 単純な直方体（PC・スピーカー・コンソール等）
 * - monitor: ベース＋立てられた画面
 * - laptop: 開いたノート（底面＋斜め画面）
 * - mic: 円柱＋ベース
 * - flat: 平たい板（マウスパッド・ノート等）
 * - cylinder: 縦円柱（マグカップなど）
 */
export type ItemShape = 'box' | 'monitor' | 'laptop' | 'mic' | 'flat' | 'cylinder'

export type DeskItem = {
  id: string
  name: string
  category: ItemCategory
  /** 横幅 (cm) */
  width: number
  /** 奥行き (cm) */
  depth: number
  /** 高さ (cm) — 3D描画時の立体感に使用 */
  height: number
  /** 描画用形状 */
  shape: ItemShape
  /** ベースカラー（メイン面） */
  color: string
  /** アクセントカラー（画面・ボタン部など、形状に応じて使用） */
  accent?: string
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
  /* モニター（スタンド込み・画面が立ち上がる） */
  { id: 'monitor-24',    name: 'モニター 24"',         category: 'monitor', width: 54,  depth: 22, height: 42, shape: 'monitor', color: '#1f2937', accent: '#0ea5e9', hint: 'FHD/WQHD' },
  { id: 'monitor-27',    name: 'モニター 27"',         category: 'monitor', width: 61,  depth: 22, height: 47, shape: 'monitor', color: '#1f2937', accent: '#0ea5e9', hint: 'WQHD/4K' },
  { id: 'monitor-32',    name: 'モニター 32"',         category: 'monitor', width: 71,  depth: 24, height: 52, shape: 'monitor', color: '#1f2937', accent: '#0ea5e9', hint: '4K' },
  { id: 'monitor-34uw',  name: 'ウルトラワイド 34"',    category: 'monitor', width: 82,  depth: 24, height: 47, shape: 'monitor', color: '#1f2937', accent: '#0ea5e9', hint: '21:9' },
  { id: 'monitor-49uw',  name: 'スーパーウルトラワイド 49"', category: 'monitor', width: 120, depth: 26, height: 47, shape: 'monitor', color: '#1f2937', accent: '#0ea5e9', hint: '32:9' },

  /* PC（縦長タワー or ノート） */
  { id: 'pc-tower',      name: 'デスクトップPC',        category: 'pc', width: 22, depth: 50, height: 48, shape: 'box',    color: '#0f172a', accent: '#22c55e', hint: 'ATX タワー' },
  { id: 'pc-mini',       name: 'ミニタワー / SFF',      category: 'pc', width: 18, depth: 38, height: 38, shape: 'box',    color: '#0f172a', accent: '#22c55e', hint: 'Micro/MiniITX' },
  { id: 'pc-mini-pc',    name: 'ミニPC',               category: 'pc', width: 13, depth: 13, height: 4,  shape: 'box',    color: '#0f172a', accent: '#22c55e', hint: 'NUC等' },
  { id: 'laptop-13',     name: 'ノートPC 13"',         category: 'pc', width: 30, depth: 21, height: 2,  shape: 'laptop', color: '#475569', accent: '#0ea5e9', hint: 'MacBook Air等' },
  { id: 'laptop-15',     name: 'ノートPC 15"',         category: 'pc', width: 35, depth: 24, height: 2,  shape: 'laptop', color: '#475569', accent: '#0ea5e9' },
  { id: 'laptop-17',     name: 'ゲーミングノート 17"',  category: 'pc', width: 40, depth: 28, height: 3,  shape: 'laptop', color: '#475569', accent: '#0ea5e9' },

  /* キーボード（薄型） */
  { id: 'kb-60',         name: 'キーボード 60%',       category: 'keyboard', width: 29, depth: 10, height: 4, shape: 'box', color: '#334155', accent: '#cbd5e1' },
  { id: 'kb-tkl',        name: 'キーボード TKL',       category: 'keyboard', width: 36, depth: 13, height: 4, shape: 'box', color: '#334155', accent: '#cbd5e1' },
  { id: 'kb-full',       name: 'キーボード フルサイズ',  category: 'keyboard', width: 45, depth: 14, height: 4, shape: 'box', color: '#334155', accent: '#cbd5e1' },
  { id: 'kb-jp-full',    name: '日本語フルキーボード',   category: 'keyboard', width: 45, depth: 14, height: 4, shape: 'box', color: '#334155', accent: '#cbd5e1' },

  /* マウスパッド・マウス */
  { id: 'pad-s',         name: 'マウスパッド 小',       category: 'mouse', width: 25, depth: 21, height: 0.4, shape: 'flat', color: '#7c3aed', hint: 'S' },
  { id: 'pad-m',         name: 'マウスパッド 中',       category: 'mouse', width: 36, depth: 30, height: 0.4, shape: 'flat', color: '#7c3aed', hint: 'M' },
  { id: 'pad-l',         name: 'マウスパッド 大',       category: 'mouse', width: 45, depth: 40, height: 0.4, shape: 'flat', color: '#7c3aed', hint: 'L' },
  { id: 'pad-xl',        name: 'マウスパッド XL（広面）', category: 'mouse', width: 90, depth: 40, height: 0.4, shape: 'flat', color: '#7c3aed', hint: 'XL' },
  { id: 'mouse',         name: 'マウス',               category: 'mouse', width: 7,  depth: 12, height: 4,   shape: 'box',  color: '#a855f7', accent: '#e9d5ff' },

  /* マイク・アーム（縦長） */
  { id: 'mic-usb',       name: 'USBマイク（卓上）',    category: 'mic', width: 11, depth: 11, height: 28, shape: 'mic', color: '#dc2626', accent: '#fca5a5', hint: 'Yeti等' },
  { id: 'mic-condenser', name: 'コンデンサーマイク',    category: 'mic', width: 14, depth: 14, height: 38, shape: 'mic', color: '#dc2626', accent: '#fca5a5', hint: 'スタンド込' },
  { id: 'mic-arm',       name: 'マイクアーム（クランプ）', category: 'mic', width: 8,  depth: 8,  height: 60, shape: 'mic', color: '#b91c1c', accent: '#fca5a5', hint: 'デスク端固定' },
  { id: 'mic-stand',     name: 'マイクスタンド（卓上）', category: 'mic', width: 18, depth: 18, height: 32, shape: 'mic', color: '#b91c1c', accent: '#fca5a5', hint: '据え置き式' },

  /* スピーカー */
  { id: 'sp-small',      name: 'デスクトップスピーカー（小）', category: 'speaker', width: 12, depth: 14, height: 18, shape: 'box', color: '#0891b2', accent: '#67e8f9', hint: '2.0ch' },
  { id: 'sp-medium',     name: 'スタジオモニター（中）',     category: 'speaker', width: 18, depth: 24, height: 28, shape: 'box', color: '#0891b2', accent: '#67e8f9', hint: '5インチ' },
  { id: 'sp-large',      name: 'スタジオモニター（大）',     category: 'speaker', width: 22, depth: 28, height: 35, shape: 'box', color: '#0891b2', accent: '#67e8f9', hint: '8インチ' },
  { id: 'sp-bar',        name: 'サウンドバー',             category: 'speaker', width: 60, depth: 10, height: 6,  shape: 'box', color: '#0891b2', accent: '#67e8f9' },
  { id: 'sp-sub',        name: 'サブウーファー',           category: 'speaker', width: 28, depth: 28, height: 30, shape: 'box', color: '#0e7490', accent: '#67e8f9', hint: '床置き想定' },

  /* コンソール */
  { id: 'ps5',           name: 'PS5（縦置き）',         category: 'console', width: 10, depth: 26, height: 39, shape: 'box', color: '#f8fafc', accent: '#0ea5e9' },
  { id: 'ps5-h',         name: 'PS5（横置き）',         category: 'console', width: 39, depth: 26, height: 10, shape: 'box', color: '#f8fafc', accent: '#0ea5e9' },
  { id: 'xbox-x',        name: 'Xbox Series X',        category: 'console', width: 15, depth: 15, height: 30, shape: 'box', color: '#0f172a', accent: '#22c55e' },
  { id: 'xbox-s',        name: 'Xbox Series S',        category: 'console', width: 15, depth: 27, height: 6,  shape: 'box', color: '#f8fafc', accent: '#22c55e' },
  { id: 'switch',        name: 'Switch ドック',         category: 'console', width: 17, depth: 5,  height: 11, shape: 'box', color: '#1f2937', accent: '#dc2626', hint: 'ドック単体' },
  { id: 'switch2',       name: 'Switch 2 ドック',       category: 'console', width: 19, depth: 6,  height: 12, shape: 'box', color: '#1f2937', accent: '#dc2626' },

  /* その他 */
  { id: 'webcam',        name: 'Webカメラ',            category: 'other', width: 9,  depth: 5,  height: 4,  shape: 'box',      color: '#1f2937', accent: '#0ea5e9' },
  { id: 'headphones',    name: 'ヘッドホンスタンド',    category: 'other', width: 12, depth: 12, height: 28, shape: 'mic',      color: '#1f2937', accent: '#94a3b8' },
  { id: 'usb-hub',       name: 'USBハブ / ドック',      category: 'other', width: 12, depth: 8,  height: 2,  shape: 'flat',     color: '#475569' },
  { id: 'capture',       name: 'キャプチャーボード',    category: 'other', width: 11, depth: 7,  height: 2,  shape: 'flat',     color: '#475569' },
  { id: 'mug',           name: 'マグカップ',           category: 'other', width: 9,  depth: 9,  height: 11, shape: 'cylinder', color: '#92400e', accent: '#fde68a', hint: '直径9cm想定' },
  { id: 'notebook',      name: 'ノート / 手帳',         category: 'other', width: 21, depth: 30, height: 1,  shape: 'flat',     color: '#92400e', hint: 'A4' },
  { id: 'phone-stand',   name: 'スマホスタンド',        category: 'other', width: 8,  depth: 10, height: 14, shape: 'box',      color: '#475569', accent: '#0ea5e9' },
  { id: 'tablet',        name: 'タブレット 11"',        category: 'other', width: 25, depth: 18, height: 1,  shape: 'flat',     color: '#1f2937', accent: '#0ea5e9' },
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
