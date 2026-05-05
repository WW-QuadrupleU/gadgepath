export type AiGenreId =
  | 'research'
  | 'writing'
  | 'coding'
  | 'analysis'
  | 'image'
  | 'video'
  | 'meeting'
  | 'study'

export type AiGenre = {
  id: AiGenreId
  label: string
  shortLabel: string
  description: string
  primaryMetrics: string[]
}

export type AiService = {
  id: string
  name: string
  provider: string
  category: '汎用AI' | '検索AI' | '業務AI' | '学習AI' | '画像AI' | '動画AI'
  costLevel: 1 | 2 | 3 | 4 | 5
  speed: number
  japanese: number
  context: number
  scores: Record<AiGenreId, number>
  strengths: string[]
  cautions: string[]
  bestFor: string
  avoidFor: string
  note: string
}

export const AI_GENRES: AiGenre[] = [
  {
    id: 'research',
    label: 'リサーチ・出典確認',
    shortLabel: 'リサーチ',
    description: 'Web調査、出典付き回答、比較検討、最新情報の整理に向くかを評価します。',
    primaryMetrics: ['出典確認', '情報整理', '最新性', '要約精度'],
  },
  {
    id: 'writing',
    label: '文章作成・記事改善',
    shortLabel: '文章作成',
    description: '日本語の自然さ、構成力、長文編集、トーン調整のしやすさを評価します。',
    primaryMetrics: ['日本語品質', '構成力', '長文編集', '表現調整'],
  },
  {
    id: 'coding',
    label: 'コード・開発補助',
    shortLabel: 'コード',
    description: '実装、デバッグ、設計相談、既存コード読解に向くかを評価します。',
    primaryMetrics: ['実装力', 'デバッグ', '設計相談', 'コード読解'],
  },
  {
    id: 'analysis',
    label: 'データ分析・表計算',
    shortLabel: '分析',
    description: 'CSV、表計算、グラフ化、業務データの整理に向くかを評価します。',
    primaryMetrics: ['表処理', 'グラフ化', '数値整理', '業務利用'],
  },
  {
    id: 'image',
    label: '画像生成・デザイン',
    shortLabel: '画像',
    description: '画像生成、デザイン案、サムネイル、記事用ビジュアルの作りやすさを評価します。',
    primaryMetrics: ['画質', '編集性', '文字入れ', '商用運用'],
  },
  {
    id: 'video',
    label: '動画生成・映像制作',
    shortLabel: '動画',
    description: '短尺動画、Bロール、映像素材、SNS向け動画制作への向き不向きを評価します。',
    primaryMetrics: ['映像品質', '操作性', '編集連携', '素材化'],
  },
  {
    id: 'meeting',
    label: '議事録・業務効率化',
    shortLabel: '議事録',
    description: '会議要約、メール、資料、社内文書、Microsoft/Google連携のしやすさを評価します。',
    primaryMetrics: ['会議要約', '文書作成', '連携', '導入しやすさ'],
  },
  {
    id: 'study',
    label: '学習・資料理解',
    shortLabel: '学習',
    description: 'PDF、ノート、講義資料、長い文書を理解して学習に使えるかを評価します。',
    primaryMetrics: ['資料理解', '要点整理', '質問対応', '復習しやすさ'],
  },
]

export const AI_SERVICES: AiService[] = [
  {
    id: 'chatgpt',
    name: 'ChatGPT',
    provider: 'OpenAI',
    category: '汎用AI',
    costLevel: 3,
    speed: 86,
    japanese: 90,
    context: 88,
    scores: {
      research: 86,
      writing: 91,
      coding: 90,
      analysis: 92,
      image: 88,
      video: 68,
      meeting: 84,
      study: 88,
    },
    strengths: ['文章、コード、分析、画像まで広く対応', '表やファイルを扱う作業に強い', '初心者でも使い方を覚えやすい'],
    cautions: ['最新情報はブラウズや出典確認の設定に依存', '動画生成は専用サービスと比べて用途を選ぶ'],
    bestFor: '1つのAIで記事作成、調査、表整理、コード相談までまとめたい人。',
    avoidFor: '検索結果の出典確認だけを最優先する人は検索AIも比較したいです。',
    note: '総合型の基準にしやすいAI。迷ったときの最初の比較対象です。',
  },
  {
    id: 'claude',
    name: 'Claude',
    provider: 'Anthropic',
    category: '汎用AI',
    costLevel: 3,
    speed: 82,
    japanese: 91,
    context: 94,
    scores: {
      research: 82,
      writing: 94,
      coding: 88,
      analysis: 84,
      image: 55,
      video: 35,
      meeting: 82,
      study: 90,
    },
    strengths: ['長文読解と自然な文章編集に強い', '記事改善や構成整理に向く', '会話の文脈を保ちやすい'],
    cautions: ['画像・動画生成そのものは主戦場ではない', '検索の最新性は使い方やプランに左右される'],
    bestFor: '記事改善、長文リライト、資料読解、丁寧な日本語の編集を重視する人。',
    avoidFor: '画像生成や動画生成を1サービスで完結させたい人。',
    note: 'ライティングと長文理解で選びやすいAI。編集作業との相性が良いです。',
  },
  {
    id: 'gemini',
    name: 'Gemini',
    provider: 'Google',
    category: '汎用AI',
    costLevel: 3,
    speed: 88,
    japanese: 86,
    context: 93,
    scores: {
      research: 88,
      writing: 84,
      coding: 84,
      analysis: 88,
      image: 86,
      video: 72,
      meeting: 89,
      study: 91,
    },
    strengths: ['Google系サービスとの連携を考えやすい', '長い資料や動画理解に向く場面がある', '検索・学習系の用途で使いやすい'],
    cautions: ['文章の仕上げは好みが分かれる', '業務利用はGoogle Workspace環境かどうかで価値が変わる'],
    bestFor: 'Google Drive、Gmail、Docs、YouTube、検索をよく使う人。',
    avoidFor: '日本語の文体を細かく作り込みたい記事編集だけなら他も比較したいです。',
    note: 'Google環境に寄せるほど便利になるタイプです。',
  },
  {
    id: 'perplexity',
    name: 'Perplexity',
    provider: 'Perplexity',
    category: '検索AI',
    costLevel: 3,
    speed: 90,
    japanese: 82,
    context: 78,
    scores: {
      research: 94,
      writing: 76,
      coding: 74,
      analysis: 70,
      image: 36,
      video: 30,
      meeting: 62,
      study: 82,
    },
    strengths: ['出典付き調査に強い', '比較・ニュース・一次情報確認に使いやすい', '調査の入口として速い'],
    cautions: ['文章の仕上げや深い編集は別AIと併用したい', '出典がある場合でも内容確認は必要'],
    bestFor: '最新情報や出典を見ながら調べたい人。',
    avoidFor: '記事本文を自然な日本語で長く作り込みたい人。',
    note: 'リサーチ特化枠。記事作成では下調べ担当として使いやすいです。',
  },
  {
    id: 'copilot',
    name: 'Microsoft Copilot',
    provider: 'Microsoft',
    category: '業務AI',
    costLevel: 4,
    speed: 84,
    japanese: 84,
    context: 82,
    scores: {
      research: 78,
      writing: 82,
      coding: 78,
      analysis: 85,
      image: 72,
      video: 42,
      meeting: 92,
      study: 78,
    },
    strengths: ['Office、Teams、Outlookとの相性を考えやすい', '社内文書や会議要約で使いやすい', '業務導入の文脈に乗せやすい'],
    cautions: ['個人利用では強みを活かしきれない場合がある', '契約形態や管理設定で使える機能が変わる'],
    bestFor: 'Microsoft 365中心の会社やチーム。',
    avoidFor: '個人の創作や趣味用途だけで使う人。',
    note: '業務効率化・議事録・Office連携で見たいAIです。',
  },
  {
    id: 'notebooklm',
    name: 'NotebookLM',
    provider: 'Google',
    category: '学習AI',
    costLevel: 2,
    speed: 86,
    japanese: 84,
    context: 90,
    scores: {
      research: 82,
      writing: 74,
      coding: 45,
      analysis: 66,
      image: 20,
      video: 28,
      meeting: 72,
      study: 95,
    },
    strengths: ['手元の資料をもとに質問しやすい', '学習、要約、論点整理に強い', '出典元を資料内に限定しやすい'],
    cautions: ['汎用チャットや制作AIではない', '資料を入れてから価値が出る'],
    bestFor: 'PDF、メモ、記事、講義資料を読み込んで学びたい人。',
    avoidFor: '画像生成、コード実装、日常チャットを1つで済ませたい人。',
    note: '資料理解に寄せたAI。学習・リサーチ補助として便利です。',
  },
  {
    id: 'midjourney',
    name: 'Midjourney',
    provider: 'Midjourney',
    category: '画像AI',
    costLevel: 3,
    speed: 78,
    japanese: 55,
    context: 42,
    scores: {
      research: 22,
      writing: 35,
      coding: 20,
      analysis: 15,
      image: 95,
      video: 52,
      meeting: 10,
      study: 18,
    },
    strengths: ['雰囲気のある画像を作りやすい', 'ビジュアル品質が高い', 'サムネイルや世界観作りに向く'],
    cautions: ['文章作成や調査には向かない', '商用利用や権利確認はプランと素材条件を確認したい'],
    bestFor: '高品質なイメージ画像、サムネイル、ビジュアル案を作りたい人。',
    avoidFor: '調査、記事作成、資料読解まで1サービスで済ませたい人。',
    note: '画像生成に寄せた専門枠です。',
  },
  {
    id: 'runway',
    name: 'Runway',
    provider: 'Runway',
    category: '動画AI',
    costLevel: 4,
    speed: 70,
    japanese: 50,
    context: 40,
    scores: {
      research: 20,
      writing: 28,
      coding: 15,
      analysis: 18,
      image: 80,
      video: 94,
      meeting: 12,
      study: 18,
    },
    strengths: ['動画生成・映像素材作りに強い', 'SNS向けの短い映像を試しやすい', '画像から動画への展開に向く'],
    cautions: ['汎用チャットAIではない', '長尺動画や正確な商品表現はまだ確認が必要'],
    bestFor: '短尺動画、Bロール、映像アイデアを作りたい人。',
    avoidFor: '文章作成、リサーチ、業務文書を主目的にする人。',
    note: '動画生成の専門枠。SNS素材作りで比較したいAIです。',
  },
]

export const AI_COMPARE_NOTE =
  'このスコアは公開情報と一般的な利用傾向をもとにしたガジェパス編集部の用途別目安です。AIサービスは更新が速いため、契約前に公式ページで最新機能、料金、商用利用条件、データ利用設定を確認してください。'
