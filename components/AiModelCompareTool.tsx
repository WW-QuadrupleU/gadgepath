'use client'

import { useMemo, useState } from 'react'
import {
  AI_COMPARE_NOTE,
  AI_GENRES,
  AI_MODELS,
  type AiGenreId,
  type AiModel,
} from '@/lib/ai-model-compare-data'

function scoreTone(score: number): string {
  if (score >= 90) return 'bg-brand-green'
  if (score >= 80) return 'bg-sky-500'
  if (score >= 70) return 'bg-amber-500'
  return 'bg-gray-400'
}

function costLabel(level: number): string {
  return ['低め', 'やや低め', '標準', '高め', 'かなり高め'][level - 1] || '標準'
}

function percent(score: number): number {
  return Math.max(6, Math.min(100, score))
}

function bestUse(model: AiModel): string {
  const sorted = Object.entries(model.scores)
    .filter(([id]) => id !== 'overall')
    .sort((a, b) => b[1] - a[1])
    .slice(0, 2)
    .map(([id]) => AI_GENRES.find((genre) => genre.id === id)?.shortLabel)
    .filter(Boolean)
  return sorted.join(' / ')
}

function ModelSelect({
  label,
  value,
  onChange,
}: {
  label: string
  value: string
  onChange: (value: string) => void
}) {
  const groups = AI_MODELS.reduce<Record<string, AiModel[]>>((acc, model) => {
    acc[model.family] = [...(acc[model.family] || []), model]
    return acc
  }, {})

  return (
    <label className="block">
      <span className="mb-1 block text-xs font-bold text-gray-500">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-bold text-brand-text outline-none transition-colors focus:border-brand-green"
      >
        {Object.entries(groups).map(([family, models]) => (
          <optgroup key={family} label={family}>
            {models.map((model) => (
              <option key={model.id} value={model.id}>
                {model.name}
              </option>
            ))}
          </optgroup>
        ))}
      </select>
    </label>
  )
}

function ScoreBar({ label, score }: { label: string; score: number }) {
  return (
    <div>
      <div className="mb-1 flex items-center justify-between gap-3">
        <span className="text-xs font-bold text-gray-500">{label}</span>
        <span className="text-xs font-black text-brand-text">{score}</span>
      </div>
      <div className="h-2.5 overflow-hidden rounded-full bg-gray-100">
        <div className={`h-full rounded-full ${scoreTone(score)}`} style={{ width: `${percent(score)}%` }} />
      </div>
    </div>
  )
}

function MiniStat({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-md bg-gray-50 px-2 py-2 text-center">
      <p className="text-[10px] font-bold text-gray-400">{label}</p>
      <p className="mt-0.5 font-black text-brand-text">{value}</p>
    </div>
  )
}

function RankingCard({ model, genreId, rank }: { model: AiModel; genreId: AiGenreId; rank: number }) {
  const score = model.scores[genreId]

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-black text-brand-green">#{rank} {model.family}</p>
          <h3 className="text-lg font-extrabold text-brand-text">{model.name}</h3>
          <p className="text-xs text-gray-400">{model.creator} / {model.releaseLabel}</p>
        </div>
        <div className="rounded-lg bg-brand-dark px-3 py-2 text-center text-white">
          <p className="text-[10px] font-bold text-gray-300">SCORE</p>
          <p className="text-xl font-black">{score}</p>
        </div>
      </div>
      <ScoreBar label="選択ジャンル適性" score={score} />
      <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
        <MiniStat label="速度" value={model.speed} />
        <MiniStat label="日本語" value={model.japanese} />
        <MiniStat label="文脈" value={model.context} />
      </div>
      <p className="mt-3 text-sm leading-relaxed text-gray-600">{model.bestFor}</p>
      <p className="mt-2 text-xs leading-relaxed text-gray-400">{model.note}</p>
    </div>
  )
}

function TextPanel({ title, items, tone }: { title: string; items: string[]; tone: 'green' | 'amber' }) {
  return (
    <div className={`rounded-lg border p-3 ${tone === 'green' ? 'border-brand-green/30 bg-brand-green/5' : 'border-amber-200 bg-amber-50'}`}>
      <p className="mb-2 text-xs font-black text-brand-text">{title}</p>
      <ul className="space-y-1 text-xs leading-relaxed text-gray-600">
        {items.map((item) => (
          <li key={item}>・{item}</li>
        ))}
      </ul>
    </div>
  )
}

function ModelSummary({ model }: { model: AiModel }) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-black text-brand-green">{model.creator} / {model.family}</p>
          <h3 className="text-lg font-extrabold text-brand-text">{model.name}</h3>
          <p className="mt-1 text-xs text-gray-400">
            得意: {bestUse(model)} / コスト感: {costLabel(model.costLevel)}
          </p>
          {model.benchmarkNote && (
            <p className="mt-2 text-xs leading-relaxed text-gray-500">{model.benchmarkNote}</p>
          )}
        </div>
      </div>
      <div className="grid gap-3">
        {AI_GENRES.map((genre) => (
          <ScoreBar key={genre.id} label={genre.shortLabel} score={model.scores[genre.id]} />
        ))}
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <TextPanel title="強み" items={model.strengths} tone="green" />
        <TextPanel title="注意点" items={model.cautions} tone="amber" />
      </div>
      <div className="mt-4 rounded-lg bg-gray-50 p-3 text-xs leading-relaxed text-gray-500">
        <span className="font-bold text-brand-text">向いている人：</span>{model.bestFor}
        <br />
        <span className="font-bold text-brand-text">向きにくい人：</span>{model.avoidFor}
      </div>
    </div>
  )
}

export default function AiModelCompareTool() {
  const [genreId, setGenreId] = useState<AiGenreId>('research')
  const [firstId, setFirstId] = useState('gpt-5-4')
  const [secondId, setSecondId] = useState('claude-opus-4-6')

  const genre = AI_GENRES.find((item) => item.id === genreId) ?? AI_GENRES[0]
  const ranking = useMemo(
    () => [...AI_MODELS].sort((a, b) => b.scores[genreId] - a.scores[genreId]),
    [genreId]
  )
  const first = AI_MODELS.find((model) => model.id === firstId) ?? AI_MODELS[0]
  const second = AI_MODELS.find((model) => model.id === secondId) ?? AI_MODELS[1]
  const winner =
    first.scores[genreId] === second.scores[genreId]
      ? 'ほぼ同等'
      : first.scores[genreId] > second.scores[genreId]
        ? first.name
        : second.name

  return (
    <div className="space-y-8">
      <section className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="mb-4">
          <p className="text-xs font-black text-brand-green">Model Ranking</p>
          <h2 className="text-xl font-extrabold text-brand-text">用途を選んでAIモデルの向き不向きを見る</h2>
          <p className="mt-2 text-sm leading-relaxed text-gray-500">{genre.description}</p>
        </div>
        <div className="grid gap-2 sm:grid-cols-4">
          {AI_GENRES.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setGenreId(item.id)}
              className={`rounded-lg border px-3 py-2 text-left text-xs font-black transition-all ${
                genreId === item.id
                  ? 'border-brand-green bg-brand-green text-white shadow-sm'
                  : 'border-gray-200 bg-white text-gray-500 hover:border-brand-green hover:text-brand-text'
              }`}
            >
              {item.shortLabel}
            </button>
          ))}
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {genre.primaryMetrics.map((metric) => (
            <span key={metric} className="rounded-full bg-gray-100 px-3 py-1 text-xs font-bold text-gray-500">
              {metric}
            </span>
          ))}
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        {ranking.slice(0, 3).map((model, index) => (
          <RankingCard key={model.id} model={model} genreId={genreId} rank={index + 1} />
        ))}
      </section>

      <section className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="flex-1">
            <ModelSelect label="比較するモデル 1" value={firstId} onChange={setFirstId} />
          </div>
          <div className="flex-1">
            <ModelSelect label="比較するモデル 2" value={secondId} onChange={setSecondId} />
          </div>
          <div className="rounded-lg bg-brand-dark px-4 py-3 text-white sm:w-44">
            <p className="text-[10px] font-bold text-gray-300">選択ジャンルの優位</p>
            <p className="text-sm font-black">{winner}</p>
          </div>
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          <ModelSummary model={first} />
          <ModelSummary model={second} />
        </div>
      </section>

      <section className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <h2 className="text-lg font-extrabold text-brand-text">全モデルの用途別スコア</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[860px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-gray-200 text-left text-xs text-gray-400">
                <th className="py-2 pr-3">モデル</th>
                {AI_GENRES.map((item) => (
                  <th key={item.id} className="px-3 py-2 text-right">{item.shortLabel}</th>
                ))}
                <th className="px-3 py-2 text-right">コスト</th>
              </tr>
            </thead>
            <tbody>
              {AI_MODELS.map((model) => (
                <tr key={model.id} className="border-b border-gray-100">
                  <td className="py-3 pr-3">
                    <p className="font-black text-brand-text">{model.name}</p>
                    <p className="text-xs text-gray-400">{model.creator} / {model.releaseLabel}</p>
                  </td>
                  {AI_GENRES.map((item) => (
                    <td key={item.id} className="px-3 py-3 text-right font-bold text-brand-text">
                      {model.scores[item.id]}
                    </td>
                  ))}
                  <td className="px-3 py-3 text-right text-xs font-bold text-gray-500">{costLabel(model.costLevel)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <p className="rounded-lg bg-gray-100 p-4 text-xs leading-relaxed text-gray-500">
        {AI_COMPARE_NOTE}{' '}
        参考データ元：
        <a
          href="https://artificialanalysis.ai/"
          target="_blank"
          rel="noopener noreferrer"
          className="font-bold text-brand-green underline underline-offset-2"
        >
          Artificial Analysis
        </a>
      </p>
    </div>
  )
}
