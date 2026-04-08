'use client'
import { Users } from 'lucide-react'

interface TopTrader {
  code: string
  name: string
  price: number
  change: number
  instBuy?: number
  instSell?: number
  instNet?: number
  reason?: string
}

interface TopTradersProps {
  stocks: TopTrader[]
}

function fmt(n: number | undefined) {
  if (!n || n === 0) return '—'
  return n > 0 ? `+${n}` : `${n}`
}

export default function TopTraders({ stocks }: TopTradersProps) {
  // 按机构净买入排序
  const sorted = [...stocks].sort((a, b) => (b.instNet ?? 0) - (a.instNet ?? 0))
  const display = sorted.slice(0, 10)

  return (
    <div className="glass rounded-xl p-5 card-hover">
      <div className="flex items-center gap-2 mb-4">
        <Users className="w-5 h-5 text-blue-400" />
        <h2 className="text-lg font-semibold text-white">龙虎榜机构</h2>
        <span className="ml-auto text-xs text-gray-500">单位：万元</span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-gray-400 text-xs border-b border-white/10">
              <th className="text-left py-2">股票</th>
              <th className="text-right py-2">现价</th>
              <th className="text-right py-2">涨跌</th>
              <th className="text-right py-2">机构买入</th>
              <th className="text-right py-2">机构卖出</th>
              <th className="text-right py-2">净买入</th>
            </tr>
          </thead>
          <tbody>
            {display.length === 0 ? (
              <tr><td colSpan={6} className="text-center py-4 text-gray-500">暂无数据</td></tr>
            ) : (
              display.map((s) => (
                <tr key={s.code} className="border-b border-white/5 hover:bg-white/5">
                  <td className="py-2">
                    <div className="text-white font-medium">{s.name}</div>
                    <div className="text-gray-500 text-xs">{s.code}</div>
                  </td>
                  <td className="text-right text-white">{s.price?.toFixed(2) || '—'}</td>
                  <td className={`text-right ${(s.change ?? 0) >= 0 ? 'text-red-400' : 'text-green-400'}`}>
                    {(s.change ?? 0) >= 0 ? '+' : ''}{(s.change ?? 0).toFixed(2)}%
                  </td>
                  <td className="text-right text-red-400">{fmt(s.instBuy)}</td>
                  <td className="text-right text-green-400">{fmt(s.instSell)}</td>
                  <td className={`text-right font-medium ${(s.instNet ?? 0) >= 0 ? 'text-red-400' : 'text-green-400'}`}>
                    {fmt(s.instNet)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {display.length > 0 && (
        <div className="mt-3 pt-3 border-t border-white/10">
          <p className="text-xs text-gray-500">每10分钟更新 • 东方财富</p>
        </div>
      )}
    </div>
  )
}