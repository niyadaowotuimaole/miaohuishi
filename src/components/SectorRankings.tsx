'use client'
import { TrendingUp, TrendingDown, Activity } from 'lucide-react'

interface SectorRanking {
  name: string
  change: number
  mainInflow?: number
  reason?: string
}

interface SectorRankingsProps {
  sectors: SectorRanking[]
}

function fmt(n: number | undefined) {
  if (n === undefined || n === null) return '—'
  return n >= 0 ? `+${n.toFixed(2)}` : n.toFixed(2)
}

function formatInflow(n: number | undefined) {
  if (!n || n === 0) return '—'
  return n > 0 ? `+${n}亿` : `${n}亿`
}

export default function SectorRankings({ sectors }: SectorRankingsProps) {
  const upSectors = sectors.filter(s => s.change >= 0).slice(0, 8)
  const downSectors = sectors.filter(s => s.change < 0).slice(0, 8)

  return (
    <div className="glass rounded-xl p-5 card-hover">
      <div className="flex items-center gap-2 mb-4">
        <Activity className="w-5 h-5 text-cyan-400" />
        <h2 className="text-lg font-semibold text-white">板块涨跌榜</h2>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* 涨幅榜 */}
        <div>
          <div className="flex items-center gap-1 mb-2 text-red-400 text-sm">
            <TrendingUp className="w-4 h-4" />
            <span className="font-medium">涨幅榜</span>
          </div>
          <div className="space-y-1">
            {upSectors.length === 0 ? (
              <div className="text-gray-500 text-xs">暂无数据</div>
            ) : (
              upSectors.map((s, i) => (
                <div key={s.name} className="flex justify-between items-center py-1 px-2 bg-white/5 rounded">
                  <span className="text-white text-sm truncate max-w-[100px]">{s.name}</span>
                  <span className="text-red-400 text-sm font-medium">{fmt(s.change)}%</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* 跌幅榜 */}
        <div>
          <div className="flex items-center gap-1 mb-2 text-green-400 text-sm">
            <TrendingDown className="w-4 h-4" />
            <span className="font-medium">跌幅榜</span>
          </div>
          <div className="space-y-1">
            {downSectors.length === 0 ? (
              <div className="text-gray-500 text-xs">暂无数据</div>
            ) : (
              downSectors.map((s, i) => (
                <div key={s.name} className="flex justify-between items-center py-1 px-2 bg-white/5 rounded">
                  <span className="text-white text-sm truncate max-w-[100px]">{s.name}</span>
                  <span className="text-green-400 text-sm font-medium">{fmt(s.change)}%</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {sectors.length > 0 && (
        <div className="mt-3 pt-3 border-t border-white/10">
          <p className="text-xs text-gray-500">每5分钟更新 • 东方财富</p>
        </div>
      )}
    </div>
  )
}