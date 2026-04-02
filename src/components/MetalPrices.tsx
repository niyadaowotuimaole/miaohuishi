'use client'

import { TrendingUp, TrendingDown, DollarSign } from 'lucide-react'

interface MetalPricesProps {
  data: {
    gold: { price: number; change: number; changePercent: number }
    silver: { price: number; change: number; changePercent: number }
    usdIndex: { price: number; change: number; changePercent: number }
    updateTime: string
  }
}

export default function MetalPrices({ data }: MetalPricesProps) {
  const items = [
    {
      name: '黄金',
      symbol: 'XAU/USD',
      icon: '🥇',
      ...data.gold,
      unit: '美元/盎司'
    },
    {
      name: '白银',
      symbol: 'XAG/USD',
      icon: '🥈',
      ...data.silver,
      unit: '美元/盎司'
    },
    {
      name: '美元指数',
      symbol: 'DXY',
      icon: '💵',
      ...data.usdIndex,
      unit: '点'
    },
  ]

  return (
    <div className="glass rounded-xl p-5 card-hover">
      <div className="flex items-center gap-2 mb-4">
        <DollarSign className="w-5 h-5 text-yellow-400" />
        <h2 className="text-lg font-semibold text-white">贵金属 & 美元</h2>
        <span className="text-xs text-gray-500 ml-auto">{data.updateTime}</span>
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
                <span className="text-xs text-gray-500">{item.unit}</span>
              </div>
            </div>
            
            <div className="text-right">
              <div className="text-white font-semibold text-lg">
                {item.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <div className={`flex items-center justify-end gap-1 text-sm ${item.change >= 0 ? 'price-up' : 'price-down'}`}>
                {item.change >= 0 ? (
                  <TrendingUp className="w-3 h-3" />
                ) : (
                  <TrendingDown className="w-3 h-3" />
                )}
                <span>
                  {item.change >= 0 ? '+' : ''}{item.change.toFixed(2)} 
                  ({item.change >= 0 ? '+' : ''}{item.changePercent.toFixed(2)}%)
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
