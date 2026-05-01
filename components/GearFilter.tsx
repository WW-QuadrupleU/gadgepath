'use client'

import { useState, useMemo } from 'react'
import { useSearchParams } from 'next/navigation'
import type { Product } from '@/lib/notion'
import { CATEGORIES } from '@/lib/notion'
import ProductCard from '@/components/ProductCard'
import Image from 'next/image'

type Props = {
  initialProducts: Product[]
}

const PRICE_RANGES = [
  { id: 'all', label: 'すべて', min: 0, max: Infinity },
  { id: 'under10k', label: '1万円未満', min: 0, max: 9999 },
  { id: '10k-30k', label: '1万円〜3万円', min: 10000, max: 29999 },
  { id: '30k-50k', label: '3万円〜5万円', min: 30000, max: 49999 },
  { id: 'over50k', label: '5万円以上', min: 50000, max: Infinity },
]

export default function GearFilter({ initialProducts }: Props) {
  // URLクエリパラメータから初期フィルターを取得
  // 例: /tools/gear-finder?category=カメラ&price=under10k
  const searchParams = useSearchParams()
  const validCategoryNames = useMemo(() => CATEGORIES.map(c => c.name), [])
  const validPriceIds = useMemo(() => PRICE_RANGES.map(r => r.id), [])

  const initialCategory = (() => {
    const c = searchParams.get('category')
    return c && validCategoryNames.includes(c) ? c : 'all'
  })()
  const initialPriceId = (() => {
    const p = searchParams.get('price')
    return p && validPriceIds.includes(p) ? p : 'all'
  })()

  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory)
  const [selectedPriceId, setSelectedPriceId] = useState<string>(initialPriceId)
  const [selectedMakers, setSelectedMakers] = useState<string[]>([])
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([])

  // カテゴリ選択が変更されたら、メーカーと特徴の選択状態をリセットする
  const handleCategoryChange = (cat: string) => {
    setSelectedCategory(cat)
    setSelectedMakers([])
    setSelectedFeatures([])
  }

  // 1. カテゴリと価格で絞り込み（メーカーと特徴タグの選択肢を計算するため）
  const baseFilteredProducts = useMemo(() => {
    return initialProducts.filter(p => {
      // カテゴリ絞り込み
      if (selectedCategory !== 'all' && p.category !== selectedCategory) return false
      
      // 価格絞り込み
      const range = PRICE_RANGES.find(r => r.id === selectedPriceId)
      if (range && range.id !== 'all') {
        if (p.numericPrice < range.min || p.numericPrice > range.max) return false
      }
      return true
    })
  }, [initialProducts, selectedCategory, selectedPriceId])

  // 動的なメーカー一覧を抽出
  const availableMakers = useMemo(() => {
    const makers = new Set(baseFilteredProducts.map(p => p.maker).filter(Boolean))
    return Array.from(makers).sort()
  }, [baseFilteredProducts])

  // 動的な特徴タグ一覧を抽出
  const availableFeatures = useMemo(() => {
    const features = new Set<string>()
    baseFilteredProducts.forEach(p => {
      p.features.forEach(f => features.add(f))
    })
    return Array.from(features).sort()
  }, [baseFilteredProducts])

  // 2. 最終的な絞り込み（メーカーと特徴タグも含める）
  const finalFilteredProducts = useMemo(() => {
    return baseFilteredProducts.filter(p => {
      // メーカー絞り込み (複数選択時はOR条件)
      if (selectedMakers.length > 0 && !selectedMakers.includes(p.maker)) return false
      
      // 特徴絞り込み (複数選択時はAND条件：選んだ特徴を全て満たすもの)
      if (selectedFeatures.length > 0) {
        const hasAllFeatures = selectedFeatures.every(f => p.features.includes(f))
        if (!hasAllFeatures) return false
      }
      
      return true
    })
  }, [baseFilteredProducts, selectedMakers, selectedFeatures])

  const toggleMaker = (maker: string) => {
    setSelectedMakers(prev => 
      prev.includes(maker) ? prev.filter(m => m !== maker) : [...prev, maker]
    )
  }

  const toggleFeature = (feature: string) => {
    setSelectedFeatures(prev => 
      prev.includes(feature) ? prev.filter(f => f !== feature) : [...prev, feature]
    )
  }

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      {/* フィルタリングサイドバー */}
      <div className="w-full lg:w-72 flex-shrink-0 space-y-8">
        
        {/* カテゴリフィルター */}
        <section className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
            <span className="w-1.5 h-4 bg-brand-green rounded-full"></span>
            カテゴリ
          </h3>
          <div className="flex flex-col gap-1.5">
            <button
              onClick={() => handleCategoryChange('all')}
              className={`flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
                selectedCategory === 'all' 
                  ? 'bg-brand-green/10 text-brand-green' 
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <div className="w-6 h-6 flex items-center justify-center">🔍</div>
              すべて
            </button>
            {CATEGORIES.filter(cat => cat.name !== '機材セット' && cat.name !== 'AIツール').map(cat => (
              <button
                key={cat.name}
                onClick={() => handleCategoryChange(cat.name)}
                className={`flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
                  selectedCategory === cat.name 
                    ? 'bg-brand-green/10 text-brand-green' 
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                {cat.icon ? (
                  <Image src={cat.icon} alt={cat.name} width={24} height={24} className="w-6 h-6 object-contain" />
                ) : (
                  <span className="text-lg">{cat.emoji}</span>
                )}
                {cat.name}
              </button>
            ))}
          </div>
        </section>

        {/* 価格フィルター */}
        <section className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
            <span className="w-1.5 h-4 bg-brand-green rounded-full"></span>
            価格帯
          </h3>
          <div className="flex flex-col gap-2">
            {PRICE_RANGES.map(range => (
              <label key={range.id} className="flex items-center gap-3 cursor-pointer group">
                <input 
                  type="radio" 
                  name="price_range"
                  checked={selectedPriceId === range.id}
                  onChange={() => setSelectedPriceId(range.id)}
                  className="w-4 h-4 text-brand-green border-gray-300 focus:ring-brand-green"
                />
                <span className="text-sm text-gray-700 group-hover:text-brand-green transition-colors">
                  {range.label}
                </span>
              </label>
            ))}
          </div>
        </section>

        {/* メーカーフィルター */}
        {availableMakers.length > 0 && (
          <section className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span className="w-1.5 h-4 bg-brand-green rounded-full"></span>
              メーカー
            </h3>
            <div className="flex flex-wrap gap-2">
              {availableMakers.map(maker => {
                const isSelected = selectedMakers.includes(maker)
                return (
                  <button
                    key={maker}
                    onClick={() => toggleMaker(maker)}
                    className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-all ${
                      isSelected 
                        ? 'bg-brand-green text-white border-brand-green shadow-sm' 
                        : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {maker}
                  </button>
                )
              })}
            </div>
          </section>
        )}

        {/* 特徴タグフィルター */}
        {availableFeatures.length > 0 && (
          <section className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span className="w-1.5 h-4 bg-brand-green rounded-full"></span>
              特徴・機能
            </h3>
            <div className="flex flex-col gap-2.5">
              {availableFeatures.map(feature => (
                <label key={feature} className="flex items-center gap-3 cursor-pointer group">
                  <input 
                    type="checkbox"
                    checked={selectedFeatures.includes(feature)}
                    onChange={() => toggleFeature(feature)}
                    className="w-4 h-4 rounded text-brand-green border-gray-300 focus:ring-brand-green"
                  />
                  <span className="text-sm text-gray-700 group-hover:text-brand-green transition-colors">
                    {feature}
                  </span>
                </label>
              ))}
            </div>
          </section>
        )}
      </div>

      {/* メインコンテンツ（商品一覧） */}
      <div className="flex-1">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">
            検索結果 <span className="text-brand-green">{finalFilteredProducts.length}</span> 件
          </h2>
          {(selectedCategory !== 'all' || selectedPriceId !== 'all' || selectedMakers.length > 0 || selectedFeatures.length > 0) && (
            <button 
              onClick={() => {
                setSelectedCategory('all')
                setSelectedPriceId('all')
                setSelectedMakers([])
                setSelectedFeatures([])
              }}
              className="text-sm text-gray-500 hover:text-gray-700 underline"
            >
              条件をクリア
            </button>
          )}
        </div>

        {finalFilteredProducts.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-gray-100">
            <p className="text-gray-500 mb-2">条件に一致する機材が見つかりませんでした。</p>
            <p className="text-sm text-gray-400">フィルター条件を変更してお試しください。</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {finalFilteredProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
