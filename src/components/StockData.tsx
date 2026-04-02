'use client'

import { Flame, Clock } from 'lucide-react'

interface StockDataProps {
  // 未来扩展：真实数据接口
}

export default function StockData() {
  // 模拟主要指数数据
  const indices = [
    { name: '上证指数', code: '000001', price: 3047.32, change: 15.67, changePercent: 0.52 },
    { name: '深证成指', code: '399001', price: 9845.21, change: -23.45, changePercent: -0.24 },
    { name: '创业板', code: '399006', price: 1856.78, change: 32.11, changePercent: 1.76 },
    { name: '沪深300', code: '000300', price: 3521.45, change: 8.92, changePercent: 0.25 },
  ]

  return (
    <div className="glass rounded-xl p-5 card-hover">
      <div className="flex items-center gap-2 mb-4">
        <Flame className="w-5 h-5 text-orange-400" />
        <h2 className="text-lg font-semibold text-white">大盘指数</h2>
      </div>
      
      <div className="grid grid-cols-2 gap-3">
        {indices.map((index) => (
          <div 
            key={index.code}
            className="p-3 bg-white/5 rounded-lg"
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-gray-400 text-xs">{index.name}</span>
              <span className="text-xs text-gray-600">{index.code}</span>
            </div>
            <div className="text-white font-semibold text-lg">
              {index.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className={`flex items-center gap-1 text-sm ${index.change >= 0 ? 'price-up' : 'price-down'}`}>
              {index.change >= 0 ? '+' : ''}{index.change.toFixed(2)}
              ({index.change >= 0 ? '+' : ''}{index.changePercent.toFixed(2)}%)
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
