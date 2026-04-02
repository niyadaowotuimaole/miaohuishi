'use client'

import { Zap, Clock } from 'lucide-react'

interface LimitUpStocksProps {
  stocks: Array<{
    code: string
    name: string
    reason: string
    sector: string
    time: string
  }>
}

export default function LimitUpStocks({ stocks }: LimitUpStocksProps) {
  return (
    <div className="glass rounded-xl p-5 card-hover">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Zap className="w-5 h-5 text-red-400" />
          <h2 className="text-lg font-semibold text-white">今日涨停</h2>
          <span className="px-2 py-0.5 bg-red-500/20 text-red-400 rounded text-xs">
            {stocks.length} 只
          </span>
        </div>
        <span className="text-xs text-gray-500">
          数据更新时间: 交易日 16:00
        </span>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="text-gray-400 text-xs border-b border-white/10">
              <th className="text-left py-2 px-2">股票代码</th>
              <th className="text-left py-2 px-2">股票名称</th>
              <th className="text-left py-2 px-2">涨停原因</th>
              <th className="text-left py-2 px-2">相关板块</th>
              <th className="text-left py-2 px-2">封板时间</th>
            </tr>
          </thead>
          <tbody>
            {stocks.map((stock, index) => (
              <tr 
                key={stock.code}
                className="text-white text-sm border-b border-white/5 hover:bg-white/5 transition-colors"
              >
                <td className="py-3 px-2 font-mono text-gray-300">{stock.code}</td>
                <td className="py-3 px-2 font-medium text-red-400">{stock.name}</td>
                <td className="py-3 px-2 text-gray-300">{stock.reason}</td>
                <td className="py-3 px-2">
                  <span className="px-2 py-0.5 bg-indigo-500/20 text-indigo-300 rounded text-xs">
                    {stock.sector}
                  </span>
                </td>
                <td className="py-3 px-2 text-gray-400 text-xs flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {stock.time}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
