export type DeskTypeId =
  | 'quiet-optimizer'
  | 'compact-maker'
  | 'cozy-minimalist'
  | 'creator-studio'
  | 'immersive-gamer'
  | 'streaming-starter'
  | 'ai-booster'
  | 'romance-hunter'

export type DeskAnswerValue =
  | 'work'
  | 'stream'
  | 'game'
  | 'study'
  | 'create'
  | 'tired'
  | 'messy'
  | 'bad-audio'
  | 'dark'
  | 'unfocused'
  | 'value'
  | 'look'
  | 'latest'
  | 'safe'
  | 'minimal'
  | 'futuristic'
  | 'cafe'
  | 'white'
  | 'gaming'
  | 'low'
  | 'middle'
  | 'high'
  | 'step'
  | 'small'
  | 'medium'
  | 'large'
  | 'keyboard'
  | 'mouse'
  | 'monitor'
  | 'mic'
  | 'light'
  | 'chair'
  | 'none'
  | 'focus'
  | 'video'
  | 'voice'
  | 'comfort'
  | 'storage'

export type DeskQuestion = {
  id: string
  title: string
  helper: string
  options: {
    label: string
    value: DeskAnswerValue
    scores: Partial<Record<DeskTypeId, number>>
  }[]
}

export type DeskType = {
  id: DeskTypeId
  name: string
  shortName: string
  catchphrase: string
  futureDesk: string
  mood: string
  color: string
  accent: string
  description: string
  traits: string[]
  firstInvestment: string
  buyOrder: string[]
  avoid: string[]
  recommendedCategories: string[]
  relatedLinks: { label: string; href: string }[]
  imagePath: string
  imagePrompt: string
}

export const DESK_QUESTIONS: DeskQuestion[] = [
  {
    id: 'goal',
    title: '未来デスクで一番やりたいことは？',
    helper: 'いま一番ワクワクする使い方を選んでください。',
    options: [
      { label: '集中して作業したい', value: 'work', scores: { 'quiet-optimizer': 3, 'ai-booster': 2, 'cozy-minimalist': 1 } },
      { label: '配信や通話をきれいにしたい', value: 'stream', scores: { 'streaming-starter': 3, 'creator-studio': 2 } },
      { label: 'ゲームに深く没入したい', value: 'game', scores: { 'immersive-gamer': 3, 'romance-hunter': 1 } },
      { label: '勉強や資格学習を続けたい', value: 'study', scores: { 'cozy-minimalist': 3, 'quiet-optimizer': 2 } },
      { label: '動画・写真・創作をしたい', value: 'create', scores: { 'creator-studio': 3, 'ai-booster': 1 } },
    ],
  },
  {
    id: 'pain',
    title: 'いまの環境で一番もったいない所は？',
    helper: '買うべきものより、先に解決したい不満を見ます。',
    options: [
      { label: '長時間いると疲れる', value: 'tired', scores: { 'cozy-minimalist': 3, 'quiet-optimizer': 2 } },
      { label: '机の上が散らかる', value: 'messy', scores: { 'compact-maker': 3, 'cozy-minimalist': 1 } },
      { label: '声や音がよくない', value: 'bad-audio', scores: { 'streaming-starter': 3, 'creator-studio': 1 } },
      { label: '画面や顔まわりが暗い', value: 'dark', scores: { 'creator-studio': 2, 'streaming-starter': 2 } },
      { label: '集中モードに入りにくい', value: 'unfocused', scores: { 'quiet-optimizer': 3, 'ai-booster': 1 } },
    ],
  },
  {
    id: 'shopping',
    title: 'ガジェットを買う時のクセは？',
    helper: '性格診断らしい、かなり大事な質問です。',
    options: [
      { label: 'コスパと失敗しにくさを重視', value: 'value', scores: { 'quiet-optimizer': 2, 'compact-maker': 2 } },
      { label: '見た目が好きなら使いたくなる', value: 'look', scores: { 'cozy-minimalist': 2, 'creator-studio': 1 } },
      { label: '新しいものに心が動く', value: 'latest', scores: { 'ai-booster': 3, 'romance-hunter': 2 } },
      { label: 'レビューを見て堅く選びたい', value: 'safe', scores: { 'quiet-optimizer': 2, 'streaming-starter': 1 } },
    ],
  },
  {
    id: 'mood',
    title: '理想の雰囲気は？',
    helper: '結果カードの世界観にも反映されます。',
    options: [
      { label: 'ミニマルで静か', value: 'minimal', scores: { 'quiet-optimizer': 2, 'compact-maker': 2 } },
      { label: '近未来っぽい', value: 'futuristic', scores: { 'ai-booster': 3, 'romance-hunter': 1 } },
      { label: 'カフェみたいに落ち着く', value: 'cafe', scores: { 'cozy-minimalist': 3 } },
      { label: '白くてかわいい', value: 'white', scores: { 'cozy-minimalist': 2, 'creator-studio': 1 } },
      { label: '光る、強い、秘密基地', value: 'gaming', scores: { 'immersive-gamer': 3, 'romance-hunter': 2 } },
    ],
  },
  {
    id: 'budget',
    title: '最初の予算感は？',
    helper: '夢は大きく、初手は現実的に。',
    options: [
      { label: '1万円台から小さく', value: 'low', scores: { 'compact-maker': 2, 'cozy-minimalist': 1 } },
      { label: '3万円から5万円で変えたい', value: 'middle', scores: { 'quiet-optimizer': 2, 'streaming-starter': 2 } },
      { label: '10万円前後で一気に整える', value: 'high', scores: { 'creator-studio': 2, 'immersive-gamer': 2, 'ai-booster': 1 } },
      { label: '月ごとに買い足したい', value: 'step', scores: { 'quiet-optimizer': 2, 'romance-hunter': 1 } },
    ],
  },
  {
    id: 'space',
    title: '机まわりの広さは？',
    helper: '広さで正解のガジェットはかなり変わります。',
    options: [
      { label: 'かなりコンパクト', value: 'small', scores: { 'compact-maker': 3 } },
      { label: '一般的なデスク', value: 'medium', scores: { 'quiet-optimizer': 1, 'cozy-minimalist': 1, 'streaming-starter': 1 } },
      { label: '広めに使える', value: 'large', scores: { 'creator-studio': 2, 'immersive-gamer': 2, 'ai-booster': 1 } },
    ],
  },
  {
    id: 'owned',
    title: 'すでに持っている主力アイテムは？',
    helper: '持っているものを活かす方向で診断します。',
    options: [
      { label: 'キーボードやマウス', value: 'keyboard', scores: { 'quiet-optimizer': 1, 'ai-booster': 1 } },
      { label: 'モニター', value: 'monitor', scores: { 'immersive-gamer': 1, 'creator-studio': 1 } },
      { label: 'マイク', value: 'mic', scores: { 'streaming-starter': 2 } },
      { label: '照明', value: 'light', scores: { 'creator-studio': 1, 'cozy-minimalist': 1 } },
      { label: 'まだほぼない', value: 'none', scores: { 'compact-maker': 1, 'streaming-starter': 1 } },
    ],
  },
  {
    id: 'upgrade',
    title: '最初に上げたい満足度は？',
    helper: '最後の一押しです。',
    options: [
      { label: '集中力', value: 'focus', scores: { 'quiet-optimizer': 3, 'ai-booster': 1 } },
      { label: '映像の見栄え', value: 'video', scores: { 'creator-studio': 2, 'streaming-starter': 2 } },
      { label: '声・会話の快適さ', value: 'voice', scores: { 'streaming-starter': 3 } },
      { label: '体のラクさ', value: 'comfort', scores: { 'cozy-minimalist': 3 } },
      { label: '収納と省スペース', value: 'storage', scores: { 'compact-maker': 3 } },
    ],
  },
]

export const DESK_TYPES: DeskType[] = [
  {
    id: 'quiet-optimizer',
    name: '静かな効率主義者',
    shortName: '効率主義者',
    catchphrase: '派手さより、毎日すっと集中できることが正義。',
    futureDesk: '夜に集中できるミニマルAI作業デスク',
    mood: '静音 / 整理 / 目にやさしい',
    color: '#DFF7D8',
    accent: '#467B50',
    description: 'あなたは、買った瞬間の高揚感よりも、毎日じわじわ効く快適さで満足度が上がるタイプです。最初に整えるべきはPC本体より、姿勢、視線、照明、入力まわりです。',
    traits: ['無駄な買い物を避けたい', '長く使えるものが好き', '集中できる環境に価値を感じる'],
    firstInvestment: 'モニターアームと手元照明',
    buyOrder: ['モニターアーム', '目にやさしいデスクライト', '静音キーボード', 'USB-Cドック', 'ノイズの少ないマイク'],
    avoid: ['見た目だけの大型モニター', '使い道が曖昧な高級マイク', '机を狭くする装飾アイテム'],
    recommendedCategories: ['照明', 'モニターアーム', 'キーボード', 'USBハブ'],
    relatedLinks: [
      { label: '機材検索で探す', href: '/tools/gear-finder' },
      { label: 'CPU・GPU比較を見る', href: '/tools/spec-compare' },
    ],
    imagePath: '/images/tools/future-desk-diagnosis/quiet-optimizer.jpeg',
    imagePrompt: 'A cute modern Japanese personality quiz result illustration of a calm minimalist future work desk, soft green accents, tidy monitor arm, warm desk light, compact AI workspace, rounded shapes, cozy and unique, no text',
  },
  {
    id: 'compact-maker',
    name: '省スペース職人',
    shortName: '省スペース',
    catchphrase: '小さい机でも、配置が決まればちゃんと強い。',
    futureDesk: '小さな机を最大化する変形ミニデスク',
    mood: '省スペース / 収納 / 機動力',
    color: '#E6F0FF',
    accent: '#3E63B8',
    description: 'あなたは、限られたスペースをうまく使うほどテンションが上がるタイプです。高額な機材より、縦置き、吊るす、まとめる、たたむ仕組みが効きます。',
    traits: ['机が狭くても工夫したい', '配線や収納が気になる', '小さくまとまる道具が好き'],
    firstInvestment: '収納とケーブル整理',
    buyOrder: ['ケーブルトレー', '小型USB-Cハブ', '縦置きスタンド', '薄型キーボード', '小型ライト'],
    avoid: ['奥行きのあるスピーカー', '巨大なマウスパッド', '常設前提の大型機材'],
    recommendedCategories: ['USBハブ', '収納', '小型ライト', 'スタンド'],
    relatedLinks: [
      { label: 'デスクシミュレーターを使う', href: '/tools/desk-simulator' },
      { label: '機材検索で探す', href: '/tools/gear-finder' },
    ],
    imagePath: '/images/tools/future-desk-diagnosis/compact-maker.jpeg',
    imagePrompt: 'A playful compact future desk setup illustration for a Japanese gadget quiz, tiny desk with clever vertical storage, pastel blue accents, cute organized gadgets, cable management, rounded UI-card feeling, no text',
  },
  {
    id: 'cozy-minimalist',
    name: 'カフェ作業ミニマリスト',
    shortName: 'カフェミニマル',
    catchphrase: 'かわいくて落ち着く場所なら、自然に続けられる。',
    futureDesk: '朝も夜も座りたくなるカフェ風デスク',
    mood: '白デスク / 温かい光 / 低刺激',
    color: '#FFF1D9',
    accent: '#A06732',
    description: 'あなたは、性能よりも空気感で作業スイッチが入るタイプです。まずは照明、椅子、手触りの良い入力機器で、毎日座りたくなる場所にしましょう。',
    traits: ['雰囲気が整うと続けやすい', '白や木目の統一感が好き', '疲れにくさを重視する'],
    firstInvestment: '照明と座り心地',
    buyOrder: ['温かいデスクライト', 'リストレスト', '静かなキーボード', 'デスクマット', '姿勢を支えるチェア'],
    avoid: ['強すぎるRGB照明', '黒くて大きい機材の買いすぎ', '硬い椅子のまま高級ガジェットを買うこと'],
    recommendedCategories: ['照明', 'キーボード', 'チェア', 'デスクマット'],
    relatedLinks: [
      { label: '機材検索で探す', href: '/tools/gear-finder' },
      { label: 'スマホ比較を見る', href: '/tools/smartphone-compare' },
    ],
    imagePath: '/images/tools/future-desk-diagnosis/cozy-minimalist.jpeg',
    imagePrompt: 'A cute cozy cafe-style future desk illustration, warm beige and white tones, soft desk lamp, minimal gadgets, friendly Japanese personality quiz result card style, charming and modern, no text',
  },
  {
    id: 'creator-studio',
    name: '映像こだわりクリエイター',
    shortName: 'クリエイター',
    catchphrase: '見えるもの、聞こえるものを整えると一気に作品っぽくなる。',
    futureDesk: '撮れる・話せる・作れるミニスタジオ',
    mood: '映像 / 音声 / 作品づくり',
    color: '#F2E7FF',
    accent: '#7D4AC7',
    description: 'あなたは、アウトプットの見栄えが整うほどやる気が増すタイプです。高いカメラの前に、照明、マイク、背景の順で整えると変化が大きいです。',
    traits: ['見た目の完成度が気になる', '動画や写真を作りたい', '配信や会議の印象も上げたい'],
    firstInvestment: '照明と音声',
    buyOrder: ['キーライト', 'USBマイク', '背景を整える小物', 'Webカメラ', '編集向けモニター'],
    avoid: ['照明なしの高級カメラ', '部屋鳴りを無視したマイク', '用途未定の高価なレンズ'],
    recommendedCategories: ['照明', 'マイク', 'Webカメラ', 'モニター'],
    relatedLinks: [
      { label: '配信環境チェッカー', href: '/tools/streaming-checker' },
      { label: '機材検索で探す', href: '/tools/gear-finder' },
    ],
    imagePath: '/images/tools/future-desk-diagnosis/creator-studio.jpeg',
    imagePrompt: 'A cute creator mini studio desk illustration, pastel purple accents, camera, softbox light, microphone, tidy creative gadgets, fun personality quiz result style, modern Japanese web design, no text',
  },
  {
    id: 'immersive-gamer',
    name: '没入ゲーマー',
    shortName: '没入ゲーマー',
    catchphrase: '勝ちたい日も、世界に浸りたい日も、環境が味方になる。',
    futureDesk: '音と光で包むゲーミング秘密基地',
    mood: '没入 / 反応速度 / 音',
    color: '#E7E9FF',
    accent: '#4C56D8',
    description: 'あなたは、スペックだけでなく没入感で満足度が伸びるタイプです。GPUだけに全振りせず、モニター、音、姿勢を一緒に整えると強いです。',
    traits: ['ゲームの世界に入り込みたい', '反応速度や画面の滑らかさが気になる', '基地感のあるデスクが好き'],
    firstInvestment: 'モニターと音',
    buyOrder: ['高リフレッシュレートモニター', '軽いヘッドセット', '大きめマウスパッド', 'モニターライト', 'GPUアップグレード'],
    avoid: ['PCだけ強くして古いモニターのまま', '重すぎるヘッドセット', '姿勢を崩す椅子'],
    recommendedCategories: ['モニター', 'ヘッドセット', 'マウス', 'GPU'],
    relatedLinks: [
      { label: 'CPU・GPU比較を見る', href: '/tools/spec-compare' },
      { label: 'デスクシミュレーターを使う', href: '/tools/desk-simulator' },
    ],
    imagePath: '/images/tools/future-desk-diagnosis/immersive-gamer.jpeg',
    imagePrompt: 'A cute immersive gaming desk illustration, soft indigo neon accents, cozy secret base feeling, monitor glow, headset, controller, rounded modern personality quiz result visual, no text',
  },
  {
    id: 'streaming-starter',
    name: '配信スタジオ志向',
    shortName: '配信スタジオ',
    catchphrase: '最初に変えるべきは、機材の数ではなく伝わり方。',
    futureDesk: '声と表情が伝わるスターター配信ブース',
    mood: '声 / 顔映り / 会話',
    color: '#FFE4EF',
    accent: '#C23A6B',
    description: 'あなたは、人に伝わる品質が上がると一気に楽しくなるタイプです。まずはマイク、照明、カメラ位置を整えるだけで印象が変わります。',
    traits: ['通話や配信の印象を上げたい', '音声品質が気になる', '手軽に始めたい'],
    firstInvestment: 'USBマイクと顔まわりの照明',
    buyOrder: ['USBマイク', '小型ライト', 'マイクアーム', 'Webカメラ', 'モニターアーム'],
    avoid: ['部屋が暗いまま高級カメラ', '置き場所のない大きなマイク', '設定が難しすぎる機材'],
    recommendedCategories: ['マイク', '照明', 'Webカメラ', 'マイクアーム'],
    relatedLinks: [
      { label: '配信環境チェッカー', href: '/tools/streaming-checker' },
      { label: '機材検索で探す', href: '/tools/gear-finder' },
    ],
    imagePath: '/images/tools/future-desk-diagnosis/streaming-starter.jpeg',
    imagePrompt: 'A cute starter streaming booth desk illustration, pastel pink accents, microphone, small ring light, webcam, friendly cheerful gadget personality quiz card style, no text',
  },
  {
    id: 'ai-booster',
    name: 'AI作業ブースター',
    shortName: 'AIブースター',
    catchphrase: '作業を速くするより、考える余白を増やしたい。',
    futureDesk: 'AIと並走する近未来ワークステーション',
    mood: 'AI / 自動化 / マルチタスク',
    color: '#DDFBFF',
    accent: '#18899A',
    description: 'あなたは、新しいツールを使って作業の流れ自体を変えるのが好きなタイプです。AI、音声入力、サブ画面、ショートカットが満足度を押し上げます。',
    traits: ['AIツールを使うのが好き', '自動化や効率化にワクワクする', '複数作業を並行したい'],
    firstInvestment: '入力と表示領域',
    buyOrder: ['サブモニター', 'ショートカット用デバイス', '音声入力向けマイク', '高速SSD', 'AI用途に強いPC'],
    avoid: ['AI用途を考えない低メモリPC', '画面が足りないままの作業', '設定が続かない自動化グッズ'],
    recommendedCategories: ['AIモデル', 'モニター', 'マイク', 'SSD'],
    relatedLinks: [
      { label: 'AIモデル比較を見る', href: '/tools/ai-model-compare' },
      { label: 'CPU・GPU比較を見る', href: '/tools/spec-compare' },
    ],
    imagePath: '/images/tools/future-desk-diagnosis/ai-booster.jpeg',
    imagePrompt: 'A cute futuristic AI workspace illustration, cyan accents, dual monitor desk, small AI assistant vibe, clean Japanese personality quiz result visual, charming and not too sci-fi, no text',
  },
  {
    id: 'romance-hunter',
    name: 'ガジェット浪漫派',
    shortName: '浪漫派',
    catchphrase: '必要かどうかだけじゃない。好きで上がる機材もある。',
    futureDesk: '好きな機材に囲まれる実験室デスク',
    mood: '新製品 / こだわり / 遊び心',
    color: '#FFE8D6',
    accent: '#C05A21',
    description: 'あなたは、道具そのものにワクワクできるタイプです。ただし浪漫買いは増えすぎると机を圧迫します。主役を1つ決めると満足度が長続きします。',
    traits: ['新しい機材を見ると試したくなる', 'スペック表を読むのが楽しい', '人と違う構成に惹かれる'],
    firstInvestment: '主役ガジェットを1つ決めること',
    buyOrder: ['主役にしたいガジェット', '見せる収納', '電源まわり', 'サブ機材', 'レビュー用メモ環境'],
    avoid: ['目的が同じ機材の買い増し', '置き場所を決めない購入', '初期設定が重いものの積み上げ'],
    recommendedCategories: ['新製品', 'スマホ', 'AIモデル', 'デスク小物'],
    relatedLinks: [
      { label: 'スマホ比較を見る', href: '/tools/smartphone-compare' },
      { label: 'AIモデル比較を見る', href: '/tools/ai-model-compare' },
    ],
    imagePath: '/images/tools/future-desk-diagnosis/romance-hunter.jpeg',
    imagePrompt: 'A cute gadget lover experimental desk illustration, warm orange accents, playful unique gadgets, display shelves, charming personality quiz result card style, modern and whimsical, no text',
  },
]
