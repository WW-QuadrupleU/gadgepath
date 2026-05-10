'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { DESK_QUESTIONS, DESK_TYPES, type DeskAnswerValue, type DeskType, type DeskTypeId } from '@/lib/future-desk-diagnosis-data'

type Answers = Record<string, DeskAnswerValue>

function getResult(answers: Answers): DeskType {
  const scores = DESK_TYPES.reduce(
    (acc, type) => {
      acc[type.id] = 0
      return acc
    },
    {} as Record<DeskTypeId, number>,
  )

  for (const question of DESK_QUESTIONS) {
    const value = answers[question.id]
    const option = question.options.find((item) => item.value === value)
    if (!option) continue

    for (const [typeId, score] of Object.entries(option.scores)) {
      scores[typeId as DeskTypeId] += score ?? 0
    }
  }

  const [bestId] = Object.entries(scores).sort((a, b) => b[1] - a[1])[0]
  return DESK_TYPES.find((type) => type.id === bestId) ?? DESK_TYPES[0]
}

function restartScroll() {
  window.requestAnimationFrame(() => {
    document.getElementById('diagnosis-start')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  })
}

function ResultVisual({ result }: { result: DeskType }) {
  return (
    <div className="relative min-h-[260px] overflow-hidden rounded-[28px] border border-white/70 bg-white/70 p-5 shadow-sm">
      <img
        src={result.imagePath}
        alt={`${result.name}の未来デスク`}
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/15 via-black/5 to-black/60" />
      <div className="absolute inset-x-0 bottom-0 h-28" style={{ background: `linear-gradient(0deg, ${result.accent}99, transparent)` }} />
      <div className="relative flex min-h-[220px] flex-col justify-between">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[11px] font-black uppercase tracking-wider text-white/80">Future Desk Type</p>
            <h2 className="mt-2 max-w-[240px] text-2xl font-black leading-tight text-white drop-shadow">{result.name}</h2>
          </div>
          <div className="rounded-full bg-white/85 px-3 py-1 text-[11px] font-black text-brand-text shadow-sm">{result.shortName}</div>
        </div>

        <p className="rounded-2xl bg-white/88 px-4 py-3 text-sm font-bold leading-relaxed text-brand-text shadow-sm backdrop-blur">{result.futureDesk}</p>
      </div>
    </div>
  )
}

function ShareText({ result }: { result: DeskType }) {
  const text = `未来デスク診断の結果は「${result.name}」でした。${result.futureDesk} #ガジェパス`

  return (
    <div className="rounded-2xl bg-white/80 p-3">
      <p className="text-[11px] font-black text-gray-400">共有テキスト</p>
      <p className="mt-1 text-xs font-bold leading-relaxed text-gray-600">{text}</p>
    </div>
  )
}

export default function FutureDeskDiagnosisTool() {
  const [answers, setAnswers] = useState<Answers>({})
  const [showResult, setShowResult] = useState(false)

  const answeredCount = Object.keys(answers).length
  const progress = Math.round((answeredCount / DESK_QUESTIONS.length) * 100)
  const canShowResult = answeredCount === DESK_QUESTIONS.length
  const result = useMemo(() => getResult(answers), [answers])

  function choose(questionId: string, value: DeskAnswerValue) {
    setAnswers((current) => ({ ...current, [questionId]: value }))
  }

  function reset() {
    setAnswers({})
    setShowResult(false)
    restartScroll()
  }

  return (
    <div id="diagnosis-start" className="space-y-6">
      <section className="overflow-hidden rounded-[30px] border border-white/70 bg-white/80 p-4 shadow-sm sm:p-6">
        <div className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div>
            <div className="mb-4 inline-flex rounded-full bg-lime-100 px-3 py-1 text-[11px] font-black text-brand-dark">
              8問で未来デスクを診断
            </div>
            <h2 className="text-2xl font-black leading-tight text-brand-text sm:text-3xl">
              あなたのガジェット性格と、未来のデスクがわかります。
            </h2>
            <p className="mt-3 max-w-2xl text-sm font-medium leading-relaxed text-gray-600">
              いま欲しいものを当てるだけではなく、買う順番と避けるべき買い物まで整理します。結果はかわいいカード風に表示されます。
            </p>
          </div>
          <div className="rounded-[26px] p-4" style={{ background: 'linear-gradient(135deg, #FFF1D9, #E6F0FF 50%, #F2E7FF)' }}>
            <div className="rounded-[22px] bg-white/75 p-4 shadow-sm">
              <p className="text-xs font-black text-gray-400">診断の進み具合</p>
              <div className="mt-3 h-3 overflow-hidden rounded-full bg-white">
                <div className="h-full rounded-full bg-brand-green transition-all" style={{ width: `${progress}%` }} />
              </div>
              <p className="mt-2 text-sm font-black text-brand-text">{answeredCount}/{DESK_QUESTIONS.length} 問 answered</p>
            </div>
          </div>
        </div>
      </section>

      {!showResult ? (
        <>
          <div className="grid gap-4">
            {DESK_QUESTIONS.map((question, questionIndex) => (
              <section key={question.id} className="rounded-[26px] border border-gray-200 bg-white p-4 shadow-sm sm:p-5">
                <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-[11px] font-black text-brand-green">Q{questionIndex + 1}</p>
                    <h3 className="mt-1 text-lg font-black leading-tight text-brand-text">{question.title}</h3>
                    <p className="mt-1 text-xs font-medium leading-relaxed text-gray-500">{question.helper}</p>
                  </div>
                  {answers[question.id] ? (
                    <span className="w-fit rounded-full bg-lime-100 px-3 py-1 text-[11px] font-black text-brand-dark">選択済み</span>
                  ) : null}
                </div>
                <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                  {question.options.map((option) => {
                    const active = answers[question.id] === option.value
                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => choose(question.id, option.value)}
                        className={`min-h-14 rounded-2xl border px-4 py-3 text-left text-sm font-black leading-relaxed transition-all ${
                          active
                            ? 'border-brand-green bg-lime-50 text-brand-text shadow-sm ring-2 ring-brand-green/20'
                            : 'border-gray-200 bg-gray-50 text-gray-600 hover:border-brand-green hover:bg-white'
                        }`}
                      >
                        {option.label}
                      </button>
                    )
                  })}
                </div>
              </section>
            ))}
          </div>

          <div className="sticky bottom-3 z-10 rounded-[24px] border border-gray-200 bg-white/90 p-3 shadow-lg backdrop-blur">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs font-black text-brand-text">診断結果まであと {DESK_QUESTIONS.length - answeredCount} 問</p>
                <p className="text-[11px] font-bold text-gray-400">全部答えると、未来デスクタイプが開きます。</p>
              </div>
              <button
                type="button"
                disabled={!canShowResult}
                onClick={() => setShowResult(true)}
                className="rounded-2xl bg-brand-dark px-5 py-3 text-sm font-black text-white transition-all enabled:hover:bg-brand-green disabled:cursor-not-allowed disabled:bg-gray-300"
              >
                結果を見る
              </button>
            </div>
          </div>
        </>
      ) : (
        <section className="rounded-[32px] border border-gray-200 bg-white p-4 shadow-sm sm:p-6">
          <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
            <ResultVisual result={result} />
            <div className="space-y-5">
              <div>
                <p className="text-xs font-black uppercase tracking-wider" style={{ color: result.accent }}>Your Result</p>
                <h2 className="mt-2 text-3xl font-black leading-tight text-brand-text">{result.name}</h2>
                <p className="mt-2 text-lg font-black leading-relaxed" style={{ color: result.accent }}>{result.catchphrase}</p>
                <p className="mt-3 text-sm font-medium leading-relaxed text-gray-600">{result.description}</p>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                {result.traits.map((trait) => (
                  <div key={trait} className="rounded-2xl bg-gray-50 px-3 py-3 text-xs font-black leading-relaxed text-brand-text">
                    {trait}
                  </div>
                ))}
              </div>

              <div className="rounded-3xl p-4" style={{ backgroundColor: result.color }}>
                <p className="text-xs font-black" style={{ color: result.accent }}>最初に投資するなら</p>
                <p className="mt-1 text-xl font-black text-brand-text">{result.firstInvestment}</p>
              </div>
            </div>
          </div>

          <div className="mt-6 grid gap-4 lg:grid-cols-2">
            <div className="rounded-[26px] bg-gray-50 p-4">
              <h3 className="text-base font-black text-brand-text">買う順番ロードマップ</h3>
              <div className="mt-4 space-y-3">
                {result.buyOrder.map((item, index) => (
                  <div key={item} className="grid grid-cols-[34px_1fr] items-center gap-3">
                    <span className="flex size-8 items-center justify-center rounded-full text-xs font-black text-white" style={{ backgroundColor: result.accent }}>
                      {index + 1}
                    </span>
                    <p className="rounded-2xl bg-white px-3 py-2 text-sm font-black text-brand-text">{item}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[26px] bg-amber-50 p-4">
              <h3 className="text-base font-black text-brand-text">避けると後悔しにくい買い物</h3>
              <div className="mt-4 space-y-2">
                {result.avoid.map((item) => (
                  <p key={item} className="rounded-2xl bg-white px-3 py-2 text-sm font-bold leading-relaxed text-amber-900">
                    {item}
                  </p>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-6 grid gap-4 lg:grid-cols-[1fr_320px]">
            <div className="rounded-[26px] bg-gray-50 p-4">
              <h3 className="text-base font-black text-brand-text">おすすめカテゴリ</h3>
              <div className="mt-3 flex flex-wrap gap-2">
                {result.recommendedCategories.map((category) => (
                  <span key={category} className="rounded-full bg-white px-3 py-1.5 text-xs font-black text-gray-600">
                    {category}
                  </span>
                ))}
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {result.relatedLinks.map((link) => (
                  <Link key={link.href} href={link.href} className="rounded-2xl bg-brand-dark px-4 py-2 text-xs font-black text-white transition-colors hover:bg-brand-green">
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
            <div className="space-y-3">
              <ShareText result={result} />
              <button type="button" onClick={reset} className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm font-black text-brand-text transition-colors hover:border-brand-green">
                もう一度診断する
              </button>
            </div>
          </div>

          <details className="mt-5 rounded-2xl bg-gray-50 px-4 py-3">
            <summary className="cursor-pointer text-xs font-black text-gray-500">画像生成用プロンプト</summary>
            <p className="mt-3 text-xs font-bold leading-relaxed text-gray-600">{result.imagePrompt}</p>
          </details>
        </section>
      )}
    </div>
  )
}
