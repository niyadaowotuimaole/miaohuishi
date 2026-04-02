'use client'

import { TrendingUp, RefreshCw } from 'lucide-react'

interface HeaderProps {
  status: 'loading' | 'demo' | 'live'
  lastUpdate: string
}

export default function Header({ status, lastUpdate }: HeaderProps) {
  return (
    <header className="glass sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">每日投资参考</h1>
              <p className="text-xs text-gray-400">每日涨停 · 贵金属 · 利好消息</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {status === 'demo' && (
              <span className="px-3 py-1 bg-amber-500/20 text-amber-400 rounded-full text-xs">
                演示数据
              </span>
            )}
            {status === 'live' && (
              <span className="flex items-center gap-1.5 px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-xs">
                <span className="w-2 h-2 bg-green-400 rounded-full live-indicator"></span>
                实时数据
              </span>
            )}
            {status === 'loading' && (
              <span className="flex items-center gap-1.5 px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-xs">
                <RefreshCw className="w-3 h-3 animate-spin" />
                加载中
              </span>
            )}
            
            {lastUpdate && (
              <span className="text-gray-500 text-xs">
                更新: {lastUpdate}
              </span>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
