'use client'

import { Flame, TrendingUp } from 'lucide-react'

interface HotSectorsProps {
  sectors: Array<{
    name: string
    stocks: number
    heat: number
  }>
}

export default function HotSectors({ sectors }: HotSectorsProps) {
  return (
    <div className="glass rounded-xl p-5 card-hover">
      <div className="flex items-center gap-2 mb-4">
        <Flame className="w-5 h-5 text-orange-400" />
        <h2 className="text-lg font-semibold text-white">热门题材</h2>
      </div>
      
      <div className="space-y-3">
        {sectors.map((sector, index) => (
          <div 
            key={sector.name}
            className="p-3 bg-white/5 rounded-lg"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className={`w-6 h-6 rounded flex items-center justify-center text-xs font-bold ${
                  index === 0 ? 'bg-red-500 text-white' :
                  index === 1 ? 'bg-orange-500 text-white' :
                  index === 2 ? 'bg-yellow-500 text-black' :
                  'bg-gray-600 text-white'
                }`}>
                  {index + 1}
                </span>
                <span className="text-white font-medium">{sector.name}</span>
              </div>
              <span className="text-xs text-gray-400">{sector.stocks}只涨停</span>
            </div>
            
            <div className="flex items-center gap-2">
              <div className="flex-1 h-2 bg-gray-700 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-orange-500 to-red-500 rounded-full"
                  style={{ width: `${sector.heat}%` }}
                />
              </div>
              <span className="text-orange-400 text-sm font-medium w-12 text-right">
                {sector.heat}%
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
