'use client'

import { TrendingUp, TrendingDown, AlertCircle } from 'lucide-react'

interface MetalItem {
  name?: string
  price?: number
  change?: number
  changePercent?: number
  source?: string
  note?: string
}

interface MetalPricesProps {
  data: {
    gold?: MetalItem | null
    silver?: MetalItem | null
    note?: string
  }
}

function fmt(n: number | undefined) {
  if (n === undefined || n === null) return '0.00'
  return n.toFixed(2)
}

export default function MetalPrices({ data }: MetalPricesProps) {
  const items = [
    {
      name: data.gold?.name || '黄金',
      symbol: '黄金概念',
      icon: '🥇',
      price: data.gold?.price ?? 0,
      change: data.gold?.change ?? 0,
      changePercent: data.gold?.changePercent ?? 0,
    },
    {
      name: data.silver?.name || '白银',
      symbol: '白银概念',
      icon: '🥈',
      price: data.silver?.price ?? 0,
      change: data.silver?.change ?? 0,
      changePercent: data.silver?.changePercent ?? 0,
    },
  ]

  return (
    <div className="glass rounded-xl p-5 card-hover">
      <div className="flex items-center gap-2 mb-4">
        <AlertCircle className="w-5 h-5 text-yellow-400" />
        <h2 className="text-lg font-semibold text-white">贵金属 · 概念板块</h2>
        <span className="ml-2 px-2 py-0.5 bg-amber-500/20 text-amber-400 rounded text-xs">概念涨跌</span>
      </div>
      
      <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-2 mb-3">
        <p className="text-amber-300 text-xs">
          ⚠️ 以上数据为概念板块涨跌，非国际现货黄金/白银实际价格。
          实际金价请参考 COMEX 黄金期货或银行纸黄金报价。
        </p>
      </div>
      
      <div className="space-y-3">
        {items.map((item) => (
          <div 
            key={item.name}
            className="flex items-center justify-between p-3 bg-white/5 rounded-lg"
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">{item.icon}</span>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-white font-medium">{item.name}</span>
                  <span className="text-xs text-gray-500">{item.symbol}</span>
                </div>
              </div>
            </div>
            
            <div className="text-right">
              <div className="text-white font-semibold text-lg">
                {item.price > 0
                  ? item.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                  : '--'}
              </div>
              <div className={`flex items-center justify-end gap-1 text-sm ${item.change >= 0 ? 'price-up' : 'price-down'}`}>
                {item.change >= 0 ? (
                  <TrendingUp className="w-3 h-3" />
                ) : (
                  <TrendingDown className="w-3 h-3" />
                )}
                <span>
                  {item.change >= 0 ? '+' : ''}{fmt(item.change)} 
                  ({item.change >= 0 ? '+' : ''}{fmt(item.changePercent)}%)
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-3 pt-2 border-t border-white/10 text-xs text-gray-500">
        数据来源：东方财富概念板块 · 非现货价格
      </div>
    </div>
  )
}
