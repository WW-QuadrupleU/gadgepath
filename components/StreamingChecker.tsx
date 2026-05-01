"use client";

import { useState } from "react";
import Link from "next/link";
import type { Product } from "@/lib/notion";
import ProductComparisonTable from "@/components/ProductComparisonTable";

// ── 選択肢データ ──────────────────────────────────────────

const STEPS = [
  {
    key: "use",
    question: "主な用途を教えてください",
    options: [
      { id: "youtube", emoji: "🎬", label: "YouTube / 動画投稿", desc: "編集して投稿するコンテンツ制作" },
      { id: "gaming", emoji: "🎮", label: "ゲーム配信", desc: "Twitch・YouTube Live などのライブ配信" },
      { id: "work",   emoji: "💼", label: "テレワーク / 会議", desc: "Zoom・Teams・商談・オンライン授業" },
      { id: "sns",    emoji: "📱", label: "TikTok / SNS", desc: "ショート動画・縦型コンテンツ" },
    ],
  },
  {
    key: "problem",
    question: "今一番困っていることは？",
    options: [
      { id: "video", emoji: "📷", label: "映像が悪い", desc: "内蔵カメラが貧弱・画質が荒い" },
      { id: "audio", emoji: "🎤", label: "音が悪い",   desc: "ノイズが入る・声がこもる・音割れ" },
      { id: "dark",  emoji: "💡", label: "顔が暗い",   desc: "照明不足・逆光で顔が見えにくい" },
      { id: "perf",  emoji: "💻", label: "PCが重い",   desc: "コマ落ち・録画が止まる・配信が落ちる" },
      { id: "ports", emoji: "🔌", label: "ポートが足りない", desc: "機材が増えてUSBが足りない" },
    ],
  },
  {
    key: "budget",
    question: "予算の目安を教えてください",
    options: [
      { id: "low",  emoji: "💴", label: "〜1万円",    desc: "まずお試しで始めたい" },
      { id: "mid",  emoji: "💰", label: "1〜3万円",   desc: "しっかり揃えたい" },
      { id: "high", emoji: "💎", label: "3万円以上",  desc: "本格的に投資したい" },
    ],
  },
];

// ── 推薦ロジック ──────────────────────────────────────────

type Rec = {
  priority: "main" | "sub";
  emoji: string;
  category: string;
  title: string;
  reason: string;
  articleSlug: string;
  articleLabel: string;
};

type Props = {
  products: Product[];
};

function getComparisonProducts(recs: Rec[], products: Product[]): Product[] {
  const articleSlugs = new Set(recs.map((rec) => rec.articleSlug));
  const categories = new Set(recs.map((rec) => rec.category));
  const seen = new Set<string>();

  return products.filter((product) => {
    const isRelated =
      product.articleSlugs.some((slug) => articleSlugs.has(slug)) ||
      categories.has(product.category);

    if (!isRelated || seen.has(product.id)) {
      return false;
    }

    seen.add(product.id);
    return true;
  });
}

function getRecommendations(use: string, problem: string, budget: string): Rec[] {
  const recs: Rec[] = [];

  // ── メイン推薦（困りごと起点） ──
  if (problem === "audio") {
    const title =
      budget === "low" ? "エントリーUSBマイク（〜1万円）" :
      budget === "mid" ? "コンデンサーマイク（1〜3万円）" : "高品質コンデンサーマイク";
    recs.push({
      priority: "main", emoji: "🎤", category: "マイク", title,
      reason: "音質は視聴者が最も敏感に感じる要素です。ノイズや音割れは視聴離脱の直接原因になります。まずマイクを改善するのが最優先です。",
      articleSlug: "microphone-guide-2026",
      articleLabel: "マイク比較記事を読む",
    });
  }

  if (problem === "video") {
    const title =
      budget === "low"  ? "エントリーWebカメラ（Logicool C270n など）" :
      budget === "mid"  ? "ミドルレンジWebカメラ（Elgato Facecam など）" :
                          "ミラーレス一眼 ＋ キャプチャーボード";
    recs.push({
      priority: "main", emoji: "📷", category: "カメラ", title,
      reason: "内蔵カメラからWebカメラに替えるだけで映像品質が劇的に改善します。予算が許せばミラーレス一眼という選択肢も。",
      articleSlug: "webcam-comparison-2026",
      articleLabel: "Webカメラ比較記事を読む",
    });
  }

  if (problem === "dark") {
    recs.push({
      priority: "main", emoji: "💡", category: "照明", title: "リングライト / キーライト",
      reason: "実はカメラより照明の方が映像品質への影響が大きいです。1灯追加するだけで別人のように明るく映ります。",
      articleSlug: "lighting-comparison-2026",
      articleLabel: "照明比較記事を読む",
    });
  }

  if (problem === "perf") {
    if (use === "gaming") {
      recs.push({
        priority: "main", emoji: "🎥", category: "キャプチャーボード", title: "外部キャプチャーボード",
        reason: "ゲーム配信でPCが重い場合、キャプチャーボードでエンコード処理をオフロードすると大幅改善します。",
        articleSlug: "capture-board-comparison-2026",
        articleLabel: "キャプチャーボード比較を読む",
      });
    } else {
      recs.push({
        priority: "main", emoji: "💾", category: "SSD・ストレージ", title: "高速ポータブルSSD",
        reason: "録画データの書き込みが間に合わずコマ落ちが起きている可能性があります。高速SSDへの変更で解決するケースが多いです。",
        articleSlug: "portable-ssd-comparison-2026",
        articleLabel: "SSD比較記事を読む",
      });
    }
  }

  if (problem === "ports") {
    const title =
      budget === "high" ? "Thunderbolt 4ドッキングステーション" :
      budget === "mid"  ? "マルチポートUSBハブ（10ポート以上）" : "コンパクトUSBハブ";
    recs.push({
      priority: "main", emoji: "🔌", category: "USBハブ", title,
      reason: "機材が増えると必ずポート不足になります。帯域（Gen1/Gen2/Thunderbolt）を考慮したハブ選びが重要です。",
      articleSlug: "usb-hub-comparison-2026",
      articleLabel: "USBハブ比較記事を読む",
    });
  }

  // ── サブ推薦（用途起点） ──
  if (use === "gaming" && problem !== "audio") {
    recs.push({
      priority: "sub", emoji: "🎧", category: "ヘッドセット", title: "ゲーミングヘッドセット",
      reason: "ゲーム配信ではチームとの通話・ゲーム音の確認にヘッドセットが必須です。マイク内蔵モデルなら機材をまとめられます。",
      articleSlug: "headset-comparison-2026",
      articleLabel: "ヘッドセット比較記事を読む",
    });
  }

  if (use === "work" && problem !== "audio") {
    recs.push({
      priority: "sub", emoji: "🎤", category: "マイク", title: "外部マイク（テレワーク向け）",
      reason: "ビジネス商談では声の明瞭さが信頼感に直結します。内蔵マイクから外部マイクへの変更は費用対効果が高いです。",
      articleSlug: "streaming-microphone-recommend",
      articleLabel: "配信マイク記事を読む",
    });
  }

  if ((use === "youtube" || use === "sns") && problem !== "dark") {
    recs.push({
      priority: "sub", emoji: "💡", category: "照明", title: "リングライト（サブ推薦）",
      reason: "動画・SNSコンテンツでは照明が視聴者の第一印象を左右します。安価なリングライト1灯で一気にプロらしい映像になります。",
      articleSlug: "lighting-comparison-2026",
      articleLabel: "照明比較記事を読む",
    });
  }

  return recs;
}

// ── メインコンポーネント ──────────────────────────────────

export default function StreamingChecker({ products }: Props) {
  const [step, setStep]       = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);

  const isResult = step === STEPS.length;
  const current  = STEPS[step];

  function select(optionId: string) {
    const next = [...answers, optionId];
    setAnswers(next);
    setStep(step + 1);
  }

  function reset() {
    setAnswers([]);
    setStep(0);
  }

  // 結果画面
  if (isResult) {
    const [use, problem, budget] = answers;
    const recs = getRecommendations(use, problem, budget);
    const mainRecs = recs.filter((r) => r.priority === "main");
    const subRecs  = recs.filter((r) => r.priority === "sub");
    const comparisonProducts = getComparisonProducts(recs, products);

    return (
      <div className="w-full max-w-2xl mx-auto">
        {/* 結果ヘッダー */}
        <div className="bg-gradient-to-br from-brand-green/10 to-emerald-50 border border-brand-green/20 rounded-2xl p-6 mb-6 text-center">
          <p className="text-brand-green font-bold text-sm mb-1">診断完了</p>
          <h2 className="text-xl font-extrabold text-brand-text">あなたへのおすすめ機材</h2>
        </div>

        {/* メイン推薦 */}
        <div className="space-y-4 mb-6">
          {mainRecs.map((rec) => (
            <div key={rec.category} className="bg-white border-2 border-brand-green rounded-2xl p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <span className="bg-brand-green text-white text-xs font-black px-2.5 py-1 rounded-full">最優先</span>
                <span className="text-lg font-bold text-brand-text">{rec.emoji} {rec.category}</span>
              </div>
              <p className="font-bold text-brand-text mb-1">{rec.title}</p>
              <p className="text-sm text-gray-500 leading-relaxed mb-4">{rec.reason}</p>
              <div className="flex flex-wrap gap-2">
                <Link
                  href={`/articles/${rec.articleSlug}`}
                  className="inline-flex items-center gap-1 bg-brand-green text-white text-xs font-bold px-4 py-2 rounded-full hover:bg-brand-green/80 transition-colors"
                >
                  📖 {rec.articleLabel}
                </Link>
                <Link
                  href={`/tools/gear-finder`}
                  className="inline-flex items-center gap-1 border border-brand-green text-brand-green text-xs font-bold px-4 py-2 rounded-full hover:bg-brand-green/10 transition-colors"
                >
                  🔍 機材検索で探す
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* サブ推薦 */}
        <ProductComparisonTable
          products={comparisonProducts}
          maxItems={8}
          className="mb-8"
        />

        {subRecs.length > 0 && (
          <div className="space-y-3 mb-8">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">あわせて検討したい機材</p>
            {subRecs.map((rec) => (
              <div key={rec.category} className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-base">{rec.emoji}</span>
                  <span className="font-bold text-sm text-brand-text">{rec.category}：{rec.title}</span>
                </div>
                <p className="text-xs text-gray-500 leading-relaxed mb-3">{rec.reason}</p>
                <Link
                  href={`/articles/${rec.articleSlug}`}
                  className="text-xs text-brand-green font-bold hover:underline"
                >
                  → {rec.articleLabel}
                </Link>
              </div>
            ))}
          </div>
        )}

        {/* やり直し */}
        <div className="text-center">
          <button
            onClick={reset}
            className="text-sm text-gray-400 hover:text-brand-green transition-colors underline underline-offset-2"
          >
            ← 最初からやり直す
          </button>
        </div>
      </div>
    );
  }

  // 質問画面
  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* プログレスバー */}
      <div className="mb-8">
        <div className="flex justify-between text-xs text-gray-400 mb-2 font-medium">
          <span>質問 {step + 1} / {STEPS.length}</span>
          <span>{Math.round(((step) / STEPS.length) * 100)}%</span>
        </div>
        <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-brand-green rounded-full transition-all duration-500"
            style={{ width: `${(step / STEPS.length) * 100}%` }}
          />
        </div>
      </div>

      {/* 質問 */}
      <h2 className="text-xl font-extrabold text-brand-text mb-6 text-center">{current.question}</h2>

      {/* 選択肢 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {current.options.map((opt) => (
          <button
            key={opt.id}
            onClick={() => select(opt.id)}
            className="flex items-start gap-3 bg-white border-2 border-gray-200 rounded-xl p-4 text-left hover:border-brand-green hover:bg-brand-green/5 hover:shadow-md transition-all duration-200 group"
          >
            <span className="text-2xl leading-none mt-0.5">{opt.emoji}</span>
            <div>
              <p className="font-bold text-brand-text text-sm group-hover:text-brand-green transition-colors">{opt.label}</p>
              <p className="text-xs text-gray-400 mt-0.5 leading-snug">{opt.desc}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
