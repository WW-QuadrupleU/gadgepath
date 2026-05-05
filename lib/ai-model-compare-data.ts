export type AiGenreId =
  | 'overall'
  | 'research'
  | 'writing'
  | 'coding'
  | 'analysis'
  | 'image'
  | 'video'
  | 'cost'

export type AiGenre = {
  id: AiGenreId
  label: string
  shortLabel: string
  description: string
  primaryMetrics: string[]
}

export type AiModel = {
  id: string
  name: string
  creator: string
  family: string
  releaseLabel: string
  modality: 'LLM' | 'Image' | 'Video'
  accessType: 'Proprietary' | 'Open weights' | 'Specialized'
  costLevel: 1 | 2 | 3 | 4 | 5
  speed: number
  japanese: number
  context: number
  benchmarkNote?: string
  scores: Record<AiGenreId, number>
  strengths: string[]
  cautions: string[]
  bestFor: string
  avoidFor: string
  note: string
}

export const AI_GENRES: AiGenre[] = [
  {
    id: 'overall',
    label: '総合性能',
    shortLabel: '総合',
    description:
      '推論、知識、指示追従、安定性を横断した総合的な使いやすさの目安です。',
    primaryMetrics: ['推論力', '指示追従', '安定性', '対応範囲'],
  },
  {
    id: 'research',
    label: 'リサーチ・情報整理',
    shortLabel: 'リサーチ',
    description:
      '情報収集、出典確認、比較検討、長い資料の整理に向くかを評価します。',
    primaryMetrics: ['情報整理', '出典確認', '長文読解', '比較検討'],
  },
  {
    id: 'writing',
    label: '文章作成・記事改善',
    shortLabel: '文章',
    description:
      '日本語の自然さ、構成力、編集、トーン調整のしやすさを評価します。',
    primaryMetrics: ['日本語品質', '構成力', '編集力', '表現調整'],
  },
  {
    id: 'coding',
    label: 'コード・開発補助',
    shortLabel: 'コード',
    description:
      '実装、デバッグ、設計相談、既存コード読解に向くかを評価します。',
    primaryMetrics: ['実装力', 'デバッグ', '設計相談', 'コード読解'],
  },
  {
    id: 'analysis',
    label: 'データ分析・表計算',
    shortLabel: '分析',
    description:
      'CSV、表計算、グラフ化、業務データの整理に向くかを評価します。',
    primaryMetrics: ['表処理', '数値整理', 'グラフ化', '業務利用'],
  },
  {
    id: 'image',
    label: '画像生成・デザイン',
    shortLabel: '画像',
    description:
      '画像生成、サムネイル、記事用ビジュアル、デザイン案の作りやすさを評価します。',
    primaryMetrics: ['画質', '編集性', '文字入れ', '商用運用'],
  },
  {
    id: 'video',
    label: '動画生成・映像制作',
    shortLabel: '動画',
    description:
      '短尺動画、Bロール、SNS向け動画制作への向き不向きを評価します。',
    primaryMetrics: ['映像品質', '操作性', '編集連携', '素材化'],
  },
  {
    id: 'cost',
    label: 'コスパ・速度',
    shortLabel: 'コスパ',
    description:
      '応答速度、価格、日常利用の続けやすさを重視した評価です。',
    primaryMetrics: ['価格', '速度', '軽さ', '日常利用'],
  },
]

export const AI_MODELS: AiModel[] = [
  {
    id: 'gpt-5-4',
    name: 'GPT-5.4',
    creator: 'OpenAI',
    family: 'GPT',
    releaseLabel: '高性能モデル',
    modality: 'LLM',
    accessType: 'Proprietary',
    costLevel: 4,
    speed: 82,
    japanese: 92,
    context: 90,
    benchmarkNote: '公開ベンチマークを参考にした上位汎用モデル枠',
    scores: {
      overall: 98,
      research: 91,
      writing: 93,
      coding: 94,
      analysis: 95,
      image: 84,
      video: 70,
      cost: 72,
    },
    strengths: ['推論、コード、分析の総合力が高い', '日本語の業務文や記事編集に使いやすい', 'ツール利用や表処理との相性がよい'],
    cautions: ['高性能設定ではコストや待ち時間が重くなりやすい', '最新情報は検索や出典確認と組み合わせたい'],
    bestFor: '記事改善、コード、分析、企画整理を1つのモデルで広く扱いたい人。',
    avoidFor: '低コストで大量処理だけを回したい用途。',
    note: '総合型の基準モデルとして比較しやすい枠です。',
  },
  {
    id: 'gpt-5-3-codex',
    name: 'GPT-5.3 Codex',
    creator: 'OpenAI',
    family: 'GPT Codex',
    releaseLabel: '開発向けモデル',
    modality: 'LLM',
    accessType: 'Proprietary',
    costLevel: 4,
    speed: 76,
    japanese: 86,
    context: 88,
    benchmarkNote: 'コード作業を重視した用途別評価',
    scores: {
      overall: 94,
      research: 82,
      writing: 84,
      coding: 98,
      analysis: 88,
      image: 50,
      video: 35,
      cost: 68,
    },
    strengths: ['実装、修正、レビューに強い', '既存コードの読解で使いやすい', '開発エージェント用途に向く'],
    cautions: ['文章作成や調査だけなら汎用モデルで十分な場合がある', '軽作業にはやや過剰になりやすい'],
    bestFor: '開発、デバッグ、コードレビュー、実装エージェント用途。',
    avoidFor: '画像生成、動画生成、短い雑談や軽い要約。',
    note: 'コード中心の作業に寄せた比較枠です。',
  },
  {
    id: 'claude-opus-4-6',
    name: 'Claude Opus 4.6',
    creator: 'Anthropic',
    family: 'Claude Opus',
    releaseLabel: '高性能モデル',
    modality: 'LLM',
    accessType: 'Proprietary',
    costLevel: 4,
    speed: 74,
    japanese: 93,
    context: 94,
    benchmarkNote: '長文処理と文章編集を重視した上位枠',
    scores: {
      overall: 94,
      research: 86,
      writing: 96,
      coding: 93,
      analysis: 88,
      image: 42,
      video: 30,
      cost: 64,
    },
    strengths: ['長文編集と文章品質が高い', '複雑な指示や文脈を保ちやすい', '資料読解から記事改善までつなげやすい'],
    cautions: ['画像や動画生成は別ツールが必要', '高性能モデルはコスト感に注意'],
    bestFor: '記事改善、リライト、長文資料の整理、慎重な文章作成。',
    avoidFor: '画像や動画制作まで1つのモデルで完結させたい人。',
    note: '編集者寄りの作業に強いモデルとして比較しやすい枠です。',
  },
  {
    id: 'claude-sonnet-4-6',
    name: 'Claude Sonnet 4.6',
    creator: 'Anthropic',
    family: 'Claude Sonnet',
    releaseLabel: '標準モデル',
    modality: 'LLM',
    accessType: 'Proprietary',
    costLevel: 3,
    speed: 84,
    japanese: 92,
    context: 92,
    benchmarkNote: '品質と速度のバランス枠',
    scores: {
      overall: 92,
      research: 84,
      writing: 94,
      coding: 91,
      analysis: 86,
      image: 38,
      video: 25,
      cost: 78,
    },
    strengths: ['文章とコードのバランスがよい', '日常利用で品質と速度を両立しやすい', '長文編集にも向く'],
    cautions: ['最上位推論ではOpusやGPT上位と比較したい', '画像生成は別ツールが必要'],
    bestFor: '記事制作、リライト、コード相談、日常的な業務利用。',
    avoidFor: '最高性能だけを追う比較や画像生成中心の用途。',
    note: '毎日使う標準モデルとして候補にしやすい枠です。',
  },
  {
    id: 'gemini-pro',
    name: 'Gemini Pro',
    creator: 'Google',
    family: 'Gemini',
    releaseLabel: '高性能モデル',
    modality: 'LLM',
    accessType: 'Proprietary',
    costLevel: 3,
    speed: 88,
    japanese: 88,
    context: 95,
    benchmarkNote: '長文とGoogle系連携を重視した評価',
    scores: {
      overall: 96,
      research: 94,
      writing: 87,
      coding: 90,
      analysis: 91,
      image: 76,
      video: 72,
      cost: 82,
    },
    strengths: ['リサーチと長い資料整理に強い', 'Google系サービスとの組み合わせを考えやすい', 'マルチモーダル用途に広げやすい'],
    cautions: ['モデル名や提供条件が更新されやすい', '文章の仕上げは好みが分かれる場合がある'],
    bestFor: 'リサーチ、資料整理、長文読解、Google環境中心の作業。',
    avoidFor: '落ち着いた日本語記事の最終仕上げだけを重視する用途。',
    note: '長文コンテキストと調査寄りの比較で強い枠です。',
  },
  {
    id: 'gemini-flash',
    name: 'Gemini Flash',
    creator: 'Google',
    family: 'Gemini',
    releaseLabel: '高速モデル',
    modality: 'LLM',
    accessType: 'Proprietary',
    costLevel: 2,
    speed: 94,
    japanese: 82,
    context: 88,
    benchmarkNote: '速度とコストを重視した軽量枠',
    scores: {
      overall: 82,
      research: 82,
      writing: 78,
      coding: 78,
      analysis: 83,
      image: 66,
      video: 60,
      cost: 91,
    },
    strengths: ['速くて軽い用途に向く', '要約や分類を大量に回しやすい', '長めの文脈も扱いやすい'],
    cautions: ['難しい推論や最終文章の品質では上位モデルと差が出やすい', '重要判断は上位モデルで確認したい'],
    bestFor: '要約、分類、下書き、軽い資料整理、大量処理。',
    avoidFor: '公開前の記事最終校正や難しい設計判断。',
    note: 'コスパ重視で使いやすい高速枠です。',
  },
  {
    id: 'grok',
    name: 'Grok',
    creator: 'xAI',
    family: 'Grok',
    releaseLabel: 'リアルタイム寄り',
    modality: 'LLM',
    accessType: 'Proprietary',
    costLevel: 3,
    speed: 86,
    japanese: 78,
    context: 82,
    benchmarkNote: 'トレンド確認を重視した用途別評価',
    scores: {
      overall: 84,
      research: 84,
      writing: 76,
      coding: 78,
      analysis: 76,
      image: 48,
      video: 35,
      cost: 76,
    },
    strengths: ['リアルタイム寄りの情報収集と相性がよい', 'SNS文脈の把握に使いやすい', '軽い調査に向く'],
    cautions: ['日本語記事の仕上げは別モデルで整えたい', '情報の正確性は出典確認が必要'],
    bestFor: 'SNS、ニュース、トレンド確認を重視する人。',
    avoidFor: '落ち着いた日本語記事の最終原稿作成。',
    note: 'トレンド調査枠として比較しやすいモデルです。',
  },
  {
    id: 'perplexity-sonar',
    name: 'Perplexity Sonar',
    creator: 'Perplexity',
    family: 'Sonar',
    releaseLabel: '検索特化',
    modality: 'LLM',
    accessType: 'Specialized',
    costLevel: 3,
    speed: 84,
    japanese: 82,
    context: 84,
    benchmarkNote: '出典付き検索を重視した用途別評価',
    scores: {
      overall: 82,
      research: 95,
      writing: 76,
      coding: 72,
      analysis: 78,
      image: 35,
      video: 25,
      cost: 80,
    },
    strengths: ['出典付きの調査に使いやすい', '最新情報の入口として便利', '比較検討の初動に強い'],
    cautions: ['記事本文の仕上げは別モデルで整えたい', '出典の質は毎回確認が必要'],
    bestFor: 'リサーチ、情報確認、競合調査、引用元探し。',
    avoidFor: '長文記事の最終ライティングや複雑な実装作業。',
    note: '調査の入口として置きやすい検索特化枠です。',
  },
  {
    id: 'midjourney-v7',
    name: 'Midjourney v7',
    creator: 'Midjourney',
    family: 'Midjourney',
    releaseLabel: '画像生成',
    modality: 'Image',
    accessType: 'Specialized',
    costLevel: 3,
    speed: 76,
    japanese: 45,
    context: 34,
    scores: {
      overall: 55,
      research: 15,
      writing: 20,
      coding: 10,
      analysis: 10,
      image: 96,
      video: 55,
      cost: 68,
    },
    strengths: ['雰囲気のある画像を作りやすい', '記事ヒーローやサムネイル案に向く', '画作りの品質感が高い'],
    cautions: ['文章作成やリサーチには向かない', '商用利用や実在商品に似せる表現は注意が必要'],
    bestFor: '高品質な画像、サムネイル、記事用ビジュアルを作りたい人。',
    avoidFor: '調査、記事作成、コード補助まで1モデルで済ませたい人。',
    note: '画像生成に特化した専門枠です。',
  },
  {
    id: 'runway-gen-4',
    name: 'Runway Gen-4',
    creator: 'Runway',
    family: 'Runway',
    releaseLabel: '動画生成',
    modality: 'Video',
    accessType: 'Specialized',
    costLevel: 4,
    speed: 62,
    japanese: 38,
    context: 30,
    scores: {
      overall: 50,
      research: 12,
      writing: 18,
      coding: 8,
      analysis: 8,
      image: 78,
      video: 96,
      cost: 52,
    },
    strengths: ['短尺動画やBロール生成に向く', 'SNS向け素材を作りやすい', '画像から動画への展開に使いやすい'],
    cautions: ['汎用チャットAIではない', '商品や人物を正確に再現する用途では確認が必要'],
    bestFor: '短尺動画、映像素材、SNS向けの動くビジュアルを作りたい人。',
    avoidFor: '文章作成、調査、業務文書を主目的にする人。',
    note: '動画生成に特化した専門枠です。',
  },
]

export const AI_COMPARE_NOTE =
  '本ツールはArtificial Analysisなどの公開ベンチマーク情報を参考に、ガジェパス独自の用途別スコアとして再整理しています。AIモデルは更新が速いため、契約前に公式ページで最新機能、料金、商用利用条件、データ利用設定を確認してください。'
